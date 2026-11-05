import React from 'react';
import { ProfitCenterSummary, ProfitCenterKey } from '../types';
import { formatCurrency } from '../utils/calc';

interface ProfitCentersGridProps {
  summaries: ProfitCenterSummary[];
  onSelectCenter?: (centerId: ProfitCenterKey | 'all') => void;
  selectedCenter?: string;
  currencySymbol?: string;
}

export const ProfitCentersGrid: React.FC<ProfitCentersGridProps> = ({
  summaries,
  onSelectCenter,
  selectedCenter = 'all',
  currencySymbol = '₭',
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-6 print-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80 gap-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>🎯</span>
          <span>ຜົນກຳໄລແຍກຕາມສູນກຳໄລ (Livestock Profit Centers)</span>
        </h3>
        <div className="flex items-center gap-2">
          {selectedCenter !== 'all' && (
            <button
              onClick={() => onSelectCenter?.('all')}
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              ສະແດງທຸກສູນ
            </button>
          )}
          <span className="text-xs text-slate-500 font-medium">
            ຄຳນວນຈາກລາຍຮັບລົບຕົ້ນທຶນກົງຂອງສັດແຕ່ລະຊະນິດ
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {summaries.map((item) => {
          const isProfitable = item.netProfit >= 0;
          const isSelected = selectedCenter === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onSelectCenter?.(isSelected ? 'all' : item.id)}
              className={`rounded-xl p-4 border transition-all text-center cursor-pointer select-none ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/30'
                  : 'border-slate-200/90 bg-slate-50/70 hover:bg-white hover:shadow-md hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-slate-700 tracking-wide mb-1">
                {item.name}
              </div>

              <div
                className={`text-base sm:text-lg font-extrabold my-1 ${
                  isProfitable ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isProfitable ? '+' : ''}
                {formatCurrency(item.netProfit, currencySymbol)}
              </div>

              <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200/60 mt-1">
                <span className="text-emerald-600 font-semibold">ຮັບ:</span>{' '}
                {Math.round(item.income).toLocaleString('en-US')}{' '}
                <span className="text-slate-300">|</span>{' '}
                <span className="text-rose-600 font-semibold">ຈ່າຍ:</span>{' '}
                {Math.round(item.directExpense).toLocaleString('en-US')}
              </div>

              <div className="mt-2.5 flex items-center justify-center gap-1.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.marginPct >= 40
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.marginPct >= 0
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Margin: {item.marginPct.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
