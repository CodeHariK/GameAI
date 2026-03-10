export class ResponseCurve {
    /**
     * Linear: u = x
     * Simple 1:1 relationship.
     */
    static linear(x: number): number {
        return Math.max(0, Math.min(1, x));
    }

    /**
     * Exponential (Panic/Desire): u = x^k
     * k > 1 creates a 'slow start, fast finish' (Panic).
     * k < 1 creates a 'fast start, slow finish' (Diminishing returns).
     */
    static exponential(x: number, k: number = 2): number {
        return Math.pow(Math.max(0, Math.min(1, x)), k);
    }

    /**
     * Logistic (The S-Curve): u = 1 / (1 + e^-k(x-c))
     * This mimics human decision making perfectly.
     * @param k The 'steepness' of the curve.
     * @param c The 'inflection point' (where the AI starts to care).
     */
    static logistic(x: number, k: number = 10, c: number = 0.5): number {
        const exponent = -k * (x - c);
        return 1 / (1 + Math.exp(exponent));
    }

    static threshold(x: number, threshold: number): number {
        return x >= threshold ? x : 0;
    }
}
