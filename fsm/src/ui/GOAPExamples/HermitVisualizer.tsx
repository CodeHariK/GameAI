import { createSignal, For, Show } from "solid-js";
import type { WorldState } from "../../goap/types";
import { GOAPAction } from "../../goap/types";
import { GOAPPlanner } from "../../goap/planner";
import { GOAPAgent } from "../../goap/agent";

// --- Concrete Actions (Hermit) ---
class WorkAction extends GOAPAction {
    constructor() { super("Work for Money", 5); this.effects = { hasMoney: true }; }
    perform(state: WorldState): boolean { state.hasMoney = true; return true; }
}

class BuyFoodAction extends GOAPAction {
    constructor() {
        super("Buy Food", 1);
        this.preconditions = { hasMoney: true };
        this.effects = { hasFood: true, hasMoney: false };
    }
    perform(state: WorldState): boolean { state.hasFood = true; state.hasMoney = false; return true; }
}

class EatAction extends GOAPAction {
    constructor() {
        super("Eat Food", 1);
        this.preconditions = { hasFood: true };
        this.effects = { isFull: true, hasFood: false };
    }
    perform(state: WorldState): boolean { state.isFull = true; state.hasFood = false; return true; }
}

export default function HermitVisualizer() {
    const [worldState, setWorldState] = createSignal<WorldState>({
        hasMoney: false,
        hasFood: false,
        isFull: false
    });

    const [status, setStatus] = createSignal("Idle");
    const [currentPlan, setCurrentPlan] = createSignal<GOAPAction[]>([]);

    const actions = [new WorkAction(), new BuyFoodAction(), new EatAction()];
    const planner = new GOAPPlanner();
    const agent = new GOAPAgent(planner, actions);
    const goal = { isFull: true };

    const syncPlan = () => {
        const plan = planner.plan(worldState(), goal, actions);
        setCurrentPlan(plan || []);
    };

    // Initialize
    syncPlan();

    const executeNext = () => {
        setStatus("Thinking...");
        const prevState = { ...worldState() };
        agent.update(prevState, goal);

        setWorldState(prevState);
        syncPlan();

        if (worldState().isFull) {
            setStatus("Goal Achieved! (Happy & Full)");
        } else {
            setStatus("Wait...");
        }
    };

    const reset = () => {
        setWorldState({ hasMoney: false, hasFood: false, isFull: false });
        syncPlan();
        setStatus("World Reset.");
    };

    return (
        <div style={{ background: "#1e293b", padding: "24px", "border-radius": "12px", border: "1px solid #334155" }}>
            <div style={{ display: "grid", "grid-template-columns": "1fr 300px", gap: "24px" }}>
                <div>
                    <div style={{ background: "#0f172a", padding: "40px", "border-radius": "8px", "margin-bottom": "20px", border: "1px solid #334155" }}>
                        <div style={{ display: "flex", "justify-content": "center", "align-items": "center", gap: "40px" }}>
                            {/* Hermit */}
                            <div style={{ "text-align": "center" }}>
                                <div style={{ "font-size": "64px" }}>{worldState().isFull ? "😌" : "😫"}</div>
                                <div style={{ "font-size": "14px", "margin-top": "8px", color: "#38bdf8" }}>The Hermit</div>
                            </div>

                            {/* Inventory */}
                            <div style={{ display: "flex", gap: "20px", background: "#1e293b", padding: "15px", "border-radius": "12px" }}>
                                <div style={{ opacity: worldState().hasMoney ? 1 : 0.2, "font-size": "32px" }} title="Money">💰</div>
                                <div style={{ opacity: worldState().hasFood ? 1 : 0.2, "font-size": "32px" }} title="Food">🍎</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", "align-items": "center" }}>
                        <button
                            onClick={executeNext}
                            disabled={currentPlan().length === 0}
                            style={{ background: "#10b981", color: "white", padding: "12px 24px", border: "none", "border-radius": "6px", cursor: "pointer", opacity: currentPlan().length === 0 ? 0.5 : 1 }}>
                            Step Plan
                        </button>
                        <button
                            onClick={reset}
                            style={{ background: "#475569", color: "white", padding: "12px 24px", border: "none", "border-radius": "6px", cursor: "pointer" }}>
                            Reset
                        </button>
                        <span style={{ "font-size": "14px", color: "#94a3b8", "margin-left": "auto" }}>Status: {status()}</span>
                    </div>

                    <div style={{ "margin-top": "30px" }}>
                        <h4 style={{ color: "#94a3b8", "margin-bottom": "12px" }}>Dynamic Plan (A*):</h4>
                        <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
                            <For each={currentPlan()} fallback={<div style={{ opacity: 0.3 }}>Planning...</div>}>
                                {(action, i) => (
                                    <>
                                        <div style={{ background: "#065f46", padding: "8px 12px", "border-radius": "4px", "font-size": "13px" }}>
                                            {action.name}
                                        </div>
                                        <Show when={i() < currentPlan().length - 1}>
                                            <span style={{ opacity: 0.5 }}>→</span>
                                        </Show>
                                    </>
                                )}
                            </For>
                        </div>
                    </div>
                </div>

                <aside style={{ background: "#0f172a", padding: "20px", "border-radius": "8px", border: "1px solid #334155" }}>
                    <h4 style={{ "margin-top": 0, "font-size": "14px", color: "#10b981" }}>State Memory</h4>
                    <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
                        <For each={Object.entries(worldState())}>
                            {([key, val]) => (
                                <div style={{ display: "flex", "justify-content": "space-between", "font-size": "13px" }}>
                                    <span style={{ opacity: 0.7 }}>{key}</span>
                                    <span style={{ color: val ? "#10b981" : "#ef4444" }}>{String(val)}</span>
                                </div>
                            )}
                        </For>
                    </div>
                    <div style={{ "margin-top": "30px", "font-size": "11px", opacity: 0.5, "line-height": "1.5" }}>
                        The Agent uses the Planner to find the sequence: <b>Work → Buy → Eat</b>. If you give it food manually, it will skip the first steps!
                    </div>
                </aside>
            </div>
        </div>
    );
}
