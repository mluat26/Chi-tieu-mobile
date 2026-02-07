import React, { useState, useEffect } from 'react';
import { Home, Utensils, Plane } from 'lucide-react';
import OverviewTab from './views/OverviewTab';
import DiningTab from './views/DiningTab';
import TripsTab from './views/TripsTab';
import SmartInput from './components/SmartInput';
import TransactionHistoryModal from './components/TransactionHistoryModal';
import { AppSettings, Transaction, Trip } from './types';
import { generateId } from './utils';

// Constants for LocalStorage
const LS_TRANSACTIONS = 'stc_transactions';
const LS_TRIPS = 'stc_trips';
const LS_SETTINGS = 'stc_settings';

enum Tab {
  OVERVIEW = 'OVERVIEW',
  DINING = 'DINING',
  TRIPS = 'TRIPS'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.OVERVIEW);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ dailyFoodBudget: 100000 });
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  // Smart Input State
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [initialInputVal, setInitialInputVal] = useState('');

  // History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load Data & Check URL Params (Shortcuts)
  useEffect(() => {
    const loadedTransactions = localStorage.getItem(LS_TRANSACTIONS);
    const loadedTrips = localStorage.getItem(LS_TRIPS);
    const loadedSettings = localStorage.getItem(LS_SETTINGS);

    if (loadedTransactions) setTransactions(JSON.parse(loadedTransactions));
    if (loadedTrips) setTrips(JSON.parse(loadedTrips));
    if (loadedSettings) setSettings(JSON.parse(loadedSettings));

    // Check for iOS Shortcut Input via URL query param 'input' or 'q'
    // Example: https://myapp.com/?input=50k%20an%20sang
    const params = new URLSearchParams(window.location.search);
    const shortcutInput = params.get('input') || params.get('q');
    
    if (shortcutInput) {
      // Decode and open smart input immediately
      setInitialInputVal(decodeURIComponent(shortcutInput));
      setIsInputOpen(true);
      // Clean URL to avoid reopening on refresh
      window.history.replaceState({}, '', window.location.pathname);
    }

  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem(LS_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LS_TRIPS, JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: generateId(),
      date: data.date || Date.now(), 
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleUpdateTransaction = (updatedData: Omit<Transaction, 'id'>) => {
    if (!editingTransaction) return;
    
    setTransactions(prev => prev.map(t => 
      t.id === editingTransaction.id 
        ? { ...t, ...updatedData } 
        : t
    ));
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa khoản chi này?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddTrip = (trip: Trip) => {
    setTrips(prev => [trip, ...prev]);
  };

  const handleUpdateTrip = (updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const handleDeleteTrip = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa chuyến đi này? (Các chi tiêu sẽ được giữ lại nhưng không còn liên kết)')) {
        setTrips(prev => prev.filter(t => t.id !== id));
        setTransactions(prev => prev.map(t => t.tripId === id ? { ...t, tripId: undefined } : t));
    }
  }

  // Helper to open input for NEW transaction
  const openSmartInput = (initialText: string = '') => {
    setEditingTransaction(null);
    setInitialInputVal(initialText);
    setIsInputOpen(true);
  };

  // Helper to open input for EDITING transaction
  const openEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setInitialInputVal(`${transaction.amount} ${transaction.note}`);
    setIsInputOpen(true);
  };

  const renderContent = () => {
    const commonProps = {
      transactions,
      trips,
      onDeleteTransaction: handleDeleteTransaction,
      onEditTransaction: openEditTransaction,
    };

    switch (activeTab) {
      case Tab.OVERVIEW:
        return (
          <OverviewTab 
            {...commonProps}
            onQuickAdd={openSmartInput}
            onViewAll={() => setIsHistoryOpen(true)}
          />
        );
      case Tab.DINING:
        return (
          <DiningTab 
             {...commonProps}
            settings={settings} 
            updateSettings={setSettings} 
          />
        );
      case Tab.TRIPS:
        return (
          <TripsTab 
            {...commonProps}
            onAddTrip={handleAddTrip}
            onUpdateTrip={handleUpdateTrip}
            onDeleteTrip={handleDeleteTrip}
            onSelectTrip={setActiveTripId}
            activeTripId={activeTripId}
          />
        );
      default:
        return (
          <OverviewTab 
            {...commonProps} 
            onQuickAdd={openSmartInput}
            onViewAll={() => setIsHistoryOpen(true)}
          />
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Content Area */}
      <main className="h-screen overflow-y-auto no-scrollbar scroll-smooth">
        {renderContent()}
      </main>

      {/* Floating Action Button (Smart Input) */}
      <SmartInput 
        onAdd={handleAddTransaction} 
        onUpdate={handleUpdateTransaction}
        activeTripId={activeTripId || undefined}
        availableTrips={trips}
        className="mb-16"
        isOpen={isInputOpen}
        onOpenChange={setIsInputOpen}
        initialValue={initialInputVal}
        editingTransaction={editingTransaction}
      />

      {/* Full History Modal - Condition Added */}
      {isHistoryOpen && (
        <TransactionHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          transactions={transactions}
          trips={trips}
          onDeleteTransaction={handleDeleteTransaction}
          onEditTransaction={(t) => {
              setIsHistoryOpen(false); // Close history to open edit form on main screen
              openEditTransaction(t);
          }}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-around items-center py-3 pb-safe z-40">
        <button 
          onClick={() => { setActiveTab(Tab.OVERVIEW); setActiveTripId(null); }}
          className={`flex flex-col items-center gap-1 ${activeTab === Tab.OVERVIEW ? 'text-primary' : 'text-gray-400'}`}
        >
          <Home size={24} strokeWidth={activeTab === Tab.OVERVIEW ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Tổng quan</span>
        </button>
        
        <button 
          onClick={() => { setActiveTab(Tab.DINING); setActiveTripId(null); }}
          className={`flex flex-col items-center gap-1 ${activeTab === Tab.DINING ? 'text-primary' : 'text-gray-400'}`}
        >
          <Utensils size={24} strokeWidth={activeTab === Tab.DINING ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Ăn uống</span>
        </button>

        <button 
          onClick={() => { setActiveTab(Tab.TRIPS); }}
          className={`flex flex-col items-center gap-1 ${activeTab === Tab.TRIPS ? 'text-primary' : 'text-gray-400'}`}
        >
          <Plane size={24} strokeWidth={activeTab === Tab.TRIPS ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Chuyến đi</span>
        </button>
      </nav>
    </div>
  );
};

export default App;