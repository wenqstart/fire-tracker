'use client'

import React from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Plus,
  ArrowRight,
  Target,
  DollarSign,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/lib/store'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { calculateFireProgress } from '@/lib/fire-calculator'

export default function HomePage() {
  const {
    accounts,
    liabilities,
    transactions,
    fireGoals,
    totalAssets,
    totalLiabilities,
    netWorth,
  } = useStore()

  // 计算本月收支
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthTransactions = transactions.filter((t) => new Date(t.date) >= monthStart)

  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const savingsRate = monthIncome > 0 ? (monthIncome - monthExpenses) / monthIncome : 0

  // FIRE 进度计算
  const primaryGoal = fireGoals[0]
  const fireProgress = primaryGoal
    ? calculateFireProgress({
        targetAmount: primaryGoal.targetAmount,
        currentAmount: netWorth,
        monthlyExpenses: primaryGoal.monthlyExpenses,
        monthlyIncome: monthIncome,
        withdrawalRate: primaryGoal.withdrawalRate,
      })
    : null

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          财务概览
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Net Worth Card */}
      <Card className="mb-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100">净资产</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(netWorth, 'CNY')}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white/10 p-3">
              <div className="flex items-center gap-2 text-primary-100">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">总资产</span>
              </div>
              <p className="mt-1 font-semibold">
                {formatCurrency(totalAssets, 'CNY')}
              </p>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <div className="flex items-center gap-2 text-primary-100">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm">总负债</span>
              </div>
              <p className="mt-1 font-semibold">
                {formatCurrency(totalLiabilities, 'CNY')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <Link href="/ledger?action=add">
          <div className="flex flex-col items-center rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900">
              <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="mt-2 text-xs text-gray-600 dark:text-gray-300">记账</span>
          </div>
        </Link>
        <Link href="/accounts">
          <div className="flex flex-col items-center rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900">
              <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="mt-2 text-xs text-gray-600 dark:text-gray-300">账户</span>
          </div>
        </Link>
        <Link href="/liabilities">
          <div className="flex flex-col items-center rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900">
              <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="mt-2 text-xs text-gray-600 dark:text-gray-300">负债</span>
          </div>
        </Link>
        <Link href="/goals">
          <div className="flex flex-col items-center rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="mt-2 text-xs text-gray-600 dark:text-gray-300">目标</span>
          </div>
        </Link>
      </div>

      {/* FIRE Progress */}
      {fireProgress && primaryGoal && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary-500" />
              FIRE 进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold">
                {formatPercent(fireProgress.progress)}
              </span>
              <span className="text-sm text-gray-500">
                目标: {formatCurrency(primaryGoal.targetAmount)}
              </span>
            </div>
            <Progress value={fireProgress.progress * 100} color="#f97316" />

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">预计退休</span>
                <p className="font-medium">
                  {fireProgress.yearsToRetire > 100
                    ? '遥遥无期'
                    : `${fireProgress.yearsToRetire.toFixed(1)} 年后`}
                </p>
              </div>
              <div>
                <span className="text-gray-500">储蓄率</span>
                <p className="font-medium">{formatPercent(savingsRate)}</p>
              </div>
            </div>

            <Link href="/goals">
              <Button variant="ghost" className="w-full mt-4">
                查看详情 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* This Month Summary */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>本月收支</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">收入</p>
              <p className="text-lg font-semibold text-green-500">
                +{formatCurrency(monthIncome)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">支出</p>
              <p className="text-lg font-semibold text-red-500">
                -{formatCurrency(monthExpenses)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">结余</p>
              <p
                className={`text-lg font-semibold ${
                  monthIncome - monthExpenses >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {formatCurrency(Math.abs(monthIncome - monthExpenses))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {accounts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              开始追踪你的财务
            </h3>
            <p className="text-gray-500 text-center mt-2 max-w-xs">
              添加你的第一个账户，开始追踪你的资产和负债情况
            </p>
            <Link href="/accounts?action=add">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                添加账户
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>最近交易</CardTitle>
              <Link href="/ledger" className="text-sm text-primary-500">
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.note || transaction.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
