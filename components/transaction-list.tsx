"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { Transaction } from "./dashboard"

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions yet. Add your first transaction to get started!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.slice(0, 10).map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`text-lg font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
              >
                {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(transaction.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
