import { createSignal, onCleanup, For } from "solid-js";
import { Blackboard } from "../../common/blackboard";
import type { UtilityEngine, UActionScore } from "../../utility_ai/types";

interface BrainVisualizerProps {
    engine: UtilityEngine;
    blackboard: Blackboard;
    currentAction: string;
}

export default function BrainVisualizer(props: BrainVisualizerProps) {
    const [scores, setScores] = createSignal<UActionScore[]>([]);

    const updateScores = () => {
        setScores(props.engine.getScores(props.blackboard));
    };

    // Poll for scores every 500ms for real-time visualization
    const timer = setInterval(updateScores, 500);
    onCleanup(() => clearInterval(timer));

    // Initialize scores
    updateScores();

    return (
        <div style={{
            background: "#18181b",
            padding: "20px",
            "border-radius": "12px",
            border: "1px solid #27272a",
            color: "white",
            "font-family": "monospace",
            "margin-top": "20px"
        }}>
            <h3 style={{ "margin-top": 0, "margin-bottom": "16px", color: "#a1a1aa", "font-size": "14px" }}>
                🧠 Brain View: Utility Scores
            </h3>

            <div style={{ display: "flex", "flex-direction": "column", gap: "16px" }}>
                <For each={scores().sort((a, b) => b.finalScore - a.finalScore)}>
                    {(item) => (
                        <div style={{
                            opacity: item.name.includes(props.currentAction.replace(/[^a-zA-Z ]/g, "").trim()) ? 1 : 0.6,
                            transition: "opacity 0.2s"
                        }}>
                            <div style={{ display: "flex", "justify-content": "space-between", "margin-bottom": "4px", "font-size": "12px" }}>
                                <span style={{ "font-weight": "bold" }}>
                                    {item.name}
                                </span>
                                <span style={{ color: item.finalScore > 0 ? "#10b981" : "#71717a" }}>
                                    {item.finalScore.toFixed(3)}
                                </span>
                            </div>

                            {/* Final Score Bar */}
                            <div style={{
                                background: "#27272a",
                                height: "6px",
                                "border-radius": "3px",
                                overflow: "hidden",
                                "margin-bottom": "8px"
                            }}>
                                <div style={{
                                    background: item.finalScore > 0.5 ? "#10b981" : (item.finalScore > 0 ? "#eab308" : "#71717a"),
                                    width: `${item.finalScore * 100}%`,
                                    height: "100%",
                                    transition: "width 0.3s ease, background 0.3s ease"
                                }} />
                            </div>

                            {/* Consideration Breakdown */}
                            <div style={{
                                "font-size": "10px",
                                "padding-left": "8px",
                                "border-left": "2px solid #27272a",
                                display: "flex",
                                "flex-direction": "column",
                                gap: "4px"
                            }}>
                                <For each={item.considerationScores}>
                                    {(c) => (
                                        <div style={{ display: "flex", "justify-content": "space-between" }}>
                                            <span style={{ color: "#a1a1aa" }}>{c.name}</span>
                                            <span style={{ color: c.value === 0 ? "#ef4444" : "#94a3b8" }}>
                                                {c.value.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>
                    )}
                </For>
            </div>

            <div style={{
                "margin-top": "20px",
                "font-size": "10px",
                color: "#71717a",
                "line-height": "1.4",
                border: "1px dashed #27272a",
                padding: "8px",
                "border-radius": "4px"
            }}>
                💡 Product Scoring: Final Score = Consideration A × Consideration B × ...
            </div>
        </div>
    );
}
