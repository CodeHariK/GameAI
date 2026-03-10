import { createSignal, onCleanup, For, Show } from "solid-js";
import { DirectorAI, DirectorStateValues, type DirectorState, type PlayerStats } from "../../director/engine";

export default function DirectorDashboard() {
    const director = new DirectorAI();

    // Player Stats (Modified by Sliders for Demo)
    const [health, setHealth] = createSignal(100);
    const [ammo, setAmmo] = createSignal(10);
    const [proximity, setProximity] = createSignal(0);

    // Director State
    const [stress, setStress] = createSignal(0);
    const [state, setState] = createSignal<DirectorState>(DirectorStateValues.BuildUp);
    const [actionsHistory, setActionsHistory] = createSignal<{ time: string; msg: string; type: string }[]>([]);
    const [history, setHistory] = createSignal(director.getHistory());

    const addLog = (msg: string, type: string) => {
        setActionsHistory(prev => [{ time: new Date().toLocaleTimeString().split(" ")[0], msg, type }, ...prev].slice(0, 5));
    };

    // Simulation Loop
    const timer = setInterval(() => {
        const stats: PlayerStats = {
            health: health(),
            ammo: ammo(),
            enemyProximity: proximity(),
            lastCombatTime: 0 // Simplification for demo
        };

        const newActions = director.update(stats);

        setStress(director.getStress());
        setState(director.getState());
        setHistory([...director.getHistory()]);

        newActions.forEach(action => {
            switch (action.type) {
                case "SPAWN_HORDE": addLog("⚠️ DIRECTOR: SPANWING HORDE!", "danger"); break;
                case "SPAWN_SCOUT": addLog("👀 DIRECTOR: Spawning Scout", "warning"); break;
                case "DROP_LOOT": addLog(`🎁 DIRECTOR: Dropping ${action.item}`, "success"); break;
                case "PLAY_MUSIC": addLog(`🎵 MUSIC: Switching to ${action.intensity} intensity`, "info"); break;
            }
        });
    }, 200);

    onCleanup(() => clearInterval(timer));

    const stateColors = {
        [DirectorStateValues.BuildUp]: "#fbbf24",
        [DirectorStateValues.Peak]: "#ef4444",
        [DirectorStateValues.Relax]: "#10b981"
    };

    const stateLabels = {
        [DirectorStateValues.BuildUp]: "BUILD-UP (Increasing Tension)",
        [DirectorStateValues.Peak]: "PEAK (Full Intensity)",
        [DirectorStateValues.Relax]: "RELAX (Breather / Looting)"
    };

    return (
        <div style={{ background: "#0f172a", padding: "24px", "border-radius": "12px", border: "1px solid #334155", color: "#f8fafc" }}>
            <div style={{ "margin-bottom": "24px" }}>
                <h2 style={{ margin: 0, "font-size": "1.5rem", color: "#38bdf8" }}>The Director Dashboard</h2>
                <p style={{ opacity: 0.6, "font-size": "14px" }}>Omniscient management of the player's emotional journey.</p>
            </div>

            <div style={{ display: "grid", "grid-template-columns": "1fr 340px", gap: "24px" }}>
                {/* Left: The Graph */}
                <div style={{ background: "#1e293b", padding: "20px", "border-radius": "8px", border: "1px solid #334155" }}>
                    <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "20px" }}>
                        <h4 style={{ margin: 0, color: "#94a3b8" }}>Pacing Intensity Curve</h4>
                        <div style={{ display: "flex", gap: "10px", "font-size": "12px" }}>
                            <div style={{ display: "flex", "align-items": "center", gap: "5px" }}>
                                <div style={{ width: "10px", height: "10px", background: "#ef4444", "border-radius": "2px" }}></div> Stress
                            </div>
                        </div>
                    </div>

                    {/* SVG Graph Placeholder for visualizing stress history */}
                    <div style={{ height: "200px", background: "#0f172a", "border-radius": "4px", position: "relative", overflow: "hidden", border: "1px solid #334155" }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polyline
                                fill="none"
                                stroke="#ef4444"
                                stroke-width="2"
                                points={history().map((p, i) => `${i * (100 / Math.max(history().length - 1, 1))},${100 - p.stress}`).join(" ")}
                                style={{ transition: "all 0.1s linear" }}
                            />
                        </svg>

                        {/* Current Stress Indicator */}
                        <div style={{
                            position: "absolute",
                            right: "10px",
                            top: `${100 - stress()}%`,
                            transform: "translateY(-50%)",
                            background: "#ef4444",
                            padding: "2px 6px",
                            "border-radius": "4px",
                            "font-size": "10px",
                            "font-weight": "bold"
                        }}>
                            {Math.round(stress())}%
                        </div>
                    </div>

                    <div style={{ "margin-top": "24px" }}>
                        <h4 style={{ color: "#94a3b8", "margin-bottom": "16px" }}>Director State: <span style={{ color: stateColors[state()] }}>{stateLabels[state()]}</span></h4>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <div style={{
                                flex: 1, height: "8px", "border-radius": "4px",
                                background: state() === DirectorStateValues.BuildUp ? stateColors[DirectorStateValues.BuildUp] : "#334155"
                            }}></div>
                            <div style={{
                                flex: 1, height: "8px", "border-radius": "4px",
                                background: state() === DirectorStateValues.Peak ? stateColors[DirectorStateValues.Peak] : "#334155"
                            }}></div>
                            <div style={{
                                flex: 1, height: "8px", "border-radius": "4px",
                                background: state() === DirectorStateValues.Relax ? stateColors[DirectorStateValues.Relax] : "#334155"
                            }}></div>
                        </div>
                    </div>
                </div>

                {/* Right: Controls & Logs */}
                <div style={{ display: "flex", "flex-direction": "column", gap: "24px" }}>
                    <div style={{ background: "#1e293b", padding: "20px", "border-radius": "8px", border: "1px solid #334155" }}>
                        <h4 style={{ margin: "0 0 16px 0", color: "#94a3b8", "font-size": "14px" }}>Inject Player Stats</h4>

                        <div style={{ "margin-bottom": "15px" }}>
                            <div style={{ display: "flex", "justify-content": "space-between", "font-size": "12px", "margin-bottom": "5px" }}>
                                <span>Health</span>
                                <span style={{ color: health() < 30 ? "#ef4444" : "#10b981" }}>{health()}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={health()} onInput={(e) => setHealth(parseInt(e.currentTarget.value))} style={{ width: "100%", "accent-color": "#ef4444" }} />
                        </div>

                        <div style={{ "margin-bottom": "15px" }}>
                            <div style={{ display: "flex", "justify-content": "space-between", "font-size": "12px", "margin-bottom": "5px" }}>
                                <span>Ammo</span>
                                <span style={{ color: ammo() < 3 ? "#ef4444" : "#38bdf8" }}>{ammo()}</span>
                            </div>
                            <input type="range" min="0" max="20" value={ammo()} onInput={(e) => setAmmo(parseInt(e.currentTarget.value))} style={{ width: "100%", "accent-color": "#38bdf8" }} />
                        </div>

                        <div>
                            <div style={{ display: "flex", "justify-content": "space-between", "font-size": "12px", "margin-bottom": "5px" }}>
                                <span>Threat Proximity</span>
                                <span style={{ color: proximity() > 0.7 ? "#ef4444" : "#94a3b8" }}>{Math.round(proximity() * 100)}%</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.1" value={proximity()} onInput={(e) => setProximity(parseFloat(e.currentTarget.value))} style={{ width: "100%", "accent-color": "#fbbf24" }} />
                        </div>
                    </div>

                    <div style={{ background: "#1e293b", padding: "20px", "border-radius": "8px", border: "1px solid #334155", flex: 1 }}>
                        <h4 style={{ margin: "0 0 16px 0", color: "#94a3b8", "font-size": "14px" }}>Director Logs</h4>
                        <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
                            <For each={actionsHistory()}>
                                {(log) => (
                                    <div style={{
                                        "font-size": "11px",
                                        padding: "8px",
                                        background: "#0f172a",
                                        "border-left": `3px solid ${log.type === 'danger' ? '#ef4444' : log.type === 'warning' ? '#fbbf24' : log.type === 'success' ? '#10b981' : '#38bdf8'}`,
                                        "border-radius": "2px"
                                    }}>
                                        <span style={{ opacity: 0.4, "margin-right": "8px" }}>{log.time}</span>
                                        {log.msg}
                                    </div>
                                )}
                            </For>
                            <Show when={actionsHistory().length === 0}>
                                <div style={{ opacity: 0.3, "font-size": "11px", "text-align": "center", "margin-top": "20px" }}>Watching player...</div>
                            </Show>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ "margin-top": "24px", padding: "16px", background: "rgba(56, 189, 248, 0.05)", "border-radius": "8px", border: "1px dashed #334155", "font-size": "13px", "line-height": "1.6" }}>
                <p style={{ margin: 0 }}>
                    <strong style={{ color: "#38bdf8" }}>Theory:</strong> A high-level <b>Director AI</b> doesn't care about killing the player. It cares about <b>Emotional Flow</b>.
                    If stress is too high for too long, it triggers the <b>RELAX</b> state (spawning health packs).
                    If the player is coasting (low stress), it pushes <b>BUILD-UP</b> to keep them engaged.
                </p>
            </div>
        </div>
    );
}
