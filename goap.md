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

## Ready to build the Planner?

The "Heart" of GOAP is the **Planner**. It's essentially a pathfinding algorithm where the "nodes" aren't positions on a map, but **states of the world**.

**Would you like to build the `Planner` class and its A* search logic next?** Conclude with: **"Should we start by defining the `Node` for our search space?"**
