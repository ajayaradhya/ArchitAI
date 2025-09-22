# app/services/llm_service.py
import json
import re
import aiohttp
import logging
from typing import List, Dict
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import settings

# -----------------------------
# Config
# -----------------------------
GEMINI_API_KEY = settings.GOOGLE_GEMINI_API_KEY
DEFAULT_MODEL = getattr(settings, "GOOGLE_GEMINI_MODEL", "gemini-2.0-flash")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# -----------------------------
# Helpers
# -----------------------------
def parse_json_safe(raw_text: str, fallback_key: str = "summary") -> Dict:
    try:
        data = json.loads(raw_text)
        if isinstance(data, dict):
            return data
        return {fallback_key: raw_text}
    except json.JSONDecodeError:
        logger.warning(f"Failed to parse JSON. Using fallback key '{fallback_key}'. Raw: {raw_text}")
        return {fallback_key: raw_text}

def build_prompt(conversation: List[Dict], user_prompt: str, system_prompt: str = None) -> str:
    messages = []
    if system_prompt:
        messages.append(f"system: {system_prompt}")
    for msg in conversation:
        messages.append(f"{msg['role']}: {msg['text']}")
    messages.append(f"user: {user_prompt}")
    return "\n".join(messages)

def clean_gemini_json_text(raw_text: str) -> str:
    """Remove markdown code fences like ```json ... ``` from Gemini output."""
    return re.sub(r"^```json\s*|\s*```$", "", raw_text.strip(), flags=re.MULTILINE)

# -----------------------------
# Core Gemini call with retry
# -----------------------------
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def _call_gemini(prompt: str, model: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GEMINI_API_KEY,
    }
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    logger.info(f"Gemini request URL: {url}")
    logger.info(f"Gemini request payload: {json.dumps(payload)}")

    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=payload) as resp:
            text = await resp.text()
            if resp.status != 200:
                logger.error(f"Gemini API error {resp.status}: {text}")
                raise Exception(f"Gemini API error {resp.status}: {text}")

            logger.info(f"Gemini raw response: {text}")
            data = await resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                logger.warning("Gemini returned no candidates")
                return ""

            first_candidate = candidates[0]
            content = first_candidate.get("content", {})
            parts = content.get("parts", [])
            text_parts = []
            for part in parts:
                text_parts.append(part.get("text") if isinstance(part, dict) else str(part))
            result_text = "\n".join([t.strip() for t in text_parts])
            logger.info(f"Gemini processed text: {result_text}")
            return result_text

# -----------------------------
# Main Service Functions
# -----------------------------
async def get_next_reply(prompt: str, conversation: List[Dict]) -> str:
    final_prompt = build_prompt(conversation, prompt)
    return await _call_gemini(final_prompt, model=DEFAULT_MODEL)

async def generate_final_design(prompt: str, conversation: List[Dict]) -> Dict:
    """
    Ask Gemini to generate structured JSON with keys:
      summary, components, diagrams.
    Sanitizes the response to ensure all required fields exist for FastAPI.
    """
    system_msg = (
        "You are a senior system architect. Generate a complete system design. "
        "Respond only in valid JSON with these top-level keys: "
        "'summary', 'components', 'db_schema', 'mermaid', 'tech_stack', "
        "'integration_steps', 'rationale', 'diagram_url', 'diagrams'. "
        "Each component must have 'name', 'description', and 'details' with "
        "'technology_stack' (list of strings) and 'responsibilities' (list of strings)."
    )

    final_prompt = build_prompt(conversation, prompt, system_prompt=system_msg)
    raw_text = await _call_gemini(final_prompt, model=DEFAULT_MODEL)
    clean_text = clean_gemini_json_text(raw_text)
    design_json = parse_json_safe(clean_text)

    # Ensure top-level keys exist
    design_json.setdefault("summary", "")
    design_json.setdefault("components", [])
    design_json.setdefault("db_schema", "")
    design_json.setdefault("mermaid", "")
    design_json.setdefault("tech_stack", [])
    design_json.setdefault("integration_steps", [])
    design_json.setdefault("rationale", "")
    design_json.setdefault("diagram_url", "")
    
    # --- Normalize diagrams ---
    diagrams = design_json.get("diagrams")
    if isinstance(diagrams, dict):
        # Convert dict → list of dicts
        design_json["diagrams"] = [{"name": k, "content": v} for k, v in diagrams.items()]
    elif isinstance(diagrams, list):
        design_json["diagrams"] = diagrams
    else:
        design_json["diagrams"] = []

    # --- Normalize db_schema ---
    db_schema = design_json.get("db_schema")
    if isinstance(db_schema, dict):
        # convert dict → pretty JSON string
        design_json["db_schema"] = json.dumps(db_schema, indent=2)
    elif isinstance(db_schema, list):
        # convert list → string
        design_json["db_schema"] = "\n".join(map(str, db_schema))
    elif not isinstance(db_schema, str):
        design_json["db_schema"] = str(db_schema or "")


    # Helper to sanitize each component
    def sanitize_component(comp: Dict) -> Dict:
        comp.setdefault("name", "")
        comp.setdefault("description", "")
        
        details = comp.get("details", {})
        if not isinstance(details, dict):
            details = {}

        # Normalize Gemini "technology" → "technology_stack"
        tech = comp.pop("technology", None)
        if tech:
            details.setdefault("technology_stack", [])
            if isinstance(tech, str):
                details["technology_stack"].append(tech)
            elif isinstance(tech, list):
                details["technology_stack"].extend(tech)

        details.setdefault("technology_stack", [])
        details.setdefault("responsibilities", [])
        comp["details"] = details

        return comp


    # Sanitize all components
    design_json["components"] = [sanitize_component(c) for c in design_json["components"]]

    # Append Gemini response to conversation for traceability
    conversation.append({
        "role": "architai",
        "text": raw_text,
        "meta": json.dumps({"prompt": prompt})
    })

    return design_json


async def generate_initial_questions(prompt: str, conversation: List[Dict], num_questions: int = 4) -> List[str]:
    """
    Ask Gemini for clarifying questions, avoiding repeating questions
    that the user already answered (present in conversation).
    """
    answered_questions = {msg['text'] for msg in conversation if msg['role'] == 'user'}

    system_msg = (
        "You are a senior system designer. Generate a concise list of key clarifying questions "
        "for the user to understand requirements for designing a system. "
        "Respond only in valid JSON array format."
    )
    user_msg = f"System description: {prompt}\nGenerate {num_questions} questions as a JSON array of strings."
    final_prompt = build_prompt(conversation, user_msg, system_prompt=system_msg)
    raw_text = await _call_gemini(final_prompt, model=DEFAULT_MODEL)
    clean_text = clean_gemini_json_text(raw_text)
    logger.info(f"Gemini cleaned text: {clean_text}")

    # Parse JSON safely
    try:
        questions = json.loads(clean_text)
        if isinstance(questions, list):
            # Remove any questions already answered
            questions = [q for q in questions if q not in answered_questions]
            return questions[:num_questions]
    except json.JSONDecodeError:
        logger.warning(f"Failed to parse JSON. Using fallback split lines: {clean_text}")
        lines = [q.strip("- ").strip() for q in clean_text.splitlines() if q.strip()]
        questions = [q for q in lines if q not in answered_questions]
        return questions[:num_questions]

    return []
