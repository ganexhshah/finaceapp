// AI Action Parser - Detects and executes actions from chat messages
import api from './api';

export interface ParsedAction {
  type: 'add_expense' | 'add_income' | 'add_party_transaction' | 'view_transactions' | 'view_budget' | 
        'view_statistics' | 'view_accounts' | 'view_parties' | 'set_budget' | 
        'analyze_spending' | 'show_balance' | 'show_budget_status' | 'none';
  data?: any;
  confidence: number;
}

export interface FinancialData {
  accounts: any[];
  recentTransactions: {
    income: any[];
    expenses: any[];
  };
  budgets: any[];
  categories: any[];
  parties: any[];
}

export class AIActionParser {
  // Parse user message to detect intent
  static parseMessage(message: string): ParsedAction {
    const lowerMessage = message.toLowerCase();

    // Detect show balance
    if (this.isShowBalanceIntent(lowerMessage)) {
      return {
        type: 'show_balance',
        confidence: 0.95,
      };
    }

    // Detect show budget status
    if (this.isShowBudgetStatusIntent(lowerMessage)) {
      return {
        type: 'show_budget_status',
        confidence: 0.95,
      };
    }

    // Detect party transaction (lend/borrow)
    if (this.isPartyTransactionIntent(lowerMessage)) {
      const partyData = this.extractPartyTransactionData(message);
      if (partyData) {
        return {
          type: 'add_party_transaction',
          data: partyData,
          confidence: 0.9,
        };
      }
    }

    // Detect expense addition
    if (this.isExpenseIntent(lowerMessage)) {
      const expenseData = this.extractExpenseData(message);
      if (expenseData) {
        return {
          type: 'add_expense',
          data: expenseData,
          confidence: 0.9,
        };
      }
    }

    // Detect income addition
    if (this.isIncomeIntent(lowerMessage)) {
      const incomeData = this.extractIncomeData(message);
      if (incomeData) {
        return {
          type: 'add_income',
          data: incomeData,
          confidence: 0.9,
        };
      }
    }

    // Detect view statistics
    if (this.isViewStatisticsIntent(lowerMessage)) {
      return {
        type: 'view_statistics',
        confidence: 0.85,
      };
    }

    // Detect view accounts
    if (this.isViewAccountsIntent(lowerMessage)) {
      return {
        type: 'view_accounts',
        confidence: 0.85,
      };
    }

    // Detect view parties
    if (this.isViewPartiesIntent(lowerMessage)) {
      return {
        type: 'view_parties',
        confidence: 0.85,
      };
    }

    // Detect view transactions
    if (this.isViewTransactionsIntent(lowerMessage)) {
      return {
        type: 'view_transactions',
        confidence: 0.8,
      };
    }

    // Detect view budget
    if (this.isViewBudgetIntent(lowerMessage)) {
      return {
        type: 'view_budget',
        confidence: 0.8,
      };
    }

    // Detect set budget
    if (this.isSetBudgetIntent(lowerMessage)) {
      return {
        type: 'set_budget',
        confidence: 0.8,
      };
    }

    // Detect analyze spending
    if (this.isAnalyzeSpendingIntent(lowerMessage)) {
      return {
        type: 'analyze_spending',
        confidence: 0.85,
      };
    }

    return { type: 'none', confidence: 0 };
  }

  // Check if message is about adding expense
  private static isExpenseIntent(message: string): boolean {
    const expenseKeywords = [
      // English
      'spent', 'spend', 'paid', 'bought', 'purchase', 'eating', 'ate',
      'expense', 'cost', 'bill', 'shopping', 'food', 'lunch', 'dinner',
      'breakfast', 'coffee', 'taxi', 'uber', 'movie', 'ticket',
      // Nepali/Hinglish
      'khako', 'khaye', 'kharcha', 'kineko', 'liyeko', 'diyeko',
      'khana khayo', 'paisa kharch', 'rupiya kharch', 'kharcha bhayo',
      'खाको', 'खर्च', 'किनेको', 'लिएको', 'दिएको', 'पैसा खर्च'
    ];
    return expenseKeywords.some(keyword => message.includes(keyword));
  }

  // Check if message is about adding income
  private static isIncomeIntent(message: string): boolean {
    const incomeKeywords = [
      // English
      'earned', 'received', 'got paid', 'salary', 'income',
      'bonus', 'profit', 'revenue', 'payment received',
      // Nepali/Hinglish
      'kamayo', 'paisa aayo', 'salary aayo', 'income bhayo',
      'पैसा आयो', 'तलब', 'आम्दानी', 'कमाई'
    ];
    return incomeKeywords.some(keyword => message.includes(keyword));
  }

  // Check if message is about party transaction (lend/borrow)
  private static isPartyTransactionIntent(message: string): boolean {
    const partyKeywords = [
      // English - Give/Lend
      'lent', 'lend', 'gave', 'give', 'loan to', 'credit to',
      // English - Receive/Borrow
      'borrowed', 'borrow', 'took loan', 'debt from', 'owe',
      // Nepali/Hinglish - Give
      'diyeko', 'dinu', 'udharo diyeko', 'sapath diyeko',
      // Nepari/Hinglish - Receive
      'liyeko', 'linu', 'udharo liyeko', 'sapath liyeko',
      'दिएको', 'लिएको', 'उधारो', 'सापट'
    ];
    return partyKeywords.some(keyword => message.includes(keyword));
  }

  // Check if user wants to view transactions
  private static isViewTransactionsIntent(message: string): boolean {
    const keywords = [
      'show transactions', 'view transactions', 'my transactions',
      'transaction history', 'recent transactions', 'spending history'
    ];
    return keywords.some(keyword => message.includes(keyword));
  }

  // Check if user wants to view budget
  private static isViewBudgetIntent(message: string): boolean {
    const keywords = [
      'show budget', 'view budget', 'my budget', 'budget status',
      'how much left', 'remaining budget', 'budget overview'
    ];
    return keywords.some(keyword => message.includes(keyword));
  }

  // Check if user wants to show balance
  private static isShowBalanceIntent(message: string): boolean {
    const keywords = [
      // English
      'show balance', 'my balance', 'account balance', 'total balance',
      'how much do i have', 'what\'s my balance', 'check balance',
      'balance overview', 'show accounts balance', 'show my money',
      // Nepali/Hinglish
      'balance dekha', 'mero balance', 'paisa kati cha', 'balance check',
      'खाता बैलेन्स', 'पैसा कति छ', 'balance kati cha'
    ];
    return keywords.some(keyword => message.includes(keyword));
  }

  // Check if user wants to show budget status
  private static isShowBudgetStatusIntent(message: string): boolean {
    const keywords = [
      // English
      'budget status', 'show budgets', 'my budgets', 'budget overview',
      'how are my budgets', 'budget progress', 'check budgets',
      // Nepali/Hinglish
      'budget dekha', 'mero budget', 'budget kasto cha', 'budget check',
      'बजेट', 'खर्च सीमा'
    ];
    return keywords.some(keyword => message.includes(keyword));
  }

  // Check if user wants to view statistics
  private static isViewStatisticsIntent(message: string): boolean {
    const keywords = [
      'show statistics', 'view stats', 'my statistics', 'spending analysis',
      'income vs expense', 'financial overview', 'show charts', 'analytics',
      'spending breakdown', 'category breakdown'
    ];
    return keywords.some(keyword => message.includes(keyword));
  }

  // Check if user wants to view accounts
  private static isViewAccountsIntent(message: string): boolean {
    const keywords = [
      'show accounts', 'view accounts', 'my accounts', 'account balance',
      'bank accounts', 'wallet balance', 'cash balance'
    ];
    return keywords.some(keyword => message.includes(keyword));
  }

  // Check if user wants to view parties
  private static isViewPartiesIntent(message: string): boolean {
    const keywords = [
      'show parties', 'view parties', 'my parties', 'receivables', 'payables',
      'money to receive', 'money to pay', 'who owes me', 'whom do i owe'
    ];
    return keywords.some(keyword => message.includes(keyword));
  }

  // Check if user wants to set budget
  private static isSetBudgetIntent(message: string): boolean {
    const keywords = [
      'set budget', 'create budget', 'add budget', 'budget for',
      'limit spending', 'set limit'
    ];
    return keywords.some(keyword => message.includes(keyword));
  }

  // Check if user wants spending analysis
  private static isAnalyzeSpendingIntent(message: string): boolean {
    const keywords = [
      // English
      'analyze spending', 'spending pattern', 'where did i spend',
      'spending trends', 'expense analysis', 'how much did i spend',
      'spending summary', 'expense report',
      // Nepali/Hinglish
      'kharcha analysis', 'kaha kharcha bhayo', 'kati kharcha bhayo',
      'खर्च विश्लेषण', 'कहाँ खर्च भयो', 'spending dekha'
    ];
    return keywords.some(keyword => message.includes(keyword));
  }

  // Extract expense data from message
  private static extractExpenseData(message: string): any | null {
    // Extract amount (numbers)
    const amountMatch = message.match(/\d+(\.\d+)?/);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[0]);

    // Extract category/title from context
    const lowerMessage = message.toLowerCase();
    let category = 'Food & Dining'; // Default
    let title = 'Expense';

    // Detect food-related (English + Nepali/Hinglish)
    if (lowerMessage.includes('momo') || lowerMessage.includes('food') || 
        lowerMessage.includes('eating') || lowerMessage.includes('lunch') ||
        lowerMessage.includes('dinner') || lowerMessage.includes('breakfast') ||
        lowerMessage.includes('khana') || lowerMessage.includes('khayo') ||
        lowerMessage.includes('khako') || lowerMessage.includes('खाना')) {
      category = 'Food & Dining';
      
      // Extract food item
      if (lowerMessage.includes('momo')) title = 'Momo';
      else if (lowerMessage.includes('pizza')) title = 'Pizza';
      else if (lowerMessage.includes('coffee') || lowerMessage.includes('chiya') || lowerMessage.includes('tea')) title = 'Coffee/Tea';
      else if (lowerMessage.includes('dal bhat') || lowerMessage.includes('dalbhat')) title = 'Dal Bhat';
      else if (lowerMessage.includes('chowmein') || lowerMessage.includes('chowmin')) title = 'Chowmein';
      else if (lowerMessage.includes('biryani')) title = 'Biryani';
      else if (lowerMessage.includes('khana') || lowerMessage.includes('खाना')) title = 'Food';
      else title = 'Food';
    }
    // Detect transport (English + Nepali/Hinglish)
    else if (lowerMessage.includes('taxi') || lowerMessage.includes('uber') ||
             lowerMessage.includes('bus') || lowerMessage.includes('transport') ||
             lowerMessage.includes('tempo') || lowerMessage.includes('rickshaw') ||
             lowerMessage.includes('गाडी') || lowerMessage.includes('यातायात')) {
      category = 'Transportation';
      title = 'Transport';
    }
    // Detect shopping (English + Nepali/Hinglish)
    else if (lowerMessage.includes('shopping') || lowerMessage.includes('bought') ||
             lowerMessage.includes('purchase') || lowerMessage.includes('kineko') ||
             lowerMessage.includes('किनेको') || lowerMessage.includes('kharcha')) {
      category = 'Shopping';
      title = 'Shopping';
    }
    // Detect entertainment (English + Nepali/Hinglish)
    else if (lowerMessage.includes('movie') || lowerMessage.includes('game') ||
             lowerMessage.includes('entertainment') || lowerMessage.includes('cinema') ||
             lowerMessage.includes('picture') || lowerMessage.includes('फिल्म')) {
      category = 'Entertainment';
      title = 'Entertainment';
    }

    return {
      title,
      amount,
      category,
      date: new Date().toISOString(),
    };
  }

  // Extract income data from message
  private static extractIncomeData(message: string): any | null {
    const amountMatch = message.match(/\d+(\.\d+)?/);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[0]);
    const lowerMessage = message.toLowerCase();

    let category = 'Salary';
    let title = 'Income';

    if (lowerMessage.includes('salary') || lowerMessage.includes('तलब') || lowerMessage.includes('तलव')) {
      category = 'Salary';
      title = 'Salary';
    } else if (lowerMessage.includes('bonus')) {
      category = 'Bonus';
      title = 'Bonus';
    } else if (lowerMessage.includes('freelance') || lowerMessage.includes('project')) {
      category = 'Freelance';
      title = 'Freelance Work';
    }

    return {
      title,
      amount,
      category,
      date: new Date().toISOString(),
    };
  }

  // Extract party transaction data from message
  private static extractPartyTransactionData(message: string): any | null {
    const amountMatch = message.match(/\d+(\.\d+)?/);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[0]);
    const lowerMessage = message.toLowerCase();

    // Determine transaction type (give or receive)
    const isGive = /\b(gave|give|lent|lend|diyeko|dinu|credit to|loan to)\b/i.test(message);
    const type = isGive ? 'give' : 'receive';

    // Extract party name - look for common patterns
    let partyName = 'Friend';
    
    // Pattern: "to [name]" or "from [name]"
    const toFromMatch = message.match(/(?:to|from)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
    if (toFromMatch) {
      partyName = toFromMatch[1].trim();
    }
    
    // Pattern: "[name] lai" or "[name] bata" (Nepali)
    const nepaliMatch = message.match(/([A-Za-z]+)\s+(?:lai|bata)/i);
    if (nepaliMatch) {
      partyName = nepaliMatch[1].trim();
    }

    // Generate phone number (placeholder)
    const phone = '9800000000';

    return {
      partyName,
      phone,
      amount,
      type,
      description: `${type === 'give' ? 'Lent' : 'Borrowed'} via AI chat`,
      date: new Date().toISOString(),
    };
  }

  // Execute the parsed action
  static async executeAction(action: ParsedAction): Promise<{ success: boolean; message: string; data?: any; richContent?: any }> {
    try {
      switch (action.type) {
        case 'add_expense':
          return await this.addExpense(action.data);
        
        case 'add_income':
          return await this.addIncome(action.data);
        
        case 'add_party_transaction':
          return await this.addPartyTransaction(action.data);
        
        case 'show_balance':
          return await this.showBalance();
        
        case 'show_budget_status':
          return await this.showBudgetStatus();
        
        case 'view_transactions':
          return { success: true, message: 'navigate_transactions' };
        
        case 'view_budget':
          return { success: true, message: 'navigate_budget' };
        
        case 'view_statistics':
          return { success: true, message: 'navigate_statistics' };
        
        case 'view_accounts':
          return { success: true, message: 'navigate_accounts' };
        
        case 'view_parties':
          return { success: true, message: 'navigate_parties' };
        
        case 'set_budget':
          return { success: true, message: 'navigate_set_budget' };
        
        case 'analyze_spending':
          return await this.analyzeSpending();
        
        default:
          return { success: false, message: 'No action detected' };
      }
    } catch (error) {
      console.error('Error executing action:', error);
      return { success: false, message: 'Failed to execute action' };
    }
  }

  // Fetch and compile financial data for AI context
  static async fetchFinancialData(): Promise<FinancialData | null> {
    try {
      const [accountsRes, incomeRes, expenseRes, budgetsRes, categoriesRes, partiesRes] = await Promise.all([
        api.getAccounts(),
        api.getIncomes(),
        api.getExpenses(),
        api.getBudgets(),
        api.getCategories('expense'),
        api.getParties(),
      ]);

      return {
        accounts: accountsRes.success ? (accountsRes.data as any)?.accounts || [] : [],
        recentTransactions: {
          income: incomeRes.success ? (incomeRes.data as any)?.income || [] : [],
          expenses: expenseRes.success ? (expenseRes.data as any)?.expenses || [] : [],
        },
        budgets: budgetsRes.success ? (budgetsRes.data as any)?.budgets || [] : [],
        categories: categoriesRes.success ? (categoriesRes.data as any)?.categories || [] : [],
        parties: partiesRes.success ? (partiesRes.data as any)?.parties || [] : [],
      };
    } catch (error) {
      console.error('Error fetching financial data:', error);
      return null;
    }
  }

  // Build financial context for AI
  static buildFinancialContext(data: FinancialData): any {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter recent transactions (last 30 days)
    const recentIncome = data.recentTransactions.income.filter((item: any) => 
      new Date(item.date) >= thirtyDaysAgo
    );
    const recentExpenses = data.recentTransactions.expenses.filter((item: any) => 
      new Date(item.date) >= thirtyDaysAgo
    );

    const totalIncome = recentIncome.reduce((sum: number, item: any) => sum + item.amount, 0);
    const totalExpense = recentExpenses.reduce((sum: number, item: any) => sum + item.amount, 0);

    // Category breakdown
    const categoryMap = new Map<string, number>();
    recentExpenses.forEach((expense: any) => {
      const categoryName = expense.category?.name || 'Uncategorized';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + expense.amount);
    });

    const totalCategorySpending = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalCategorySpending > 0 ? Math.round((amount / totalCategorySpending) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Budget status
    const budgets = data.budgets.map((budget: any) => {
      const categoryExpenses = recentExpenses
        .filter((exp: any) => exp.categoryId === budget.categoryId)
        .reduce((sum: number, exp: any) => sum + exp.amount, 0);

      return {
        category: budget.category?.name || 'Unknown',
        spent: categoryExpenses,
        limit: budget.amount,
      };
    });

    return {
      accounts: data.accounts.map((acc: any) => ({
        name: acc.name,
        balance: acc.balance,
        type: acc.type,
      })),
      recentTransactions: {
        totalIncome,
        totalExpense,
        count: recentIncome.length + recentExpenses.length,
      },
      budgets,
      categoryBreakdown,
      parties: data.parties.map((party: any) => ({
        name: party.name,
        balance: party.balance,
      })),
    };
  }

  // Analyze spending and return insights
  private static async analyzeSpending(): Promise<{ success: boolean; message: string; data?: any; richContent?: any }> {
    try {
      const financialData = await this.fetchFinancialData();
      if (!financialData) {
        return { success: false, message: 'Unable to fetch financial data' };
      }

      const context = this.buildFinancialContext(financialData);
      
      let analysis = '📊 Spending Analysis\n\n';
      
      // Recent transactions summary
      if (context.recentTransactions) {
        const { totalIncome, totalExpense } = context.recentTransactions;
        const net = totalIncome - totalExpense;
        analysis += `💰 Last 30 Days\n`;
        analysis += `Income: Rs. ${totalIncome.toLocaleString()}\n`;
        analysis += `Expenses: Rs. ${totalExpense.toLocaleString()}\n`;
        analysis += `Net: Rs. ${net.toLocaleString()} ${net >= 0 ? '✅' : '⚠️'}\n\n`;
      }

      // Top spending categories
      if (context.categoryBreakdown && context.categoryBreakdown.length > 0) {
        analysis += `📈 Top Spending Categories\n`;
        context.categoryBreakdown.slice(0, 3).forEach((cat: any) => {
          analysis += `• ${cat.name}: Rs. ${cat.amount.toLocaleString()} (${cat.percentage}%)\n`;
        });
        analysis += '\n';
      }

      // Budget alerts
      if (context.budgets && context.budgets.length > 0) {
        const overBudget = context.budgets.filter((b: any) => b.spent > b.limit);
        const nearLimit = context.budgets.filter((b: any) => 
          b.spent <= b.limit && b.spent > b.limit * 0.8
        );

        if (overBudget.length > 0) {
          analysis += `⚠️ Over Budget\n`;
          overBudget.forEach((b: any) => {
            analysis += `• ${b.category}: Rs. ${b.spent.toLocaleString()}/${b.limit.toLocaleString()}\n`;
          });
          analysis += '\n';
        }

        if (nearLimit.length > 0) {
          analysis += `⚡ Near Budget Limit\n`;
          nearLimit.forEach((b: any) => {
            analysis += `• ${b.category}: Rs. ${b.spent.toLocaleString()}/${b.limit.toLocaleString()}\n`;
          });
        }
      }

      // Return with rich content
      return {
        success: true,
        message: analysis,
        data: context,
        richContent: {
          type: 'spending',
          data: {
            totalIncome: context.recentTransactions?.totalIncome || 0,
            totalExpense: context.recentTransactions?.totalExpense || 0,
            net: (context.recentTransactions?.totalIncome || 0) - (context.recentTransactions?.totalExpense || 0),
            topCategories: context.categoryBreakdown?.slice(0, 5) || [],
          },
        },
      };
    } catch (error) {
      console.error('Error analyzing spending:', error);
      return { success: false, message: 'Failed to analyze spending' };
    }
  }

  // Show account balances
  private static async showBalance(): Promise<{ success: boolean; message: string; data?: any; richContent?: any }> {
    try {
      const accountsRes = await api.getAccounts();
      
      if (!accountsRes.success || !accountsRes.data) {
        return { success: false, message: 'Unable to fetch account balances' };
      }

      const data = accountsRes.data as any;
      const accounts = data.accounts || data;

      if (accounts.length === 0) {
        return { 
          success: true, 
          message: '🏦 No accounts found\n\nYou haven\'t created any accounts yet. Create an account to start tracking your finances!' 
        };
      }

      const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);

      let message = '🏦 Account Balances\n\n';
      message += `Total Balance: Rs. ${totalBalance.toLocaleString()}\n\n`;
      
      accounts.forEach((acc: any) => {
        message += `• ${acc.name} (${acc.type}): Rs. ${acc.balance.toLocaleString()}\n`;
      });

      return {
        success: true,
        message,
        richContent: {
          type: 'balance',
          data: {
            accounts: accounts.map((acc: any) => ({
              name: acc.name,
              balance: acc.balance,
              type: acc.type,
            })),
          },
        },
      };
    } catch (error) {
      console.error('Error showing balance:', error);
      return { success: false, message: 'Failed to fetch account balances' };
    }
  }

  // Show budget status
  private static async showBudgetStatus(): Promise<{ success: boolean; message: string; data?: any; richContent?: any }> {
    try {
      const financialData = await this.fetchFinancialData();
      if (!financialData) {
        return { success: false, message: 'Unable to fetch budget data' };
      }

      const context = this.buildFinancialContext(financialData);

      if (!context.budgets || context.budgets.length === 0) {
        return {
          success: true,
          message: '🎯 No active budgets\n\nYou haven\'t set any budgets yet. Set budgets to track your spending limits!',
        };
      }

      let message = '🎯 Budget Status\n\n';

      context.budgets.forEach((budget: any) => {
        const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
        const status = budget.spent > budget.limit ? '⚠️' : 
                      budget.spent > budget.limit * 0.8 ? '⚡' : '✅';
        
        message += `${status} ${budget.category}\n`;
        message += `Rs. ${budget.spent.toLocaleString()} / Rs. ${budget.limit.toLocaleString()} (${percentage}%)\n\n`;
      });

      return {
        success: true,
        message,
        richContent: {
          type: 'budget',
          data: {
            budgets: context.budgets,
          },
        },
      };
    } catch (error) {
      console.error('Error showing budget status:', error);
      return { success: false, message: 'Failed to fetch budget status' };
    }
  }

  // Add expense via API
  static async addExpense(expenseData: any): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('Adding expense with data:', expenseData);

      // Get categories to find the right one
      const categoriesRes = await api.getCategories('expense');
      let categoryId = null;

      if (categoriesRes.success && categoriesRes.data) {
        const categoriesData = categoriesRes.data as any;
        const categories = categoriesData.categories || categoriesData;
        const category = categories.find((cat: any) => 
          cat.name && expenseData.category && cat.name.toLowerCase().includes(expenseData.category.toLowerCase())
        );
        
        if (category) {
          categoryId = category.id;
          console.log('Found existing category:', category.name, 'ID:', categoryId);
        } else {
          // Category doesn't exist, create it
          console.log('Category not found, creating:', expenseData.category);
          
          // Map category name to icon
          const categoryIcons: { [key: string]: string } = {
            'food & dining': 'restaurant',
            'food': 'restaurant',
            'shopping': 'cart',
            'transportation': 'car',
            'entertainment': 'game-controller',
            'health': 'medical',
            'utilities': 'flash',
            'education': 'school',
            'travel': 'airplane',
            'other': 'ellipsis-horizontal',
          };
          
          const categoryKey = expenseData.category.toLowerCase();
          const icon = categoryIcons[categoryKey] || 'pricetag';
          
          const newCategoryRes = await api.createCategory({
            name: expenseData.category,
            icon: icon,
            type: 'expense',
          });
          
          if (newCategoryRes.success && newCategoryRes.data) {
            categoryId = newCategoryRes.data.id;
            console.log('Created new category:', expenseData.category, 'ID:', categoryId);
          }
        }
      }

      // Get first account
      const accountsRes = await api.getAccounts();
      let accountId = null;

      if (accountsRes.success && accountsRes.data) {
        const accountsData = accountsRes.data as any;
        const accounts = accountsData.accounts || accountsData;
        accountId = accounts[0]?.id;
        console.log('Found account:', accounts[0]?.name, 'ID:', accountId);
      }

      if (!accountId) {
        return { success: false, message: 'No account found. Please create an account first.' };
      }

      // Create expense
      const newExpenseData = {
        title: expenseData.title,
        amount: expenseData.amount,
        categoryId: categoryId || undefined,
        accountId,
        date: expenseData.date,
        description: `Added via AI chat`,
      };

      console.log('Creating expense with:', newExpenseData);
      const response = await api.createExpense(newExpenseData);
      console.log('Create expense response:', response);

      if (response.success) {
        return {
          success: true,
          message: `✅ Added ${expenseData.title} - Rs. ${expenseData.amount}`,
          data: response.data,
          richContent: {
            type: 'transaction',
            transactionType: 'expense',
            data: response.data,
          },
        };
      }

      // Return more specific error message
      const errorMsg = response.error || 'Failed to add expense';
      return { success: false, message: `Failed to add expense: ${errorMsg}` };
    } catch (error) {
      console.error('Error adding expense:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Error adding expense: ${errorMessage}` };
    }
  }

  // Add income via API
  private static async addIncome(incomeData: any): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const categoriesRes = await api.getCategories('income');
      let categoryId = null;

      if (categoriesRes.success && categoriesRes.data) {
        const categoriesData = categoriesRes.data as any;
        const categories = categoriesData.categories || categoriesData;
        const category = categories.find((cat: any) => 
          cat.name && incomeData.category && cat.name.toLowerCase().includes(incomeData.category.toLowerCase())
        );
        
        if (category) {
          categoryId = category.id;
          console.log('Found existing income category:', category.name, 'ID:', categoryId);
        } else {
          // Category doesn't exist, create it
          console.log('Income category not found, creating:', incomeData.category);
          
          // Map category name to icon
          const categoryIcons: { [key: string]: string } = {
            'salary': 'cash',
            'bonus': 'gift',
            'freelance': 'briefcase',
            'business': 'business',
            'investment': 'trending-up',
            'rental': 'home',
            'other': 'wallet',
          };
          
          const categoryKey = incomeData.category.toLowerCase();
          const icon = categoryIcons[categoryKey] || 'cash';
          
          const newCategoryRes = await api.createCategory({
            name: incomeData.category,
            icon: icon,
            type: 'income',
          });
          
          if (newCategoryRes.success && newCategoryRes.data) {
            categoryId = newCategoryRes.data.id;
            console.log('Created new income category:', incomeData.category, 'ID:', categoryId);
          }
        }
      }

      const accountsRes = await api.getAccounts();
      let accountId = null;

      if (accountsRes.success && accountsRes.data) {
        const accountsData = accountsRes.data as any;
        const accounts = accountsData.accounts || accountsData;
        accountId = accounts[0]?.id;
      }

      if (!accountId) {
        return { success: false, message: 'No account found. Please create an account first.' };
      }

      const newIncomeData = {
        title: incomeData.title,
        amount: incomeData.amount,
        categoryId: categoryId || undefined,
        accountId,
        date: incomeData.date,
        description: `Added via AI chat`,
      };

      const response = await api.createIncome(newIncomeData);

      if (response.success) {
        return {
          success: true,
          message: `✅ Added ${incomeData.title} - Rs. ${incomeData.amount}`,
          data: response.data,
          richContent: {
            type: 'transaction',
            transactionType: 'income',
            data: response.data,
          },
        };
      }

      return { success: false, message: 'Failed to add income' };
    } catch (error) {
      console.error('Error adding income:', error);
      return { success: false, message: 'Error adding income' };
    }
  }

  // Add party transaction via API
  private static async addPartyTransaction(partyData: any): Promise<{ success: boolean; message: string; data?: any; richContent?: any }> {
    try {
      console.log('Adding party transaction with data:', partyData);

      // Get or create party
      const partiesRes = await api.getParties();
      let party = null;

      if (partiesRes.success && partiesRes.data) {
        const partiesData = partiesRes.data as any;
        const parties = partiesData.parties || partiesData;
        
        // Try to find existing party by name
        party = parties.find((p: any) => 
          p.name.toLowerCase() === partyData.partyName.toLowerCase()
        );
      }

      // If party doesn't exist, create it
      if (!party) {
        const newPartyData = {
          name: partyData.partyName,
          phone: partyData.phone,
          type: partyData.type,
          balance: 0,
          openingBalance: 0,
          asOfDate: new Date().toISOString(),
        };

        const createPartyRes = await api.createParty(newPartyData);
        
        if (!createPartyRes.success) {
          return { success: false, message: 'Failed to create party' };
        }
        
        party = createPartyRes.data;
      }

      // Get account
      const accountsRes = await api.getAccounts();
      let accountId = null;

      if (accountsRes.success && accountsRes.data) {
        const accountsData = accountsRes.data as any;
        const accounts = accountsData.accounts || accountsData;
        accountId = accounts[0]?.id;
      }

      if (!accountId) {
        return { success: false, message: 'No account found. Please create an account first.' };
      }

      // Create transaction
      const transactionData = {
        partyId: party.id,
        accountId,
        type: partyData.type === 'give' ? 'debit' : 'credit',
        amount: partyData.amount,
        description: partyData.description,
        date: partyData.date,
      };

      const response = await api.createTransaction(transactionData);

      if (response.success) {
        // Fetch updated party data
        const updatedPartyRes = await api.getParty(party.id);
        const updatedParty = updatedPartyRes.success ? updatedPartyRes.data : party;

        const actionText = partyData.type === 'give' ? 'Lent' : 'Borrowed';
        
        return {
          success: true,
          message: `✅ ${actionText} Rs. ${partyData.amount} ${partyData.type === 'give' ? 'to' : 'from'} ${partyData.partyName}`,
          data: response.data,
          richContent: {
            type: 'party',
            data: {
              id: updatedParty.id,
              name: updatedParty.name,
              phone: updatedParty.phone,
              type: partyData.type,
              balance: updatedParty.balance,
              amount: partyData.amount,
            },
          },
        };
      }

      return { success: false, message: 'Failed to create transaction' };
    } catch (error) {
      console.error('Error adding party transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Error adding party transaction: ${errorMessage}` };
    }
  }

  // Parse story-like messages and extract multiple transactions
  static async parseStoryAndExecute(message: string): Promise<{ success: boolean; message: string; transactions?: any[] }> {
    try {
      console.log('Parsing story:', message);

      // Use Groq AI to extract transactions from story
      const prompt = `Extract financial transactions from this message. Return ONLY a JSON array, no other text.

Message: "${message}"

Extract all expenses, income, and party transactions (lend/borrow). For each transaction, identify:
- type: "expense", "income", or "party"
- amount: number
- title: short description
- category: for expenses (Food & Dining, Shopping, Transportation, Entertainment, Other)
- partyName: for party transactions
- partyType: "give" or "receive" for party transactions

Return format:
[
  {"type": "expense", "amount": 350, "title": "Clothes", "category": "Shopping"},
  {"type": "expense", "amount": 300, "title": "Restaurant", "category": "Food & Dining"},
  {"type": "party", "amount": 3000, "title": "Loan", "partyName": "Ram", "partyType": "give"}
]

Return ONLY the JSON array, nothing else.`;

      const response = await groqService.chat([
        {
          role: 'user',
          content: prompt,
        }
      ], 'llama-3.3-70b-versatile');

      console.log('AI response:', response);

      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return { success: false, message: 'Could not parse transactions' };
      }

      const transactions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(transactions) || transactions.length === 0) {
        return { success: false, message: 'No transactions found' };
      }

      console.log('Extracted transactions:', transactions);

      // Execute each transaction
      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const txn of transactions) {
        try {
          let result;
          
          if (txn.type === 'expense') {
            result = await this.addExpense({
              title: txn.title,
              amount: txn.amount,
              category: txn.category || 'Other',
              date: new Date().toISOString(),
            });
          } else if (txn.type === 'income') {
            result = await this.addIncome({
              title: txn.title,
              amount: txn.amount,
              category: txn.category || 'Salary',
              date: new Date().toISOString(),
            });
          } else if (txn.type === 'party') {
            result = await this.addPartyTransaction({
              partyName: txn.partyName,
              phone: '9800000000',
              amount: txn.amount,
              type: txn.partyType,
              description: txn.title,
              date: new Date().toISOString(),
            });
          }

          if (result && result.success) {
            successCount++;
            results.push({ ...txn, success: true });
          } else {
            failCount++;
            results.push({ ...txn, success: false });
          }
        } catch (error) {
          console.error('Error executing transaction:', error);
          failCount++;
          results.push({ ...txn, success: false });
        }
      }

      // Build summary message
      let summaryMessage = `✅ Processed ${successCount} transaction${successCount !== 1 ? 's' : ''}`;
      
      if (failCount > 0) {
        summaryMessage += `, ${failCount} failed`;
      }

      summaryMessage += '\n\n';

      // Add details
      results.forEach((result) => {
        const icon = result.success ? '✅' : '❌';
        if (result.type === 'expense') {
          summaryMessage += `${icon} ${result.title}: Rs. ${result.amount}\n`;
        } else if (result.type === 'income') {
          summaryMessage += `${icon} Income ${result.title}: Rs. ${result.amount}\n`;
        } else if (result.type === 'party') {
          const action = result.partyType === 'give' ? 'Lent to' : 'Borrowed from';
          summaryMessage += `${icon} ${action} ${result.partyName}: Rs. ${result.amount}\n`;
        }
      });

      return {
        success: true,
        message: summaryMessage,
        transactions: results,
      };
    } catch (error) {
      console.error('Story parsing error:', error);
      return { success: false, message: 'Failed to parse story' };
    }
  }
}
