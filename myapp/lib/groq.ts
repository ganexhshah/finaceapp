// Groq AI Service
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class GroqService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: Message[], model: string = 'llama-3.3-70b-versatile'): Promise<string> {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 300, // Reduced for concise responses
          top_p: 1,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get response from Groq');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Groq API Error:', error);
      throw error;
    }
  }

  async chatWithFinance(
    userMessage: string, 
    conversationHistory: Message[] = [],
    financialContext?: FinancialContext
  ): Promise<string> {
    let contextInfo = '';
    
    if (financialContext) {
      contextInfo = this.buildFinancialContext(financialContext);
    }

    const systemMessage: Message = {
      role: 'system',
      content: `You are a concise AI financial assistant. Keep responses SHORT and actionable.

${contextInfo}

Rules:
- Maximum 3-4 sentences per response
- Use emojis sparingly (1-2 max)
- Be direct and specific
- No lengthy explanations
- Focus on key insights only
- When user adds expense/income, confirm with: "✅ Added [item] - Rs. [amount]"
- For questions, give brief answers with numbers
- Use bullet points only for 3+ items

Examples:
User: "Show balance"
You: "💰 Total: Rs. 50,000 across 2 accounts. Cash: Rs. 20,000, Bank: Rs. 30,000"

User: "I spent 200 on momo"
You: "✅ Added Momo - Rs. 200 to Food & Dining"`,
    };

    const messages: Message[] = [
      systemMessage,
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    return this.chat(messages);
  }

  private buildFinancialContext(context: FinancialContext): string {
    let contextStr = '\n\nCurrent Financial Context:\n';

    // Account balances
    if (context.accounts && context.accounts.length > 0) {
      contextStr += '\nAccounts:\n';
      context.accounts.forEach(acc => {
        contextStr += `- ${acc.name}: ${acc.balance} (${acc.type})\n`;
      });
      const totalBalance = context.accounts.reduce((sum, acc) => sum + acc.balance, 0);
      contextStr += `Total Balance: ${totalBalance}\n`;
    }

    // Recent transactions summary
    if (context.recentTransactions) {
      const { totalIncome, totalExpense, count } = context.recentTransactions;
      contextStr += `\nRecent Transactions (Last 30 days):\n`;
      contextStr += `- Total Income: ${totalIncome}\n`;
      contextStr += `- Total Expense: ${totalExpense}\n`;
      contextStr += `- Net: ${totalIncome - totalExpense}\n`;
      contextStr += `- Transaction Count: ${count}\n`;
    }

    // Budget status
    if (context.budgets && context.budgets.length > 0) {
      contextStr += '\nActive Budgets:\n';
      context.budgets.forEach(budget => {
        const percentage = budget.limit > 0 ? (budget.spent / budget.limit * 100).toFixed(1) : 0;
        const status = budget.spent > budget.limit ? '⚠️ EXCEEDED' : 
                      budget.spent > budget.limit * 0.8 ? '⚡ WARNING' : '✅ OK';
        contextStr += `- ${budget.category}: ${budget.spent}/${budget.limit} (${percentage}%) ${status}\n`;
      });
    }

    // Category breakdown
    if (context.categoryBreakdown && context.categoryBreakdown.length > 0) {
      contextStr += '\nTop Spending Categories:\n';
      context.categoryBreakdown.slice(0, 5).forEach(cat => {
        contextStr += `- ${cat.name}: ${cat.amount} (${cat.percentage}%)\n`;
      });
    }

    // Party balances (receivables/payables)
    if (context.parties && context.parties.length > 0) {
      const receivables = context.parties.filter(p => p.balance > 0);
      const payables = context.parties.filter(p => p.balance < 0);
      
      if (receivables.length > 0) {
        contextStr += '\nMoney to Receive:\n';
        receivables.forEach(p => {
          contextStr += `- ${p.name}: ${p.balance}\n`;
        });
      }
      
      if (payables.length > 0) {
        contextStr += '\nMoney to Pay:\n';
        payables.forEach(p => {
          contextStr += `- ${p.name}: ${Math.abs(p.balance)}\n`;
        });
      }
    }

    // Spending trends
    if (context.trends) {
      contextStr += '\nSpending Trends:\n';
      if (context.trends.weekOverWeek) {
        const change = context.trends.weekOverWeek > 0 ? 'increased' : 'decreased';
        contextStr += `- Week-over-week: ${change} by ${Math.abs(context.trends.weekOverWeek)}%\n`;
      }
      if (context.trends.monthOverMonth) {
        const change = context.trends.monthOverMonth > 0 ? 'increased' : 'decreased';
        contextStr += `- Month-over-month: ${change} by ${Math.abs(context.trends.monthOverMonth)}%\n`;
      }
    }

    return contextStr;
  }
}

export interface FinancialContext {
  accounts?: Array<{
    name: string;
    balance: number;
    type: string;
  }>;
  recentTransactions?: {
    totalIncome: number;
    totalExpense: number;
    count: number;
  };
  budgets?: Array<{
    category: string;
    spent: number;
    limit: number;
  }>;
  categoryBreakdown?: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  parties?: Array<{
    name: string;
    balance: number;
  }>;
  trends?: {
    weekOverWeek?: number;
    monthOverMonth?: number;
  };
}

const groqService = new GroqService(GROQ_API_KEY || '');

export default groqService;
