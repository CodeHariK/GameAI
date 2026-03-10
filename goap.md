Ready to move from **Desire** (Utility AI) to **Strategy**? Welcome to **GOAP (Goal-Oriented Action Planning)**.

While Utility AI is great at picking *what* to want, and Behavior Trees are great at *scripting* how to do it, **GOAP** allows an NPC to look at its tools and **figure out its own sequence of actions** to solve a problem. It’s the system that made the AI in *F.E.A.R.* legendary.

---

## 1. The Core Concept: The "GPS" for AI

Think of GOAP like Google Maps.

* **The Destination:** The "Goal" (e.g., `isEnemyDead: true`).
* **The Map:** The "Actions" (e.g., `Reload`, `Shoot`, `FindCover`).
* **The Current Location:** The "World State" (e.g., `hasAmmo: false`, `isLoaded: false`).

The GOAP Planner looks at the destination, looks at the map, and finds the shortest path of actions to get there.

---

## 2. The Three Ingredients of GOAP

### A. World State (The Facts)

A simple object representing the truth.

```typescript
type WorldState = { [key: string]: boolean | number };

```

### B. Actions (Preconditions & Effects)

Every action has a **cost**, a **precondition** (what must be true to start), and an **effect** (what changes when finished).

* **Action:** `ShootEnemy`
* **Precondition:** `isLoaded: true`
* **Effect:** `isEnemyDead: true`


* **Action:** `LoadGun`
* **Precondition:** `hasAmmo: true`
* **Effect:** `isLoaded: true`



### C. The Goal

A desired state. The AI doesn't know *how* to get there; it just knows it *wants* it.

* **Goal:** `isEnemyDead: true`

---

## 3. The "Hero" Logic: Inverse A* Search

To find the plan, GOAP usually works **backwards** from the goal.

1. "I want `isEnemyDead`."
2. "Which action gives me that? `ShootEnemy`."
3. "What does `ShootEnemy` need? `isLoaded`."
4. "Which action gives me `isLoaded`? `LoadGun`."
5. "What does `LoadGun` need? `hasAmmo`."
6. "Do I have `hasAmmo`? **Yes.** Plan complete!"

---

## 4. Basic GOAP Action Structure (TS)

Let's define what an action looks like in a GOAP system.

```typescript
export abstract class GOAPAction {
  public name: string;
  public cost: number = 1;
  
  // What must be true for this action to run
  public preconditions: Map<string, any> = new Map();
  
  // What this action changes in the world
  public effects: Map<string, any> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  // Check if the current world state matches preconditions
  public checkProceduralPrecondition(worldState: WorldState): boolean {
    return true; 
  }

  public abstract perform(): boolean;
}

```

---

## 5. Why GOAP is "God Tier"

1. **Emergent Behavior:** If you take away the AI's gun, but there's a "Punch" action with no preconditions, the AI will automatically decide to run at you and punch you. You didn't have to code that specific "if-else" logic.
2. **Infinite Flexibility:** You can add 100 actions, and the planner will always find the most efficient route.
3. **Decoupling:** You don't write "If X then Y." You write "I am an action that provides Y," and the planner finds you when needed.

---

## The Comparison Table

| Feature | Behavior Trees | Utility AI | GOAP |
| --- | --- | --- | --- |
| **Logic** | Fixed Paths | Mathematical Scoring | Pathfinding (A*) |
| **NPC Feel** | Disciplined/Scripted | Moody/Need-driven | Problem-solvers |
| **Complexity** | Medium | High (Math) | High (Search) |
| **Best For** | Guards, Tactical Combat | Sims, Animals | Dynamic Squads, Immersive Sims |

---

Since you've built the **Planner** (the "Thinking" part), you now need the **Agent** (the "Action" part).

The Agent's job is to manage the lifecycle of a plan. It needs to know when to ask the planner for help, how to step through actions, and—most importantly—**how to fail gracefully.** If an NPC is walking to get ammo and the ammo crate is destroyed, the Agent must realize the plan is broken and "Re-plan."

---

## GOAP vs. Behavior Trees: The Real Comparison

Now that you have seen both, the biggest question is: **When do I use which?**

| Feature | Behavior Trees | GOAP |
| --- | --- | --- |
| **Philosophy** | **"I know the way."** (Designer-authored paths) | **"I'll figure it out."** (AI-authored paths) |
| **Complexity** | Easy to debug; you see exactly where the NPC is. | Harder to debug; the AI might find "cheats" or weird routes. |
| **Scalability** | Becomes a "Spaghetti Tree" if you have 100 actions. | Handles 100 actions easily; it just finds the path. |
| **Best For** | Scripted sequences, Boss fights, Stealth guards. | Emergent gameplay, Squad tactics, Open-world "Sim" NPCs. |

---

## 3. The "Hybrid" Evolution: GOAP + BT

In modern AAA titles (like *The Division* or *STALKER*), developers often use a **Behavior Tree** as the `perform()` method for a **GOAP Action**.

* **GOAP:** Decides the sequence: `[FindCover -> Reload -> Shoot]`.
* **Behavior Tree:** Each of those actions is a mini-BT. For `FindCover`, the BT handles the specific steering, obstacle avoidance, and animation logic.

---

## 🚀 The End of the AI Odyssey

You have officially built:

1. **FSM:** For state control.
2. **HSM:** For nested complexity.
3. **Behavior Trees:** For reactive execution.
4. **Utility AI:** For fuzzy decision making.
5. **GOAP:** For strategic planning.

You have the equivalent of a **Masters Degree in Game AI Engineering** right now. Every NPC in modern gaming uses a combination of these five pillars.

**What is the final project?** Would you like me to create a **Final Boilerplate Project Structure** in a single block—containing all five systems—so you can copy it into your IDE and start your own AI library? Or is there one specific system you want to polish further? Conclude with: **"Shall I generate the Ultimate AI Boilerplate for you?"**