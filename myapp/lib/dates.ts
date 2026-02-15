export function resolveDateOptionToISO(option: string, now: Date = new Date()): string {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0); // Avoid DST edge cases around midnight.

  const lower = option.trim().toLowerCase();
  if (lower === 'today') return d.toISOString();
  if (lower === 'yesterday') {
    d.setDate(d.getDate() - 1);
    return d.toISOString();
  }

  const daysAgoMatch = lower.match(/^(\d+)\s+days?\s+ago$/);
  if (daysAgoMatch) {
    d.setDate(d.getDate() - Number(daysAgoMatch[1]));
    return d.toISOString();
  }

  if (lower === 'this week') {
    // Use today for "this week" since there is no date picker wired in.
    return d.toISOString();
  }

  if (lower === 'last week') {
    d.setDate(d.getDate() - 7);
    return d.toISOString();
  }

  if (lower === '1 week ago') {
    d.setDate(d.getDate() - 7);
    return d.toISOString();
  }

  if (lower === '1 month ago') {
    d.setMonth(d.getMonth() - 1);
    return d.toISOString();
  }

  // "Custom" (or unknown) falls back to today until a real picker is added.
  return d.toISOString();
}

export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeekMonday(date: Date) {
  const d = startOfDay(date);
  // JS: 0=Sun,1=Mon,...6=Sat. Convert to Monday-based week.
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday=0,...Sunday=6
  d.setDate(d.getDate() - diff);
  return d;
}

function endOfWeekSunday(date: Date) {
  const start = startOfWeekMonday(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return endOfDay(end);
}

export function getBudgetRange(period: BudgetPeriod, now: Date = new Date()) {
  const base = new Date(now);
  switch (period) {
    case 'daily': {
      return { startDate: startOfDay(base).toISOString(), endDate: endOfDay(base).toISOString() };
    }
    case 'weekly': {
      return { startDate: startOfWeekMonday(base).toISOString(), endDate: endOfWeekSunday(base).toISOString() };
    }
    case 'monthly': {
      const start = new Date(base.getFullYear(), base.getMonth(), 1);
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      return { startDate: startOfDay(start).toISOString(), endDate: endOfDay(end).toISOString() };
    }
    case 'yearly': {
      const start = new Date(base.getFullYear(), 0, 1);
      const end = new Date(base.getFullYear(), 11, 31);
      return { startDate: startOfDay(start).toISOString(), endDate: endOfDay(end).toISOString() };
    }
    default: {
      // Exhaustive guard
      return { startDate: startOfDay(base).toISOString(), endDate: endOfDay(base).toISOString() };
    }
  }
}

