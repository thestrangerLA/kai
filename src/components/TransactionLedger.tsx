import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { PROFIT_CENTERS, ACCOUNT_INFO } from '../constants';
import { formatCurrency, isTransferTransaction } from '../utils/calc';
import { Trash2, Edit3, Search, History, RotateCcw } from 'lucide-react';

interface TransactionLedgerProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onClearAllTransactions: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onResetData: () => void;
  currencySymbol?: string;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  onDeleteTransaction,
  onClearAllTransactions,
  onEditTransaction,
  onResetData,
  currencySymbol = '₭',
}) => {
  const [filterCenter, setFilterCenter] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterCenter !== 'all' && t.center !== filterCenter) {
        return false;
      }

      if (filterType !== 'all') {
        const isTransfer = isTransferTransaction(t);
        if (filterType === 'transfer') {
          if (!isTransfer) return false;
        } else if (filterType === 'income') {
          if (t.type !== 'income' || isTransfer) return false;
        } else if (filterType === 'expense') {
          if (t.type !== 'expense' || isTransfer) return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inCat = (t.cat || '').toLowerCase().includes(q);
        const inNote = (t.note || '').toLowerCase().includes(q);
        const inCenter = (PROFIT_CENTERS[t.center]?.nameLao || '').toLowerCase().includes(q);
        const inAmount = String(t.amt).includes(q);
        if (!inCat && !inNote && !inCenter && !inAmount) return false;
      }

      return true;
    });
  }, [transactions, filterCenter, filterType, searchQuery]);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm print-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80 gap-2">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-700" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            📜 ປະຫວັດການລົງບັນຊີ (Transaction History)
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {filteredTransactions.length} ລາຍການ
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap no-print">
          {transactions.length > 0 && (
            confirmClearAll ? (
              <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                <span className="text-xs font-bold text-rose-700">ຢືນຢັນລຶບທັງໝົດ?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearAllTransactions();
                    setConfirmClearAll(false);
                  }}
                  className="px-2 py-0.5 text-xs font-bold bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  ແມ່ນ, ລຶບເລີຍ
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="px-2 py-0.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                >
                  ຍົກເລີກ
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ລຶບປະຫວັດທັງໝົດ</span>
              </button>
            )
          )}

          <button
            type="button"
            onClick={onResetData}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ຣີເຊັດຄ່າເລີ່ມຕົ້ນ</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4 no-print">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ຄົ້ນຫາລາຍການ / ໝາຍເຫດ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Center filter */}
        <div>
          <select
            value={filterCenter}
            onChange={(e) => setFilterCenter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
          >
            <option value="all">🔍 ທຸກສູນກຳໄລ (All Centers)</option>
            <option value="chicken">🐔 ສະເພາະ: 1. ຟາມໄກ່</option>
            <option value="overhead">🏢 ສະເພາະ: 2. ສ່ວນກາງ</option>
          </select>
        </div>

        {/* Type filter */}
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
          >
            <option value="all">🔍 ທຸກປະເພດ (ຮັບ/ຈ່າຍ/ໂອນ)</option>
            <option value="income">🟢 ສະເພາະ: ລາຍຮັບ</option>
            <option value="expense">🔴 ສະເພາະ: ລາຍຈ່າຍ</option>
            <option value="transfer">🔄 ສະເພາະ: ໂອນປ່ຽນບັນຊີ</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 shadow-xs">
            <tr className="text-slate-600 font-semibold text-[11px] sm:text-xs">
              <th className="py-2.5 px-3">ວັນທີ</th>
              <th className="py-2.5 px-3">ສູນກຳໄລ / ຊ່ອງທາງ</th>
              <th className="py-2.5 px-3">ລາຍການ &amp; ໝາຍເຫດ</th>
              <th className="py-2.5 px-3 text-right">ຈຳນວນເງິນ</th>
              <th className="py-2.5 px-3 text-center no-print">ຈັດການ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.map((t) => {
              const isTransfer = isTransferTransaction(t);
              const isInc = t.type === 'income' && !isTransfer;
              const isExp = t.type === 'expense' && !isTransfer;

              let typeBadge = (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ລາຍຮັບ
                </span>
              );

              let sign = '+';
              let amtColor = 'text-emerald-600 font-extrabold';

              if (isTransfer) {
                typeBadge = (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    ໂອນປ່ຽນບັນຊີ
                  </span>
                );
                sign = '🔄 ';
                amtColor = 'text-blue-700 font-bold';
              } else if (isExp) {
                typeBadge = (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    ລາຍຈ່າຍ
                  </span>
                );
                sign = '-';
                amtColor = 'text-rose-600 font-extrabold';
              }

              return (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {t.date}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center text-[11px] font-semibold text-slate-800">
                        {PROFIT_CENTERS[t.center]?.nameLao || t.center}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {ACCOUNT_INFO[t.account]?.nameLao || t.account}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {typeBadge}
                      <span className="font-bold text-slate-800">{t.cat}</span>
                    </div>
                    {t.note && (
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {t.note}
                      </div>
                    )}
                  </td>
                  <td className={`py-2.5 px-3 text-right whitespace-nowrap ${amtColor}`}>
                    {sign}
                    {formatCurrency(t.amt, currencySymbol)}
                  </td>
                  <td className="py-2.5 px-3 text-center no-print whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditTransaction(t)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="ແກ້ໄຂລາຍການ"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(t.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                        title="ລຶບລາຍການນີ້"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ລຶບ</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs sm:text-sm">
                  ບໍ່ມີລາຍການບັນທຶກໃນປະຫວັດການລົງບັນຊີ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
