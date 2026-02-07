import React, { useState } from 'react';
import { X, Users, Copy, CheckCircle2 } from 'lucide-react';
import { Transaction, Trip, CategoryType } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  title?: string;
  trip?: Trip; // Optional, purely for reporting details if linked to a trip
}

const SettleModal: React.FC<Props> = ({ isOpen, onClose, transactions, title = "Tất toán", trip }) => {
  const [memberCount, setMemberCount] = useState(1);
  
  if (!isOpen) return null;

  // Calculate Net Cost: Expense - Income
  const totalSpent = transactions.reduce((acc, t) => {
    if (t.category === CategoryType.INCOME) {
        return acc - t.amount;
    }
    return acc + t.amount;
  }, 0);

  const perPerson = Math.ceil(totalSpent / (memberCount || 1));

  // Helper to Group Transactions by Date for Report
  const groupTransactionsByDate = (txs: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    txs.forEach(t => {
      const dateKey = new Date(t.date).toDateString(); 
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });
    return groups;
  };

  const handleCopyReport = () => {
    const groupedTxs = groupTransactionsByDate(transactions);
    
    let report = `🧾 ${title.toUpperCase()}\n`;
    if (trip) {
        report += `📍 Chuyến đi: ${trip.name}\n`;
    }
    report += `📅 Ngày tạo: ${formatDate(Date.now())}\n`;
    report += `--------------------------------\n`;
    report += `💰 THỰC CHI (Chi - Thu): ${formatCurrency(totalSpent)}\n`;
    report += `👥 Số người: ${memberCount}\n`;
    report += `👉 MỖI NGƯỜI: ${formatCurrency(perPerson)}\n`;
    report += `--------------------------------\n`;
    report += `📝 CHI TIẾT:\n`;

    Object.keys(groupedTxs).forEach(dateKey => {
       const dateStr = formatDate(groupedTxs[dateKey][0].date);
       report += `\n📌 ${dateStr}:\n`;
       groupedTxs[dateKey].forEach(t => {
          const isIncome = t.category === CategoryType.INCOME;
          const sign = isIncome ? '(+Thu)' : '';
          const amountPrefix = isIncome ? '-' : ''; // Income reduces the cost basis
          report += ` - ${t.note} ${sign}: ${amountPrefix}${formatCurrency(t.amount)}\n`;
       });
    });

    navigator.clipboard.writeText(report);
    alert('Đã sao chép bảng tính tiền! Bạn có thể dán vào Zalo/Messenger.');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-fade-in">
        <div 
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 pb-8 sm:p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 truncate pr-2">
                    <CheckCircle2 className="text-green-500 shrink-0" /> <span className="truncate">{title}</span>
                </h3>
                <button onClick={onClose} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 shrink-0">
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Số khoản đã chọn:</span>
                            <span className="text-sm font-bold text-gray-800">{transactions.length} khoản</span>
                        </div>
                        <div className="h-px bg-gray-200 my-2"></div>
                        <p className="text-sm text-gray-500 mb-1">Tổng thực chi (đã trừ thu)</p>
                        <p className={`text-3xl font-bold truncate ${totalSpent < 0 ? 'text-green-600' : 'text-blue-600'}`} title={formatCurrency(totalSpent)}>
                        {formatCurrency(totalSpent)}
                        </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Users size={16} /> Số người tham gia
                    </label>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                            className="w-12 h-12 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold active:scale-95 touch-manipulation hover:bg-gray-200 transition-colors"
                        >-</button>
                        <input 
                            type="number" 
                            value={memberCount}
                            onChange={(e) => setMemberCount(Math.max(1, Number(e.target.value)))}
                            className="flex-1 min-w-0 text-center text-2xl font-bold outline-none border-b-2 border-gray-200 py-2 focus:border-primary bg-transparent"
                        />
                        <button 
                            onClick={() => setMemberCount(memberCount + 1)}
                            className="w-12 h-12 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold active:scale-95 touch-manipulation hover:bg-gray-200 transition-colors"
                        >+</button>
                    </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600 font-medium">Mỗi người:</span>
                        <span className="text-2xl font-bold text-orange-500 truncate max-w-[50%]">
                            {formatCurrency(perPerson)}
                        </span>
                    </div>
                </div>

                <button 
                    onClick={handleCopyReport}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    <Copy size={20} /> Sao chép báo cáo
                </button>
            </div>
        </div>
    </div>
  );
};

export default SettleModal;