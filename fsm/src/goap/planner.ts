import type { WorldState } from "./types";
import { GOAPAction } from "./types";

class PlanNode {
    public state: WorldState;
    public g: number; // path cost
    public h: number; // heuristic cost
    public f: number; // total cost (g + h)
    public parent: PlanNode | null;
    public action: GOAPAction | null;

    constructor(
        state: WorldState,
        g: number,
        h: number,
        parent: PlanNode | null,
        action: GOAPAction | null
    ) {
        this.state = state;
        this.g = g;
        this.h = h;
        this.f = g + h;
        this.parent = parent;
        this.action = action;
    }
}

export class GOAPPlanner {
    /**
     * Finds a plan from current state to reach the goal state.
     * returns a list of actions in the order they should be performed.
     */
    public plan(
        currentState: WorldState,
        goalState: WorldState,
        actions: GOAPAction[]
    ): GOAPAction[] | null {
        const startState = { ...currentState };
        const root = new PlanNode(startState, 0, this.heuristic(startState, goalState), null, null);

        const openList: PlanNode[] = [root];
        const closedList: Set<string> = new Set();

        const usableActions = actions.filter(a => a.checkProceduralPrecondition(currentState));

        while (openList.length > 0) {
            // Sort by f (g + h) - This is the "A*" part!
            openList.sort((a, b) => a.f - b.f);
            const current = openList.shift()!;

            // Check if goal met
            if (this.isGoalMet(goalState, current.state)) {
                return this.reconstructPlan(current);
            }

            const stateKey = JSON.stringify(current.state);
            if (closedList.has(stateKey)) continue;
            closedList.add(stateKey);

            for (const action of usableActions) {
                if (this.arePreconditionsMet(action.preconditions, current.state)) {
                    const nextState = this.applyEffects(action.effects, current.state);
                    const h = this.heuristic(nextState, goalState);
                    const newNode = new PlanNode(nextState, current.g + action.cost, h, current, action);
                    openList.push(newNode);
                }
            }
        }

        return null; // No plan found
    }

    /**
     * Estimated cost to reach the goal.
     * For GOAP, we count how many goal conditions are not yet met.
     */
    private heuristic(state: WorldState, goal: WorldState): number {
        let count = 0;
        for (const key in goal) {
            if (state[key] !== goal[key]) {
                count++;
            }
        }
        return count;
    }

    private arePreconditionsMet(pre: WorldState, state: WorldState): boolean {
        for (const key in pre) {
            if (state[key] !== pre[key]) return false;
        }
        return true;
    }

    private applyEffects(effects: WorldState, state: WorldState): WorldState {
        const newState = { ...state };
        for (const key in effects) {
            newState[key] = effects[key];
        }
        return newState;
    }

    private isGoalMet(goal: WorldState, state: WorldState): boolean {
        for (const key in goal) {
            if (state[key] !== goal[key]) return false;
        }
        return true;
    }

    private reconstructPlan(node: PlanNode): GOAPAction[] {
        const plan: GOAPAction[] = [];
        let current: PlanNode | null = node;
        while (current && current.action) {
            plan.unshift(current.action);
            current = current.parent;
        }
        return plan;
    }
}
