import { createSignal, onCleanup, For, Show } from "solid-js";
import { SquadCommander, SquadAction } from "../../squad/commander";
import { SquadRoleValues, type SquadMember } from "../../squad/types";
import { TacticalPositionProvider } from "../../squad/tpp";

export default function SquadVisualizer() {
    const tpp = new TacticalPositionProvider(400, 300);
    const commander = new SquadCommander();

    const [playerPos, setPlayerPos] = createSignal({ x: 300, y: 150 });
    const [members, setMembers] = createSignal<SquadMember[]>([
        { id: "1", role: SquadRoleValues.Idle, position: { x: 50, y: 50 }, health: 100, ammo: 10, agent: {} as any },
        { id: "2", role: SquadRoleValues.Idle, position: { x: 50, y: 250 }, health: 100, ammo: 10, agent: {} as any }
    ]);

    const [currentPlan, setCurrentPlan] = createSignal<SquadAction[]>([]);

    // Simulation Loop
    const timer = setInterval(() => {
        const currentMembers = members();
        const pPos = playerPos();

        // 1. Update World State for Commander (including tactical proximity)
        const dist0 = Math.sqrt((currentMembers[0].position.x - pPos.x) ** 2 + (currentMembers[0].position.y - pPos.y) ** 2);
        const dist1 = Math.sqrt((currentMembers[1].position.x - pPos.x) ** 2 + (currentMembers[1].position.y - pPos.y) ** 2);

        const inPosition = dist0 < 250 && dist1 < 250;

        const worldState = {
            member_0_alive: currentMembers[0].health > 0,
            member_1_alive: currentMembers[1].health > 0,
            inPosition: inPosition,
            members: currentMembers
        };

        // 2. Commander Plans
        const plan = commander.plan(worldState, { targetEliminated: true });
        setCurrentPlan(plan);

        // 3. EXECUTE: Perform the first action in the plan to set roles
        if (plan && plan.length > 0) {
            plan[0].perform(worldState);
        }

        // 4. Members Execute Roles (Movement)
        const nextMembers = currentMembers.map((m) => {
            const nextPos = { ...m.position };

            if (m.role === SquadRoleValues.Suppress) {
                // Move to a good suppression spot (stay at distance)
                const best = tpp.getBestPosition(pPos, currentMembers.filter(o => o.id !== m.id).map(o => o.position), 150);
                nextPos.x += (best.x - m.position.x) * 0.05;
                nextPos.y += (best.y - m.position.y) * 0.05;
            } else if (m.role === SquadRoleValues.Flank) {
                // Move to a flanking position (90 degrees to suppressor)
                const suppressor = currentMembers.find(o => o.role === SquadRoleValues.Suppress) || { position: { x: 0, y: 150 } };
                const toPlayer = { x: pPos.x - suppressor.position.x, y: pPos.y - suppressor.position.y };
                const length = Math.sqrt(toPlayer.x ** 2 + toPlayer.y ** 2);
                const norm = { x: toPlayer.x / length, y: toPlayer.y / length };

                // Flank position is perpendicular
                const flankPos = {
                    x: pPos.x + (-norm.y * 100),
                    y: pPos.y + (norm.x * 100)
                };

                nextPos.x += (flankPos.x - m.position.x) * 0.05;
                nextPos.y += (flankPos.y - m.position.y) * 0.05;
            }

            return { ...m, position: nextPos };
        });

        setMembers(nextMembers);
    }, 100);

    onCleanup(() => clearInterval(timer));

    return (
        <div style={{ background: "#0f172a", padding: "24px", "border-radius": "12px", border: "1px solid #334155", color: "#f8fafc" }}>
            <div style={{ "margin-bottom": "24px" }}>
                <h2 style={{ margin: 0, "font-size": "1.5rem", color: "#38bdf8" }}>Squad Tactical Overview</h2>
                <p style={{ opacity: 0.6, "font-size": "14px" }}>Coordinated intelligence in action (Suppress & Flank).</p>
            </div>

            <div style={{ display: "grid", "grid-template-columns": "1fr 300px", gap: "24px" }}>
                {/* Tactical Map */}
                <div style={{
                    position: "relative",
                    width: "400px",
                    height: "300px",
                    background: "#1e293b",
                    "border-radius": "8px",
                    border: "2px solid #334155",
                    overflow: "hidden"
                }}
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setPlayerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }}>
                    {/* Tactical Lines */}
                    <svg width="400" height="300" style={{ position: "absolute", top: 0, left: 0 }}>
                        <For each={members()}>
                            {(m) => (
                                <Show when={m.role !== SquadRoleValues.Idle}>
                                    <line
                                        x1={m.position.x} y1={m.position.y}
                                        x2={playerPos().x} y2={playerPos().y}
                                        stroke={m.role === SquadRoleValues.Suppress ? "#ef4444" : "#38bdf8"}
                                        stroke-width="1"
                                        stroke-dasharray="4"
                                        opacity="0.4"
                                    />
                                </Show>
                            )}
                        </For>
                    </svg>

                    {/* Members */}
                    <For each={members()}>
                        {(m) => (
                            <div style={{
                                position: "absolute",
                                left: `${m.position.x - 10}px`,
                                top: `${m.position.y - 10}px`,
                                width: "20px",
                                height: "20px",
                                background: m.role === SquadRoleValues.Suppress ? "#ef4444" : m.role === SquadRoleValues.Flank ? "#38bdf8" : "#94a3b8",
                                "border-radius": "50%",
                                border: "2px solid white",
                                transition: "all 0.1s linear",
                                display: "flex",
                                "align-items": "center",
                                "justify-content": "center",
                                "font-size": "8px",
                                "font-weight": "bold",
                                color: "white"
                            }}>
                                {m.id}
                            </div>
                        )}
                    </For>

                    {/* Player */}
                    <div style={{
                        position: "absolute",
                        left: `${playerPos().x - 12}px`,
                        top: `${playerPos().y - 12}px`,
                        width: "24px",
                        height: "24px",
                        background: "white",
                        "border-radius": "4px",
                        border: "2px solid #ef4444",
                        display: "flex",
                        "align-items": "center",
                        "justify-content": "center",
                        color: "#ef4444",
                        "font-size": "10px",
                        "font-weight": "bold"
                    }}>
                        P
                    </div>
                </div>

                {/* Tactical Data */}
                <div style={{ display: "flex", "flex-direction": "column", gap: "16px" }}>
                    <div style={{ background: "#1e293b", padding: "16px", "border-radius": "8px", border: "1px solid #334155" }}>
                        <h4 style={{ margin: "0 0 12px 0", color: "#94a3b8", "font-size": "14px" }}>Squad Roles</h4>
                        <For each={members()}>
                            {(m) => (
                                <div style={{ display: "flex", "justify-content": "space-between", "font-size": "12px", "margin-bottom": "8px" }}>
                                    <span>Unit {m.id}</span>
                                    <span style={{
                                        color: m.role === SquadRoleValues.Suppress ? "#ef4444" : m.role === SquadRoleValues.Flank ? "#38bdf8" : "#94a3b8",
                                        "font-weight": "bold"
                                    }}>{m.role}</span>
                                </div>
                            )}
                        </For>
                    </div>

                    <div style={{ background: "#1e293b", padding: "16px", "border-radius": "8px", border: "1px solid #334155", flex: 1 }}>
                        <h4 style={{ margin: "0 0 12px 0", color: "#94a3b8", "font-size": "14px" }}>Squad Goal</h4>
                        <div style={{
                            "font-size": "11px",
                            padding: "8px",
                            background: "#0f172a",
                            color: "#10b981",
                            "border-radius": "4px",
                            "font-family": "monospace"
                        }}>
                            GOAL: Target Eliminated<br />
                            PLAN: {currentPlan().map(a => a.name).join(" -> ") || "Re-calculating..."}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ "margin-top": "24px", padding: "16px", background: "rgba(56, 189, 248, 0.05)", "border-radius": "8px", border: "1px dashed #334155", "font-size": "13px", "line-height": "1.6" }}>
                <p style={{ margin: 0 }}>
                    <strong style={{ color: "#38bdf8" }}>Tactical Note:</strong> Move your mouse over the map to simulate player movement. Watch as Unit 1 (Suppressor) tries to maintain distance while Unit 2 (Flanker) maneuvers to create a 90° crossfire. This logic is managed by a <b>High-Level Squad Planner</b>.
                </p>
            </div>
        </div>
    );
}
