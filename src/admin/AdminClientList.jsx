import React, { useEffect, useMemo, useState } from "react";
import httpadmin from "../service/httpadmin";
import { useNavigate } from "react-router-dom";

const AdminClientList = () => {
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState(null);

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);

    const clientsPerPage = 10;

    // FETCH CLIENTS
    const fetchClients = async (searchValue = "") => {
        try {
            const response = await httpadmin.get(
                `/all-clients?search=${searchValue}`,
            );

            setClients(response.data.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    // DEFAULT CLIENTS
    useEffect(() => {
        fetchClients();
    }, []);

    // SEARCH
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchClients(search);
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(delay);
    }, [search]);

    // PAGINATION LOGIC
    const totalPages = Math.ceil(clients.length / clientsPerPage);

    const currentClients = useMemo(() => {
        const startIndex = (currentPage - 1) * clientsPerPage;

        return clients.slice(startIndex, startIndex + clientsPerPage);
    }, [clients, currentPage]);

    // CLIENT CLICK
    const handleClientClick = (client) => {
        setSelectedClient(client.clientid);

        let parsedStudents = [];

        if (typeof client.studentdetails === "string") {
            try {
                parsedStudents = JSON.parse(client.studentdetails);
            } catch (e) {
                console.log("Student Parse Error", e);
            }
        }

        const responseUser = {
            clientid: client.clientid,
            firstname: client.firstname,
            lastname: client.lastname,
            email: client.email,
            studentdetails: parsedStudents,
            status: client.status,
            branch_id: client.branch_id,
            phone_number: client.phone_number,
        };

        // SAVE
        localStorage.setItem("token", "admin_client_login");

        localStorage.setItem("clientid", client.clientid);

        localStorage.setItem("BranchId", client.branch_id);

        localStorage.setItem("adminuserdata", JSON.stringify(responseUser));

        navigate("/admin/new-booking");
    };

    return (
        <div className="w-full">
            {/* HEADER */}
            <div className="mb-5">
                <h1 className="text-2xl font-bold text-[#434343]">Clients</h1>

                <p className="text-sm text-gray-500 mt-1">
                    Total Clients : {clients.length}
                </p>
            </div>

            {/* SEARCH */}
            <div className="mb-5">
                <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="
                        w-full
                        border
                        border-gray-300
                        bg-white
                        rounded-xl
                        px-4
                        py-3
                        outline-none
                        shadow-sm
                        focus:border-[#49479D]
                    "
                />
            </div>

            {/* CLIENT LIST */}
            <div className="grid gap-4">
                {currentClients.length > 0 ? (
                    currentClients.map((item) => (
                        <div
                            key={item.clientid}
                            onClick={() => handleClientClick(item)}
                            className={`
                                rounded-2xl
                                p-4
                                cursor-pointer
                                transition
                                border-2
                                shadow-sm
                                bg-white
                                hover:shadow-md
                                hover:scale-[1.01]

                                ${
                                    selectedClient === item.clientid
                                        ? "border-[#49479D] bg-[#F4F3FF]"
                                        : "border-gray-200"
                                }
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-[#434343]">
                                        {item.firstname} {item.lastname}
                                    </h2>

                                    <p className="text-sm text-gray-600 mt-1">
                                        {item.email || "No Email"}
                                    </p>

                                    <p className="text-sm text-gray-600 mt-1">
                                        {item.phone_number || "No Phone"}
                                    </p>
                                </div>

                                <div>
                                    {/* <span
                                        className={`
                                            text-xs
                                            px-3
                                            py-1
                                            rounded-full
                                            font-semibold

                                            ${
                                                item.status ===
                                                "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }
                                        `}
                                    >
                                        {item.status || "new_user"}
                                    </span> */}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <h1 className="text-gray-500 text-lg">
                            No clients found
                        </h1>
                    </div>
                )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                    {/* PREV */}
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className={`
                px-4 py-2 rounded-xl border font-medium transition

                ${
                    currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-gray-100"
                }
            `}
                    >
                        Prev
                    </button>

                    {/* PAGINATION NUMBERS */}
                    {(() => {
                        const pages = [];

                        // ALWAYS FIRST PAGE
                        pages.push(1);

                        // LEFT DOTS
                        if (currentPage > 3) {
                            pages.push("...");
                        }

                        // CURRENT AREA
                        for (
                            let i = currentPage - 1;
                            i <= currentPage + 1;
                            i++
                        ) {
                            if (i > 1 && i < totalPages) {
                                pages.push(i);
                            }
                        }

                        // RIGHT DOTS
                        if (currentPage < totalPages - 2) {
                            pages.push("...");
                        }

                        // ALWAYS LAST PAGE
                        if (totalPages > 1) {
                            pages.push(totalPages);
                        }

                        // REMOVE DUPLICATES
                        const uniquePages = [...new Set(pages)];

                        return uniquePages.map((page, index) => (
                            <button
                                key={index}
                                disabled={page === "..."}
                                onClick={() =>
                                    page !== "..." && setCurrentPage(page)
                                }
                                className={`
                        min-w-[42px]
                        h-[42px]
                        px-3
                        rounded-xl
                        border
                        font-semibold
                        transition

                        ${
                            currentPage === page
                                ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                                : page === "..."
                                  ? "border-none bg-transparent cursor-default"
                                  : "bg-white hover:bg-gray-100"
                        }
                    `}
                            >
                                {page}
                            </button>
                        ));
                    })()}

                    {/* NEXT */}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className={`
                px-4 py-2 rounded-xl border font-medium transition

                ${
                    currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-gray-100"
                }
            `}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminClientList;
