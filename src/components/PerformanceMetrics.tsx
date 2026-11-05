import React from 'react';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';
import { formatCurrency } from '../utils/calc';

interface PerformanceMetricsProps {
  grandIncome: number;
  totalExpense: number;
  grandNetProfit: number;
  grandMarginPct: number;
  currencySymbol?: string;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  grandIncome,
  totalExpense,
  grandNetProfit,
  grandMarginPct,
  currencySymbol = '₭',
}) => {
  const isNetPositive = grandNetProfit >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Revenue */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm border-t-4 border-t-emerald-600 hover:shadow-md transition-shadow print-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            ລາຍຮັບລວມທັງໝົດ (Total Revenue)
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
          {formatCurrency(grandIncome, currencySymbol)}
        </div>
        <div className="text-xs text-slate-500 mt-1 font-medium">
          ຈາກການຂາຍຜົນຜະລິດຟາມໄກ່
        </div>
      </div>

      {/* Total Expense */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm border-t-4 border-t-rose-600 hover:shadow-md transition-shadow print-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-rose-800 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            ລາຍຈ່າຍລວມທັງໝົດ (Total Expense)
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
          {formatCurrency(totalExpense, currencySymbol)}
        </div>
        <div className="text-xs text-slate-500 mt-1 font-medium">
          ຕົ້ນທຶນກົງ + ຕົ້ນທຶນປັນສ່ວນສ່ວນກາງ
        </div>
      </div>

      {/* Net Profit */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm border-t-4 border-t-blue-700 hover:shadow-md transition-shadow print-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            ກຳໄລສຸດທິລວມ (Net Profit)
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isNetPositive ? 'text-blue-700' : 'text-rose-600'
          }`}
        >
          {isNetPositive ? '+' : ''}
          {formatCurrency(grandNetProfit, currencySymbol)}
        </div>
        <div className="flex items-center justify-between mt-1 text-xs">
          <span className="text-slate-500 font-medium">ອັດຕາກຳໄລລວມທົ່ວຟາມ</span>
          <span
            className={`font-bold px-2 py-0.5 rounded-full text-xs ${
              grandMarginPct >= 20
                ? 'bg-emerald-100 text-emerald-800'
                : grandMarginPct >= 0
                ? 'bg-blue-100 text-blue-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            Margin: {grandMarginPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
