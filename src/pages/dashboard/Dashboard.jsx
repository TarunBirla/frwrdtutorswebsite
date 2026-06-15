import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../../utils/header/Header";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import http from "../../service/http";
import Sidebar from "../../utils/sidebar/Sidebar";

import {
  Modal,
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { ChevronRight } from "lucide-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const branchid = localStorage.getItem("BranchId");
  
  const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
 const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // ✅ Clear localStorage on /dashboard load (except userdata & token)

  // useEffect(() => {
  //   if (location.pathname === "/dashboard") {
  //     Object.keys(localStorage).forEach((key) => {
  //       if (key !== "userdata" && key !== "token" && key !== "BranchId") {
  //         localStorage.removeItem(key);
  //       }
  //     });
  //   }
  // }, [location.pathname]);

  let userData = null;

  try {
    const raw = localStorage.getItem("userdata");
    userData = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing userdata:", error);
  }
  const shortcuts = [
    {
      icon: "/calendertick.png", // Replace with SVG or image if needed
      title: "Manage Booking",
      text: "1 Sched",
      text2: "Classes",
      path: "/manage-booking",
    },
    {
      icon: "/calender.png",
      title: "New Booking",
      text: "",
      text2: "",
      path: "/new-booking",
    },

    {
      icon: "/linedot.png",
      title: "CR Tutors",
      text: "",
      text2: "",
      path: "/crtutors",
    },
    {
      icon: "/refresh.png",
      title: "Renew/change Package",
      text: "Basic",
      text2: "",
      path: "/manage-packages",
    },
  ];
  const navigate = useNavigate();

//   useEffect(() => {
//   if (userData?.first_time_login === true) {
//     setOpen(true);
//   }
// }, []);

useEffect(() => {
  const fetchProfile = async () => {
    const res = await http.get(`/client/profile/${userData?.clientid}`);
    console.log("12341234res",res.data);
    
    if (res.data?.user?.is_first_login === 0) {
      setOpen(true);
    }
  };

  if (userData?.clientid) fetchProfile();
}, [userData?.clientid]);


const handleFirstLoginDone = async () => {
  try {
    await http.post(
      "/client/mark-first-login",
      {
        clientid: userData?.clientid,
      });

    setOpen(false); // close popup
  } catch (error) {
    console.error("Failed to update first login status", error);
  }
};


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
       await handleFirstLoginDone();
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

  // const fetchAppointments = async () => {
  //   try {
  //     const raw = localStorage.getItem("userdata");
  //     const userData = raw ? JSON.parse(raw) : null;

  //     if (userData?.clientid) {
  //       const url = `/clientsdata/${userData?.clientid}`;

  //       const response = await http.get(url);

  //       const appointments = response?.data?.status;
  //       console.log(appointments);

  //       if (appointments && appointments == "new_user") {
  //         navigate("/new-booking");
  //         return;
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching appointments:", error);
  //     // navigate("/new-booking");
  //   }
  // };
  // useEffect(() => {
  //   fetchAppointments();
  // }, []);

  const [appointmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const raw = localStorage.getItem("userdata");
        const userData = raw ? JSON.parse(raw) : null;

        if (userData?.studentdetails?.length > 0) {
          const studentIdList = userData.studentdetails.map((s) => s.id);
          const idString = studentIdList.join(",");
          const url = `/appointmentstwo/${idString}?branch_id=${branchid}`;

          const response = await http.get(url);
          const appointments = response.data.data;

          // ✅ Set the count dynamically
          setAppointmentCount(appointments.length);
          console.log("silverdatadash:-", appointments);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchClientData = async () => {
      const raw = localStorage.getItem("userdata");
      const userData = raw ? JSON.parse(raw) : null;
      try {
        const response = await http.get(
          `/client-packages/${userData.clientid}`,
        );
        const data = response.data;
        console.log("data of the packages:-", data.data);
        if (Array.isArray(data.data[0])) {
          data.data.forEach((pkg, index) => {
            try {
              const parsedPackageForm = JSON.parse(pkg.packageForm);
              // console.log(`Package Form ${index + 1}:`, parsedPackageForm);
              const { lessonData, packageFormData } = parsedPackageForm;
              console.log("packageName:-", lessonData?.packageName);
            } catch (err) {
              console.error(
                `Error parsing packageForm for package ${index + 1}:`,
                err,
              );
            }
          });
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
      }
    };

    fetchClientData();
  }, []);

  const [packageName, setPackageName] = useState("Silver");

  useEffect(() => {
    const fetchClientData = async () => {
      const raw = localStorage.getItem("userdata");
      const userData = raw ? JSON.parse(raw) : null;
      try {
        const response = await http.get(
          `/client-packages/${userData.clientid}`,
        );
        const data = response.data;
        console.log("data of the packages:-", data.data);

        // ✅ Use only first index data
        if (Array.isArray(data.data) && data.data.length > 0) {
          try {
            const parsedPackageForm = JSON.parse(data.data[0].packageForm);
            const { lessonData } = parsedPackageForm;

            // ✅ Set packageName dynamically
            setPackageName(lessonData.packageName);
            console.log("packageName:-", lessonData.packageName);
          } catch (err) {
            console.error("Error parsing first packageForm:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
      }
    };

    fetchClientData();
  }, []);

  const [pendingPayment, setPendingPayment] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await http.get(`/contractors?branch_id=${branchid}`);
        if (response.data) {
          console.log(response.data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchPendingPayment = async () => {
      try {
        const response = await http.get(
          `/client-packagesfree/${userData.clientid}`,
        );

        if (response.data?.data?.[0]) {
          setPendingPayment(response.data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching pending payment:", error);
      }
    };

    if (userData?.clientid) {
      fetchPendingPayment();
    }
  }, []);

  return (
    <div
      style={{
        backgroundImage: `url('/bg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="min-h-screen  font-sans"
    >
      <Header
        // title="Dashboard"
        titleImg={"/frwrdlogo.jpg"}
        leftIconOne="☰"
        onLeftOneClick={() => setIsMenuOpen(true)}
        // onLeftOneClick={() => setIsMenuOpen(true)}

        leftIconTwo="←"
        onLeftTwoClick={() => window.history.back()}
        // rightText="Next"
        // rightTexticon="/arrowright.png"
        // onRightOneClick={() => alert("Notification clicked")}
      />

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div
        className="flex items-center justify-center "
        style={{
          backgroundImage: "url('/Background.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#EEEDFE", // ya koi fallback color
        }}
      >
        <div className="pt-20 max-w-md  px-4 pb-10">
          <div className="relative w-full h-[177px] rounded-xl overflow-hidden">
            <img
              src="/Dashboard.png"
              alt=""
              className="w-full h-full object-cover"
            />
            <h2 className="absolute inset-0 flex items-center justify-center text-center text-[#FFFFFF] text-[26px] font-semibold">
              Welcome to Your <br /> Dashboard!
            </h2>
          </div>

          {pendingPayment && (
            <div className="bg-[#FFFFFF] mt-4 rounded-[7px] flex p-2 items-center justify-between">
              <h1 className="text-[#434343] font-semibold text-[18px]">
                Complete Your Pending Payment
              </h1>
              <img
                onClick={async () => {
                  try {
                    const response = await http.get(
                      `/client-packagesfree/${userData.clientid}`,
                    );
                    if (response.data?.data[0]) {
                      console.log(`PackageForm:`, response.data.data);
                      const packageForm = JSON.parse(
                        response.data.data[0].packageForm,
                      );
                      const bookingdata = JSON.parse(
                        response.data.data[0].bookingdata,
                      );
                      const lessonData = packageForm.lessonData;
                      const packageFormData = packageForm.packageFormData;
                      const storedTeacher = packageForm.storedTeacher;
                      const storedTeacher2 = packageForm.storedTeacher2;

                      const groupedByWeek = packageForm.groupedByWeek;

                      console.log("LessonData:", lessonData);
                      console.log("PackageFormData:", packageFormData);
                      console.log("StoredTeacher:", storedTeacher);
                      console.log("StoredTeacher2:", storedTeacher2);

                      localStorage.setItem(
                        "bookingdata",
                        JSON.stringify(bookingdata),
                      );

                      // Store in localStorage
                      localStorage.setItem(
                        "lessonData",
                        JSON.stringify(lessonData),
                      );
                      localStorage.setItem(
                        "groupedByWeek",
                        JSON.stringify(groupedByWeek),
                      );
                      localStorage.setItem(
                        "packageFormData",
                        JSON.stringify(packageFormData),
                      );
                      localStorage.setItem(
                        "selectedTeacher",
                        JSON.stringify(storedTeacher),
                      );
                      localStorage.setItem(
                        "selectedTeachers",
                        JSON.stringify(storedTeacher2),
                      );

                      localStorage.setItem("dashboard", 1);
                      localStorage.setItem("showLock", 1);

                      navigate("/booking-summary");
                    }

                    // Store data in localStorage
                    // localStorage.setItem(
                    //   "clientPackagesFree",
                    //   JSON.stringify(response.data)
                    // );
                  } catch (error) {
                    console.error("API Error:", error);
                  }
                }}
                src="/arrowdown.png"
                alt=""
                className="w-8 h-8 lg:w-[40px]"
              />
            </div>
          )}

          <div>
            <h3 className=" font-medium text-[#434343] text-[18px] mt-4">
              Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-6 mt-4">
              {/* Card 1 */}
              <div
                onClick={() => navigate("/manage-booking")}
                className="relative flex flex-col justify-between cursor-pointer"
              >
                <img
                  src="/bgBox.png"
                  alt=""
                  className="w-[171px] h-[178px] object-cover rounded-2xl"
                />
                <div className="absolute top-4 left-4">
                  <img src="/calendertick.png" alt="" />
                  <h4 className="text-[#434343] flex flex-col ml-[5rem] mt-1 text-end font-normal text-sm">
                    {appointmentCount} Sched
                    <span className="text-sm">Classes</span>
                  </h4>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <h4 className="w-[70px] font-robotoCondensed text-[#434343] font-semibold text-[18px]">
                      Manage Booking
                    </h4>
                    <img
                      src="/arrowdown.png"
                      alt=""
                      className="w-8 h-8 lg:w-[40px]"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div
                onClick={() => navigate("/new-booking")}
                className="relative flex flex-col justify-between cursor-pointer"
              >
                <img
                  src="/bgBox.png"
                  alt=""
                  className="w-[171px] h-[178px] object-cover rounded-2xl"
                />
                <div className="absolute top-4 left-4">
                  <img src="/calender.png" alt="" />
                  <div className="mt-[4rem] flex items-center justify-between gap-7">
                    <h4 className="w-[80px] font-robotoCondensed text-[#434343] font-semibold text-[18px]">
                      New Booking
                    </h4>
                    <img
                      src="/arrowdown.png"
                      alt=""
                      className="w-8 h-8 lg:w-[40px]"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div
                onClick={() => navigate("/crtutors")}
                className="relative flex flex-col justify-between cursor-pointer"
              >
                <img
                  src="/bgBox.png"
                  alt=""
                  className="w-[171px] h-[178px] object-cover rounded-2xl"
                />
                <div className="absolute top-4 left-4">
                  <img src="/linedot.png" alt="" />
                  <div className="mt-[3.5rem] flex items-center justify-between gap-10">
                    <h4 className="w-[70px] font-robotoCondensed text-[#434343] font-semibold text-[18px]">
                      Available Tutors
                    </h4>
                    <img
                      src="/arrowdown.png"
                      alt=""
                      className="w-8 h-8 lg:w-[40px]"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div
                onClick={() => navigate("/autorenew")}
                className="relative flex flex-col justify-between cursor-pointer"
              >
                <img
                  src="/bgBox.png"
                  alt=""
                  className="w-[171px] h-[178px] object-cover rounded-2xl"
                />
                <div className="absolute top-4 left-4">
                  <img src="/refresh.png" alt="" />
                  {/* <h4 className="text-[#434343] mr-2 flex flex-col  mt-1 text-end font-medium text-[18px]">
                    {packageName}
                  </h4> */}
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <h4 className="w-[90px] font-robotoCondensed text-[#434343] font-semibold text-[18px]">
                      Renew/change Package
                    </h4>
                    <img
                      src="/arrowdown.png"
                      alt=""
                      className="w-8 h-8 ml-2 lg:w-[40px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
               onClick={() => {
    setOpen(false);
    handleFirstLoginDone();
  }}
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

export default Dashboard;
