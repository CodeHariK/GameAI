Tic-Tac-Toe is the perfect "Hello World" for understanding game AI. While architectures like Goal-Oriented Action Planning (GOAP) focus on searching through a sequence of actions to reach a specific target state in a single-agent environment, algorithms like Minimax and MCTS focus on **adversarial search**—navigating a game tree where an opponent is actively trying to defeat you.

Here is how both algorithms tackle the exact same game.

---

### 1. Minimax: The Exhaustive Oracle

Minimax assumes that both players play optimally. It calculates the entire future of the game to ensure the best possible outcome, assuming the opponent will always make the move that is worst for you.

* **The Goal:** Maximize your score (e.g., $+1$ for a win) while the opponent tries to minimize it (e.g., $-1$ for your loss). A draw is $0$.
* **How it works in Tic-Tac-Toe:** From the current board state, the AI plays out *every single possible combination* of moves until the game ends (win, lose, or draw). It assigns a score to those final board states, and then works backward.
* **The Result:** Because Tic-Tac-Toe has a very small state space (a maximum of $3^9 = 19,683$ possible board states, and far fewer legal ones), Minimax can easily map the entire game tree. It will **never lose**. It plays a mathematically perfect game.

### 2. MCTS (Monte Carlo Tree Search): The Statistical Gambler

While Minimax looks at *every* possibility, MCTS realizes that in complex games (like Chess or Go), exploring every path takes too long. Instead of reading the whole book, it takes thousands of random samples to guess the ending.

* **The Goal:** Find the move with the highest statistical probability of winning based on random simulations.
* **How it works:** MCTS loops through four distinct phases thousands of times per turn:
1. **Selection:** Navigate the known game tree to find a promising, unexplored node.
2. **Expansion:** Add a new possible move to the tree.
3. **Simulation (Rollout):** Play a completely random game from that new move to the very end.
4. **Backpropagation:** Take the result of that random game (win/loss/draw) and update the stats of all the moves that led there.


* **The Result:** In Tic-Tac-Toe, if you give MCTS enough time (e.g., 1000 rollouts per turn), it will eventually figure out the optimal moves just like Minimax. However, if you restrict it to only 50 rollouts, it might make a mistake because it hasn't sampled enough futures.

---

### The Showdown

* **Minimax** says: "I have calculated all 255,168 possible game paths from a blank board. I know exactly how to force a draw or capitalize on your mistake."
* **MCTS** says: "I don't know the exact future, but I played 5,000 random games in my head just now. Putting my 'X' in the center won 80% of those random games, so I'll do that."
