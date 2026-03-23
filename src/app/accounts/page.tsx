'use client'

import React, { useState } from 'react'
import {
  Plus,
  Wallet,
  Banknote,
  CreditCard,
  LineChart,
  Building2,
  Edit2,
  Trash2,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { formatCurrency, generateId } from '@/lib/utils'
import { Account, AccountType, accountTypeConfig } from '@/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Banknote,
  CreditCard,
  LineChart,
  Building2,
  Wallet,
}

export default function AccountsPage() {
  const { accounts, totalAssets, addAccount, updateAccount, deleteAccount } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as AccountType,
    balance: '',
    note: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const accountData: Account = {
      id: editingAccount?.id || generateId(),
      name: formData.name,
      type: formData.type,
      balance: parseFloat(formData.balance) || 0,
      currency: 'CNY',
      note: formData.note,
      createdAt: editingAccount?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    if (editingAccount) {
      updateAccount(editingAccount.id, accountData)
    } else {
      addAccount(accountData)
    }

    setFormData({ name: '', type: 'bank', balance: '', note: '' })
    setShowAddModal(false)
    setEditingAccount(null)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      note: account.note || '',
    })
    setShowAddModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个账户吗？')) {
      deleteAccount(id)
    }
  }

  const groupedAccounts = accounts.reduce((groups, account) => {
    const type = account.type
    if (!groups[type]) groups[type] = []
    groups[type].push(account)
    return groups
  }, {} as Record<AccountType, Account[]>)

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">账户管理</h1>
          <p className="text-gray-500 dark:text-gray-400">
            总资产: {formatCurrency(totalAssets)}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加账户
        </Button>
      </div>

      {/* Account Groups */}
      {Object.entries(groupedAccounts).map(([type, typeAccounts]) => {
        const config = accountTypeConfig[type as AccountType]
        const Icon = iconMap[config?.icon || 'Wallet']
        const groupTotal = typeAccounts.reduce((sum, a) => sum + a.balance, 0)

        return (
          <Card key={type} className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-primary-500" />
                  {config?.label || type}
                </CardTitle>
                <span className="text-sm font-medium">
                  {formatCurrency(groupTotal)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {typeAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div>
                      <p className="font-medium">{account.name}</p>
                      {account.note && (
                        <p className="text-sm text-gray-500">{account.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {formatCurrency(account.balance)}
                      </span>
                      <button
                        onClick={() => handleEdit(account)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Empty State */}
      {accounts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">还没有账户</h3>
            <p className="text-gray-500 text-center mt-2 max-w-xs">
              添加你的银行账户、投资账户等，开始追踪资产
            </p>
            <Button onClick={() => setShowAddModal(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              添加账户
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
                <CardTitle>{editingAccount ? '编辑账户' : '添加账户'}</CardTitle>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingAccount(null)
                    setFormData({ name: '', type: 'bank', balance: '', note: '' })
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
                  <label className="block text-sm font-medium mb-1">账户名称</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="如: 招商银行储蓄卡"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">账户类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as AccountType })
                    }
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-950"
                  >
                    {Object.entries(accountTypeConfig).map(([type, config]) => (
                      <option key={type} value={type}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">当前余额</label>
                  <Input
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    placeholder="0.00"
                    required
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
                      setEditingAccount(null)
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingAccount ? '保存' : '添加'}
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
