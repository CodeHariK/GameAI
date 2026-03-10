import { createSignal, onCleanup, For } from "solid-js";
import { Blackboard } from "../../common/blackboard";
import { HybridAI } from "../../utility_ai/hybrid_ai";
import { UtilityEngine, type UAction } from "../../utility_ai/types";
import { BTNodeStatus, BTActionNode, BTConditionNode } from "../../bt/types";
import { Sequence, Selector } from "../../bt/composites";
import { ResponseCurve } from "../../common/curves";
import BrainVisualizer from "./BrainVisualizer";
import { WaitNode } from "../../bt/decorators";

export default function HybridAIVisualizer() {
    const [status, setStatus] = createSignal("Idle");
    const [btLog, setBTLog] = createSignal<string[]>([]);
    const [rangerPos, setRangerPos] = createSignal(0); // 0 to 100
    const [energy, setEnergy] = createSignal(100);
    const [suspicion, setSuspicion] = createSignal(0);
    const [isNight] = createSignal(false);

    const bb = new Blackboard();

    const addLog = (msg: string) => {
        setBTLog(prev => [msg, ...prev.slice(0, 4)]);
    };

    // --- Behavior Tree Nodes ---

    // Patrol Sequence
    const patrolNode = new Sequence([
        new BTActionNode((_bb) => {
            // Initialize target if it doesn't exist
            if (!_bb.has("patrolTarget")) _bb.set("patrolTarget", 100);

            const pos = rangerPos();
            const target = _bb.get<number>("patrolTarget")!;

            // Use a small threshold (e.g., 2) because we move in steps of 2
            if (Math.abs(pos - target) <= 2) {
                const nextTarget = target === 100 ? 0 : 100;
                _bb.set("patrolTarget", nextTarget);
                addLog(`📍 Turning around to head to ${nextTarget}`);
                return BTNodeStatus.Success;
            }

            const dir = target > pos ? 1 : -1;
            setRangerPos(p => p + dir * 2);
            _bb.set("pos", rangerPos());
            return BTNodeStatus.Running;
        })
    ]);

    // Investigate Sequence (with a "Do Once" check)
    const investigateNode = new Sequence([
        new BTActionNode((_bb) => {
            // Only log once per investigation
            if (!_bb.get("isInvestigating")) {
                addLog("🔦 Checking suspicious area...");
                _bb.set("isInvestigating", true);
            }
            return BTNodeStatus.Running;
        }),
        // Use our WaitNode to actually spend time investigating!
        new WaitNode(2000),
        new BTActionNode((_bb) => {
            setSuspicion(s => Math.max(0, s - 20));
            _bb.remove("isInvestigating"); // Reset for next time
            addLog("✅ Area clear. Resuming.");
            return BTNodeStatus.Success;
        })
    ]);

    // Rest Sequence
    const restNode = new Sequence([
        new BTActionNode((_bb) => {
            addLog("☕ Resting at camp...");
            setEnergy(e => Math.min(100, e + 5));
            if (energy() >= 100) return BTNodeStatus.Success;
            return BTNodeStatus.Running;
        })
    ]);

    // Root BT: Switches based on 'goal' set by Utility Engine
    const rootBT = new Selector([
        new Sequence([
            new BTConditionNode((bb) => bb.get("currentGoal") === "Investigate"),
            investigateNode
        ]),
        new Sequence([
            new BTConditionNode((bb) => bb.get("currentGoal") === "Rest"),
            restNode
        ]),
        patrolNode // Default fallback
    ]);

    // --- Utility Actions ---
    const actions: UAction[] = [
        {
            name: "Patrol Forest",
            goal: "Patrol",
            considerations: [
                { name: "Always Possible", evaluate: () => 0.5 }
            ],
            execute: () => setStatus("🛡️ Patroling")
        },
        {
            name: "Investigate Noise",
            goal: "Investigate",
            considerations: [
                {
                    name: "Suspicion Level",
                    weight: 1.0, // Mandatory
                    evaluate: (bb) => ResponseCurve.exponential(bb.get<number>("suspicion") || 0, 2)
                },
                {
                    name: "Night Multiplier",
                    weight: 0.4, // Soft influence: doesn't zero out the score
                    evaluate: (bb) => bb.get<boolean>("isNight") ? 1.0 : 0.6
                }
            ],
            execute: () => setStatus("🕵️ Investigating")
        },
        {
            name: "Go to Rest",
            goal: "Rest",
            considerations: [
                {
                    name: "Exhaustion",
                    weight: 0.8,
                    evaluate: (bb) => 1 - (bb.get<number>("energy") || 0) / 100
                }
            ],
            execute: () => setStatus("🛌 Resting")
        }
    ];

    const engine = new UtilityEngine(actions);
    const hybrid = new HybridAI(engine, rootBT, bb, 1000); // Think every 1s

    // Simulation Loop (Higher frequency for tactical acting)
    const TICK_RATE = 100;
    const timer = setInterval(() => {
        // Natural state changes
        setEnergy(e => Math.max(0, e - 0.1));
        if (Math.random() < 0.05) setSuspicion(s => Math.min(100, s + 30));

        // Update Blackboard
        bb.set("pos", rangerPos());
        bb.set("energy", energy());
        bb.set("suspicion", suspicion() / 100);
        bb.set("isNight", isNight());

        hybrid.tick(TICK_RATE);
    }, TICK_RATE);

    onCleanup(() => clearInterval(timer));

    return (
        <div style={{ display: "grid", "grid-template-columns": "1fr 400px", gap: "24px", padding: "24px", background: "#111", color: "white", "border-radius": "12px" }}>
            <div>
                <h2 style={{ "margin-top": 0, color: "#4f46e5" }}>Forest Ranger (Hybrid AI)</h2>

                {/* World View */}
                <div style={{
                    background: "#064e3b",
                    height: "100px",
                    "border-radius": "8px",
                    position: "relative",
                    "margin-bottom": "20px",
                    border: "4px solid #065f46",
                    overflow: "hidden"
                }}>
                    <div style={{
                        position: "absolute",
                        left: `${rangerPos()}%`,
                        bottom: "10px",
                        transition: "left 0.5s linear",
                        "font-size": "32px",
                        transform: "translateX(-50%)"
                    }}>
                        {energy() < 20 ? "😫" : suspicion() > 50 ? "🔦" : "🚶"}
                    </div>
                    {/* Camp */}
                    <div style={{ position: "absolute", left: "0", bottom: "10px", "font-size": "24px" }}>⛺</div>
                    {/* Suspicious Bush */}
                    <div style={{ position: "absolute", right: "20%", bottom: "10px", "font-size": "24px", opacity: suspicion() > 0 ? 1 : 0.3 }}>🌳</div>
                </div>

                <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "10px", "margin-bottom": "20px" }}>
                    <div style={{ background: "#1e1e1e", padding: "12px", "border-radius": "8px", border: "1px solid #333" }}>
                        <div style={{ "font-size": "12px", opacity: 0.6 }}>High-Level Goal (Utility)</div>
                        <div style={{ "font-size": "18px", "font-weight": "bold", color: "#fbbf24" }}>{bb.get("currentGoal") || "None"}</div>
                    </div>
                    <div style={{ background: "#1e1e1e", padding: "12px", "border-radius": "8px", border: "1px solid #333" }}>
                        <div style={{ "font-size": "12px", opacity: 0.6 }}>Tactical Status (BT)</div>
                        <div style={{ "font-size": "18px", "font-weight": "bold", color: "#60a5fa" }}>{status()}</div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: "20px", "margin-bottom": "20px" }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ "font-size": "12px", "margin-bottom": "4px" }}>Energy</div>
                        <div style={{ background: "#333", height: "8px", "border-radius": "4px" }}>
                            <div style={{ background: "#eab308", width: `${energy()}%`, height: "100%", "border-radius": "4px" }} />
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ "font-size": "12px", "margin-bottom": "4px" }}>Suspicion ({Math.round(suspicion())}%)</div>
                        <div style={{ background: "#333", height: "8px", "border-radius": "4px" }}>
                            <div style={{ background: "#ef4444", width: `${suspicion()}%`, height: "100%", "border-radius": "4px" }} />
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setSuspicion(100)}
                    style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 16px", "border-radius": "4px", cursor: "pointer" }}
                >
                    🔊 Trigger Noise
                </button>

                {/* BT Log */}
                <div style={{ "margin-top": "24px" }}>
                    <h4 style={{ "margin": "0 0 10px 0", "font-size": "14px", opacity: 0.8 }}>BT Execution Log</h4>
                    <div style={{ background: "#000", padding: "10px", "border-radius": "8px", "font-family": "monospace", "font-size": "12px", height: "100px" }}>
                        <For each={btLog()}>
                            {(log) => <div style={{ "margin-bottom": "4px" }}>{log}</div>}
                        </For>
                    </div>
                </div>
            </div>

            <aside>
                <BrainVisualizer engine={engine} blackboard={bb} currentAction={status()} />

                <div style={{
                    "margin-top": "20px",
                    padding: "16px",
                    background: "rgba(79, 70, 229, 0.1)",
                    border: "1px solid rgba(79, 70, 229, 0.3)",
                    "border-radius": "8px",
                    "font-size": "12px",
                    "line-height": "1.6"
                }}>
                    <h4 style={{ "margin-top": 0 }}>Hybrid AI Architecture</h4>
                    <p><b>Utility Engine:</b> Selects the high-level <i>Desire</i> (Goal) based on world state.</p>
                    <p><b>Behavior Tree:</b> Executes the complex, multi-step <i>Plan</i> to achieve that Goal.</p>
                </div>
            </aside>
        </div>
    );
}
