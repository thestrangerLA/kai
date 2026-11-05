import { ProfitCenterKey, AccountKey, Transaction } from './types';

export const PROFIT_CENTERS: Record<ProfitCenterKey, { nameLao: string; nameEn: string; icon: string; color: string; bg: string }> = {
  chicken: {
    nameLao: '🐔 1. ຟາມໄກ່',
    nameEn: 'Chicken',
    icon: '🐔',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200'
  },
  overhead: {
    nameLao: '🏢 2. ສ່ວນກາງ/ປັນສ່ວນ',
    nameEn: 'Farm Overhead',
    icon: '🏢',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200'
  }
};

export const ACCOUNT_INFO: Record<AccountKey, { nameLao: string; nameEn: string; icon: string }> = {
  bank: {
    nameLao: '🏦 ບັນຊີທະນາຄານ',
    nameEn: 'Bank Account',
    icon: '🏦'
  },
  cash: {
    nameLao: '💵 ເງິນສົດໃນມື',
    nameEn: 'Cash in Hand',
    icon: '💵'
  }
};

export const DEFAULT_CATEGORIES = {
  income: [
    'ຂາຍຜົນຜະລິດ',
    'ຂາຍໄຂ່ສົດ',
    'ຂາຍຊີ້ນສັດ',
    'ຂາຍລູກພັນສັດ',
    'ຂາຍຝຸ່ນຄອກ/ຂີ້ສັດ',
    'ລາຍຮັບອື່ນໆ'
  ],
  expense: [
    'ຄ່າຫົວອາຫານ',
    'ຄ່າແນວພັນສັດ',
    'ຄ່າຍາແລະວັກຊີນ',
    'ຄ່ານ້ຳ-ຄ່າໄຟ (ປັນສ່ວນ)',
    'ຄ່າແຮງງານ (ປັນສ່ວນ)',
    'ຄ່າອຸປະກອນ ແລະ ສ້ອມແປງ',
    'ຄ່າຂົນສົ່ງ',
    'ລາຍຈ່າຍອື່ນໆ'
  ],
  transfer: [
    '🔄 ຖອນເງິນສົດ (ປ່ຽນເງິນໂອນ ➔ ເງິນສົດ)',
    '🔄 ຝາກເງິນສົດ (ປ່ຽນເງິນສົດ ➔ ເງິນໂອນ)'
  ]
};

export const INITIAL_SEED_BALANCES = {
  initialBank: 50000,
  initialCash: 10000
};

export const INITIAL_SEED_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2026-11-01', type: 'income', account: 'bank', center: 'chicken', cat: 'ຂາຍຜົນຜະລິດ', amt: 14280, note: 'ຂາຍໄກ່ບ້ານ 120 ໂຕ (ໂອນເຂົ້າທະນາຄານ)' },
  { id: 't2', date: '2026-11-01', type: 'expense', account: 'bank', center: 'chicken', cat: 'ຄ່າຫົວອາຫານ', amt: 5488, note: 'ຊື້ຫົວອາຫານໄກ່ບ້ານ + ຮຳ' },
  { id: 't3', date: '2026-11-02', type: 'expense', account: 'cash', center: 'chicken', cat: 'ຄ່າແນວພັນສັດ', amt: 2520, note: 'ຊື້ລູກໄກ່ບ້ານ 140 ໂຕ (ຈ່າຍເງິນສົດ)' },
  { id: 't4', date: '2026-11-02', type: 'expense', account: 'cash', center: 'overhead', cat: 'ຄ່ານ້ຳ-ຄ່າໄຟ', amt: 840, note: 'ຄ່ານ້ຳ-ໄຟສ່ວນກາງຟາມ' },
  { id: 't7', date: '2026-11-03', type: 'expense', account: 'cash', center: 'overhead', cat: 'ຄ່າແຮງງານ', amt: 1200, note: 'ຄ່າແຮງງານຄົນງານສ່ວນກາງ' },
  { id: 't13', date: '2026-11-05', type: 'expense', account: 'cash', center: 'overhead', cat: 'ຄ່າອຸປະກອນ', amt: 500, note: 'ຄ່າສ້ອມແປງຮົ້ວສ່ວນກາງ' },
  { id: 't16', date: '2026-11-05', type: 'transfer', account: 'bank', center: 'overhead', cat: '🔄 ຖອນເງິນສົດ (ປ່ຽນເງິນໂອນເປັນເງິນສົດ)', amt: 3000, note: 'ຖອນເງິນສົດຈາກທະນາຄານມາໄວ້ໃນມື' }
];
