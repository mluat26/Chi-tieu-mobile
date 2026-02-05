import React, { useState } from 'react';
import { Trip, Transaction } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils';
import TransactionItem from '../components/TransactionItem';
import { MapPin, Plus, Calendar, ArrowLeft, Trash2, X, Clock, Users, Calculator, Copy, CheckCircle2 } from 'lucide-react';

interface Props {
  trips: Trip[];
  transactions: Transaction[];
  onAddTrip: (trip: Trip) => void;
  onDeleteTrip: (id: string) => void;
  onSelectTrip: (id: string | null) => void; 
  activeTripId: string | null;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (t: Transaction) => void;
}

const TripsTab: React.FC<Props> = ({ 
  trips, 
  transactions, 
  onAddTrip, 
  onDeleteTrip, 
  onSelectTrip, 
  activeTripId,
  onDeleteTransaction,
  onEditTransaction
}) => {
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  
  // Settle/Split Bill State
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [memberCount, setMemberCount] = useState(1);

  // Trip Form State
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName) return;
    
    const newTrip: Trip = {
      id: generateId(),
      name: tripName,
      startDate: new Date(startDate).getTime(),
      endDate: endDate ? new Date(endDate).getTime() : undefined,
      status: 'ACTIVE'
    };
    onAddTrip(newTrip);
    
    // Reset form
    setTripName('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setShowNewTripModal(false);
  };

  // Helper to Group Transactions by Date
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

  // Handle Export/Copy Report
  const handleCopyReport = (trip: Trip, totalSpent: number, groupedTxs: { [key: string]: Transaction[] }) => {
    const perPerson = Math.ceil(totalSpent / (memberCount || 1));
    
    let report = `🧾 QUYẾT TOÁN: ${trip.name.toUpperCase()}\n`;
    report += `📅 Ngày: ${formatDate(trip.startDate)}\n`;
    report += `--------------------------------\n`;
    report += `💰 TỔNG CHI: ${formatCurrency(totalSpent)}\n`;
    report += `👥 Số người: ${memberCount}\n`;
    report += `👉 MỖI NGƯỜI: ${formatCurrency(perPerson)}\n`;
    report += `--------------------------------\n`;
    report += `📝 CHI TIẾT:\n`;

    Object.keys(groupedTxs).forEach(dateKey => {
       const dateStr = formatDate(groupedTxs[dateKey][0].date);
       report += `\n📌 ${dateStr}:\n`;
       groupedTxs[dateKey].forEach(t => {
          report += ` - ${t.note}: ${formatCurrency(t.amount)}\n`;
       });
    });

    navigator.clipboard.writeText(report);
    alert('Đã sao chép bảng quyết toán! Bạn có thể dán vào Zalo/Messenger.');
  };

  // View: Single Trip Details
  if (activeTripId) {
    const trip = trips.find(t => t.id === activeTripId);
    
    if (!trip) return <div>Trip not found</div>;

    // Filter and sort transactions for this trip
    const tripTransactions = transactions
        .filter(t => t.tripId === activeTripId)
        .sort((a,b) => b.date - a.date);

    const totalSpent = tripTransactions.reduce((acc, t) => acc + t.amount, 0);
    const groupedTransactions = groupTransactionsByDate(tripTransactions);

    return (
      <div className="pb-24 pt-4 px-4 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => onSelectTrip(null)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
             <h2 className="text-xl font-bold text-gray-800 line-clamp-1">{trip.name}</h2>
             <p className="text-xs text-gray-500">
                {formatDate(trip.startDate)} {trip.endDate ? `- ${formatDate(trip.endDate)}` : ''}
             </p>
          </div>
        </div>

        {/* Total Card */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <span className="text-blue-100 text-sm flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
                <Clock size={14} /> {trip.status === 'ACTIVE' ? 'Đang đi' : 'Kết thúc'}
                </span>
                <div className="flex gap-2">
                    {/* Calculate Button */}
                    <button 
                        onClick={() => { setMemberCount(1); setShowSettleModal(true); }}
                        className="text-white bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-all flex items-center gap-1 text-xs font-bold"
                    >
                        <Calculator size={18} /> Tính tiền
                    </button>
                    <button onClick={() => { onDeleteTrip(trip.id); onSelectTrip(null); }} className="text-white/70 hover:text-white bg-white/10 p-2 rounded-full">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Tổng chi phí</p>
            <h1 className="text-4xl font-bold">{formatCurrency(totalSpent)}</h1>
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-10 -left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        </div>

        {/* Settle Modal / Bottom Sheet */}
        {showSettleModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-fade-in">
                <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" /> Tất toán chuyến đi
                        </h3>
                        <button onClick={() => setShowSettleModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                             <p className="text-sm text-gray-500 mb-1">Tổng tiền cần chia</p>
                             <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalSpent)}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Users size={16} /> Số người tham gia
                            </label>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold active:scale-95"
                                >-</button>
                                <input 
                                    type="number" 
                                    value={memberCount}
                                    onChange={(e) => setMemberCount(Math.max(1, Number(e.target.value)))}
                                    className="flex-1 text-center text-2xl font-bold outline-none border-b-2 border-gray-200 py-2 focus:border-primary"
                                />
                                <button 
                                    onClick={() => setMemberCount(memberCount + 1)}
                                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold active:scale-95"
                                >+</button>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-200 pt-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600 font-medium">Mỗi người:</span>
                                <span className="text-2xl font-bold text-orange-500">
                                    {formatCurrency(Math.ceil(totalSpent / (memberCount || 1)))}
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleCopyReport(trip, totalSpent, groupedTransactions)}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <Copy size={20} /> Sao chép báo cáo
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Transactions Grouped by Date */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Nhật ký chi tiêu</h3>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{tripTransactions.length} khoản</span>
          </div>
          
          {tripTransactions.length > 0 ? (
            Object.keys(groupedTransactions).map((dateKey) => (
               <div key={dateKey}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                          {formatDate(groupedTransactions[dateKey][0].date)}
                      </h4>
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <span className="text-xs font-semibold text-blue-500">
                          {formatCurrency(groupedTransactions[dateKey].reduce((sum, t) => sum + t.amount, 0))}
                      </span>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                      {groupedTransactions[dateKey].map(t => (
                          <TransactionItem 
                            key={t.id} 
                            transaction={t} 
                            showDate={false} // No need to show date inside the item since it's grouped
                            onDelete={() => onDeleteTransaction(t.id)}
                            onEdit={() => onEditTransaction(t)}
                          />
                      ))}
                  </div>
               </div>
            ))
          ) : (
             <div className="text-center py-10 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                 <p>Chưa có chi tiêu nào.</p>
                 <p className="text-sm mt-1">Bấm nút (+) và chọn ngày để thêm.</p>
             </div>
          )}
        </div>
      </div>
    );
  }

  // View: List of Trips
  return (
    <div className="pb-24 pt-4 px-4 space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Chuyến đi & Gói</h2>
        <button 
          onClick={() => setShowNewTripModal(true)}
          className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm active:scale-95 transition-transform"
        >
          <Plus size={16} /> Tạo mới
        </button>
      </div>

      {/* Full Modal for Creating Trip */}
      {showNewTripModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
                <button 
                    onClick={() => setShowNewTripModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>
                
                <h3 className="text-xl font-bold text-gray-900 mb-6">Tạo chuyến đi mới</h3>
                
                <form onSubmit={handleCreateTrip} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên chuyến đi</label>
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Vd: Đà Lạt 3N2Đ" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                            value={tripName}
                            onChange={e => setTripName(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đi</label>
                            <input 
                                type="date" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày về (Tuỳ chọn)</label>
                            <input 
                                type="date" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-gray-500"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 mt-4 active:scale-95 transition-transform"
                    >
                        Tạo chuyến đi
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Trips List */}
      <div className="grid gap-4">
        {trips.length > 0 ? (
          trips.map(trip => {
             const tripTotal = transactions.filter(t => t.tripId === trip.id).reduce((s, t) => s + t.amount, 0);
             return (
              <div 
                key={trip.id} 
                onClick={() => onSelectTrip(trip.id)}
                className="group bg-white p-5 rounded-3xl shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer flex justify-between items-center hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{trip.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>{formatDate(trip.startDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <p className="font-bold text-gray-900 text-lg">{formatCurrency(tripTotal)}</p>
                   <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold">Đang đi</span>
                </div>
              </div>
             );
          })
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex bg-gray-100 p-6 rounded-full mb-4 text-gray-300">
               <MapPin size={40} />
            </div>
            <p className="text-gray-500 font-medium">Bạn chưa có chuyến đi nào.</p>
            <p className="text-gray-400 text-sm">Hãy tạo chuyến đi mới để bắt đầu theo dõi!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsTab;