import { Blackboard } from "../common/blackboard";

export const BTNodeStatus = {
    Success: "SUCCESS",
    Failure: "FAILURE",
    Running: "RUNNING"
} as const;

export type BTNodeStatus = typeof BTNodeStatus[keyof typeof BTNodeStatus];

export abstract class BTNode {
    // The "Tick" is the heartbeat of the tree
    abstract tick(blackboard: Blackboard): BTNodeStatus;

    /**
     * Resets the node's internal state. 
     * Called when the node is interrupted or should restart.
     */
    reset(): void {
        // Default: No-op
    }
}

export class BTActionNode extends BTNode {
    private action: (blackboard: Blackboard) => BTNodeStatus;

    constructor(action: (blackboard: Blackboard) => BTNodeStatus) {
        super();
        this.action = action;
    }

    tick(blackboard: Blackboard): BTNodeStatus {
        return this.action(blackboard);
    }
}

/**
 * ConditionNode: A simple wrapper for blackboard-based boolean checks.
 * Returns SUCCESS if the predicate is true, FAILURE otherwise.
 */
export class BTConditionNode extends BTNode {
    private predicate: (bb: Blackboard) => boolean;

    constructor(predicate: (bb: Blackboard) => boolean) {
        super();
        this.predicate = predicate;
    }

    tick(bb: Blackboard): BTNodeStatus {
        return this.predicate(bb) ? BTNodeStatus.Success : BTNodeStatus.Failure;
    }
}
