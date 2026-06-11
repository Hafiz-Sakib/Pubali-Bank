// Lightweight client-side persistence layer for Phase 3 banking features.
// Uses localStorage so the demo works offline and survives reloads.
// Designed to be swapped for Lovable Cloud (Supabase) by replacing the
// read/write helpers with createServerFn calls.

import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "pbl_banking_store_v1";

export type TransferStatus = "completed" | "pending" | "failed";
export interface TransferRecord {
  id: string;
  fromAccountId: string;
  toName: string;
  toAccount: string;
  toBank: string;
  kind: "own" | "beneficiary" | "external";
  amount: number;
  fee: number;
  note?: string;
  reference: string;
  status: TransferStatus;
  createdAt: string;
}

export interface CardSettings {
  cardId: string;
  frozen: boolean;
  blocked: boolean;
  onlineEnabled: boolean;
  internationalEnabled: boolean;
  contactlessEnabled: boolean;
  dailySpendLimit: number;
  replacementRequested: boolean;
}

export type LoanStage = "Submitted" | "Under Review" | "Approved" | "Disbursed" | "Rejected";
export interface LoanApplication {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  tenureMonths: number;
  monthlyIncome: number;
  purpose: string;
  emi: number;
  status: LoanStage;
  timeline: { stage: LoanStage; at: string; note?: string }[];
  createdAt: string;
}

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Normal" | "High" | "Urgent";
export interface SupportTicket {
  id: string;
  subject: string;
  category: "Account" | "Cards" | "Transfers" | "Loans" | "App" | "Other";
  priority: TicketPriority;
  status: TicketStatus;
  messages: { from: "you" | "agent"; body: string; at: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  at: string;
  type: "auth" | "transfer" | "card" | "loan" | "ticket" | "security";
  message: string;
}

interface Store {
  transfers: TransferRecord[];
  cardSettings: Record<string, CardSettings>;
  loanApplications: LoanApplication[];
  tickets: SupportTicket[];
  auditLog: AuditLogEntry[];
}

const empty: Store = {
  transfers: [],
  cardSettings: {},
  loanApplications: [],
  tickets: [],
  auditLog: [],
};

function read(): Store {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Store>;
    return { ...empty, ...parsed };
  } catch {
    return empty;
  }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("pbl-store"));
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStore = () => cb();
  window.addEventListener("pbl-store", onStore);
  window.addEventListener("storage", onStore);
  return () => {
    window.removeEventListener("pbl-store", onStore);
    window.removeEventListener("storage", onStore);
  };
}

export function useBankingStore<T>(selector: (s: Store) => T): T {
  // SSR-safe: server returns empty snapshot.
  return useSyncExternalStore(
    subscribe,
    () => selector(read()),
    () => selector(empty),
  );
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

function update(patch: (s: Store) => Store) {
  const next = patch(read());
  write(next);
}

const uid = (p = "id") => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function log(entry: Omit<AuditLogEntry, "id" | "at">) {
  update((s) => ({
    ...s,
    auditLog: [{ id: uid("a"), at: new Date().toISOString(), ...entry }, ...s.auditLog].slice(0, 200),
  }));
}

// ---- Transfers ----
export const DAILY_LIMIT = 1_000_000; // ৳10,00,000
export const MONTHLY_LIMIT = 5_000_000; // ৳50,00,000
export const PER_TXN_LIMIT = 500_000;

export function transferUsage() {
  const all = read().transfers.filter((t) => t.status !== "failed");
  const now = new Date();
  const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  let daily = 0,
    monthly = 0;
  for (const t of all) {
    const at = new Date(t.createdAt).getTime();
    if (at >= startMonth) monthly += t.amount;
    if (at >= startDay) daily += t.amount;
  }
  return { daily, monthly };
}

export function createTransfer(input: Omit<TransferRecord, "id" | "reference" | "status" | "createdAt" | "fee"> & { fee?: number }) {
  const rec: TransferRecord = {
    ...input,
    fee: input.fee ?? 0,
    id: uid("trf"),
    reference: `TRF-${Date.now().toString().slice(-8)}`,
    status: "completed",
    createdAt: new Date().toISOString(),
  };
  update((s) => ({ ...s, transfers: [rec, ...s.transfers] }));
  log({ type: "transfer", message: `Sent ৳${rec.amount.toLocaleString()} to ${rec.toName} (${rec.reference})` });
  return rec;
}

// ---- Card settings ----
export function getCardSettings(cardId: string): CardSettings {
  const s = read().cardSettings[cardId];
  return (
    s || {
      cardId,
      frozen: false,
      blocked: false,
      onlineEnabled: true,
      internationalEnabled: false,
      contactlessEnabled: true,
      dailySpendLimit: 100000,
      replacementRequested: false,
    }
  );
}

export function setCardSettings(cardId: string, patch: Partial<CardSettings>) {
  update((s) => ({
    ...s,
    cardSettings: { ...s.cardSettings, [cardId]: { ...getCardSettings(cardId), ...patch } },
  }));
}

// ---- Loans ----
export function submitLoanApplication(app: Omit<LoanApplication, "id" | "status" | "timeline" | "createdAt">) {
  const now = new Date().toISOString();
  const rec: LoanApplication = {
    ...app,
    id: uid("ln"),
    status: "Submitted",
    timeline: [{ stage: "Submitted", at: now, note: "Application received" }],
    createdAt: now,
  };
  update((s) => ({ ...s, loanApplications: [rec, ...s.loanApplications] }));
  log({ type: "loan", message: `Applied for ${rec.productName} — ৳${rec.amount.toLocaleString()}` });
  // Auto-advance demo: schedule a status bump after 4s
  if (typeof window !== "undefined") {
    setTimeout(() => advanceLoan(rec.id, "Under Review", "Credit team reviewing documents"), 4000);
  }
  return rec;
}

export function advanceLoan(id: string, to: LoanApplication["status"], note?: string) {
  update((s) => ({
    ...s,
    loanApplications: s.loanApplications.map((a) =>
      a.id === id
        ? { ...a, status: to, timeline: [...a.timeline, { stage: to, at: new Date().toISOString(), note }] }
        : a,
    ),
  }));
}

// ---- Tickets ----
export function createTicket(input: Omit<SupportTicket, "id" | "status" | "messages" | "createdAt" | "updatedAt"> & { body: string }) {
  const now = new Date().toISOString();
  const t: SupportTicket = {
    id: uid("tk"),
    subject: input.subject,
    category: input.category,
    priority: input.priority,
    status: "Open",
    messages: [{ from: "you", body: input.body, at: now }],
    createdAt: now,
    updatedAt: now,
  };
  update((s) => ({ ...s, tickets: [t, ...s.tickets] }));
  log({ type: "ticket", message: `Opened ticket: ${t.subject}` });
  if (typeof window !== "undefined") {
    setTimeout(() => replyTicket(t.id, "agent", "Thanks for reaching out — an agent will get back within 24 hours."), 2500);
  }
  return t;
}

export function replyTicket(id: string, from: "you" | "agent", body: string) {
  update((s) => ({
    ...s,
    tickets: s.tickets.map((t) =>
      t.id === id
        ? {
            ...t,
            updatedAt: new Date().toISOString(),
            status: from === "agent" ? "In Progress" : t.status,
            messages: [...t.messages, { from, body, at: new Date().toISOString() }],
          }
        : t,
    ),
  }));
}

export function setTicketStatus(id: string, status: TicketStatus) {
  update((s) => ({
    ...s,
    tickets: s.tickets.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t)),
  }));
}

// ---- Security: Sessions & Devices ----
export interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
  trusted: boolean;
}

const SESSIONS_KEY = "pbl_sessions_v1";

function readSessions(): DeviceSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as DeviceSession[]) : [];
  } catch {
    return [];
  }
}

function writeSessions(list: DeviceSession[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("pbl-store"));
}

function detectDevice(): { device: string; browser: string; os: string } {
  if (typeof navigator === "undefined") return { device: "Unknown", browser: "Unknown", os: "Unknown" };
  const ua = navigator.userAgent;
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "Unknown";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const device = /Mobile|Android|iPhone/.test(ua) ? "Mobile" : /iPad|Tablet/.test(ua) ? "Tablet" : "Desktop";
  return { device, browser, os };
}

export function registerCurrentSession() {
  if (typeof window === "undefined") return;
  const list = readSessions();
  const fingerprint = `${navigator.userAgent}_${screen.width}x${screen.height}`;
  const existing = list.find((s) => s.id === btoa(fingerprint).slice(0, 16));
  const now = new Date().toISOString();
  if (existing) {
    existing.lastSeenAt = now;
    existing.current = true;
    list.forEach((s) => { if (s.id !== existing.id) s.current = false; });
    writeSessions(list);
    return;
  }
  const d = detectDevice();
  const sess: DeviceSession = {
    id: btoa(fingerprint).slice(0, 16),
    ...d,
    ip: "192.168.0." + Math.floor(Math.random() * 250 + 2),
    location: "Dhaka, BD",
    createdAt: now,
    lastSeenAt: now,
    current: true,
    trusted: list.length === 0,
  };
  list.forEach((s) => (s.current = false));
  writeSessions([sess, ...list].slice(0, 10));
  log({ type: "security", message: `New session from ${d.browser} on ${d.os}` });
}

export function useSessions(): DeviceSession[] {
  return useSyncExternalStore(subscribe, readSessions, () => []);
}

export function revokeSession(id: string) {
  const list = readSessions().filter((s) => s.id !== id);
  writeSessions(list);
  log({ type: "security", message: `Revoked session ${id}` });
}

export function trustSession(id: string, trusted: boolean) {
  const list = readSessions().map((s) => (s.id === id ? { ...s, trusted } : s));
  writeSessions(list);
  log({ type: "security", message: `${trusted ? "Trusted" : "Untrusted"} session ${id}` });
}
