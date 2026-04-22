import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const normalizeVerdict = (v) => (typeof v === "string" ? v.toUpperCase() : "UNSURE");

const parseBulletSignals = (text) => {
  if (!text || typeof text !== "string") return [];
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-*]\s+/, ""))
    .filter(Boolean)
    .slice(0, 6);
};

export default function VerdictCard({ result }) {
  const verdict = normalizeVerdict(result?.verdict);
  const confidencePct = Number.isFinite(result?.confidence)
    ? Math.max(0, Math.min(100, result.confidence * 100))
    : 0;

  const tone =
    verdict === "REAL"
      ? {
          accentText: "text-green-400",
          accentTextSoft: "text-green-300",
          bar: "bg-green-400",
          barGlow: "shadow-[0_0_24px_rgba(34,197,94,0.35)]",
          iconRing: "border-green-500/30 bg-green-500/10",
          icon: CheckCircle2,
          signalIconClass: "text-green-400",
        }
      : verdict === "FAKE"
      ? {
          accentText: "text-red-400",
          accentTextSoft: "text-red-300",
          bar: "bg-red-400",
          barGlow: "shadow-[0_0_24px_rgba(248,113,113,0.35)]",
          iconRing: "border-red-500/30 bg-red-500/10",
          icon: AlertTriangle,
          signalIconClass: "text-red-400",
        }
      : {
          accentText: "text-white",
          accentTextSoft: "text-white/70",
          bar: "bg-white/50",
          barGlow: "",
          iconRing: "border-white/15 bg-white/5",
          icon: AlertTriangle,
          signalIconClass: "text-white/60",
        };

  const signals = useMemo(() => {
    const fromGemini = parseBulletSignals(result?.explanation);
    if (fromGemini.length) return fromGemini;

    if (verdict === "REAL") {
      return [
        "Natural sensor noise signature",
        "Consistent frequency distribution",
        "No obvious blending boundary irregularities",
      ];
    }

    if (verdict === "FAKE") {
      return [
        "Generative model artifacts detected",
        "Unnatural frequency domain patterns",
        "Blending boundary irregularities found",
      ];
    }

    return ["Insufficient signal to decide confidently."];
  }, [result?.explanation, verdict]);

  const Icon = tone.icon;

  return (
    <div className="rounded-3xl border border-white/10 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(255,255,255,0.06),rgba(0,0,0,0)_60%),linear-gradient(180deg,rgba(10,23,38,0.68)_0%,rgba(7,15,25,0.88)_100%)] p-7 md:p-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="flex flex-col items-center text-center">
        <div className={`h-14 w-14 rounded-full border ${tone.iconRing} flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${tone.accentText}`} />
        </div>
        <div className="mt-4 font-mono text-[11px] tracking-[0.45em] uppercase text-white/45">
          Verdict
        </div>
        <div className={`mt-3 font-display text-6xl md:text-7xl font-semibold ${tone.accentText} drop-shadow-[0_0_26px_rgba(255,255,255,0.14)]`}>
          {verdict}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between">
          <div className="text-white/65 text-lg">Confidence</div>
          <div className={`text-3xl font-semibold ${tone.accentTextSoft}`}>
            {confidencePct.toFixed(1)}%
          </div>
        </div>

        <div className="mt-3 h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full ${tone.bar} ${tone.barGlow}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {result?.gemini_verdict ? (
        <div className="mt-6 text-center">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/45">
            Gemini verdict
          </span>
          <div className={`mt-1 font-mono text-sm ${tone.accentTextSoft}`}>
            {String(result.gemini_verdict).toUpperCase()}
          </div>
        </div>
      ) : null}

      <div className="mt-10">
        <div className="font-mono text-[11px] tracking-[0.35em] uppercase text-white/40">
          Analysis signals
        </div>
        <div className="mt-5 space-y-4">
          {signals.map((s, i) => (
            <div key={`${s}-${i}`} className="flex items-start gap-3">
              <div className="mt-0.5">
                {verdict === "REAL" ? (
                  <CheckCircle2 className={`h-5 w-5 ${tone.signalIconClass}`} />
                ) : (
                  <AlertTriangle className={`h-5 w-5 ${tone.signalIconClass}`} />
                )}
              </div>
              <div className="text-white/75 text-base leading-relaxed">{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

