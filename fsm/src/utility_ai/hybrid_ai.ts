import { Blackboard } from "../common/blackboard";
import { BTNode } from "../bt/types";
import { UtilityEngine } from "./types";

export class HybridAI {
    private utilityEngine: UtilityEngine;
    private behaviorTree: BTNode;
    private blackboard: Blackboard;

    private utilityIntervalMs: number;
    private elapsedTime: number = 0;

    constructor(
        utilityEngine: UtilityEngine,
        behaviorTree: BTNode,
        blackboard: Blackboard,
        utilityIntervalMs: number = 1000 // Default: Think once per second
    ) {
        this.utilityEngine = utilityEngine;
        this.behaviorTree = behaviorTree;
        this.blackboard = blackboard;
        this.utilityIntervalMs = utilityIntervalMs;
    }

    tick(deltaTimeMs: number) {
        // 1. The Utility AI updates the 'Desire' at a slower rate
        this.elapsedTime += deltaTimeMs;
        if (this.elapsedTime >= this.utilityIntervalMs) {
            this.utilityEngine.tick(this.blackboard);
            this.elapsedTime = 0;
        }

        // 2. The Behavior Tree executes the 'Plan' every single pulse (smooth acting)
        this.behaviorTree.tick(this.blackboard);
    }
}
