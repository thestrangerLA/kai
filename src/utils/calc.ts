import { Transaction, AccountBalances, ProfitCenterKey, ProfitCenterSummary } from '../types';
import { PROFIT_CENTERS, ACCOUNT_INFO } from '../constants';

export function calculateBalances(
  transactions: Transaction[],
  initialBank: number,
  initialCash: number
): AccountBalances {
  let bank = initialBank;
  let cash = initialCash;

  transactions.forEach((t) => {
    const amt = Number(t.amt) || 0;
    const cat = t.cat || '';

    // Check if it's a transfer
    const isWithdraw = cat.includes('ຖອນເງິນສົດ') || cat.includes('ถอนเงินสด');
    const isDeposit = cat.includes('ຝາກເງິນສົດ') || cat.includes('ฝากเงินสด');

    if (t.type === 'transfer' || isWithdraw || isDeposit) {
      if (isWithdraw) {
        bank -= amt;
        cash += amt;
      } else if (isDeposit) {
        cash -= amt;
        bank += amt;
      } else {
        // generic transfer based on account
        if (t.account === 'bank') {
          bank -= amt;
          cash += amt;
        } else {
          cash -= amt;
          bank += amt;
        }
      }
    } else {
      const isInc = t.type === 'income';
      if (t.account === 'bank') {
        if (isInc) bank += amt;
        else bank -= amt;
      } else if (t.account === 'cash') {
        if (isInc) cash += amt;
        else cash -= amt;
      }
    }
  });

  return {
    initialBank,
    initialCash,
    currentBank: bank,
    currentCash: cash,
    total: bank + cash
  };
}

export function isOverheadTransaction(t: Transaction): boolean {
  if (t.center === 'overhead') return true;
  const cat = t.cat || '';
  return (
    cat.includes('ຄ່ານ້ຳ-ຄ່າໄຟ') ||
    cat.includes('ຄ່າແຮງງານ') ||
    cat.includes('ຄ່າອຸປະກອນ') ||
    cat.includes('ຄ່າຂົນສົ່ງ') ||
    cat.includes('ປັນສ່ວນ')
  );
}

export function isTransferTransaction(t: Transaction): boolean {
  if (t.type === 'transfer') return true;
  const cat = t.cat || '';
  return (
    cat.includes('ປ່ຽນເງິນ') ||
    cat.includes('ຖອນ') ||
    cat.includes('ຝາກ') ||
    cat.includes('ໂອນ')
  );
}

export function calculateProfitCenterSummaries(transactions: Transaction[]) {
  const centers: ProfitCenterKey[] = ['chicken'];

  let grandIncome = 0;
  let grandDirectExpense = 0;
  let grandOverheadExpense = 0;

  // Calculate overheads
  transactions.forEach((t) => {
    if (isTransferTransaction(t)) return;
    if (t.type === 'expense' && isOverheadTransaction(t)) {
      grandOverheadExpense += Number(t.amt) || 0;
    }
  });

  const centerSummaries: ProfitCenterSummary[] = centers.map((cKey) => {
    let income = 0;
    let directExpense = 0;

    transactions.forEach((t) => {
      if (isTransferTransaction(t)) return;
      if (t.center === cKey) {
        const amt = Number(t.amt) || 0;
        if (t.type === 'income') {
          income += amt;
        } else if (t.type === 'expense') {
          if (!isOverheadTransaction(t)) {
            directExpense += amt;
          }
        }
      }
    });

    const netProfit = income - directExpense;
    const marginPct = income > 0 ? (netProfit / income) * 100 : 0;

    grandIncome += income;
    grandDirectExpense += directExpense;

    return {
      id: cKey,
      name: PROFIT_CENTERS[cKey].nameLao,
      icon: PROFIT_CENTERS[cKey].icon,
      income,
      directExpense,
      netProfit,
      marginPct
    };
  });

  const totalExpense = grandDirectExpense + grandOverheadExpense;
  const grandNetProfit = grandIncome - totalExpense;
  const grandMarginPct = grandIncome > 0 ? (grandNetProfit / grandIncome) * 100 : 0;

  return {
    centerSummaries,
    grandIncome,
    grandDirectExpense,
    grandOverheadExpense,
    totalExpense,
    grandNetProfit,
    grandMarginPct
  };
}

export function formatCurrency(amount: number, symbol: string = '₭'): string {
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('en-US')} ${symbol}`;
}

export function exportTransactionsToCSV(transactions: Transaction[], filename?: string) {
  if (!transactions.length) return false;

  let csv = '\uFEFFວັນທີ,ປະເພດ,ຊ່ອງທາງ,ສູນກຳໄລ,ໝວດໝູ່,ຈຳນວນເງິນ,ໝາຍເຫດ\n';
  transactions.forEach((t) => {
    const date = t.date || '';
    const typeLabel = t.type === 'income' ? 'ລາຍຮັບ' : t.type === 'expense' ? 'ລາຍຈ່າຍ' : 'ໂອນປ່ຽນບັນຊີ';
    const acc = ACCOUNT_INFO[t.account]?.nameLao || t.account;
    const center = PROFIT_CENTERS[t.center]?.nameLao || t.center;
    const cat = (t.cat || '').replace(/"/g, '""');
    const amt = t.amt || 0;
    const note = (t.note || '').replace(/"/g, '""');
    csv += `"${date}","${typeLabel}","${acc}","${center}","${cat}",${amt},"${note}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `farm_accounting_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
