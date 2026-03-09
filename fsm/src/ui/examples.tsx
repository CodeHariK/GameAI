import { createSignal, Match, Switch } from "solid-js";
import SecuritySystem from "./SecuritySystem";
import TrafficLight from "./Traffic";
import RPGChest from "./RPGChest";
import CharacterCreator from "./CharacterCreator";
import HSMVisualizer from "./HSMVisualizer";
import BTVisualizer from "./BTVisualizer";

export default function Examples() {
    const [currentExample, setCurrentExample] = createSignal("traffic");
    return (
        <div>
            <button onClick={() => setCurrentExample("traffic")}>Traffic Light</button>
            <button onClick={() => setCurrentExample("security")}>Security System</button>
            <button onClick={() => setCurrentExample("rpg")}>RPG Chest</button>
            <button onClick={() => setCurrentExample("character")}>Character Creator</button>
            <button onClick={() => setCurrentExample("hsm")}>HSM</button>
            <button onClick={() => setCurrentExample("bt")}>Behavior Tree</button>
            <Switch>
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
                <Match when={currentExample() === "hsm"}>
                    <HSMVisualizer />
                </Match>
                <Match when={currentExample() === "bt"}>
                    <BTVisualizer />
                </Match>
            </Switch>
        </div>
    );
}