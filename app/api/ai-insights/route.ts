import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { transactions, question } = await req.json()

    // Prepare financial data summary
    const totalIncome = transactions
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + t.amount, 0)

    const categoryBreakdown = transactions
      .filter((t: any) => t.type === "expense")
      .reduce((acc: any, t: any) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {})

    const recentTransactions = transactions
      .slice(0, 10)
      .map((t: any) => `${t.type}: $${t.amount} - ${t.description} (${t.category})`)

    const financialSummary = `
Financial Summary:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Net Balance: $${(totalIncome - totalExpenses).toFixed(2)}
- Number of Transactions: ${transactions.length}

Expense Breakdown by Category:
${Object.entries(categoryBreakdown)
  .map(([category, amount]: [string, any]) => `- ${category}: $${amount.toFixed(2)}`)
  .join("\n")}

Recent Transactions:
${recentTransactions.join("\n")}
`

    const prompt = question
      ? `Based on this financial data, please answer the following question: "${question}"\n\n${financialSummary}`
      : `Please analyze this financial data and provide insights, recommendations, and observations about spending patterns, financial health, and areas for improvement:\n\n${financialSummary}`

    const result = streamText({
      model: groq("llama3-70b-8192"),
      messages: [
        {
          role: "system",
          content:
            "You are a helpful financial advisor AI. Provide clear, actionable advice based on the financial data provided. Be encouraging but honest about areas that need improvement. Format your response in a clear, easy-to-read manner with bullet points and sections where appropriate.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in AI insights:", error)
    return new Response("Error processing request", { status: 500 })
  }
}
