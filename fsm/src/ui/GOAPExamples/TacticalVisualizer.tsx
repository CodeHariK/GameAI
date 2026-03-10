import { createSignal, For, Show } from "solid-js";
import type { WorldState } from "../../goap/types";
import { GOAPAction } from "../../goap/types";
import { GOAPPlanner } from "../../goap/planner";
import { GOAPAgent } from "../../goap/agent";

// --- Concrete Actions (Tactical) ---

class ShootAction extends GOAPAction {
    constructor() {
        super("Shoot Enemy", 1);
        this.preconditions = { hasGun: true, isLoaded: true, enemyInRange: true };
        this.effects = { enemyDead: true };
    }
    perform(state: WorldState): boolean {
        state.isLoaded = false;
        state.enemyDead = true;
        return true;
    }
}

class LoadGunAction extends GOAPAction {
    constructor() {
        super("Load Gun", 1);
        this.preconditions = { hasGun: true, hasAmmo: true, isLoaded: false };
        this.effects = { isLoaded: true };
    }
    perform(state: WorldState): boolean {
        state.hasAmmo = false;
        state.isLoaded = true;
        return true;
    }
}

class PickUpGunAction extends GOAPAction {
    constructor() {
        super("Pick Up Gun", 2);
        this.preconditions = { gunOnGround: true, hasGun: false };
        this.effects = { hasGun: true, gunOnGround: false };
    }
    perform(state: WorldState): boolean {
        state.hasGun = true;
        state.gunOnGround = false;
        return true;
    }
}

class FindAmmoAction extends GOAPAction {
    constructor() {
        super("Scavenge Ammo", 5);
        this.effects = { hasAmmo: true };
    }
    perform(state: WorldState): boolean {
        state.hasAmmo = true;
        return true;
    }
}

class ApproachAction extends GOAPAction {
    constructor() {
        super("Approach Enemy", 3);
        this.preconditions = { enemyInRange: false };
        this.effects = { enemyInRange: true };
    }
    perform(state: WorldState): boolean {
        state.enemyInRange = true;
        return true;
    }
}

export default function TacticalVisualizer() {
    const [worldState, setWorldState] = createSignal<WorldState>({
        hasGun: false,
        gunOnGround: true,
        isLoaded: false,
        hasAmmo: false,
        enemyInRange: false,
        enemyDead: false
    });

    const [status, setStatus] = createSignal("Idle");
    const [currentPlan, setCurrentPlan] = createSignal<GOAPAction[]>([]);

    const actions = [
        new ShootAction(),
        new LoadGunAction(),
        new PickUpGunAction(),
        new FindAmmoAction(),
        new ApproachAction()
    ];

    const planner = new GOAPPlanner();
    const agent = new GOAPAgent(planner, actions);
    const goal = { enemyDead: true };

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

        if (worldState().enemyDead) {
            setStatus("Enemy Neutralized!");
        } else {
            setStatus("Wait...");
        }
    };

    const reset = () => {
        setWorldState({
            hasGun: false,
            gunOnGround: true,
            isLoaded: false,
            hasAmmo: false,
            enemyInRange: false,
            enemyDead: false
        });
        syncPlan();
        setStatus("Reset.");
    };

    return (
        <div style={{ background: "#0f172a", padding: "24px", "border-radius": "12px", border: "1px solid #334155" }}>
            <div style={{ display: "grid", "grid-template-columns": "1fr 300px", gap: "24px" }}>
                <div>
                    <div style={{ background: "#1e293b", padding: "40px", "border-radius": "8px", "margin-bottom": "20px", border: "1px solid #334155" }}>
                        <div style={{ display: "flex", "justify-content": "space-around", "align-items": "center", height: "120px" }}>
                            {/* NPC */}
                            <div style={{ "text-align": "center" }}>
                                <div style={{ "font-size": "56px" }}>{worldState().enemyDead ? "😎" : "🔫"}</div>
                                <div style={{ "font-size": "14px", "margin-top": "8px", color: "#38bdf8" }}>The Commando</div>
                            </div>

                            {/* Battlefield Items */}
                            <div style={{ display: "flex", gap: "25px" }}>
                                <Show when={worldState().gunOnGround}>
                                    <div style={{ "font-size": "32px", filter: "drop-shadow(0 0 10px rgba(56, 189, 248, 0.4))" }}>�</div>
                                </Show>
                                <Show when={!worldState().enemyDead}>
                                    <div style={{
                                        "font-size": "56px",
                                        transform: worldState().enemyInRange ? "scale(1.3)" : "scale(1)",
                                        filter: worldState().enemyInRange ? "none" : "grayscale(0.6)",
                                        transition: "all 0.3s ease"
                                    }}>👿</div>
                                </Show>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", "align-items": "center" }}>
                        <button
                            onClick={executeNext}
                            disabled={currentPlan().length === 0}
                            style={{ background: "#38bdf8", color: "#0f172a", "font-weight": "bold", padding: "12px 24px", border: "none", "border-radius": "6px", cursor: "pointer", opacity: currentPlan().length === 0 ? 0.5 : 1 }}>
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
                        <h4 style={{ color: "#94a3b8", "margin-bottom": "12px" }}>Strategic A* Plan</h4>
                        <div style={{ display: "flex", "align-items": "center", gap: "12px", "flex-wrap": "wrap" }}>
                            <For each={currentPlan()} fallback={<div style={{ opacity: 0.3 }}>Planning...</div>}>
                                {(action, i) => (
                                    <>
                                        <div style={{ background: "#1e3a8a", padding: "8px 12px", "border-radius": "4px", "font-size": "13px", border: "1px solid #3b82f6" }}>
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

                <aside style={{ background: "#1e293b", padding: "20px", "border-radius": "8px", border: "1px solid #334155" }}>
                    <h4 style={{ "margin-top": 0, "font-size": "14px", color: "#38bdf8" }}>Battlefield State</h4>
                    <div style={{ display: "flex", "flex-direction": "column", gap: "10px" }}>
                        <For each={Object.entries(worldState())}>
                            {([key, val]) => (
                                <div style={{ display: "flex", "justify-content": "space-between", "font-size": "12px", padding: "4px 0", "border-bottom": "1px solid #334155" }}>
                                    <span style={{ opacity: 0.7 }}>{key}</span>
                                    <span style={{ color: val ? "#10b981" : "#ef4444", "font-weight": "bold" }}>{String(val)}</span>
                                </div>
                            )}
                        </For>
                    </div>
                    <div style={{ "margin-top": "24px", padding: "12px", background: "rgba(56, 189, 248, 0.05)", "border-radius": "6px", "font-size": "11px", "line-height": "1.5" }}>
                        <b>Dynamic Fallback:</b> If you reach "Enemy Dead" by manually jumping to a state, the planner clears. A* will prioritize the lowest "cost" path.
                    </div>
                </aside>
            </div>
        </div>
    );
}
