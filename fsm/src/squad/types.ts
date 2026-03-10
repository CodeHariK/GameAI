import { type GOAPAgent } from "../goap/agent";

export type SquadRole = "Suppress" | "Flank" | "Medicate" | "Idle";

export const SquadRoleValues = {
    Suppress: "Suppress" as SquadRole,
    Flank: "Flank" as SquadRole,
    Medicate: "Medicate" as SquadRole,
    Idle: "Idle" as SquadRole
};

export interface TacticalPosition {
    x: number;
    y: number;
    score: number;
    occupantId?: string;
}

export interface SquadMember {
    id: string;
    agent: GOAPAgent;
    role: SquadRole;
    position: { x: number; y: number };
    health: number;
    ammo: number;
}
