import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    CartesianGrid,
    XAxis,
    YAxis,
    LineChart,
    Line,
    BarChart,
    Bar,
} from "recharts";
import {
    Users,
    UserCheck,
    UserX,
    UserPlus,
    Wallet,
    BadgeDollarSign,
    TrendingUp,
    Percent,
} from "lucide-react";

// ─── Theme ───────────────────────────────────────────────
const BRAND       = "#5D4C29";
const BRAND_LIGHT = "#EEEDFE";
const GRAY        = "#6B7280";
const WHITE       = "#ffffff";
const COLORS      = ["#5D4C29", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#8B5CF6"];

// ─── Card meta ───────────────────────────────────────────
const CARD_META = {
    "Total Clients":     { icon: Users,           bg: "#EEF2FF", color: "#5D4C29" },
    "Live Clients":      { icon: UserCheck,        bg: "#ECFDF5", color: "#059669" },
    "Dormant Clients":   { icon: UserX,            bg: "#FEF2F2", color: "#DC2626" },
    "New This Month":    { icon: UserPlus,         bg: "#FFF7ED", color: "#EA580C" },
    "Invoice Balance":   { icon: Wallet,           bg: "#ECFDF5", color: "#059669" },
    "Available Balance": { icon: BadgeDollarSign,  bg: "#F0FDF4", color: "#16A34A" },
    "Avg Invoice":       { icon: TrendingUp,       bg: "#ECFEFF", color: "#0891B2" },
    "Live Rate":         { icon: Percent,          bg: "#F5F3FF", color: "#7C3AED" },
};

// ─── Reusable Components ─────────────────────────────────
const SectionCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}>
        {title && (
            <div className="flex items-center gap-2 mb-4">
                <div style={{ width: 4, height: 20, borderRadius: 2, background: BRAND }} />
                <h3 className="font-semibold text-gray-800 text-base">{title}</h3>
            </div>
        )}
        {children}
    </div>
);

const StatCard = ({ title, value }) => {
    const meta = CARD_META[title] || { icon: TrendingUp, bg: "#F3F4F6", color: GRAY };
    const Icon = meta.icon;
    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-all"
            style={{ boxShadow: "0 1px 6px rgba(60,58,134,0.07)" }}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: GRAY }}>
                    {title}
                </span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: meta.bg }}>
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
            <div style={{
                background: WHITE, border: "1px solid #E5E7EB", borderRadius: 10,
                padding: "8px 14px", fontSize: 13, color: "#1F2937",
                boxShadow: "0 4px 16px rgba(60,58,134,0.10)",
            }}>
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
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-2 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2M9 17H7a2 2 0 01-2-2v-1a2 2 0 012-2h2m0 5h6m0 0h2a2 2 0 002-2v-1a2 2 0 00-2-2h-2" />
        </svg>
        <span className="text-sm">{text}</span>
    </div>
);

const Badge = ({ status }) => {
    const isLive = status === "live";
    return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: isLive ? "#ECFDF5" : "#FEF2F2", color: isLive ? "#059669" : "#DC2626" }}>
            {status}
        </span>
    );
};

// ─── Main Component ──────────────────────────────────────
const ClientsDashboard = () => {
    const [activeTab, setActiveTab] = useState("JLT");
    const [loading, setLoading]     = useState(false);
    const [dashboard, setDashboard] = useState(null);

    const fetchDashboard = async (branch) => {
        try {
            setLoading(true);
            const branchId = branch === "JLT" ? "1017" : "28866";
            const { data } = await axios.get(
                `https://api.frwrdtutors.com/api/admin/dashboardClientsBranch${branchId}`
            );
            setDashboard(data);
            setActiveTab(branch);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard("JLT"); }, []);

    // ── Derived data ──
    const statusData = dashboard
        ? Object.entries(dashboard.statusDistribution || {}).map(([name, value]) => ({ name, value }))
        : [];

    const timezoneData = dashboard
        ? Object.entries(dashboard.timezoneDistribution || {}).map(([name, value]) => ({ name, value }))
        : [];

    const monthlyTrendData = dashboard
    ? Object.entries(dashboard.monthlyClientTrend || {})
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => new Date(a.month) - new Date(b.month))
          .slice(-5)
    : [];

    const topClients = dashboard?.topClients || [];

    const cards = dashboard
        ? [
            { title: "Total Clients",     value: dashboard.overview?.totalClients },
            { title: "Live Clients",      value: dashboard.overview?.liveClients },
            { title: "Dormant Clients",   value: dashboard.overview?.dormantClients },
            { title: "New This Month",    value: dashboard.overview?.newClientsThisMonth },
            { title: "Invoice Balance",   value: `AED ${Number(dashboard.overview?.totalInvoiceBalance || 0).toLocaleString()}` },
            { title: "Available Balance", value: `AED ${Number(dashboard.overview?.totalAvailableBalance || 0).toLocaleString()}` },
            { title: "Avg Invoice",       value: `AED ${Number(dashboard.overview?.averageInvoiceBalance || 0).toLocaleString()}` },
            { title: "Live Rate",         value: `${dashboard.overview?.liveClientRate ?? 0}%` },
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
                            <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: GRAY }}>
                                Clients Overview
                            </p>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {activeTab} — Clients Dashboard
                            </h1>
                        </div>
                        <div className="flex p-1 rounded-xl" style={{ background: BRAND_LIGHT, border: "1px solid #CECBF6" }}>
                            {["JLT", "MTC"].map((tab) => (
                                <button key={tab} onClick={() => fetchDashboard(tab)}
                                    className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                                    style={activeTab === tab
                                        ? { background: BRAND, color: WHITE, boxShadow: "0 2px 8px rgba(60,58,134,0.25)" }
                                        : { background: "transparent", color: BRAND }}>
                                    {tab} Branch
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                                style={{ borderColor: BRAND_LIGHT, borderTopColor: BRAND }} />
                            <p className="text-sm" style={{ color: GRAY }}>Loading clients data…</p>
                        </div>
                    ) : dashboard ? (
                        <>
                            {/* ── Stat Cards ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                                {cards.map((c, i) => <StatCard key={i} title={c.title} value={c.value} />)}
                            </div>

                            {/* ── Row 1: Status + Timezone Pie ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionCard title="Client Status Distribution">
                                    {statusData.every(d => d.value === 0) ? <EmptyState /> : (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <PieChart>
                                                <Pie data={statusData} dataKey="value" nameKey="name"
                                                    outerRadius={100} innerRadius={50} paddingAngle={3}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    labelLine={false}>
                                                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: GRAY }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>

                                <SectionCard title="Timezone Distribution">
                                    {timezoneData.every(d => d.value === 0) ? <EmptyState /> : (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <PieChart>
                                                <Pie data={timezoneData} dataKey="value" nameKey="name"
                                                    outerRadius={100} innerRadius={50} paddingAngle={3}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    labelLine={false}>
                                                    {timezoneData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: GRAY }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>
                            </div>

                            {/* ── Row 2: Monthly Trend ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

                            <SectionCard title="Monthly Client Trend" >
                                {monthlyTrendData.length === 0 ? <EmptyState /> : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart data={monthlyTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="count" stroke={BRAND} strokeWidth={2.5}
                                                dot={{ r: 3, fill: BRAND }} activeDot={{ r: 5 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </SectionCard>

                            {/* ── Row 3: Top Clients Bar ── */}
                            <SectionCard title="Top Clients by Invoice Balance">
                                {topClients.length === 0 ? <EmptyState /> : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={topClients} barSize={20}
                                            margin={{ top: 4, right: 16, bottom: 50, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: GRAY }} angle={-30}
                                                textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F3F4F6" }} />
                                            <Bar dataKey="invoice_balance" fill={BRAND} radius={[5, 5, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </SectionCard>
                            </div>

                            {/* ── Row 4: Top Clients Table ── */}
                            <SectionCard title="Top Clients Details">
                                {topClients.length === 0 ? <EmptyState /> : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                                                    {["Name", "Email", "Status", "Invoice Balance", "Available Balance"].map(h => (
                                                        <th key={h} className="pb-3 text-left font-medium"
                                                            style={{ color: GRAY, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {topClients.map((client) => (
                                                    <tr key={client.id} style={{ borderBottom: "1px solid #F9FAFB" }}
                                                        className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-2.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                                    style={{ background: BRAND }}>
                                                                    {client.name?.charAt(0)?.toUpperCase() || "C"}
                                                                </div>
                                                                <span className="font-medium text-gray-800">{client.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 text-gray-500">{client.email || "—"}</td>
                                                        <td className="py-2.5"><Badge status={client.status} /></td>
                                                        <td className="py-2.5 font-semibold" style={{ color: BRAND }}>
                                                            AED {Number(client.invoice_balance).toLocaleString()}
                                                        </td>
                                                        <td className="py-2.5 font-medium text-gray-700">
                                                            AED {Number(client.available_balance).toLocaleString()}
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

export default ClientsDashboard;