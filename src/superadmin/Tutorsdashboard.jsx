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

const BRAND = "#3C3A86";
const BRAND_LIGHT = "#EBEBF8";
const COLORS = ["#3C3A86", "#10B981", "#F59E0B", "#EF4444"];

const StatCard = ({ title, value, accent }) => (
  <div
    style={{
      background: accent ? BRAND : "#fff",
      color: accent ? "#fff" : "#111827",
      border: `1px solid ${accent ? BRAND : "#E5E7EB"}`,
    }}
    className="rounded-2xl p-5 shadow-sm flex flex-col gap-1 transition-all hover:shadow-md"
  >
    <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
      {title}
    </p>
    <h3 className="text-2xl font-extrabold mt-1">{value ?? "—"}</h3>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
    <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
      <span
        style={{ background: BRAND_LIGHT, color: BRAND }}
        className="inline-block w-1.5 h-5 rounded-full mr-1"
      />
      {title}
    </h2>
    {children}
  </div>
);

const TutorsDashboard = () => {
  const [activeTab, setActiveTab] = useState("JLT");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async (branch) => {
    setLoading(true);
    try {
      const url =
        branch === "JLT"
          ? "https://api.frwrdtutors.com/api/admin/dashboardTutorsBranch1017"
          : "https://api.frwrdtutors.com/api/admin/dashboardTutorsBranch28866";
      const { data } = await axios.get(url);
      setDashboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard("JLT");
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchDashboard(tab);
  };

  const statusData = dashboard
    ? Object.entries(dashboard.statusDistribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const subjectData = dashboard
    ? Object.entries(dashboard.subjectDistribution).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  const qualificationData = dashboard
    ? Object.entries(dashboard.qualificationDistribution).map(
        ([name, count]) => ({ name, count })
      )
    : [];

  const statusBadge = (status) => {
    const map = {
      approved: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      rejected: "bg-red-100 text-red-700",
      dormant: "bg-gray-100 text-gray-600",
    };
    return map[status?.toLowerCase()] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="flex bg-[#F7F7FC] min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 max-w-screen-xl mx-auto w-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Overview
              </p>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Tutors Dashboard
              </h1>
            </div>
            <div
              className="flex gap-1 p-1 rounded-xl"
              style={{ background: BRAND_LIGHT }}
            >
              {["JLT", "MTC"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={
                    activeTab === tab
                      ? {
                          background: BRAND,
                          color: "#fff",
                          boxShadow: "0 2px 8px rgba(60,58,134,0.25)",
                        }
                      : { color: BRAND }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div
                className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }}
              />
            </div>
          ) : dashboard ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  accent
                  title="Total Tutors"
                  value={dashboard.overview.totalTutors}
                />
                <StatCard
                  title="Approved"
                  value={dashboard.overview.approvedTutors}
                />
                <StatCard
                  title="Pending"
                  value={dashboard.overview.pendingTutors}
                />
                <StatCard
                  title="Dormant"
                  value={dashboard.overview.dormantTutors}
                />
                <StatCard
                  title="Rejected"
                  value={dashboard.overview.rejectedTutors}
                />
                <StatCard
                  title="Avg Rating"
                  value={dashboard.overview.averageRating}
                />
                <StatCard
                  title="Total Revenue"
                  value={`AED ${dashboard.overview.totalRevenue?.toLocaleString()}`}
                />
                <StatCard
                  title="Revenue / Tutor"
                  value={`AED ${dashboard.overview.averageRevenuePerTutor?.toLocaleString()}`}
                />
              </div>

              {/* Pie — Status */}
              <SectionCard title="Tutor Status Distribution">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={55}
                      paddingAngle={3}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {statusData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* Bar — Subjects */}
              <SectionCard title="Subject Distribution">
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={subjectData}
                    margin={{ top: 4, right: 16, bottom: 40, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis
                      dataKey="name"
                      angle={-30}
                      textAnchor="end"
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="count" fill={BRAND} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* Bar — Qualifications */}
              <SectionCard title="Qualification Distribution">
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={qualificationData}
                    margin={{ top: 4, right: 16, bottom: 40, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis
                      dataKey="name"
                      angle={-30}
                      textAnchor="end"
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* Top Tutors Table */}
              <SectionCard title="Top Tutors">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        style={{ background: BRAND_LIGHT }}
                        className="text-left"
                      >
                        {["Name", "Email", "Rating", "Revenue", "Status"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 py-3 font-semibold text-xs uppercase tracking-wider"
                              style={{ color: BRAND }}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.topTutors.map((tutor, i) => (
                        <tr
                          key={tutor.id}
                          className={`border-b transition-colors hover:bg-gray-50 ${
                            i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {tutor.name}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {tutor.email}
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 font-semibold text-yellow-500">
                              ★ {tutor.rating}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            AED {Number(tutor.revenue).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(
                                tutor.status
                              )}`}
                            >
                              {tutor.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default TutorsDashboard;