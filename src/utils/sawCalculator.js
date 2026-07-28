/**
 * SAW Calculator — Simple Additive Weighting
 * Mengevaluasi kesehatan finansial pengguna berdasarkan 3 kriteria:
 * 1. Rasio Tabungan (Benefit) — persentase income yang disisihkan
 * 2. Rasio Invisible Spending (Cost) — persentase pengeluaran gaya hidup
 * 3. Sisa Saldo Aman (Benefit) — saldo per hari yang tersisa
 *
 * Skor akhir: 0–100
 */

// ============================================================
// 1. BOBOT KRITERIA (Pre-defined)
// ============================================================
const WEIGHTS = {
  savingsRatio: 0.40,      // Rasio Tabungan (Benefit)
  invisibleSpending: 0.30,  // Rasio Invisible Spending (Cost)
  safeBalance: 0.30,        // Sisa Saldo Aman (Benefit)
};

// Kategori yang dianggap "Invisible Spending" / Gaya Hidup
export const INVISIBLE_CATEGORIES = ['Coffee', 'Lifestyle', 'Snacks'];

// ============================================================
// 2. STATUS LABEL BERDASARKAN SKOR
// ============================================================
function getScoreStatus(score) {
  if (score >= 80) {
    return {
      label: 'Sehat',
      emoji: '💚',
      color: '#10b981',        // Emerald
      bgColor: '#d1fae5',
      darkBgColor: 'rgba(16, 185, 129, 0.15)',
      description: 'Keuangan Anda sangat baik! Pertahankan pola ini.',
    };
  } else if (score >= 60) {
    return {
      label: 'Cukup Baik',
      emoji: '🟢',
      color: '#22c55e',        // Green
      bgColor: '#dcfce7',
      darkBgColor: 'rgba(34, 197, 94, 0.15)',
      description: 'Keuangan Anda cukup stabil, masih bisa ditingkatkan.',
    };
  } else if (score >= 40) {
    return {
      label: 'Waspada',
      emoji: '🟡',
      color: '#f59e0b',        // Amber
      bgColor: '#fef3c7',
      darkBgColor: 'rgba(245, 158, 11, 0.15)',
      description: 'Hati-hati! Kurangi pengeluaran tidak penting.',
    };
  } else {
    return {
      label: 'Kritis',
      emoji: '🔴',
      color: '#ef4444',        // Red
      bgColor: '#fee2e2',
      darkBgColor: 'rgba(239, 68, 68, 0.15)',
      description: 'Kondisi kritis! Segera evaluasi pengeluaran Anda.',
    };
  }
}

// ============================================================
// 3. FUNGSI UTAMA — Hitung Skor Finansial SAW
// ============================================================

/**
 * Menghitung skor kesehatan finansial menggunakan metode SAW.
 *
 * @param {Object} params
 * @param {number} params.monthlyIncome - Total pemasukan bulan ini
 * @param {number} params.monthlyExpense - Total pengeluaran bulan ini
 * @param {number} params.invisibleSpending - Total pengeluaran invisible (Coffee/Lifestyle/Snacks)
 * @param {number} params.currentBalance - Saldo saat ini
 * @param {number} params.remainingDays - Jumlah hari tersisa dalam bulan ini
 * @returns {Object} { score, status, breakdown, matrix }
 */
export function calculateFinancialScore({
  monthlyIncome = 0,
  monthlyExpense = 0,
  invisibleSpending = 0,
  currentBalance = 0,
  remainingDays = 1,
}) {
  // Guard: jika belum ada data, return skor default
  if (monthlyIncome === 0 && monthlyExpense === 0) {
    return {
      score: 0,
      status: getScoreStatus(0),
      breakdown: {
        savingsRatio: { raw: 0, normalized: 0, weighted: 0, label: 'Rasio Tabungan', type: 'benefit' },
        invisibleSpending: { raw: 0, normalized: 0, weighted: 0, label: 'Invisible Spending', type: 'cost' },
        safeBalance: { raw: 0, normalized: 0, weighted: 0, label: 'Saldo Aman/Hari', type: 'benefit' },
      },
      hasData: false,
    };
  }

  // ========================================
  // Step 1: Hitung Nilai Mentah tiap Kriteria
  // ========================================

  // C1: Rasio Tabungan (Benefit)
  // = (income - expense) / income → 0 hingga 1 (bisa negatif jika besar pasak)
  const rawSavingsRatio = monthlyIncome > 0
    ? Math.max(0, (monthlyIncome - monthlyExpense) / monthlyIncome)
    : 0;

  // C2: Rasio Invisible Spending (Cost)
  // = invisible / total expense → 0 hingga 1
  const rawInvisibleRatio = monthlyExpense > 0
    ? invisibleSpending / monthlyExpense
    : 0;

  // C3: Saldo Aman per Hari (Benefit)
  // = currentBalance / remainingDays
  const rawSafeBalance = remainingDays > 0
    ? Math.max(0, currentBalance / remainingDays)
    : 0;

  // ========================================
  // Step 2: Normalisasi Matriks SAW
  // ========================================
  // Untuk SAW, kita normalisasi relatif terhadap nilai ideal:
  // - Benefit: r = value / max (max ideal)
  // - Cost: r = min (ideal) / value

  // Nilai ideal (benchmark untuk mahasiswa)
  const IDEAL_SAVINGS_RATIO = 0.30;   // Ideal: sisihkan 30% income
  const IDEAL_INVISIBLE_RATIO = 0.10; // Ideal: hanya 10% expense untuk gaya hidup
  const IDEAL_SAFE_BALANCE = 50000;   // Ideal: minimal Rp 50.000/hari tersisa

  // C1: Benefit normalization — cap at ideal (bisa exceed = bonus)
  const normalizedSavings = Math.min(1, rawSavingsRatio / IDEAL_SAVINGS_RATIO);

  // C2: Cost normalization — semakin kecil semakin baik
  // Jika invisible ratio = 0 → sempurna (skor 1)
  // Jika > ideal → skor menurun
  const normalizedInvisible = rawInvisibleRatio <= 0
    ? 1
    : Math.min(1, IDEAL_INVISIBLE_RATIO / rawInvisibleRatio);

  // C3: Benefit normalization
  const normalizedSafeBalance = Math.min(1, rawSafeBalance / IDEAL_SAFE_BALANCE);

  // ========================================
  // Step 3: Hitung Skor SAW Final
  // ========================================
  // S = Σ(wᵢ × rᵢ) × 100

  const weightedSavings = WEIGHTS.savingsRatio * normalizedSavings;
  const weightedInvisible = WEIGHTS.invisibleSpending * normalizedInvisible;
  const weightedSafeBalance = WEIGHTS.safeBalance * normalizedSafeBalance;

  const rawScore = (weightedSavings + weightedInvisible + weightedSafeBalance) * 100;
  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  return {
    score,
    status: getScoreStatus(score),
    breakdown: {
      savingsRatio: {
        raw: parseFloat((rawSavingsRatio * 100).toFixed(1)),
        normalized: parseFloat(normalizedSavings.toFixed(4)),
        weighted: parseFloat(weightedSavings.toFixed(4)),
        label: 'Rasio Tabungan',
        type: 'benefit',
        detail: `${(rawSavingsRatio * 100).toFixed(1)}% dari income`,
      },
      invisibleSpending: {
        raw: parseFloat((rawInvisibleRatio * 100).toFixed(1)),
        normalized: parseFloat(normalizedInvisible.toFixed(4)),
        weighted: parseFloat(weightedInvisible.toFixed(4)),
        label: 'Invisible Spending',
        type: 'cost',
        detail: `${(rawInvisibleRatio * 100).toFixed(1)}% dari expense`,
      },
      safeBalance: {
        raw: Math.round(rawSafeBalance),
        normalized: parseFloat(normalizedSafeBalance.toFixed(4)),
        weighted: parseFloat(weightedSafeBalance.toFixed(4)),
        label: 'Saldo Aman/Hari',
        type: 'benefit',
        detail: `Rp ${Math.round(rawSafeBalance).toLocaleString('id-ID')}/hari`,
      },
    },
    weights: WEIGHTS,
    hasData: true,
  };
}
