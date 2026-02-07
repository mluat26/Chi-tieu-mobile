import React, { useMemo } from 'react';
import { Transaction, CategoryType, Trip } from '../types';
import { formatCurrency } from '../utils';
import TransactionItem from '../components/TransactionItem';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Coffee, Fuel, ShoppingCart, Utensils, Plane, ArrowRight } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  trips: Trip[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (t: Transaction) => void;
  onQuickAdd: (text: string) => void;
  onViewAll: () => void; // Added Prop
}

const OverviewTab: React.FC<Props> = ({ 
  transactions, 
  trips, 
  onDeleteTransaction, 
  onEditTransaction, 
  onQuickAdd,
  onViewAll 
}) => {
  // Calculate Totals
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.category === CategoryType.INCOME) {
          acc.totalIncome += t.amount;
          acc.balance += t.amount;
        } else {
          acc.totalExpense += t.amount;
          acc.balance -= t.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 }
    );
  }, [transactions]);

  // Chart Data
  const chartData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.category !== CategoryType.INCOME) {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(categories).map(([key, value]) => ({
      name: key,
      value: value
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const COLORS = ['#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#6B7280'];

  const recentTransactions = [...transactions].sort((a, b) => b.date - a.date).slice(0, 5);

  const QuickActions = [
    { icon: <Utensils size={20} />, label: "Ăn uống", text: " ăn uống", color: "bg-orange-100 text-orange-600" },
    { icon: <Coffee size={20} />, label: "Cafe", text: " cafe", color: "bg-brown-100 text-amber-700" },
    { icon: <Fuel size={20} />, label: "Xăng", text: " xăng", color: "bg-blue-100 text-blue-600" },
    { icon: <ShoppingCart size={20} />, label: "Đi chợ", text: " đi chợ", color: "bg-green-100 text-green-600" },
  ];

  // Check for active trip to show banner
  const activeTrip = trips.find(t => t.status === 'ACTIVE');

  return (
    <div className="pb-24 pt-4 px-4 space-y-6">
      
      {/* Active Trip Banner - if any */}
      {activeTrip && (
        <div 
          onClick={() => {/* Need to handle navigation if we want to jump to it, but for now just visual */}} 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-md flex justify-between items-center cursor-pointer"
        >
          <div>
            <p className="text-indigo-100 text-xs font-bold uppercase">Chuyến đi đang diễn ra</p>
            <h3 className="font-bold text-lg">{activeTrip.name}</h3>
          </div>
          <div className="bg-white/20 p-2 rounded-full">
            <Plane size={20} />
          </div>
        </div>
      )}

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary to-green-600 rounded-3xl p-6 text-white shadow-lg">
        <p className="text-green-100 text-sm font-medium mb-1">Số dư hiện tại</p>
        <h2 className="text-3xl font-bold mb-6">{formatCurrency(balance)}</h2>
        <div className="flex justify-between items-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <div>
            <p className="text-xs text-green-100 mb-1">Tổng thu</p>
            <p className="font-semibold text-white">+{formatCurrency(totalIncome)}</p>
          </div>
          <div className="h-8 w-px bg-green-400/30 mx-4"></div>
          <div className="text-right">
            <p className="text-xs text-green-100 mb-1">Tổng chi</p>
            <p className="font-semibold text-white">-{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div>
         <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Phím tắt nhanh</h3>
         <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {QuickActions.map((action, idx) => (
               <button 
                  key={idx}
                  onClick={() => onQuickAdd(action.text)}
                  className="flex flex-col items-center gap-2 min-w-[70px] active:scale-95 transition-transform"
               >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${action.color}`}>
                     {action.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-600">{action.label}</span>
               </button>
            ))}
         </div>
      </div>

      {/* Chart Section */}
      {chartData.length > 0 && (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Cơ cấu chi tiêu</h3>
          <div className="h-48 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-3">
             <h3 className="font-bold text-gray-800 text-lg">Gần đây</h3>
             <button 
                onClick={onViewAll}
                className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
             >
                Xem tất cả <ArrowRight size={16} />
             </button>
        </div>
        <div className="bg-white rounded-3xl px-2 shadow-sm border border-gray-100">
          {recentTransactions.length > 0 ? (
            recentTransactions.map(t => {
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
            })
          ) : (
            <div className="text-center py-8 text-gray-400">
              Chưa có chi tiêu nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;