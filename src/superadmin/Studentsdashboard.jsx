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
  CartesianGrid,
  Tooltip,
} from "recharts";

const BRAND = "#3C3A86";
const BRAND_LIGHT = "#EBEBF8";

const StatCard = ({ title, value, accent, sub }) => (
  <div
    style={{
      background: accent ? BRAND : "#fff",
      color: accent ? "#fff" : "#111827",
      border: `1px solid ${accent ? BRAND : "#E5E7EB"}`,
    }}
    className="rounded-2xl p-5 shadow-sm flex flex-col gap-1 hover:shadow-md transition-all"
  >
    <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
      {title}
    </p>
    <h3 className="text-2xl font-extrabold mt-1">{value ?? "—"}</h3>
    {sub && (
      <p className="text-xs opacity-50 mt-0.5">{sub}</p>
    )}
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

const StudentsDashboard = () => {
  const [activeTab, setActiveTab] = useState("JLT");
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);

  const fetchDashboard = async (branch) => {
    setLoading(true);
    try {
      const url =
        branch === "JLT"
          ? "https://api.frwrdtutors.com/api/admin/dashboardStudentsBranch1017"
          : "https://api.frwrdtutors.com/api/admin/dashboardStudentsBranch28866";
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

  const academicData = dashboard
    ? Object.entries(dashboard.academicYearDistribution || {}).map(
        ([name, students]) => ({ name, students })
      )
    : [];

  const photoRate = dashboard
    ? Math.round(
        (dashboard.overview.studentsWithPhoto /
          dashboard.overview.totalStudents) *
          100
      )
    : 0;

  const payingRate = dashboard
    ? Math.round(
        (dashboard.overview.studentsWithPayingClient /
          dashboard.overview.totalStudents) *
          100
      )
    : 0;

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
                Students Dashboard
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <StatCard
                  accent
                  title="Total Students"
                  value={dashboard.overview.totalStudents}
                />
                <StatCard
                  title="New This Month"
                  value={dashboard.overview.newStudentsThisMonth}
                />
                {/* <StatCard
                  title="With Photo"
                  value={dashboard.overview.studentsWithPhoto}
                  sub={`${photoRate}% coverage`}
                /> */}
                {/* <StatCard
                  title="Without Photo"
                  value={dashboard.overview.studentsWithoutPhoto}
                /> */}
                <StatCard
                  title="Paying Client"
                  value={dashboard.overview.studentsWithPayingClient}
                  sub={`${payingRate}% of total`}
                />
                <StatCard
                  title="Without Client"
                  value={dashboard.overview.studentsWithoutPayingClient}
                />
              </div>

            

              {/* Bar Chart */}
              <SectionCard title="Academic Year Distribution">
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart
                    data={academicData}
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
                    <Bar
                      dataKey="students"
                      fill={BRAND}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default StudentsDashboard;


