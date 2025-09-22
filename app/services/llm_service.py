# app/services/llm_service.py
import os
import json
import aiohttp
import logging
from typing import List, Dict
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import settings

# -----------------------------
# Config
# -----------------------------
GEMINI_API_KEY = settings.GOOGLE_GEMINI_API_KEY
DEFAULT_MODEL = getattr(settings, "GOOGLE_GEMINI_MODEL", "models/text-bison-001")
DEFAULT_MAX_TOKENS_REPLY = 300
DEFAULT_MAX_TOKENS_FINAL = 1500
DEFAULT_TEMPERATURE_REPLY = 0.7
DEFAULT_TEMPERATURE_FINAL = 0.5
GEMINI_API_URL = "https://api.generativelanguage.googleapis.com/v1beta2/models/{model}:generateText"

logger = logging.getLogger(__name__)

# -----------------------------
# Helpers
# -----------------------------
def parse_json_safe(raw_text: str, fallback_key: str = "summary") -> Dict:
    """
    Safely parse JSON string. Fallback to plain text if invalid.
    """
    try:
        data = json.loads(raw_text)
        if isinstance(data, dict):
            return data
        return {fallback_key: raw_text}
    except json.JSONDecodeError:
        return {fallback_key: raw_text}


def build_prompt(conversation: List[Dict], user_prompt: str, system_prompt: str = None) -> str:
    """
    Flatten conversation and system prompt into a single string prompt for Gemini.
    """
    messages = []
    if system_prompt:
        messages.append(f"system: {system_prompt}")
    for msg in conversation:
        messages.append(f"{msg['role']}: {msg['text']}")
    messages.append(f"user: {user_prompt}")
    return "\n".join(messages)


# -----------------------------
# Core Gemini call with retry
# -----------------------------
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def _call_gemini(prompt: str, model: str, temperature: float, max_tokens: int) -> str:
    url = GEMINI_API_URL.format(model=model)
    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "prompt": prompt,
        "temperature": temperature,
        "maxOutputTokens": max_tokens,
    }

    logger.debug(f"Calling Gemini API with prompt: {prompt[:500]}...")  # log first 500 chars

    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=payload) as resp:
            if resp.status != 200:
                text = await resp.text()
                logger.error(f"Gemini API error {resp.status}: {text}")
                raise Exception(f"Gemini API error {resp.status}: {text}")
            data = await resp.json()
            output = data.get("candidates", [{}])[0].get("output", "").strip()
            logger.debug(f"Gemini API response: {output[:500]}...")  # log first 500 chars
            return output


# -----------------------------
# Main Service Functions
# -----------------------------
async def get_next_reply(prompt: str, conversation: List[Dict]) -> str:
    final_prompt = build_prompt(conversation, prompt)
    return await _call_gemini(final_prompt, model=DEFAULT_MODEL,
                               temperature=DEFAULT_TEMPERATURE_REPLY,
                               max_tokens=DEFAULT_MAX_TOKENS_REPLY)


async def generate_final_design(prompt: str, conversation: List[Dict]) -> Dict:
    system_msg = "You are a senior system architect. Generate a complete system design."
    final_prompt = build_prompt(conversation, prompt, system_prompt=system_msg)

    raw_text = await _call_gemini(final_prompt, model=DEFAULT_MODEL,
                                  temperature=DEFAULT_TEMPERATURE_FINAL,
                                  max_tokens=DEFAULT_MAX_TOKENS_FINAL)

    design_json = parse_json_safe(raw_text)

    # Append to conversation for traceability
    conversation.append({
        "role": "architai",
        "text": raw_text,
        "meta": json.dumps({"prompt": prompt})  # stringified for Pydantic
    })

    return design_json


async def generate_initial_questions(prompt: str, num_questions: int = 4) -> List[str]:
    system_msg = (
        "You are a senior system designer. "
        "Generate a concise list of key clarifying questions for the user "
        "to understand requirements for designing a system."
    )
    user_msg = f"System description: {prompt}\nGenerate {num_questions} questions as a JSON array of strings."
    final_prompt = build_prompt([], user_msg, system_prompt=system_msg)

    raw_text = await _call_gemini(final_prompt, model=DEFAULT_MODEL,
                                   temperature=DEFAULT_TEMPERATURE_REPLY,
                                   max_tokens=DEFAULT_MAX_TOKENS_REPLY)

    # Try parse JSON, fallback to splitting by line
    try:
        questions = json.loads(raw_text)
        if isinstance(questions, list):
            return [str(q) for q in questions]
    except json.JSONDecodeError:
        return [q.strip("- ").strip() for q in raw_text.splitlines() if q.strip()][:num_questions]

    return []
