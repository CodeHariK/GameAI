import { createSignal, onCleanup, For } from "solid-js";
import { NodeStatus, ActionNode, ConditionNode } from "../../bt/types";
import { Sequence, Selector, MemSequence } from "../../bt/composites";
import { Blackboard } from "../../bt/blackboard";
import { WaitNode } from "../../bt/decorators";

export default function PriorityShowcase() {
    const [health, setHealth] = createSignal(100);
    const [noiseSource, setNoiseSource] = createSignal(false);
    const [isStunned, setIsStunned] = createSignal(false);
    const [status, setStatus] = createSignal("Idle");
    const [logs, setLogs] = createSignal<string[]>([]);
    const blackboard = new Blackboard();
    let currentLogNum = 0;

    const addLog = (msg: string) => {
        setLogs(prev => [`${currentLogNum++}: ${msg}`, ...prev].slice(0, 10));
    };

    // 1. Critical Responses (Zero Memory - Must react EVERY pulse)
    const panic = new Sequence([
        new ConditionNode((bb) => (bb.get<number>("health") || 0) < 20),
        new ActionNode(() => {
            setStatus("PANIC! Run away!");
            addLog("CRITICAL: Low health panic!");
            return NodeStatus.Success;
        })
    ]);

    const stunResponse = new Sequence([
        new ConditionNode((bb) => !!bb.get<boolean>("stunned")),
        new ActionNode(() => {
            setStatus("Stunned...");
            addLog("CRITICAL: Stunned!");
            return NodeStatus.Success;
        })
    ]);

    // 2. Proactive Behaviors (Investigations)
    const investigate = new MemSequence([
        new ConditionNode((bb) => !!bb.get<boolean>("heardNoise")),
        new ActionNode(() => { addLog("Investigating noise..."); setStatus("Investigating..."); return NodeStatus.Success; }),
        new WaitNode(2000),
        new ActionNode((bb) => { addLog("Noise was nothing."); bb.set("heardNoise", false); setNoiseSource(false); return NodeStatus.Success; })
    ]);

    // 3. Idle Behaviors
    const idleFlow = new MemSequence([
        new ActionNode(() => { setStatus("Patrolling Area A"); addLog("Idle: Patrol A"); return NodeStatus.Success; }),
        new WaitNode(1500),
        new ActionNode(() => { setStatus("Patrolling Area B"); addLog("Idle: Patrol B"); return NodeStatus.Success; }),
        new WaitNode(1500)
    ]);

    // Root Priority Logic
    const root = new Selector([
        stunResponse,
        panic,
        investigate,
        idleFlow
    ]);

    const interval = setInterval(() => {
        blackboard.set("health", health());
        blackboard.set("stunned", isStunned());
        blackboard.set("heardNoise", noiseSource());
        root.tick(blackboard);
    }, 500);

    onCleanup(() => clearInterval(interval));

    return (
        <div style={{ color: "white" }}>
            <h2>Priority Hierachies</h2>
            <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1, background: "#1a1a1a", padding: "15px", "border-radius": "8px" }}>
                    <h3>World State</h3>
                    <label>Health: {health()}%</label>
                    <input type="range" min="0" max="100" value={health()} onInput={e => setHealth(parseInt(e.currentTarget.value))} style={{ width: "100%", "margin-bottom": "15px" }} />

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => { setNoiseSource(true); addLog("User made a noise!"); }} style={{ flex: 1, padding: "8px" }}>Make Noise</button>
                        <button onClick={() => setIsStunned(!isStunned())} style={{ flex: 1, padding: "8px", background: isStunned() ? "red" : "#444" }}>
                            {isStunned() ? "Unstun" : "Stun"}
                        </button>
                    </div>

                    <div style={{ "margin-top": "20px", background: "#000", padding: "10px", color: "#0f0" }}>
                        <strong>Status: {status()}</strong>
                    </div>
                </div>

                <div style={{ flex: 1, background: "#000", padding: "10px", "font-family": "monospace", height: "250px", overflow: "hidden" }}>
                    <For each={logs()}>
                        {(log) => <div style={{ "font-size": "12px" }}>• {log}</div>}
                    </For>
                </div>
            </div>

            <div style={{ "margin-top": "15px", opacity: 0.7, "font-size": "13px", padding: "10px", border: "1px dashed #555" }}>
                <strong>Hierarchy:</strong> Stun {">"} Panic (Health {"<"} 20) {">"} Investigate {">"} Idle.
                <br /><br />
                Notice how making a noise interrupts the Idle Patrol immediately, but getting Stunned interrupts the investigation.
            </div>
        </div>
    );
}
