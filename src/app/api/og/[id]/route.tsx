import { ImageResponse } from "next/og";
import { getAudit } from "@/lib/db";

interface Props {
  params: Promise<{ id?: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!id) {
      return new Response("Audit ID is required", { status: 400 });
    }
    const audit = await getAudit(id);

    if (!audit) {
      return new Response("Audit not found", { status: 404 });
    }

    const displayUrl = audit.url.replace(/https?:\/\//, "");
    const averageScore = Math.round(
      (audit.scores.valueProp +
        audit.scores.primaryAction +
        audit.scores.trust +
        audit.scores.visualHierarchy +
        audit.scores.copy) /
        5
    );

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#f9f9f9",
            fontFamily: "sans-serif",
            padding: "40px",
            border: "10px solid #000000",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
            <span style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "-0.05em" }}>SQUINT</span>
            <span style={{ fontSize: "16px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7 }}>
              Audit #{id}
            </span>
          </div>

          {/* Main Area */}
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", margin: "20px 0" }}>
            {/* Left Side: URL & Quote */}
            <div style={{ display: "flex", flexDirection: "column", width: "60%" }}>
              <div style={{ fontSize: "18px", fontFamily: "monospace", textTransform: "uppercase", opacity: 0.6, marginBottom: "5px" }}>
                Scorecard for
              </div>
              <div style={{ fontSize: "40px", fontWeight: "800", color: "#FF4D00", textDecoration: "underline", wordBreak: "break-all", marginBottom: "20px" }}>
                {displayUrl}
              </div>
              <div style={{ fontSize: "20px", fontStyle: "italic", opacity: 0.8, borderLeft: "5px solid #FF4D00", paddingLeft: "15px", lineHeight: "1.4" }}>
                &ldquo;{audit.fiveSecondRead}&rdquo;
              </div>
            </div>

            {/* Right Side: Giant Score */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ffffff",
                border: "4px solid #000000",
                boxShadow: "8px 8px 0px 0px #000000",
                padding: "20px 30px",
                minWidth: "200px",
              }}
            >
              <span style={{ fontSize: "14px", fontFamily: "monospace", textTransform: "uppercase", fontWeight: "bold", marginBottom: "5px" }}>
                AVG SCORE
              </span>
              <span style={{ fontSize: "64px", fontWeight: "900", color: averageScore <= 3 ? "#ba1a1a" : averageScore <= 6 ? "#d43f00" : "#00984c" }}>
                {averageScore}/10
              </span>
            </div>
          </div>

          {/* Footer Grid of Scores */}
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              borderTop: "2px solid #000000",
              paddingTop: "20px",
            }}
          >
            {[
              { label: "VALUE-PROP", val: audit.scores.valueProp },
              { label: "CTA CLARITY", val: audit.scores.primaryAction },
              { label: "TRUST", val: audit.scores.trust },
              { label: "HIERARCHY", val: audit.scores.visualHierarchy },
              { label: "COPY", val: audit.scores.copy },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  border: "2px solid #000000",
                  padding: "8px 12px",
                  minWidth: "160px",
                }}
              >
                <span style={{ fontSize: "10px", fontFamily: "monospace", opacity: 0.6, marginBottom: "2px" }}>
                  {item.label}
                </span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>{item.val}/10</span>
              </div>
            ))}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error("OG Generation Error:", error);
    return new Response(`Failed to generate image: ${error.message}`, { status: 500 });
  }
}
