import { createSignal, Show } from "solid-js";
import { FSM } from "../fsm/fsm";

export default function CharacterCreator() {
    const [current, setCurrent] = createSignal("NAME");
    const [canGoBack, setCanGoBack] = createSignal(false);

    const wizardFSM = new FSM({
        initial: "NAME",
        states: [
            {
                id: "NAME",
                onEntry: () => console.log("Entering Name Screen"),
                transitions: [
                    { event: "NEXT", to: "CLASS" }
                ]
            },
            {
                id: "CLASS",
                onEntry: () => console.log("Entering Class Screen"),
                transitions: [
                    { event: "NEXT", to: "STATS" }
                ]
            },
            { id: "STATS", onEntry: () => console.log("Entering Stats Screen") }
        ],
    });

    const handleNext = () => {
        if (wizardFSM.send("NEXT")) {
            setCurrent(wizardFSM.currentStateID);
            setCanGoBack(wizardFSM.canUndo);
        }
    };

    const handleBack = () => {
        if (wizardFSM.back()) {
            setCurrent(wizardFSM.currentStateID);
            setCanGoBack(wizardFSM.canUndo);
        }
    };

    return (
        <div style={{ padding: "2rem", border: "1px solid #444", "border-radius": "8px" }}>
            <h3>Step: {current()}</h3>

            <div style={{ "margin-bottom": "2rem", height: "100px", display: "flex", "align-items": "center" }}>
                <Show when={current() === "NAME"}>
                    <input type="text" placeholder="Enter Character Name..." />
                </Show>
                <Show when={current() === "CLASS"}>
                    <select>
                        <option>Warrior</option>
                        <option>Mage</option>
                        <option>Rogue</option>
                    </select>
                </Show>
                <Show when={current() === "STATS"}>
                    <p>STR: 10 | INT: 10 | DEX: 10</p>
                </Show>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleBack} disabled={!canGoBack()}>
                    &larr; Back
                </button>

                <Show when={current() !== "STATS"}>
                    <button onClick={handleNext} style={{ background: "#3b82f6", color: "white" }}>
                        Next &rarr;
                    </button>
                </Show>
            </div>
        </div>
    );
}