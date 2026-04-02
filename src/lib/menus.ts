import {
  LayoutDashboard,
  Users,
  Link as LinkIcon,
  Wallet,
  ShieldAlert,
  FileText,
  Megaphone,
  Settings,
  LineChart,
  UserCog,
  ClipboardList,
  Database,
  Link2,
  PlusSquare,
  ChartSpline,
  UserPlus2,
  BanknoteArrowDown,
  History,
  Crown,
  DollarSign,
  Group,
  BookOpen,
} from "lucide-react";
import type { Role, NavItem } from "@/types/type";

// === MENU MEMBER (Gak berubah) ===
export const getMemberMenu = (t: any): NavItem[] => [
  { icon: LayoutDashboard, label: t("title"), href: "/dashboard" },
  { icon: Megaphone, label: t("adsInfo"), href: "/ads-info" },
  {
    icon: Link2,
    label: t("myLinks"),
    children: [
      { icon: PlusSquare, label: t("createLink"), href: "/new-link" },
      { icon: Link2, label: t("subs4unlock"), href: "https://subs4unlock.id" },
    ],
  },
  { icon: ChartSpline, label: t("analytics"), href: "/analytics" },
  { icon: Crown, label: "Rank", href: "/levels" },
  { icon: UserPlus2, label: t("referral"), href: "/referral" },
  { icon: BanknoteArrowDown, label: t("withdrawal"), href: "/withdrawal" },
  { icon: BookOpen, label: t("tutorial"), href: "/tutorial" },
  // { icon: History, label: t("history"), href: "/history" },
];

// === MENU ADMIN & SUPER ADMIN (REVISI FIX) ===
export const getAdminMenu = (role: Role = "admin"): NavItem[] => {
  // 1. OPERATIONAL (Menu Staff Harian)
  // Ads Configuration HILANG dari sini
  const operationalMenu: NavItem[] = [
    { label: "OPERATIONAL", isHeader: true },
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    // { icon: Users, label: "Manage Users", href: "/admin/users" },
    { icon: LinkIcon, label: "Manage Links", href: "/admin/links" },
    {
      icon: Wallet,
      label: "Withdrawals",
      href: "/admin/withdrawals",
    },
    // { icon: ShieldAlert, label: "Abuse Reports", href: "/admin/reports" },
    // {
    //   icon: FileText,
    //   label: "Announcements",
    //   href: "/admin/announcements",
    // },
  ];

  // 2. CORE SYSTEM (Menu Owner / Super Admin)
  // Ads Configuration PINDAH kesini
  const coreSystemMenu: NavItem[] = [
    { label: "CORE SYSTEM", isHeader: true },
    {
      icon: LineChart,
      label: "Analytics",
      href: "/super-admin/analytics",
    },
    // {
    //   icon: DollarSign,
    //   label: "Revenue",
    //   href: "/super-admin/revenue",
    // },
    {
      icon: Megaphone,
      label: "Ads Configuration",
      href: "/super-admin/ads-levels",
    }, // <--- PINDAH SINI
    {
      icon: UserCog,
      label: "Manage Admins",
      href: "/super-admin/manage-admins",
    },
    {
      icon: Crown,
      label: "Manage Levels",
      href: "/super-admin/manage-levels",
    },
    {
      icon: Database,
      label: "Backup Data",
      href: "/super-admin/backup",
    },
    // {
    //   icon: ClipboardList,
    //   label: "Audit Logs",
    //   href: "/super-admin/audit-logs",
    // },
  ];

  // LOGIC PENGGABUNGAN:
  if (role === "super-admin") {
    // Super Admin punya route SENDIRI untuk operational
    const superAdminOperationalMenu: NavItem[] = [
      { label: "OPERATIONAL", isHeader: true },
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/super-admin/dashboard",
      },
      { icon: Users, label: "Manage Users", href: "/super-admin/manage-user" }, // Folder udah ada
      { icon: LinkIcon, label: "Manage Links", href: "/super-admin/links" },
      {
        icon: Wallet,
        label: "Withdrawals",
        href: "/super-admin/withdrawals",
      },
      {
        icon: ShieldAlert,
        label: "Abuse Reports",
        href: "/super-admin/reports",
      },
      // {
      //   icon: FileText,
      //   label: "Announcements",
      //   href: "/super-admin/announcements",
      // },
    ];

    // Super Admin = Operational (Special Routes) + Core System
    return [...superAdminOperationalMenu, ...coreSystemMenu];
  }

  // Admin Biasa = Operational (Admin Routes) -> GAK ADA Core System
  return [...operationalMenu];
};
