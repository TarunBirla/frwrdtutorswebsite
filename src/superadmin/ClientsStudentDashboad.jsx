import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import {
  Users,
  BookOpen,
  GraduationCap,
  Receipt,
  Wallet,
  Briefcase,
  ChevronRight,
  Calendar,
  Clock,
  ArrowRight,
  FileText,
  Star,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

// ─── Theme ─────────────────────────────────────────────────────────
const BRAND = "#3C3A86";
const BRAND_LIGHT = "#EEEDFE";
const BRAND_MID = "#CECBF6";
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#FAF3E0";
const WHITE = "#FFFFFF";
const GRAY = "#6B7280";
const BG = "#F4F4FB";

const PIE_COLORS = ["#22C55E", "#F59E0B", "#EF4444", "#94A3B8"];

// ─── Reusable ───────────────────────────────────────────────────────
const Card = ({ children, className = "", style = {} }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 ${className}`}
    style={{ boxShadow: "0 1px 8px rgba(60,58,134,0.07)", ...style }}
  >
    {children}
  </div>
);

const SectionHeader = ({ title, action, actionLabel = "View All →" }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2">
      <div
        style={{ width: 4, height: 20, borderRadius: 2, background: BRAND }}
      />
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    </div>
    {action && (
      <button
        onClick={action}
        className="text-sm font-semibold flex items-center gap-1 hover:opacity-75 transition-opacity"
        style={{ color: BRAND }}
      >
        {actionLabel} <ArrowRight size={14} />
      </button>
    )}
  </div>
);

const EmptyState = ({ text = "No data available" }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
      style={{ background: BRAND_LIGHT }}
    >
      <FileText size={20} color={BRAND} />
    </div>
    <p className="text-sm">{text}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    paid: { bg: "#ECFDF5", color: "#059669" },
    unpaid: { bg: "#FEF2F2", color: "#DC2626" },
    overdue: { bg: "#FFF7ED", color: "#EA580C" },
    active: { bg: "#ECFDF5", color: "#059669" },
    planned: { bg: "#EEF2FF", color: "#4338CA" },
  };
  const s = (status || "").toLowerCase();
  const style = map[s] || { bg: "#F3F4F6", color: GRAY };
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ background: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: WHITE,
          border: "1px solid #E5E7EB",
          borderRadius: 10,
          padding: "8px 14px",
          fontSize: 13,
          boxShadow: "0 4px 16px rgba(60,58,134,0.10)",
        }}
      >
        <p className="font-semibold" style={{ color: BRAND }}>
          {payload[0].name}: AED {Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// ─── Stat Card ──────────────────────────────────────────────────────
const CARD_META = {
  Students: { bg: "#EEF2FF", color: BRAND, icon: Users },
  Tutors: { bg: "#ECFDF5", color: "#059669", icon: GraduationCap },
  Lessons: { bg: "#FFF7ED", color: "#EA580C", icon: BookOpen },
  Invoices: { bg: "#F0F9FF", color: "#0284C7", icon: Receipt },
  Payments: { bg: "#F0FDF4", color: "#16A34A", icon: Wallet },
  Outstanding: { bg: "#FEF2F2", color: "#DC2626", icon: Briefcase },
};

const StatCard = ({ title, value }) => {
  const meta = CARD_META[title] || {
    bg: BRAND_LIGHT,
    color: BRAND,
    icon: Briefcase,
  };
  const Icon = meta.icon;
  return (
    <Card className="p-5 hover:shadow-md transition-all duration-200 cursor-pointer group">
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-3"
            style={{ color: GRAY }}
          >
            {title}
          </p>
          <p className="text-2xl font-bold" style={{ color: meta.color }}>
            {value}
          </p>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
          group-hover:scale-110 transition-transform duration-200"
          style={{ background: meta.bg }}
        >
          <Icon size={20} color={meta.color} strokeWidth={2.2} />
        </div>
      </div>
    </Card>
  );
};

// ─── Main ────────────────────────────────────────────────────────────
const ClientsStudentDashboard = () => {
  const { state } = useLocation();
  const clientId = state?.clientId;
  const branchId = state?.branchId;

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientId) fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const url =
        branchId === 1017
          ? `https://api.frwrdtutors.com/api/admin/client-dashboard1017/${clientId}`
          : `https://api.frwrdtutors.com/api/admin/client-dashboard28866/${clientId}`;
      const { data } = await axios.get(url);
      setDashboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ background: BG }}>
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
            <div
              className="w-10 h-10 rounded-full border-4 animate-spin"
              style={{ borderColor: BRAND_LIGHT, borderTopColor: BRAND }}
            />
            <p className="text-sm" style={{ color: GRAY }}>
              Loading dashboard…
            </p>
          </div>
        </div>
      </div>
    );
  }

  const overview = dashboard?.overview || {};
  const client = dashboard?.client || {};

  const rawData = (() => {
    try {
      return typeof client.raw_data === "string"
        ? JSON.parse(client.raw_data)
        : client.raw_data || {};
    } catch {
      return {};
    }
  })();
  const photo = rawData.photo || client.photo || null;

  const cards = [
    { title: "Students", value: overview.students || 0 },
    { title: "Tutors", value: overview.tutors || 0 },
    { title: "Lessons", value: overview.lessons || 0 },
    { title: "Invoices", value: overview.invoices || 0 },
    {
      title: "Payments",
      value: `AED ${Number(overview.payments || 0).toLocaleString()}`,
    },
    {
      title: "Outstanding",
      value: `AED ${Number(overview.invoiceBalance || 0).toLocaleString()}`,
    },
  ];

  const paymentData = [
    { name: "Paid", value: dashboard?.paymentOverview?.paid || 0 },
    {
      name: "Outstanding",
      value: dashboard?.paymentOverview?.outstanding || 0,
    },
  ];

  const hasPaymentData = paymentData.some((d) => d.value > 0);

  const students = dashboard?.students || [];
  const tutors = dashboard?.tutors || [];
  const upcomingLessons = dashboard?.upcomingLessons || [];
  const recentInvoices = dashboard?.recentInvoices || [];
  const contracts = dashboard?.contracts || [];

  return (
    <div className="flex min-h-screen" style={{ background: BG }}>
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar />

        <div className="px-6 py-5 space-y-5">
          {/* ── Welcome Header ── */}
          <Card className="p-0 overflow-hidden">
            <div
              className="flex items-center justify-between p-6"
              style={{
                background: `linear-gradient(135deg, ${BRAND} 0%, #5A58B8 100%)`,
              }}
            >
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img
                    src={`https://ui-avatars.com/api/?name=${client.first_name}+${client.last_name}&background=EEEDFE&color=3C3A86&size=80`}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20"
                    alt=""
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
                    style={{ background: "#22C55E" }}
                  />
                </div>
                <div>
                  <p className="text-white/60 text-sm font-medium mb-1">
                    Welcome back,
                  </p>
                  <h1 className="text-3xl font-bold text-white">
                    {client.first_name} {client.last_name}
                  </h1>
                  <p className="text-white/60 text-sm mt-1">
                    Here's an overview of your tuition journey.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div
              className="grid grid-cols-3 divide-x divide-gray-100"
              style={{ borderTop: "1px solid #F3F4F6" }}
            >
              {[
                {
                  label: "Total Lessons",
                  value: overview.lessons || 0,
                  sub: `${overview.upcomingLessons || 0} upcoming`,
                },
                {
                  label: "Total Invoices",
                  value: overview.invoices || 0,
                  sub: "all time",
                },
                {
                  label: "Total Paid",
                  value: `AED ${Number(overview.payments || 0).toLocaleString()}`,
                  sub: "lifetime payments",
                },
              ].map((s, i) => (
                <div key={i} className="p-4 text-center">
                  <p className="text-lg font-bold" style={{ color: BRAND }}>
                    {s.value}
                  </p>
                  <p className="text-xs font-medium text-gray-700">{s.label}</p>
                  <p className="text-xs text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.map((c, i) => (
              <StatCard key={i} title={c.title} value={c.value} />
            ))}
          </div>

          {/* ── Row 1: Students + Upcoming Lessons ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Students */}
            <Card className="p-6">
              <SectionHeader title="Students" />
              {students.length === 0 ? (
                <EmptyState text="No students found" />
              ) : (
                <div className="space-y-1">
                  {students.map((student) => {
                    const sp = (() => {
                      try {
                        return typeof student.raw_data === "string"
                          ? JSON.parse(student.raw_data)
                          : student.raw_data || {};
                      } catch {
                        return {};
                      }
                    })();
                    const sPhoto = sp.photo || student.photo;
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://ui-avatars.com/api/?name=${student.first_name}+${student.last_name}&background=EEEDFE&color=3C3A86`}
                            className="w-12 h-12 rounded-xl object-cover"
                            alt=""
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {student.academic_year || "N/A"}
                            </p>
                            {student.email && (
                              <p className="text-xs text-gray-400">
                                {student.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status="Active" />
                          <ChevronRight
                            size={16}
                            color={GRAY}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Upcoming Lessons */}
            <Card className="p-6">
              <SectionHeader
                title="Upcoming Lessons"
                actionLabel="View Calendar →"
              />
              {upcomingLessons.length === 0 ? (
                <EmptyState text="No upcoming lessons" />
              ) : (
                <div className="space-y-3">
                  {upcomingLessons.map((lesson) => {
                    const date = new Date(lesson.start_time);
                    const finish = new Date(lesson.finish_time);
                    const rcras = (() => {
                      try {
                        return typeof lesson.rcras === "string"
                          ? JSON.parse(lesson.rcras)
                          : lesson.rcras || [];
                      } catch {
                        return [];
                      }
                    })();
                    const cjas = (() => {
                      try {
                        return typeof lesson.cjas === "string"
                          ? JSON.parse(lesson.cjas)
                          : lesson.cjas || [];
                      } catch {
                        return [];
                      }
                    })();
                    const studentName = rcras[0]?.recipient_name || "—";
                    const tutorName = cjas[0]?.name || "—";
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                      >
                        {/* Date block */}
                        <div
                          className="flex-shrink-0 w-12 text-center rounded-xl py-2"
                          style={{ background: BRAND_LIGHT }}
                        >
                          <p
                            className="text-xs font-semibold uppercase"
                            style={{ color: BRAND }}
                          >
                            {date.toLocaleString("default", { month: "short" })}
                          </p>
                          <p
                            className="text-xl font-bold"
                            style={{ color: BRAND }}
                          >
                            {date.getDate()}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {lesson.topic || "Lesson"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Student: {studentName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Tutor: {tutorName}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="flex items-center gap-1 justify-end text-xs text-gray-500">
                            <Clock size={11} />
                            {date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            –{" "}
                            {finish.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <StatusBadge status={lesson.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* ── Recent Invoices ── */}
          <Card className="p-6">
            <SectionHeader title="Recent Invoices" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {[
                      "Invoice #",
                      "Description",
                      "Amount",
                      "Status",
                      "Date Sent",
                    ].map((h) => (
                      <th
                        key={h}
                        className="pb-3 text-left font-medium pr-4"
                        style={{
                          color: GRAY,
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState text="No invoices found" />
                      </td>
                    </tr>
                  ) : (
                    recentInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-gray-50 transition-colors"
                        style={{ borderBottom: "1px solid #F9FAFB" }}
                      >
                        <td className="py-3 pr-4">
                          <span
                            className="font-semibold"
                            style={{ color: BRAND }}
                          >
                            {inv.display_id}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-600 max-w-[200px] truncate">
                          {inv.description || "—"}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-gray-800">
                          AED {Number(inv.amount).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {inv.date_sent
                            ? new Date(inv.date_sent).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                },
                              )
                            : "—"}
                        </td>
                        {/* <td className="py-3">
                        {inv.pdf_url ? (
                          <a href={inv.pdf_url} target="_blank" rel="noreferrer"
                            className="text-xs font-semibold flex items-center gap-1 hover:opacity-75"
                            style={{ color: BRAND }}>
                            <FileText size={13} /> PDF
                          </a>
                        ) : "—"}
                      </td> */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ── Payment Overview + Active Tutors ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Payment Overview */}
            <Card className="p-6">
              <SectionHeader
                title="Payment Overview"
                actionLabel="View Payments →"
              />
              {!hasPaymentData ? (
                <EmptyState text="No payment data" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={paymentData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={3}
                      >
                        {paymentData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12, color: GRAY }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    className="mt-4 rounded-xl p-4 flex justify-between items-center"
                    style={{
                      background: BRAND_LIGHT,
                      border: `1px solid ${BRAND_MID}`,
                    }}
                  >
                    <span className="font-semibold text-gray-700">
                      Total Outstanding
                    </span>
                    <span
                      className="font-bold text-xl"
                      style={{ color: BRAND }}
                    >
                      AED{" "}
                      {Number(
                        dashboard?.paymentOverview?.outstanding ||
                          overview.invoiceBalance ||
                          0,
                      ).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </Card>

            {/* Active Tutors */}
            <Card className="p-6">
              <SectionHeader
                title="Active Tutors"
                actionLabel="View Tutors →"
              />
              {tutors.length === 0 ? (
                <EmptyState text="No tutors found" />
              ) : (
                <div className="space-y-1">
                  {tutors.map((tutor) => {
                    const tp = (() => {
                      try {
                        return typeof tutor.raw_data === "string"
                          ? JSON.parse(tutor.raw_data)
                          : tutor.raw_data || {};
                      } catch {
                        return {};
                      }
                    })();
                    const tPhoto = tp.photo || tutor.photo;
                    const rating = tp.review_rating || tutor.review_rating;
                    return (
                      <div
                        key={tutor.id}
                        className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://ui-avatars.com/api/?name=${tutor.first_name}+${tutor.last_name}&background=ECFDF5&color=059669`}
                            className="w-12 h-12 rounded-xl object-cover"
                            alt=""
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {tutor.first_name} {tutor.last_name}
                            </p>
                            {rating && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Star size={11} fill={GOLD} color={GOLD} />
                                <span className="text-xs text-gray-500">
                                  {rating}
                                </span>
                              </div>
                            )}
                            {tutor.email && (
                              <p className="text-xs text-gray-400">
                                {tutor.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status="Active" />
                          <ChevronRight
                            size={16}
                            color={GRAY}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsStudentDashboard;
