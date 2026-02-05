import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, X, Calendar, MapPin, User, Save } from 'lucide-react';
import { parseTransactionInput, formatDate } from '../utils';
import { CategoryLabels, Transaction, Trip } from '../types';

interface SmartInputProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate: (transaction: Omit<Transaction, 'id'>) => void;
  activeTripId?: string;
  className?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: string;
  availableTrips: Trip[];
  editingTransaction: Transaction | null;
}

const SmartInput: React.FC<SmartInputProps> = ({ 
  onAdd, 
  onUpdate,
  activeTripId, 
  className,
  isOpen,
  onOpenChange,
  initialValue = '',
  availableTrips,
  editingTransaction
}) => {
  const [input, setInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scope, setScope] = useState<'PERSONAL' | 'TRIP'>('PERSONAL');
  const [selectedTrip, setSelectedTrip] = useState<string>(''); 
  const [preview, setPreview] = useState<{ amount: number; category: string; note: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
      setInput(initialValue);
      
      // Determine initial state based on editing vs creating
      if (editingTransaction) {
        // Edit Mode
        const dateStr = new Date(editingTransaction.date).toISOString().split('T')[0];
        setSelectedDate(dateStr);
        if (editingTransaction.tripId) {
          setScope('TRIP');
          setSelectedTrip(editingTransaction.tripId);
        } else {
          setScope('PERSONAL');
          setSelectedTrip('');
        }
      } else {
        // Create Mode
        setSelectedDate(new Date().toISOString().split('T')[0]);
        if (activeTripId) {
           setScope('TRIP');
           setSelectedTrip(activeTripId);
        } else {
           setScope('PERSONAL');
           setSelectedTrip('');
        }
      }
      
      if (initialValue) {
        const parsed = parseTransactionInput(initialValue);
        if (parsed) {
           setPreview({
            amount: parsed.amount,
            category: CategoryLabels[parsed.category],
            note: parsed.note
          });
        }
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setPreview(null);
    }
  }, [isOpen, initialValue, activeTripId, editingTransaction]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    const parsed = parseTransactionInput(val);
    if (parsed) {
      setPreview({
        amount: parsed.amount,
        category: CategoryLabels[parsed.category],
        note: parsed.note
      });
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseTransactionInput(input);
    if (parsed) {
      const data = {
        amount: parsed.amount,
        category: parsed.category,
        note: parsed.note,
        tripId: scope === 'TRIP' ? selectedTrip : undefined,
        date: new Date(selectedDate).getTime()
      };

      if (editingTransaction) {
        onUpdate(data);
      } else {
        onAdd(data);
      }
      
      setInput('');
      setPreview(null);
      onOpenChange(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className={`fixed bottom-20 right-4 bg-primary text-white p-4 rounded-full shadow-lg z-50 hover:bg-green-600 transition-all active:scale-95 ${className}`}
      >
        <Plus size={28} />
      </button>
    );
  }

  // Filter only active trips for selection
  const activeTripsList = availableTrips.filter(t => t.status === 'ACTIVE');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 backdrop-blur-sm transition-all duration-200">
      <div 
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {editingTransaction ? 'Sửa chi tiêu' : 'Nhập chi tiêu'}
          </h3>
          <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600 p-2 bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 min-h-[80px] flex items-center">
          {preview ? (
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="text-2xl font-bold text-red-500">
                   {new Intl.NumberFormat('vi-VN').format(preview.amount)} đ
                </span>
                <span className="text-xs font-bold bg-gray-900 text-white px-3 py-1 rounded-full">
                  {preview.category}
                </span>
              </div>
              <p className="text-gray-600 font-medium">"{preview.note}"</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              Cú pháp: <span className="font-mono text-gray-500">"50k ăn sáng"</span>
            </p>
          )}
        </div>

        {/* Scope Selector: Personal vs Trip */}
        <div className="grid grid-cols-2 gap-2 mb-3 bg-gray-100 p-1 rounded-xl">
             <button 
                type="button"
                onClick={() => setScope('PERSONAL')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${scope === 'PERSONAL' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
             >
                <User size={16} /> Cá nhân
             </button>
             <button 
                type="button"
                onClick={() => { setScope('TRIP'); if(activeTripsList.length > 0 && !selectedTrip) setSelectedTrip(activeTripsList[0].id); }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${scope === 'TRIP' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
             >
                <MapPin size={16} /> Chuyến đi
             </button>
        </div>

        {/* Options Row: Date & Trip Select (Conditional) */}
        <div className="mb-3 flex gap-2">
            {/* Date Picker */}
            <div className="flex-1 bg-gray-100 px-3 py-2 rounded-xl flex items-center gap-2 text-sm text-gray-600 relative overflow-hidden">
                <Calendar size={16} className="text-primary shrink-0" />
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent font-semibold text-gray-900 outline-none w-full"
                    required
                />
            </div>
            
            {/* Trip Selector Dropdown - Only if Scope is Trip */}
            {scope === 'TRIP' && (
              <div className="flex-1 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl flex items-center gap-2 text-sm text-blue-600 relative overflow-hidden animate-fade-in">
                 <select 
                    value={selectedTrip}
                    onChange={(e) => setSelectedTrip(e.target.value)}
                    className="bg-transparent font-semibold text-blue-700 outline-none w-full appearance-none truncate"
                 >
                    {activeTripsList.length === 0 && <option value="">Không có chuyến đi</option>}
                    {activeTripsList.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                 </select>
              </div>
            )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={editingTransaction ? "Sửa nội dung..." : "Nhập tại đây..."}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-lg transition-all"
          />
          <button
            type="submit" 
            disabled={!preview || (scope === 'TRIP' && !selectedTrip)}
            className={`w-16 rounded-2xl flex items-center justify-center transition-all transform active:scale-95 shadow-sm ${
              preview ? 'bg-primary text-white shadow-primary/30' : 'bg-gray-200 text-gray-400'
            }`}
          >
            {editingTransaction ? <Save size={24} /> : <Send size={24} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SmartInput;