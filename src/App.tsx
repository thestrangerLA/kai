import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
  handleFirestoreError,
  OperationType,
} from './firebase';
import { Transaction, ProfitCenterKey } from './types';
import { INITIAL_SEED_BALANCES, INITIAL_SEED_TRANSACTIONS, PROFIT_CENTERS } from './constants';
import {
  calculateBalances,
  calculateProfitCenterSummaries,
  exportTransactionsToCSV,
} from './utils/calc';
import { Header } from './components/Header';
import { WalletBanner } from './components/WalletBanner';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { ProfitCentersGrid } from './components/ProfitCentersGrid';
import { ProfitLossTable } from './components/ProfitLossTable';
import { TransactionForm } from './components/TransactionForm';
import { TransactionLedger } from './components/TransactionLedger';
import { InitialBalanceModal } from './components/InitialBalanceModal';
import { EditTransactionModal } from './components/EditTransactionModal';
import { QuickTransferModal } from './components/QuickTransferModal';
import { Wallet, BarChart3, PlusCircle, History, CheckCircle2, Database, LogIn } from 'lucide-react';

const VALID_CENTERS = new Set<string>(Object.keys(PROFIT_CENTERS));

type TabKey = 'overview' | 'pnl' | 'entry' | 'history';

export default function App() {
  const currencySymbol = '₭';

  // Firebase Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [walletDocExists, setWalletDocExists] = useState<boolean>(false);
  const hasSeededCloudRef = useRef<boolean>(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [recentAddedBanner, setRecentAddedBanner] = useState<string | null>(null);

  // Initial balances state
  const [initialBalances, setInitialBalances] = useState(() => {
    const saved = localStorage.getItem('farm_account_balances');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          initialBank: parsed.bank ?? INITIAL_SEED_BALANCES.initialBank,
          initialCash: parsed.cash ?? INITIAL_SEED_BALANCES.initialCash,
        };
      } catch (e) {
        console.error('Failed to parse saved balances', e);
      }
    }
    return INITIAL_SEED_BALANCES;
  });

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('farm_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t: Transaction) => VALID_CENTERS.has(t.center));
        }
      } catch (e) {
        console.error('Failed to parse saved transactions', e);
      }
    }
    return INITIAL_SEED_TRANSACTIONS;
  });

  // Modals state
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Selected center filter highlight
  const [selectedCenter, setSelectedCenter] = useState<ProfitCenterKey | 'all'>('all');

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (!currentUser) {
        hasSeededCloudRef.current = false;
        setWalletDocExists(false);
      }
    });
    return () => unsub();
  }, []);

  // Real-time Firestore Listeners when authenticated
  useEffect(() => {
    if (!authReady || !user) return;

    const walletDocRef = doc(db, 'wallet_settings', user.uid);
    const unsubWallet = onSnapshot(
      walletDocRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          setWalletDocExists(true);
          const data = snapshot.data();
          setInitialBalances({
            initialBank: Number(data.initialBank ?? INITIAL_SEED_BALANCES.initialBank),
            initialCash: Number(data.initialCash ?? INITIAL_SEED_BALANCES.initialCash),
          });
        } else {
          setWalletDocExists(false);
          // Initialize user's wallet settings in Firestore
          try {
            await setDoc(walletDocRef, {
              userId: user.uid,
              initialBank: Number(initialBalances.initialBank),
              initialCash: Number(initialBalances.initialCash),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setWalletDocExists(true);
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `wallet_settings/${user.uid}`);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `wallet_settings/${user.uid}`);
      }
    );

    const txQuery = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    const unsubTx = onSnapshot(
      txQuery,
      async (snapshot) => {
        const loaded: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (VALID_CENTERS.has(d.center)) {
            loaded.push({
              id: docSnap.id,
              date: d.date,
              type: d.type,
              account: d.account,
              center: d.center,
              cat: d.cat,
              amt: Number(d.amt),
              note: d.note || '',
            });
          }
        });

        // Sort descending by date then id
        loaded.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

        // If cloud is completely empty on first login and local has items, seed them once
        if (
          snapshot.empty &&
          !hasSeededCloudRef.current &&
          !localStorage.getItem(`seeded_cloud_${user.uid}`) &&
          transactions.length > 0
        ) {
          hasSeededCloudRef.current = true;
          localStorage.setItem(`seeded_cloud_${user.uid}`, 'true');
          setIsSyncing(true);
          try {
            const batch = writeBatch(db);
            transactions.forEach((t) => {
              const safeId = t.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100) || `tx_${Date.now()}`;
              const docRef = doc(db, 'transactions', `${user.uid.slice(0, 16)}_${safeId}`);
              batch.set(docRef, {
                userId: user.uid,
                date: t.date,
                type: t.type,
                account: t.account,
                center: t.center,
                cat: t.cat.slice(0, 120),
                amt: Math.max(1, Number(t.amt)),
                note: (t.note || '').slice(0, 500),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            });
            await batch.commit();
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'transactions');
          } finally {
            setIsSyncing(false);
          }
          return;
        }

        hasSeededCloudRef.current = true;
        setTransactions(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'transactions');
      }
    );

    return () => {
      unsubWallet();
      unsubTx();
    };
  }, [authReady, user]);

  // Save to localStorage as offline backup
  useEffect(() => {
    localStorage.setItem('farm_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(
      'farm_account_balances',
      JSON.stringify({
        bank: initialBalances.initialBank,
        cash: initialBalances.initialCash,
      })
    );
  }, [initialBalances]);

  // Derived account balances
  const balances = useMemo(() => {
    return calculateBalances(
      transactions,
      initialBalances.initialBank,
      initialBalances.initialCash
    );
  }, [transactions, initialBalances]);

  // Derived profit center summaries and overall metrics
  const {
    centerSummaries,
    grandIncome,
    grandDirectExpense,
    grandOverheadExpense,
    totalExpense,
    grandNetProfit,
    grandMarginPct,
  } = useMemo(() => {
    return calculateProfitCenterSummaries(transactions);
  }, [transactions]);

  // Auth Handlers
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google Sign-In failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Sign-Out failed:', error);
    }
  };

  // CRUD Handlers (Firestore + Offline Fallback)
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const newId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const created: Transaction = {
      ...newTx,
      cat: newTx.cat.slice(0, 120),
      note: (newTx.note || '').slice(0, 500),
      id: newId,
    };

    if (user) {
      setIsSyncing(true);
      try {
        await setDoc(doc(db, 'transactions', newId), {
          userId: user.uid,
          date: created.date,
          type: created.type,
          account: created.account,
          center: created.center,
          cat: created.cat,
          amt: Number(created.amt),
          note: created.note || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `transactions/${newId}`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      setTransactions((prev) => [created, ...prev]);
    }

    setRecentAddedBanner(
      `ບັນທຶກສຳເລັດ${user ? 'ລົງຖານຂໍ້ມູນ (Database)' : ''}: ${created.cat} (${Math.round(created.amt).toLocaleString('en-US')} ₭)`
    );
    setTimeout(() => {
      setRecentAddedBanner(null);
    }, 4000);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      setIsSyncing(true);
      try {
        await deleteDoc(doc(db, 'transactions', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleClearAllTransactions = async () => {
    if (user) {
      setIsSyncing(true);
      try {
        const batch = writeBatch(db);
        transactions.forEach((t) => {
          batch.delete(doc(db, 'transactions', t.id));
        });
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'transactions');
      } finally {
        setIsSyncing(false);
      }
    } else {
      setTransactions([]);
    }
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
  };

  const handleSaveEdit = async (updated: Transaction) => {
    if (user) {
      setIsSyncing(true);
      try {
        await updateDoc(doc(db, 'transactions', updated.id), {
          date: updated.date,
          type: updated.type,
          account: updated.account,
          center: updated.center,
          cat: updated.cat.slice(0, 120),
          amt: Number(updated.amt),
          note: (updated.note || '').slice(0, 500),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `transactions/${updated.id}`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      setTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    }
  };

  const handleSaveInitialBalances = async (bank: number, cash: number) => {
    const safeBank = Math.max(0, Number(bank) || 0);
    const safeCash = Math.max(0, Number(cash) || 0);

    if (user) {
      setIsSyncing(true);
      const walletRef = doc(db, 'wallet_settings', user.uid);
      try {
        if (walletDocExists) {
          await updateDoc(walletRef, {
            initialBank: safeBank,
            initialCash: safeCash,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(walletRef, {
            userId: user.uid,
            initialBank: safeBank,
            initialCash: safeCash,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setWalletDocExists(true);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `wallet_settings/${user.uid}`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      setInitialBalances({
        initialBank: safeBank,
        initialCash: safeCash,
      });
    }
  };

  const handleResetData = async () => {
    if (user) {
      setIsSyncing(true);
      try {
        const batch = writeBatch(db);
        transactions.forEach((t) => {
          batch.delete(doc(db, 'transactions', t.id));
        });
        INITIAL_SEED_TRANSACTIONS.forEach((t) => {
          const docId = `${user.uid.slice(0, 16)}_${t.id}`;
          batch.set(doc(db, 'transactions', docId), {
            userId: user.uid,
            date: t.date,
            type: t.type,
            account: t.account,
            center: t.center,
            cat: t.cat,
            amt: Number(t.amt),
            note: t.note || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
        await handleSaveInitialBalances(
          INITIAL_SEED_BALANCES.initialBank,
          INITIAL_SEED_BALANCES.initialCash
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'transactions');
      } finally {
        setIsSyncing(false);
      }
    } else {
      localStorage.removeItem('farm_transactions');
      localStorage.removeItem('farm_account_balances');
      setTransactions(INITIAL_SEED_TRANSACTIONS);
      setInitialBalances(INITIAL_SEED_BALANCES);
    }
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions);
  };

  const handlePrint = () => {
    window.print();
  };

  const tabs: { id: TabKey; label: string; subLabel: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'overview',
      label: 'ກະເປົາເງິນ & ພາບລວມ',
      subLabel: 'Wallets & Summary',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: 'pnl',
      label: 'ວິເຄາະກຳໄລ-ຂາດທຶນ',
      subLabel: 'Profit & Loss (P&L)',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'entry',
      label: 'ບັນທຶກລາຍການໃໝ່',
      subLabel: 'New Transaction',
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      id: 'history',
      label: 'ປະຫວັດການລົງບັນຊີ',
      subLabel: 'Transaction History',
      icon: <History className="w-4 h-4" />,
      badge: transactions.length,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        user={user}
        authReady={authReady}
        isSyncing={isSyncing}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
        onOpenBalanceSettings={() => setIsBalanceModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Tab Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-[69px] z-30 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center sm:justify-start gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                      : 'bg-slate-50/80 text-slate-700 border-slate-200/80 hover:bg-blue-50/60 hover:text-blue-800 hover:border-blue-200'
                  }`}
                >
                  <span
                    className={`p-1.5 rounded-lg ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-blue-700 shadow-2xs'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <div className="text-left leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span>{tab.label}</span>
                      {tab.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                            isActive
                              ? 'bg-amber-300 text-amber-950'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10px] font-normal hidden md:block ${
                        isActive ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {tab.subLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Database Login Notice if not signed in */}
        {authReady && !user && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                  ☁️ ເຊື່ອມຕໍ່ຖານຂໍ້ມູນອອນໄລນ໌ (Cloud Firestore Database)
                </h4>
                <p className="text-xs text-amber-800/90">
                  ເຂົ້າສູ່ລະບົບດ້ວຍບັນຊີ Google ເພື່ອບັນທຶກຂໍ້ມູນລາຍຮັບ-ລາຍຈ່າຍ ແລະ ຍອດເງິນທັງໝົດລົງໃນຖານຂໍ້ມູນອັດຕະໂນມັດ.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogin}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ເຂົ້າສູ່ລະບົບ Google</span>
            </button>
          </div>
        )}

        {/* Top bar info */}
        <div className="flex items-center justify-between mb-4 no-print text-xs text-slate-500">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 shadow-2xs">
            <span>🇱🇦 ສະກຸນເງິນ:</span>
            <span className="text-blue-700 font-bold">ກີບ (₭ - LAK)</span>
          </div>

          <div className="hidden sm:block text-slate-500 font-medium">
            {user
              ? `☁️ ຊິ້ງຂໍ້ມູນກັບຖານຂໍ້ມູນ Firebase Firestore (${user.email})`
              : 'ລະບົບຈັດການບັນຊີ ແລະ ຕົ້ນທຶນຟາມໄກ່ & ສ່ວນກາງ'}
          </div>
        </div>

        {/* Success notification banner when adding a transaction */}
        {recentAddedBanner && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-600 text-white shadow-md flex items-center justify-between gap-3 animate-in fade-in duration-150 no-print">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              <span>{recentAddedBanner}</span>
            </div>
            <div className="flex items-center gap-2">
              {activeTab !== 'history' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  ເບິ່ງປະຫວັດ
                </button>
              )}
              <button
                type="button"
                onClick={() => setRecentAddedBanner(null)}
                className="text-xs opacity-80 hover:opacity-100 px-1.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW & WALLETS */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <WalletBanner
              balances={balances}
              onQuickTransferClick={() => setIsTransferModalOpen(true)}
              currencySymbol={currencySymbol}
            />

            <PerformanceMetrics
              grandIncome={grandIncome}
              totalExpense={totalExpense}
              grandNetProfit={grandNetProfit}
              grandMarginPct={grandMarginPct}
              currencySymbol={currencySymbol}
            />

            <ProfitCentersGrid
              summaries={centerSummaries}
              onSelectCenter={(center) => {
                setSelectedCenter(center);
                setActiveTab('history');
              }}
              selectedCenter={selectedCenter}
              currencySymbol={currencySymbol}
            />
          </div>
        )}

        {/* TAB 2: PROFIT & LOSS STATEMENT */}
        {activeTab === 'pnl' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <ProfitCentersGrid
              summaries={centerSummaries}
              onSelectCenter={(center) => setSelectedCenter(center)}
              selectedCenter={selectedCenter}
              currencySymbol={currencySymbol}
            />

            <ProfitLossTable
              summaries={centerSummaries}
              grandIncome={grandIncome}
              grandDirectExpense={grandDirectExpense}
              grandOverheadExpense={grandOverheadExpense}
              totalExpense={totalExpense}
              grandNetProfit={grandNetProfit}
              grandMarginPct={grandMarginPct}
              currencySymbol={currencySymbol}
            />
          </div>
        )}

        {/* TAB 3: NEW TRANSACTION ENTRY */}
        {activeTab === 'entry' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
            <TransactionForm
              onAddTransaction={handleAddTransaction}
              currencySymbol={currencySymbol}
            />

            {/* Mini wallet bar for convenience while adding entries */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs font-bold text-slate-600">
                💰 ຍອດເງິນຄົງເຫຼືອປັດຈຸບັນ:
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500">🏦 ທະນາຄານ: </span>
                  <span className="font-extrabold text-blue-700">
                    {Math.round(balances.currentBank).toLocaleString('en-US')} ₭
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">💵 ເງິນສົດ: </span>
                  <span className="font-extrabold text-emerald-700">
                    {Math.round(balances.currentCash).toLocaleString('en-US')} ₭
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">💎 ລວມ: </span>
                  <span className="font-extrabold text-amber-700">
                    {Math.round(balances.total).toLocaleString('en-US')} ₭
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRANSACTION HISTORY LEDGER */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <TransactionLedger
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onClearAllTransactions={handleClearAllTransactions}
              onEditTransaction={handleEditTransaction}
              onResetData={handleResetData}
              currencySymbol={currencySymbol}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            ລະບົບບັນຊີຟາມ &amp; ບັນທຶກລາຍຮັບ-ລາຍຈ່າຍ (Farm Financial &amp; Profit Center Ledger)
          </div>
          <div className="text-slate-400">
            ສະກຸນເງິນກີບ (₭) • ຖານຂໍ້ມູນ Firebase Firestore • ພິມລາຍງານ &amp; Export CSV
          </div>
        </div>
      </footer>

      {/* Modals */}
      <InitialBalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        initialBank={initialBalances.initialBank}
        initialCash={initialBalances.initialCash}
        onSave={handleSaveInitialBalances}
        currencySymbol={currencySymbol}
      />

      <QuickTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onAddTransfer={handleAddTransaction}
        currencySymbol={currencySymbol}
      />

      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={handleSaveEdit}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
