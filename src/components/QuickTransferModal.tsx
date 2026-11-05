import React, { useState } from 'react';
import { Transaction } from '../types';
import { ArrowLeftRight, X } from 'lucide-react';

interface QuickTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransfer: (tx: Omit<Transaction, 'id'>) => void;
  currencySymbol?: string;
}

export const QuickTransferModal: React.FC<QuickTransferModalProps> = ({
  isOpen,
  onClose,
  onAddTransfer,
  currencySymbol = '₭',
}) => {
  const [direction, setDirection] = useState<'bank_to_cash' | 'cash_to_bank'>('bank_to_cash');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('ຖອນເງິນສົດຈາກທະນາຄານມາໄວ້ໃນມື');

  if (!isOpen) return null;

  const handleDirectionChange = (newDir: 'bank_to_cash' | 'cash_to_bank') => {
    setDirection(newDir);
    if (newDir === 'bank_to_cash') {
      setNote('ຖອນເງິນສົດຈາກທະນາຄານມາໄວ້ໃນມື');
    } else {
      setNote('ຝາກເງິນສົດເຂົ້າບັນຊີທະນາຄານ');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0 || parsedAmt > 1000000000000) {
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const cleanNote = note.trim().slice(0, 500);

    if (direction === 'bank_to_cash') {
      onAddTransfer({
        date: todayStr,
        type: 'transfer',
        account: 'bank',
        center: 'overhead',
        cat: '🔄 ຖອນເງິນສົດ (ປ່ຽນເງິນໂອນເປັນເງິນສົດ)',
        amt: parsedAmt,
        note: cleanNote
      });
    } else {
      onAddTransfer({
        date: todayStr,
        type: 'transfer',
        account: 'cash',
        center: 'overhead',
        cat: '🔄 ຝາກເງິນສົດ (ປ່ຽນເງິນສົດເປັນເງິນໂອນ)',
        amt: parsedAmt,
        note: cleanNote
      });
    }

    onClose();
    setAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
            <span>ໂອນເງິນລະຫວ່າງບັນຊີ (Account Transfer)</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              ທິດທາງການໂອນ:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDirectionChange('bank_to_cash')}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  direction === 'bank_to_cash'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/30'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div>🏦 ທະນາຄານ ➔ 💵 ເງິນສົດ</div>
                <div className="text-[10px] text-slate-500 font-normal mt-1">ຖອນເງິນສົດອອກມາໃຊ້</div>
              </button>

              <button
                type="button"
                onClick={() => handleDirectionChange('cash_to_bank')}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  direction === 'cash_to_bank'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/30'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div>💵 ເງິນສົດ ➔ 🏦 ທະນາຄານ</div>
                <div className="text-[10px] text-slate-500 font-normal mt-1">ຝາກເງິນສົດເຂົ້າບັນຊີ</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              💰 ຈຳນວນເງິນ ({currencySymbol}):
            </label>
            <input
              type="number"
              step="any"
              min="1"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              📝 ໝາຍເຫດ:
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all"
            >
              ດຳເນີນການໂອນ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
