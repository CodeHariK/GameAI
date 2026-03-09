import { createSignal } from "solid-js";
import { FSM } from "../fsm/fsm";

export default function RPGChest() {
    const [inventory, setInventory] = createSignal({ hasKey: false, level: 1 });
    const [message, setMessage] = createSignal("The chest is locked tight.");

    const chestFSM = new FSM({
        initial: "LOCKED",
        states: [
            {
                id: "LOCKED",
                transitions: [
                    {
                        event: "OPEN_CHEST",
                        to: "OPEN",
                        // The Guard Clause
                        canTransition: () => inventory().hasKey && inventory().level >= 5
                    }
                ]
            },
            { id: "OPEN", onEntry: () => setMessage("You found a legendary sword!") }
        ],
    });

    const [state, setState] = createSignal(chestFSM.currentStateID);

    const tryOpen = () => {
        const success = chestFSM.send("OPEN_CHEST");
        if (success) {
            setState(chestFSM.currentStateID);
        } else {
            setMessage(`Locked! (Need Key: ${inventory().hasKey}, Level: ${inventory().level}/5)`);
        }
    };

    return (
        <div style={{ padding: "2rem", "border": "1px solid gold", "background": "#1a1a1a", color: "white" }}>
            <h2>Status: {state()}</h2>
            <p style={{ color: "orange" }}>{message()}</p>

            <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setInventory(i => ({ ...i, hasKey: true }))}>Pick up Key</button>
                <button onClick={() => setInventory(i => ({ ...i, level: i.level + 1 }))}>Level Up ({inventory().level})</button>
                <button onClick={tryOpen} style={{ background: "gold", color: "black" }}>Try to Open Chest</button>
            </div>
        </div>
    );
}