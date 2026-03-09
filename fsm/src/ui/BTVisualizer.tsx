import { createSignal, onCleanup, For } from "solid-js";
import { NodeStatus, ActionNode } from "../bt/types";
import { Sequence, Selector, MemSequence } from "../bt/composites";
import { Blackboard } from "../bt/blackboard";
import { WaitNode, Inverter } from "../bt/decorators";

export default function BTVisualizer() {
    const [health, setHealth] = createSignal(100);
    const [isStunned, setIsStunned] = createSignal(false);
    const [statusMessage, setStatusMessage] = createSignal("Idle");
    const [lastResult, setLastResult] = createSignal<NodeStatus>(NodeStatus.Running);
    const [logs, setLogs] = createSignal<string[]>([]);
    let currentLogNum = 0;
    let logBuffer: string[] = [];

    const blackboard = new Blackboard();

    const addLog = (msg: string) => {
        logBuffer.push(msg);
    };

    // 1. Actions
    const flee = new ActionNode(() => {
        setStatusMessage("Fleeing for safety!");
        addLog("Action: Fleeing");
        return NodeStatus.Success;
    });

    const checkHealth = new ActionNode(() => {
        if (health() < 30) {
            addLog("Check: Health Low!");
            return NodeStatus.Success;
        }
        return NodeStatus.Failure;
    });

    const patrol_1 = new ActionNode(() => {
        setStatusMessage("Patrolling: Point A");
        addLog("Action: Point A");
        return NodeStatus.Success;
    });

    const patrol_2 = new ActionNode(() => {
        setStatusMessage("Patrolling: Point B");
        addLog("Action: Point B");
        return NodeStatus.Success;
    });

    const checkStunned = new ActionNode((bb) => {
        if (bb.get("stunned")) {
            addLog("Check: Stunned!");
            setStatusMessage("Dizzy... (@_@)");
            return NodeStatus.Success;
        }
        return NodeStatus.Failure;
    });

    // 2. The Tree
    // If Health Low -> Flee
    const fleeBehavior = new Sequence([checkHealth, flee]);

    // If NOT Stunned -> Patrol Step
    // (Using Inverter to flip checkStunned)
    const canPatrol = new Inverter(checkStunned);

    // Patrol Sequence: Point A -> Wait 2s -> Point B -> Wait 2s
    // Using MemSequence here prevents re-ticking Point A while waiting for Point B
    const patrolBehavior = new MemSequence([
        new Sequence([canPatrol, patrol_1]),
        new WaitNode(2000),
        new Sequence([canPatrol, patrol_2]),
        new WaitNode(2000)
    ]);

    // Priority Selection:
    // 1. If Stunned, stay in stun state (returns SUCCESS)
    // 2. If Health Low, Flee
    // 3. Otherwise Patrol
    const root = new Selector([
        checkStunned,
        fleeBehavior,
        patrolBehavior
    ]);

    // 3. The Heartbeat (Tick)
    // Faster tick to see WaitNode progress
    const interval = setInterval(() => {
        logBuffer = [];
        blackboard.set("stunned", isStunned());
        const result = root.tick(blackboard);

        if (logBuffer.length > 0) {
            const batchMsg = `${currentLogNum}: ${logBuffer.join(" → ")}`;
            setLogs(prev => [batchMsg, ...prev].slice(0, 10));
            currentLogNum += 1;
        }

        setLastResult(result);
    }, 500);

    onCleanup(() => clearInterval(interval));

    return (
        <div style={{ padding: "20px", background: "#121212", color: "white", "font-family": "sans-serif" }}>
            <h1>Reactive BT: Guard AI (v2.0)</h1>

            <div style={{ display: "flex", gap: "20px", "margin-bottom": "20px" }}>
                <div style={{ flex: 1, border: "1px solid #444", padding: "15px", "border-radius": "8px" }}>
                    <h3>Guard Stats</h3>
                    <p>Health:
                        <span style={{
                            color: health() < 30 ? "red" : "#00ff00",
                            "font-weight": "bold",
                            "margin-left": "10px"
                        }}>{health()}%</span>
                    </p>
                    <input
                        type="range"
                        min="0" max="100"
                        value={health()}
                        onInput={(e) => setHealth(parseInt(e.currentTarget.value))}
                        style={{ width: "100%", "margin-bottom": "15px" }}
                    />

                    <button
                        onClick={() => setIsStunned(!isStunned())}
                        style={{
                            width: "100%",
                            padding: "10px",
                            background: isStunned() ? "#ff4444" : "#444",
                            color: "white",
                            border: "none",
                            "border-radius": "4px",
                            cursor: "pointer",
                            "font-weight": "bold"
                        }}
                    >
                        {isStunned() ? "Wake Up (Unstun)" : "Stun Guard!"}
                    </button>

                    <div style={{ "margin-top": "15px" }}>
                        <strong>Current Status:</strong>
                        <div style={{
                            background: "#000",
                            padding: "10px",
                            "border-radius": "4px",
                            "margin-top": "5px",
                            color: "#00ff00",
                            "font-family": "monospace"
                        }}>
                            {statusMessage()}
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, border: "1px solid #444", padding: "15px", "border-radius": "8px" }}>
                    <h3>BT Pulse (500ms Tick)</h3>
                    <p>Root Result:
                        <code style={{
                            color: lastResult() === NodeStatus.Success ? "#00ff00" :
                                lastResult() === NodeStatus.Failure ? "red" : "#ffaa00",
                            "margin-left": "10px"
                        }}>
                            {lastResult()}
                        </code>
                    </p>
                    <h4>Recent Actions:</h4>
                    <pre style={{ "font-size": "11px", opacity: 0.7, background: "#000", padding: "10px" }}>
                        <For each={logs()}>
                            {(log) => <div>• {log}</div>}
                        </For>
                    </pre>
                </div>
            </div>

            <div style={{ opacity: 0.8, "font-size": "14px", background: "#222", padding: "15px", "border-radius": "8px" }}>
                <p><strong>What's New (Hero Status):</strong></p>
                <ul>
                    <li><strong>WaitNode Interrupt Fix:</strong> If you stun the guard while it's "Waiting", the <code>Selector</code> switches to the Stun path. When unstunned, the <code>WaitNode</code> correctly <strong>resets</strong> and starts its 2s timer from scratch instead of finishing instantly.</li>
                    <li><strong>Inverter Decorator:</strong> Used to flip the "Stunned" check so the guard only patrols when <code>NOT</code> stunned.</li>
                    <li><strong>Reactive Selection:</strong> The <code>Selector</code> re-evaluates priorities every 500ms. If you are not stunned and health is fine, it proceeds to Patrol.</li>
                    <li><strong>Recursive Resets:</strong> Composites now recursively reset interrupted children, handling complex nested trees perfectly.</li>
                </ul>
            </div>
        </div>
    );
}
