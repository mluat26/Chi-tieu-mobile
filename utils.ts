import { CategoryKeywords, CategoryType } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Smart Parsing Logic (No AI)
export const parseTransactionInput = (input: string): { amount: number; category: CategoryType; note: string } | null => {
  const normalizedInput = input.trim().toLowerCase();
  
  // Regex to match amount with suffixes (k, tr, d) at the start or middle
  // Supports: "50k ăn sáng", "ăn sáng 50k", "50000 an sang"
  const amountRegex = /(\d+(?:[.,]\d+)?)\s*(k|tr|đ|d|vnđ)?/i;
  const amountMatch = normalizedInput.match(amountRegex);

  if (!amountMatch) return null;

  const rawValue = parseFloat(amountMatch[1].replace(',', '.'));
  const unit = amountMatch[2];
  
  let multiplier = 1;
  if (unit === 'k') multiplier = 1000;
  else if (unit === 'tr') multiplier = 1000000;
  
  const amount = rawValue * multiplier;

  // Remove the amount part from the string to get the note
  let note = normalizedInput.replace(amountMatch[0], '').trim();
  
  // Detect Category based on keywords
  let category = CategoryType.OTHER;
  
  // Basic keyword matching
  const words = note.split(/\s+/);
  for (const word of words) {
    if (CategoryKeywords[word]) {
      category = CategoryKeywords[word];
      break;
    }
  }

  // Fallback: Check basic phrases if single word didn't match
  if (category === CategoryType.OTHER) {
      for (const [key, cat] of Object.entries(CategoryKeywords)) {
          if (note.includes(key)) {
              category = cat;
              break;
          }
      }
  }

  // Clean up note
  if (note.length === 0) note = "Chi tiêu không tên";
  // Capitalize first letter of note
  note = note.charAt(0).toUpperCase() + note.slice(1);

  return { amount, category, note };
};