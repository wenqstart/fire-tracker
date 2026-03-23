// FIRE 计算器

export interface FireCalculation {
  targetAmount: number
  currentAmount: number
  monthlyExpenses: number
  monthlyIncome: number
  withdrawalRate?: number // 提款率，默认0.04 (4%法则)
  expectedReturn?: number // 预期年化收益率，默认0.07 (7%)
}

export interface FireResult {
  progress: number // 完成百分比
  yearsToRetire: number // 距离退休年数
  targetDate: Date // 预计退休日期
  monthlySavings: number // 月储蓄额
  savingsRate: number // 储蓄率
  passiveIncomeAtRetire: number // 退休时被动收入
  isOnTrack: boolean // 是否按计划进行
}

/**
 * 使用4%法则计算FIRE目标金额
 * 目标金额 = 年支出 / 提款率
 */
export function calculateFireTarget(
  annualExpenses: number,
  withdrawalRate: number = 0.04
): number {
  return annualExpenses / withdrawalRate
}

/**
 * 计算FIRE进度和预期退休时间
 */
export function calculateFireProgress(params: FireCalculation): FireResult {
  const {
    targetAmount,
    currentAmount,
    monthlyExpenses,
    monthlyIncome,
    withdrawalRate = 0.04,
    expectedReturn = 0.07, // 默认7%年化收益
  } = params

  // 完成百分比
  const progress = Math.min(currentAmount / targetAmount, 1)

  // 月储蓄额
  const monthlySavings = monthlyIncome - monthlyExpenses

  // 储蓄率
  const savingsRate = monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0

  // 剩余需要积累的金额
  const remaining = targetAmount - currentAmount

  // 计算达到目标所需时间（考虑复利）
  let yearsToRetire = 0

  if (remaining <= 0) {
    yearsToRetire = 0
  } else if (monthlySavings <= 0) {
    yearsToRetire = Infinity // 无法达成
  } else {
    // 使用复利公式计算
    // FV = P * [(1 + r)^n - 1] / r + PV * (1 + r)^n
    // 简化计算：使用迭代法
    const monthlyReturn = expectedReturn / 12
    let accumulated = currentAmount
    let months = 0
    const maxMonths = 600 // 最多50年

    while (accumulated < targetAmount && months < maxMonths) {
      accumulated = accumulated * (1 + monthlyReturn) + monthlySavings
      months++
    }

    yearsToRetire = months / 12
  }

  // 预计退休日期
  const targetDate = new Date()
  targetDate.setFullYear(targetDate.getFullYear() + Math.ceil(yearsToRetire))

  // 退休时被动收入
  const passiveIncomeAtRetire = targetAmount * withdrawalRate

  // 是否按计划（假设目标是在25年内退休）
  const isOnTrack = yearsToRetire <= 25

  return {
    progress,
    yearsToRetire,
    targetDate,
    monthlySavings,
    savingsRate,
    passiveIncomeAtRetire,
    isOnTrack,
  }
}

/**
 * 计算退休后可以提取的月收入
 */
export function calculateMonthlyWithdrawal(
  portfolioValue: number,
  withdrawalRate: number = 0.04
): number {
  return (portfolioValue * withdrawalRate) / 12
}

/**
 * 计算需要多少年才能达到FIRE
 * 基于当前储蓄率和收益率
 */
export function calculateYearsToFIRE(
  savingsRate: number,
  expectedReturn: number = 0.07,
  withdrawalRate: number = 0.04
): number {
  // 使用简化的FIRE计算公式
  // 年数 = ln(目标倍数) / ln(1 + 实际收益率)
  // 目标倍数 = (1 - 储蓄率) / (储蓄率 * 提款率)

  if (savingsRate <= 0) return Infinity
  if (savingsRate >= 1) return 0

  const targetMultiple = (1 - savingsRate) / (savingsRate * withdrawalRate)
  const realReturn = expectedReturn - 0.03 // 考虑3%通胀

  return Math.log(targetMultiple) / Math.log(1 + realReturn)
}

/**
 * 根据目标退休年限计算所需储蓄率
 */
export function calculateRequiredSavingsRate(
  yearsToRetire: number,
  expectedReturn: number = 0.07,
  withdrawalRate: number = 0.04
): number {
  const realReturn = expectedReturn - 0.03

  // 反推储蓄率
  const targetMultiple = Math.pow(1 + realReturn, yearsToRetire)
  const savingsRate = 1 / (1 + targetMultiple * withdrawalRate)

  return savingsRate
}

/**
 * 情景分析：不同储蓄率下的退休时间
 */
export function analyzeScenarios(
  monthlyIncome: number,
  monthlyExpenses: number,
  expectedReturn: number = 0.07
): Array<{ savingsRate: number; yearsToRetire: number }> {
  const scenarios = []
  const rates = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]

  for (const savingsRate of rates) {
    const years = calculateYearsToFIRE(savingsRate, expectedReturn)
    scenarios.push({
      savingsRate,
      yearsToRetire: Math.round(years * 10) / 10,
    })
  }

  return scenarios
}
