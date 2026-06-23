import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import DataTable, { TabButton, Pagination } from "./DataTable";
import { Users, GraduationCap, X } from "lucide-react";

const TABS = [
    { key: "JLT", label: "JLT Clients" },
    { key: "MTC", label: "MTC Clients" },
];

const Clients = () => {
    const COLUMNS = [
        { key: "id", label: "ID" },
        { key: "first_name", label: "First Name" },
        { key: "last_name", label: "Last Name" },
        { key: "email", label: "Email" },

        {
            key: "students",
            label: "Students",
            render: (row) => (
                <button
                    onClick={() => handleViewStudents(row)}
                    className="px-3 py-1 bg-[#3C3A86] text-white rounded-lg text-xs hover:bg-[#3d3b85] transition-colors"
                >
                    View Students
                </button>
            ),
        },
    ];

    const [activeTab, setActiveTab] = useState("JLT");
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [studentsModal, setStudentsModal] = useState(false);
    const [search, setSearch] = useState("");
    const [students, setStudents] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [studentSearch, setStudentSearch] = useState("");
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [activeCount, setActiveCount] = useState(0);
    const [inactiveCount, setInactiveCount] = useState(0);

    const fetchClients = async (brand, page = 1, status = "all") => {
        setLoading(true);

        try {
            const base =
                brand === "JLT"
                    ? "https://api.frwrdtutors.com/api/admin/all-clientsBranch1017"
                    : "https://api.frwrdtutors.com/api/admin/all-clientsBranch28866";

            const { data } = await axios.get(
                `${base}?page=${page}&status=${status}`,
            );

            setClients(data.clients || []);
            setTotalRecords(data.count || 0);
            setCurrentPage(page);

            setActiveCount(data.activeCount || 0);
            setInactiveCount(data.inactiveCount || 0);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewStudents = async (client) => {
        setSelectedClient(client);
        setStudentsModal(true);
        setStudentSearch("");
        setStudentsLoading(true);
        try {
            const url =
                activeTab === "JLT"
                    ? `https://api.frwrdtutors.com/api/admin/client-students1017/${client.id}`
                    : `https://api.frwrdtutors.com/api/admin/client-students28866/${client.id}`;
            const { data } = await axios.get(url);
            setStudents(data.students || []);
        } catch (err) {
            console.log(err);
            setStudents([]);
        } finally {
            setStudentsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setStudentsModal(false);
        setStudents([]);
        setSelectedClient(null);
        setStudentSearch("");
    };

    useEffect(() => {
        fetchClients("JLT", 1);
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearch("");
        fetchClients(tab, 1);
    };

    const filteredClients = clients.filter((client) =>
    `${client.first_name} ${client.last_name} ${client.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
);

    const filteredStudents = students.filter((student) =>
        `${student.first_name} ${student.last_name} ${student.email}`
            .toLowerCase()
            .includes(studentSearch.toLowerCase()),
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
                            style={{ backgroundColor: "#3C3A86" }}
                        >
                            <Users size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">
                                Clients
                            </h2>
                            <p className="text-sm text-gray-400">
                                Manage all clients across branches
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
                                <div className="flex gap-3 flex-wrap">
                                    <div className="px-4 py-2 rounded-xl bg-[#3C3A8618] text-[#3C3A86] text-sm font-medium">
                                        Total: {totalRecords}
                                    </div>

                                    <div className="px-4 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-medium">
                                        Active: {activeCount}
                                    </div>

                                    <div className="px-4 py-2 rounded-xl bg-red-100 text-red-700 text-sm font-medium">
                                        Inactive: {inactiveCount}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <button
                                // onClick={() => setStatusFilter("all")}
                                onClick={() => {
                                    setStatusFilter("all");
                                    fetchClients(activeTab, 1, "all");
                                }}
                                className={`px-4 py-2 rounded-lg text-sm ${
                                    statusFilter === "all"
                                        ? "bg-[#3C3A86] text-white"
                                        : "bg-gray-100"
                                }`}
                            >
                                All ({totalRecords})
                            </button>

                            <button
                                onClick={() => {
                                    setStatusFilter("active");
                                    fetchClients(activeTab, 1, "live");
                                }}
                                className={`px-4 py-2 rounded-lg text-sm ${
                                    statusFilter === "active"
                                        ? "bg-green-600 text-white"
                                        : "bg-green-100 text-green-700"
                                }`}
                            >
                                Active ({activeCount})
                            </button>

                            <button
                                onClick={() => {
                                    setStatusFilter("inactive");
                                    fetchClients(activeTab, 1, "dormant");
                                }}
                                className={`px-4 py-2 rounded-lg text-sm ${
                                    statusFilter === "inactive"
                                        ? "bg-red-600 text-white"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                Inactive ({inactiveCount})
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
                            rows={filteredClients}
                            loading={loading}
                            emptyMessage="No clients found"
                        />

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(p) =>
                                fetchClients(
                                    activeTab,
                                    p,
                                    statusFilter === "active"
                                        ? "live"
                                        : statusFilter === "inactive"
                                          ? "dormant"
                                          : "all",
                                )
                            }
                        />
                    </div>
                </main>

                {/* Students Modal */}
                {studentsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
                        <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: "#3C3A86" }}
                                    >
                                        <GraduationCap
                                            size={18}
                                            className="text-white"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">
                                            {selectedClient
                                                ? `${selectedClient.first_name} ${selectedClient.last_name}'s Students`
                                                : "Student List"}
                                        </h2>
                                        <p className="text-xs text-gray-400">
                                            {studentsLoading
                                                ? "Loading..."
                                                : `${filteredStudents.length} student${filteredStudents.length !== 1 ? "s" : ""} found`}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Search inside modal */}
                            {/* <div className="px-6 pt-4 pb-2">
                                <input
                                    type="text"
                                    placeholder="Search students by name or email..."
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C3A86]"
                                />
                            </div> */}

                            {/* Modal Body */}
                            <div className="overflow-auto flex-1 px-6 pb-6 pt-2">
                                {studentsLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="w-8 h-8 border-4 border-[#3C3A86]/20 border-t-[#3C3A86] rounded-full animate-spin" />
                                    </div>
                                ) : filteredStudents.length > 0 ? (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-l-xl">
                                                    ID
                                                </th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                                                    First Name
                                                </th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                                                    Last Name
                                                </th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-r-xl">
                                                    Email
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map(
                                                (student, index) => (
                                                    <tr
                                                        key={student.id}
                                                        className={`border-b border-gray-50 hover:bg-[#3C3A86]/5 transition-colors ${
                                                            index % 2 === 0
                                                                ? "bg-white"
                                                                : "bg-gray-50/50"
                                                        }`}
                                                    >
                                                        <td className="py-3 px-4 text-gray-500 text-xs">
                                                            {student.id}
                                                        </td>
                                                        <td className="py-3 px-4 font-medium text-gray-800">
                                                            {student.first_name}
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-700">
                                                            {student.last_name}
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-500">
                                                            {student.email}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                        <GraduationCap
                                            size={40}
                                            className="mb-3 opacity-30"
                                        />
                                        <p className="text-sm font-medium">
                                            No students found
                                        </p>
                                        {studentSearch && (
                                            <p className="text-xs mt-1">
                                                Try a different search term
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clients;
