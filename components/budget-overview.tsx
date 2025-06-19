"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Transaction } from "./dashboard"

interface BudgetOverviewProps {
  transactions: Transaction[]
}

export function BudgetOverview({ transactions }: BudgetOverviewProps) {
  // Calculate spending by category for current month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyExpenses = transactions.filter((t) => {
    const transactionDate = new Date(t.date)
    return (
      t.type === "expense" &&
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    )
  })

  const categorySpending = monthlyExpenses.reduce(
    (acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      return acc
    },
    {} as Record<string, number>,
  )

  // Sample budget limits (in a real app, these would be user-configurable)
  const budgetLimits = {
    "Food & Dining": 500,
    Transportation: 200,
    Shopping: 300,
    Entertainment: 150,
    "Bills & Utilities": 400,
  }

  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  if (topCategories.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget Overview</CardTitle>
        <CardDescription>Your spending by category this month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topCategories.map(([category, spent]) => {
          const budget = budgetLimits[category as keyof typeof budgetLimits] || spent * 1.2
          const percentage = Math.min((spent / budget) * 100, 100)
          const isOverBudget = spent > budget

          return (
            <div key={category} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{category}</span>
                <span className={isOverBudget ? "text-red-600" : "text-muted-foreground"}>
                  ${spent.toFixed(2)} / ${budget.toFixed(2)}
                </span>
              </div>
              <Progress value={percentage} className={`h-2 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`} />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
