import React from 'react';
import { AccountBalances } from '../types';
import { formatCurrency } from '../utils/calc';
import { ArrowLeftRight, Landmark, Wallet, Coins } from 'lucide-react';

interface WalletBannerProps {
  balances: AccountBalances;
  onQuickTransferClick: () => void;
  currencySymbol?: string;
}

export const WalletBanner: React.FC<WalletBannerProps> = ({
  balances,
  onQuickTransferClick,
  currencySymbol = '₭'
}) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-5 sm:p-6 shadow-md border border-blue-700/50 mb-6 print-card">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-300 text-amber-950 shadow-sm">
            <span>💰</span>
            <span>ຍອດເງິນຕົວຈິງໃນບັນຊີ (REAL CASH &amp; BANK BALANCES)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            ກະເປົາເງິນສົດ &amp; ບັນຊີທະນາຄານ (Account Wallets)
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/85 leading-relaxed">
            ອັບເດດຍອດເງິນອັດຕະໂນມັດເມື່ອມີການບັນທຶກລາຍຮັບ-ລາຍຈ່າຍ | ຮອງຮັບການໂອນປ່ຽນບັນຊີ (ຖອນເງິນສົດ ⇄ ຝາກເຂົ້າທະນາຄານ)
          </p>
        </div>

        <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Bank Card */}
          <div className="bg-white/10 hover:bg-white/15 transition-all backdrop-blur-md rounded-xl p-3.5 border border-white/15 shadow-sm text-center min-w-[140px]">
            <div className="flex items-center justify-center gap-1 text-xs text-blue-100 font-medium mb-1">
              <Landmark className="w-3.5 h-3.5 text-blue-300" />
              <span>ບັນຊີທະນາຄານ (Bank)</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-blue-200 tracking-tight">
              {formatCurrency(balances.currentBank, currencySymbol)}
            </div>
          </div>

          {/* Cash Card */}
          <div className="bg-white/10 hover:bg-white/15 transition-all backdrop-blur-md rounded-xl p-3.5 border border-white/15 shadow-sm text-center min-w-[140px]">
            <div className="flex items-center justify-center gap-1 text-xs text-blue-100 font-medium mb-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-300" />
              <span>ເງິນສົດໃນມື (Cash)</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-300 tracking-tight">
              {formatCurrency(balances.currentCash, currencySymbol)}
            </div>
          </div>

          {/* Total Available */}
          <div className="bg-white/20 hover:bg-white/25 transition-all backdrop-blur-md rounded-xl p-3.5 border-2 border-amber-300/40 shadow-md text-center min-w-[160px]">
            <div className="flex items-center justify-center gap-1 text-xs text-amber-100 font-medium mb-1">
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              <span>ລວມເງິນພ້ອມໃຊ້ (Total)</span>
            </div>
            <div className="text-2xl font-extrabold text-amber-300 tracking-tight">
              {formatCurrency(balances.total, currencySymbol)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between text-xs text-blue-200/90 gap-2 no-print">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ລະບົບຄຳນວນຍອດເງິນສົດ ແລະ ທະນາຄານແບບ Real-Time</span>
        </div>
        <button
          onClick={onQuickTransferClick}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white font-medium border border-white/20 transition-all text-xs"
        >
          <ArrowLeftRight className="w-3 h-3 text-amber-300" />
          <span>ໂອນເງິນລະຫວ່າງບັນຊີ (Transfer)</span>
        </button>
      </div>
    </div>
  );
};
