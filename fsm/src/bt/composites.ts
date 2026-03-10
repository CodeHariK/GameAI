import { BTNode, BTNodeStatus } from "./types";
import { Blackboard } from "../common/blackboard";

/**
 * Sequence (The AND Node):
 * Runs its children in order from first to last.
 * - If a child returns FAILURE, the Sequence returns FAILURE immediately and resets.
 * - If a child returns SUCCESS, it moves to the next child in the same tick.
 * - If a child returns RUNNING, the Sequence returns RUNNING and stays on that child.
 * - If all children return SUCCESS, the Sequence returns SUCCESS.
 */
export class Sequence extends BTNode {
    private children: BTNode[];

    constructor(children: BTNode[]) {
        super();
        this.children = children;
    }

    tick(blackboard: Blackboard): BTNodeStatus {
        for (const child of this.children) {
            const status = child.tick(blackboard);

            if (status === BTNodeStatus.Running) return BTNodeStatus.Running;
            if (status === BTNodeStatus.Failure) {
                this.reset();
                return BTNodeStatus.Failure;
            }
        }
        this.reset();
        return BTNodeStatus.Success;
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
export class MemSequence extends BTNode {
    private children: BTNode[];
    private lastRunningIndex: number = 0;

    constructor(children: BTNode[]) {
        super();
        this.children = children;
    }

    tick(blackboard: Blackboard): BTNodeStatus {
        for (let i = this.lastRunningIndex; i < this.children.length; i++) {
            const status = this.children[i].tick(blackboard);

            if (status === BTNodeStatus.Running) {
                this.lastRunningIndex = i;
                return BTNodeStatus.Running;
            }

            if (status === BTNodeStatus.Failure) {
                this.reset();
                return BTNodeStatus.Failure;
            }
        }
        this.reset();
        return BTNodeStatus.Success;
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
export class Selector extends BTNode {
    private children: BTNode[];

    constructor(children: BTNode[]) {
        super();
        this.children = children;
    }

    tick(blackboard: Blackboard): BTNodeStatus {
        for (const child of this.children) {
            const status = child.tick(blackboard);

            if (status === BTNodeStatus.Success) {
                this.reset();
                return BTNodeStatus.Success;
            }
            if (status === BTNodeStatus.Running) return BTNodeStatus.Running;
        }
        this.reset();
        return BTNodeStatus.Failure;
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
export class MemSelector extends BTNode {
    private children: BTNode[];
    private lastRunningIndex: number = 0;

    constructor(children: BTNode[]) {
        super();
        this.children = children;
    }

    tick(blackboard: Blackboard): BTNodeStatus {
        for (let i = this.lastRunningIndex; i < this.children.length; i++) {
            const status = this.children[i].tick(blackboard);

            if (status === BTNodeStatus.Success) {
                this.reset();
                return BTNodeStatus.Success;
            }
            if (status === BTNodeStatus.Running) {
                this.lastRunningIndex = i;
                return BTNodeStatus.Running;
            }
        }
        this.reset();
        return BTNodeStatus.Failure;
    }

    override reset(): void {
        this.lastRunningIndex = 0;
        for (const child of this.children) {
            child.reset();
        }
    }
}
