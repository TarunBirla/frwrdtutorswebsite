import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  BookOpen,
  Repeat,
  RefreshCcw,
  User,
  LogOut,
} from "lucide-react";
import http from "../../service/http";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState("");
  const raw = localStorage.getItem("userdata");
  const userData = raw ? JSON.parse(raw) : null;
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      if (userData?.clientid) {
        const url = `/clientsdata/${userData?.clientid}`;

        const response = await http.get(url);

        const appointments = response?.data?.status;

        console.log("appointments:-", appointments);
        setStatus(appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // navigate("/new-booking");
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, []);
  return (
    <>
      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-xl font-bold">
            ×
          </button>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center text-center px-4">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              `${userData.firstname} ${userData.lastname}`
            )}&background=305ed9&color=fff`}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
          />
          <p className="font-bold text-[#434343] text-[18px] mb-4">
            {`${userData.firstname} ${userData.lastname}`}
          </p>
        </div>

        {/* Menu */}
        <ul className="px-6 space-y-5 text-[16px] mt-6 text-[#2A2A2A] font-medium">
          {/* {status == "existing_user" && ( */}
            <li
            onClick={() => {
    // remove all except userdata and token
    Object.keys(localStorage).forEach((key) => {
      if (key !== "userdata" && key !== "token" && key !== "BranchId") {
        localStorage.removeItem(key);
      }
    });

    navigate("/dashboard");
  }}
              className="flex items-center gap-3"
            >
              {/* <BookOpen className="w-5 h-5" /> */}
              <img src="/user-check.png" alt="" />
              Home
            </li>
          {/* )} */}

          <li
            // onClick={() => {
            //   window.location.href = "/transaction-history";
            // }}
            onClick={() => navigate("/transaction-history")}
            className="flex items-center gap-3"
          >
            {/* <CalendarDays className="w-5 h-5" /> */}
            <img src="/transaction.png" alt="" />
            Transaction History
          </li>
          <li
            // onClick={() => {
            //   window.location.href = "/manage-booking";
            // }}
            onClick={() => navigate("/manage-booking")}
            className="flex items-center gap-3"
          >
            {/* <BookOpen className="w-5 h-5" /> */}
            <img src="/managebooking.png" alt="" />
            Manage Booking
          </li>
          <li
            className="flex items-center gap-3"
            // onClick={() => {
            //   window.location.href = "/rescheduling";
            // }}
            onClick={() => navigate("/rescheduling")}
          >
            {/* <Repeat className="w-5 h-5" /> */}
            <img src="/reschedule.png" alt="" />
            Rescheduling
          </li>
          <li
            // onClick={() => {
            //   window.location.href = "/new-booking";
            // }}
            onClick={() => navigate("/renew-change-packages")}
            className="flex items-center gap-3"
          >
            {/* <RefreshCcw className="w-5 h-5" /> */}
            <img src="/clock.png" alt="" />
            Renew
          </li>
          {/* <li
            // onClick={() => {
            //   window.location.href = "/new-booking";
            // }}
            onClick={() => navigate("/remaining-classes")}
            className="flex items-center gap-3"
          >
            
            <img src="/user-search.png" alt="" />
            Remaining Classes
          </li> */}
          <li
            // onClick={() => {
            //   window.location.href = "/profile";
            // }}
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3"
          >
            {/* <User className="w-5 h-5" /> */}
            <img src="/user.png" alt="" />
            My Profile
          </li>
          <li
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="flex items-center gap-3"
          >
            {/* <LogOut className="w-5 h-5" /> */}
            <img src="/square-lock-check.png" alt="" />
            Logout
          </li>
        </ul>

        {/* Footer */}
        <div className="absolute  bottom-5 left-6 right-6 text-xs text-[#F6F6F6]">
          <div className="flex items-center gap-3 mb-2">
            <img src="/insta.png" alt="" className="w-[18px] h-[18px]" />
            <img src="/facebook.png" alt="" className="w-[20px] h-[20px]" />
          </div>
          <p className="text-[#A1A1A1] text-[10px] mb-1">Stay Connected</p>
          <p className="text-[#000000] text-[14px] font-semibold">
            +971 58 587 0741
          </p>
          <p className="text-[#000000] text-[14px] font-semibold">
            info@myfrwrd.com
          </p>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#000000]/50 bg-opacity-30 z-40"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
