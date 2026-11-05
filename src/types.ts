export type ProfitCenterKey = 'chicken' | 'overhead';

export type AccountKey = 'bank' | 'cash';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  account: AccountKey;
  center: ProfitCenterKey;
  cat: string;
  amt: number;
  note?: string;
  transferTargetAccount?: AccountKey;
}

export interface AccountBalances {
  initialBank: number;
  initialCash: number;
  currentBank: number;
  currentCash: number;
  total: number;
}

export interface ProfitCenterSummary {
  id: ProfitCenterKey;
  name: string;
  icon: string;
  income: number;
  directExpense: number;
  netProfit: number;
  marginPct: number;
}
