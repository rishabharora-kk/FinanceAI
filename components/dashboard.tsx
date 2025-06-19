"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, DollarSign, Brain, MessageCircle } from "lucide-react"
import { TransactionForm } from "./transaction-form"
import { TransactionList } from "./transaction-list"
import { AIInsights } from "./ai-insights"
import { BudgetOverview } from "./budget-overview"
import { ChatInterface } from "./chat-interface"

export interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  type: "income" | "expense"
  date: string
  userId: string
}

interface DashboardProps {
  userId: string
}

export function Dashboard({ userId }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    // Load user-specific transactions from localStorage
    const saved = localStorage.getItem(`transactions_${userId}`)
    if (saved) {
      setTransactions(JSON.parse(saved))
    }
  }, [userId])

  useEffect(() => {
    // Save user-specific transactions to localStorage
    localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions))
  }, [transactions, userId])

  const addTransaction = (transaction: Omit<Transaction, "id" | "userId">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      userId,
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
        <Button variant="outline" onClick={() => setShowAI(true)}>
          <Brain className="h-4 w-4 mr-2" />
          AI Insights
        </Button>
        <Button variant="outline" onClick={() => setShowChat(true)}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat to Add
        </Button>
      </div>

      {/* Budget Overview */}
      <BudgetOverview transactions={transactions} />

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={transactions} onDelete={deleteTransaction} />
        </CardContent>
      </Card>

      {/* Modals */}
      {showForm && <TransactionForm onSubmit={addTransaction} onClose={() => setShowForm(false)} />}

      {showAI && <AIInsights transactions={transactions} onClose={() => setShowAI(false)} />}

      {showChat && <ChatInterface onAddTransaction={addTransaction} onClose={() => setShowChat(false)} />}
    </div>
  )
}
