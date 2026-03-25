// 账户类型
export type AccountType = 'cash' | 'bank' | 'investment' | 'provident_fund' | 'other'

// 账户
export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  icon?: string
  color?: string
  note?: string
  createdAt: Date
  updatedAt: Date
}

// 负债类型
export type LiabilityType = 'mortgage' | 'car_loan' | 'credit_card' | 'personal_loan' | 'other'

// 负债
export interface Liability {
  id: string
  name: string
  type: LiabilityType
  amount: number
  interestRate?: number
  monthlyPayment?: number
  remainingMonths?: number // 剩余期数
  note?: string
  createdAt: Date
  updatedAt: Date
}

// 交易类型
export type TransactionType = 'income' | 'expense' | 'transfer'

// 交易分类
export type TransactionCategory =
  // 收入分类
  | 'salary' | 'bonus' | 'investment_income' | 'other_income'
  // 支出分类
  | 'food' | 'transport' | 'shopping' | 'entertainment' | 'healthcare'
  | 'education' | 'housing' | 'utilities' | 'insurance' | 'other_expense'

// 交易记录
export interface Transaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  accountId: string
  toAccountId?: string // 转账目标账户
  date: Date
  note?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

// FIRE目标
export interface FireGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  withdrawalRate: number // 提款率，默认4%
  monthlyExpenses: number // 预期月支出
  createdAt: Date
  updatedAt: Date
}

// 预算
export interface Budget {
  id: string
  category: TransactionCategory
  amount: number
  period: 'monthly' | 'yearly'
  startDate: Date
  createdAt: Date
  updatedAt: Date
}

// 资产快照（用于记录历史数据）
export interface AssetSnapshot {
  id: string
  date: Date
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  createdAt: Date
}

// 应用设置
export interface AppSettings {
  id: string
  currency: string
  language: 'zh-CN' | 'en-US'
  theme: 'light' | 'dark' | 'system'
  startPage: 'home' | 'accounts' | 'ledger'
}

// 分类显示配置
export const categoryConfig: Record<TransactionCategory, { label: string; icon: string; color: string }> = {
  // 收入
  salary: { label: '工资', icon: 'Briefcase', color: '#10b981' },
  bonus: { label: '奖金', icon: 'Gift', color: '#8b5cf6' },
  investment_income: { label: '投资收益', icon: 'TrendingUp', color: '#3b82f6' },
  other_income: { label: '其他收入', icon: 'Plus', color: '#6b7280' },
  // 支出
  food: { label: '餐饮', icon: 'Utensils', color: '#f59e0b' },
  transport: { label: '交通', icon: 'Car', color: '#6366f1' },
  shopping: { label: '购物', icon: 'ShoppingBag', color: '#ec4899' },
  entertainment: { label: '娱乐', icon: 'Gamepad2', color: '#14b8a6' },
  healthcare: { label: '医疗', icon: 'Heart', color: '#ef4444' },
  education: { label: '教育', icon: 'BookOpen', color: '#0ea5e9' },
  housing: { label: '住房', icon: 'Home', color: '#84cc16' },
  utilities: { label: '水电', icon: 'Zap', color: '#eab308' },
  insurance: { label: '保险', icon: 'Shield', color: '#a855f7' },
  other_expense: { label: '其他支出', icon: 'MoreHorizontal', color: '#6b7280' },
}

// 账户类型配置
export const accountTypeConfig: Record<AccountType, { label: string; icon: string }> = {
  cash: { label: '现金', icon: 'Banknote' },
  bank: { label: '银行卡', icon: 'CreditCard' },
  investment: { label: '投资账户', icon: 'LineChart' },
  provident_fund: { label: '公积金', icon: 'Building2' },
  other: { label: '其他', icon: 'Wallet' },
}

// 负债类型配置
export const liabilityTypeConfig: Record<LiabilityType, { label: string; icon: string }> = {
  mortgage: { label: '房贷', icon: 'Home' },
  car_loan: { label: '车贷', icon: 'Car' },
  credit_card: { label: '信用卡', icon: 'CreditCard' },
  personal_loan: { label: '个人贷款', icon: 'HandCoins' },
  other: { label: '其他', icon: 'FileText' },
}
