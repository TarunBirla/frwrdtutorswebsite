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
} from "recharts";

const BRAND = "#3C3A86";
const BRAND_DARK = "#2E2C68";
const BRAND_SOFT = "#EDEBFB";

const STATUS_COLORS = {
  completed: "#16A34A",
  planned: "#3C3A86",
  cancelled: "#DC2626",
  pending: "#F59E0B",
  rescheduled: "#6366F1",
};

const FALLBACK_COLORS = ["#3C3A86", "#16A34A", "#F59E0B", "#DC2626", "#6366F1", "#0EA5A4"];

const getStatusColor = (name, index) => {
  const key = String(name || "").toLowerCase();
  return STATUS_COLORS[key] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

/* ---------- Small UI atoms ---------- */

const Spinner = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-24">
    <div
      className="w-10 h-10 rounded-full border-4 border-[#E7E5F7] animate-spin"
      style={{ borderTopColor: BRAND }}
    />
    <p className="text-sm text-gray-400">Fetching dashboard data…</p>
  </div>
);

const Card = ({ title, value, icon, accent = false }) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-5 border transition-shadow hover:shadow-md ${
      accent ? "text-white" : "bg-white border-gray-100"
    }`}
    style={accent ? { backgroundColor: BRAND } : {}}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-xs font-medium uppercase tracking-wide ${accent ? "text-white/70" : "text-gray-400"}`}>
          {title}
        </p>
        <h3 className={`text-2xl font-bold mt-2 ${accent ? "text-white" : "text-gray-900"}`}>
          {value ?? "—"}
        </h3>
      </div>

      {icon && (
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            accent ? "bg-white/15" : ""
          }`}
          style={!accent ? { backgroundColor: BRAND_SOFT, color: BRAND } : {}}
        >
          {icon}
        </div>
      )}
    </div>

    {accent && (
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10" />
    )}
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-5 flex items-center gap-3">
    <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: BRAND }} />
    <div>
      <h2 className="font-bold text-base text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const color = getStatusColor(status, 0);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {status}
    </span>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
      <p className="font-semibold text-gray-900">{item.name ?? item.payload?.name}</p>
      <p style={{ color: item.color || BRAND }} className="font-medium">
        {item.value}
      </p>
    </div>
  );
};

/* ---------- Icons (inline, no extra deps) ---------- */

const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const IconTrend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M21 7v6h-6" />
  </svg>
);

/* ---------- Main component ---------- */

const AppointmentsDashboard = () => {
  const [activeTab, setActiveTab] = useState("JLT");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async (branch) => {
    setLoading(true);

    try {
      const url =
        branch === "JLT"
          ? "https://api.frwrdtutors.com/api/admin/dashboardAppointmentsBranch1017"
          : "https://api.frwrdtutors.com/api/admin/dashboardAppointmentsBranch28866";

      const { data } = await axios.get(url);
      setDashboard(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard("JLT");
  }, []);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    fetchDashboard(tab);
  };

  const statusData = dashboard
    ? Object.entries(dashboard.statusDistribution || {}).map(([name, value]) => ({ name, value }))
    : [];

  const topicData = dashboard
    ? Object.entries(dashboard.lessonTopics || {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15)
    : [];

  const allTopics = dashboard
    ? Object.entries(dashboard.lessonTopics || {}).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-6 lg:p-8 bg-white">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments dashboard</h1>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 mb-6">
  <h3 className="font-semibold text-blue-900 mb-2">
    Dashboard Data Range
  </h3>

  <p className="text-sm text-blue-800">
    To improve dashboard performance and prevent API rate limit
    issues, appointment data is limited to:
  </p>

  <p className="font-semibold text-blue-900 mt-2">
    Past 3 Months ← Today → Next 3 Months
  </p>

  <ul className="list-disc ml-5 mt-2 text-sm text-blue-800">
    <li>Previous 3 months appointment history</li>
    <li>Today's appointments</li>
    <li>Upcoming 3 months appointments</li>
  </ul>
</div>
            </div>

            <div className="inline-flex bg-gray-100 rounded-xl p-1 self-start sm:self-auto">
              {["JLT", "MTC"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-150"
                  style={
                    activeTab === tab
                      ? { backgroundColor: BRAND, color: "#fff" }
                      : { color: "#6B7280" }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : dashboard ? (
            <>
              {/* KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <Card
                  title="Total appointments"
                  value={dashboard.overview?.totalAppointments}
                  icon={<IconCalendar />}
                  accent
                />
                <Card
                  title="Completed"
                  value={dashboard.overview?.completedAppointments}
                  icon={<IconCheck />}
                />
                <Card
                  title="Planned"
                  value={dashboard.overview?.plannedAppointments}
                  icon={<IconClock />}
                />
                <Card
                  title="Cancelled"
                  value={dashboard.overview?.cancelledAppointments}
                  icon={<IconX />}
                />
                <Card
                  title="Completion rate"
                  value={
                    dashboard.overview?.completionRate != null
                      ? `${dashboard.overview.completionRate}%`
                      : "—"
                  }
                  icon={<IconTrend />}
                />
              </div>

              {/* CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* STATUS PIE */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <SectionHeader title="Appointment status" subtitle="Distribution across all statuses" />

                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {statusData.map((item, index) => (
                          <Cell key={item.name} fill={getStatusColor(item.name, index)} />
                        ))}
                      </Pie>

                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: 13, color: "#6B7280" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* TOP SUBJECTS */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <SectionHeader title="Top 15 lesson topics" subtitle="Ranked by total lessons booked" />

                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={topicData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F6" />

                      <XAxis
                        dataKey="name"
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                        height={90}
                        tick={{ fontSize: 11, fill: "#9CA3AF" }}
                        axisLine={{ stroke: "#E5E7EB" }}
                        tickLine={false}
                      />

                      <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />

                      <Tooltip content={<CustomTooltip />} cursor={{ fill: BRAND_SOFT }} />

                      <Bar dataKey="value" fill={BRAND} radius={[6, 6, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SUBJECT TABLE */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
                <SectionHeader title="Top lesson topics" subtitle="Top 15 ranked breakdown" />

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: BRAND_SOFT }}>
                        <th className="p-3 text-left font-semibold text-gray-700 w-20">Rank</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Lesson topic</th>
                        <th className="p-3 text-left font-semibold text-gray-700 w-40">Total lessons</th>
                      </tr>
                    </thead>

                    <tbody>
                      {topicData.map((item, index) => (
                        <tr
                          key={item.name}
                          className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-3">
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
                              style={{ backgroundColor: BRAND_SOFT, color: BRAND }}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-gray-800">{item.name}</td>
                          <td className="p-3 text-gray-600">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ALL SUBJECTS */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <SectionHeader title="All lesson topics" subtitle={`${allTopics.length} topics total`} />

                <div className="overflow-x-auto max-h-[600px] rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0">
                      <tr style={{ backgroundColor: BRAND_SOFT }}>
                        <th className="p-3 text-left font-semibold text-gray-700">Topic</th>
                        <th className="p-3 text-left font-semibold text-gray-700 w-32">Lessons</th>
                      </tr>
                    </thead>

                    <tbody>
                      {allTopics.map(([topic, count], index) => (
                        <tr key={topic} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-gray-800">{topic}</td>
                          <td className="p-3 font-medium" style={{ color: BRAND_DARK }}>
                            {count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <p className="font-medium">No data available</p>
              <p className="text-sm mt-1">Try switching branches or refreshing the page.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AppointmentsDashboard;