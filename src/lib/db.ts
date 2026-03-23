import Dexie, { Table } from 'dexie'
import {
  Account,
  Liability,
  Transaction,
  FireGoal,
  Budget,
  AssetSnapshot,
  AppSettings,
} from '@/types'

export class FireTrackerDB extends Dexie {
  accounts!: Table<Account>
  liabilities!: Table<Liability>
  transactions!: Table<Transaction>
  fireGoals!: Table<FireGoal>
  budgets!: Table<Budget>
  assetSnapshots!: Table<AssetSnapshot>
  settings!: Table<AppSettings>

  constructor() {
    super('FireTrackerDB')

    this.version(1).stores({
      accounts: 'id, name, type, createdAt',
      liabilities: 'id, name, type, createdAt',
      transactions: 'id, type, category, accountId, date, createdAt',
      fireGoals: 'id, name, createdAt',
      budgets: 'id, category, period, createdAt',
      assetSnapshots: 'id, date',
      settings: 'id',
    })
  }
}

export const db = new FireTrackerDB()

// 初始化默认设置
export async function initDefaultSettings() {
  const existing = await db.settings.get('default')
  if (!existing) {
    await db.settings.add({
      id: 'default',
      currency: 'CNY',
      language: 'zh-CN',
      theme: 'system',
      startPage: 'home',
    })
  }
}

// 获取设置
export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.get('default')
  return settings || {
    id: 'default',
    currency: 'CNY',
    language: 'zh-CN',
    theme: 'system',
    startPage: 'home',
  }
}

// 更新设置
export async function updateSettings(updates: Partial<AppSettings>) {
  await db.settings.update('default', updates)
}

// 生成唯一ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 计算总资产
export async function getTotalAssets(): Promise<number> {
  const accounts = await db.accounts.toArray()
  return accounts.reduce((sum, account) => sum + account.balance, 0)
}

// 计算总负债
export async function getTotalLiabilities(): Promise<number> {
  const liabilities = await db.liabilities.toArray()
  return liabilities.reduce((sum, liability) => sum + liability.amount, 0)
}

// 计算净资产
export async function getNetWorth(): Promise<number> {
  const assets = await getTotalAssets()
  const liabilities = await getTotalLiabilities()
  return assets - liabilities
}

// 保存资产快照
export async function saveAssetSnapshot() {
  const [totalAssets, totalLiabilities, netWorth] = await Promise.all([
    getTotalAssets(),
    getTotalLiabilities(),
    getNetWorth(),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 检查今天是否已有快照
  const existing = await db.assetSnapshots
    .where('date')
    .equals(today)
    .first()

  if (existing) {
    await db.assetSnapshots.update(existing.id, {
      totalAssets,
      totalLiabilities,
      netWorth,
    })
  } else {
    await db.assetSnapshots.add({
      id: generateId(),
      date: today,
      totalAssets,
      totalLiabilities,
      netWorth,
      createdAt: new Date(),
    })
  }
}

// 获取资产历史
export async function getAssetHistory(days: number = 30): Promise<AssetSnapshot[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return db.assetSnapshots
    .where('date')
    .aboveOrEqual(startDate)
    .toArray()
}
