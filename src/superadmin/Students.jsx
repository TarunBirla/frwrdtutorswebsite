import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import DataTable, { TabButton, Pagination } from "./DataTable";
import { GraduationCap } from "lucide-react";

const TABS = [
  { key: "JLT", label: "JLT Students" },
  { key: "MTC", label: "MTC Students" },
];

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "email", label: "Email" },
  // {
  //   key: "role_type",
  //   label: "Role",
  //   render: (row) => (
  //     <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#5D4C29]/10 text-[#5D4C29]">
  //       {row.role_type}
  //     </span>
  //   ),
  // },
];

const Students = () => {
  const [activeTab, setActiveTab] = useState("JLT");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");

  const fetchStudents = async (brand, page = 1) => {
    setLoading(true);
    try {
      const base =
        brand === "JLT"
          ? "https://api.frwrdtutors.com/api/admin/all-studentsBranch1017"
          : "https://api.frwrdtutors.com/api/admin/all-studentsBranch28866";
      const { data } = await axios.get(`${base}?page=${page}`);
      setStudents(data.students || []);
      setTotalRecords(data.count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents("JLT", 1);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    fetchStudents(tab, 1);
  };

  const filteredStudents = students.filter((student) =>
    `${student.first_name} ${student.last_name} ${student.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
              style={{ backgroundColor: "#5D4C29" }}
            >
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Students</h2>
              <p className="text-sm text-gray-400">
                Manage all students across branches
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
                style={{ backgroundColor: "#5D4C2918", color: "#5D4C29" }}
              >
                Total: {totalRecords.toLocaleString()} students
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by Name or Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-96 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5D4C29]"
              />
            </div>

            {/* Table */}
            <DataTable
              columns={COLUMNS}
              rows={filteredStudents}
              loading={loading}
              emptyMessage="No students found for this branch"
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => fetchStudents(activeTab, p)}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Students;