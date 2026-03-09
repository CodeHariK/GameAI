import { createSignal } from "solid-js";
import { FSM } from "../fsm/fsm";

export default function SecuritySystem() {
    const [status, setStatus] = createSignal("IDLE");
    const [isPanicked, setIsPanicked] = createSignal(false);

    const cameraFSM = new FSM({
        initial: "IDLE",
        states: [
            {
                id: "IDLE",
                onEntry: () => {
                    setStatus("System Secure");
                    setIsPanicked(false);
                },
                transitions: [
                    { event: "MOTION", to: "ALARM" }
                ]
            },
            {
                id: "ALARM",
                onEntry: () => {
                    setStatus("!!! INTRUDER DETECTED !!!");
                    setIsPanicked(true);
                    // Hero move: Trigger an actual browser alert or sound here
                },
                onExit: () => console.log("Alarm silenced."),
                transitions: [
                    { event: "RESET", to: "IDLE" }
                ]
            }
        ]
    });

    const [current, setCurrent] = createSignal(cameraFSM.currentStateID);

    const handleEvent = (ev: "MOTION" | "RESET") => {
        if (cameraFSM.send(ev)) setCurrent(cameraFSM.currentStateID);
    };

    return (
        <div class={`container ${isPanicked() ? 'shake' : ''}`}>
            <h2>Security FSM: {current()}</h2>
            <p>{status()}</p>

            <div class="controls">
                <button onClick={() => handleEvent("MOTION")}>Simulate Motion</button>
                <button onClick={() => handleEvent("RESET")}>Reset System</button>
            </div>

            <style>{`
        .container { transition: all 0.3s; padding: 2rem; border: 2px solid #ccc; }
        .shake { background: #fee; border-color: red; animation: shake 0.2s infinite; }
        @keyframes shake {
          0% { transform: translate(1px, 1px); }
          50% { transform: translate(-1px, -2px); }
          100% { transform: translate(1px, 1px); }
        }
      `}</style>
        </div>
    );
}