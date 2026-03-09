import { Node, NodeStatus } from "./types";
import { Blackboard } from "./blackboard";

/**
 * Sequence (The AND Node):
 * Runs its children in order from first to last.
 * - If a child returns FAILURE, the Sequence returns FAILURE immediately and resets.
 * - If a child returns SUCCESS, it moves to the next child in the same tick.
 * - If a child returns RUNNING, the Sequence returns RUNNING and stays on that child.
 * - If all children return SUCCESS, the Sequence returns SUCCESS.
 */
export class Sequence extends Node {
    private children: Node[];

    constructor(children: Node[]) {
        super();
        this.children = children;
    }

    tick(blackboard: Blackboard): NodeStatus {
        for (const child of this.children) {
            const status = child.tick(blackboard);

            if (status === NodeStatus.Running) return NodeStatus.Running;
            if (status === NodeStatus.Failure) {
                this.reset();
                return NodeStatus.Failure;
            }
        }
        this.reset();
        return NodeStatus.Success;
    }

    override reset(): void {
        for (const child of this.children) {
            child.reset();
        }
    }
}

/**
 * MemSequence (Sequence with Memory):
 * Resumes from the last RUNNING child in the next tick.
 */
export class MemSequence extends Node {
    private children: Node[];
    private lastRunningIndex: number = 0;

    constructor(children: Node[]) {
        super();
        this.children = children;
    }

    tick(blackboard: Blackboard): NodeStatus {
        for (let i = this.lastRunningIndex; i < this.children.length; i++) {
            const status = this.children[i].tick(blackboard);

            if (status === NodeStatus.Running) {
                this.lastRunningIndex = i;
                return NodeStatus.Running;
            }

            if (status === NodeStatus.Failure) {
                this.reset();
                return NodeStatus.Failure;
            }
        }
        this.reset();
        return NodeStatus.Success;
    }

    override reset(): void {
        this.lastRunningIndex = 0;
        for (const child of this.children) {
            child.reset();
        }
    }
}

/**
 * Selector (The OR Node / Priority Node):
 * Stateless: Always re-evaluates children from the start.
 */
export class Selector extends Node {
    private children: Node[];

    constructor(children: Node[]) {
        super();
        this.children = children;
    }

    tick(blackboard: Blackboard): NodeStatus {
        for (const child of this.children) {
            const status = child.tick(blackboard);

            if (status === NodeStatus.Success) {
                this.reset();
                return NodeStatus.Success;
            }
            if (status === NodeStatus.Running) return NodeStatus.Running;
        }
        this.reset();
        return NodeStatus.Failure;
    }

    override reset(): void {
        for (const child of this.children) {
            child.reset();
        }
    }
}

/**
 * MemSelector (Selector with Memory):
 * Resumes from the last RUNNING child in the next tick.
 */
export class MemSelector extends Node {
    private children: Node[];
    private lastRunningIndex: number = 0;

    constructor(children: Node[]) {
        super();
        this.children = children;
    }

    tick(blackboard: Blackboard): NodeStatus {
        for (let i = this.lastRunningIndex; i < this.children.length; i++) {
            const status = this.children[i].tick(blackboard);

            if (status === NodeStatus.Success) {
                this.reset();
                return NodeStatus.Success;
            }
            if (status === NodeStatus.Running) {
                this.lastRunningIndex = i;
                return NodeStatus.Running;
            }
        }
        this.reset();
        return NodeStatus.Failure;
    }

    override reset(): void {
        this.lastRunningIndex = 0;
        for (const child of this.children) {
            child.reset();
        }
    }
}
