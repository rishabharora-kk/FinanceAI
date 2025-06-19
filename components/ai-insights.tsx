"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Loader2, Send } from "lucide-react"
import type { Transaction } from "./dashboard"

interface AIInsightsProps {
  transactions: Transaction[]
  onClose: () => void
}

export function AIInsights({ transactions, onClose }: AIInsightsProps) {
  const [insights, setInsights] = useState<string>("")
  const [customQuestion, setCustomQuestion] = useState("")
  const [loading, setLoading] = useState(false)

  // Replace the getFinancialInsights function
  const getFinancialInsights = async () => {
    setLoading(true)
    setInsights("")

    try {
      const response = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      })

      if (!response.ok) throw new Error("Failed to get insights")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let result = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.trim() && line.startsWith("0:")) {
            try {
              const jsonStr = line.slice(2)
              const data = JSON.parse(jsonStr)

              if (data.type === "text-delta" && data.textDelta) {
                result += data.textDelta
                setInsights(result)
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error getting insights:", error)
      setInsights("Sorry, I couldn't analyze your finances right now. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Replace the askCustomQuestion function
  const askCustomQuestion = async () => {
    if (!customQuestion.trim()) return

    setLoading(true)
    setInsights("")

    try {
      const response = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions,
          question: customQuestion,
        }),
      })

      if (!response.ok) throw new Error("Failed to get answer")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let result = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.trim() && line.startsWith("0:")) {
            try {
              const jsonStr = line.slice(2)
              const data = JSON.parse(jsonStr)

              if (data.type === "text-delta" && data.textDelta) {
                result += data.textDelta
                setInsights(result)
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error getting answer:", error)
      setInsights("Sorry, I couldn't answer your question right now. Please try again later.")
    } finally {
      setLoading(false)
      setCustomQuestion("")
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Financial Insights
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Analysis</CardTitle>
              <CardDescription>
                Get AI-powered insights about your spending patterns and financial health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={getFinancialInsights} disabled={loading || transactions.length === 0} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze My Finances
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ask a Question</CardTitle>
              <CardDescription>Ask specific questions about your finances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="e.g., How can I reduce my spending? What's my biggest expense category?"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                rows={3}
              />
              <Button
                onClick={askCustomQuestion}
                disabled={loading || !customQuestion.trim() || transactions.length === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Ask AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {insights && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap">{insights}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {transactions.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Add some transactions first to get AI insights about your finances.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
