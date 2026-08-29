import { clearTokens, getRefreshToken, getToken, isAccessTokenExpired, setTokens } from "./auth";

const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
export const API_BASE_URL = rawBase.replace(/\/+$/, "");

let refreshInFlight: Promise<boolean> | null = null;

// The access token is short-lived (1hr, see ACCESS_TOKEN_TTL in
// views.py) - without this, every admin got silently logged out and
// bounced to /login mid-session once it expired, even though their
// 30-day refresh token was still perfectly valid. /auth/refresh/ is the
// same generic endpoint the cafe-owner app uses; it doesn't care whether
// the token belongs to a shop or a staff account.
async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return false;
  }

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        clearTokens();
        return false;
      }
      const data = await res.json();
      if (!data.token) {
        clearTokens();
        return false;
      }
      setTokens(data.token, data.refreshToken, data.accessTokenExpiresAt, data.refreshTokenExpiresAt);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  balance: number;
  profilePhoto: string;
};

export type LoginResponse = {
  token: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: AdminUser;
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchWithAuth(path: string, init?: RequestInit) {
  const token = getToken();
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Proactive: refresh before the access token actually expires so a normal
  // request doesn't have to eat a 401 round-trip first.
  if (isAccessTokenExpired() && getRefreshToken()) {
    await refreshSession();
  }

  let res = await fetchWithAuth(path, init);

  if (res.status === 401 && getRefreshToken()) {
    // Reactive: the proactive check above is timestamp-based and can miss a
    // token that the server considers expired/invalid for some other reason
    // (clock drift, revoked session) - try one silent refresh-and-retry
    // before giving up.
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await fetchWithAuth(path, init);
    }
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : undefined;

  if (res.status === 401) {
    // Session truly gone (refresh failed too, or the account lost staff
    // access) - drop the stale tokens so the next protected-route check
    // redirects to /login instead of looping on a doomed request.
    clearTokens();
  }

  if (!res.ok) {
    const message = (body && (body.message as string)) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return body as T;
}

export function adminLogin(email: string, password: string) {
  return request<LoginResponse>("/admin/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export type AdminRoleValue = "super_admin" | "finance" | "support" | "sales";

export function fetchAdminMe() {
  return request<{ user: AdminUser; role: AdminRoleValue }>("/admin/me/");
}

// --- Staff / role management (V2-G, super_admin only) ----------------------

export type StaffMember = {
  id: number;
  email: string;
  fullName: string;
  role: AdminRoleValue;
  isActive: boolean;
};

export function fetchStaff() {
  return request<{ staff: StaffMember[] }>("/admin/staff/");
}

export function setStaffRole(id: number, role: AdminRoleValue) {
  return request<{ id: number; email: string; role: AdminRoleValue }>(`/admin/staff/${id}/role/`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

export function addStaff(email: string, role: AdminRoleValue) {
  return request<StaffMember>("/admin/staff/", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export function revokeStaff(id: number) {
  return request<{ id: number; email: string; isStaff: boolean }>(`/admin/staff/${id}/revoke/`, { method: "POST" });
}

export type ActivityEvent = {
  type: "order" | "topup" | "withdrawal";
  id: number;
  label: string;
  amount: number;
  status: string;
  createdAt: string;
};

export function fetchRecentActivity(page?: number, pageSize?: number) {
  const query = new URLSearchParams();
  if (page) query.set("page", String(page));
  if (pageSize) query.set("pageSize", String(pageSize));
  const qs = query.toString();
  return request<{ count: number; page: number; pageSize: number; events: ActivityEvent[] }>(
    `/admin/recent-activity/${qs ? `?${qs}` : ""}`
  );
}

export type OverviewResponse = {
  shops: {
    total: number;
    active: number;
    inactive: number;
    signupsToday: number;
    signupsWeek: number;
    signupsMonth: number;
  };
  orders: {
    today: number;
    week: number;
    stuckAwaitingApproval: number;
    stuckPhotoJobs: number;
  };
  wallet: {
    totalBalance: number;
    topupsToday: number;
    topupsTodayAmount: number;
    pendingWithdrawals: number;
    pendingWithdrawalsAmount: number;
  };
  agents: {
    active: number;
    pending: number;
  };
  support: {
    unreadMessages: number;
  };
  activePaymentGateway: string | null;
  recentActivity: ActivityEvent[];
  range: { from: string; to: string };
  revenue: {
    platformFeeRevenue: number;
    commissionsPaid: number;
    netRevenue: number;
    ordersValue: number;
    ordersCount: number;
    newSignups: number;
    topupsAmount: number;
    topupsCount: number;
  };
};

export function fetchOverview(params?: { from?: string; to?: string }) {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  const qs = query.toString();
  return request<OverviewResponse>(`/admin/overview/${qs ? `?${qs}` : ""}`);
}

export type Shop = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  shopName: string;
  balance: number;
  creditLimitOverride: number | null;
  cashCounterPermitted: boolean;
  isActive: boolean;
  dateJoined: string;
  referredByAgent: { id: number; referralCode: string } | null;
};

export type ShopListResponse = {
  count: number;
  page: number;
  pageSize: number;
  shops: Shop[];
};

export type ShopOrder = {
  id: number;
  orderNumber: string;
  serviceName: string;
  status: string;
  paymentMode: string;
  paymentStatus: string;
  totalAmount: number;
  agentMessage: string;
  photoStatus: string;
  photoErrorMessage: string;
  createdAt: string;
};

export type ShopTransaction = {
  id: number;
  kind: string;
  direction: string;
  amount: number;
  balanceAfter: number | null;
  note: string;
  createdAt: string;
};

export type ShopPricing = {
  serviceKey: string;
  serviceName: string;
  settings: Record<string, unknown>;
  updatedAt: string;
};

export type ShopDetailResponse = {
  shop: Shop;
  profile: {
    shopName: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    mobile: string;
    whatsapp: string;
    email: string;
  };
  pricing: ShopPricing[];
  recentOrders: ShopOrder[];
  walletSummary: { onlineCollected: number; cashCounterCollected: number; totalCollected: number; netWithdrawable: number };
  recentTransactions: ShopTransaction[];
};

export function fetchShops(params: {
  search?: string;
  balanceFilter?: string;
  cashCounter?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.balanceFilter) query.set("balanceFilter", params.balanceFilter);
  if (params.cashCounter) query.set("cashCounter", params.cashCounter);
  if (params.status) query.set("status", params.status);
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.page) query.set("page", String(params.page));
  return request<ShopListResponse>(`/admin/shops/?${query.toString()}`);
}

export function fetchShopDetail(id: number) {
  return request<ShopDetailResponse>(`/admin/shops/${id}/`);
}

export function updateShop(id: number, data: { creditLimitOverride?: number | null; cashCounterPermitted?: boolean }) {
  return request<ShopDetailResponse>(`/admin/shops/${id}/`, { method: "PUT", body: JSON.stringify(data) });
}

export function adjustShopBalance(id: number, amount: number, reason: string) {
  return request<{ balance: number; transactionId: number }>(`/admin/shops/${id}/adjust-balance/`, {
    method: "POST",
    body: JSON.stringify({ amount, reason }),
  });
}

export function setShopActive(id: number, active: boolean) {
  return request<{ id: number; isActive: boolean }>(`/admin/shops/${id}/${active ? "reactivate" : "suspend"}/`, {
    method: "POST",
  });
}

export function deleteShop(id: number, confirmEmail: string) {
  return request<{ deleted: boolean }>(`/admin/shops/${id}/delete/`, {
    method: "POST",
    body: JSON.stringify({ confirmEmail }),
  });
}

export type ShopOrderListResponse = {
  count: number;
  page: number;
  pageSize: number;
  orders: ShopOrder[];
};

export function fetchShopOrders(id: number, params: { status?: string; from?: string; to?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.page) query.set("page", String(params.page));
  return request<ShopOrderListResponse>(`/admin/shops/${id}/orders/?${query.toString()}`);
}

// --- Orders (Phase 4) ---------------------------------------------------

export type AdminOrder = ShopOrder & {
  shopId: number;
  shopName: string;
  shopEmail: string;
};

export type AdminOrderListResponse = {
  count: number;
  page: number;
  pageSize: number;
  orders: AdminOrder[];
};

export function fetchOrders(params: {
  shop?: string;
  service?: string;
  paymentMode?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, String(value));
  });
  return request<AdminOrderListResponse>(`/admin/orders/?${query.toString()}`);
}

export function fetchOrderDetail(id: number) {
  return request<{ order: AdminOrder }>(`/admin/orders/${id}/`);
}

export type StuckOrder = {
  id: number;
  orderNumber: string;
  shopId: number;
  shopName: string;
  serviceName: string;
  status: string;
  photoStatus: string;
  createdAt: string;
};

export function fetchStuckOrders() {
  return request<{ awaitingApproval: StuckOrder[]; stuckPhotoJobs: StuckOrder[] }>("/admin/orders/stuck/");
}

// --- Wallet & Finance (Phase 5) -----------------------------------------

export type AdminTransaction = {
  id: number;
  kind: string;
  direction: string;
  amount: number;
  affectsBalance: boolean;
  note: string;
  orderId: number | null;
  createdAt: string;
  shopId: number;
  shopName: string;
  shopEmail: string;
};

export function fetchWalletLedger(params: { shop?: string; type?: string; from?: string; to?: string; page?: number }) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, String(value));
  });
  return request<{ count: number; page: number; pageSize: number; transactions: AdminTransaction[] }>(
    `/admin/wallet/ledger/?${query.toString()}`
  );
}

export type WalletLedgerSummary = {
  shopId: number;
  currentBalance: number;
  totalCredit: number;
  totalDebit: number;
  platformRevenue: number;
};

export function fetchWalletLedgerSummary(shopId: number) {
  return request<WalletLedgerSummary>(`/admin/wallet/ledger/summary/?shop=${shopId}`);
}

export type EarningsPeriod = { amount: number; comparisonAmount: number; changePercent: number | null };

export function fetchWalletEarningsSummary() {
  return request<{ today: EarningsPeriod; thisWeek: EarningsPeriod; thisMonth: EarningsPeriod }>(
    "/admin/wallet/earnings-summary/"
  );
}

export type AdminTopup = {
  id: number;
  shopId: number;
  shopName: string;
  shopEmail: string;
  amount: number;
  paymentGateway: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
};

export function fetchWalletTopups(params: { gateway?: string; status?: string; page?: number }) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, String(value));
  });
  return request<{ count: number; page: number; pageSize: number; topups: AdminTopup[] }>(`/admin/wallet/topups/?${query.toString()}`);
}

export type AdminWithdrawal = {
  id: number;
  amount: number;
  feeAmount: number;
  method: string;
  accountDetail: string;
  note: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  shopId: number;
  shopName: string;
  shopEmail: string;
  balanceAfterRequest: number | null;
};

export function fetchWithdrawals(status?: string, page?: number, email?: string) {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (page) query.set("page", String(page));
  if (email) query.set("email", email);
  const qs = query.toString();
  return request<{ count: number; page: number; pageSize: number; withdrawals: AdminWithdrawal[] }>(
    `/admin/withdrawals/${qs ? `?${qs}` : ""}`
  );
}

export function approveWithdrawal(id: number) {
  return request<{ withdrawal: AdminWithdrawal }>(`/admin/withdrawals/${id}/approve/`, { method: "POST" });
}

export function rejectWithdrawal(id: number, reason: string) {
  return request<{ withdrawal: AdminWithdrawal }>(`/admin/withdrawals/${id}/reject/`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export type AdminWalletSetting = {
  key: string;
  label: string;
  value: number;
  description: string;
  isActive: boolean;
  updatedAt: string;
};

export function fetchWalletSettings() {
  return request<{ settings: AdminWalletSetting[] }>("/admin/wallet-settings/");
}

export function updateWalletSetting(key: string, data: { value?: number; isActive?: boolean }) {
  return request<AdminWalletSetting>(`/admin/wallet-settings/${key}/`, { method: "PUT", body: JSON.stringify(data) });
}

export type AdminToolPricing = {
  toolKey: string;
  label: string;
  unit: string;
  price: number;
  priceB2b: number | null;
  priceB2c: number | null;
  isBillable: boolean;
  updatedAt: string;
};

export function fetchToolPricing() {
  return request<{ pricing: AdminToolPricing[] }>("/admin/tool-pricing/");
}

export function updateToolPricing(
  toolKey: string,
  data: { price?: number; priceB2b?: number | null; priceB2c?: number | null; isBillable?: boolean }
) {
  return request<AdminToolPricing>(`/admin/tool-pricing/${toolKey}/`, { method: "PUT", body: JSON.stringify(data) });
}

export type AdminToolVisibility = {
  toolKey: string;
  label: string;
  isEnabled: boolean;
  updatedAt: string;
};

export function fetchToolVisibility() {
  return request<{ tools: AdminToolVisibility[] }>("/admin/tool-visibility/");
}

export function updateToolVisibility(toolKey: string, isEnabled: boolean) {
  return request<AdminToolVisibility>(`/admin/tool-visibility/${toolKey}/`, {
    method: "PUT",
    body: JSON.stringify({ isEnabled }),
  });
}

// --- Referral Agents (Phase 6) -------------------------------------------

export type AdminAgent = {
  id: number;
  referralCode: string;
  userId: number;
  email: string;
  fullName: string;
  commissionType: "percentage" | "fixed";
  commissionRate: number;
  status: "pending" | "active" | "suspended";
  specialOfferNote: string;
  referredShopsCount: number;
  totalCommissionEarned: number;
  currentBalance: number;
  createdAt: string;
};

export function fetchAgents(status?: string) {
  const query = status ? `?status=${status}` : "";
  return request<{ count: number; agents: AdminAgent[] }>(`/admin/agents/${query}`);
}

export function onboardAgent(data: { email: string; commissionType: string; commissionRate: number }) {
  return request<{ agent: AdminAgent }>("/admin/agents/", { method: "POST", body: JSON.stringify(data) });
}

export type AgentCommissionEntry = { id: number; amount: number; note: string; createdAt: string };

export function fetchAgentDetail(id: number) {
  return request<{
    agent: AdminAgent;
    referredShops: { id: number; shopName: string; email: string }[];
    commissionLedger: AgentCommissionEntry[];
  }>(`/admin/agents/${id}/`);
}

export function updateAgent(
  id: number,
  data: { commissionType?: string; commissionRate?: number; status?: string; specialOfferNote?: string }
) {
  return request<{ agent: AdminAgent }>(`/admin/agents/${id}/`, { method: "PUT", body: JSON.stringify(data) });
}

// --- Coupon Codes -----------------------------------------------------------

export type AdminCoupon = {
  id: number;
  code: string;
  amount: number;
  message: string;
  isActive: boolean;
  maxRedemptions: number | null;
  redeemedCount: number;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
};

export function fetchCoupons() {
  return request<{ count: number; coupons: AdminCoupon[] }>("/admin/coupons/");
}

export function createCoupon(data: { code?: string; amount: number; message: string; maxRedemptions?: number | null; expiresAt?: string | null }) {
  return request<{ coupon: AdminCoupon }>("/admin/coupons/", { method: "POST", body: JSON.stringify(data) });
}

export type CouponRedemptionEntry = { id: number; shopCode: string; shopName: string; email: string; phone: string; redeemedAt: string };

export function fetchCouponDetail(id: number) {
  return request<{ coupon: AdminCoupon; redemptions: CouponRedemptionEntry[] }>(`/admin/coupons/${id}/`);
}

export function updateCoupon(id: number, data: { isActive?: boolean; message?: string; maxRedemptions?: number | null; expiresAt?: string | null }) {
  return request<{ coupon: AdminCoupon }>(`/admin/coupons/${id}/`, { method: "PUT", body: JSON.stringify(data) });
}

// --- Support Inbox (Phase 7) ----------------------------------------------

export type ContactMessage = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  adminNote: string;
  createdAt: string;
};

export function fetchContactMessages(status?: string, page?: number) {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (page) query.set("page", String(page));
  const qs = query.toString();
  return request<{ count: number; page: number; pageSize: number; messages: ContactMessage[] }>(
    `/admin/contact-messages/${qs ? `?${qs}` : ""}`
  );
}

export function updateContactMessage(id: number, data: { isRead?: boolean; adminNote?: string }) {
  return request<{ contactMessage: ContactMessage }>(`/admin/contact-messages/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// --- Desktop Print Agent monitoring (Phase 9) -----------------------------

export type PrintAgentShopStatus = {
  id: number;
  shopName: string;
  email: string;
  lastSeenAt: string | null;
  online: boolean;
};

export type PrintAgentFailedJob = {
  id: number;
  orderNumber: string;
  shopName: string;
  serviceName: string;
  agentMessage: string;
  createdAt: string;
};

export function fetchPrintAgentStats() {
  return request<{ onlineCount: number; shops: PrintAgentShopStatus[]; recentFailedJobs: PrintAgentFailedJob[] }>(
    "/admin/print-agent/stats/"
  );
}

// --- Reporting / CSV export (Phase 11) ------------------------------------

async function downloadCsv(path: string, filename: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error(`Export failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportWalletLedgerCsv() {
  return downloadCsv("/admin/wallet/ledger/export/", "wallet-ledger.csv");
}

export function exportOrdersCsv(params?: { shop?: string; service?: string; paymentMode?: string; status?: string; from?: string; to?: string }) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) query.set(key, String(value));
  });
  const qs = query.toString();
  return downloadCsv(`/admin/orders/export/${qs ? `?${qs}` : ""}`, "orders.csv");
}

// --- Notification badges (V2-A) --------------------------------------------

export type AdminNotifications = {
  pendingWithdrawals: number;
  unreadMessages: number;
  pendingAgents: number;
  stuckOrders: number;
};

export function fetchNotifications() {
  return request<AdminNotifications>("/admin/notifications/");
}

// --- Signup / growth analytics (V2-B) --------------------------------------

export type SignupAnalytics = {
  from: string;
  to: string;
  granularity: string;
  totalSignups: number;
  series: { date: string; count: number }[];
  byReferralAgent: { referralCode: string; count: number }[];
};

export function fetchSignupAnalytics(params: { from?: string; to?: string; granularity?: string }) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  return request<SignupAnalytics>(`/admin/analytics/signups/?${query.toString()}`);
}

export type OrderAnalytics = {
  from: string;
  to: string;
  granularity: string;
  totalOrders: number;
  failedOrders: number;
  series: { date: string; count: number }[];
  topShops: { shopId: number; shopName: string; shopEmail: string; shopPhone: string; orderCount: number; totalAmount: number }[];
};

export function fetchOrderAnalytics(params: { from?: string; to?: string; granularity?: string; limit?: number }) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, String(value));
  });
  return request<OrderAnalytics>(`/admin/analytics/orders/?${query.toString()}`);
}

// --- Admin activity log (V2-C) ---------------------------------------------

export type AdminActivityLogEntry = {
  id: number;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: string;
  createdAt: string;
};

export function fetchActivityLog(params: { targetType?: string; targetId?: string; action?: string; page?: number }) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, String(value));
  });
  return request<{ count: number; page: number; pageSize: number; logs: AdminActivityLogEntry[] }>(
    `/admin/activity-log/?${query.toString()}`
  );
}

// --- Password reset + impersonate (V2-D) -----------------------------------

const CLIENT_APP_URL = (process.env.NEXT_PUBLIC_CLIENT_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

export function sendShopPasswordReset(id: number) {
  return request<{ message: string }>(`/admin/shops/${id}/send-password-reset/`, { method: "POST" });
}

export function bulkSetShopsActive(shopIds: number[], active: boolean) {
  return request<{ updated: number[]; isActive: boolean }>(`/admin/shops/${active ? "bulk-reactivate" : "bulk-suspend"}/`, {
    method: "POST",
    body: JSON.stringify({ shopIds }),
  });
}

export async function impersonateShop(id: number) {
  const res = await request<LoginResponse>(`/admin/shops/${id}/impersonate/`, { method: "POST" });
  const hash = new URLSearchParams({
    token: res.token,
    refreshToken: res.refreshToken,
    accessTokenExpiresAt: res.accessTokenExpiresAt,
    refreshTokenExpiresAt: res.refreshTokenExpiresAt,
  }).toString();
  window.open(`${CLIENT_APP_URL}/impersonate#${hash}`, "_blank", "noopener,noreferrer");
}
