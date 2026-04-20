export class Metrics {
  static computeEffectiveBranchingFactor(nodesExplored: number, depth: number): number {
    if (depth === 0) return 1;
    if (nodesExplored <= depth) return 1;

    // We want to solve N = 1 + b* + b*^2 + ... + b*^d for b*
    // Let f(b) = (b^(d+1) - 1) / (b - 1) - (N+1) = 0   (approx)
    // We can use binary search or simple approximation
    // A simplified iterative approach:
    let low = 1.0;
    let high = Math.pow(nodesExplored, 1 / depth) + 1;
    let bStar = 1.0;
    const target = nodesExplored + 1; // N+1

    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2;
      let sum = 0;
      for (let j = 0; j <= depth; j++) {
        sum += Math.pow(mid, j);
      }

      if (sum < target) {
        low = mid;
      } else {
        high = mid;
      }
      bStar = mid;
    }

    return Number(bStar.toFixed(3));
  }
}
