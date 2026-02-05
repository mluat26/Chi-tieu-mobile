import React, { useState, useMemo } from 'react';
import { AppSettings, CategoryType, Transaction, Trip } from '../types';
import { formatCurrency } from '../utils';
import TransactionItem from '../components/TransactionItem';
import { Settings, Utensils, Wallet, TrendingUp, Edit2 } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  trips: Trip[];
  settings: AppSettings;
  updateSettings: (s: AppSettings) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (t: Transaction) => void;
}

const DiningTab: React.FC<Props> = ({ transactions, trips, settings, updateSettings, onDeleteTransaction, onEditTransaction }) => {
  const [showSettings, setShowSettings] = useState(false);

  // Filter only food transactions for current month
  const { spentThisMonth, foodTransactions } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filtered = transactions.filter(t => {
      const tDate = new Date(t.date);
      return t.category === CategoryType.FOOD && 
             tDate.getMonth() === currentMonth && 
             tDate.getFullYear() === currentYear;
    }).sort((a, b) => b.date - a.date);

    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    return { spentThisMonth: total, foodTransactions: filtered };
  }, [transactions]);

  // Cumulative Calculation
  const currentDate = new Date().getDate();
  const cumulativeBudget = settings.dailyFoodBudget * currentDate;
  const surplus = cumulativeBudget - spentThisMonth;

  return (
    <div className="pb-24 pt-4 px-4 space-y-6">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-bold text-gray-800">Quỹ Ăn Uống</h2>
        <button onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-primary p-2">
            <Settings size={20} />
        </button>
      </div>

      {showSettings && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-slide-down mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Điều chỉnh mục tiêu / ngày</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={settings.dailyFoodBudget}
              onChange={(e) => updateSettings({...settings, dailyFoodBudget: Number(e.target.value)})}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
            <button 
              onClick={() => setShowSettings(false)}
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium"
            >
              Lưu
            </button>
          </div>
        </div>
      )}

      {/* Grid Dashboard - Compact Layout */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Card 1: Daily Budget Target */}
        <div className="bg-[#10B981] rounded-2xl p-4 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex justify-between items-start z-10">
            <div className="bg-white/20 p-1.5 rounded-lg">
               <Utensils size={18} className="text-white" />
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:bg-white/10 rounded-full">
              <Edit2 size={14} />
            </button>
          </div>
          <div className="z-10">
            <p className="text-emerald-50 text-[10px] font-bold uppercase tracking-wider mb-0.5">Mục tiêu/ngày</p>
            <p className="text-xl font-bold truncate">{formatCurrency(settings.dailyFoodBudget)}</p>
          </div>
          {/* Decor */}
          <div className="absolute -right-2 -bottom-4 text-emerald-600/30">
            <Utensils size={64} />
          </div>
        </div>

        {/* Card 2: Total Spent */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-32">
           <div className="flex justify-between items-start z-10">
            <div className="bg-orange-100 p-1.5 rounded-lg">
               <Wallet size={18} className="text-orange-500" />
            </div>
            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-md">
              {currentDate} ngày
            </span>
          </div>
          <div className="z-10">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Đã ăn</p>
            <p className="text-xl font-bold text-gray-800 truncate">{formatCurrency(spentThisMonth)}</p>
          </div>
        </div>

        {/* Card 3: Surplus (Full Width) */}
        <div className="col-span-2 bg-[#ECFDF5] border border-[#D1FAE5] rounded-2xl p-4 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="bg-emerald-200 p-2 rounded-xl">
               <TrendingUp size={20} className="text-emerald-700" />
             </div>
             <div>
               <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Tổng dư ra</p>
               <p className="text-2xl font-bold text-emerald-700 leading-none">
                 {surplus > 0 ? '+' : ''}{formatCurrency(surplus)}
               </p>
             </div>
           </div>
           {/* Mini visual indicator */}
           <div className="h-full flex items-center">
              {surplus >= 0 ? (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Giỏi lắm!</span>
              ) : (
                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">Bội chi</span>
              )}
           </div>
        </div>

      </div>

      {/* Transaction List Table */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 px-1 text-sm uppercase">Chi tiết tháng này</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {foodTransactions.length > 0 ? (
              <div>
                <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100">
                    <div className="col-span-7 pl-2">Nội dung</div>
                    <div className="col-span-5 text-right pr-2">Số tiền</div>
                </div>
                {foodTransactions.map(t => {
                   const tripName = t.tripId ? trips.find(tr => tr.id === t.tripId)?.name : undefined;
                   return (
                    <TransactionItem 
                      key={t.id} 
                      transaction={t} 
                      showDate 
                      tripName={tripName}
                      onDelete={() => onDeleteTransaction(t.id)} 
                      onEdit={() => onEditTransaction(t)}
                    />
                   );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm">
                Chưa có dữ liệu ăn uống tháng này.
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DiningTab;