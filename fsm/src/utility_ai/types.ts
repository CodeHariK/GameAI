import type { Blackboard } from "../common/blackboard";

// utility_ai/types.ts
export interface UConsideration {
    name: string;
    weight?: number; // 0 to 1. 1.0 = Mandatory (Score multiplier), < 1.0 = Soft influence
    // Returns 0 to 1 based on world state
    evaluate: (blackboard: Blackboard) => number;
}

export interface UAction {
    name: string;
    goal?: string; // The goal this action fulfills (used by Hybrid AI)
    considerations: UConsideration[];
    execute: () => void;
}

export interface UActionScore {
    name: string;
    finalScore: number;
    considerationScores: { name: string; value: number }[];
}

export class UtilityEngine {
    private actions: UAction[];
    constructor(actions: UAction[]) {
        this.actions = actions;
    }

    /**
     * Calculates the score for all actions without executing them.
     * Useful for debugging and visualizations.
     */
    getScores(blackboard: Blackboard): UActionScore[] {
        return this.actions.map(action => {
            const considerationScores = action.considerations.map(c => {
                const val = c.evaluate(blackboard);
                const weight = c.weight ?? 1.0;
                // Weighted value: (val * weight + (1 - weight))
                // If weight is 1.0, it's just val. If weight is 0.5, it ranges from 0.5 to 1.0.
                return {
                    name: c.name,
                    value: val * weight + (1.0 - weight)
                };
            });

            const finalScore = considerationScores.reduce((acc, curr) => acc * curr.value, 1.0);

            return {
                name: action.name,
                finalScore: action.considerations.length > 0 ? finalScore : 0,
                considerationScores
            };
        });
    }

    tick(blackboard: Blackboard) {
        let bestAction: UAction | null = null;
        let highestScore = -1;

        for (const action of this.actions) {
            let score = 1.0;

            for (const cons of action.considerations) {
                const val = cons.evaluate(blackboard);
                const weight = cons.weight ?? 1.0;

                // Weighting logic: prevents zeroing out if weight < 1.0
                const multiplier = val * weight + (1.0 - weight);
                score *= multiplier;

                if (score === 0) break;
            }

            if (score > highestScore) {
                highestScore = score;
                bestAction = action;
            }
        }

        if (bestAction && highestScore > 0) {
            if (bestAction.goal) {
                blackboard.setGoal(bestAction.goal);
            }
            bestAction.execute();
        }
    }
}
