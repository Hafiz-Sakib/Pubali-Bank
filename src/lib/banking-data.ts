export type TxType = "credit" | "debit";
export type TxCategory = "Salary" | "Transfer" | "Bills" | "Shopping" | "Food" | "Travel" | "ATM" | "Investment" | "Other";
export type TxStatus = "completed" | "pending" | "failed";

export interface Account {
  id: string;
  name: string;
  type: "Savings" | "Current" | "Salary" | "FDR";
  number: string;
  balance: number;
  currency: "BDT";
  branch: string;
  openedOn: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string; // ISO
  description: string;
  category: TxCategory;
  type: TxType;
  amount: number;
  status: TxStatus;
  reference: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  bank: string;
  accountNumber: string;
  nickname?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  division: string;
  phone: string;
  hours: string;
  hasATM: boolean;
}

export interface LoanProduct {
  id: string;
  name: string;
  rate: number; // annual %
  minAmount: number;
  maxAmount: number;
  maxTenureMonths: number;
  description: string;
}

export interface CreditCard {
  id: string;
  name: string;
  number: string; // masked
  type: "Visa Platinum" | "Mastercard Gold" | "Visa Signature";
  limit: number;
  outstanding: number;
  available: number;
  dueAmount: number;
  dueDate: string;
  minDue: number;
}

export interface FxRate {
  code: string;
  name: string;
  flag: string;
  buy: number; // BDT per 1 unit
  sell: number;
  change: number; // %
}

export const accounts: Account[] = [
  { id: "ac_1", name: "Primary Savings", type: "Savings", number: "1234 5678 9012", balance: 482350.75, currency: "BDT", branch: "Motijheel", openedOn: "2019-03-12" },
  { id: "ac_2", name: "Salary Account", type: "Salary", number: "1234 5678 4456", balance: 128450.00, currency: "BDT", branch: "Gulshan", openedOn: "2021-07-01" },
  { id: "ac_3", name: "Current Business", type: "Current", number: "9988 7766 5544", balance: 1245880.30, currency: "BDT", branch: "Dhanmondi", openedOn: "2020-11-22" },
  { id: "ac_4", name: "FDR — 3 Year", type: "FDR", number: "FDR 4421 9981", balance: 500000.00, currency: "BDT", branch: "Motijheel", openedOn: "2023-01-15" },
];

const today = new Date();
const daysAgo = (d: number) => new Date(today.getTime() - d * 86400000).toISOString();

export const transactions: Transaction[] = [
  { id: "t1", accountId: "ac_1", date: daysAgo(0), description: "Salary — Ace Limited", category: "Salary", type: "credit", amount: 95000, status: "completed", reference: "SAL-2025-11" },
  { id: "t2", accountId: "ac_1", date: daysAgo(1), description: "BKash Payment", category: "Transfer", type: "debit", amount: 4500, status: "completed", reference: "BK-88231" },
  { id: "t3", accountId: "ac_1", date: daysAgo(2), description: "DESCO Electricity Bill", category: "Bills", type: "debit", amount: 3120, status: "completed", reference: "BIL-DSC-2231" },
  { id: "t4", accountId: "ac_2", date: daysAgo(3), description: "Daraz Online Order", category: "Shopping", type: "debit", amount: 2890, status: "completed", reference: "DRZ-44219" },
  { id: "t5", accountId: "ac_1", date: daysAgo(4), description: "ATM Withdrawal — Gulshan", category: "ATM", type: "debit", amount: 10000, status: "completed", reference: "ATM-991" },
  { id: "t6", accountId: "ac_3", date: daysAgo(5), description: "Client Invoice — Beta Corp", category: "Salary", type: "credit", amount: 215000, status: "completed", reference: "INV-2025-441" },
  { id: "t7", accountId: "ac_1", date: daysAgo(6), description: "Star Kabab Restaurant", category: "Food", type: "debit", amount: 1850, status: "completed", reference: "POS-7712" },
  { id: "t8", accountId: "ac_1", date: daysAgo(7), description: "Biman Bangladesh Tickets", category: "Travel", type: "debit", amount: 18400, status: "completed", reference: "BB-PNR-77GH" },
  { id: "t9", accountId: "ac_2", date: daysAgo(8), description: "Internet — Link3", category: "Bills", type: "debit", amount: 1500, status: "completed", reference: "LK3-9981" },
  { id: "t10", accountId: "ac_1", date: daysAgo(9), description: "Transfer to Karim Hasan", category: "Transfer", type: "debit", amount: 25000, status: "pending", reference: "TRF-2231" },
  { id: "t11", accountId: "ac_3", date: daysAgo(10), description: "FDR Interest Credit", category: "Investment", type: "credit", amount: 4180, status: "completed", reference: "INT-FDR-441" },
  { id: "t12", accountId: "ac_1", date: daysAgo(12), description: "Agora Supershop", category: "Shopping", type: "debit", amount: 5740, status: "completed", reference: "POS-AG-118" },
  { id: "t13", accountId: "ac_1", date: daysAgo(14), description: "Refund — Pathao", category: "Transfer", type: "credit", amount: 320, status: "completed", reference: "RFD-PTH-22" },
  { id: "t14", accountId: "ac_2", date: daysAgo(16), description: "Uber Rides", category: "Travel", type: "debit", amount: 1240, status: "completed", reference: "UB-9911" },
  { id: "t15", accountId: "ac_1", date: daysAgo(20), description: "Card Bill Payment", category: "Bills", type: "debit", amount: 18900, status: "completed", reference: "CC-PMT-441" },
  { id: "t16", accountId: "ac_1", date: daysAgo(22), description: "Failed transfer — Insufficient funds", category: "Transfer", type: "debit", amount: 0, status: "failed", reference: "TRF-FAIL-09" },
];

export const beneficiaries: Beneficiary[] = [
  { id: "b1", name: "Karim Hasan", bank: "Pubali Bank", accountNumber: "1122 3344 5566", nickname: "Bhaiya" },
  { id: "b2", name: "Nusrat Jahan", bank: "BRAC Bank", accountNumber: "9988 7766 1122", nickname: "Sister" },
  { id: "b3", name: "Tahmid Rahman", bank: "City Bank", accountNumber: "5544 3322 1100" },
  { id: "b4", name: "Office Salary Account", bank: "Pubali Bank", accountNumber: "4455 6677 8899", nickname: "Salary HR" },
];

export const branches: Branch[] = [
  { id: "br1", name: "Motijheel Principal Branch", address: "26 Dilkusha C/A", city: "Dhaka", division: "Dhaka", phone: "+880 2 9555881", hours: "10:00 AM – 4:00 PM", hasATM: true },
  { id: "br2", name: "Gulshan Branch", address: "Plot 15, Road 113/A", city: "Dhaka", division: "Dhaka", phone: "+880 2 9889977", hours: "10:00 AM – 4:00 PM", hasATM: true },
  { id: "br3", name: "Dhanmondi Branch", address: "House 7, Road 5", city: "Dhaka", division: "Dhaka", phone: "+880 2 9661123", hours: "10:00 AM – 4:00 PM", hasATM: true },
  { id: "br4", name: "Agrabad Branch", address: "Sheikh Mujib Road", city: "Chattogram", division: "Chattogram", phone: "+880 31 712345", hours: "10:00 AM – 4:00 PM", hasATM: true },
  { id: "br5", name: "Sylhet Branch", address: "Zindabazar", city: "Sylhet", division: "Sylhet", phone: "+880 821 717171", hours: "10:00 AM – 4:00 PM", hasATM: false },
  { id: "br6", name: "Khulna Branch", address: "Sir Iqbal Road", city: "Khulna", division: "Khulna", phone: "+880 41 720011", hours: "10:00 AM – 4:00 PM", hasATM: true },
  { id: "br7", name: "Rajshahi Branch", address: "Saheb Bazar", city: "Rajshahi", division: "Rajshahi", phone: "+880 721 770099", hours: "10:00 AM – 4:00 PM", hasATM: true },
  { id: "br8", name: "Mirpur Branch", address: "Mirpur 10 Circle", city: "Dhaka", division: "Dhaka", phone: "+880 2 9001122", hours: "10:00 AM – 4:00 PM", hasATM: true },
];

export const loanProducts: LoanProduct[] = [
  { id: "ln1", name: "Personal Loan", rate: 9.5, minAmount: 50000, maxAmount: 2000000, maxTenureMonths: 60, description: "Flexible personal loans for life's milestones — weddings, education, medical needs." },
  { id: "ln2", name: "Home Loan", rate: 8.75, minAmount: 500000, maxAmount: 20000000, maxTenureMonths: 300, description: "Own your dream home with low rates and tenures up to 25 years." },
  { id: "ln3", name: "Auto Loan", rate: 9.0, minAmount: 300000, maxAmount: 5000000, maxTenureMonths: 84, description: "Drive your new car home today with quick approvals." },
  { id: "ln4", name: "SME / Business Loan", rate: 10.5, minAmount: 200000, maxAmount: 10000000, maxTenureMonths: 60, description: "Working capital and term loans for growing businesses." },
  { id: "ln5", name: "Education Loan", rate: 8.25, minAmount: 100000, maxAmount: 3000000, maxTenureMonths: 84, description: "Invest in your future — covers tuition, hostel and study-abroad expenses." },
];

export const creditCards: CreditCard[] = [
  { id: "cc1", name: "Pubali Visa Platinum", number: "**** **** **** 4421", type: "Visa Platinum", limit: 300000, outstanding: 48750, available: 251250, dueAmount: 18900, dueDate: daysAgo(-12), minDue: 1890 },
  { id: "cc2", name: "Pubali Mastercard Gold", number: "**** **** **** 9981", type: "Mastercard Gold", limit: 150000, outstanding: 12440, available: 137560, dueAmount: 4220, dueDate: daysAgo(-7), minDue: 422 },
];

export const fxRates: FxRate[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", buy: 117.20, sell: 119.80, change: +0.22 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", buy: 127.40, sell: 130.10, change: -0.18 },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", buy: 148.55, sell: 151.20, change: +0.31 },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦", buy: 31.20, sell: 31.90, change: +0.05 },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", buy: 31.85, sell: 32.55, change: -0.02 },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", buy: 1.39, sell: 1.43, change: +0.01 },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", buy: 0.76, sell: 0.79, change: -0.03 },
  { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾", buy: 26.10, sell: 26.80, change: +0.08 },
];

export const spendingByCategory = [
  { category: "Bills", amount: 23520 },
  { category: "Shopping", amount: 8630 },
  { category: "Food", amount: 1850 },
  { category: "Travel", amount: 19640 },
  { category: "ATM", amount: 10000 },
  { category: "Transfer", amount: 29500 },
];

export const balanceHistory = Array.from({ length: 12 }).map((_, i) => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const base = 380000;
  const value = Math.round(base + Math.sin(i / 1.7) * 38000 + i * 7500);
  return { month: months[i], balance: value };
});

export function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 2 }).format(amount);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-BD").format(n);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
