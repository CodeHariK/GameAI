import { createSignal, Match, Switch } from "solid-js";
import SecuritySystem from "./SecuritySystem";
import TrafficLight from "./Traffic";
import RPGChest from "./RPGChest";
import CharacterCreator from "./CharacterCreator";
import HSMVisualizer from "./HSMVisualizer";
import TheGuard from "./TheGuard";

// BT Sub-examples
import StatelessVsStateful from "./BTExamples/StatelessVsStateful";
import ResourceGatherer from "./BTExamples/ResourceGatherer";
import PriorityShowcase from "./BTExamples/PriorityShowcase";
import SimsVisualizer from "./UtilityAIExamples/SimsVisualizer";
import UtilityCurveVisualizer from "./UtilityAIExamples/UtilityCurveVisualizer";
import HybridAIVisualizer from "./UtilityAIExamples/HybridAIVisualizer";

export default function Examples() {
    const [currentExample, setCurrentExample] = createSignal("bt");
    const [btSubExample, setBTSubExample] = createSignal("original");

    return (
        <div style={{ padding: "20px", background: "#000", "min-height": "100vh", color: "white", "font-family": "sans-serif" }}>
            <nav style={{ "margin-bottom": "20px", display: "flex", gap: "10px", "flex-wrap": "wrap" }}>
                <button
                    style={{ background: currentExample() === "bt" ? "#4f46e5" : "#333" }}
                    onClick={() => setCurrentExample("bt")}
                >Behavior Tree</button>
                <button
                    style={{ background: currentExample() === "utility" ? "#4f46e5" : "#333" }}
                    onClick={() => setCurrentExample("utility")}
                >Utility AI (Sims)</button>
                <button
                    style={{ background: currentExample() === "hsm" ? "#4f46e5" : "#333" }}
                    onClick={() => setCurrentExample("hsm")}
                >HSM</button>
                <button onClick={() => setCurrentExample("traffic")}>FSM (Basics)</button>
                <button onClick={() => setCurrentExample("security")}>FSM (Complex)</button>
                <button onClick={() => setCurrentExample("rpg")}>FSM (RPG)</button>
                <button onClick={() => setCurrentExample("character")}>Stateful Form</button>
            </nav>

            <Switch>
                <Match when={currentExample() === "bt"}>
                    <div style={{ border: "2px solid #333", padding: "20px", "border-radius": "12px", background: "#111" }}>
                        <div style={{ "margin-bottom": "20px", display: "flex", gap: "10px" }}>
                            <button
                                style={{ background: btSubExample() === "original" ? "#00ff00" : "#333", color: btSubExample() === "original" ? "black" : "white" }}
                                onClick={() => setBTSubExample("original")}
                            >1. The Guard (Basic)</button>
                            <button
                                style={{ background: btSubExample() === "memory" ? "#00ff00" : "#333", color: btSubExample() === "memory" ? "black" : "white" }}
                                onClick={() => setBTSubExample("memory")}
                            >2. Reactive vs Memory</button>
                            <button
                                style={{ background: btSubExample() === "resource" ? "#00ff00" : "#333", color: btSubExample() === "resource" ? "black" : "white" }}
                                onClick={() => setBTSubExample("resource")}
                            >3. Resource Gatherer</button>
                            <button
                                style={{ background: btSubExample() === "priority" ? "#00ff00" : "#333", color: btSubExample() === "priority" ? "black" : "white" }}
                                onClick={() => setBTSubExample("priority")}
                            >4. Priority Hierarchy</button>
                        </div>

                        <Switch>
                            <Match when={btSubExample() === "original"}>
                                <TheGuard />
                            </Match>
                            <Match when={btSubExample() === "memory"}>
                                <StatelessVsStateful />
                            </Match>
                            <Match when={btSubExample() === "resource"}>
                                <ResourceGatherer />
                            </Match>
                            <Match when={btSubExample() === "priority"}>
                                <PriorityShowcase />
                            </Match>
                        </Switch>
                    </div>
                </Match>

                <Match when={currentExample() === "utility"}>
                    <div style={{ border: "2px solid #333", padding: "20px", "border-radius": "12px", background: "#111" }}>
                        <div style={{ "margin-bottom": "20px", display: "flex", gap: "10px" }}>
                            <button
                                style={{ background: btSubExample() === "sims" ? "#4f46e5" : "#333" }}
                                onClick={() => setBTSubExample("sims")}
                            >1. Sims Simulation</button>
                            <button
                                style={{ background: btSubExample() === "curves" ? "#4f46e5" : "#333" }}
                                onClick={() => setBTSubExample("curves")}
                            >2. Response Curves</button>
                            <button
                                style={{ background: btSubExample() === "hybrid" ? "#4f46e5" : "#333" }}
                                onClick={() => setBTSubExample("hybrid")}
                            >3. Hybrid AI (Guard)</button>
                        </div>

                        <Switch>
                            <Match when={btSubExample() === "sims"}>
                                <SimsVisualizer />
                            </Match>
                            <Match when={btSubExample() === "curves"}>
                                <UtilityCurveVisualizer />
                            </Match>
                            <Match when={btSubExample() === "hybrid"}>
                                <HybridAIVisualizer />
                            </Match>
                        </Switch>
                    </div>
                </Match>

                <Match when={currentExample() === "hsm"}>
                    <HSMVisualizer />
                </Match>
                <Match when={currentExample() === "traffic"}>
                    <TrafficLight />
                </Match>
                <Match when={currentExample() === "security"}>
                    <SecuritySystem />
                </Match>
                <Match when={currentExample() === "rpg"}>
                    <RPGChest />
                </Match>
                <Match when={currentExample() === "character"}>
                    <CharacterCreator />
                </Match>
            </Switch>

        </div >
    );
}