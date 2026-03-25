'use client'

import React, { useState } from 'react'
import {
  Plus,
  Home,
  Car,
  CreditCard,
  HandCoins,
  FileText,
  Edit2,
  Trash2,
  X,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { formatCurrency, generateId } from '@/lib/utils'
import { Liability, LiabilityType, liabilityTypeConfig } from '@/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Car,
  CreditCard,
  HandCoins,
  FileText,
}

export default function LiabilitiesPage() {
  const { liabilities, totalLiabilities, addLiability, updateLiability, deleteLiability } =
    useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'mortgage' as LiabilityType,
    amount: '',
    interestRate: '',
    monthlyPayment: '',
    remainingMonths: '',
    note: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const liabilityData: Liability = {
      id: editingLiability?.id || generateId(),
      name: formData.name,
      type: formData.type,
      amount: parseFloat(formData.amount) || 0,
      interestRate: parseFloat(formData.interestRate) || undefined,
      monthlyPayment: parseFloat(formData.monthlyPayment) || undefined,
      remainingMonths: formData.remainingMonths ? parseInt(formData.remainingMonths) : undefined,
      note: formData.note,
      createdAt: editingLiability?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    if (editingLiability) {
      updateLiability(editingLiability.id, liabilityData)
    } else {
      addLiability(liabilityData)
    }

    setFormData({
      name: '',
      type: 'mortgage',
      amount: '',
      interestRate: '',
      monthlyPayment: '',
      remainingMonths: '',
      note: '',
    })
    setShowAddModal(false)
    setEditingLiability(null)
  }

  const handleEdit = (liability: Liability) => {
    setEditingLiability(liability)
    setFormData({
      name: liability.name,
      type: liability.type,
      amount: liability.amount.toString(),
      interestRate: liability.interestRate?.toString() || '',
      monthlyPayment: liability.monthlyPayment?.toString() || '',
      remainingMonths: liability.remainingMonths?.toString() || '',
      note: liability.note || '',
    })
    setShowAddModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个负债吗？')) {
      deleteLiability(id)
    }
  }

  const monthlyTotal = liabilities.reduce(
    (sum, l) => sum + (l.monthlyPayment || 0),
    0
  )

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">负债管理</h1>
          <p className="text-gray-500 dark:text-gray-400">
            总负债: {formatCurrency(totalLiabilities)}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加负债
        </Button>
      </div>

      {/* Summary Card */}
      {liabilities.length > 0 && (
        <Card className="mb-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-red-100">总负债</p>
                <p className="text-2xl font-bold">{formatCurrency(totalLiabilities)}</p>
              </div>
              <div>
                <p className="text-red-100">月还款额</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liability List */}
      <div className="space-y-4">
        {liabilities.map((liability) => {
          const config = liabilityTypeConfig[liability.type]
          const Icon = iconMap[config?.icon || 'FileText']

          return (
            <Card key={liability.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900">
                      <Icon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">{liability.name}</h3>
                      <p className="text-sm text-gray-500">{config?.label}</p>
                      {liability.interestRate && (
                        <p className="text-xs text-gray-400 mt-1">
                          利率: {liability.interestRate}%
                        </p>
                      )}
                      {liability.remainingMonths && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          剩余 {liability.remainingMonths} 期
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-500">
                      {formatCurrency(liability.amount)}
                    </p>
                    {liability.monthlyPayment && (
                      <p className="text-sm text-gray-500">
                        月还: {formatCurrency(liability.monthlyPayment)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleEdit(liability)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-primary-500"
                  >
                    <Edit2 className="h-3 w-3" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(liability.id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                    删除
                  </button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {liabilities.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">太棒了！没有负债</h3>
            <p className="text-gray-500 text-center mt-2 max-w-xs">
              记录你的房贷、车贷等负债，更好地规划还款
            </p>
            <Button onClick={() => setShowAddModal(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              添加负债
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingLiability ? '编辑负债' : '添加负债'}</CardTitle>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingLiability(null)
                    setFormData({
                      name: '',
                      type: 'mortgage',
                      amount: '',
                      interestRate: '',
                      monthlyPayment: '',
                      remainingMonths: '',
                      note: '',
                    })
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
                  <label className="block text-sm font-medium mb-1">负债名称</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="如: 招商银行房贷"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">负债类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as LiabilityType })
                    }
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-950"
                  >
                    {Object.entries(liabilityTypeConfig).map(([type, config]) => (
                      <option key={type} value={type}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">负债金额</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">年利率 (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.interestRate}
                      onChange={(e) =>
                        setFormData({ ...formData, interestRate: e.target.value })
                      }
                      placeholder="如: 4.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">月还款额</label>
                    <Input
                      type="number"
                      value={formData.monthlyPayment}
                      onChange={(e) =>
                        setFormData({ ...formData, monthlyPayment: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">剩余期数</label>
                  <Input
                    type="number"
                    value={formData.remainingMonths}
                    onChange={(e) =>
                      setFormData({ ...formData, remainingMonths: e.target.value })
                    }
                    placeholder="如: 240 (可选)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">备注</label>
                  <Input
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="可选"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingLiability(null)
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingLiability ? '保存' : '添加'}
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