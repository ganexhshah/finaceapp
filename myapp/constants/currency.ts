export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';
export const CURRENCY_NAME = 'Indian Rupee';

export const formatCurrency = (amount: number): string => {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
};
