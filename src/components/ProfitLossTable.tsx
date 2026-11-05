import React from 'react';
import { ProfitCenterSummary } from '../types';
import { formatCurrency } from '../utils/calc';

interface ProfitLossTableProps {
  summaries: ProfitCenterSummary[];
  grandIncome: number;
  grandDirectExpense: number;
  grandOverheadExpense: number;
  totalExpense: number;
  grandNetProfit: number;
  grandMarginPct: number;
  currencySymbol?: string;
}

export const ProfitLossTable: React.FC<ProfitLossTableProps> = ({
  summaries,
  grandIncome,
  grandDirectExpense,
  grandOverheadExpense,
  totalExpense,
  grandNetProfit,
  grandMarginPct,
  currencySymbol = '₭',
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-6 print-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80 gap-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>📊</span>
          <span>ຕາຕະລາງວິເຄາະກຳໄລ-ຂາດທຶນ (Profit &amp; Loss Statement)</span>
        </h3>
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          ແຍກສູນກຳໄລ + ຕົ້ນທຶນປັນສ່ວນສ່ວນກາງ
        </span>
      </div>

      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
              <th className="py-3 px-3 sm:px-4 rounded-l-lg">ສູນກຳໄລ (Livestock Profit Center)</th>
              <th className="py-3 px-3 sm:px-4 text-right">ລາຍຮັບລວມ</th>
              <th className="py-3 px-3 sm:px-4 text-right">ຕົ້ນທຶນທາງກົງ</th>
              <th className="py-3 px-3 sm:px-4 text-right">ກຳໄລຂັ້ນຕົ້ນ</th>
              <th className="py-3 px-3 sm:px-4 text-center">ອັດຕາກຳໄລ (Margin)</th>
              <th className="py-3 px-3 sm:px-4 text-center rounded-r-lg">ສະຖານະ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summaries.map((item) => {
              const isProfit = item.netProfit >= 0;
              let statusLabel = 'ກຳໄລດີ';
              let statusBadgeClass = 'bg-emerald-100 text-emerald-800';

              if (item.netProfit < 0) {
                statusLabel = 'ຂາດທຶນ';
                statusBadgeClass = 'bg-rose-100 text-rose-800';
              } else if (item.marginPct > 40) {
                statusLabel = 'ຄຸ້ມຄ່າສູງ';
                statusBadgeClass = 'bg-emerald-100 text-emerald-800 font-bold';
              }

              return (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-800 flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-right font-medium text-slate-700">
                    {formatCurrency(item.income, currencySymbol)}
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-right font-medium text-slate-700">
                    {formatCurrency(item.directExpense, currencySymbol)}
                  </td>
                  <td
                    className={`py-3.5 px-3 sm:px-4 text-right font-extrabold ${
                      isProfit ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isProfit ? '+' : ''}
                    {formatCurrency(item.netProfit, currencySymbol)}
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.marginPct >= 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {item.marginPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadgeClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* Subtotal direct row */}
            <tr className="bg-slate-50 font-semibold text-slate-700">
              <td className="py-2.5 px-3 sm:px-4">
                <span>➕ ລວມຕົ້ນທຶນກົງທຸກສູນກຳໄລ</span>
              </td>
              <td className="py-2.5 px-3 sm:px-4 text-right text-emerald-700">
                {formatCurrency(grandIncome, currencySymbol)}
              </td>
              <td className="py-2.5 px-3 sm:px-4 text-right text-rose-700">
                {formatCurrency(grandDirectExpense, currencySymbol)}
              </td>
              <td className="py-2.5 px-3 sm:px-4 text-right text-blue-800 font-bold">
                +{formatCurrency(grandIncome - grandDirectExpense, currencySymbol)}
              </td>
              <td className="py-2.5 px-3 sm:px-4 text-center text-xs">
                {grandIncome > 0 ? (((grandIncome - grandDirectExpense) / grandIncome) * 100).toFixed(1) : 0}%
              </td>
              <td className="py-2.5 px-3 sm:px-4 text-center text-xs text-slate-500">
                ຂັ້ນຕົ້ນ
              </td>
            </tr>

            {/* Overheads row */}
            <tr className="bg-amber-50/70 border-t-2 border-b-2 border-amber-200/80 font-semibold">
              <td className="py-3.5 px-3 sm:px-4 text-slate-800">
                <div className="font-bold">🏢 ລວມຕົ້ນທຶນປັນສ່ວນສ່ວນກາງ (Shared Overheads)</div>
                <div className="text-[11px] text-amber-900/80 font-normal">
                  ຄ່ານ້ຳປະປາ / ຄ່າໄຟຟ້າ / ຄ່າແຮງງານຄົນງານ / ຄ່າອຸປະກອນ ແລະ ສ້ອມແປງ
                </div>
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-right text-slate-400">-</td>
              <td className="py-3.5 px-3 sm:px-4 text-right font-bold text-rose-600">
                {formatCurrency(grandOverheadExpense, currencySymbol)}
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-right font-extrabold text-rose-600">
                -{formatCurrency(grandOverheadExpense, currencySymbol)}
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-center text-slate-400">-</td>
              <td className="py-3.5 px-3 sm:px-4 text-center">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-200 text-amber-900">
                  ສ່ວນກາງ
                </span>
              </td>
            </tr>

            {/* Total Net Farm P&L */}
            <tr className="bg-slate-800 text-white font-bold text-sm sm:text-base border-t-2 border-slate-700">
              <td className="py-4 px-3 sm:px-4 rounded-l-lg">
                <div className="flex items-center gap-1.5">
                  <span>📊</span>
                  <span>ລວມທັງໝົດທົ່ວຟາມສຸດທິ (Total Net Farm P&amp;L)</span>
                </div>
              </td>
              <td className="py-4 px-3 sm:px-4 text-right text-emerald-400 font-extrabold">
                {formatCurrency(grandIncome, currencySymbol)}
              </td>
              <td className="py-4 px-3 sm:px-4 text-right text-rose-400 font-extrabold">
                {formatCurrency(totalExpense, currencySymbol)}
              </td>
              <td
                className={`py-4 px-3 sm:px-4 text-right font-extrabold ${
                  grandNetProfit >= 0 ? 'text-amber-300' : 'text-rose-400'
                }`}
              >
                {grandNetProfit >= 0 ? '+' : ''}
                {formatCurrency(grandNetProfit, currencySymbol)}
              </td>
              <td className="py-4 px-3 sm:px-4 text-center">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {grandMarginPct.toFixed(1)}%
                </span>
              </td>
              <td className="py-4 px-3 sm:px-4 text-center rounded-r-lg">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    grandNetProfit >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  {grandNetProfit >= 0 ? 'ພາບລວມຄຸ້ມຄ່າ' : 'ຕ້ອງປັບປຸງ'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
