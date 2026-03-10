import { BTNode, BTNodeStatus } from "./types";
import { Blackboard } from "../common/blackboard";

export class WaitNode extends BTNode {
    private startTime: number | null = null;
    private durationMs: number;

    constructor(durationMs: number) {
        super();
        this.durationMs = durationMs;
    }

    tick(_blackboard: Blackboard): BTNodeStatus {
        if (this.startTime === null) {
            this.startTime = Date.now();
        }

        const elapsed = Date.now() - this.startTime;

        if (elapsed >= this.durationMs) {
            this.reset(); // Use reset to clear startTime
            return BTNodeStatus.Success;
        }

        return BTNodeStatus.Running;
    }

    override reset(): void {
        this.startTime = null;
    }
}

/**
 * Inverter: Flips SUCCESS to FAILURE and vice-versa.
 */
export class Inverter extends BTNode {
    private child: BTNode;
    constructor(child: BTNode) {
        super();
        this.child = child;
    }

    tick(blackboard: Blackboard): BTNodeStatus {
        const status = this.child.tick(blackboard);
        if (status === BTNodeStatus.Success) return BTNodeStatus.Failure;
        if (status === BTNodeStatus.Failure) return BTNodeStatus.Success;
        return status;
    }

    override reset(): void {
        this.child.reset();
    }
}

/**
 * Succeeder: Always returns SUCCESS (if not RUNNING).
 */
export class Succeeder extends BTNode {
    private child: BTNode;
    constructor(child: BTNode) {
        super();
        this.child = child;
    }

    tick(blackboard: Blackboard): BTNodeStatus {
        const status = this.child.tick(blackboard);
        if (status === BTNodeStatus.Running) return BTNodeStatus.Running;
        return BTNodeStatus.Success;
    }

    override reset(): void {
        this.child.reset();
    }
}

/**
 * Repeater: Restarts the child as soon as it returns a result.
 */
export class Repeater extends BTNode {
    private child: BTNode;
    constructor(child: BTNode) {
        super();
        this.child = child;
    }

    tick(blackboard: Blackboard): BTNodeStatus {
        const status = this.child.tick(blackboard);
        if (status !== BTNodeStatus.Running) {
            this.child.reset();
        }
        return BTNodeStatus.Running;
    }

    override reset(): void {
        this.child.reset();
    }
}
