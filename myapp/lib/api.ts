import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: any;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      // If response is not ok but we got JSON, include status info
      if (!response.ok && data) {
        return {
          success: false,
          message: data.message || `Request failed with status ${response.status}`,
          error: data.error || data.message,
          errors: data.errors,
        };
      }
      
      return data;
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Auth endpoints
  async signup(name: string, email: string, password: string) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async verifyOTP(email: string, otp: string) {
    return this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async resendOTP(email: string) {
    return this.request('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  }

  // Google Auth
  async googleLogin(idToken: string) {
    const response = await this.request<{ user: any; token: string }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  // User endpoints
  async getProfile() {
    return this.request('/api/user/profile');
  }

  async updateProfile(data: any) {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getSettings() {
    return this.request('/api/user/settings');
  }

  async updateSettings(data: any) {
    return this.request('/api/user/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Security endpoints
  async getSecuritySettings() {
    return this.request('/api/user/security');
  }

  async updateSecuritySettings(data: { biometricLogin?: boolean; twoFactorAuth?: boolean }) {
    return this.request('/api/user/security', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/api/user/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getLoginHistory() {
    return this.request('/api/user/login-history');
  }

  async getActiveSessions() {
    return this.request('/api/user/sessions');
  }

  async revokeSession(sessionId: string) {
    return this.request(`/api/user/sessions?id=${sessionId}`, {
      method: 'DELETE',
    });
  }

  async downloadData() {
    return this.request('/api/user/download-data');
  }

  async deleteAccount(password: string, confirmation: string) {
    return this.request('/api/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password, confirmation }),
    });
  }

  // Category endpoints
  async getCategories(type?: 'income' | 'expense') {
    const query = type ? `?type=${type}` : '';
    return this.request(`/api/category${query}`);
  }

  async createCategory(data: { name: string; icon: string; type: 'income' | 'expense' }) {
    return this.request('/api/category', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: { name?: string; icon?: string }) {
    return this.request(`/api/category/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/api/category/${id}`, {
      method: 'DELETE',
    });
  }

  // Income endpoints
  async getIncomes(params?: { startDate?: string; endDate?: string; categoryId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/income${query ? `?${query}` : ''}`);
  }

  async createIncome(data: any) {
    return this.request('/api/income', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteIncome(id: string) {
    return this.request(`/api/income/${id}`, {
      method: 'DELETE',
    });
  }

  async updateIncome(id: string, data: any) {
    return this.request(`/api/income/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Expense endpoints
  async getExpenses(params?: { startDate?: string; endDate?: string; categoryId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/expense${query ? `?${query}` : ''}`);
  }

  async createExpense(data: any) {
    return this.request('/api/expense', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteExpense(id: string) {
    return this.request(`/api/expense/${id}`, {
      method: 'DELETE',
    });
  }

  async updateExpense(id: string, data: any) {
    return this.request(`/api/expense/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Account endpoints
  async getAccounts() {
    return this.request('/api/account');
  }

  async getAccount(id: string) {
    return this.request(`/api/account/${id}`);
  }

  async createAccount(data: any) {
    return this.request('/api/account', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccount(id: string, data: any) {
    return this.request(`/api/account/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(id: string) {
    return this.request(`/api/account/${id}`, {
      method: 'DELETE',
    });
  }

  // Budget endpoints
  async getBudgets() {
    return this.request('/api/budget');
  }

  async createBudget(data: any) {
    return this.request('/api/budget', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Party endpoints
  async getParties(type?: 'receive' | 'give') {
    const query = type ? `?type=${type}` : '';
    return this.request(`/api/party${query}`);
  }

  async getParty(id: string) {
    return this.request(`/api/party/${id}`);
  }

  async createParty(data: any) {
    return this.request('/api/party', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateParty(id: string, data: any) {
    return this.request(`/api/party/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteParty(id: string) {
    return this.request(`/api/party/${id}`, {
      method: 'DELETE',
    });
  }

  // Transaction endpoints
  async getTransactions(params?: {
    accountId?: string;
    partyId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/transaction${query ? `?${query}` : ''}`);
  }

  async createTransaction(data: any) {
    return this.request('/api/transaction', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Upload endpoint
  async uploadImage(image: string, folder?: string) {
    return this.request('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ image, folder }),
    });
  }

  // Dashboard summary
  async getDashboardSummary() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [incomes, expenses, accounts, parties] = await Promise.all([
      this.getIncomes({
        startDate: firstDay.toISOString(),
        endDate: lastDay.toISOString(),
      }),
      this.getExpenses({
        startDate: firstDay.toISOString(),
        endDate: lastDay.toISOString(),
      }),
      this.getAccounts(),
      this.getParties(),
    ]);

    return {
      incomes: incomes.data,
      expenses: expenses.data,
      accounts: accounts.data,
      parties: parties.data,
    };
  }
}

export const api = new ApiClient(API_URL);
export default api;
