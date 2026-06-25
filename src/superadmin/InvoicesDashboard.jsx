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
} from "recharts";
import {
    FileText,
    CircleDollarSign,
    CheckCircle,
    XCircle,
    Ban,
    Wallet,
    TrendingUp,
    Percent,
    AlertTriangle,
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
    "Total Invoices": { icon: FileText, bg: "#EEF2FF", color: "#5D4C29" },
    "Total Revenue": {
        icon: CircleDollarSign,
        bg: "#ECFDF5",
        color: "#059669",
    },
    "Paid Invoices": { icon: CheckCircle, bg: "#ECFDF5", color: "#059669" },
    "Unpaid Invoices": { icon: XCircle, bg: "#FEF2F2", color: "#DC2626" },
    "Void Invoices": { icon: Ban, bg: "#F3F4F6", color: "#6B7280" },
    Outstanding: { icon: Wallet, bg: "#FEF2F2", color: "#DC2626" },
    "Avg Invoice": { icon: TrendingUp, bg: "#ECFEFF", color: "#0891B2" },
    "Collection Rate": { icon: Percent, bg: "#F5F3FF", color: "#7C3AED" },
    Branch: { icon: FileText, bg: "#EEF2FF", color: "#5D4C29" },
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
        icon: FileText,
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
                    AED {Number(payload[0].value || 0).toLocaleString()}
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
        </svg>
        <span className="text-sm">{text}</span>
    </div>
);

const AlertBox = ({ label, value, type = "info" }) => {
    const styles = {
        danger: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
        warning: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
        info: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
    };
    const s = styles[type];
    return (
        <div
            className="flex flex-col gap-1 p-4 rounded-2xl border"
            style={{ background: s.bg, borderColor: s.border }}
        >
            <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: s.color }}
            >
                {label}
            </p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>
                {value}
            </p>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────
const InvoicesDashboard = () => {
    const [activeTab, setActiveTab] = useState("JLT");
    const [loading, setLoading] = useState(false);
    const [dashboard, setDashboard] = useState(null);

    const fetchDashboard = async (branch) => {
        try {
            setLoading(true);
            const branchId = branch === "JLT" ? "1017" : "28866";
            const { data } = await axios.get(
                `https://api.frwrdtutors.com/api/admin/dashboardInvoicesBranch${branchId}`,
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

    const outstandingChartData =
        dashboard?.highRiskCustomers?.map((item) => ({
            name: item.client_name,
            amount: Number(item.still_to_pay || 0),
        })) || [];

    const riskCustomers = dashboard?.highRiskCustomers || [];
    const collectionRate = dashboard?.overview?.collectionRate ?? 0;

    const cards = dashboard
        ? [
              {
                  title: "Total Invoices",
                  value: dashboard.overview?.totalInvoices,
              },
              {
                  title: "Total Revenue",
                  value: `AED ${Number(dashboard.overview?.totalRevenue || 0).toLocaleString()}`,
              },
              {
                  title: "Paid Invoices",
                  value: dashboard.overview?.paidInvoices,
              },
              {
                  title: "Unpaid Invoices",
                  value: dashboard.overview?.unpaidInvoices,
              },
              {
                  title: "Void Invoices",
                  value: dashboard.overview?.voidInvoices,
              },
              {
                  title: "Outstanding",
                  value: `AED ${Number(dashboard.overview?.outstandingBalance || 0).toLocaleString()}`,
              },
              {
                  title: "Avg Invoice",
                  value: `AED ${Number(dashboard.overview?.averageInvoiceValue || 0).toFixed(0)}`,
              },
              {
                  title: "Collection Rate",
                  value: `${dashboard.overview?.collectionRate ?? 0}%`,
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
                                Finance · Invoices
                            </p>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {activeTab} — Invoices Dashboard
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
                                Loading invoices data…
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

                            {/* ── Collection Rate Progress ── */}
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
                                                background: BRAND,
                                            }}
                                        />
                                        <span className="text-sm font-semibold text-gray-700">
                                            Collection Rate Progress
                                        </span>
                                    </div>
                                    <span
                                        className="text-sm font-bold px-3 py-1 rounded-full"
                                        style={{
                                            background: BRAND_LIGHT,
                                            color: BRAND,
                                        }}
                                    >
                                        {collectionRate}%
                                    </span>
                                </div>
                                <div
                                    className="rounded-full h-3 overflow-hidden"
                                    style={{ background: "#F3F4F6" }}
                                >
                                    <div
                                        className="h-3 rounded-full transition-all duration-700"
                                        style={{
                                            width: `${Math.min(collectionRate, 100)}%`,
                                            background: BRAND,
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span
                                        className="text-xs"
                                        style={{ color: GRAY }}
                                    >
                                        0%
                                    </span>
                                    <span
                                        className="text-xs"
                                        style={{ color: GRAY }}
                                    >
                                        100%
                                    </span>
                                </div>
                            </div>

                            {/* ── Alerts Row ── */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                                <AlertBox
                                    label="Unpaid Invoices"
                                    value={
                                        dashboard.overview?.unpaidInvoices || 0
                                    }
                                    type="danger"
                                />
                                <AlertBox
                                    label="High Risk Customers"
                                    value={riskCustomers.length}
                                    type="warning"
                                />
                                <AlertBox
                                    label="Outstanding Balance"
                                    value={`AED ${Number(dashboard.overview?.outstandingBalance || 0).toLocaleString()}`}
                                    type="info"
                                />
                            </div>

                            {/* ── Row 1: Status Pie + Outstanding Bar ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionCard title="Invoice Status Distribution">
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

                                <SectionCard title="Top Outstanding Clients">
                                    {outstandingChartData.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >
                                            <BarChart
                                                data={outstandingChartData}
                                                barSize={18}
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
                                                    angle={-25}
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
                                                    fill="#EF4444"
                                                    radius={[5, 5, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>
                            </div>

                            {/* ── Row 2: High Risk Customers Table ── */}
                            <SectionCard
                                title="High Risk Customers"
                                className="mb-5"
                            >
                                {riskCustomers.length === 0 ? (
                                    <EmptyState text="No high risk customers" />
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
                                                        "Invoice",
                                                        "Client",
                                                        "Amount Due",
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
                                                {riskCustomers.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        style={{
                                                            borderBottom:
                                                                "1px solid #F9FAFB",
                                                        }}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="py-2.5">
                                                            <span
                                                                className="font-mono text-xs px-2 py-1 rounded"
                                                                style={{
                                                                    background:
                                                                        "#F3F4F6",
                                                                    color: GRAY,
                                                                }}
                                                            >
                                                                {
                                                                    item.display_id
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div
                                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                                    style={{
                                                                        background:
                                                                            "#EF4444",
                                                                    }}
                                                                >
                                                                    {item.client_name
                                                                        ?.charAt(
                                                                            0,
                                                                        )
                                                                        ?.toUpperCase() ||
                                                                        "C"}
                                                                </div>
                                                                <span className="font-medium text-gray-800">
                                                                    {
                                                                        item.client_name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td
                                                            className="py-2.5 font-bold"
                                                            style={{
                                                                color: "#DC2626",
                                                            }}
                                                        >
                                                            AED{" "}
                                                            {Number(
                                                                item.still_to_pay,
                                                            ).toLocaleString()}
                                                        </td>
                                                        <td className="py-2.5">
                                                            <span
                                                                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                                style={{
                                                                    background:
                                                                        "#FEF2F2",
                                                                    color: "#DC2626",
                                                                }}
                                                            >
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </SectionCard>

                            {/* ── Row 3: Outstanding Clients Full Table ── */}
                            <SectionCard title="Outstanding Clients Detail">
                                {riskCustomers.length === 0 ? (
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
                                                        "Invoice",
                                                        "Client",
                                                        "Email",
                                                        "Amount",
                                                        "Status",
                                                        "Date Sent",
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
                                                {dashboard.highRiskCustomers?.map(
                                                    (item) => (
                                                        <tr
                                                            key={`detail-${item.id}`}
                                                            style={{
                                                                borderBottom:
                                                                    "1px solid #F9FAFB",
                                                            }}
                                                            className="hover:bg-gray-50 transition-colors"
                                                        >
                                                            <td className="py-2.5">
                                                                <span
                                                                    className="font-mono text-xs px-2 py-1 rounded"
                                                                    style={{
                                                                        background:
                                                                            "#F3F4F6",
                                                                        color: GRAY,
                                                                    }}
                                                                >
                                                                    {
                                                                        item.display_id
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 font-medium text-gray-800">
                                                                {
                                                                    item.client_name
                                                                }
                                                            </td>
                                                            <td className="py-2.5 text-gray-500 text-xs">
                                                                {item.client_email ||
                                                                    "—"}
                                                            </td>
                                                            <td
                                                                className="py-2.5 font-bold"
                                                                style={{
                                                                    color: "#DC2626",
                                                                }}
                                                            >
                                                                AED{" "}
                                                                {Number(
                                                                    item.still_to_pay,
                                                                ).toLocaleString()}
                                                            </td>
                                                            <td className="py-2.5">
                                                                <span
                                                                    className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                                    style={{
                                                                        background:
                                                                            "#FFF7ED",
                                                                        color: "#C2410C",
                                                                    }}
                                                                >
                                                                    {
                                                                        item.status
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 text-gray-500 text-xs">
                                                                {item.date_sent
    ? new Date(item.date_sent).toLocaleDateString("en-GB")
    : "—"}
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

export default InvoicesDashboard;
