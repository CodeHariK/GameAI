import { createSignal, onCleanup, For } from "solid-js";
import { BTNodeStatus, BTActionNode } from "../../bt/types";
import { Sequence, MemSequence } from "../../bt/composites";
import { Blackboard } from "../../common/blackboard";
import { WaitNode } from "../../bt/decorators";

export default function StatelessVsStateful() {
    return (
        <div style={{ display: "flex", gap: "20px", color: "white" }}>
            <AgentBox title="Stateless (Reactive)" useMemory={false} />
            <AgentBox title="Stateful (Memory)" useMemory={true} />
        </div>
    );
}

function AgentBox(props: { title: string, useMemory: boolean }) {
    const [logs, setLogs] = createSignal<string[]>([]);
    const [status, setStatus] = createSignal("Idle");
    const [tickCount, setTickCount] = createSignal(0);
    const blackboard = new Blackboard();
    let currentLogNum = 0;

    const addLog = (msg: string) => {
        const batchMsg = `${currentLogNum}: ${msg}`;
        setLogs(prev => [batchMsg, ...prev].slice(0, 10));
        currentLogNum += 1;
    };

    const search = new BTActionNode(() => {
        addLog("Searching...");
        setStatus("Searching");
        return BTNodeStatus.Success;
    });

    const walk = new BTActionNode(() => {
        setStatus("Walking...");
        return BTNodeStatus.Success;
    });

    const reachTarget = new WaitNode(2000);

    const pickUp = new BTActionNode(() => {
        addLog("Picked up item!");
        setStatus("Success!");
        return BTNodeStatus.Success;
    });

    const Composite = props.useMemory ? MemSequence : Sequence;
    const tree = new Composite([search, walk, reachTarget, pickUp]);

    const interval = setInterval(() => {
        tree.tick(blackboard);
        setTickCount(c => c + 1);
    }, 500);

    onCleanup(() => clearInterval(interval));

    return (
        <div style={{ flex: 1, border: "1px solid #444", padding: "15px", "border-radius": "8px", background: "#1a1a1a" }}>
            <h3 style={{ "margin-top": 0 }}>{props.title}</h3>
            <p>Status: <span style={{ color: "#00ff00" }}>{status()}</span></p>
            <p style={{ opacity: 0.5, "font-size": "12px" }}>Tick: {tickCount()}</p>

            <div style={{ background: "#000", padding: "10px", "font-family": "monospace", "font-size": "11px", height: "180px", overflow: "hidden" }}>
                <For each={logs()}>
                    {(log) => <div>• {log}</div>}
                </For>
            </div>
            <p style={{ "font-size": "12px", opacity: 0.7 }}>
                {props.useMemory
                    ? "Resumes from where it left off. Logs 'Searching' once."
                    : "Restarts every tick. Logs 'Searching' every 500ms while walking!"}
            </p>
        </div>
    );
}
