import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import DataTable, { TabButton, Pagination } from "./DataTable";
import { UserCog } from "lucide-react";

const TABS = [
  { key: "JLT", label: "JLT Tutors" },
  { key: "MTC", label: "MTC Tutors" },
];

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "email", label: "Email" },
];

const Tutors = () => {
  const [activeTab, setActiveTab] = useState("JLT");
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [dormantCount, setDormantCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const fetchTutors = async (
    brand,
    page = 1,
    searchText = "",
    status = "all",
  ) => {
    setLoading(true);

    try {
      const base =
        brand === "JLT"
          ? "https://api.frwrdtutors.com/api/admin/all-tutorsBranch1017"
          : "https://api.frwrdtutors.com/api/admin/all-tutorsBranch28866";

      const { data } = await axios.get(base, {
        params: {
          page,
          search: searchText,
          status,
        },
      });

      setTutors(data.tutors);
      setTotalRecords(data.count);

      setApprovedCount(data.approvedCount);
      setPendingCount(data.pendingCount);
      setDormantCount(data.dormantCount);
      setRejectedCount(data.rejectedCount);

      setCurrentPage(page);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTutors(activeTab, 1, search, statusFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, search, statusFilter]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    setCurrentPage(1);
  };

  // const filteredTutors = tutors.filter((tutor) => {
  //     const searchMatch =
  //         `${tutor.first_name} ${tutor.last_name} ${tutor.email}`
  //             .toLowerCase()
  //             .includes(search.toLowerCase());

  //     const statusMatch =
  //         statusFilter === "all"
  //             ? true
  //             : tutor.status?.toLowerCase() === statusFilter;

  //     return searchMatch && statusMatch;
  // });

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
              <UserCog size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Tutors</h2>
              <p className="text-sm text-gray-400">
                Manage all tutors across branches
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
                    onClick={() => handleTabChange(t.key)}
                  />
                ))}
              </div>

              <div
                className="text-sm font-medium px-4 py-2 rounded-xl"
                style={{
                  backgroundColor: "#3C3A8618",
                  color: "#3C3A86",
                }}
              >
                <div className="flex flex-wrap gap-2">
                  <div className="px-4 py-2 rounded-xl bg-[#3C3A8618] text-[#3C3A86] text-sm font-medium">
                    Total: {totalRecords}
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-medium">
                    Active: {approvedCount}
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-yellow-100 text-yellow-700 text-sm font-medium">
                    Pending: {pendingCount}
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-red-100 text-red-700 text-sm font-medium">
                    Inactive: {dormantCount}
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-sm font-medium">
                    Rejected: {rejectedCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm ${
                  statusFilter === "all"
                    ? "bg-[#3C3A86] text-white"
                    : "bg-gray-100"
                }`}
              >
                All ({totalRecords})
              </button>

              <button
                onClick={() => setStatusFilter("approved")}
                className={`px-4 py-2 rounded-lg text-sm ${
                  statusFilter === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-700"
                }`}
              >
                Active ({approvedCount})
              </button>

              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-4 py-2 rounded-lg text-sm ${
                  statusFilter === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                Pending ({pendingCount})
              </button>

              <button
                onClick={() => setStatusFilter("dormant")}
                className={`px-4 py-2 rounded-lg text-sm ${
                  statusFilter === "dormant"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-700"
                }`}
              >
                Inactive ({dormantCount})
              </button>

              <button
                onClick={() => setStatusFilter("rejected")}
                className={`px-4 py-2 rounded-lg text-sm ${
                  statusFilter === "rejected"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by Name or Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-96 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3C3A86]"
              />
            </div>

            {/* Table */}
            <DataTable
              columns={COLUMNS}
              rows={tutors}
              loading={loading}
              emptyMessage="No tutors found for this branch"
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalRecords / 100)}
              onPageChange={(page) => {
                fetchTutors(activeTab, page, search, statusFilter);
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Tutors;
