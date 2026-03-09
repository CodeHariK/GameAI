import { Blackboard } from "./blackboard";

export const NodeStatus = {
    Success: "SUCCESS",
    Failure: "FAILURE",
    Running: "RUNNING"
} as const;

export type NodeStatus = typeof NodeStatus[keyof typeof NodeStatus];

export abstract class Node {
    // The "Tick" is the heartbeat of the tree
    abstract tick(blackboard: Blackboard): NodeStatus;

    /**
     * Resets the node's internal state. 
     * Called when the node is interrupted or should restart.
     */
    reset(): void {
        // Default: No-op
    }
}

export class ActionNode extends Node {
    private action: (blackboard: Blackboard) => NodeStatus;

    constructor(action: (blackboard: Blackboard) => NodeStatus) {
        super();
        this.action = action;
    }

    tick(blackboard: Blackboard): NodeStatus {
        return this.action(blackboard);
    }
}
