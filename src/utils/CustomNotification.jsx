import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import http from "../service/http";
import { toast } from "react-toastify";


const CustomNotification = ({ message, onClose, show = true }) => {
  // Optional: auto-close after 5s
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     onClose();
  //   }, 5000);
  //   return () => clearTimeout(timer);
  // }, [onClose]);

  const handleClick = async () => {
    try {
      const raw = localStorage.getItem("userdata");
      const userData = raw ? JSON.parse(raw) : null;

      const response = await http.post("/clientemailsend/", {
        email: userData?.email, 
      });

      console.log(response.data);

      if (response.data.success) {
        toast.success("Support Email sent successfully!");
        onClose();
      }
      //  else {
      //   console.error("Email send failed:", response.data);
      //   alert("Failed to send email.");
      // }
    } catch (error) {
      console.error("Axios error:", error);
      toast.error("Something went wrong!");
    }
  };
  return (
    <div className="flex  bg-[#FEECEC] border border-[#F1B6AA] text-[#5F2120] p-4 rounded-md shadow-md  w-full relative">
      {/* Icon */}
      <div className=" bg-[#E85030] rounded-[14px]  px-2 flex items-center justify-center w-[38px] h-[38px] mr-3">
        <AlertTriangle className="text-[#FFFF]" size={24} />
        {/* <img src="/alert.png" alt="" className="w-full h-[16px]" /> */}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-[#434343] font-semibold">{message}</p>
        {show && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleClick}
              className={`px-3 py-1 lg:py-2 mt-3 bg-[#49479D] text-white text-sm font-medium rounded`}
            >
              Contact
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1 lg:py-2 mt-3 bg-[#FFFFFF] border border-[#CCCCCC]  text-[#434343] text-sm font-medium rounded `}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-1 right-1  text-[#3C3C3C] hover:text-black text-xl leading-none"
      >
        ×
      </button>
    </div>
  );
};

export default CustomNotification;
