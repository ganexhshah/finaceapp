import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import api from '@/lib/api';
import { adToBS, NEPALI_MONTHS_EN, NEPALI_DAYS_EN, getDaysInBSMonth } from '@/lib/nepali-date';

interface DayData {
  date: Date;
  income: number;
  expense: number;
  isCurrentMonth: boolean;
}

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category?: { name: string; icon: string };
  date: string;
}

interface CalendarViewProps {
  onDateSelect?: (date: Date, income: number, expense: number, transactions: Transaction[]) => void;
}

type CalendarType = 'AD' | 'BS';

export default function CalendarView({ onDateSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<Map<string, DayData>>(new Map());
  const [dayTransactions, setDayTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [calendarType, setCalendarType] = useState<CalendarType>('AD');

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentNepaliDate = adToBS(currentDate);
  const displayMonthName = calendarType === 'BS' 
    ? NEPALI_MONTHS_EN[currentNepaliDate.month - 1]
    : monthNames[currentDate.getMonth()];
  const displayYear = calendarType === 'BS' 
    ? currentNepaliDate.year 
    : currentDate.getFullYear();
  const displayDayNames = calendarType === 'BS' ? NEPALI_DAYS_EN : dayNames;

  useEffect(() => {
    loadMonthData();
  }, [currentDate]);

  const loadMonthData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const [incomesRes, expensesRes] = await Promise.all([
        api.getIncomes({
          startDate: firstDay.toISOString(),
          endDate: lastDay.toISOString(),
        }),
        api.getExpenses({
          startDate: firstDay.toISOString(),
          endDate: lastDay.toISOString(),
        }),
      ]);

      const dataMap = new Map<string, DayData>();

      // Process incomes
      if (incomesRes.success && incomesRes.data && typeof incomesRes.data === 'object' && 'incomes' in incomesRes.data) {
        const incomes = incomesRes.data.incomes as any[];
        incomes.forEach((income: any) => {
          const date = new Date(income.date);
          const key = date.toDateString();
          const existing = dataMap.get(key) || { date, income: 0, expense: 0, isCurrentMonth: true };
          existing.income += income.amount;
          dataMap.set(key, existing);
        });
      }

      // Process expenses
      if (expensesRes.success && expensesRes.data && typeof expensesRes.data === 'object' && 'expenses' in expensesRes.data) {
        const expenses = expensesRes.data.expenses as any[];
        expenses.forEach((expense: any) => {
          const date = new Date(expense.date);
          const key = date.toDateString();
          const existing = dataMap.get(key) || { date, income: 0, expense: 0, isCurrentMonth: true };
          existing.expense += expense.amount;
          dataMap.set(key, existing);
        });
      }

      setCalendarData(dataMap);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDayTransactions = async (date: Date) => {
    setLoadingTransactions(true);
    try {
      const transactions = await getDayTransactionsData(date);
      setDayTransactions(transactions);
    } catch (error) {
      console.error('Error loading day transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (DayData | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const key = date.toDateString();
      const data = calendarData.get(key);
      days.push(data || { date, income: 0, expense: 0, isCurrentMonth: true });
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const handleDatePress = async (dayData: DayData) => {
    setSelectedDate(dayData.date);
    await loadDayTransactions(dayData.date);
    
    // Notify parent component if callback provided
    if (onDateSelect) {
      const transactions = await getDayTransactionsData(dayData.date);
      onDateSelect(dayData.date, dayData.income, dayData.expense, transactions);
    }
  };

  const getDayTransactionsData = async (date: Date): Promise<Transaction[]> => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [incomesRes, expensesRes] = await Promise.all([
      api.getIncomes({
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      }),
      api.getExpenses({
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      }),
    ]);

    const transactions: Transaction[] = [];

    if (incomesRes.success && incomesRes.data && typeof incomesRes.data === 'object' && 'incomes' in incomesRes.data) {
      const incomes = incomesRes.data.incomes as any[];
      incomes.forEach((income: any) => {
        transactions.push({
          id: `income-${income.id}`,
          title: income.title,
          amount: income.amount,
          type: 'income',
          category: income.category,
          date: new Date(income.date).toLocaleString(),
        });
      });
    }

    if (expensesRes.success && expensesRes.data && typeof expensesRes.data === 'object' && 'expenses' in expensesRes.data) {
      const expenses = expensesRes.data.expenses as any[];
      expenses.forEach((expense: any) => {
        transactions.push({
          id: `expense-${expense.id}`,
          title: expense.title,
          amount: expense.amount,
          type: 'expense',
          category: expense.category,
          date: new Date(expense.date).toLocaleString(),
        });
      });
    }

    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return transactions;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const days = getDaysInMonth();

  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.monthYearContainer}>
          <Text style={styles.monthYear}>
            {displayMonthName}
          </Text>
          <Text style={styles.year}>{displayYear}</Text>
        </View>
        
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Calendar Type Toggle */}
      <View style={styles.calendarTypeToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, calendarType === 'AD' && styles.toggleButtonActive]}
          onPress={() => setCalendarType('AD')}
        >
          <Text style={[styles.toggleButtonText, calendarType === 'AD' && styles.toggleButtonTextActive]}>
            AD
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, calendarType === 'BS' && styles.toggleButtonActive]}
          onPress={() => setCalendarType('BS')}
        >
          <Text style={[styles.toggleButtonText, calendarType === 'BS' && styles.toggleButtonTextActive]}>
            BS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day Names */}
      <View style={styles.dayNamesRow}>
        {displayDayNames.map((day) => (
          <View key={day} style={styles.dayNameCell}>
            <Text style={styles.dayNameText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <View style={styles.calendarGrid}>
          {days.map((dayData, index) => {
            const hasIncome = dayData && dayData.income > 0;
            const hasExpense = dayData && dayData.expense > 0;
            return (
              <View key={index} style={styles.dayCell}>
                {dayData ? (
                  <TouchableOpacity
                    style={[
                      styles.dayCellInner,
                      isToday(dayData.date) && styles.todayCell,
                      isSelected(dayData.date) && styles.selectedCell,
                      (hasIncome || hasExpense) && !isSelected(dayData.date) && !isToday(dayData.date) && styles.activityCell,
                    ]}
                    onPress={() => handleDatePress(dayData)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dayNumber,
                      isToday(dayData.date) && styles.todayText,
                      isSelected(dayData.date) && styles.selectedText,
                      (hasIncome || hasExpense) && !isSelected(dayData.date) && !isToday(dayData.date) && styles.activityText,
                    ]}>
                      {calendarType === 'BS' ? adToBS(dayData.date).day : dayData.date.getDate()}
                    </Text>
                    {(hasIncome || hasExpense) && !isSelected(dayData.date) && (
                      <View style={styles.indicators}>
                        {hasIncome && <View style={styles.incomeIndicator} />}
                        {hasExpense && <View style={styles.expenseIndicator} />}
                      </View>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.dayCellInner, styles.emptyCell]} />
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#2563eb',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  year: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  calendarTypeToggle: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    gap: 8,
    justifyContent: 'center',
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toggleButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
  dayNamesRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#f9fafb',
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayNameText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  dayCell: {
    width: '14.28%',
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  dayCellInner: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 40,
    maxHeight: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  todayCell: {
    backgroundColor: '#dbeafe',
  },
  selectedCell: {
    backgroundColor: '#2563eb',
  },
  activityCell: {
    backgroundColor: '#f3f4f6',
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  todayText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  activityText: {
    color: '#1f2937',
    fontWeight: '700',
  },
  indicators: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    position: 'absolute',
    bottom: 4,
  },
  incomeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
  },
  expenseIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
  },
  activityDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#2563eb',
    marginTop: 2,
    position: 'absolute',
    bottom: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
