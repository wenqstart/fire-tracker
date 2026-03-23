'use client'

import React, { useState } from 'react'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  X,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { formatCurrency, generateId } from '@/lib/utils'
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  categoryConfig,
} from '@/types'

export default function LedgerPage() {
  const { accounts, transactions, addTransaction, deleteTransaction } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    category: 'food' as TransactionCategory,
    amount: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const transaction: Transaction = {
      id: generateId(),
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount) || 0,
      accountId: formData.accountId || accounts[0]?.id || '',
      date: new Date(formData.date),
      note: formData.note,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    addTransaction(transaction)
    setFormData({
      type: 'expense',
      category: 'food',
      amount: '',
      accountId: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    })
    setShowAddModal(false)
  }

  // 本月统计
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthTransactions = transactions.filter((t) => new Date(t.date) >= monthStart)

  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // 按日期分组
  const groupedByDate = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString('zh-CN')
    if (!groups[date]) groups[date] = []
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, Transaction[]>)

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  const incomeCategories = Object.entries(categoryConfig).filter(([key]) =>
    key.includes('income')
  )
  const expenseCategories = Object.entries(categoryConfig).filter(
    ([key]) => !key.includes('income')
  )

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">记账</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          记一笔
        </Button>
      </div>

      {/* Monthly Summary */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">收入</p>
              <p className="text-lg font-semibold text-green-500">
                +{formatCurrency(monthIncome)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">支出</p>
              <p className="text-lg font-semibold text-red-500">
                -{formatCurrency(monthExpenses)}
              </p>
            </div>
            <div className="text-center">
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

      {/* Transaction List */}
      {sortedDates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">还没有记录</h3>
            <p className="text-gray-500 text-center mt-2 max-w-xs">
              记录你的第一笔收支，开始追踪消费
            </p>
            <Button onClick={() => setShowAddModal(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              记一笔
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <Card key={date}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {date}
                  </CardTitle>
                  <span className="text-sm">
                    {(() => {
                      const dayIncome = groupedByDate[date]
                        .filter((t) => t.type === 'income')
                        .reduce((sum, t) => sum + t.amount, 0)
                      const dayExpense = groupedByDate[date]
                        .filter((t) => t.type === 'expense')
                        .reduce((sum, t) => sum + t.amount, 0)
                      return (
                        <>
                          {dayIncome > 0 && (
                            <span className="text-green-500 mr-2">
                              +{formatCurrency(dayIncome)}
                            </span>
                          )}
                          {dayExpense > 0 && (
                            <span className="text-red-500">
                              -{formatCurrency(dayExpense)}
                            </span>
                          )}
                        </>
                      )
                    })()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {groupedByDate[date].map((transaction) => {
                    const config = categoryConfig[transaction.category]

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              transaction.type === 'income'
                                ? 'bg-green-100 dark:bg-green-900'
                                : 'bg-red-100 dark:bg-red-900'
                            }`}
                            style={{ backgroundColor: `${config.color}20` }}
                          >
                            {transaction.type === 'income' ? (
                              <TrendingUp className="h-5 w-5" style={{ color: config.color }} />
                            ) : transaction.type === 'transfer' ? (
                              <ArrowRightLeft className="h-5 w-5" style={{ color: config.color }} />
                            ) : (
                              <TrendingDown className="h-5 w-5" style={{ color: config.color }} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{config.label}</p>
                            {transaction.note && (
                              <p className="text-sm text-gray-500">{transaction.note}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-semibold ${
                              transaction.type === 'income'
                                ? 'text-green-500'
                                : transaction.type === 'transfer'
                                ? 'text-blue-500'
                                : 'text-red-500'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                          <button
                            onClick={() => {
                              if (confirm('确定要删除这条记录吗？')) {
                                deleteTransaction(transaction.id)
                              }
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <Card className="w-full sm:max-w-md rounded-b-none sm:rounded-b-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>记一笔</CardTitle>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Tabs */}
                <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                  {[
                    { type: 'expense', label: '支出' },
                    { type: 'income', label: '收入' },
                    { type: 'transfer', label: '转账' },
                  ].map(({ type, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: type as TransactionType,
                          category: type === 'income' ? 'salary' : 'food',
                        })
                      }
                      className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                        formData.type === type
                          ? 'bg-white shadow dark:bg-gray-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium mb-1">金额</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    className="text-2xl font-bold h-14"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">分类</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(formData.type === 'income' ? incomeCategories : expenseCategories).map(
                      ([key, config]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, category: key as TransactionCategory })
                          }
                          className={`p-2 rounded-lg text-center transition-colors ${
                            formData.category === key
                              ? 'bg-primary-50 dark:bg-primary-900'
                              : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center"
                            style={{ backgroundColor: `${config.color}20` }}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: config.color }}
                            />
                          </div>
                          <span className="text-xs">{config.label}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Account */}
                {accounts.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">账户</label>
                    <select
                      value={formData.accountId}
                      onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-950"
                    >
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">日期</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium mb-1">备注</label>
                  <Input
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="添加备注..."
                  />
                </div>

                <Button type="submit" className="w-full">
                  保存
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
