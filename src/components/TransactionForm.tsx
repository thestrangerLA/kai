import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, AccountKey, ProfitCenterKey } from '../types';
import { PROFIT_CENTERS, ACCOUNT_INFO, DEFAULT_CATEGORIES } from '../constants';
import { PlusCircle, ArrowLeftRight } from 'lucide-react';

interface TransactionFormProps {
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  currencySymbol?: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onAddTransaction,
  currencySymbol = '₭',
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState<string>(todayStr);
  const [type, setType] = useState<TransactionType>('income');
  const [account, setAccount] = useState<AccountKey>('bank');
  const [center, setCenter] = useState<ProfitCenterKey>('chicken');
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES.income[0]);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isCustomCat, setIsCustomCat] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Auto-switch categories when type changes
  useEffect(() => {
    if (type === 'transfer') {
      setCenter('overhead');
      setCategory(DEFAULT_CATEGORIES.transfer[0]);
      setIsCustomCat(false);
    } else if (type === 'income') {
      if (center === 'overhead') setCenter('chicken');
      setCategory(DEFAULT_CATEGORIES.income[0]);
      setIsCustomCat(false);
    } else if (type === 'expense') {
      setCategory(DEFAULT_CATEGORIES.expense[0]);
      setIsCustomCat(false);
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0 || parsedAmt > 1000000000000) {
      return;
    }

    const rawCat = isCustomCat && customCategory.trim() ? customCategory.trim() : category;
    const finalCategory = rawCat.slice(0, 120);
    const sanitizedNote = note.trim().slice(0, 500);

    onAddTransaction({
      date,
      type,
      account,
      center,
      cat: finalCategory,
      amt: parsedAmt,
      note: sanitizedNote
    });

    // Reset amount and note for next entry
    setAmount('');
    setNote('');
  };

  const handleQuickPreset = (presetCenter: ProfitCenterKey, presetType: TransactionType, presetCat: string, presetNote: string) => {
    setType(presetType);
    setCenter(presetCenter);
    setCategory(presetCat);
    setNote(presetNote);
    setIsCustomCat(false);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm print-card no-print">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-blue-700" />
          <span>ບັນທຶກລາຍການໃໝ່ (New Transaction Entry)</span>
        </h3>
      </div>

      {/* Quick shortcuts */}
      <div className="mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          ⚡ ປຸ່ມລັດບັນທຶກໄວ (Quick Presets):
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => handleQuickPreset('chicken', 'income', 'ຂາຍຜົນຜະລິດ', 'ຂາຍໄກ່ບ້ານ')}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-amber-50 text-amber-900 border border-slate-200 font-medium transition-colors"
          >
            🐔 ຂາຍໄກ່
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('chicken', 'income', 'ຂາຍໄຂ່ສົດ', 'ຂາຍໄຂ່ໄກ່ສົດ')}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-emerald-50 text-emerald-900 border border-slate-200 font-medium transition-colors"
          >
            🥚 ຂາຍໄຂ່ໄກ່
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('chicken', 'expense', 'ຄ່າແນວພັນສັດ', 'ຊື້ລູກໄກ່ພັນ')}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-blue-50 text-blue-900 border border-slate-200 font-medium transition-colors"
          >
            🐥 ຊື້ລູກໄກ່
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('chicken', 'expense', 'ຄ່າຫົວອາຫານ', 'ຊື້ຫົວອາຫານໄກ່')}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-rose-50 text-rose-900 border border-slate-200 font-medium transition-colors"
          >
            🌽 ຄ່າຫົວອາຫານ
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('chicken', 'expense', 'ຄ່າຍາແລະວັກຊີນ', 'ຊື້ວັກຊີນ ແລະ ຢາໄກ່')}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-teal-50 text-teal-900 border border-slate-200 font-medium transition-colors"
          >
            💉 ຄ່າຍາ/ວັກຊີນ
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('overhead', 'expense', 'ຄ່ານ້ຳ-ຄ່າໄຟ (ປັນສ່ວນ)', 'ຄ່ານ້ຳ-ໄຟຟາມ')}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-purple-50 text-purple-900 border border-slate-200 font-medium transition-colors"
          >
            💡 ຄ່ານ້ຳ-ໄຟ
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              📅 ວັນທີບັນທຶກ (Date):
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              🏷️ ປະເພດລາຍການ (Type):
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-medium transition-colors"
            >
              <option value="income">🟢 ລາຍຮັບ (+ ເງິນເຂົ້າບັນຊີ)</option>
              <option value="expense">🔴 ລາຍຈ່າຍ (- ຫັກເງິນອອກ)</option>
              <option value="transfer">🔄 ໂອນປ່ຽນບັນຊີ (ຖອນ/ຝາກ)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Account */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              💳 ຊ່ອງທາງການເງິນ (Wallet):
            </label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value as AccountKey)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-colors"
            >
              <option value="bank">🏦 ບັນຊີທະນາຄານ (Bank Account)</option>
              <option value="cash">💵 ເງິນສົດໃນມື (Cash in Hand)</option>
            </select>
          </div>

          {/* Profit Center */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              🎯 ສູນກຳໄລ (Profit Center):
            </label>
            <select
              value={center}
              onChange={(e) => setCenter(e.target.value as ProfitCenterKey)}
              disabled={type === 'transfer'}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500 transition-colors"
            >
              {Object.entries(PROFIT_CENTERS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.nameLao} ({val.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                📁 ໝວດໝູ່ລາຍການ (Category):
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCat(!isCustomCat)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
              >
                {isCustomCat ? 'ເລືອກຕາມລາຍການ' : '+ ພິມເອງ'}
              </button>
            </div>

            {isCustomCat ? (
              <input
                type="text"
                placeholder="ພິມໝວດໝູ່ໃໝ່..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-colors"
              >
                {DEFAULT_CATEGORIES[type].map((catName) => (
                  <option key={catName} value={catName}>
                    {catName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              💰 ຈຳນວນເງິນ (Amount):
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="1"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-3.5 pr-10 py-2.5 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none">
                {currencySymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Description / Note */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            📝 ລາຍລະອຽດ / ໝາຍເຫດ (Description / Note):
          </label>
          <input
            type="text"
            placeholder="ຕົວຢ່າງ: ຂາຍໄກ່ບ້ານ 30 ໂຕ, ຊື້ຫົວອາຫານເປັດ, ຄ່າວັກຊີນ..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.99] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
        >
          <span>💾</span>
          <span>ບັນທຶກລາຍການ &amp; ອັບເດດຍອດເງິນອັດຕະໂນມັດ</span>
        </button>
      </form>
    </div>
  );
};
