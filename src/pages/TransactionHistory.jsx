import React, { useEffect, useState } from "react";
import Header from "../utils/header/Header";
import Sidebar from "../utils/sidebar/Sidebar";
import http from "../service/http";
import { useNavigate } from "react-router-dom";

const TransactionHistory = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get userData from localStorage
  const raw = localStorage.getItem("userdata");
  const userData = raw ? JSON.parse(raw) : null;
  const clientId = userData?.clientid;

  const branchid = localStorage.getItem("BranchId");
  // useEffect(() => {
  //   const fetchTransactions = async () => {
  //     try {
  //               const response = await http.get(`/proformainvoice?branch_id=${branchid}`);

  //       // Filter only matching client invoices
  //       const filtered = response.data?.data?.results.filter(
  //         (txn) => txn.client.id === clientId
  //       );

  //       setTransactions(filtered || []);
  //     } catch (error) {
  //       console.error("Error fetching transactions:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (clientId) {
  //     fetchTransactions();
  //   } else {
  //     setLoading(false);
  //   }
  // }, [clientId]);

  const PACKAGE_MAP = {
    2: "SILVER",
    3: "GOLD",
    4: "PLATINUM",
  };

  useEffect(() => {
    fetchPayments();
  }, []);
  const fetchPayments = async () => {
    try {
      const res = await http.get(`/payments/by-client/${clientId}`);

      const onlySuccess = res.data.data.filter(
        (txn) => txn.status === "SUCCESS",
      );

      console.log("onlySuccess", onlySuccess);
      setTransactions(onlySuccess);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // ✅ ADD THIS
    }
  };

  const getPackageNames = (packageIds) => {
    if (!packageIds) return "N/A";

    let ids = packageIds;

    // ✅ If string → parse JSON
    if (typeof packageIds === "string") {
      try {
        ids = JSON.parse(packageIds);
      } catch {
        return "N/A";
      }
    }

    // ✅ Ensure array
    if (!Array.isArray(ids)) return "N/A";

    return ids.map((id) => PACKAGE_MAP[id] || `Package-${id}`).join(", ");
  };

  const getStudentNames = (studentIds = []) => {
    if (!Array.isArray(studentIds) || !userData?.studentdetails) {
      return "N/A";
    }

    return studentIds
      .map((id) => {
        const student = userData.studentdetails.find(
          (s) => Number(s.id) === Number(id),
        );

        if (!student) return null;

        return `${student.first_name} ${student.last_name}`;
      })
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div
      className=" min-h-screen bg-[#EEEDFE]  p-4"
      style={{
        backgroundImage: "url('/Background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#EEEDFE", // ya koi fallback color
      }}
    >
      <Header
        title="Transactions History"
        leftIconOne="☰"
        onLeftOneClick={() => setIsMenuOpen(true)}
        leftIconTwo="←"
        onLeftTwoClick={() => window.history.back()}
        rightText="Renew"
        onRightTextClick={() => navigate("/new-booking")}
      />

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="bg-white max-w-md mx-auto rounded-lg mt-18 shadow-md overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No transactions found.
          </div>
        ) : (
          transactions.map((txn) => (
            <div
              key={txn.id}
              className="flex flex-col border-b border-dotted border-[#B1B1B1] px-4 py-3 text-sm hover:bg-gray-50"
            >
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Package: {getPackageNames(txn.package_ids)}
                </span>

                <span className="text-gray-600">
                  Student: {getStudentNames(txn.student_ids)}
                </span>

                <span className="font-medium">
                  {new Date(txn.created_at).toLocaleDateString()}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    txn.status === "SUCCESS"
                      ? "bg-green-100 text-green-700"
                      : txn.status === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {txn.status}
                </span>
              </div>
              <span className="text-gray-600">{txn.description}</span>
              <span className="mt-1 text-base font-semibold text-blue-600">
                AED {txn.amount}
              </span>
              {/* <span className="text-xs text-gray-400">
                Invoice ID: {txn.display_id}
              </span> */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
