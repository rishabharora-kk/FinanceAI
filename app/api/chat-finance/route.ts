import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      messages: [
        {
          role: "system",
          content: `You are a helpful finance assistant that helps users add transactions to their finance tracker. 

Your job is to:
1. Parse user messages to extract transaction information
2. Ask clarifying questions if information is missing
3. Provide a friendly response
4. If you can extract a complete transaction, format it as JSON

For a complete transaction, you need:
- amount (number)
- description (string)
- category (one of: "Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills & Utilities", "Healthcare", "Education", "Travel", "Salary", "Freelance", "Investment", "Other")
- type ("income" or "expense")
- date (YYYY-MM-DD format, default to today if not specified)

If you can extract a complete transaction, end your response with:
TRANSACTION_DATA: {json object}

Examples:
- "I spent $25 on lunch" → expense, amount: 25, category: "Food & Dining"
- "Got paid $500 for freelance work" → income, amount: 500, category: "Freelance"
- "Paid electricity bill $120" → expense, amount: 120, category: "Bills & Utilities"

Be conversational and helpful. If information is missing, ask for it naturally.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    })

    // Check if the response contains transaction data
    let transaction = null
    let response = text

    if (text.includes("TRANSACTION_DATA:")) {
      const parts = text.split("TRANSACTION_DATA:")
      response = parts[0].trim()

      try {
        const transactionJson = parts[1].trim()
        transaction = JSON.parse(transactionJson)

        // Add today's date if not provided
        if (!transaction.date) {
          transaction.date = new Date().toISOString().split("T")[0]
        }

        response += "\n\n✅ Transaction added successfully!"
      } catch (error) {
        console.error("Error parsing transaction JSON:", error)
      }
    }

    return Response.json({ response, transaction })
  } catch (error) {
    console.error("Error in chat finance:", error)
    return Response.json(
      { response: "Sorry, I'm having trouble processing your request. Please try again." },
      { status: 500 },
    )
  }
}
