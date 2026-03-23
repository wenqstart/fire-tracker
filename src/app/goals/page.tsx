'use client'

import React, { useState } from 'react'
import {
  Plus,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  X,
  Edit2,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/lib/store'
import { formatCurrency, formatPercent, generateId } from '@/lib/utils'
import { calculateFireProgress, analyzeScenarios } from '@/lib/fire-calculator'
import { FireGoal } from '@/types'

export default function GoalsPage() {
  const { fireGoals, netWorth, addFireGoal, updateFireGoal, deleteFireGoal, transactions } =
    useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<FireGoal | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    monthlyExpenses: '',
    withdrawalRate: '4',
    targetYear: '',
  })

  // 计算月收入
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthIncome = transactions
    .filter((t) => t.type === 'income' && new Date(t.date) >= monthStart)
    .reduce((sum, t) => sum + t.amount, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const targetDate = new Date()
    targetDate.setFullYear(parseInt(formData.targetYear) || targetDate.getFullYear() + 10)

    const goalData: FireGoal = {
      id: editingGoal?.id || generateId(),
      name: formData.name || 'FIRE 目标',
      targetAmount: parseFloat(formData.targetAmount) || 0,
      currentAmount: netWorth,
      targetDate,
      withdrawalRate: parseFloat(formData.withdrawalRate) / 100 || 0.04,
      monthlyExpenses: parseFloat(formData.monthlyExpenses) || 0,
      createdAt: editingGoal?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    if (editingGoal) {
      updateFireGoal(editingGoal.id, goalData)
    } else {
      addFireGoal(goalData)
    }

    setFormData({
      name: '',
      targetAmount: '',
      monthlyExpenses: '',
      withdrawalRate: '4',
      targetYear: '',
    })
    setShowAddModal(false)
    setEditingGoal(null)
  }

  const handleEdit = (goal: FireGoal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      monthlyExpenses: goal.monthlyExpenses.toString(),
      withdrawalRate: (goal.withdrawalRate * 100).toString(),
      targetYear: new Date(goal.targetDate).getFullYear().toString(),
    })
    setShowAddModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个目标吗？')) {
      deleteFireGoal(id)
    }
  }

  // 储蓄率情景分析
  const scenarios = analyzeScenarios(monthIncome, 0)

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FIRE 目标</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          设定目标
        </Button>
      </div>

      {/* Goals */}
      {fireGoals.length === 0 ? (
        <Card className="border-dashed mb-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">设定你的 FIRE 目标</h3>
            <p className="text-gray-500 text-center mt-2 max-w-xs">
              基于4%法则，计算你需要多少资金才能实现财务自由
            </p>
            <Button onClick={() => setShowAddModal(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              设定目标
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-6">
          {fireGoals.map((goal) => {
            const progress = calculateFireProgress({
              targetAmount: goal.targetAmount,
              currentAmount: netWorth,
              monthlyExpenses: goal.monthlyExpenses,
              monthlyIncome: monthIncome,
              withdrawalRate: goal.withdrawalRate,
            })

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary-500" />
                      {goal.name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-3xl font-bold">
                        {formatPercent(progress.progress)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(netWorth)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <Progress value={progress.progress * 100} color="#f97316" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Calendar className="h-4 w-4" />
                        预计退休
                      </div>
                      <p className="font-semibold">
                        {progress.yearsToRetire > 100
                          ? '需要调整计划'
                          : `${Math.ceil(progress.yearsToRetire)} 年后`}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <TrendingUp className="h-4 w-4" />
                        储蓄率
                      </div>
                      <p className="font-semibold">{formatPercent(progress.savingsRate)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <DollarSign className="h-4 w-4" />
                        月储蓄额
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(progress.monthlySavings)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Target className="h-4 w-4" />
                        退休后月收入
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(progress.passiveIncomeAtRetire / 12)}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div
                    className={`mt-4 p-3 rounded-lg ${
                      progress.isOnTrack
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-yellow-50 dark:bg-yellow-900/20'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        progress.isOnTrack ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {progress.isOnTrack
                        ? '🎉 按当前进度，你将在合理时间内实现目标！'
                        : '💡 建议提高储蓄率或调整目标金额'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 4% Rule Explanation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">💡 什么是 4% 法则？</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            4% 法则（也称 25 倍法则）是 FIRE 运动中常用的退休计算方法：
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>你需要积累年支出的 25 倍资产</li>
            <li>每年从投资组合中提取 4%</li>
            <li>理论上可以安全支撑 30 年以上的退休生活</li>
          </ul>
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="text-xs">
              <strong>公式：</strong>目标金额 = 年支出 ÷ 4% = 年支出 × 25
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📊 储蓄率与退休时间</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            不同储蓄率对应的退休年限（假设 7% 年化收益）
          </p>
          <div className="space-y-2">
            {scenarios.map(({ savingsRate, yearsToRetire }) => (
              <div key={savingsRate} className="flex items-center gap-3">
                <div className="w-20 text-sm font-medium">
                  {Math.round(savingsRate * 100)}%
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{
                      width: `${Math.min((1 - savingsRate) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="w-24 text-sm text-gray-500 text-right">
                  {yearsToRetire < 100 ? `${yearsToRetire} 年` : '很久'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingGoal ? '编辑目标' : '设定 FIRE 目标'}</CardTitle>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingGoal(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">目标名称</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="如: 40岁退休"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    目标金额 (元)
                  </label>
                  <Input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                    placeholder="如: 5000000"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    当前净资产: {formatCurrency(netWorth)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    预期月支出 (元)
                  </label>
                  <Input
                    type="number"
                    value={formData.monthlyExpenses}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyExpenses: e.target.value })
                    }
                    placeholder="如: 10000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">提款率 (%)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.withdrawalRate}
                      onChange={(e) =>
                        setFormData({ ...formData, withdrawalRate: e.target.value })
                      }
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">目标年份</label>
                    <Input
                      type="number"
                      value={formData.targetYear}
                      onChange={(e) =>
                        setFormData({ ...formData, targetYear: e.target.value })
                      }
                      placeholder={String(new Date().getFullYear() + 10)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingGoal(null)
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingGoal ? '保存' : '创建'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
