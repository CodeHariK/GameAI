import { createSignal } from "solid-js";
import { HSM } from "../fsm/hsm"; // Using the class we built

// 1. Define our State Hierarchy
const PLAYER_STATES = [
    { id: "ALIVE" },
    { id: "GROUNDED", parentId: "ALIVE" },
    {
        id: "IDLE", parentId: "GROUNDED",
        transitions: [{ event: "MOVE", to: "WALKING" }]
    },
    {
        id: "WALKING", parentId: "GROUNDED",
        transitions: [{ event: "STOP", to: "IDLE" }]
    },
    {
        id: "STUNNED", parentId: "ALIVE",
        transitions: [{ event: "RECOVER", to: "IDLE" }]
    }
];

// Add a Global "HIT" transition to the ALIVE state
PLAYER_STATES[0].transitions = [{ event: "GET_HIT", to: "STUNNED" }];

export default function HSMVisualizer() {
    const hsm = new HSM({
        initial: "IDLE",
        states: PLAYER_STATES
    });

    const [current, setCurrent] = createSignal(hsm.currentStateID);

    const handleEvent = (ev: string) => {
        if (hsm.send(ev)) {
            setCurrent(hsm.currentStateID);
        }
    };

    // Helper to check if a state is currently active OR is a parent of the active state
    const isActive = (id: string) => {
        let checkId: string | undefined = current();
        while (checkId) {
            if (checkId === id) return true;
            checkId = PLAYER_STATES.find(s => s.id === checkId)?.parentId;
        }
        return false;
    };

    return (
        <div style={{ padding: "20px", background: "#121212", color: "white", "font-family": "sans-serif" }}>
            <h1>HSM: Player Controller</h1>
            <p>Active State: <code style={{ color: "#00ff00" }}>{current()}</code></p>

            {/* Visual Hierarchy */}
            <div class="hsm-container">
                <StateNode id="ALIVE" active={isActive("ALIVE")}>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <StateNode id="GROUNDED" active={isActive("GROUNDED")}>
                            <StateNode id="IDLE" active={current() === "IDLE"} />
                            <StateNode id="WALKING" active={current() === "WALKING"} />
                        </StateNode>
                        <StateNode id="STUNNED" active={current() === "STUNNED"} />
                    </div>
                </StateNode>
            </div>

            {/* Controls */}
            <div style={{ "margin-top": "20px", display: "flex", gap: "10px" }}>
                <button onClick={() => handleEvent("MOVE")}>Move (Grounded Only)</button>
                <button onClick={() => handleEvent("STOP")}>Stop (Walking Only)</button>
                <button onClick={() => handleEvent("GET_HIT")} style={{ background: "red" }}>
                    Get Hit (Global!)
                </button>
                <button onClick={() => handleEvent("RECOVER")}>Recover</button>
            </div>

            <style>{`
        .hsm-container { border: 1px solid #444; padding: 20px; border-radius: 8px; }
        .state-node { 
            border: 2px opacity 0.5 solid #666; 
            padding: 15px; 
            margin: 5px; 
            border-radius: 6px; 
            transition: all 0.3s ease;
        }
        .state-active { 
            border-color: #00ff00; 
            background: rgba(0, 255, 0, 0.05);
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
        }
        button { cursor: pointer; padding: 8px 16px; border-radius: 4px; border: none; background: #333; color: white; }
        button:hover { background: #444; }
      `}</style>
        </div>
    );
}

// Sub-component for the visual boxes
function StateNode(props: { id: string, active: boolean, children?: any }) {
    return (
        <div class={`state-node ${props.active ? 'state-active' : ''}`}>
            <div style={{ "font-size": "12px", "margin-bottom": "5px", "font-weight": "bold", opacity: 0.7 }}>
                {props.id}
            </div>
            {props.children}
        </div>
    );
}