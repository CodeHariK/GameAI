import { createSignal } from "solid-js";
import { ResponseCurve } from "../../common/curves";

export default function UtilityCurveVisualizer() {
    const [k, setK] = createSignal(2);
    const [c, setC] = createSignal(0.5);
    const [points] = createSignal(50);

    const generatePath = (type: "linear" | "exponential" | "logistic") => {
        const p = [];
        const count = points();
        for (let i = 0; i <= count; i++) {
            const x = i / count;
            let y = 0;
            if (type === "linear") y = ResponseCurve.linear(x);
            if (type === "exponential") y = ResponseCurve.exponential(x, k());
            if (type === "logistic") y = ResponseCurve.logistic(x, k() * 5, c()); // scaling k for better visual

            // SVG coordinates: (0,0) is top-left. 
            // We want (0,1) at bottom-left and (1,0) at top-right.
            // Width/Height will be 200.
            const svgX = x * 200;
            const svgY = 200 - (y * 200);
            p.push(`${svgX},${svgY}`);
        }
        return `M ${p.join(" L ")}`;
    };

    return (
        <div style={{ padding: "24px", background: "#111", color: "white", "border-radius": "12px", "max-width": "600px" }}>
            <h2 style={{ "margin-top": 0, color: "#4f46e5" }}>Response Curve Visualizer</h2>

            <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "20px", "margin-bottom": "24px" }}>
                <div>
                    <label style={{ display: "block", "margin-bottom": "8px", "font-size": "14px" }}>Exponent / Steepness (k): {k()}</label>
                    <input type="range" min="0.1" max="10" step="0.1" value={k()} onInput={(e) => setK(parseFloat(e.currentTarget.value))} style={{ width: "100%" }} />

                    <label style={{ display: "block", "margin-bottom": "8px", "margin-top": "16px", "font-size": "14px" }}>Inflection Point (c): {c()}</label>
                    <input type="range" min="0" max="1" step="0.05" value={c()} onInput={(e) => setC(parseFloat(e.currentTarget.value))} style={{ width: "100%" }} />
                </div>

                <div style={{ background: "#222", padding: "10px", "border-radius": "8px", border: "1px solid #333" }}>
                    <svg viewBox="0 0 200 200" style={{ width: "100%", height: "auto" }}>
                        {/* Grid Lines */}
                        <line x1="0" y1="100" x2="200" y2="100" stroke="#333" stroke-dasharray="4" />
                        <line x1="100" y1="0" x2="100" y2="200" stroke="#333" stroke-dasharray="4" />

                        {/* Curves */}
                        <path d={generatePath("linear")} fill="none" stroke="#666" stroke-width="2" stroke-dasharray="2" />
                        <path d={generatePath("exponential")} fill="none" stroke="#ef4444" stroke-width="3" />
                        <path d={generatePath("logistic")} fill="none" stroke="#3b82f6" stroke-width="3" />

                        {/* Axes */}
                        <line x1="0" y1="200" x2="200" y2="200" stroke="white" stroke-width="2" />
                        <line x1="0" y1="0" x2="0" y2="200" stroke="white" stroke-width="2" />
                    </svg>
                    <div style={{ display: "flex", "justify-content": "center", gap: "12px", "margin-top": "8px", "font-size": "10px" }}>
                        <span style={{ color: "#666" }}>-- Linear</span>
                        <span style={{ color: "#ef4444" }}>— Exponential</span>
                        <span style={{ color: "#3b82f6" }}>— Logistic</span>
                    </div>
                </div>
            </div>

            <div style={{ background: "#1e1e1e", padding: "16px", "border-radius": "8px", border: "1px solid #333", "font-size": "13px", "line-height": "1.5" }}>
                <p style={{ "margin-top": 0 }}><strong>Why Curves Matter:</strong></p>
                <ul style={{ "margin-bottom": 0, "padding-left": "20px" }}>
                    <li><strong>Exponential:</strong> Used for "Panic" or "Desperate" needs. Low utility initially, then spikes rapidly as $x$ increases.</li>
                    <li><strong>Logistic (S-Curve):</strong> The most "human" curve. It has a threshold where the AI starts to care, and a saturation point.</li>
                    <li><strong>Linear:</strong> Robotic and predictable. Small changes in state always lead to the same change in utility.</li>
                </ul>
            </div>
        </div>
    );
}
