import type { LucideIcon } from "lucide-react";

export type NavItem = {
  icon?: React.ElementType;
  label: string;
  href?: string;
  children?: NavItem[];
  isHeader?: boolean; // <--- PENTING BUAT PEMISAH
};

export type AdLevel =
  | "noAds"
  | "level1"
  | "level2"
  | "level3"
  | "level4"
  | "low"
  | "medium"
  | "high"
  | "aggressive"
  | string;

// Tipe data untuk list link di card
export type TopLinkItem = {
  id: string;
  shortUrl: string; // cth: short.link/asu12
  originalUrl: string; // cth: https://www.youtube.com/watch...
  totalViews: number; // cth: 5100
  totalEarnings: number; // cth: 22.95
  cpm: number; // cth: 4.50
  alias?: string; // Buat di modal edit
  password?: string; // Buat di modal edit
  expiresAt?: string; // Buat di modal edit (format ISO date string)
  adsLevel?: AdLevel;
  passwordProtected: boolean;
};

// Tipe data untuk form di modal
export type EditableLinkData = {
  alias: string;
  password?: string;
  expiresAt?: string; // Bisa pake string (date) atau Date object
  adsLevel: AdLevel;
};

export type UserLevel =
  | "beginner"
  | "rookie"
  | "elite"
  | "pro"
  | "master"
  | "mythic";

export interface TopTrafficStats {
  topMonth: {
    month: string; // e.g., "February"
    views: number; // e.g., 405000
  };
  topYear: {
    year: string; // e.g., "2025"
    views: number; // e.g., 805000
  };
  topLevel: {
    level: UserLevel;
    cpmBonusPercent: number; // e.g., 20
  };
}

export interface CountryStat {
  isoCode: string; // "us", "id", "gb"
  name: string;
  views: number;
  percentage: number; // 0-100
}

// --- TAMBAHKAN TIPE DI BAWAH INI ---
export interface ReferrerStat {
  name: string; // "Google", "Facebook", "Direct", "blog.example.com"
  views: number;
  percentage: number; // 0-100
}

export interface ReferralStats {
  totalEarnings: number; // Total earnings from referrals
  totalReferred: number; // Total number of referred users
  activeReferred: number; // Number of active referred users
  commissionRate?: number; // Commission rate percentage
  maxReferrals?: number; // Max referrals allowed by user's level
  isLimitReached?: boolean; // Whether max referrals limit is reached
}

export interface CreateLinkFormData {
  url: string;
  alias?: string;
  password?: string;
  title?: string;
  expiresAt?: string;
  adsLevel: AdLevel;
}

// Audit Log Types
export type AuditActionType =
  | "create"
  | "update"
  | "delete"
  | "suspend"
  | "unsuspend"
  | "approve"
  | "reject"
  | "block"
  | "unblock";

export type AuditTargetType =
  | "user"
  | "link"
  | "withdrawal"
  | "admin"
  | "announcement"
  | "ad_level"
  | "system";

export type AuditLogStatus = "success" | "failed";

export interface AuditLog {
  id: string;
  timestamp: string; // ISO date string
  adminId: string;
  adminName: string;
  adminRole: "admin" | "super-admin";
  adminAvatar?: string;
  action: AuditActionType;
  targetType: AuditTargetType;
  targetId: string;
  targetName: string;
  description: string;
  status: AuditLogStatus;
  ipAddress?: string;
  location?: string;
  metadata?: {
    oldValue?: string;
    newValue?: string;
    reason?: string;
    [key: string]: any;
  };
}

export interface AuditLogStats {
  totalActivitiesToday: number;
  activeAdmins: number;
  criticalActions: number;
  failedActions: number;
}

export interface GeneratedLinkData {
  shortUrl: string; // cth: short.link/taik112
  originalUrl: string; // cth: https://kevinragil.vercel.app
}

export interface AdFeature {
  label: string; // cth: "Popunder"
  value: string | boolean; // cth: "1 per 24h" atau true
  included: boolean; // Buat nampilin icon Check atau Silang
}

export interface AdLevelConfig {
  id: string;
  name: string; // cth: "Low", "Medium", "High", "Aggressive"
  slug: string; // cth: "low", "medium", "high", "aggressive"
  description: string; // Deskripsi level ads
  cpmRate: string; // cth: "Variable" atau "$0.50 - $2.00"
  revenueShare: number; // Persentase revenue (30, 50, 75, 100)
  demoUrl: string; // Link demo
  colorTheme: string; // "green", "blue", "orange", "red"
  features: AdFeature[]; // List fitur ads (legacy, will be deprecated)
  enabledFeatures?: string[]; // IDs of enabled global features
  isPopular?: boolean; // Optional - buat badge "MOST POPULAR"
  is_default?: boolean; // Optional - buat default selected di create link

  // Legacy fields (optional, mungkin dipake di bagian referral config)
  totalReferred?: number;
  activeReferred?: number;
  commissionRate?: number; // dalam persen (misal 20)
}

export interface ReferredUser {
  id: string;
  name: string; // cth: "Udin Petot"
  dateJoined: string;
  totalEarningsForMe: number; // Berapa yang dihasilkan user ini buat kita
  status: "active" | "inactive";
}

export interface WithdrawalStats {
  availableBalance: number;
  pendingWithdrawn: number;
  totalWithdrawn: number;
}

export interface PaymentMethod {
  id: string; // Payment method ID
  provider: string; // cth: "PayPal", "Bank Transfer"
  accountName: string; // cth: "Kevin Ragil"
  accountNumber: string; // cth: "1234567890" (masked)
  fee?: number; // Admin fee for this method
  isDefault?: boolean; // Is this the default method
  currency?: string; // Currency code from template (IDR, USD, etc.)
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  fee?: number; // Admin fee
  method: string; // cth: "PayPal"
  account: string; // cth: "kevin***@gmail.com"
  accountName?: string; // cth: "GOJO SATORU"
  status: "pending" | "approved" | "rejected" | "paid" | "cancelled";
  txId?: string; // ID referensi transfer
  note?: string; // Note/reason from admin
  currency?: string; // Currency code from payment method (IDR, USD, etc.)
  localAmount?: number; // Amount in local currency (saved at withdrawal time)
  exchangeRate?: number; // Exchange rate used at withdrawal time
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  username: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string | null; // tgl terakhir ganti, null if never changed
  isSocialLogin: boolean; // true if user logged in via OAuth (no password set)
}

export interface NotificationSettings {
  emailLogin: boolean;
  emailWithdrawal: boolean;
  emailMarketing: boolean;
}

// ... tipe data lain

export type ActivityType = "login" | "security" | "link" | "payment" | "system";

export interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string; // cth: "Login Berhasil"
  description: string; // cth: "Login dari Chrome di Windows (192.168.1.1)"
  timestamp: string; // ISO Date
  ipAddress?: string;
  device?: string;
  status: "success" | "warning" | "failed";
}

export type NotificationType = "info" | "warning" | "success" | "alert";

export type NotificationCategory =
  | "link"
  | "payment"
  | "account"
  | "event"
  | "system";

export type Role = "member" | "admin" | "super-admin";

// Admin Data (buat manage-admins page di super-admin)
export interface Admin {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: "admin" | "super-admin" | "super_admin"; // Admin atau Super Admin (backend uses underscore)
  status: "active" | "suspended";
  joinedAt: string;
  lastLogin: string;
  stats: {
    usersManaged: number; // Berapa user yang di-handle
    withdrawalsProcessed: number; // Withdrawal yang diproses
    linksBlocked: number; // Link yang di-block
  };
}

export interface AdminStats {
  totalAdmins: { count: number; trend: number };
  activeToday: { count: number; trend: number };
  suspendedAdmins: { count: number; trend: number };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "alert";
  category: NotificationCategory; // <--- Wajib ada sekarang
  isRead: boolean;
  timestamp: string;
  actionUrl?: string; // (Opsional) Kalo diklik lari kemana
  isGlobal?: boolean; // (Opsional) True jika ini global notification
}

export interface LevelConfig {
  no: number;
  id: UserLevel;
  name: string;
  icon: string; // lucide icon name: "shield", "star", etc.
  minEarnings: number; // <--- GANTI INI (Dulu minViews)
  cpmBonus: number;
  benefits: string[];
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

export interface UserLevelProgress {
  currentLevel: UserLevel;
  currentEarnings: number; // <--- GANTI INI
  nextLevelEarnings: number; // <--- GANTI INI
  progressPercent: number;
}

export interface SavedPaymentMethod {
  id: string; // ID unik dari database (uuid/id)
  provider: string; // DANA, PayPal, BCA, dll
  accountName: string; // Nama pemilik
  accountNumber: string; // Nomor rekening/HP/Email
  isDefault: boolean; // Penanda kalo ini metode utama
  category: "wallet" | "bank" | "crypto"; // Opsional, buat grouping icon
  fee?: number; // Admin fee for this method - optional, set by backend
  currency?: string; // Currency code from template (IDR, USD, etc.)
  templateId?: number; // Reference to payment method template
}

export interface PrivacySettings {
  loginAlert: boolean;
  cookieConsent: boolean;
  saveLoginInfo: boolean;
}

export interface UserPreferences {
  language: "en" | "id";
  currency: string; // Dynamic from backend (USD, IDR, etc.)
  timezone: string;
  // 👇 GANTI KEY JADI 'privacy'
  privacy: PrivacySettings;
}

export interface DashboardSlide {
  id: string;
  title: string;
  desc: string;
  cta: string;
  link: string;
  icon: LucideIcon;
  theme: "blue" | "purple" | "orange"; // Batasin string biar sesuai tema css
}

export interface MilestoneData {
  icon: React.ElementType; // Ganti 'any' jadi ini biar lebih aman
  currentLevel: string;
  nextLevel: string;
  currentEarnings: number;
  nextTarget: number;
  currentBonus: number;
  nextBonus: number;
  progress: number;
  // Level styling from DB
  iconName?: string; // lucide icon name: "star", "shield", etc.
  iconColor?: string; // CSS class: "text-yellow-400"
  bgColor?: string; // CSS class: "bg-yellow-500/10"
  borderColor?: string; // CSS class: "border-yellow-500/30"
}

// ReferralStats is defined at line 83-89

export interface ReferralCardData {
  referralLink: string;
  totalUsers: number;
}

export interface TopPerformingLink {
  id: string;
  title: string;
  shortUrl: string;
  originalUrl: string;
  validViews: number;
  totalEarnings: number;
  cpm: number;
  adsLevel: AdLevel;
}

export type TimeRange = "perWeek" | "perMonth" | "perYear";

export type StatType = "totalEarnings" | "totalViews" | "totalReferral"; // totalClicks kita hapus aja biar konsisten sama opsi yg ada

export interface AnalyticsData {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
}

export interface MonthlyStat {
  month: string;
  year: number;
  views: number;
  cpm: number;
  earnings: number;
  level: string;
  growth: number;
}

export interface Shortlink {
  id: string;
  title: string;
  shortUrl: string;
  originalUrl: string;
  dateCreated: string;
  dateExpired?: string;
  validViews: number;
  totalEarning: number;
  totalClicks: number;
  averageCPM: number;
  adsLevel: AdLevel;
  passwordProtected: boolean;
  password?: string;
  status: "active" | "disabled";
}

// Tipe buat Filter & Sort
export type FilterByType =
  | "date"
  | "topLinks"
  | "dateExpired"
  | "validViews"
  | "totalEarning"
  | "avgCPM"
  | "linkEnabled"
  | "linkDisabled"
  | "linkPassword";

export type SortByType = "highest" | "lowest";

export interface HeaderStats {
  balance: number;
  payout: number;
  cpm: number;
}

export interface AdminHeaderStats {
  pendingWithdrawals: number;
  abuseReports: number;
  newUsers: number;
}

export interface AdminDashboardStats {
  financial: {
    paidToday: number;
    usersPaidToday: number;
    trend: number;
  };
  content: {
    linksCreatedToday: number;
    trend: number;
  };
}

export type UserStatus = "active" | "suspended" | "process";

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  status: UserStatus;
  joinedAt: string;
  lastLogin: string;
  stats: {
    totalLinks: number;
    totalViews: number;
    walletBalance: number;
    totalEarnings?: number;
    avgCpm?: number;
  };
}

export interface AdminUserStats {
  totalUsers: { count: number; trend: number };
  activeToday: { count: number; trend: number };
  suspendedUsers: { count: number; trend: number };
}

export interface LoginLog {
  id: string;
  ip: string;
  device: string;
  timestamp: string;
  location: string;
  status: "success" | "failed";
}

export interface RecentWithdrawal {
  id: string;
  user: {
    id: string; // Butuh ID buat link ke detail
    name: string;
    email: string;
    avatar?: string;
    level: string; // Buat badge level
  };
  amount: number;
  fee: number; // Admin fee
  method: string;
  accountName?: string; // Nama pemilik rekening
  accountNumber: string; // Tambahan info rekening
  status: "pending" | "approved" | "rejected" | "paid";
  date: string;
  transactionId: string; // WD-XXXXXX

  // 👇 FIELD BARU
  proofUrl?: string; // Link GDrive/Bukti
  rejectionReason?: string; // Alasan penolakan
  riskScore: "safe" | "medium" | "high"; // Fraud detection
  processedById?: string | number; // ID of admin who processed
  processedByName?: string | null; // Name of admin who processed
  // Currency info for admin to know exact local amount
  currency?: string; // User's currency (e.g., 'IDR', 'USD')
  localAmount?: number; // Amount in user's local currency
  exchangeRate?: number; // Exchange rate at time of withdrawal
}

export interface FraudInfo {
  ipAddress: string;
  device: string;
  location: string;
  riskScore: "safe" | "medium" | "high";
  riskFactors: string[];
}

export interface WithdrawalDetail extends RecentWithdrawal {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    level: string;
    walletBalance: number; // New
  };
  history: Transaction[];
  fraudInfo: FraudInfo;
  fee: number;
  netAmount: number;
}

// 👇 Filter Khusus Withdrawal
export interface AdminWithdrawalFilters {
  search?: string;
  status?: string; // pending, approved, paid, rejected
  sort?: string; // newest, oldest
  level?: string; // beginner, mythic, all
}

export interface AdminWithdrawalStats {
  paidToday: { amount: number; count: number };
  highestWithdrawal: { amount: number; user: string };
  totalUsersPaid: { count: number; trend: number };
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  avatar?: string; // Optional - might not be set
  joinedAt: string; // ISO Date
  status: UserStatus;
}

export interface UserMessage {
  id: string;
  subject: string;
  message: string;
  type: "warning" | "info";
  category: NotificationCategory;
  sentAt: string;
  isRead: boolean;
}

export interface UserDetailData extends AdminUser {
  phoneNumber: string;
  bio?: string;
  paymentMethods: SavedPaymentMethod[];
  withdrawalHistory: Transaction[];
  loginHistory: LoginLog[];
  messageHistory: UserMessage[];
}

// --- ADMIN LINK MANAGEMENT TYPES ---

export interface AdminLinkStats {
  totalLinks: number;
  newToday: number;
  disabledLinks: number;
  activeLinks: number;
}

// Update AdminLinkFilters
export interface AdminLinkFilters {
  search?: string;
  status?: string; // active, disabled, expired
  adsLevel?: string; // level1, level2, ... noAds
  sort?: string; // newest, oldest, most_views, least_views, most_earnings, least_earnings
  ownerType?: string; // all, guest, user
}

export type LinkStatus = "active" | "disabled" | "expired";

// Pastikan AdminLink punya field lengkap
export interface AdminLink {
  id: string;
  title?: string;
  shortUrl: string;
  originalUrl: string;
  alias?: string;
  owner: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    email: string;
  };
  views: number;
  validViews?: number; // Valid (non-fraudulent) views - optional
  earnings: number;
  createdAt: string;
  expiredAt?: string;
  status: LinkStatus;
  adsLevel: string; // "level1", "noAds", dll
  password?: string; // Link password (if set)
}

export interface MemberLinkFilters {
  search?: string;
  status?: string; // active, disabled, expired
  adsLevel?: string;
  sort?: string;
}

// 👇 TIPE DATA ABUSE REPORT
export type ReportStatus = "pending" | "resolved" | "ignored";
export type ReportReason = "phishing" | "spam" | "adult" | "scam" | "other";

export interface AbuseReport {
  id: string;
  targetLink: {
    id: string;
    shortUrl: string;
    originalUrl: string;
    owner: string; // Username pemilik link
  };
  reporter: {
    ip: string; // Biasanya pelapor itu anonim/guest
    name?: string; // Kalau user login
  };
  reason: ReportReason;
  description: string; // Pesan dari pelapor
  status: ReportStatus;
  date: string;
}

export interface AdminReportStats {
  pendingCount: number;
  resolvedToday: number;
  totalReports: number;
}

// --- ADMIN ANNOUNCEMENT TYPES ---

export interface AdminAnnouncement {
  id: string;
  title: string;
  desc: string;
  cta: string;
  link: string;
  icon: string; // Store icon name as string (e.g., "Sparkles")
  theme: "blue" | "purple" | "orange";
  status: "active" | "inactive" | "scheduled";
  createdAt: string;
  scheduledFor?: string; // ISO Date string for scheduled publication
}

export interface AdminAnnouncementStats {
  activeCount: number;
  totalCount: number;
  scheduledCount: number;
}

// --- SUPER ADMIN TYPES ---

// 👇 UPDATE: Super Admin Stats
export interface SuperAdminStats {
  financial: {
    paidToday: number; // Total uang keluar hari ini
    usersPaidToday: number; // Jumlah user yang dibayar
    trend: number; // Persentase vs kemarin
    pendingTotal: number; // Total pending payments (All Time)
  };
  security: {
    blockedLinksToday: number; // Link yang kena ban hari ini
    trend: number;
  };
  system: {
    staffOnline: number; // Jumlah admin aktif
    totalStaff: number; // Total admin terdaftar
  };
}
