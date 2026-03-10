import { createSignal, Match, Switch } from "solid-js";
import SecuritySystem from "./SecuritySystem";
import TrafficLight from "./Traffic";
import RPGChest from "./RPGChest";
import TheGuard from "./TheGuard";

// BT Sub-examples
import StatelessVsStateful from "./BTExamples/StatelessVsStateful";
import ResourceGatherer from "./BTExamples/ResourceGatherer";
import PriorityShowcase from "./BTExamples/PriorityShowcase";
import SimsVisualizer from "./UtilityAIExamples/SimsVisualizer";
import UtilityCurveVisualizer from "./UtilityAIExamples/UtilityCurveVisualizer";
import HybridAIVisualizer from "./UtilityAIExamples/HybridAIVisualizer";
import TacticalVisualizer from "./GOAPExamples/TacticalVisualizer";
import HermitVisualizer from "./GOAPExamples/HermitVisualizer";
import SquadVisualizer from "./SquadExamples/SquadVisualizer";
import DirectorDashboard from "./DirectorExamples/DirectorDashboard";

export default function Examples() {
    const [currentExample, setCurrentExample] = createSignal("traffic");
    const [utilitySubExample, setUtilitySubExample] = createSignal("sims");
    const [goapSubExample, setGoapSubExample] = createSignal("tactical");
    const [btSubExample, setBTSubExample] = createSignal("original");

    return (
        <div style={{ padding: "40px", "max-width": "1200px", margin: "0 auto", "font-family": "Inter, sans-serif" }}>
            <div style={{ display: "flex", gap: "10px", "margin-bottom": "30px", "flex-wrap": "wrap" }}>
                <button
                    style={{ background: currentExample() === "traffic" ? "#4f46e5" : "#333", color: "white", border: "none", padding: "10px 20px", "border-radius": "6px", cursor: "pointer" }}
                    onClick={() => setCurrentExample("traffic")}
                >1. FSM (Basic)</button>
                <button
                    style={{ background: currentExample() === "bt" ? "#4f46e5" : "#333", color: "white", border: "none", padding: "10px 20px", "border-radius": "6px", cursor: "pointer" }}
                    onClick={() => setCurrentExample("bt")}
                >2. Behavior Trees</button>
                <button
                    style={{ background: currentExample() === "utility" ? "#4f46e5" : "#333", color: "white", border: "none", padding: "10px 20px", "border-radius": "6px", cursor: "pointer" }}
                    onClick={() => setCurrentExample("utility")}
                >3. Utility AI</button>
                <button
                    style={{ background: currentExample() === "goap" ? "#4f46e5" : "#333", color: "white", border: "none", padding: "10px 20px", "border-radius": "6px", cursor: "pointer" }}
                    onClick={() => setCurrentExample("goap")}
                >4. GOAP (Plan)</button>
                <button
                    style={{ background: currentExample() === "squad" ? "#4f46e5" : "#333", color: "white", border: "none", padding: "10px 20px", "border-radius": "6px", cursor: "pointer" }}
                    onClick={() => setCurrentExample("squad")}
                >5. Squad AI (Team)</button>
                <button
                    style={{ background: currentExample() === "director" ? "#4f46e5" : "#333", color: "white", border: "none", padding: "10px 20px", "border-radius": "6px", cursor: "pointer" }}
                    onClick={() => setCurrentExample("director")}
                >6. Director AI (God)</button>
                <button
                    style={{
                        background: "#222", color: "#666", border: "1px dashed #444",
                        padding: "10px 20px", "border-radius": "6px", cursor: "not-allowed",
                        "margin-left": "auto"
                    }}
                    disabled
                >HSM (Coming Soon)</button>
            </div>

            <Switch>
                {/* --- FSM SECTION --- */}
                <Match when={currentExample() === "traffic"}>
                    <div style={{ display: "flex", "flex-direction": "column", gap: "20px" }}>
                        <TrafficLight />
                        <SecuritySystem />
                        <RPGChest />
                    </div>
                </Match>

                {/* --- BT SECTION --- */}
                <Match when={currentExample() === "bt"}>
                    <div style={{ "margin-bottom": "20px", display: "flex", gap: "10px", "flex-wrap": "wrap" }}>
                        <button
                            style={{ background: "none", border: "none", color: btSubExample() === "original" ? "#818cf8" : "#64748b", "border-bottom": btSubExample() === "original" ? "2px solid #818cf8" : "none", padding: "8px 0", cursor: "pointer" }}
                            onClick={() => setBTSubExample("original")}
                        >Guard (Basic)</button>
                        <button
                            style={{ background: "none", border: "none", color: btSubExample() === "memory" ? "#818cf8" : "#64748b", "border-bottom": btSubExample() === "memory" ? "2px solid #818cf8" : "none", padding: "8px 0", cursor: "pointer" }}
                            onClick={() => setBTSubExample("memory")}
                        >Reactive vs Memory</button>
                        <button
                            style={{ background: "none", border: "none", color: btSubExample() === "resource" ? "#818cf8" : "#64748b", "border-bottom": btSubExample() === "resource" ? "2px solid #818cf8" : "none", padding: "8px 0", cursor: "pointer" }}
                            onClick={() => setBTSubExample("resource")}
                        >Resource Gatherer</button>
                        <button
                            style={{ background: "none", border: "none", color: btSubExample() === "priority" ? "#818cf8" : "#64748b", "border-bottom": btSubExample() === "priority" ? "2px solid #818cf8" : "none", padding: "8px 0", cursor: "pointer" }}
                            onClick={() => setBTSubExample("priority")}
                        >Priority Logic</button>
                    </div>
                    <Switch>
                        <Match when={btSubExample() === "original"}><TheGuard /></Match>
                        <Match when={btSubExample() === "memory"}><StatelessVsStateful /></Match>
                        <Match when={btSubExample() === "resource"}><ResourceGatherer /></Match>
                        <Match when={btSubExample() === "priority"}><PriorityShowcase /></Match>
                    </Switch>
                </Match>

                {/* --- UTILITY AI SECTION --- */}
                <Match when={currentExample() === "utility"}>
                    <div style={{ "margin-bottom": "20px", display: "flex", gap: "15px" }}>
                        <button
                            style={{ background: "none", border: "none", color: utilitySubExample() === "sims" ? "#10b981" : "#64748b", "border-bottom": utilitySubExample() === "sims" ? "2px solid #10b981" : "none", padding: "8px 0", cursor: "pointer" }}
                            onClick={() => setUtilitySubExample("sims")}
                        >Sims AI</button>
                        <button
                            style={{ background: "none", border: "none", color: utilitySubExample() === "hybrid" ? "#10b981" : "#64748b", "border-bottom": utilitySubExample() === "hybrid" ? "2px solid #10b981" : "none", padding: "8px 0", cursor: "pointer" }}
                            onClick={() => setUtilitySubExample("hybrid")}
                        >Hybrid (Utility+BT)</button>
                        <button
                            style={{ background: "none", border: "none", color: utilitySubExample() === "curves" ? "#10b981" : "#64748b", "border-bottom": utilitySubExample() === "curves" ? "2px solid #10b981" : "none", padding: "8px 0", cursor: "pointer" }}
                            onClick={() => setUtilitySubExample("curves")}
                        >Curve Visualizer</button>
                    </div>
                    <Switch>
                        <Match when={utilitySubExample() === "sims"}><SimsVisualizer /></Match>
                        <Match when={utilitySubExample() === "hybrid"}><HybridAIVisualizer /></Match>
                        <Match when={utilitySubExample() === "curves"}><UtilityCurveVisualizer /></Match>
                    </Switch>
                </Match>

                {/* --- GOAP SECTION --- */}
                <Match when={currentExample() === "goap"}>
                    <div style={{ "margin-bottom": "20px", display: "flex", gap: "20px" }}>
                        <button
                            style={{ background: "none", border: "none", color: goapSubExample() === "tactical" ? "#38bdf8" : "#64748b", "border-bottom": goapSubExample() === "tactical" ? "2px solid #38bdf8" : "none", padding: "8px 0", cursor: "pointer" }}
                            onClick={() => setGoapSubExample("tactical")}
                        >Tactical Squad</button>
                        <button
                            style={{ background: "none", border: "none", color: goapSubExample() === "hermit" ? "#38bdf8" : "#64748b", "border-bottom": goapSubExample() === "hermit" ? "2px solid #38bdf8" : "none", padding: "8px 0", cursor: "pointer" }}
                            onClick={() => setGoapSubExample("hermit")}
                        >Hungry Hermit</button>
                    </div>
                    <Switch>
                        <Match when={goapSubExample() === "tactical"}><TacticalVisualizer /></Match>
                        <Match when={goapSubExample() === "hermit"}><HermitVisualizer /></Match>
                    </Switch>
                </Match>

                {/* --- SQUAD SECTION --- */}
                <Match when={currentExample() === "squad"}>
                    <SquadVisualizer />
                </Match>

                {/* --- DIRECTOR SECTION --- */}
                <Match when={currentExample() === "director"}>
                    <DirectorDashboard />
                </Match>
            </Switch>
        </div>
    );
}