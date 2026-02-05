import React from 'react';
import { Transaction, CategoryLabels, CategoryType } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Utensils, Car, ShoppingBag, Home, Zap, Gamepad2, MoreHorizontal, DollarSign, Trash2, MapPin, Edit2 } from 'lucide-react';

const getIcon = (cat: CategoryType) => {
  switch (cat) {
    case CategoryType.FOOD: return <Utensils size={16} />;
    case CategoryType.TRANSPORT: return <Car size={16} />;
    case CategoryType.SHOPPING: return <ShoppingBag size={16} />;
    case CategoryType.LODGING: return <Home size={16} />;
    case CategoryType.UTILITIES: return <Zap size={16} />;
    case CategoryType.ENTERTAINMENT: return <Gamepad2 size={16} />;
    case CategoryType.INCOME: return <DollarSign size={16} />;
    default: return <MoreHorizontal size={16} />;
  }
};

const getChipStyles = (cat: CategoryType) => {
    switch (cat) {
        case CategoryType.FOOD: return 'bg-orange-100 text-orange-700';
        case CategoryType.TRANSPORT: return 'bg-blue-100 text-blue-700';
        case CategoryType.SHOPPING: return 'bg-pink-100 text-pink-700';
        case CategoryType.LODGING: return 'bg-purple-100 text-purple-700';
        case CategoryType.INCOME: return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

interface Props {
  transaction: Transaction;
  showDate?: boolean;
  tripName?: string; 
  onDelete?: () => void;
  onEdit?: () => void; // Added edit handler
}

const TransactionItem: React.FC<Props> = ({ transaction, showDate = false, tripName, onDelete, onEdit }) => {
  const isIncome = transaction.category === CategoryType.INCOME;
  
  return (
    <div className="group relative flex items-center gap-3 py-3 px-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-xl">
      {/* Icon Chip */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getChipStyles(transaction.category)}`}>
        {getIcon(transaction.category)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{transaction.note}</p>
        <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
            {/* Show Date */}
            {showDate && (
                <span>{formatDate(transaction.date)}</span>
            )}
            
            {/* Show Trip Name Badge if exists */}
            {tripName && (
              <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-medium text-[10px] truncate max-w-[120px]">
                 <MapPin size={10} /> {tripName}
              </span>
            )}
        </div>
      </div>

      <div className="text-right">
        <div className={`font-bold ${isIncome ? 'text-emerald-600' : 'text-gray-900'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center">
          {onEdit && (
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all"
              >
                <Edit2 size={16} />
              </button>
          )}
          {onDelete && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              >
                <Trash2 size={16} />
              </button>
          )}
      </div>
    </div>
  );
};

export default TransactionItem;