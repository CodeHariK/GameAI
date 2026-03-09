import { Node, NodeStatus } from "./types";
import { Blackboard } from "./blackboard";

export class WaitNode extends Node {
    private startTime: number | null = null;
    private durationMs: number;

    constructor(durationMs: number) {
        super();
        this.durationMs = durationMs;
    }

    tick(_blackboard: Blackboard): NodeStatus {
        if (this.startTime === null) {
            this.startTime = Date.now();
        }

        const elapsed = Date.now() - this.startTime;

        if (elapsed >= this.durationMs) {
            this.reset(); // Use reset to clear startTime
            return NodeStatus.Success;
        }

        return NodeStatus.Running;
    }

    override reset(): void {
        this.startTime = null;
    }
}

/**
 * Inverter: Flips SUCCESS to FAILURE and vice-versa.
 */
export class Inverter extends Node {
    private child: Node;
    constructor(child: Node) {
        super();
        this.child = child;
    }

    tick(blackboard: Blackboard): NodeStatus {
        const status = this.child.tick(blackboard);
        if (status === NodeStatus.Success) return NodeStatus.Failure;
        if (status === NodeStatus.Failure) return NodeStatus.Success;
        return status;
    }

    override reset(): void {
        this.child.reset();
    }
}

/**
 * Succeeder: Always returns SUCCESS (if not RUNNING).
 */
export class Succeeder extends Node {
    private child: Node;
    constructor(child: Node) {
        super();
        this.child = child;
    }

    tick(blackboard: Blackboard): NodeStatus {
        const status = this.child.tick(blackboard);
        if (status === NodeStatus.Running) return NodeStatus.Running;
        return NodeStatus.Success;
    }

    override reset(): void {
        this.child.reset();
    }
}

/**
 * Repeater: Restarts the child as soon as it returns a result.
 */
export class Repeater extends Node {
    private child: Node;
    constructor(child: Node) {
        super();
        this.child = child;
    }

    tick(blackboard: Blackboard): NodeStatus {
        const status = this.child.tick(blackboard);
        if (status !== NodeStatus.Running) {
            this.child.reset();
        }
        return NodeStatus.Running;
    }

    override reset(): void {
        this.child.reset();
    }
}
