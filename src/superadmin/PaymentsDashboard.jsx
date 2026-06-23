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
    Landmark,
    CheckCircle,
    Timer,
    XCircle,
    TrendingUp,
    CircleDollarSign,
    CalendarDays,
    BarChart2,
} from "lucide-react";

// ─── Theme ───────────────────────────────────────────────
const BRAND = "#3C3A86";
const BRAND_LIGHT = "#EEEDFE";
const GRAY = "#6B7280";
const WHITE = "#ffffff";
const COLORS = [
    "#3C3A86",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#8B5CF6",
];

// ─── Card meta ───────────────────────────────────────────
const CARD_META = {
    "Payments Received": { icon: Landmark, bg: "#ECFDF5", color: "#059669" },
    "Paid Invoices": { icon: CheckCircle, bg: "#ECFDF5", color: "#059669" },
    "Avg Payment Time": { icon: Timer, bg: "#FFF7ED", color: "#EA580C" },
    "Unpaid Invoices": { icon: XCircle, bg: "#FEF2F2", color: "#DC2626" },
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
        icon: BarChart2,
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
                    {String(payload[0].value)?.includes?.("AED")
                        ? payload[0].value
                        : `AED ${Number(payload[0].value || 0).toLocaleString()}`}
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
        </svg>
        <span className="text-sm">{text}</span>
    </div>
);

// ─── Main Component ──────────────────────────────────────
const PaymentsDashboard = () => {
    const [activeTab, setActiveTab] = useState("JLT");
    const [loading, setLoading] = useState(false);
    const [dashboard, setDashboard] = useState(null);

    const fetchDashboard = async (branch) => {
        try {
            setLoading(true);
            const branchId = branch === "JLT" ? "1017" : "28866";
            const { data } = await axios.get(
                `https://api.frwrdtutors.com/api/admin/dashboardPaymentsBranch${branchId}`,
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
   const monthlyData = dashboard
    ? Object.entries(dashboard.paymentsByMonth || {})
          .map(([month, amount]) => ({
              month,
              amount: Number(amount || 0),
          }))
          .sort((a, b) => new Date(a.month) - new Date(b.month))
          .slice(-10)
    : [];

    const compareData = dashboard
        ? [
              {
                  name: "Paid Invoices",
                  value: dashboard.overview?.totalPaidInvoices || 0,
              },
              {
                  name: "Unpaid Invoices",
                  value: dashboard.alerts?.unpaidInvoices || 0,
              },
          ]
        : [];

    const avgPaymentTime = dashboard?.overview?.averagePaymentTime ?? 0;

    // ── Monthly table sorted descending ──
    const monthlyTableData = [...monthlyData].reverse();

    // ── Running total for cumulative line ──
   const cumulativeData = monthlyData.reduce((acc, item, i) => {
    const prev = i > 0 ? acc[i - 1].cumulative : 0;
    acc.push({
        ...item,
        cumulative: prev + item.amount,
    });
    return acc;
}, []);

    const cards = dashboard
        ? [
              {
                  title: "Payments Received",
                  value: `AED ${Number(dashboard.overview?.totalPaymentsReceived || 0).toLocaleString()}`,
              },
              {
                  title: "Paid Invoices",
                  value: dashboard.overview?.totalPaidInvoices,
              },
              { title: "Avg Payment Time", value: `${avgPaymentTime} Days` },
              {
                  title: "Unpaid Invoices",
                  value: dashboard.alerts?.unpaidInvoices || 0,
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
                                Finance · Payments
                            </p>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {activeTab} — Payments Dashboard
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
                                Loading payments data…
                            </p>
                        </div>
                    ) : dashboard ? (
                        <>
                            {/* ── Stat Cards ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                {cards.map((c, i) => (
                                    <StatCard
                                        key={i}
                                        title={c.title}
                                        value={c.value}
                                    />
                                ))}
                            </div>

                            {/* ── Average Payment Time Progress ── */}
                            <div
                                className="bg-white rounded-2xl border border-gray-100 p-5 mb-5"
                                style={{
                                    boxShadow: "0 1px 6px rgba(60,58,134,0.07)",
                                }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            style={{
                                                width: 4,
                                                height: 20,
                                                borderRadius: 2,
                                                background: "#F59E0B",
                                            }}
                                        />
                                        <span className="text-sm font-semibold text-gray-700">
                                            Average Payment Time
                                        </span>
                                    </div>
                                    <span
                                        className="text-sm font-bold px-3 py-1 rounded-full"
                                        style={{
                                            background: "#FFF7ED",
                                            color: "#EA580C",
                                        }}
                                    >
                                        {avgPaymentTime} Days
                                    </span>
                                </div>
                                <div
                                    className="rounded-full h-3 overflow-hidden"
                                    style={{ background: "#F3F4F6" }}
                                >
                                    <div
                                        className="h-3 rounded-full transition-all duration-700"
                                        style={{
                                            width: `${Math.min(avgPaymentTime, 100)}%`,
                                            background: "#F59E0B",
                                        }}
                                    />
                                </div>
                                <p
                                    className="text-xs mt-2"
                                    style={{ color: GRAY }}
                                >
                                    Average number of days from invoice sent to
                                    payment received
                                </p>
                            </div>

                            {/* ── Row 1: Monthly Bar + Paid vs Unpaid Pie ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionCard title="Monthly Payments Collection">
                                    {monthlyData.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >
                                            <BarChart
                                                data={monthlyData}
                                                barSize={20}
                                                margin={{
                                                    top: 4,
                                                    right: 8,
                                                    bottom: 30,
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
                                                    dataKey="amount"
                                                    fill={BRAND}
                                                    radius={[5, 5, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>

                                <SectionCard title="Paid vs Unpaid Invoices">
                                    {compareData.every((d) => d.value === 0) ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={compareData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    outerRadius={100}
                                                    innerRadius={50}
                                                    paddingAngle={4}
                                                    label={({
                                                        name,
                                                        percent,
                                                    }) =>
                                                        `${name} ${(percent * 100).toFixed(0)}%`
                                                    }
                                                    labelLine={false}
                                                >
                                                    {compareData.map((_, i) => (
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
                                                <Tooltip />
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

                            {/* ── Row 2: Cumulative Line Chart (full width) ── */}
                            {cumulativeData.length > 0 && (
                                <SectionCard
                                    title="Cumulative Payments Trend"
                                    className="mb-5"
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height={260}
                                    >
                                        <LineChart data={cumulativeData}>
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
                                                dataKey="cumulative"
                                                name="Cumulative"
                                                stroke="#10B981"
                                                strokeWidth={2.5}
                                                dot={{ r: 3, fill: "#10B981" }}
                                                activeDot={{ r: 5 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="amount"
                                                name="Monthly"
                                                stroke={BRAND}
                                                strokeWidth={2}
                                                strokeDasharray="5 3"
                                                dot={{ r: 2, fill: BRAND }}
                                            />
                                            <Legend
                                                iconType="circle"
                                                iconSize={8}
                                                wrapperStyle={{
                                                    fontSize: 12,
                                                    color: GRAY,
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </SectionCard>
                            )}

                            {/* ── Row 3: Monthly Table ── */}
                            <SectionCard title="Monthly Payment Breakdown">
                                {monthlyTableData.length === 0 ? (
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
                                                        "Month",
                                                        "Amount Collected",
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
                                                {monthlyTableData.map(
                                                    (item, i) => {
                                                        const maxAmount =
                                                            Math.max(
                                                                ...monthlyData.map(
                                                                    (d) =>
                                                                        Number(
                                                                            d.amount ||
                                                                                0,
                                                                        ),
                                                                ),
                                                            );
                                                        const pct =
                                                            maxAmount > 0
                                                                ? (Number(
                                                                      item.amount,
                                                                  ) /
                                                                      maxAmount) *
                                                                  100
                                                                : 0;
                                                        return (
                                                            <tr
                                                                key={i}
                                                                style={{
                                                                    borderBottom:
                                                                        "1px solid #F9FAFB",
                                                                }}
                                                                className="hover:bg-gray-50 transition-colors"
                                                            >
                                                                <td className="py-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className="w-28 h-1.5 rounded-full overflow-hidden"
                                                                            style={{
                                                                                background:
                                                                                    "#F3F4F6",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                className="h-1.5 rounded-full"
                                                                                style={{
                                                                                    width: `${pct}%`,
                                                                                    background:
                                                                                        BRAND,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <span className="font-medium text-gray-800">
                                                                            {
                                                                                item.month
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td
                                                                    className="py-3 font-semibold"
                                                                    style={{
                                                                        color: BRAND,
                                                                    }}
                                                                >
                                                                    AED{" "}
                                                                    {Number(
                                                                        item.amount,
                                                                    ).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        );
                                                    },
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

export default PaymentsDashboard;
