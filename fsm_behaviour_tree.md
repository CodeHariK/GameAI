* https://medium.com/@sion_denis/the-craft-of-behavior-trees-ab6b181ce21a

When building game AI, the choice between **Finite State Machines (FSMs)** and **Behaviour Trees (BTs)** often comes down to the complexity of the character and how much you value "brain-dead" simplicity versus "intelligent" flexibility.

Here is a breakdown of how they stack up against each other.

---

## 1. Finite State Machines (FSM)

An FSM is a collection of **States** and **Transitions**. The AI is always in exactly one state (e.g., *Idle*, *Patrol*, or *Attack*). When a specific condition is met (e.g., *Player Spotted*), it transitions to a new state.

* **Logic:** "If I am in State A and Event X happens, move to State B."
* **Pros:**
* **Intuitive:** Very easy to understand for simple behaviors.
* **Predictable:** You know exactly what the AI is doing at any moment.


* **Cons:**
* **The "Spaghetti" Problem:** As you add more states, the number of transitions grows exponentially. If you have 10 states, every state might need a transition to every other state, creating a messy web that is hard to debug.
* **Rigidity:** It’s difficult to interrupt a state for a global event (like taking damage) without adding transitions from every single state to a "Hurt" state.



---

## 2. Behaviour Trees (BT)

A Behaviour Tree is a hierarchical structure of **Tasks**. Instead of "states," the tree is "ticked" from the root. It evaluates conditions and executes actions based on a priority system using **Composites** (like Selectors and Sequences).

* **Logic:** "Check conditions from highest priority to lowest. If I can't *Attack*, then try to *Patrol*."
* **Pros:**
* **Modularity:** You can create a "Find Health" branch and plug it into any character's tree without rewriting logic.
* **Scalability:** Perfect for complex AI (like in *Halo* or *The Last of Us*). It handles interruptions and complex decision-making gracefully.
* **Hierarchical:** It naturally supports "fallback" behaviors if a primary goal fails.


* **Cons:**
* **Steep Learning Curve:** The logic (Success/Failure/Running) is less "human-readable" at a glance than a simple FSM.
* **Overhead:** Every tick requires traversing the tree, which is slightly more computationally expensive than an FSM (though usually negligible in modern games).



---

## Comparison Table

| Feature | Finite State Machine (FSM) | Behaviour Tree (BT) |
| --- | --- | --- |
| **Structure** | Graph (Nodes & Edges) | Tree (Hierarchical) |
| **Best For** | Simple NPCs, Doors, UI | Complex Combat AI, Companions |
| **Maintenance** | Hard to scale (Spaghetti code) | Easy to scale (Modular) |
| **Reusability** | Low | High |
| **State** | Exclusive (One at a time) | Conditional (Tick-based evaluation) |

---

## Which one should you use?

* **Use an FSM if:** You are making a simple platformer enemy (Goombas), a locked door, or a simple boss with distinct "phases."
* **Use a Behaviour Tree if:** You are building a tactical shooter, a stealth game, or any NPC that needs to react dynamically to a changing environment.

**Would you like me to write a code snippet showing how a simple "Patrol vs. Chase" logic looks in either system?**
