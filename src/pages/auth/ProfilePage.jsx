// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Header from "../../utils/header/Header";
// import Sidebar from "../../utils/sidebar/Sidebar";
// import { toast } from "react-toastify";

// const ProfilePage = () => {
//   const [userData, setUserData] = useState(null);
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   // Load user from localStorage
//   useEffect(() => {
//     const raw = localStorage.getItem("userdata");
//     if (raw) {
//       setUserData(JSON.parse(raw));
//     }
//   }, []);

//   const handlePasswordChange = async () => {
//     if (!oldPassword || !newPassword || !confirmPassword) {
//       toast.error("All fields are required", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       toast.error("New passwords do not match.", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await http.post(
//         "/oldnewpassword",
//         {
//           clientid: userData?.clientid, // fallback
//           oldPassword,
//           newPassword,
//         }
//       );

//       //   console.log(response);
//       if (response.data.sucess) {
//         toast.success(response.data.message, {
//           position: "top-right",
//           autoClose: 2000,
//         });
//         setOldPassword("");
//         setNewPassword("");
//         setConfirmPassword("");
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.error, {
//         position: "top-right",
//         autoClose: 3000,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen p-4 bg-[#EEEDFE] text-center">
//       <Header
//         title="Profile"
//         leftIconOne="☰"
//         onLeftOneClick={() => setIsMenuOpen(true)}
//         leftIconTwo="←"
//         onLeftTwoClick={() => window.history.back()}
//         // notification="/notification.png"
//         // notificationClick={() => alert("Notification clicked")}
//       />

//       <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

//       <div className="max-w-md mx-auto">
//         {userData && (
//           <div className="mt-20">
//             <img
//               src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
//                 `${userData.firstname} ${userData.lastname}`
//               )}&background=305ed9&color=fff`}
//               alt="Profile"
//               className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
//             />

//             <h2 className="text-xl text-[#434343] font-bold mb-1">
//               {userData.firstname} {userData.lastname}
//             </h2>
//             <p className="text-sm text-[#434343]">{userData.email}</p>
//             <p className="text-sm text-[#434343] mb-2">{userData.phone}</p>
//             {/* <h1 className="text-[#434343] font-semibold text-base">
//               Id: <span className="text-[#49479D]">{userData.clientid}</span>
//             </h1> */}

//             <div className="text-left space-y-2 mt-4">
//               <div>
//                 <h4 className="text-md font-semibold text-[#434343] mb-2">
//                   👨‍🎓 Students:
//                 </h4>
//                 {userData?.studentdetails?.map((student, index) => (
//                   <p key={index} className="text-sm text-[#434343]">
//                     - {student.first_name} {student.last_name}
//                   </p>
//                 ))}
//               </div>
//             </div>

//             <div className="mt-6">
//               <h3 className="text-2xl font-bold text[#434343] text-start mb-2">
//                 Change Password
//               </h3>
//               <div className="space-y-3 text-left">
//                 <label className="block text-sm font-roboto font-medium text-[#434343] mb-1">
//                   Old Password
//                 </label>
//                 <input
//                   type="password"
//                   placeholder="••••••••"
//                   value={oldPassword}
//                   onChange={(e) => setOldPassword(e.target.value)}
//                   className="w-full px-3 py-2 bg-[#FFFFFF]  border placeholder-[#989691] text-[14px] border-[#CCCCCC] text-[#434343] rounded"
//                 />
//                 <label className="block text-sm font-roboto font-medium text-[#434343] mb-1">
//                   New Password
//                 </label>
//                 <input
//                   type="password"
//                   placeholder="••••••••"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   className="w-full px-3 py-2 bg-[#FFFFFF] border placeholder-[#989691] text-[14px] border-[#CCCCCC] text-[#434343] rounded"
//                 />
//                 <label className="block text-sm font-roboto font-medium text-[#434343] mb-1">
//                   Confirm New Password
//                 </label>
//                 <input
//                   type="password"
//                   placeholder="••••••••"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="w-full px-3 py-2 bg-[#FFFFFF] border placeholder-[#989691] text-[14px] border-[#CCCCCC] text-[#434343] rounded"
//                 />

//                 <div className="flex my-4 justify-end">
//                   <button
//                     onClick={handlePasswordChange}
//                     disabled={loading}
//                     className="bg-[#49479D] text-[#FFFFFF] text-[18px] py-2 px-5 rounded-[6px] font-normal"
//                   >
//                     {loading ? "Updating..." : "Change Password"}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {message && <p className="text-sm mt-3 text-red-500">{message}</p>}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;

import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../utils/header/Header";
import Sidebar from "../../utils/sidebar/Sidebar";
import { toast } from "react-toastify";
import {
  Modal,
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { ChevronRight } from "lucide-react";
import http from "../../service/http";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Password Modal states
  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("userdata");
    if (raw) setUserData(JSON.parse(raw));
  }, []);

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await http.post("/oldnewpassword", {
        clientid: userData?.clientid,
        oldPassword,
        newPassword,
      });

      if (response.data.success) {
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 2000,
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Error updating password", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEEDFE] relative p-4"
     style={{
    backgroundImage: "url('/Background.png')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#EEEDFE", // ya koi fallback color
  }}>
      <Header
        title="Profile"
        leftIconOne="☰"
        onLeftOneClick={() => setIsMenuOpen(true)}
        leftIconTwo="←"
        onLeftTwoClick={() => window.history.back()}
      />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="flex flex-col items-center">
        {/* Profile Image */}
        <div className="mt-20">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              `${userData?.firstname || ""} ${userData?.lastname || ""}`
            )}&background=305ed9&color=fff`}
            alt="Profile"
            className="w-24 h-24 rounded-full  shadow-md object-cover"
          />
          <h2 className=" text-xs text-center text-[#434343] text-[18px]">
            Edit Picture
          </h2>
        </div>

        {/* Profile Info Card */}
        <div className="mt-8 bg-[#FFFFFF] rounded-[15px] shadow  w-full  max-w-md">
          <div className="border-b px-4 border-[#DADADA] py-3">
            <label className="block font-bold text-[12px] text-[#A9A9A9]">
              Your Name
            </label>
            <p className="text-[16px] font-normal text-[#434343]">{`${
              userData?.firstname || ""
            } ${userData?.lastname || ""}`}</p>
          </div>

          <div className="border-b px-4 border-[#DADADA] py-3">
            <label className="block font-bold text-[12px] text-[#A9A9A9]">
              Email
            </label>
            <p className="text-[16px] font-normal text-[#434343]">
              {userData?.email}
            </p>
          </div>

          {userData?.studentdetails?.length > 0 && (
            <div className="border-b px-4 border-[#DADADA] py-3">
              <label className="block font-bold text-[12px] text-[#A9A9A9]">
                Student Name(s)
              </label>
              {userData.studentdetails.map((student, index) => (
                <p
                  key={index}
                  className="text-[16px] font-normal text-[#434343]"
                >
                  {student.first_name} {student.last_name}
                </p>
              ))}
            </div>
          )}

          {/* Change Password Button */}
          <button
            onClick={() => setOpen(true)}
            className="w-full flex justify-between my-3 items-center text-[16px] font-normal text-[#434343] py-2 px-3 rounded hover:bg-gray-100"
          >
            Change Password
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* MUI Modal with custom inputs */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "400px" }, // 90% on mobile, 400px on desktop
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: { xs: 2, sm: 4 }, // smaller padding on mobile
          }}
        >
          <Typography
            variant="h6"
            mb={2}
            sx={{ fontSize: { xs: "18px", sm: "20px" }, textAlign: "center" }}
          >
            Change Password
          </Typography>

          {/* <label className="block text-sm font-medium text-[#434343] mb-1">
            Old Password
          </label>
          <div className="relative mb-3">
            <input
              type={showOld ? "text" : "password"}
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showOld ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <label className="block text-sm font-medium text-[#434343] mb-1">
            New Password
          </label>
          <div className="relative mb-3">
            <input
              type={showNew ? "text" : "password"}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <label className="block text-sm font-medium text-[#434343] mb-1">
            Confirm New Password
          </label>
          <div className="relative mb-4">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div> */}
          <label className="block text-sm font-medium text-[#434343] mb-1">
            Old Password
          </label>
          <div className="relative mb-3">
            <input
              type={showOld ? "text" : "password"}
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded"
            />
            {oldPassword.length > 0 && (
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showOld ? <FaEyeSlash /> : <FaEye />}
              </button>
            )}
          </div>

          <label className="block text-sm font-medium text-[#434343] mb-1">
            New Password
          </label>
          <div className="relative mb-3">
            <input
              type={showNew ? "text" : "password"}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded"
            />
            {newPassword.length > 0 && (
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            )}
          </div>

          <label className="block text-sm font-medium text-[#434343] mb-1">
            Confirm New Password
          </label>
          <div className="relative mb-4">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#CCCCCC] rounded"
            />
            {confirmPassword.length > 0 && (
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            )}
          </div>

          <Box
            display="flex"
            justifyContent="flex-end"
            gap={2}
            sx={{ flexDirection: { xs: "column", sm: "row" } }}
          >
            <Button
              variant="outlined"
              onClick={() => setOpen(false)}
              fullWidth
              sx={{ fontSize: { xs: "14px", sm: "16px" } }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handlePasswordChange}
              disabled={loading}
              fullWidth
              sx={{
                backgroundColor: "#49479D",
                fontSize: { xs: "14px", sm: "16px" },
                "&:hover": { backgroundColor: "#3b3a85" },
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : (
                "Submit"
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ProfilePage;
