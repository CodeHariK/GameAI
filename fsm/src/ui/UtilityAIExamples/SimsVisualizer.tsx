import { createSignal, onCleanup } from "solid-js";
import { UtilityEngine, type UAction } from "../../utility_ai/types";
import { Blackboard } from "../../common/blackboard";
import { ResponseCurve } from "../../common/curves";
import BrainVisualizer from "./BrainVisualizer";

export default function SimsVisualizer() {
    const [hunger, setHunger] = createSignal(50); // 0 = Full, 100 = Starving
    const [energy, setEnergy] = createSignal(100); // 0 = Exhausted, 100 = Awake
    const [boredom, setBoredom] = createSignal(20); // 0 = Entertained, 100 = Bored
    const [hygiene, setHygiene] = createSignal(80); // 0 = Dirty, 100 = Clean
    const [action, setAction] = createSignal("Idle");

    const bb = new Blackboard();

    const actions: UAction[] = [
        {
            name: "Eat Pizza",
            considerations: [
                {
                    name: "Hunger Level",
                    evaluate: (bb) => ResponseCurve.exponential(bb.get<number>("hunger") || 0, 2)
                },
                { name: "Has Food", evaluate: () => 1.0 }
            ],
            execute: () => {
                setAction("🍕 Eating Pizza...");
                setHunger(h => Math.max(0, h - 15));
            }
        },
        {
            name: "Sleep",
            considerations: [
                {
                    name: "Tiredness",
                    evaluate: (bb) => ResponseCurve.exponential(bb.get<number>("energy") || 0, 3)
                }
            ],
            execute: () => {
                setAction("😴 Sleeping...");
                setEnergy(e => Math.min(100, e + 10));
            }
        },
        {
            name: "Watch TV",
            considerations: [
                {
                    name: "Boredom",
                    evaluate: (bb) => ResponseCurve.linear(bb.get<number>("boredom") || 0)
                }
            ],
            execute: () => {
                setAction("📺 Watching TV...");
                setBoredom(b => Math.max(0, b - 10));
                setEnergy(e => Math.max(0, e - 1)); // Slightly tiring
            }
        },
        {
            name: "Take Shower",
            considerations: [
                {
                    name: "Dirtiness",
                    evaluate: (bb) => ResponseCurve.logistic(bb.get<number>("dirtiness") || 0, 10, 0.6)
                }
            ],
            execute: () => {
                setAction("🚿 Taking Shower...");
                setHygiene(h => Math.min(100, h + 20));
            }
        }
    ];

    const engine = new UtilityEngine(actions);

    // Simulation Loop
    const timer = setInterval(() => {
        // Natural decay
        setHunger(h => Math.min(100, h + 0.5));
        setEnergy(e => Math.max(0, e - 0.3));
        setBoredom(b => Math.min(100, b + 0.8));
        setHygiene(h => Math.max(0, h - 0.4));

        // Update blackboard with current values (normalized 0-1)
        bb.set("hunger", hunger() / 100);
        bb.set("energy", 1 - (energy() / 100)); // energy down = tiredness up
        bb.set("boredom", boredom() / 100);
        bb.set("dirtiness", 1 - (hygiene() / 100)); // hygiene down = dirtiness up

        engine.tick(bb);
    }, 1000);

    onCleanup(() => clearInterval(timer));

    const Progress = (props: { label: string, value: number, color: string }) => (
        <div style={{ "margin-bottom": "10px" }}>
            <div style={{ display: "flex", "justify-content": "space-between", "font-size": "14px", "margin-bottom": "4px" }}>
                <span>{props.label}</span>
                <span>{Math.round(props.value)}%</span>
            </div>
            <div style={{ background: "#333", height: "12px", "border-radius": "6px", overflow: "hidden" }}>
                <div style={{
                    background: props.color,
                    width: `${props.value}%`,
                    height: "100%",
                    transition: "width 0.3s ease"
                }} />
            </div>
        </div>
    );

    return (
        <div style={{ padding: "24px", background: "#111", color: "white", "border-radius": "12px", "max-width": "500px" }}>
            <h2 style={{ "margin-top": 0, color: "#4f46e5" }}>Sims Utility AI</h2>

            <div style={{
                background: "#1e1e1e",
                padding: "16px",
                "border-radius": "8px",
                "margin-bottom": "20px",
                border: "1px solid #333",
                "text-align": "center"
            }}>
                <div style={{ "font-size": "12px", opacity: 0.6, "margin-bottom": "4px" }}>Current Action</div>
                <div style={{ "font-size": "20px", "font-weight": "bold" }}>{action()}</div>
            </div>

            <Progress label="Hunger (Starving at 100%)" value={hunger()} color="#ef4444" />
            <Progress label="Energy (Exhausted at 0%)" value={energy()} color="#eab308" />
            <Progress label="Boredom (Bored at 100%)" value={boredom()} color="#3b82f6" />
            <Progress label="Hygiene (Dirty at 0%)" value={hygiene()} color="#10b981" />

            <div style={{ "margin-top": "24px", "font-size": "12px", opacity: 0.6, "line-height": "1.5", "margin-bottom": "20px" }}>
                <p><strong>How it works:</strong> Each action (Eating, Sleeping, etc.) has "Considerations" evaluated using Response Curves.</p>
                <p>The AI calculates a score for each action and picks the winner. Showering uses a <strong>Logistic Curve</strong>: the AI doesn't care until it gets quite dirty, then it suddenly becomes a high priority.</p>
            </div>

            <BrainVisualizer engine={engine} blackboard={bb} currentAction={action()} />
        </div>
    );
}


