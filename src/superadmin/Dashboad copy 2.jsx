import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("JLT");
    const [loading, setLoading] = useState(false);

    const [stats, setStats] = useState({
        clients: 0,
        students: 0,
        tutors: 0,
        revenue: 0,
    });

    const fetchDashboardData = async (brand) => {
        setLoading(true);

        try {
            let clientsUrl = "";
            let studentsUrl = "";
            let tutorsUrl = "";
            let invoicesUrl = "";

            if (brand === "JLT") {
                clientsUrl =
                    "https://api.frwrdtutors.com/api/admin/all-clientsBranch1017?page=1";

                studentsUrl =
                    "https://api.frwrdtutors.com/api/admin/all-studentsBranch1017?page=1";

                tutorsUrl =
                    "https://api.frwrdtutors.com/api/admin/all-tutorsBranch1017?page=1";

                invoicesUrl =
                    "https://api.frwrdtutors.com/api/admin/all-invoicesBranch1017?page=1";
            } else {
                clientsUrl =
                    "https://api.frwrdtutors.com/api/admin/all-clientsBranch28866?page=1";

                studentsUrl =
                    "https://api.frwrdtutors.com/api/admin/all-studentsBranch28866?page=1";

                tutorsUrl =
                    "https://api.frwrdtutors.com/api/admin/all-tutorsBranch28866?page=1";

                invoicesUrl =
                    "https://api.frwrdtutors.com/api/admin/all-invoicesBranch28866?page=1";
            }

            const [
                clientsRes,
                studentsRes,
                tutorsRes,
                invoicesRes,
            ] = await Promise.all([
                axios.get(clientsUrl),
                axios.get(studentsUrl),
                axios.get(tutorsUrl),
                axios.get(invoicesUrl),
            ]);

            const revenue =
                invoicesRes.data.invoices?.reduce(
                    (sum, item) =>
                        sum + Number(item.amount || 0),
                    0
                ) || 0;

            setStats({
                clients: clientsRes.data.count || 0,
                students: studentsRes.data.count || 0,
                tutors: tutorsRes.data.count || 0,
                revenue: revenue.toFixed(2),
            });

            setActiveTab(brand);
        } catch (error) {
            console.log(error);
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
            value: stats.clients,
        },
        {
            title: "Total Students",
            value: stats.students,
        },
        {
            title: "Total Tutors",
            value: stats.tutors,
        },
        {
            title: "Revenue",
            value: `AED ${stats.revenue}`,
        },
    ];

    return (
        <div className="flex bg-slate-100 min-h-screen">
            <Sidebar />

            <div className="flex-1">
                <Navbar />

                <div className="p-6">
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() =>
                                fetchDashboardData("JLT")
                            }
                            className={`px-6 py-2 rounded-lg font-medium ${
                                activeTab === "JLT"
                                    ? "bg-[#3C3A86] text-white"
                                    : "bg-gray-200"
                            }`}
                        >
                            JLT Dashboard
                        </button>

                        <button
                            onClick={() =>
                                fetchDashboardData("MTC")
                            }
                            className={`px-6 py-2 rounded-lg font-medium ${
                                activeTab === "MTC"
                                    ? "bg-[#3C3A86] text-white"
                                    : "bg-gray-200"
                            }`}
                        >
                            MTC Dashboard
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold mb-6">
                        {activeTab} Dashboard
                    </h2>

                    {loading ? (
                        <div className="text-center py-10">
                            Loading...
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
                            {cards.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl shadow-md p-6"
                                >
                                    <h4 className="text-gray-500">
                                        {item.title}
                                    </h4>

                                    <h2 className="text-3xl font-bold mt-2 text-indigo-600">
                                        {item.value}
                                    </h2>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
