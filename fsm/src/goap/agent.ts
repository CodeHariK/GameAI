import type { GOAPPlanner } from "./planner";
import type { GOAPAction, WorldState } from "./types";

export class GOAPAgent {
    private currentPlan: GOAPAction[] | null = null;
    private currentActionIndex: number = 0;

    private planner: GOAPPlanner;
    private availableActions: GOAPAction[];

    constructor(
        planner: GOAPPlanner,
        availableActions: GOAPAction[]
    ) {
        this.planner = planner;
        this.availableActions = availableActions;
    }

    /**
     * Call this every frame or tick of your game loop.
     */
    public update(worldState: WorldState, goal: WorldState) {
        // 1. If we don't have a plan, get one.
        if (!this.currentPlan) {
            this.currentPlan = this.planner.plan(worldState, goal, this.availableActions);
            this.currentActionIndex = 0;

            if (!this.currentPlan) {
                console.log("Agent: No plan possible for this goal.");
                return;
            }
        }

        // 2. Execute the current action in the plan
        const action = this.currentPlan[this.currentActionIndex];

        // 3. Check if the current action is still valid (Preconditions check)
        // If the world changed out from under us, the plan is dead.
        if (!this.arePreconditionsMet(action.preconditions, worldState)) {
            console.log(`Agent: Plan interrupted! Action ${action.name} no longer valid.`);
            this.abortPlan();
            return;
        }

        // 4. Perform the action
        const success = action.perform(worldState);

        if (success) {
            // Action finished! Move to the next one.
            this.currentActionIndex++;

            // Check if the entire plan is finished
            if (this.currentActionIndex >= this.currentPlan.length) {
                console.log("Agent: Goal achieved!");
                this.abortPlan(); // Clear plan to allow for new goals
            }
        } else {
            // Action is still 'Running' (In GOAP, 'false' usually means 'still working' 
            // or 'failed'. Let's assume 'false' = failed for this simple implementation).
            console.log(`Agent: Action ${action.name} failed.`);
            this.abortPlan();
        }
    }

    private arePreconditionsMet(pre: WorldState, state: WorldState): boolean {
        for (const key in pre) {
            if (state[key] !== pre[key]) return false;
        }
        return true;
    }

    private abortPlan() {
        this.currentPlan = null;
        this.currentActionIndex = 0;
    }
}
