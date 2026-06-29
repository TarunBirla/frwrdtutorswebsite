import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Select from "react-select";
import DataTable, { TabButton, Pagination } from "./DataTable";
import { CalendarDays, Search, RotateCcw } from "lucide-react";

const Appointment = () => {
  const [activeTab, setActiveTab] = useState("JLT");
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [clientId, setClientId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [tutorId, setTutorId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const columns = [
    // {
    //     key: "id",
    //     label: "Appointment ID",
    // },
    {
      key: "tutor",
      label: "Tutor",
      render: (row) => {
        try {
          const tutors =
            typeof row.cjas === "string" ? JSON.parse(row.cjas) : row.cjas;

          return tutors?.map((t) => t.name).join(", ") || "-";
        } catch {
          return "-";
        }
      },
    },
    {
      key: "topic",
      label: "Topic",
    },
    {
      key: "start",
      label: "Start Time",
      render: (row) =>
        new Date(row.start_time).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
    },
    {
      key: "finish",
      label: "Finish Time",
      render: (row) =>
        new Date(row.finish_time).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
          {row.status}{" "}
        </span>
      ),
    },
    {
      key: "service",
      label: "Service",
      render: (row) => row.service_name || "-",
    },
    {
      key: "rate",
      label: "Rate",
      render: (row) => {
        try {
          const service =
            typeof row.service === "string"
              ? JSON.parse(row.service)
              : row.service;

          return `AED ${service?.dft_charge_rate || 0}`;
        } catch {
          return "AED 0";
        }
      },
    },
  ];

  const fetchAppointments = async (brand, page = 1) => {
    setLoading(true);

    try {
      const url =
        brand === "JLT"
          ? `https://api.frwrdtutors.com/api/admin/all-appointmentsBranch1017?page=${page}`
          : `https://api.frwrdtutors.com/api/admin/all-appointmentsBranch28866?page=${page}`;

      const { data } = await axios.get(url);

      setAppointments(data.appointments || []);

      setTotalRecords(data.count || 0);

      setCurrentPage(page);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async (brand) => {
    try {
      const clientsUrl =
        brand === "JLT"
          ? "https://api.frwrdtutors.com/api/admin/all-clients-dropdown1017"
          : "https://api.frwrdtutors.com/api/admin/all-clients-dropdown28866";

      const studentsUrl =
        brand === "JLT"
          ? "https://api.frwrdtutors.com/api/admin/all-students-dropdown1017"
          : "https://api.frwrdtutors.com/api/admin/all-students-dropdown28866";

      const tutorsUrl =
        brand === "JLT"
          ? "https://api.frwrdtutors.com/api/admin/all-tutors-dropdown1017"
          : "https://api.frwrdtutors.com/api/admin/all-tutors-dropdown28866";

      const [clientsRes, studentsRes, tutorsRes] = await Promise.all([
        axios.get(clientsUrl),
        axios.get(studentsUrl),
        axios.get(tutorsUrl),
      ]);

      setClients(clientsRes.data.clients || []);
      setStudents(studentsRes.data.students || []);
      setTutors(tutorsRes.data.tutors || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = async () => {
    try {
      const url =
        activeTab === "JLT"
          ? "https://api.frwrdtutors.com/api/admin/filter-appointments1017"
          : "https://api.frwrdtutors.com/api/admin/filter-appointments28866";

      const { data } = await axios.get(url, {
        params: {
          client: clientId,
          recipient: studentId,
          contractor: tutorId,
        },
      });

      setAppointments(data.appointments || []);

      setTotalRecords(data.count || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const loadClientStudents = async (clientId) => {
    try {
      const url =
        activeTab === "JLT"
          ? `https://api.frwrdtutors.com/api/admin/client-students1017/${clientId}`
          : `https://api.frwrdtutors.com/api/admin/client-students28866/${clientId}`;

      const { data } = await axios.get(url);

      setStudents(data.students || []);
      setStudentId("");
    } catch (error) {
      console.log(error);
    }
  };
  const handleReset = () => {
    setClientId("");
    setStudentId("");
    setTutorId("");

    loadFilters(activeTab);

    fetchAppointments(activeTab, 1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    setClientId("");
    setStudentId("");
    setTutorId("");

    fetchAppointments(tab, 1);
    loadFilters(tab);
  };

  useEffect(() => {
    fetchAppointments("JLT", 1);
    loadFilters("JLT");
  }, []);

  const totalPages = Math.ceil(totalRecords / 100);

  return (
    <div className="flex bg-[#f7f7fc] min-h-screen">
      {" "}
      <Sidebar />
      <div className="flex-1">
        <Navbar />

        <main className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#3C3A86] flex items-center justify-center">
              <CalendarDays className="text-white" />
            </div>

            <div>
              <h2 className="font-bold text-lg">Appointments</h2>
              <p className="text-gray-400 text-sm">Manage Appointments</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex gap-2 mb-5">
              <TabButton
                label="JLT"
                active={activeTab === "JLT"}
                onClick={() => handleTabChange("JLT")}
              />

              <TabButton
                label="MTC"
                active={activeTab === "MTC"}
                onClick={() => handleTabChange("MTC")}
              />
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <Select
                placeholder="Search Client..."
                value={
                  clients.find((c) => c.id == clientId)
                    ? {
                        value: clientId,
                        label: `${
                          clients.find((c) => c.id == clientId)?.first_name
                        } ${clients.find((c) => c.id == clientId)?.last_name}`,
                      }
                    : null
                }
                options={clients.map((c) => ({
                  value: c.id,
                  label:
                    `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
                    c.email ||
                    `Client #${c.id}`,
                }))}
                onChange={(selected) => {
                  setClientId(selected?.value || "");

                  if (selected?.value) {
                    loadClientStudents(selected.value);
                  }
                }}
              />

              <Select
                placeholder="Search Student..."
                isClearable
                options={students.map((s) => ({
                  value: s.id,
                  label:
                    `${s.first_name || ""} ${s.last_name || ""}`.trim() ||
                    s.email ||
                    `Student #${s.id}`,
                }))}
                value={
                  students.find((s) => s.id == studentId)
                    ? {
                        value: studentId,
                        label: `${
                          students.find((s) => s.id == studentId)?.first_name
                        } ${
                          students.find((s) => s.id == studentId)?.last_name
                        }`,
                      }
                    : null
                }
                onChange={(selected) => setStudentId(selected?.value || "")}
                className="text-sm"
              />

              <Select
                placeholder="Search Tutor..."
                isClearable
                options={tutors.map((t) => ({
                  value: t.id,
                  label:
                    `${t.first_name || ""} ${t.last_name || ""}`.trim() ||
                    t.email ||
                    `Tutor #${t.id}`,
                }))}
                value={
                  tutors.find((t) => t.id == tutorId)
                    ? {
                        value: tutorId,
                        label: `${
                          tutors.find((t) => t.id == tutorId)?.first_name
                        } ${tutors.find((t) => t.id == tutorId)?.last_name}`,
                      }
                    : null
                }
                onChange={(selected) => setTutorId(selected?.value || "")}
                className="text-sm"
              />

              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleSearch}
                  className="bg-[#3C3A86] text-white px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <Search size={16} />
                  Search
                </button>

                <button
                  onClick={handleReset}
                  className="bg-gray-200 px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </div>

            {/* <div className="flex gap-3 mb-6">
                            <button
                                onClick={handleSearch}
                                className="bg-[#3C3A86] text-white px-4 py-2 rounded-xl flex items-center gap-2"
                            >
                                <Search size={16} />
                                Search
                            </button>

                            <button
                                onClick={handleReset}
                                className="bg-gray-200 px-4 py-2 rounded-xl flex items-center gap-2"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>
                        </div> */}

            <DataTable
              columns={columns}
              rows={appointments}
              loading={loading}
              emptyMessage="No Appointments Found"
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => fetchAppointments(activeTab, page)}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Appointment;
