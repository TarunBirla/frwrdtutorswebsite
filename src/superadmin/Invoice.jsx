import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { TabButton, Pagination } from "./DataTable";
import { FileText } from "lucide-react";

const TABS = [
  { key: "JLT", label: "JLT Invoices" },
  { key: "MTC", label: "MTC Invoices" },
];

const statusStyle = {
  paid: "bg-green-50 text-green-700",
  void: "bg-red-50 text-red-600",
  unpaid: "bg-yellow-50 text-yellow-700",
  draft: "bg-gray-100 text-gray-600",
};

const Invoice = () => {
  const [activeTab, setActiveTab] = useState("JLT");
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async (brand, page = 1) => {
    setLoading(true);
    try {
      const base =
        brand === "JLT"
          ? "https://api.frwrdtutors.com/api/admin/all-invoicesBranch1017"
          : "https://api.frwrdtutors.com/api/admin/all-invoicesBranch28866";
      const { data } = await axios.get(`${base}?page=${page}`);
      setInvoices(data.invoices || []);
      setTotalRecords(data.count || 0);
      setCurrentPage(page);
      setActiveTab(brand);
    } catch (err) {
      console.error(err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices("JLT", 1);
  }, []);

  const totalPages = Math.ceil(totalRecords / 100);

  return (
    <div className="flex bg-[#f7f7fc] min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="p-6 flex-1">
          {/* Page Header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#3C3A86" }}
            >
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Invoices</h2>
              <p className="text-sm text-gray-400">
                Track and manage invoices across branches
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Tabs + Stats */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex gap-2">
                {TABS.map((t) => (
                  <TabButton
                    key={t.key}
                    label={t.label}
                    active={activeTab === t.key}
                    onClick={() => fetchInvoices(t.key, 1)}
                  />
                ))}
              </div>

              <div
                className="text-sm font-medium px-4 py-2 rounded-xl"
                style={{ backgroundColor: "#3C3A8618", color: "#3C3A86" }}
              >
                Total: {totalRecords.toLocaleString()} invoices
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div
                  className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mb-3"
                  style={{ borderColor: "#3C3A86", borderTopColor: "transparent" }}
                />
                <p className="text-sm">Loading invoices...</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5fb" }}>
                      {["Invoice", "Client", "Email", "Amount", "Status", "Date"].map(
                        (col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide"
                            style={{ color: "#3C3A86" }}
                          >
                            {col}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {invoices.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-12 text-gray-400"
                        >
                          No invoices found for this branch
                        </td>
                      </tr>
                    ) : (
                      invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-t border-gray-50 hover:bg-[#f5f5fb]/60 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-[#3C3A86]">
                            {invoice.display_id}
                          </td>

                          <td className="px-4 py-3 text-gray-700">
                            {invoice.client_name}{" "}
                          </td>

                          <td className="px-4 py-3 text-gray-500">
                            {invoice.client_email ?? "—"}
                          </td>

                          <td className="px-4 py-3 font-semibold text-gray-800">
                            AED {Number(invoice.amount).toLocaleString()}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                statusStyle[invoice.status] ??
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-gray-500">
                            {invoice.date_sent
                              ? new Date(invoice.date_sent).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => fetchInvoices(activeTab, p)}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Invoice;