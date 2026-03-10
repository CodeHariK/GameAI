export type WorldState = Record<string, any>;

export abstract class GOAPAction {
    public name: string;
    public cost: number = 1;

    // What must be true for this action to run
    public preconditions: WorldState = {};

    // What this action changes in the world
    public effects: WorldState = {};

    constructor(name: string, cost: number = 1) {
        this.name = name;
        this.cost = cost;
    }

    /**
     * Optional check for additional logic that can't be expressed
     * as simple world state keys (e.g., distance, line of sight).
     */
    public checkProceduralPrecondition(_worldState: WorldState): boolean {
        return true;
    }

    /**
     * Executes the action in the game world.
     * returns true if execution was successful.
     */
    public abstract perform(worldState: WorldState): boolean;
}
