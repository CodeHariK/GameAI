import { GOAPAction, type WorldState } from "../goap/types";
import { GOAPPlanner } from "../goap/planner";
import { SquadRoleValues, type SquadRole, type SquadMember } from "./types";

export class SquadAction extends GOAPAction {
    public roleTransitions: Record<string, SquadRole>;

    constructor(
        name: string,
        cost: number,
        pre: WorldState,
        eff: WorldState,
        roleTransitions: Record<string, SquadRole>
    ) {
        super(name, cost);
        this.preconditions = pre;
        this.effects = eff;
        this.roleTransitions = roleTransitions;
    }

    public perform(worldState: WorldState): boolean {
        const members = worldState["members"] as SquadMember[];
        if (!members) return false;

        // Assign roles to each member based on transition mapping
        members.forEach((member, index) => {
            const roleKey = `member_${index}`;
            if (this.roleTransitions[roleKey]) {
                member.role = this.roleTransitions[roleKey];
            }
        });

        return true;
    }
}

export class SquadCommander {
    private planner = new GOAPPlanner();
    private actions: SquadAction[] = [];

    constructor() {
        this.setupActions();
    }

    private setupActions() {
        // 1. Maneuver into Position (Pre-requisite for suppression)
        this.actions.push(new SquadAction(
            "Maneuver",
            5,
            { inPosition: false },
            { inPosition: true },
            { member_0: SquadRoleValues.Idle, member_1: SquadRoleValues.Idle }
        ));

        // 2. Suppress and Flank (Requires being in position)
        this.actions.push(new SquadAction(
            "SuppressAndFlank",
            10,
            { inPosition: true, member_0_alive: true, member_1_alive: true },
            { targetSuppressed: true, targetFlanked: true },
            { member_0: SquadRoleValues.Suppress, member_1: SquadRoleValues.Flank }
        ));

        // 3. Eliminate Target (Requires suppression and flanking)
        this.actions.push(new SquadAction(
            "EliminateTarget",
            2,
            { targetSuppressed: true, targetFlanked: true },
            { targetEliminated: true },
            { member_0: SquadRoleValues.Suppress, member_1: SquadRoleValues.Flank }
        ));
    }

    public plan(worldState: WorldState, goal: WorldState): SquadAction[] {
        const plan = this.planner.plan(worldState, goal, this.actions);
        return plan as SquadAction[];
    }
}
