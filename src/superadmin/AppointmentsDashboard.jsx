import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
} from "recharts";
import {
    CalendarDays,
    CheckCircle,
    Clock3,
    XCircle,
    TrendingUp,
    Monitor,
    MapPin,
    Timer,
} from "lucide-react";

// ─── Theme ───────────────────────────────────────────────
const BRAND = "#3C3A86";
const BRAND_LIGHT = "#EEEDFE";
const GRAY = "#6B7280";
const WHITE = "#ffffff";

const COLORS = [
    "#3C3A86",
    "#10B981",
    "#EF4444",
    "#F59E0B",
    "#06B6D4",
    "#8B5CF6",
];

const STATUS_COLORS = {
    completed: "#10B981",
    planned: "#3C3A86",
    cancelled: "#EF4444",
    pending: "#F59E0B",
    rescheduled: "#8B5CF6",
};

const getStatusColor = (name, index) => {
    const key = String(name || "").toLowerCase();
    return STATUS_COLORS[key] || COLORS[index % COLORS.length];
};

// ─── Card meta ───────────────────────────────────────────
const CARD_META = {
    "Total Appointments": {
        icon: CalendarDays,
        bg: "#EEF2FF",
        color: "#4338CA",
    },
    Completed: { icon: CheckCircle, bg: "#ECFDF5", color: "#059669" },
    Planned: { icon: Clock3, bg: "#EEF2FF", color: "#4338CA" },
    Cancelled: { icon: XCircle, bg: "#FEF2F2", color: "#DC2626" },
    "Completion Rate": { icon: TrendingUp, bg: "#F5F3FF", color: "#7C3AED" },
    "Online Lessons": { icon: Monitor, bg: "#ECFEFF", color: "#0891B2" },
    "Offline Lessons": { icon: MapPin, bg: "#FFF7ED", color: "#EA580C" },
    "Avg Lesson Duration": { icon: Timer, bg: "#ECFDF5", color: "#059669" },
};

// ─── Reusable Components ─────────────────────────────────
const SectionCard = ({ title, subtitle, children, className = "" }) => (
    <div
        className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}
    >
        {title && (
            <div className="flex items-center gap-2 mb-4">
                <div
                    style={{
                        width: 4,
                        height: 20,
                        borderRadius: 2,
                        background: BRAND,
                    }}
                />
                <div>
                    <h3 className="font-semibold text-gray-800 text-base leading-tight">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-xs mt-0.5" style={{ color: GRAY }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        )}
        {children}
    </div>
);

const StatCard = ({ title, value }) => {
    const meta = CARD_META[title] || {
        icon: CalendarDays,
        bg: "#F3F4F6",
        color: GRAY,
    };
    const Icon = meta.icon;
    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-all"
            style={{ boxShadow: "0 1px 6px rgba(60,58,134,0.07)" }}
        >
            <div className="flex items-center justify-between">
                <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: GRAY }}
                >
                    {title}
                </span>
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: meta.bg }}
                >
                    <Icon size={20} strokeWidth={2.2} color={meta.color} />
                </div>
            </div>
            <div className="text-xl font-bold" style={{ color: meta.color }}>
                {value ?? "—"}
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    background: WHITE,
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    padding: "8px 14px",
                    fontSize: 13,
                    color: "#1F2937",
                    boxShadow: "0 4px 16px rgba(60,58,134,0.10)",
                }}
            >
                <p className="text-xs text-gray-500 mb-1">
                    {label ?? payload[0]?.payload?.name}
                </p>
                <p className="font-semibold" style={{ color: BRAND }}>
                    {payload[0].value?.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

const StatusBadge = ({ status }) => {
    const color = getStatusColor(status, 0);
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ background: `${color}1A`, color }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: color }}
            />
            {status}
        </span>
    );
};

const EmptyState = ({ text = "No data available" }) => (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <svg
            width="40"
            height="40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="mb-2 opacity-40"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
        </svg>
        <span className="text-sm">{text}</span>
    </div>
);

// ─── Main Component ──────────────────────────────────────
const AppointmentsDashboard = () => {
    const [activeTab, setActiveTab] = useState("JLT");
    const [loading, setLoading] = useState(false);
    const [dashboard, setDashboard] = useState(null);

    const fetchDashboard = async (branch) => {
        try {
            setLoading(true);
            const branchId = branch === "JLT" ? "1017" : "28866";
            const { data } = await axios.get(
                `https://api.frwrdtutors.com/api/admin/dashboardAppointmentsBranch${branchId}`,
            );
            setDashboard(data);
            setActiveTab(branch);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard("JLT");
    }, []);

    // ── Derived data ──
    const statusData = dashboard
        ? [
              {
                  name: "Completed",
                  value: dashboard.overview?.completedLessons || 0,
              },
              {
                  name: "Planned",
                  value: dashboard.overview?.plannedLessons || 0,
              },
              {
                  name: "Cancelled",
                  value: dashboard.overview?.cancelledLessons || 0,
              },
          ]
        : [];

    const topicData = dashboard
        ? Object.entries(dashboard.lessonTopics || {})
              .map(([name, value]) => ({ name, value }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 15)
        : [];

    const allTopics = dashboard
        ? Object.entries(dashboard.lessonTopics || {}).sort(
              (a, b) => b[1] - a[1],
          )
        : [];

    const monthlyTrendData = dashboard
        ? Object.entries(dashboard.monthlyLessonsTrend || {}).map(
              ([month, value]) => ({ month, value }),
          )
        : [];

    const cards = dashboard
        ? [
              {
                  title: "Total Appointments",
                  value: dashboard.overview?.totalAppointments,
              },
              {
                  title: "Completed",
                  value: dashboard.overview?.completedLessons,
              },
              { title: "Planned", value: dashboard.overview?.plannedLessons },
              {
                  title: "Cancelled",
                  value: dashboard.overview?.cancelledLessons,
              },
              {
                  title: "Completion Rate",
                  value:
                      dashboard.overview?.completionRate != null
                          ? `${dashboard.overview.completionRate}%`
                          : "—",
              },
              {
                  title: "Online Lessons",
                  value: dashboard.overview?.onlineLessons,
              },
              {
                  title: "Offline Lessons",
                  value: dashboard.overview?.offlineLessons,
              },
              {
                  title: "Avg Lesson Duration",
                  value: `${dashboard.overview?.averageLessonDuration ?? 0} Hrs`,
              },
          ]
        : [];

    return (
        <div className="flex min-h-screen" style={{ background: "#F8F8FC" }}>
            <Sidebar />
            <div className="flex-1 min-w-0">
                <Navbar />
                <div className="px-6 py-5">
                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <p
                                className="text-xs font-medium uppercase tracking-widest mb-1"
                                style={{ color: GRAY }}
                            >
                                Appointments Overview
                            </p>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {activeTab} — Appointments Dashboard
                            </h1>
                        </div>
                        <div
                            className="flex p-1 rounded-xl"
                            style={{
                                background: BRAND_LIGHT,
                                border: "1px solid #CECBF6",
                            }}
                        >
                            {["JLT", "MTC"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => fetchDashboard(tab)}
                                    className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                                    style={
                                        activeTab === tab
                                            ? {
                                                  background: BRAND,
                                                  color: WHITE,
                                                  boxShadow:
                                                      "0 2px 8px rgba(60,58,134,0.25)",
                                              }
                                            : {
                                                  background: "transparent",
                                                  color: BRAND,
                                              }
                                    }
                                >
                                    {tab} Branch
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Data Range Info Banner ── */}
                    {/* <div
                        className="rounded-2xl border border-blue-100 p-4 mb-6"
                        style={{ background: "#EFF6FF" }}
                    >
                        <p className="text-sm font-semibold text-blue-800 mb-1">
                            Dashboard Data Range
                        </p>
                        <p className="text-xs text-blue-700">
                            Data is limited to{" "}
                            <strong>
                                Past 3 months ← Today → Next 3 months
                            </strong>{" "}
                            to optimize performance and avoid API rate limits.
                        </p>
                    </div> */}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <div
                                className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                                style={{
                                    borderColor: BRAND_LIGHT,
                                    borderTopColor: BRAND,
                                }}
                            />
                            <p className="text-sm" style={{ color: GRAY }}>
                                Loading appointments data…
                            </p>
                        </div>
                    ) : dashboard ? (
                        <>
                            {/* ── Stat Cards ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                                {cards.map((c, i) => (
                                    <StatCard
                                        key={i}
                                        title={c.title}
                                        value={c.value}
                                    />
                                ))}
                            </div>

                            {/* ── Row 1: Status Pie + Top 15 Topics Bar ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionCard
                                    title="Appointment Status"
                                    subtitle="Distribution across all statuses"
                                >
                                    {statusData.every((d) => d.value === 0) ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={statusData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    outerRadius={100}
                                                    innerRadius={50}
                                                    paddingAngle={3}
                                                    stroke={WHITE}
                                                    strokeWidth={2}
                                                >
                                                    {statusData.map(
                                                        (item, i) => (
                                                            <Cell
                                                                key={i}
                                                                fill={getStatusColor(
                                                                    item.name,
                                                                    i,
                                                                )}
                                                            />
                                                        ),
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                />
                                                <Legend
                                                    iconType="circle"
                                                    iconSize={8}
                                                    wrapperStyle={{
                                                        fontSize: 12,
                                                        color: GRAY,
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>

                                <SectionCard
                                    title="Top 15 Lesson Topics"
                                    subtitle="Ranked by total lessons booked"
                                >
                                    {topicData.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >
                                            <BarChart
                                                data={topicData}
                                                barSize={14}
                                                margin={{
                                                    top: 4,
                                                    right: 8,
                                                    bottom: 60,
                                                    left: 0,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#F3F4F6"
                                                    vertical={false}
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{
                                                        fontSize: 10,
                                                        fill: GRAY,
                                                    }}
                                                    angle={-35}
                                                    textAnchor="end"
                                                    interval={0}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: GRAY,
                                                    }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                    cursor={{ fill: "#F3F4F6" }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    fill={BRAND}
                                                    radius={[5, 5, 0, 0]}
                                                    maxBarSize={32}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>
                            </div>

                            {/* ── Row 2: Monthly Trend + Top 5 Topics Table ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionCard
                                    title="Monthly Lessons Trend"
                                    subtitle="Lessons trend by month"
                                >
                                    {monthlyTrendData.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >
                                            <BarChart
                                                data={monthlyTrendData}
                                                barSize={20}
                                                margin={{
                                                    top: 4,
                                                    right: 8,
                                                    bottom: 20,
                                                    left: 0,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#F3F4F6"
                                                    vertical={false}
                                                />
                                                <XAxis
                                                    dataKey="month"
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: GRAY,
                                                    }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: GRAY,
                                                    }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                    cursor={{ fill: "#F3F4F6" }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    name="Lessons"
                                                    fill={BRAND}
                                                    radius={[5, 5, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>

                                <SectionCard
                                    title="Top 5 Lesson Topics"
                                    subtitle="Ranked breakdown"
                                >
                                    {topicData.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr
                                                        style={{
                                                            borderBottom:
                                                                "1px solid #F3F4F6",
                                                        }}
                                                    >
                                                        {[
                                                            "Rank",
                                                            "Topic",
                                                            "Total Lessons",
                                                        ].map((h) => (
                                                            <th
                                                                key={h}
                                                                className="pb-3 text-left font-medium"
                                                                style={{
                                                                    color: GRAY,
                                                                    fontSize: 11,
                                                                    textTransform:
                                                                        "uppercase",
                                                                    letterSpacing:
                                                                        "0.05em",
                                                                }}
                                                            >
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {topicData
                                                        .slice(0, 5)
                                                        .map((item, i) => (
                                                            <tr
                                                                key={item.name}
                                                                style={{
                                                                    borderBottom:
                                                                        "1px solid #F9FAFB",
                                                                }}
                                                                className="hover:bg-gray-50 transition-colors"
                                                            >
                                                                <td className="py-3">
                                                                    <span
                                                                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
                                                                        style={{
                                                                            background:
                                                                                BRAND_LIGHT,
                                                                            color: BRAND,
                                                                        }}
                                                                    >
                                                                        {i + 1}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 font-medium text-gray-800">
                                                                    {item.name}
                                                                </td>
                                                                <td
                                                                    className="py-3 font-semibold"
                                                                    style={{
                                                                        color: BRAND,
                                                                    }}
                                                                >
                                                                    {item.value?.toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </SectionCard>
                            </div>

                            {/* ── Row 3: All Topics Table (full width, scrollable) ── */}
                            <SectionCard
                                title="All Lesson Topics"
                                subtitle={`${allTopics.length} topics total`}
                            >
                                {allTopics.length === 0 ? (
                                    <EmptyState />
                                ) : (
                                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-xl border border-gray-100">
                                        <table className="w-full text-sm">
                                            <thead
                                                className="sticky top-0 z-10"
                                                style={{ background: WHITE }}
                                            >
                                                <tr
                                                    style={{
                                                        borderBottom:
                                                            "2px solid #F3F4F6",
                                                    }}
                                                >
                                                    {[
                                                        "#",
                                                        "Topic",
                                                        "Lessons",
                                                    ].map((h) => (
                                                        <th
                                                            key={h}
                                                            className="px-4 py-3 text-left font-medium"
                                                            style={{
                                                                color: GRAY,
                                                                fontSize: 11,
                                                                textTransform:
                                                                    "uppercase",
                                                                letterSpacing:
                                                                    "0.05em",
                                                            }}
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allTopics.slice(0, 10).map(
                                                    ([topic, count], i) => (
                                                        <tr
                                                            key={topic}
                                                            style={{
                                                                borderBottom:
                                                                    "1px solid #F9FAFB",
                                                            }}
                                                            className="hover:bg-gray-50 transition-colors"
                                                        >
                                                            <td
                                                                className="px-4 py-2.5 text-xs font-mono"
                                                                style={{
                                                                    color: GRAY,
                                                                }}
                                                            >
                                                                {i + 1}
                                                            </td>
                                                            <td className="px-4 py-2.5 font-medium text-gray-800">
                                                                {topic}
                                                            </td>
                                                            <td
                                                                className="px-4 py-2.5 font-semibold"
                                                                style={{
                                                                    color: BRAND,
                                                                }}
                                                            >
                                                                {count?.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </SectionCard>
                        </>
                    ) : (
                        <EmptyState text="Failed to load data. Please try again." />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentsDashboard;
