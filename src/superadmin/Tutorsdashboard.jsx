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
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    LineChart,
    Line,
} from "recharts";
import {
    UserCheck,
    Clock3,
    UserX,
    UserPlus,
    Star,
    TrendingUp,
    CircleDollarSign,
    Percent,
    Users,
    BadgeCheck,
} from "lucide-react";

// ─── Theme ───────────────────────────────────────────────
const BRAND = "#5D4C29";
const BRAND_LIGHT = "#EEEDFE";
const GRAY = "#6B7280";
const WHITE = "#ffffff";
const COLORS = [
    "#5D4C29",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#8B5CF6",
];

// ─── Card meta ───────────────────────────────────────────
const CARD_META = {
    "Total Tutors": { icon: Users, bg: "#EEF2FF", color: "#5D4C29" },
    Approved: { icon: BadgeCheck, bg: "#ECFDF5", color: "#059669" },
    Pending: { icon: Clock3, bg: "#FFF7ED", color: "#EA580C" },
    Dormant: { icon: UserX, bg: "#F3F4F6", color: "#6B7280" },
    Rejected: { icon: UserX, bg: "#FEF2F2", color: "#DC2626" },
    "New Tutors This Month": {
        icon: UserPlus,
        bg: "#FFF7ED",
        color: "#EA580C",
    },
    "Active Tutor Rate": { icon: Percent, bg: "#F5F3FF", color: "#7C3AED" },
    "Avg Rating": { icon: Star, bg: "#FEFCE8", color: "#CA8A04" },
    "Total Revenue": {
        icon: CircleDollarSign,
        bg: "#ECFDF5",
        color: "#059669",
    },
    "Revenue / Tutor": { icon: TrendingUp, bg: "#ECFEFF", color: "#0891B2" },
};

// ─── Reusable Components ─────────────────────────────────
const SectionCard = ({ title, children, className = "" }) => (
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
                <h3 className="font-semibold text-gray-800 text-base">
                    {title}
                </h3>
            </div>
        )}
        {children}
    </div>
);

const StatCard = ({ title, value }) => {
    const meta = CARD_META[title] || {
        icon: TrendingUp,
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
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="font-semibold" style={{ color: BRAND }}>
                    {payload[0].value?.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
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
                d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2M9 17H7a2 2 0 01-2-2v-1a2 2 0 012-2h2m0 5h6m0 0h2a2 2 0 002-2v-1a2 2 0 00-2-2h-2"
            />
        </svg>
        <span className="text-sm">{text}</span>
    </div>
);

const StatusBadge = ({ status }) => {
    const map = {
        approved: { bg: "#ECFDF5", color: "#059669" },
        pending: { bg: "#FFFBEB", color: "#D97706" },
        rejected: { bg: "#FEF2F2", color: "#DC2626" },
        dormant: { bg: "#F3F4F6", color: "#6B7280" },
    };
    const s = map[status?.toLowerCase()] || { bg: "#F3F4F6", color: "#6B7280" };
    return (
        <span
            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ background: s.bg, color: s.color }}
        >
            {status}
        </span>
    );
};

// ─── Main Component ──────────────────────────────────────
const TutorsDashboard = () => {
    const [activeTab, setActiveTab] = useState("JLT");
    const [loading, setLoading] = useState(false);
    const [dashboard, setDashboard] = useState(null);

    const fetchDashboard = async (branch) => {
        try {
            setLoading(true);
            const branchId = branch === "JLT" ? "1017" : "28866";
            const { data } = await axios.get(
                `https://api.frwrdtutors.com/api/admin/dashboardTutorsBranch${branchId}`,
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
        ? Object.entries(dashboard.statusDistribution || {}).map(
              ([name, value]) => ({ name, value }),
          )
        : [];

    const countryData = dashboard
        ? Object.entries(dashboard.countryDistribution || {}).map(
              ([name, value]) => ({ name, value }),
          )
        : [];

   const subjectData = dashboard
    ? Object.entries(dashboard.subjectDistribution || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({
              name,
              count,
          }))
    : [];

    const qualificationData = dashboard
    ? Object.entries(dashboard.qualificationDistribution || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({
              name,
              count,
          }))
    : [];

   const monthlyTrendData = dashboard
    ? Object.entries(dashboard.monthlyTutorTrend || {})
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-12)
          .map(([month, count]) => ({
              month,
              count,
          }))
    : [];

    const topTutors = dashboard?.topTutors || [];
    const topRatedTutors = dashboard?.topRatedTutors || [];

    const cards = dashboard
        ? [
              { title: "Total Tutors", value: dashboard.overview?.totalTutors },
              { title: "Approved", value: dashboard.overview?.approvedTutors },
              { title: "Pending", value: dashboard.overview?.pendingTutors },
              { title: "Dormant", value: dashboard.overview?.dormantTutors },
              { title: "Rejected", value: dashboard.overview?.rejectedTutors },
              {
                  title: "New Tutors This Month",
                  value: dashboard.overview?.newTutorsThisMonth,
              },
              {
                  title: "Active Tutor Rate",
                  value: `${dashboard.overview?.activeTutorRate ?? 0}%`,
              },
              { title: "Avg Rating", value: dashboard.overview?.averageRating },
              {
                  title: "Total Revenue",
                  value: `AED ${Number(dashboard.overview?.totalRevenue || 0).toLocaleString()}`,
              },
              {
                  title: "Revenue / Tutor",
                  value: `AED ${Number(dashboard.overview?.averageRevenuePerTutor || 0).toLocaleString()}`,
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
                                Tutors Overview
                            </p>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {activeTab} — Tutors Dashboard
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
                                Loading tutors data…
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

                            {/* ── Row 1: Status + Country Pie ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionCard title="Tutor Status Distribution">
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
                                                    label={({
                                                        name,
                                                        percent,
                                                    }) =>
                                                        `${name} ${(percent * 100).toFixed(0)}%`
                                                    }
                                                    labelLine={false}
                                                >
                                                    {statusData.map((_, i) => (
                                                        <Cell
                                                            key={i}
                                                            fill={
                                                                COLORS[
                                                                    i %
                                                                        COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    ))}
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

                                <SectionCard title="Country Distribution">
                                    {countryData.every((d) => d.value === 0) ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={countryData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    outerRadius={100}
                                                    innerRadius={50}
                                                    paddingAngle={3}
                                                    label={({
                                                        name,
                                                        percent,
                                                    }) =>
                                                        `${name} ${(percent * 100).toFixed(0)}%`
                                                    }
                                                    labelLine={false}
                                                >
                                                    {countryData.map((_, i) => (
                                                        <Cell
                                                            key={i}
                                                            fill={
                                                                COLORS[
                                                                    i %
                                                                        COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    ))}
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
                            </div>

                            {/* ── Row 2: Subject + Qualification Bar ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionCard title="Subject Distribution Top 10">
                                    {subjectData.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >
                                            <BarChart
                                                data={subjectData}
                                                barSize={16}
                                                margin={{
                                                    top: 4,
                                                    right: 8,
                                                    bottom: 40,
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
                                                    angle={-30}
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
                                                    dataKey="count"
                                                    fill={BRAND}
                                                    radius={[5, 5, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>

                                <SectionCard title="Qualification Distribution Top 10">
                                    {qualificationData.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >
                                            <BarChart
                                                data={qualificationData}
                                                barSize={16}
                                                margin={{
                                                    top: 4,
                                                    right: 8,
                                                    bottom: 40,
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
                                                    angle={-30}
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
                                                    dataKey="count"
                                                    fill="#10B981"
                                                    radius={[5, 5, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>
                            </div>

                            {/* ── Row 3: Monthly Trend ── */}
                            <SectionCard
                                title="Monthly Tutor Trend"
                                className="mb-5"
                            >
                                {monthlyTrendData.length === 0 ? (
                                    <EmptyState />
                                ) : (
                                    <ResponsiveContainer
                                        width="100%"
                                        height={280}
                                    >
                                        <LineChart data={monthlyTrendData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#F3F4F6"
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
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke={BRAND}
                                                strokeWidth={2.5}
                                                dot={{ r: 3, fill: BRAND }}
                                                activeDot={{ r: 5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </SectionCard>

                            {/* ── Row 4: Top Rated Tutors Table ── */}
                            <SectionCard
                                title="Top Rated Tutors"
                                className="mb-5"
                            >
                                {topRatedTutors.length === 0 ? (
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
                                                        "Name",
                                                        "Email",
                                                        "Rating",
                                                        "Status",
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
                                                {topRatedTutors.map((tutor) => (
                                                    <tr
                                                        key={tutor.id}
                                                        style={{
                                                            borderBottom:
                                                                "1px solid #F9FAFB",
                                                        }}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="py-2.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div
                                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                                    style={{
                                                                        background:
                                                                            BRAND,
                                                                    }}
                                                                >
                                                                    {tutor.name
                                                                        ?.charAt(
                                                                            0,
                                                                        )
                                                                        ?.toUpperCase() ||
                                                                        "T"}
                                                                </div>
                                                                <span className="font-medium text-gray-800">
                                                                    {tutor.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 text-gray-500">
                                                            {tutor.email || "—"}
                                                        </td>
                                                        <td className="py-2.5">
                                                            <span className="flex items-center gap-1 font-semibold text-amber-500">
                                                                <Star size={16} />{" "}
                                                                {tutor.rating}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5">
                                                            <StatusBadge
                                                                status={
                                                                    tutor.status
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </SectionCard>

                            {/* ── Row 5: Top Tutors by Revenue ── */}
                            <SectionCard title="Top Tutors by Revenue">
                                {topTutors.length === 0 ? (
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
                                                        "Name",
                                                        "Email",
                                                        "Rating",
                                                        "Revenue",
                                                        "Status",
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
                                                {topTutors.map((tutor) => (
                                                    <tr
                                                        key={tutor.id}
                                                        style={{
                                                            borderBottom:
                                                                "1px solid #F9FAFB",
                                                        }}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="py-2.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div
                                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                                    style={{
                                                                        background:
                                                                            "#10B981",
                                                                    }}
                                                                >
                                                                    {tutor.name
                                                                        ?.charAt(
                                                                            0,
                                                                        )
                                                                        ?.toUpperCase() ||
                                                                        "T"}
                                                                </div>
                                                                <span className="font-medium text-gray-800">
                                                                    {tutor.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 text-gray-500">
                                                            {tutor.email || "—"}
                                                        </td>
                                                        <td className="py-2.5">
                                                            <span className="flex items-center gap-1 font-semibold text-amber-500">
                                                                <Star size={16} />{" "}
                                                                {tutor.rating}
                                                            </span>
                                                        </td>
                                                        <td
                                                            className="py-2.5 font-semibold"
                                                            style={{
                                                                color: BRAND,
                                                            }}
                                                        >
                                                            AED{" "}
                                                            {Number(
                                                                tutor.revenue,
                                                            ).toLocaleString()}
                                                        </td>
                                                        <td className="py-2.5">
                                                            <StatusBadge
                                                                status={
                                                                    tutor.status
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
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

export default TutorsDashboard;
