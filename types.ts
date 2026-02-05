export enum CategoryType {
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  SHOPPING = 'SHOPPING',
  LODGING = 'LODGING',
  UTILITIES = 'UTILITIES',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER',
  INCOME = 'INCOME'
}

export interface Transaction {
  id: string;
  amount: number;
  category: CategoryType;
  note: string;
  date: number; // timestamp
  tripId?: string; // Optional link to a trip
}

export interface Trip {
  id: string;
  name: string;
  startDate: number;
  endDate?: number;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface AppSettings {
  dailyFoodBudget: number; // Default 100k
}

export const CategoryLabels: Record<CategoryType, string> = {
  [CategoryType.FOOD]: 'Ăn uống',
  [CategoryType.TRANSPORT]: 'Di chuyển',
  [CategoryType.SHOPPING]: 'Mua sắm',
  [CategoryType.LODGING]: 'Lưu trú',
  [CategoryType.UTILITIES]: 'Dịch vụ',
  [CategoryType.ENTERTAINMENT]: 'Giải trí',
  [CategoryType.OTHER]: 'Khác',
  [CategoryType.INCOME]: 'Thu nhập',
};

export const CategoryKeywords: Record<string, CategoryType> = {
  'ăn': CategoryType.FOOD,
  'uống': CategoryType.FOOD,
  'cơm': CategoryType.FOOD,
  'phở': CategoryType.FOOD,
  'bún': CategoryType.FOOD,
  'cafe': CategoryType.FOOD,
  'cf': CategoryType.FOOD,
  'nước': CategoryType.FOOD,
  'xăng': CategoryType.TRANSPORT,
  'xe': CategoryType.TRANSPORT,
  'grab': CategoryType.TRANSPORT,
  'taxi': CategoryType.TRANSPORT,
  'vé': CategoryType.TRANSPORT,
  'mua': CategoryType.SHOPPING,
  'sắm': CategoryType.SHOPPING,
  'áo': CategoryType.SHOPPING,
  'quần': CategoryType.SHOPPING,
  'đồ': CategoryType.SHOPPING,
  'ks': CategoryType.LODGING,
  'khách sạn': CategoryType.LODGING,
  'phòng': CategoryType.LODGING,
  'điện': CategoryType.UTILITIES,
  'nước sinh hoạt': CategoryType.UTILITIES,
  'net': CategoryType.UTILITIES,
  'lương': CategoryType.INCOME,
  'thưởng': CategoryType.INCOME,
};