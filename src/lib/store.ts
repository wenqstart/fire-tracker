import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Account,
  Liability,
  Transaction,
  FireGoal,
  Budget,
  AppSettings,
} from '@/types'

interface AppState {
  // 数据
  accounts: Account[]
  liabilities: Liability[]
  transactions: Transaction[]
  fireGoals: FireGoal[]
  budgets: Budget[]
  settings: AppSettings

  // 计算值
  totalAssets: number
  totalLiabilities: number
  netWorth: number

  // 操作 - 账户
  addAccount: (account: Account) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  deleteAccount: (id: string) => void

  // 操作 - 负债
  addLiability: (liability: Liability) => void
  updateLiability: (id: string, updates: Partial<Liability>) => void
  deleteLiability: (id: string) => void

  // 操作 - 交易
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // 操作 - FIRE目标
  addFireGoal: (goal: FireGoal) => void
  updateFireGoal: (id: string, updates: Partial<FireGoal>) => void
  deleteFireGoal: (id: string) => void

  // 操作 - 预算
  addBudget: (budget: Budget) => void
  updateBudget: (id: string, updates: Partial<Budget>) => void
  deleteBudget: (id: string) => void

  // 操作 - 设置
  updateSettings: (updates: Partial<AppSettings>) => void

  // 内部方法
  recalculateTotals: () => void
}

const defaultSettings: AppSettings = {
  id: 'default',
  currency: 'CNY',
  language: 'zh-CN',
  theme: 'system',
  startPage: 'home',
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始数据
      accounts: [],
      liabilities: [],
      transactions: [],
      fireGoals: [],
      budgets: [],
      settings: defaultSettings,

      // 计算值
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,

      // 账户操作
      addAccount: (account) =>
        set((state) => {
          const accounts = [...state.accounts, account]
          return { accounts }
        }),

      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
          ),
        })),

      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        })),

      // 负债操作
      addLiability: (liability) =>
        set((state) => ({
          liabilities: [...state.liabilities, liability],
        })),

      updateLiability: (id, updates) =>
        set((state) => ({
          liabilities: state.liabilities.map((l) =>
            l.id === id ? { ...l, ...updates, updatedAt: new Date() } : l
          ),
        })),

      deleteLiability: (id) =>
        set((state) => ({
          liabilities: state.liabilities.filter((l) => l.id !== id),
        })),

      // 交易操作
      addTransaction: (transaction) =>
        set((state) => {
          const transactions = [...state.transactions, transaction]
          // 更新账户余额
          const accounts = state.accounts.map((a) => {
            if (a.id === transaction.accountId) {
              const newBalance =
                transaction.type === 'income'
                  ? a.balance + transaction.amount
                  : transaction.type === 'expense'
                  ? a.balance - transaction.amount
                  : a.balance
              return { ...a, balance: newBalance, updatedAt: new Date() }
            }
            if (transaction.type === 'transfer' && a.id === transaction.toAccountId) {
              return { ...a, balance: a.balance + transaction.amount, updatedAt: new Date() }
            }
            return a
          })
          return { transactions, accounts }
        }),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      // FIRE目标操作
      addFireGoal: (goal) =>
        set((state) => ({
          fireGoals: [...state.fireGoals, goal],
        })),

      updateFireGoal: (id, updates) =>
        set((state) => ({
          fireGoals: state.fireGoals.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g
          ),
        })),

      deleteFireGoal: (id) =>
        set((state) => ({
          fireGoals: state.fireGoals.filter((g) => g.id !== id),
        })),

      // 预算操作
      addBudget: (budget) =>
        set((state) => ({
          budgets: [...state.budgets, budget],
        })),

      updateBudget: (id, updates) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date() } : b
          ),
        })),

      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),

      // 设置操作
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      // 重新计算总额
      recalculateTotals: () =>
        set((state) => {
          const totalAssets = state.accounts.reduce((sum, a) => sum + a.balance, 0)
          const totalLiabilities = state.liabilities.reduce((sum, l) => sum + l.amount, 0)
          const netWorth = totalAssets - totalLiabilities
          return { totalAssets, totalLiabilities, netWorth }
        }),
    }),
    {
      name: 'fire-tracker-storage',
      partialize: (state) => ({
        accounts: state.accounts,
        liabilities: state.liabilities,
        transactions: state.transactions,
        fireGoals: state.fireGoals,
        budgets: state.budgets,
        settings: state.settings,
      }),
    }
  )
)

// 初始化时重新计算总额
if (typeof window !== 'undefined') {
  useStore.getState().recalculateTotals()
}
