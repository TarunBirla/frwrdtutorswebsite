import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from "recharts";

import {
    Users,
    GraduationCap,
    UserCheck,
    CircleDollarSign,
    CheckCircle,
    Clock3,
    Wallet,
    TrendingUp,
    CalendarDays,
    BookCheck,
    ClipboardList,
    Landmark,
    AlertTriangle,
    Star,
} from "lucide-react";

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

const cardIcons = {
    "Total Clients": {
        icon: Users,
        bg: "#EEF2FF",
        color: "#4338CA",
    },

    "Total Students": {
        icon: GraduationCap,
        bg: "#ECFDF5",
        color: "#059669",
    },

    "Total Tutors": {
        icon: UserCheck,
        bg: "#F5F3FF",
        color: "#7C3AED",
    },

    "Live Clients": {
        icon: Users,
        bg: "#FFF7ED",
        color: "#EA580C",
    },

    "Approved Tutors": {
        icon: CheckCircle,
        bg: "#EEF2FF",
        color: "#4338CA",
    },

    "Pending Tutors": {
        icon: Clock3,
        bg: "#FEF2F2",
        color: "#DC2626",
    },

    Appointments: {
        icon: CalendarDays,
        bg: "#EEF2FF",
        color: "#4338CA",
    },

    "Completed Lessons": {
        icon: BookCheck,
        bg: "#ECFDF5",
        color: "#059669",
    },

    "Planned Lessons": {
        icon: ClipboardList,
        bg: "#FFF7ED",
        color: "#EA580C",
    },
    "Invoice Balance": {
        icon: Wallet,
        bg: "#ECFDF5",
        color: "#059669",
    },

    "Avg Tutor Revenue": {
        icon: TrendingUp,
        bg: "#ECFEFF",
        color: "#0891B2",
    },

    Revenue: {
        icon: CircleDollarSign,
        bg: "#F5F3FF",
        color: "#7C3AED",
    },

    "Payments Received": {
        icon: Landmark,
        bg: "#ECFDF5",
        color: "#059669",
    },

    Outstanding: {
        icon: AlertTriangle,
        bg: "#FEF2F2",
        color: "#DC2626",
    },
};

const CustomTooltipStyle = {
    background: WHITE,
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 13,
    color: "#1F2937",
    boxShadow: "0 4px 16px rgba(60,58,134,0.10)",
};

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
    const meta = cardIcons[title] || {
        icon: BarChart3,
        bg: "#F3F4F6",
        color: GRAY,
    };

    const Icon = meta.icon;

    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-all"
            style={{
                boxShadow: "0 1px 6px rgba(60,58,134,0.07)",
            }}
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
                {value}
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={CustomTooltipStyle}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="font-semibold" style={{ color: BRAND }}>
                    {payload[0].name === "value"
                        ? payload[0].value?.toLocaleString()
                        : payload[0].value}
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

const Badge = ({ status }) => {
    const isLive = status === "live";
    return (
        <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
                background: isLive ? "#ECFDF5" : "#FEF2F2",
                color: isLive ? "#059669" : "#DC2626",
            }}
        >
            {status}
        </span>
    );
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("JLT");
    const [loading, setLoading] = useState(false);

    const [dashboard, setDashboard] = useState({
        clients: {},
        students: {},
        tutors: {},
        appointments: {},
        invoices: {},
        payments: {},
    });

    const fetchDashboardData = async (brand) => {
        try {
            setLoading(true);
            const branch = brand === "JLT" ? "1017" : "28866";

            const [
                clientsRes,
                studentsRes,
                tutorsRes,
                appointmentsRes,
                invoicesRes,
                paymentsRes,
            ] = await Promise.all([
                axios.get(
                    `https://api.frwrdtutors.com/api/admin/dashboardClientsBranch${branch}`,
                ),
                axios.get(
                    `https://api.frwrdtutors.com/api/admin/dashboardStudentsBranch${branch}`,
                ),
                axios.get(
                    `https://api.frwrdtutors.com/api/admin/dashboardTutorsBranch${branch}`,
                ),
                axios.get(
                    `https://api.frwrdtutors.com/api/admin/dashboardAppointmentsBranch${branch}`,
                ),
                axios.get(
                    `https://api.frwrdtutors.com/api/admin/dashboardInvoicesBranch${branch}`,
                ),
                axios.get(
                    `https://api.frwrdtutors.com/api/admin/dashboardPaymentsBranch${branch}`,
                ),
            ]);

            setDashboard({
                clients: clientsRes.data,
                students: studentsRes.data,
                tutors: tutorsRes.data,
                appointments: appointmentsRes.data,
                invoices: invoicesRes.data,
                payments: paymentsRes.data,
            });
            setActiveTab(brand);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData("JLT");
    }, []);

    const cards = [
        {
            title: "Total Clients",
            value: dashboard.clients?.overview?.totalClients || 0,
        },
        {
            title: "Total Students",
            value: dashboard.students?.overview?.totalStudents || 0,
        },
        {
            title: "Total Tutors",
            value: dashboard.tutors?.overview?.totalTutors || 0,
        },
        {
            title: "Live Clients",
            value: dashboard.clients?.overview?.liveClients || 0,
        },
        {
            title: "Approved Tutors",
            value: dashboard.tutors?.overview?.approvedTutors || 0,
        },
        {
            title: "Pending Tutors",
            value: dashboard.tutors?.overview?.pendingTutors || 0,
        },

        {
            title: "Appointments",
            value: dashboard.appointments?.overview?.totalAppointments || 0,
        },
        {
            title: "Completed Lessons",
            value: dashboard.appointments?.overview?.completedLessons || 0,
        },
        {
            title: "Planned Lessons",
            value: dashboard.appointments?.overview?.plannedLessons || 0,
        },
        {
            title: "Invoice Balance",
            value: `AED ${Number(dashboard.clients?.overview?.totalInvoiceBalance || 0).toLocaleString()}`,
        },
        {
            title: "Avg Tutor Revenue",
            value: `AED ${Number(dashboard.tutors?.overview?.averageRevenuePerTutor || 0).toLocaleString()}`,
        },
        {
            title: "Revenue",
            value: `AED ${Number(dashboard.invoices?.overview?.totalRevenue || 0).toLocaleString()}`,
        },
        {
            title: "Payments Received",
            value: `AED ${Number(dashboard.payments?.overview?.totalPaymentsReceived || 0).toLocaleString()}`,
        },
        {
            title: "Outstanding",
            value: `AED ${Number(dashboard.invoices?.overview?.outstandingBalance || 0).toLocaleString()}`,
        },
    ];

    const clientStatusData = [
        {
            name: "Live",
            value: dashboard.clients?.statusDistribution?.live || 0,
        },
        {
            name: "Dormant",
            value: dashboard.clients?.statusDistribution?.dormant || 0,
        },
    ];

    const tutorStatusData = [
        {
            name: "Approved",
            value: dashboard.tutors?.statusDistribution?.approved || 0,
        },
        {
            name: "Pending",
            value: dashboard.tutors?.statusDistribution?.pending || 0,
        },
        {
            name: "Dormant",
            value: dashboard.tutors?.statusDistribution?.dormant || 0,
        },
    ];

    const invoiceStatusData = [
        {
            name: "Paid",
            value: dashboard.invoices?.statusDistribution?.Paid || 0,
        },
        {
            name: "Unpaid",
            value: dashboard.invoices?.statusDistribution?.Unpaid || 0,
        },
        {
            name: "Void",
            value: dashboard.invoices?.statusDistribution?.Void || 0,
        },
    ];

    const studentTrendData = Object.entries(
        dashboard.students?.monthlyStudentTrend || {},
    ).map(([month, value]) => ({ month, value }));
    const tutorTrendData = Object.entries(
        dashboard.tutors?.monthlyTutorTrend || {},
    ).map(([month, value]) => ({ month, value }));
    const clientTrendData = Object.entries(
        dashboard.clients?.monthlyClientTrend || {},
    ).map(([month, value]) => ({ month, value }));
    const appointmentTrend = Object.entries(
        dashboard.appointments?.monthlyLessonsTrend || {},
    ).map(([month, value]) => ({ month, value }));
    const paymentsTrendData = Object.entries(
        dashboard.payments?.paymentsByMonth || {},
    ).map(([month, value]) => ({ month, value }));
    const lessonTopicsData = Object.entries(
        dashboard.appointments?.lessonTopics || {},
    )
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));

    return (
        <div className="flex min-h-screen" style={{ background: "#F8F8FC" }}>
            <Sidebar />
            <div className="flex-1 min-w-0">
                <Navbar />

                <div className="px-6 py-5">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <p
                                className="text-xs font-medium uppercase tracking-widest mb-1"
                                style={{ color: GRAY }}
                            >
                                Admin Overview
                            </p>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {activeTab} Dashboard
                            </h1>
                        </div>

                        {/* Branch Toggle */}
                        <div
                            className="flex p-1 rounded-xl"
                            style={{
                                background: BRAND_LIGHT,
                                border: `1px solid #CECBF6`,
                            }}
                        >
                            {["JLT", "MTC"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => fetchDashboardData(tab)}
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
                                    borderColor: `${BRAND_LIGHT}`,
                                    borderTopColor: BRAND,
                                }}
                            />
                            <p className="text-sm" style={{ color: GRAY }}>
                                Loading dashboard data…
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* ── Stat Cards: 2 cols mobile → 3 → 4 → 7 ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-6">
                                {cards.map((item, index) => (
                                    <StatCard
                                        key={index}
                                        title={item.title}
                                        value={item.value}
                                        index={index}
                                    />
                                ))}
                            </div>

                            {/* ── Row 1: Client Status + Tutor Status ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionCard title="Client Status Distribution">
                                    {clientStatusData.every(
                                        (d) => d.value === 0,
                                    ) ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={260}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={clientStatusData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    outerRadius={90}
                                                    innerRadius={45}
                                                    paddingAngle={3}
                                                    label={({
                                                        name,
                                                        percent,
                                                    }) =>
                                                        `${name} ${(percent * 100).toFixed(0)}%`
                                                    }
                                                    labelLine={false}
                                                >
                                                    {clientStatusData.map(
                                                        (_, i) => (
                                                            <Cell
                                                                key={i}
                                                                fill={
                                                                    COLORS[
                                                                        i %
                                                                            COLORS.length
                                                                    ]
                                                                }
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

                                <SectionCard title="Tutor Status Distribution">
                                    {tutorStatusData.every(
                                        (d) => d.value === 0,
                                    ) ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={260}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={tutorStatusData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    outerRadius={90}
                                                    innerRadius={45}
                                                    paddingAngle={3}
                                                    label={({
                                                        name,
                                                        percent,
                                                    }) =>
                                                        `${name} ${(percent * 100).toFixed(0)}%`
                                                    }
                                                    labelLine={false}
                                                >
                                                    {tutorStatusData.map(
                                                        (_, i) => (
                                                            <Cell
                                                                key={i}
                                                                fill={
                                                                    COLORS[
                                                                        i %
                                                                            COLORS.length
                                                                    ]
                                                                }
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
                            </div>

                            {/* ── Row 2: Students Trend + Tutors Trend ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionCard title="Monthly Students Trend">
                                    {studentTrendData.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={240}
                                        >
                                            <LineChart data={studentTrendData}>
                                                <defs>
                                                    <linearGradient
                                                        id="grad1"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor={BRAND}
                                                            stopOpacity={0.15}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor={BRAND}
                                                            stopOpacity={0}
                                                        />
                                                    </linearGradient>
                                                </defs>
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
                                                    dataKey="value"
                                                    stroke={BRAND}
                                                    strokeWidth={2.5}
                                                    dot={{ r: 3, fill: BRAND }}
                                                    activeDot={{ r: 5 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>

                                <SectionCard title="Monthly Tutors Trend">
                                    {tutorTrendData.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={240}
                                        >
                                            <LineChart data={tutorTrendData}>
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
                                                    dataKey="value"
                                                    stroke="#10B981"
                                                    strokeWidth={2.5}
                                                    dot={{
                                                        r: 3,
                                                        fill: "#10B981",
                                                    }}
                                                    activeDot={{ r: 5 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>
                            </div>

                            {/* ── Row 4: Appointments + Payments ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionCard title="Appointments Trend">
                                    {appointmentTrend.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={240}
                                        >
                                            <BarChart
                                                data={appointmentTrend}
                                                barSize={18}
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
                                                    fill="#10B981"
                                                    radius={[5, 5, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>

                                <SectionCard title="Payments Received Trend">
                                    {paymentsTrendData.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={240}
                                        >
                                            <LineChart data={paymentsTrendData}>
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
                                                    dataKey="value"
                                                    stroke="#F59E0B"
                                                    strokeWidth={2.5}
                                                    dot={{
                                                        r: 3,
                                                        fill: "#F59E0B",
                                                    }}
                                                    activeDot={{ r: 5 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>
                            </div>

                            {/* ── Row 5: Invoice Status + Top Lesson Topics ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionCard title="Invoice Status">
                                    {invoiceStatusData.every(
                                        (d) => d.value === 0,
                                    ) ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={260}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={invoiceStatusData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    outerRadius={90}
                                                    innerRadius={45}
                                                    paddingAngle={3}
                                                    label={({
                                                        name,
                                                        percent,
                                                    }) =>
                                                        `${name} ${(percent * 100).toFixed(0)}%`
                                                    }
                                                    labelLine={false}
                                                >
                                                    {invoiceStatusData.map(
                                                        (_, i) => (
                                                            <Cell
                                                                key={i}
                                                                fill={
                                                                    COLORS[
                                                                        i %
                                                                            COLORS.length
                                                                    ]
                                                                }
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

                                <SectionCard title="Top 10 Lesson Topics">
                                    {lessonTopicsData.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={260}
                                        >
                                            <BarChart
                                                data={lessonTopicsData}
                                                layout="vertical"
                                                barSize={14}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#F3F4F6"
                                                    horizontal={false}
                                                />
                                                <XAxis
                                                    type="number"
                                                    tick={{
                                                        fontSize: 10,
                                                        fill: GRAY,
                                                    }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    tick={{
                                                        fontSize: 10,
                                                        fill: GRAY,
                                                    }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    width={90}
                                                />
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                    cursor={{ fill: "#F3F4F6" }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    fill="#8B5CF6"
                                                    radius={[0, 5, 5, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>
                            </div>

                            {/* ── Row 3: Client Growth (full width) ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <SectionCard
                                    title="Client Growth Trend"
                                    className="mb-5"
                                >
                                    {clientTrendData.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >
                                            <BarChart
                                                data={clientTrendData}
                                                barSize={22}
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
                                                    fill={BRAND}
                                                    radius={[5, 5, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </SectionCard>
                                <SectionCard
                                    title="Recent Students"
                                    className="mb-5"
                                >
                                    {(dashboard.students?.recentStudents || [])
                                        .length === 0 ? (
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
                                                            "Student",
                                                            "Academic Year",
                                                            "Date Created",
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
                                                    {(
                                                        dashboard.students
                                                            ?.recentStudents ||
                                                        []
                                                    )
                                                        .slice(0, 5)
                                                        .map((student) => (
                                                            <tr
                                                                key={student.id}
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
                                                                            {student.name
                                                                                ?.charAt(
                                                                                    0,
                                                                                )
                                                                                ?.toUpperCase() ||
                                                                                "S"}
                                                                        </div>
                                                                        <span className="font-medium text-gray-800">
                                                                            {
                                                                                student.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-2.5 text-gray-600">
                                                                    {
                                                                        student.academic_year
                                                                    }
                                                                </td>
                                                                <td className="py-2.5 text-gray-500">
                                                                    {new Date(
                                                                        student.date_created,
                                                                    ).toLocaleDateString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </SectionCard>
                            </div>
                            {/* ── Row 6: Top Tutors + Top Clients ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionCard title="Top Tutors">
                                    {(dashboard.tutors?.topTutors || [])
                                        .length === 0 ? (
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
                                                        <th
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
                                                            Name
                                                        </th>
                                                        <th
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
                                                            Rating
                                                        </th>
                                                        <th
                                                            className="pb-3 text-right font-medium"
                                                            style={{
                                                                color: GRAY,
                                                                fontSize: 11,
                                                                textTransform:
                                                                    "uppercase",
                                                                letterSpacing:
                                                                    "0.05em",
                                                            }}
                                                        >
                                                            Revenue
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(
                                                        dashboard.tutors
                                                            ?.topTutors || []
                                                    )
                                                        .slice(0, 10)
                                                        .map((tutor, i) => (
                                                            <tr
                                                                key={tutor.id}
                                                                style={{
                                                                    borderBottom:
                                                                        "1px solid #F9FAFB",
                                                                }}
                                                                className="hover:bg-gray-50 transition-colors"
                                                            >
                                                                <td className="py-2.5 font-medium text-gray-800">
                                                                    {tutor.name}
                                                                </td>
                                                                <td className="py-2.5">
                                                                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                                                                        <Star size={16} />{" "}
                                                                        {
                                                                            tutor.rating
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td
                                                                    className="py-2.5 text-right font-semibold"
                                                                    style={{
                                                                        color: BRAND,
                                                                    }}
                                                                >
                                                                    AED{" "}
                                                                    {Number(
                                                                        tutor.revenue,
                                                                    ).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </SectionCard>

                                <SectionCard title="Top Clients">
                                    {(dashboard.clients?.topClients || [])
                                        .length === 0 ? (
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
                                                        <th
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
                                                            Name
                                                        </th>
                                                        <th
                                                            className="pb-3 text-center font-medium"
                                                            style={{
                                                                color: GRAY,
                                                                fontSize: 11,
                                                                textTransform:
                                                                    "uppercase",
                                                                letterSpacing:
                                                                    "0.05em",
                                                            }}
                                                        >
                                                            Status
                                                        </th>
                                                        <th
                                                            className="pb-3 text-right font-medium"
                                                            style={{
                                                                color: GRAY,
                                                                fontSize: 11,
                                                                textTransform:
                                                                    "uppercase",
                                                                letterSpacing:
                                                                    "0.05em",
                                                            }}
                                                        >
                                                            Balance
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(
                                                        dashboard.clients
                                                            ?.topClients || []
                                                    )
                                                        .slice(0, 10)
                                                        .map((client) => (
                                                            <tr
                                                                key={client.id}
                                                                style={{
                                                                    borderBottom:
                                                                        "1px solid #F9FAFB",
                                                                }}
                                                                className="hover:bg-gray-50 transition-colors"
                                                            >
                                                                <td className="py-2.5 font-medium text-gray-800">
                                                                    {
                                                                        client.name
                                                                    }
                                                                </td>
                                                                <td className="py-2.5 text-center">
                                                                    <Badge
                                                                        status={
                                                                            client.status
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="py-2.5 text-right font-semibold text-gray-700">
                                                                    AED{" "}
                                                                    {Number(
                                                                        client.invoice_balance,
                                                                    ).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </SectionCard>
                            </div>

                            {/* ── Row 8: High Risk Customers (full width) ── */}
                            <SectionCard title="High Risk Customers">
                                {(dashboard.invoices?.highRiskCustomers || [])
                                    .length === 0 ? (
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
                                                        "Amount",
                                                        "Status",
                                                        "Still to Pay",
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
                                                {(
                                                    dashboard.invoices
                                                        ?.highRiskCustomers ||
                                                    []
                                                )
                                                    .slice(0, 10)
                                                    .map((item) => (
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
                                                            <td className="py-2.5 font-medium text-gray-800">
                                                                {
                                                                    item.client_name
                                                                }
                                                            </td>
                                                            <td className="py-2.5 text-gray-700">
                                                                AED{" "}
                                                                {Number(
                                                                    item.amount,
                                                                ).toLocaleString()}
                                                            </td>
                                                            <td className="py-2.5">
                                                                <span
                                                                    className="px-2 py-0.5 rounded-full text-xs font-medium"
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
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </SectionCard>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
