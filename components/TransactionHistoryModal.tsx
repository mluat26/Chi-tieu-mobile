import React, { useState, useMemo } from 'react';
import { X, Search, CheckSquare, Square, Calculator } from 'lucide-react';
import { Transaction, Trip } from '../types';
import { formatCurrency, formatDate } from '../utils';
import TransactionItem from './TransactionItem';
import SettleModal from './SettleModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  trips: Trip[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (t: Transaction) => void;
}

const TransactionHistoryModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  transactions, 
  trips, 
  onDeleteTransaction, 
  onEditTransaction 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSettleModal, setShowSettleModal] = useState(false);

  if (!isOpen) return null;

  // Filter Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.note.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.amount.toString().includes(searchTerm)
    ).sort((a, b) => b.date - a.date);
  }, [transactions, searchTerm]);

  // Group by Date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    filteredTransactions.forEach(t => {
      const dateKey = new Date(t.date).toDateString(); 
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  // Handle Selection
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set()); // Clear selection when toggling
  };

  const selectedTransactions = transactions.filter(t => selectedIds.has(t.id));
  const totalSelectedAmount = selectedTransactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="fixed inset-0 bg-gray-50 z-[90] animate-slide-up flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm border-b border-gray-100 flex items-center justify-between shrink-0 pt-safe-top">
        <div className="flex items-center gap-3 flex-1">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
          <h2 className="text-lg font-bold text-gray-800">Lịch sử chi tiêu</h2>
        </div>
        <button 
          onClick={toggleSelectMode}
          className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${isSelectionMode ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          {isSelectionMode ? 'Hủy chọn' : 'Chọn nhiều'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-2 border-b border-gray-100 shrink-0">
        <div className="bg-gray-100 flex items-center px-3 py-2 rounded-xl">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Tìm kiếm giao dịch..." 
            className="bg-transparent outline-none flex-1 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.keys(groupedTransactions).map(dateKey => (
            <div key={dateKey}>
                 <div className="flex items-center gap-2 mb-2 px-1 sticky top-0 bg-gray-50 z-10 py-1">
                    <h4 className="text-sm font-bold text-gray-500 uppercase">
                        {formatDate(groupedTransactions[dateKey][0].date)}
                    </h4>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {groupedTransactions[dateKey].map(t => {
                         const tripName = t.tripId ? trips.find(tr => tr.id === t.tripId)?.name : undefined;
                         const isSelected = selectedIds.has(t.id);

                         return (
                            <div 
                              key={t.id} 
                              className={`flex items-center ${isSelectionMode ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                              onClick={() => isSelectionMode && toggleSelection(t.id)}
                            >
                                {isSelectionMode && (
                                    <div className="pl-4 pr-1">
                                        {isSelected ? (
                                            <CheckSquare size={20} className="text-blue-500" />
                                        ) : (
                                            <Square size={20} className="text-gray-300" />
                                        )}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <TransactionItem 
                                        transaction={t} 
                                        showDate={false}
                                        tripName={tripName}
                                        onDelete={isSelectionMode ? undefined : () => onDeleteTransaction(t.id)}
                                        onEdit={isSelectionMode ? undefined : () => onEditTransaction(t)}
                                    />
                                </div>
                            </div>
                         );
                    })}
                </div>
            </div>
        ))}
        
        {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-400">
                Không tìm thấy giao dịch nào.
            </div>
        )}
      </div>

      {/* Bottom Action Bar (Selection Mode) */}
      {isSelectionMode && selectedIds.size > 0 && (
          <div className="bg-white border-t border-gray-100 p-4 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] shrink-0 z-20">
              <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">{selectedIds.size} khoản đã chọn</span>
                  <span className="text-xl font-bold text-gray-800">{formatCurrency(totalSelectedAmount)}</span>
              </div>
              <button 
                onClick={() => setShowSettleModal(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                  <Calculator size={20} /> Tính tiền các khoản chọn
              </button>
          </div>
      )}

      {/* Reusable Settle Modal - Condition Added */}
      {showSettleModal && (
        <SettleModal 
          isOpen={showSettleModal}
          onClose={() => setShowSettleModal(false)}
          transactions={selectedTransactions}
          title="Tính tiền nhóm (Tùy chọn)"
        />
      )}
    </div>
  );
};

export default TransactionHistoryModal;