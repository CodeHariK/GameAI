import { createSignal, onCleanup, For } from "solid-js";
import { BTNodeStatus, BTActionNode, BTConditionNode } from "../../bt/types";
import { Sequence, Selector, MemSequence } from "../../bt/composites";
import { Blackboard } from "../../common/blackboard";
import { WaitNode, Repeater } from "../../bt/decorators";

export default function ResourceGatherer() {
    const [wood, setWood] = createSignal(0);
    const [storedWood, setStoredWood] = createSignal(0);
    const [logs, setLogs] = createSignal<string[]>([]);
    const blackboard = new Blackboard();
    let currentLogNum = 0;

    const addLog = (msg: string) => {
        setLogs(prev => [`${currentLogNum++}: ${msg}`, ...prev].slice(0, 10));
    };

    // Actions
    const findTree = new BTActionNode(() => {
        addLog("Finding tree...");
        return BTNodeStatus.Success;
    });

    const chopTree = new BTActionNode((bb) => {
        addLog("Chop!");
        const currentWood = bb.get<number>("wood") || 0;
        bb.set("wood", currentWood + 1);
        setWood(currentWood + 1);
        return BTNodeStatus.Success;
    });

    const depositWood = new BTActionNode((bb) => {
        const carry = bb.get<number>("wood") || 0;
        addLog(`Depositing ${carry} wood.`);
        setStoredWood(s => s + carry);
        bb.set("wood", 0);
        setWood(0);
        return BTNodeStatus.Success;
    });

    // Conditions
    const isFull = new BTConditionNode((bb) => (bb.get<number>("wood") || 0) >= 3);

    // Tree Structure
    const gatherSequence = new MemSequence([
        findTree,
        new WaitNode(1000),
        chopTree,
        new WaitNode(1000),
        chopTree,
        new WaitNode(1000),
        chopTree
    ]);

    const depositSequence = new Sequence([
        isFull,
        new BTActionNode(() => { addLog("Inventory full! Heading home..."); return BTNodeStatus.Success; }),
        new WaitNode(1500),
        depositWood
    ]);

    // Root: If full, deposit. Otherwise, gather.
    const root = new Repeater(
        new Selector([
            depositSequence,
            gatherSequence
        ])
    );

    const interval = setInterval(() => {
        root.tick(blackboard);
    }, 500);

    onCleanup(() => clearInterval(interval));

    return (
        <div style={{ padding: "10px", color: "white" }}>
            <h2>Woodcutter AI</h2>
            <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1, background: "#1a1a1a", padding: "15px", "border-radius": "8px" }}>
                    <p>🪵 Wood Carried: <strong>{wood()} / 3</strong></p>
                    <p>🏠 Stored at Base: <strong>{storedWood()}</strong></p>
                    <progress value={wood()} max="3" style={{ width: "100%" }} />
                </div>
                <div style={{ flex: 1, background: "#000", padding: "10px", "font-family": "monospace", height: "150px", overflow: "hidden" }}>
                    <For each={logs()}>
                        {(log) => <div style={{ "font-size": "12px" }}>• {log}</div>}
                    </For>
                </div>
            </div>
            <p style={{ opacity: 0.7, "font-size": "14px", "margin-top": "15px" }}>
                This AI uses a <strong>Repeater</strong> to loop forever.
                The <strong>Selector</strong> prioritizes the <code>depositSequence</code> whenever <code>isFull</code> is true.
                Otherwise, it proceeds with the <code>MemSequence</code> gatherer loop.
            </p>
        </div>
    );
}
