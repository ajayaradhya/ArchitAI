import type { FC } from "react";
import { useEffect, useRef } from "react";
import { Card, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import mermaid from "mermaid";

// -----------------------------
// Type Definitions
// -----------------------------
interface ComponentDetail {
  technology_stack?: string[];
  responsibilities?: string[];
}

interface Component {
  name: string;
  description: string;
  details?: ComponentDetail;
}

interface Diagram {
  type?: string;
  description?: string;
  content?: string;
}

interface Design {
  summary?: string;
  components?: Component[];
  db_schema?: string;
  mermaid?: string;
  diagrams?: Diagram[];
  tech_stack?: string[];
  integration_steps?: string[];
  rationale?: string;
}

interface FinalDesignViewProps {
  design?: Design;
}

// -----------------------------
// MermaidChart Component
// -----------------------------

const cleanMermaidChart = (chart: string) => {
  return chart
    .replace(/^```mermaid.*\n?/, "") // remove ```mermaid or ```mermaidXYZ
    .replace(/```$/, "") // remove ending ```
    .trim();
};


const MermaidChart: FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      const cleanChart = cleanMermaidChart(chart);
      mermaid.initialize({ startOnLoad: false, theme: "default" });
      mermaid.render("mermaidDiagram", cleanChart, (svgCode: string) => {
        if (ref.current) ref.current.innerHTML = svgCode;
      });
    } catch (e) {
      console.error("Mermaid render error", e);
    }
  }, [chart]);

  return <div ref={ref} />;
};

// -----------------------------
// FinalDesignView Component
// -----------------------------
const FinalDesignView: FC<FinalDesignViewProps> = ({ design }) => {
  if (!design) return null;

  return (
    <div style={{ display: "grid", gap: "1rem", maxWidth: "900px", margin: "0 auto" }}>
      {/* Summary */}
      {design.summary && (
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Summary</Typography>
          <Typography>{design.summary}</Typography>
        </Card>
      )}

      {/* Components */}
      {design.components?.map((comp, i) => (
        <Card key={i} sx={{ p: 2 }}>
          <Typography variant="h6">{comp.name}</Typography>
          <Typography variant="body2" color="text.secondary">{comp.description}</Typography>

          {comp.details?.technology_stack && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Tech Stack:</Typography>
              <ul>
                {comp.details.technology_stack.map((t, j) => <li key={j}>{t}</li>)}
              </ul>
            </>
          )}

          {comp.details?.responsibilities && (
            <>
              <Typography variant="subtitle2">Responsibilities:</Typography>
              <ul>
                {comp.details.responsibilities.map((r, j) => <li key={j}>{r}</li>)}
              </ul>
            </>
          )}
        </Card>
      ))}

      {/* DB Schema */}
      {design.db_schema && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Database Schema</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre style={{ whiteSpace: "pre-wrap" }}>{design.db_schema}</pre>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Mermaid Diagram */}
      {design.mermaid && (
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">System Diagram</Typography>
          <MermaidChart chart={design.mermaid} />
        </Card>
      )}

      {/* Additional diagrams */}
      {design.diagrams?.map((d, i) => (
        <Card key={i} sx={{ p: 2 }}>
          <Typography variant="subtitle1">{d.description || d.type || "Diagram"}</Typography>
          {d.content && <MermaidChart chart={d.content} />}
        </Card>
      ))}

      {/* Tech Stack */}
      {design.tech_stack && (
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Tech Stack</Typography>
          <ul>
            {design.tech_stack.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </Card>
      )}

      {/* Integration Steps */}
      {design.integration_steps && (
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Integration Steps</Typography>
          <ol>
            {design.integration_steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </Card>
      )}

      {/* Rationale */}
      {design.rationale && (
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Rationale</Typography>
          <Typography>{design.rationale}</Typography>
        </Card>
      )}
    </div>
  );
};

export default FinalDesignView;
