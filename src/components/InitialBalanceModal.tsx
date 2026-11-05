import React, { useState } from 'react';
import { X, Landmark, Wallet } from 'lucide-react';

interface InitialBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBank: number;
  initialCash: number;
  onSave: (bank: number, cash: number) => void;
  currencySymbol?: string;
}

export const InitialBalanceModal: React.FC<InitialBalanceModalProps> = ({
  isOpen,
  onClose,
  initialBank,
  initialCash,
  onSave,
  currencySymbol = '₭',
}) => {
  const [bank, setBank] = useState<string>(String(initialBank));
  const [cash, setCash] = useState<string>(String(initialCash));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const b = parseFloat(bank) || 0;
    const c = parseFloat(cash) || 0;
    onSave(b, c);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <h3 className="font-bold text-slate-800 text-base">
            ⚙️ ຕັ້ງຄ່າຍອດເງິນເລີ່ມຕົ້ນ (Opening Balances)
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            ກະລຸນາກຳນົດຍອດເງິນເລີ່ມຕົ້ນໃນບັນຊີທະນາຄານ ແລະ ເງິນສົດໃນມື ເພື່ອໃຫ້ລະບົບຄຳນວນຍອດເງິນຄົງເຫຼືອຕົວຈິງໄດ້ຢ່າງຖືກຕ້ອງ:
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-blue-600" />
              <span>ຍອດເລີ່ມຕົ້ນ: ບັນຊີທະນາຄານ (Bank):</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                required
                className="w-full pl-3.5 pr-10 py-2.5 text-sm font-semibold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {currencySymbol}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>ຍອດເລີ່ມຕົ້ນ: ເງິນສົດໃນມື (Cash):</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                required
                className="w-full pl-3.5 pr-10 py-2.5 text-sm font-semibold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {currencySymbol}
              </span>
            </div>
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all"
            >
              ບັນທຶກຍອດເລີ່ມຕົ້ນ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
