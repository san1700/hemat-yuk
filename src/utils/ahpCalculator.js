/**
 * AHP Calculator — Analytic Hierarchy Process
 * Menentukan prioritas target tabungan berdasarkan 3 kriteria:
 * 1. Tingkat Urgensi (Primer vs Sekunder)
 * 2. Nominal Target (semakin kecil = semakin achievable)
 * 3. Tenggat Waktu / Deadline (semakin dekat = semakin urgent)
 *
 * Menggunakan skala Saaty untuk pairwise comparison.
 */

// ============================================================
// 1. PAIRWISE COMPARISON MATRIX (Pre-defined, skala Saaty)
// ============================================================
// Kriteria: [Urgensi, Nominal, Deadline]
// Urgensi vs Nominal = 3  (Urgensi moderately lebih penting)
// Urgensi vs Deadline = 2  (Urgensi sedikit lebih penting)
// Deadline vs Nominal = 2  (Deadline sedikit lebih penting)

const PAIRWISE_MATRIX = [
  [1,   3,   2  ],  // Urgensi
  [1/3, 1,   1/2],  // Nominal
  [1/2, 2,   1  ],  // Deadline
];

// Random Index (RI) for n=3 criteria (Saaty table)
const RI_3 = 0.58;

// ============================================================
// 2. HITUNG BOBOT KRITERIA (Eigen Vector via Column Sum Method)
// ============================================================

function calculateCriteriaWeights(matrix) {
  const n = matrix.length;

  // Step 1: Hitung jumlah tiap kolom
  const colSums = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      colSums[j] += matrix[i][j];
    }
  }

  // Step 2: Normalisasi matriks (bagi tiap elemen dengan jumlah kolomnya)
  const normalizedMatrix = matrix.map((row, i) =>
    row.map((val, j) => val / colSums[j])
  );

  // Step 3: Hitung rata-rata tiap baris → Eigen Vector (bobot)
  const weights = normalizedMatrix.map(row =>
    row.reduce((sum, val) => sum + val, 0) / n
  );

  return weights;
}

// ============================================================
// 3. CONSISTENCY RATIO (CR) CHECK
// ============================================================

function calculateConsistencyRatio(matrix, weights) {
  const n = matrix.length;

  // Step 1: Hitung weighted sum vector (A * w)
  const weightedSum = matrix.map(row =>
    row.reduce((sum, val, j) => sum + val * weights[j], 0)
  );

  // Step 2: Hitung λmax (lambda max)
  const lambdaValues = weightedSum.map((ws, i) => ws / weights[i]);
  const lambdaMax = lambdaValues.reduce((sum, val) => sum + val, 0) / n;

  // Step 3: Consistency Index (CI)
  const CI = (lambdaMax - n) / (n - 1);

  // Step 4: Consistency Ratio (CR) = CI / RI
  const CR = CI / RI_3;

  return {
    lambdaMax: parseFloat(lambdaMax.toFixed(4)),
    CI: parseFloat(CI.toFixed(4)),
    CR: parseFloat(CR.toFixed(4)),
    isConsistent: CR < 0.1, // CR < 10% = konsisten
  };
}

// ============================================================
// 4. SCORING FUNCTION — Hitung skor tiap Savings Goal
// ============================================================

/**
 * Menghitung prioritas AHP untuk array savings goals.
 * 
 * @param {Array} goals - Array of savings goal objects:
 *   { id, name, target: "Rp 5.000.000", current: "Rp 1.000.000",
 *     urgency: "primer"|"sekunder", deadline: "2026-12-31" }
 * @returns {Object} { rankedGoals, weights, consistency }
 */
export function calculateAHPPriority(goals) {
  // Jika kurang dari 2 goal, tidak perlu AHP
  if (!goals || goals.length < 2) {
    return {
      rankedGoals: (goals || []).map((g, i) => ({
        ...g,
        ahpScore: 1,
        ahpRank: 1,
        isTopPriority: goals?.length === 1,
      })),
      weights: { urgensi: 0.54, nominal: 0.16, deadline: 0.30 },
      consistency: { CR: 0, isConsistent: true },
    };
  }

  // Hitung bobot kriteria
  const weights = calculateCriteriaWeights(PAIRWISE_MATRIX);
  const consistency = calculateConsistencyRatio(PAIRWISE_MATRIX, weights);

  const parseAmount = (val) =>
    parseInt((val || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;

  // Hitung raw values untuk normalisasi
  const today = new Date();

  const rawScores = goals.map(goal => {
    // Kriteria 1: Urgensi (Benefit) — primer=1.0, sekunder=0.3
    const urgencyScore = (goal.urgency === 'primer') ? 1.0 : 0.3;

    // Kriteria 2: Nominal Target (Cost) — semakin kecil, semakin baik
    const nominalTarget = parseAmount(goal.target) || 1;

    // Kriteria 3: Deadline (Benefit) — semakin dekat, semakin urgent
    let deadlineDays;
    if (goal.deadline) {
      const deadlineDate = new Date(goal.deadline);
      deadlineDays = Math.max(1, Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24)));
    } else {
      // Jika tidak ada deadline, anggap 365 hari (prioritas rendah)
      deadlineDays = 365;
    }

    return {
      goal,
      urgencyScore,
      nominalTarget,
      deadlineDays,
    };
  });

  // Normalisasi: ubah semua ke skala 0-1
  const maxNominal = Math.max(...rawScores.map(r => r.nominalTarget));
  const minNominal = Math.min(...rawScores.map(r => r.nominalTarget));
  const maxDeadlineDays = Math.max(...rawScores.map(r => r.deadlineDays));
  const minDeadlineDays = Math.min(...rawScores.map(r => r.deadlineDays));

  const scoredGoals = rawScores.map(raw => {
    // Urgensi sudah ternormalisasi (0.3 atau 1.0)
    const normalizedUrgency = raw.urgencyScore;

    // Nominal (Cost → invert): semakin kecil target = skor lebih tinggi
    const normalizedNominal = maxNominal === minNominal
      ? 1
      : 1 - ((raw.nominalTarget - minNominal) / (maxNominal - minNominal));

    // Deadline (Benefit → invert days): semakin sedikit hari = skor lebih tinggi
    const normalizedDeadline = maxDeadlineDays === minDeadlineDays
      ? 1
      : 1 - ((raw.deadlineDays - minDeadlineDays) / (maxDeadlineDays - minDeadlineDays));

    // Skor AHP final = Σ(bobot × nilai ternormalisasi)
    const ahpScore =
      weights[0] * normalizedUrgency +
      weights[1] * normalizedNominal +
      weights[2] * normalizedDeadline;

    return {
      ...raw.goal,
      ahpScore: parseFloat(ahpScore.toFixed(4)),
      details: {
        urgensi: { raw: raw.urgencyScore, normalized: normalizedUrgency, weighted: weights[0] * normalizedUrgency },
        nominal: { raw: raw.nominalTarget, normalized: normalizedNominal, weighted: weights[1] * normalizedNominal },
        deadline: { raw: raw.deadlineDays, normalized: normalizedDeadline, weighted: weights[2] * normalizedDeadline },
      },
    };
  });

  // Sort descending by score
  scoredGoals.sort((a, b) => b.ahpScore - a.ahpScore);

  // Assign rank
  const rankedGoals = scoredGoals.map((g, i) => ({
    ...g,
    ahpRank: i + 1,
    isTopPriority: i === 0,
  }));

  return {
    rankedGoals,
    weights: {
      urgensi: parseFloat(weights[0].toFixed(4)),
      nominal: parseFloat(weights[1].toFixed(4)),
      deadline: parseFloat(weights[2].toFixed(4)),
    },
    consistency,
  };
}
