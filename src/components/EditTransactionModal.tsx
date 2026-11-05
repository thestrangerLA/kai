import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, AccountKey, ProfitCenterKey } from '../types';
import { PROFIT_CENTERS, DEFAULT_CATEGORIES } from '../constants';
import { X, Check } from 'lucide-react';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Transaction) => void;
  currencySymbol?: string;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSave,
  currencySymbol = '₭',
}) => {
  const [date, setDate] = useState<string>('');
  const [type, setType] = useState<TransactionType>('income');
  const [account, setAccount] = useState<AccountKey>('bank');
  const [center, setCenter] = useState<ProfitCenterKey>('chicken');
  const [cat, setCat] = useState<string>('');
  const [amt, setAmt] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (transaction) {
      setDate(transaction.date);
      setType(transaction.type);
      setAccount(transaction.account);
      setCenter(transaction.center);
      setCat(transaction.cat);
      setAmt(String(transaction.amt));
      setNote(transaction.note || '');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amt);
    if (isNaN(parsedAmt) || parsedAmt <= 0 || parsedAmt > 1000000000000) {
      return;
    }

    onSave({
      ...transaction,
      date,
      type,
      account,
      center,
      cat: cat.trim().slice(0, 120),
      amt: parsedAmt,
      note: note.trim().slice(0, 500)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <h3 className="font-bold text-slate-800 text-base">
            ✏️ ແກ້ໄຂລາຍການບັນຊີ (Edit Transaction)
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ວັນທີ:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ປະເພດ:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="income">🟢 ລາຍຮັບ</option>
                <option value="expense">🔴 ລາຍຈ່າຍ</option>
                <option value="transfer">🔄 ໂອນປ່ຽນບັນຊີ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ຊ່ອງທາງ:</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value as AccountKey)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="bank">🏦 ທະນາຄານ</option>
                <option value="cash">💵 ເງິນສົດ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ສູນກຳໄລ:</label>
              <select
                value={center}
                onChange={(e) => setCenter(e.target.value as ProfitCenterKey)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              >
                {Object.entries(PROFIT_CENTERS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.nameLao}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ໝວດໝູ່:</label>
              <input
                type="text"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ຈຳນວນເງິນ ({currencySymbol}):</label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={amt}
                onChange={(e) => setAmt(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ໝາຍເຫດ:</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>ບັນທຶກການແກ້ໄຂ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
