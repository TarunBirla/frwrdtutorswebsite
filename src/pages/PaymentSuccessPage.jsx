import React, { useEffect, useState } from "react";

import { Check } from "lucide-react"; // Optional: or use an SVG image
import Header from "../utils/header/Header";
import Sidebar from "../utils/sidebar/Sidebar";
import { useNavigate } from "react-router-dom";

const PaymentSuccessPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleBack = (event) => {
      event.preventDefault();

      Object.keys(localStorage).forEach((key) => {
        if (key !== "userdata" && key !== "token" && key !== "BranchId") {
          localStorage.removeItem(key);
        }
      });

      navigate("/dashboard");

      window.history.pushState(null, "", window.location.pathname);
    };

    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [navigate]);

  return (
    <div className="h-screen bg-[#F0EDFF] flex flex-col"
    style={{
    backgroundImage: "url('/Background.png')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#EEEDFE", // ya koi fallback color
  }}>
      <Header
        title="Payment Gateway"
        // leftIconOne="☰"
        // onLeftOneClick={() => setIsMenuOpen(true)}
        // leftIconTwo="←"
        // onLeftTwoClick={() => navigate("/dashboard")}
        // rightText="Renew"
        // onRightTextClick={() => navigate("/dashboard")}
      />

      {/* <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} /> */}

      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        {/* Success icon */}
        <Check className="h-14 w-14 text-[#65C68F]" strokeWidth={2.5} />

        {/* Success text */}
        <h2 className=" text-[40px] font-semibold text-[#65C68F]">
          Successful!
        </h2>
        <p className="mt-10 text-[14px] w-[156px] font-medium text-[#434343]">
          You will receive order <br />
          confirmation by email shortly
        </p>

        {/* Button */}
        <button
          // onClick={() => (window.location.href = "/payment-summary")}
          onClick={() => {
            Object.keys(localStorage).forEach((key) => {
              if (key !== "userdata" && key !== "token" && key !== "BranchId") {
                localStorage.removeItem(key);
              }
            });

            navigate("/dashboard");
          }}
          className="mt-10 w-[306px] shadow bg-[#65C68F] hover:bg-green-600 text-[#FFFFFF] font-medium text-[18px] mx-4 px-6 py-3 rounded-[6px]"
        >
          Manage your Slots
        </button>
      </div>
    </div>
  );
};
export default PaymentSuccessPage;
