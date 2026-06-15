import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../utils/header/Header";
import Sidebar from "../utils/sidebar/Sidebar";
import http from "../service/http";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";

const Censelled = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const PaymentFailed = async () => {
      try {
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: "Your payment could not be processed.",
          timer: 2000, // Auto close after 2 seconds
          showConfirmButton: false,
        });

        // Wait for 2 seconds before redirect
        setTimeout(() => {
          clearStorageAndRedirect();
        }, 2000);
      } catch (error) {
        clearStorageAndRedirect();
      } finally {
        setLoading(false);
      }
    };

    PaymentFailed();
  }, []);

  const clearStorageAndRedirect = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key !== "userdata" && key !== "token" && key !== "BranchId") {
        localStorage.removeItem(key);
      }
    });
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen bg-[#F0EDFF]"
      style={{
        backgroundImage: "url('/Background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#EEEDFE",
      }}
    >
      <Header title="Payment Cancelled" />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="max-w-md mx-auto pt-20 px-4 space-y-4 text-center">
        {loading ? (
          <div className="flex justify-center items-center">
            <CircularProgress />
            <p className="ml-2">Verifying payment...</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-yellow-600">
              Payment Cancelled ❌
            </h1>
            <p>Your payment has been cancelled.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Censelled;
