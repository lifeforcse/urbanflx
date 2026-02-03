// DecisionOptimizationEngine.js
// Client-side multi-objective optimization engine

const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));

function normalizeWeights(weights) {
  const sum = Object.values(weights).reduce((s, x) => s + x, 0);
  if (sum === 0) return weights;
  const normalized = {};
  Object.keys(weights).forEach(k => {
    normalized[k] = weights[k] / sum;
  });
  return normalized;
}

function deliveryScore(actualTime, maxAllowedTime) {
  if (maxAllowedTime <= 0) return 0;
  const v = 1 - (actualTime / maxAllowedTime);
  return clamp(v);
}

function freshnessScore(deliveryTime, k) {
  // Exponential decay model
  return clamp(Math.exp(-k * deliveryTime));
}

function costScore(actualCost, maxCost) {
  if (maxCost <= 0) return 0;
  return clamp(1 - (actualCost / maxCost));
}

function reliabilityScore(reliabilityPct) {
  return clamp(reliabilityPct / 100);
}

function computeFDSForStrategy(strategy, weights, scenarioParams) {
  // strategy: { id, vendor, supplier, deliveryTime, maxDelivery, cost, maxCost, reliabilityPct }
  // scenarioParams: { k, costMultiplier, deliveryMultiplier, reliabilityModifier }
  const deliveryTime = strategy.deliveryTime * (scenarioParams.deliveryMultiplier ?? 1);
  const actualCost = strategy.cost * (scenarioParams.costMultiplier ?? 1);
  const maxAllowed = strategy.maxDelivery || (deliveryTime * 1.5);
  const maxCost = strategy.maxCost || (actualCost * 1.5);
  const rel = clamp((strategy.reliabilityPct * (scenarioParams.reliabilityModifier ?? 1)), 0, 100);

  const dScore = deliveryScore(deliveryTime, maxAllowed);
  const fScore = freshnessScore(deliveryTime, scenarioParams.k || 0.04);
  const cScore = costScore(actualCost, maxCost);
  const rScore = reliabilityScore(rel);

  const FDS = (weights.Wd * dScore) + (weights.Wf * fScore) + (weights.Wc * cScore) + (weights.Wr * rScore);

  return {
    ...strategy,
    computed: {
      deliveryTime,
      actualCost,
      reliabilityPct: rel,
      DeliveryScore: dScore,
      FreshnessScore: fScore,
      CostScore: cScore,
      ReliabilityScore: rScore,
      FDS,
    }
  };
}

function rankStrategies(strategies, weights, scenarioParams) {
  const normalized = normalizeWeights(weights);
  const computed = strategies.map(s => computeFDSForStrategy(s, normalized, scenarioParams));
  computed.sort((a,b) => b.computed.FDS - a.computed.FDS);
  return { normalizedWeights: normalized, ranked: computed };
}

function adaptiveLearning(weights, metrics) {
  // metrics: { spoilageRiskPercent, avgDelay }
  // weights mutable copy
  let w = { ...weights };

  if (metrics.spoilageRiskPercent > 12) {
    w.Wf = (w.Wf || 0) + 0.03;
    w.Wc = (w.Wc || 0) - 0.02;
  }

  const delayThreshold = metrics.delayThreshold || 5; // minutes
  if (metrics.avgDelay > delayThreshold) {
    w.Wd = (w.Wd || 0) + 0.03;
    w.Wc = (w.Wc || 0) - 0.02;
  }

  const before = normalizeWeights(weights);
  const after = normalizeWeights(w);

  const delta = {
    Wd: after.Wd - before.Wd,
    Wf: after.Wf - before.Wf,
    Wc: after.Wc - before.Wc,
    Wr: after.Wr - before.Wr,
  };

  return { before, after, delta };
}

function sensitivityAnalysis(strategies, weights, scenarioParams, perturbations) {
  // perturbations: { trafficPct, costPct, decayPct }
  const base = rankStrategies(strategies, weights, scenarioParams);
  const baseTop = base.ranked[0];

  const perturbed = rankStrategies(strategies, weights, {
    k: (scenarioParams.k || 0.04) * (1 + (perturbations.decayPct || 0)/100),
    costMultiplier: (scenarioParams.costMultiplier || 1) * (1 + (perturbations.costPct || 0)/100),
    deliveryMultiplier: (scenarioParams.deliveryMultiplier || 1) * (1 + (perturbations.trafficPct || 0)/100),
    reliabilityModifier: (scenarioParams.reliabilityModifier || 1),
  });

  // compute impact per strategy as delta in FDS
  const impacts = base.ranked.map((s) => {
    const pert = perturbed.ranked.find(p => p.id === s.id) || null;
    const baseF = s.computed.FDS;
    const pertF = pert ? pert.computed.FDS : baseF;
    return {
      id: s.id,
      vendor: s.vendor,
      supplier: s.supplier,
      baseF,
      pertF,
      delta: pertF - baseF,
    };
  });

  return { baseTop, perturbed, impacts };
}

function monteCarloSimulation(strategies, weights, scenarioParams, iterations = 500) {
  // randomize deliveryTime +/- 20%, cost +/- 15%, decay k +/-20%
  const baseRanking = rankStrategies(strategies, weights, scenarioParams);
  const baseTopId = baseRanking.ranked[0]?.id;

  let results = [];
  let topCounts = {};

  for (let i=0;i<iterations;i++) {
    const randStrategies = strategies.map(s => ({ ...s }));
    const kNoise = (Math.random()*0.4 - 0.2); // -20% to +20%
    const costNoise = (Math.random()*0.3 - 0.15);
    const delayNoise = (Math.random()*0.4 - 0.2);

    const sc = {
      ...scenarioParams,
      k: (scenarioParams.k || 0.04) * (1 + kNoise),
      costMultiplier: (scenarioParams.costMultiplier || 1) * (1 + costNoise),
      deliveryMultiplier: (scenarioParams.deliveryMultiplier || 1) * (1 + delayNoise),
    };

    const ranked = rankStrategies(randStrategies, weights, sc).ranked;
    const topId = ranked[0]?.id;
    topCounts[topId] = (topCounts[topId] || 0) + 1;
    results.push(ranked.map(r => r.computed.FDS));
  }

  // aggregate
  const flat = results.flat();
  const meanF = flat.reduce((s,x) => s + x, 0) / flat.length;
  const best = Math.max(...flat);
  const worst = Math.min(...flat);

  // stability: percentage of iterations where baseTop stayed top
  const stability = ((topCounts[baseTopId] || 0) / iterations) * 100;

  return { meanF, best, worst, stability, topCounts };
}

export default {
  normalizeWeights,
  deliveryScore,
  freshnessScore,
  costScore,
  reliabilityScore,
  computeFDSForStrategy,
  rankStrategies,
  adaptiveLearning,
  sensitivityAnalysis,
  monteCarloSimulation,
};
