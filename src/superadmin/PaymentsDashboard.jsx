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
const COLORS = [BRAND, "#10B981", "#F59E0B", "#EF4444"];

const StatCard = ({ title, value, accent }) => (
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
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
      <span
        style={{ background: BRAND_LIGHT }}
        className="inline-block w-1.5 h-5 rounded-full mr-1"
      />
      {title}
    </h2>
    {children}
  </div>
);

const PaymentsDashboard = () => {
  const [activeTab, setActiveTab] = useState("JLT");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async (branch) => {
    setLoading(true);
    try {
      const url =
        branch === "JLT"
          ? "https://api.frwrdtutors.com/api/admin/dashboardPaymentsBranch1017"
          : "https://api.frwrdtutors.com/api/admin/dashboardPaymentsBranch28866";
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
    setActiveTab(tab);
    fetchDashboard(tab);
  };

  const monthlyData = dashboard
    ? Object.entries(dashboard.paymentsByMonth || {}).map(([month, amount]) => ({
        month,
        amount,
      }))
    : [];

  const compareData = dashboard
    ? [
        {
          name: "Received",
          value: dashboard.overview?.totalPaymentsReceived,
        },
        {
          name: "Outstanding",
          value: dashboard.overview?.outstandingBalance,
        },
      ]
    : [];

  const collectionRate = dashboard?.overview?.collectionRate ?? 0;

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
                Finance
              </p>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Payments Dashboard
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
                  title="Payments Received"
                  value={`AED ${dashboard.overview?.totalPaymentsReceived?.toLocaleString()}`}
                />
                <StatCard
                  title="Paid Invoices"
                  value={dashboard.overview?.totalPaidInvoices}
                />
                <StatCard
                  title="Outstanding Balance"
                  value={`AED ${dashboard.overview?.outstandingBalance?.toLocaleString()}`}
                />
                <StatCard
                  title="Collection Rate"
                  value={`${collectionRate}%`}
                />
              </div>

              {/* Collection rate progress */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Collection Rate
                  </p>
                  <span className="text-sm font-bold" style={{ color: BRAND }}>
                    {collectionRate}%
                  </span>
                </div>
                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${collectionRate}%`, background: BRAND }}
                  />
                </div>
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <SectionCard title="Monthly Payments">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={monthlyData}
                      margin={{ top: 4, right: 8, bottom: 30, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis
                        dataKey="month"
                        angle={-30}
                        textAnchor="end"
                        tick={{ fontSize: 11 }}
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v) => [`AED ${Number(v).toLocaleString()}`, "Amount"]}
                        contentStyle={{
                          borderRadius: 10,
                          border: "none",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar dataKey="amount" fill={BRAND} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </SectionCard>

                <SectionCard title="Received vs Outstanding">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={compareData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={4}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {compareData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => `AED ${Number(v).toLocaleString()}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </SectionCard>
              </div>

              {/* Monthly Table */}
              <SectionCard title="Monthly Payment Collection">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        style={{ background: BRAND_LIGHT }}
                        className="text-left"
                      >
                        {["Month", "Amount Collected"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                            style={{ color: BRAND }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.map((item, index) => (
                        <tr
                          key={index}
                          className={`border-b hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {item.month}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            AED {Number(item.amount).toLocaleString()}
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

export default PaymentsDashboard;