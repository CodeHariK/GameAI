import { createSignal, Match, Switch } from "solid-js";
import SecuritySystem from "./SecuritySystem";
import TrafficLight from "./Traffic";
import RPGChest from "./RPGChest";
import CharacterCreator from "./CharacterCreator";
import HSMVisualizer from "./HSMVisualizer";
import BTVisualizer from "./BTVisualizer";

// BT Sub-examples
import StatelessVsStateful from "./BTExamples/StatelessVsStateful";
import ResourceGatherer from "./BTExamples/ResourceGatherer";
import PriorityShowcase from "./BTExamples/PriorityShowcase";

export default function Examples() {
    const [currentExample, setCurrentExample] = createSignal("bt");
    const [btSubExample, setBTSubExample] = createSignal("original");

    return (
        <div style={{ padding: "20px", background: "#000", "min-height": "100vh", color: "white", "font-family": "sans-serif" }}>
            <nav style={{ "margin-bottom": "20px", display: "flex", gap: "10px", "flex-wrap": "wrap" }}>
                <button onClick={() => setCurrentExample("bt")}>Behavior Tree (King of AI)</button>
                <button onClick={() => setCurrentExample("hsm")}>HSM (Complex Characters)</button>
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
                                <BTVisualizer />
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
        </div>
    );
}