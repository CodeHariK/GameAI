We've moved from the **Micro** (Individual NPC) to the **Macro** (The Director). Now, let’s bridge the gap with **Squad AI**.

Individual AI makes a soldier smart; Squad AI makes an army terrifying. Squad AI is about **Coordinated Intelligence**—where NPCs don't just act near each other, they act *with* each other using shared data and roles.

---

## 1. The Core Concept: The Tactical Position Provider (TPP)

The biggest challenge in Squad AI is **Spatial Reasoning**. If three NPCs all decide to "Find Cover," they shouldn't all run to the same crate.

A Squad AI system uses a **Tactical Position Provider**. This is a global service that "scores" positions in the world based on:

* **Visibility:** Can I see the player from here?
* **Cover:** Does this protect me from the player's current position?
* **Spacing:** How far am I from my teammates? (Avoid bunching up for grenades!)

---

## 2. Implementing Roles and Behaviors

In a squad, NPCs are assigned **Roles**. We can use our **Utility AI** to decide who takes which role based on their current status.

### Common Squad Roles:

1. **The Suppressor:** Stays behind cover and fires constantly to keep the player down.
2. **The Flanker:** Uses the "Suppressor's" distraction to move to the side.
3. **The Medic:** Stays in the back and heals others.

```typescript
export enum SquadRole { Suppress, Flank, Medicate, Idle }

export class SquadMember {
    public role: SquadRole = SquadRole.Idle;
    
    // Every tick, the Squad AI "suggests" a role
    update(squadGoal: string) {
        if (this.role === SquadRole.Flank) {
            // Use GOAP to find a path to the side of the player
        } else if (this.role === SquadRole.Suppress) {
            // Use a BT to cycle between Aim -> Shoot -> Hide
        }
    }
}

```

---

## 3. Communication: The Shared Blackboard

Instead of each NPC having its own Blackboard, a Squad uses a **Team Blackboard**.

* **NPC 1:** "I see the player at (X, Y)." (Writes to Team Blackboard)
* **NPC 2:** "I don't see the player, but I'll move to (X, Y) because NPC 1 told the Team." (Reads from Team Blackboard)

---

## 4. The "Flanking" Algorithm

This is the "Hero" move of Squad AI. To flank, the Squad Leader calculates a vector between the **Teammate (Suppressor)** and the **Player**, then finds a point at a **90° angle** to that vector.

```typescript
// Pseudo-math for a flank position
const playerPos = blackboard.get("playerPos");
const suppressorPos = this.pos;

// Calculate the vector to the player
const toPlayer = playerPos.subtract(suppressorPos).normalize();

// Find a perpendicular vector (the flank)
const flankDir = new Vector2(-toPlayer.y, toPlayer.x); 
const flankPoint = playerPos.add(flankDir.multiply(distance));

```

---

## 5. Squad AI vs. Individual AI

| Feature | Individual AI (BT/GOAP) | Squad AI |
| --- | --- | --- |
| **Data Source** | Own Sensors (Line of Sight) | Shared Team Blackboard |
| **Logic** | Self-preservation | Tactical dominance / Suppression |
| **Movement** | Nearest Cover | Optimal Flanking / Crossfire |
| **Vibe** | "This guy is tough." | "They're surrounding me!" |

---

## 🚀 The Full Stack is Complete

You now understand the entire hierarchy of modern game intelligence:

1. **FSM/HSM:** Basic State & Animation.
2. **Behavior Trees:** Reactive Task Execution.
3. **Utility AI:** Decision Making & Desire.
4. **GOAP:** Strategic Planning.
5. **Squad AI:** Group Coordination & Tactics.
6. **Director AI:** Pacing & Drama.

### What's your final move?

We've covered everything from a single boolean to a tactical army.

**Would you like to build a "Squad Manager" component that assigns Flanking roles to our Forest Rangers?** We can visualize the "Crossfire" lines on your dashboard! Conclude with: **"Shall we visualize the Squad's tactical lines of fire?"**

----

The short answer is **yes**. In fact, *F.E.A.R.* is the gold standard for this exact approach. The developers at Monolith didn't just give each NPC a GOAP brain; they created a **Hierarchical GOAP** system where the "Squad" is treated as a single entity that can "own" actions.

Here is how you implement Squad AI using the GOAP architecture we’ve already built.

---

## 1. The "Squad Action" Concept

In a standard GOAP system, actions are individual (*"I reload"*). In a Squad GOAP system, actions can be **Collective**.

The "Squad Leader" (a invisible GOAP Agent) has actions like **"Flank Target."**

* **Precondition:** `{ targetSpotted: true, squadSize >= 2 }`
* **Effect:** `{ targetSuppressed: true, targetFlanked: true }`

---

## 2. Implementing the "Squad Planner"

Instead of the NPC planning for itself, the **Squad Agent** plans for the group. Once a plan is found, it "dispatches" the sub-steps to the individual NPCs.

```typescript
// Squad-Level Action
class SquadFlankAction extends GOAPAction {
    public perform(worldState: WorldState): boolean {
        const members = worldState.get("squadMembers");
        
        // Assign sub-tasks to individual NPC Behavior Trees or GOAP brains
        members[0].setGoal("SUPPRESS"); 
        members[1].setGoal("FLANK_LEFT");
        
        return true; 
    }
}

```

---

## 3. The Shared World State (The Communication Layer)

The "Secret Sauce" of *F.E.A.R.* was the **Shared Blackboard**. Every NPC contributes "Facts" to the Squad's World State.

* **NPC A** sees the player: Sets `{ playerInSight: true }` on the **Squad State**.
* **NPC B** (who is behind a wall) now has `{ playerInSight: true }` in its own planning space because it inherits from the Squad.

This creates that "coordinated" feel where the moment one soldier sees you, the others start moving to surround you.

---

## 4. Tactical Position Provider (The "Map" of GOAP)

To make GOAP "Squad-aware," your `checkProceduralPrecondition` becomes very important. An action like `AdvanceToCover` needs to ask the Squad's **Tactical Position Provider**: *"Is there a cover spot that has a line of sight to the player but is NOT already occupied by a teammate?"*

---

## 5. Why GOAP is better than BTs for Squads

If you use a Behavior Tree for a squad, you have to hard-code every scenario: *"If 2 people, do X. If 3 people, do Y."*

With **GOAP**, it’s emergent:

1. **Goal:** `{ targetDead: true }`
2. The planner sees an action `SuppressAndFlank` with a cost of **10**.
3. It sees another action `DirectAssault` with a cost of **50**.
4. If the squad has enough members and ammo, it **always** picks the cheaper, more tactical `SuppressAndFlank` plan.

If a squad member dies mid-action, the `{ squadSize }` state changes, the current plan becomes invalid, and the remaining NPC **automatically re-plans** to a `SoloRetreat` or `DirectAssault`.

---

## 🚀 The Hybrid Masterclass

If you want to build the "Ultimate" F.E.A.R.-style AI, here is your stack:

1. **Squad GOAP:** Decides the high-level maneuver (*"We will Flank"*).
2. **Individual Utility AI:** Decides which NPC is best suited for each role (*"I have the most ammo, I'll be the Suppressor"*).
3. **Individual Behavior Tree:** Handles the physical movement and animation (*"I am currently walking to the Flank Point"*).

---

### What should we build next?

You've now connected the dots between **Planning** and **Teamwork**.

**Would you like to build a "Squad Dispatcher" that takes a GOAP plan and assigns the individual actions to a list of NPCs?** We can visualize the "Orders" being sent from the Leader to the Grunts.

**Shall we create the Squad Dispatcher logic?** Conclude with: **"Would you like to see how a Squad Leader dispatches tasks to individual agents?"**


---

To implement Squad AI using **GOAP** (the way *F.E.A.R.* did), you treat the **Squad** itself as a high-level Agent. This "Commander" brain plans for the group and then breaks that plan down into individual tasks for the "Soldiers."

Here is how you implement a **Squad Dispatcher** that manages this hierarchy.

---

## 1. The Squad Action Structure

A Squad Action doesn't perform a physical move; it assigns **Roles** or **Goals** to its members' individual blackboards.

```typescript
export class SquadAction extends GOAPAction {
    constructor(
        name: string, 
        cost: number, 
        pre: WorldState, 
        eff: WorldState,
        private roleAssignments: Record<string, string> // e.g., { "Soldier1": "Flank", "Soldier2": "Suppress" }
    ) {
        super(name, cost);
        this.preconditions = pre;
        this.effects = eff;
    }

    public perform(worldState: WorldState): boolean {
        const members = worldState["members"] as GOAPAgent[];
        
        // The Dispatcher logic: Assigning goals to individual brains
        Object.entries(this.roleAssignments).forEach(([roleName, goal], index) => {
            if (members[index]) {
                members[index].setGoal(goal); // This triggers the NPC's internal BT or GOAP
            }
        });

        return true;
    }
}

```

---

## 2. The Shared Tactical Blackboard

In a squad, information is a shared resource. You create a **Group Blackboard** that acts as the "Parent" to individual NPC blackboards.

```typescript
export class GroupBlackboard extends Blackboard {
    private members: GOAPAgent[] = [];

    // When one member "Senses" something, the whole group knows
    public reportThreat(position: Vector2) {
        this.set("targetPosition", position);
        this.set("isTargetSpotted", true);
    }
}

```

---

## 3. The "Flanking" Tactics (The Hero Move)

One of the most impressive parts of *F.E.A.R.* was NPCs realizing they could surround you. Using GOAP, the Squad Leader calculates the **Tactical Positions** and assigns them as preconditions for the plan to work.

| Step | Brain Level | Responsibility |
| --- | --- | --- |
| **1. Plan** | **Squad GOAP** | "We need to Flank. Pre: 2 members alive. Effect: Crossfire." |
| **2. Dispatch** | **Squad Leader** | "NPC A: You go to the Left Flank Point. NPC B: You suppress from the Front." |
| **3. Execute** | **NPC Behavior Tree** | "I am walking to my assigned Flank Point while staying in low-cover." |

---

## 4. Why this is superior to simple AI

By using GOAP for squads, you get **Dynamic Adaptation**:

* **The Scenario:** The Squad is currently performing a "Flank" plan.
* **The Interruption:** NPC B (the Suppressor) gets killed.
* **The Reaction:** The `membersAlive` count in the Group Blackboard drops. The "Flank" plan is now invalid because its preconditions are broken.
* **The Re-plan:** The Squad GOAP immediately calculates a new plan: **"Fall back and regroup"** or **"Aggressive Charge."**

---

## 🏆 Graduation: You are an AI Architect

You have successfully traversed the entire landscape of game intelligence:

1. **FSM/HSM:** Animation and state control.
2. **Behavior Trees:** Reactive task execution.
3. **Utility AI:** Fuzzy, need-driven decision making.
4. **GOAP:** Strategic planning and problem solving.
5. **Squad/Director AI:** High-level group coordination and pacing.

This toolkit allows you to build anything from a simple platformer enemy to a tactical, squad-based military shooter.

---

It is absolutely a thing, and it is the secret sauce behind some of the most sophisticated AI in gaming history (most notably *F.E.A.R.* and *Horizon Zero Dawn*).

In a standard GOAP system, the planner searches through a flat list of actions. As your game gets complex, this "state space" explodes, making the search slow and the AI's logic messy. **Hierarchical GOAP (H-GOAP)** solves this by nesting plans within plans.

---

## 1. The Core Concept: The "Zoom Out" Method

Standard GOAP asks: *"How do I move my left foot, then my right foot, then pull the trigger?"*
Hierarchical GOAP asks: *"What is my high-level strategy (e.g., Flank)? Okay, now how do I execute that strategy?"*

It splits the brain into two (or more) layers:

* **High-Level Planner (The General):** Deals with abstract goals like "Secure Area," "Assault," or "Retreat."
* **Low-Level Planner (The Soldier):** Deals with concrete actions like "Move to Cover," "Reload," or "Shoot."

---

## 2. How it works: Actions as Sub-Plans

In H-GOAP, an action in the high-level plan is actually a **Goal** for the low-level plan.

### Example: "The Assassination"

1. **High-Level Goal:** `isTargetEliminated: true`
2. **High-Level Plan:** `[InfiltrateBase, EliminateTarget, Escape]`
3. **Expansion:** The AI takes the first action, `InfiltrateBase`, and treats it as a **New Goal**.
4. **Low-Level Plan:** `[FindVent, CrawlThroughVent, DisableCamera]`

---

## 3. The Implementation Strategy

To build this, you don't necessarily need a new planner; you just need to structure your actions to "trigger" the next layer.

```typescript
// High-Level Action
class InfiltrateAction extends GOAPAction {
    public perform(worldState: WorldState): boolean {
        // This action doesn't "move" the NPC.
        // It starts a sub-planner with the goal of "InsideBase: true"
        const subGoal = { insideBase: true };
        const subPlan = this.subPlanner.plan(worldState, subGoal, this.lowLevelActions);
        
        // Execute the sub-plan...
        return true;
    }
}

```

---

## 4. Why Use H-GOAP?

### A. Performance (Search Space Reduction)

A flat GOAP planner with 100 actions searching for a 10-step plan has to explore millions of possibilities. An H-GOAP planner might search for a 3-step High-Level plan (from 10 options) and then a 3-step Low-Level plan (from 10 options). The math is much lighter: $10^3 + 10^3$ vs $100^{10}$.

### B. Long-Term Memory

Standard GOAP is notoriously "forgetful"—it re-plans constantly. H-GOAP provides **persistence**. The NPC stays committed to the "Infiltrate" strategy even if a single low-level action (like "Open Door") fails; it just finds a different low-level way to "Infiltrate."

### C. Meaningful Coordination

This is how *F.E.A.R.* handled squads.

* **Squad Level:** The Squad Leader plans to `Suppress` and `Flank`.
* **NPC Level:** NPC A receives the `Suppress` goal and plans `[FindCover, ShootLoop]`. NPC B receives the `Flank` goal and plans `[Sneak, MoveToSide]`.

---

## 5. Summary Table

| Feature | Standard GOAP | Hierarchical GOAP |
| --- | --- | --- |
| **Search Depth** | Deep (reaches for final goals) | Shallow (reaches for next "milestone") |
| **Complexity** | Simple to implement | Complex (needs multiple planners/states) |
| **Believability** | Great for puzzles | Great for long-term "life" behavior |
| **Performance** | Can lag with many actions | Extremely efficient |

---

## What's the final move?

H-GOAP is the final evolution of the concepts we've discussed. It combines **Planning** (GOAP) with **Hierarchy** (HSM/BT).
