import React from 'react';
import { Download, Printer, Settings, RotateCcw, LogIn, LogOut, Cloud, CloudOff } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  authReady: boolean;
  isSyncing?: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onExportCSV: () => void;
  onPrint: () => void;
  onOpenBalanceSettings: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  authReady,
  isSyncing = false,
  onLogin,
  onLogout,
  onExportCSV,
  onPrint,
  onOpenBalanceSettings,
  onResetData,
}) => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white shadow-lg sticky top-0 z-40 border-b border-blue-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/60 border border-blue-400/30 flex items-center justify-center text-2xl shadow-inner">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                ລະບົບບັນຊີຟາມ &amp; ບັນທຶກລາຍຮັບ-ລາຍຈ່າຍ
              </h1>
              {authReady && (
                user ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <Cloud className="w-3 h-3" />
                    <span>{isSyncing ? 'ກຳລັງບັນທຶກ...' : 'ເຊື່ອມຕໍ່ຖານຂໍ້ມູນແລ້ວ'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                    <CloudOff className="w-3 h-3" />
                    <span>ໂໝດອອບໄລນ໌ (ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອບັນທຶກລົງ Database)</span>
                  </span>
                )
              )}
            </div>
            <p className="text-xs text-blue-200/80 font-medium">
              Farm Financial &amp; Chicken Profit Center Ledger System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end no-print">
          {authReady && (
            user ? (
              <div className="flex items-center gap-2 bg-blue-950/70 px-2.5 py-1 rounded-lg border border-blue-700/50">
                <span className="text-xs text-blue-100 font-medium max-w-[140px] truncate">
                  {user.displayName || user.email}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                  title="ອອກຈາກລະບົບ"
                >
                  <LogOut className="w-3 h-3" />
                  <span>ອອກ</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-sm cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>ເຂົ້າສູ່ລະບົບ (Save to Database)</span>
              </button>
            )
          )}

          <button
            type="button"
            onClick={onOpenBalanceSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-800/60 hover:bg-blue-700 text-blue-100 border border-blue-600/40 transition-colors shadow-sm cursor-pointer"
            title="ຕັ້ງຄ່າຍອດເງິນເລີ່ມຕົ້ນ (Opening Balances)"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>ຍອດເລີ່ມຕົ້ນ</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/40 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/25 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>ພິມລາຍງານ (Print)</span>
          </button>

          <button
            type="button"
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/40 transition-colors cursor-pointer"
            title="ຣີເຊັດຂໍ້ມູນເປັນຄ່າເລີ່ມຕົ້ນ"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
