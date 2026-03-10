export type DirectorState = "BuildUp" | "Peak" | "Relax";

export const DirectorStateValues = {
    BuildUp: "BuildUp" as DirectorState,
    Peak: "Peak" as DirectorState,
    Relax: "Relax" as DirectorState,
};

export interface PlayerStats {
    health: number;
    ammo: number;
    enemyProximity: number; // 0 (far) to 1 (touching)
    lastCombatTime: number; // Seconds since last shot/hit
}

export type DirectorAction =
    | { type: "SPAWN_SCOUT" }
    | { type: "SPAWN_HORDE" }
    | { type: "DROP_LOOT", item: "Health" | "Ammo" }
    | { type: "PLAY_MUSIC", intensity: "low" | "high" | "ambient" };

export class DirectorAI {
    private stress: number = 0;
    private state: DirectorState = DirectorStateValues.BuildUp;
    private stateHistory: { time: number; stress: number; state: DirectorState }[] = [];
    private startTime: number = Date.now();

    constructor() { }

    /**
     * Updates the Director's internal state based on player data.
     * @returns A list of actions the Director intends to take this tick.
     */
    update(stats: PlayerStats): DirectorAction[] {
        const actions: DirectorAction[] = [];

        // 1. Calculate Stress
        this.updateStress(stats);

        // 2. Handle State Transitions
        const oldState = this.state;
        this.handleTransitions();

        if (this.state !== oldState) {
            actions.push(...this.getOnStateEnterActions());
        }

        // 3. Periodic/Chance based actions
        actions.push(...this.getTickActions());

        // 4. Record history for visualization
        this.stateHistory.push({
            time: (Date.now() - this.startTime) / 1000,
            stress: this.stress,
            state: this.state
        });
        if (this.stateHistory.length > 100) this.stateHistory.shift();

        return actions;
    }

    private updateStress(stats: PlayerStats) {
        // Stress increases when:
        // - Health is low
        // - Ammo is low
        // - Enemies are close
        // - It's been a while since a "Peak"

        let targetStress = 0;
        targetStress += (100 - stats.health) * 0.4;
        targetStress += (10 - Math.min(stats.ammo, 10)) * 2;
        targetStress += stats.enemyProximity * 50;

        // "Ease" the stress for smooth pacing
        this.stress += (targetStress - this.stress) * 0.1;
        this.stress = Math.min(Math.max(this.stress, 0), 100);
    }

    private handleTransitions() {
        switch (this.state) {
            case DirectorStateValues.BuildUp:
                if (this.stress > 75) this.state = DirectorStateValues.Peak;
                break;
            case DirectorStateValues.Peak:
                // End peak if player is too hurt or stress naturally drops
                if (this.stress < 40) this.state = DirectorStateValues.Relax;
                break;
            case DirectorStateValues.Relax:
                // Stay in relax for a minimum period or until stress is very low
                if (this.stress < 10) this.state = DirectorStateValues.BuildUp;
                break;
        }
    }

    private getOnStateEnterActions(): DirectorAction[] {
        switch (this.state) {
            case DirectorStateValues.Peak:
                return [
                    { type: "SPAWN_HORDE" },
                    { type: "PLAY_MUSIC", intensity: "high" }
                ];
            case DirectorStateValues.Relax:
                return [
                    { type: "DROP_LOOT", item: "Health" },
                    { type: "PLAY_MUSIC", intensity: "ambient" }
                ];
            case DirectorStateValues.BuildUp:
                return [
                    { type: "PLAY_MUSIC", intensity: "low" }
                ];
        }
        return [];
    }

    private getTickActions(): DirectorAction[] {
        const actions: DirectorAction[] = [];
        const roll = Math.random();

        if (this.state === DirectorStateValues.BuildUp && roll < 0.05) {
            actions.push({ type: "SPAWN_SCOUT" });
        }

        if (this.state === DirectorStateValues.Relax && roll < 0.02) {
            actions.push({ type: "DROP_LOOT", item: "Ammo" });
        }

        return actions;
    }

    public getStress() { return this.stress; }
    public getState() { return this.state; }
    public getHistory() { return this.stateHistory; }
}
