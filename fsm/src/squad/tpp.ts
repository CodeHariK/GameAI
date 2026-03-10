export interface Vector2 {
    x: number;
    y: number;
}

export class TacticalPositionProvider {
    private width: number;
    private height: number;
    private step: number;
    private positions: { x: number; y: number; score: number }[] = [];

    constructor(width: number, height: number, step: number = 20) {
        this.width = width;
        this.height = height;
        this.step = step;
        this.generateGrid();
    }

    private generateGrid() {
        for (let x = 0; x < this.width; x += this.step) {
            for (let y = 0; y < this.height; y += this.step) {
                this.positions.push({ x, y, score: 0 });
            }
        }
    }

    public getBestPosition(
        target: Vector2,
        teammates: Vector2[],
        preferredDistance: number = 100,
        minSpacing: number = 40
    ): { x: number; y: number } {
        let bestPos = this.positions[0];
        let maxScore = -Infinity;

        for (const pos of this.positions) {
            let score = 0;

            // 1. Distance to target (Heavier weight)
            const distToTarget = this.distance(pos, target);
            const distError = Math.abs(distToTarget - preferredDistance);
            score -= distError * 0.8;

            // 2. Spacing from teammates
            let minTeammateDist = Infinity;
            for (const team of teammates) {
                const d = this.distance(pos, team);
                if (d < minTeammateDist) minTeammateDist = d;
            }

            if (minTeammateDist < minSpacing) {
                score -= (minSpacing - minTeammateDist) * 15; // Heavier penalty
            } else {
                score += Math.min(minTeammateDist, 100) * 0.2; // Better bonus
            }

            // 3. More random noise to prevent rigidity
            score += Math.random() * 5;

            if (score > maxScore) {
                maxScore = score;
                bestPos = pos;
            }
        }

        return { x: bestPos.x, y: bestPos.y };
    }

    private distance(a: Vector2, b: Vector2): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
}
