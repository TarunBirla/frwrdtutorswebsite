import React, { useEffect, useState } from "react";
import Header from "../utils/header/Header";
import Sidebar from "../utils/sidebar/Sidebar";
import CustomNotification from "../utils/CustomNotification";
import http from "../service/http";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const packageNames = {
  2: "SILVER",
  3: "GOLD",
  4: "PLATINUM",
};

const Packages = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [serviceDetails, setServiceDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const toggleDetail = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };
  const branchid = localStorage.getItem("BranchId");
  let userData = null;
  try {
    const raw = localStorage.getItem("userdata");
    userData = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing userdata:", error);
  }

  const RESCHEDULE_LIMITS = {
    2: 0,
    3: 1,
    4: 3,
  };
  const [userPackageName, setUserPackageName] = useState(null);
  const [usedReschedules, setUsedReschedules] = useState(0);

  useEffect(() => {
    const fetchUserPackage = async () => {
      try {
        if (!userData?.clientid) return;

        const res = await http.get(`/client-packages/${userData.clientid}`);
        const pkg = res.data?.data?.[0];

        if (pkg?.packageForm) {
          const parsed = JSON.parse(pkg.packageForm);
          const pkgId = parsed?.lessonData?.packageNames?.id;

          setUserPackageName(pkgId);
          setUsedReschedules(Number(pkg.purches_status || 0)); // ✅ HERE
        }
      } catch (err) {
        console.error("Package fetch error", err);
      }
    };

    fetchUserPackage();
  }, []);

  const allowedReschedules = RESCHEDULE_LIMITS[userPackageName] ?? 0;

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
          // const fetchedAppointments = response.data.alldata;
          const fetchedAppointments = response.data.data;
          console.log("fetchedAppointments", fetchedAppointments);

          // Fetch service details for each appointment
          fetchedAppointments.forEach(async (appt) => {
            const serviceId = appt.service?.id;
            if (serviceId) {
              try {
                const serviceRes = await http.get(
                  `/services/${serviceId}?branch_id=${branchid}`,
                );
                setServiceDetails((prev) => ({
                  ...prev,
                  [serviceId]: serviceRes.data,
                }));

                console.log("serviceRes", serviceRes);
              } catch (error) {
                console.error(`Error fetching service ${serviceId}:`, error);
              }
            }
          });

          setAppointments(fetchedAppointments);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleRescheduleSubmit = (
    appointmentId,
    serviceId,
    topic,
    contractorName,
    contractorNameid,
  ) => {
    const payload = {
      appointmentId,
      serviceId,
      topic,
      contractorName,
      contractorNameid,
    };
    localStorage.setItem("rescheduleData", JSON.stringify(payload));
    navigate("/reschedule-slot");
  };

  const today = new Date();
  const twoDaysLater = new Date(today);
  twoDaysLater.setDate(today.getDate() + 2);

  // 1️⃣ Flatten appointments for pagination
  const flatAppointments = appointments.map((appt) => ({
    ...appt,
    pkgId: appt.db?.pkg_id,
    packageName: packageNames[appt.db?.pkg_id] || "Unknown Package",
  }));

  // 2️⃣ Pagination logic
  const totalPages = Math.max(
    1,
    Math.ceil(flatAppointments.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFlat = flatAppointments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // 3️⃣ Regroup paginated data
  const groupedByPackage = Object.values(
    paginatedFlat.reduce((acc, appt) => {
      if (!acc[appt.pkgId]) {
        acc[appt.pkgId] = {
          pkgId: appt.pkgId,
          packageName: appt.packageName,
          items: [],
        };
      }
      acc[appt.pkgId].items.push(appt);
      return acc;
    }, {}),
  );

  return (
    <div
      className="bg-[#EEEDFE] min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: "url('/Background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#EEEDFE", // ya koi fallback color
      }}
    >
      <Header
        title="Reschedule"
        leftIconOne="☰"
        onLeftOneClick={() => setIsMenuOpen(true)}
        leftIconTwo="←"
        onLeftTwoClick={() => window.history.back()}
      />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {show && (
        <div className="fixed w-full p-4 top-14 left-1/2 transform -translate-x-1/2 z-50">
          <CustomNotification
            message="You cannot select more than 2 lessons per week with this package. A maximum of 2 lessons is allowed in total per week — 1 lesson per subject."
            onClose={() => setShow(false)}
          />
        </div>
      )}

      <div className="pt-20 max-w-md mx-auto pb-10">
        <div className="p-4">
          {loading ? (
            <Box
              sx={{
                display: "flex",
                minHeight: "100vh",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f1efff",
              }}
            >
              <CircularProgress />
            </Box>
          ) : groupedByPackage.length > 0 ? (
            <>
              {groupedByPackage.map((pkg) => (
                <div key={pkg.pkgId} className="mb-6">
                  {/* <h3 className="text-lg mb-2 font-bold text-[#49479D] bg-gray-100 p-2 rounded">
                    {pkg.packageName}
                  </h3> */}

                  {pkg.items.map((appt, index) => {
                    const tutor = appt.service;
                    const contractor = serviceDetails[tutor.id]?.conjobs?.[0];
                    const contractorName = contractor?.name || tutor.name;
                    const contractorNameid = contractor?.contractor;
                    const isExpanded =
                      expandedIndex === `${pkg.pkgId}-${index}`;

                    const startDate = new Date(appt.start);
                    startDate.setHours(startDate.getHours() + 4);
                    const startDateStr = startDate.toISOString();
                    // console.log("startDate:-", startDate.toISOString());
                    // const isExactlyTwoDaysLater =
                    //   startDate.toDateString() ===twoDaysLater.toDateString();
                    const remainingReschedules = Math.max(
                      allowedReschedules - usedReschedules,
                      0,
                    );

                    const now = new Date();
                    const classStart = new Date(appt.start);

                    // Difference in milliseconds
                    const diffMs = classStart - now;

                    // Convert to hours
                    const diffHours = diffMs / (1000 * 60 * 60);

                    // ✅ RULE:
                    // Only allow if class is MORE than 48h away
                    const canRescheduleByTime = diffMs > 0 && diffHours > 48;

                    // 📦 PACKAGE RULE (separate)
                    // const canRescheduleByPackage = true;
                    const canRescheduleByPackage = usedReschedules > 0;

                    // ✅ FINAL
                    const canReschedule =
                      canRescheduleByTime && canRescheduleByPackage;

                    console.log({
                      diffHours,
                      canRescheduleByTime,
                      canRescheduleByPackage,
                      canReschedule,
                    });

                    return (
                      <div
                        key={appt.id}
                        className="bg-white rounded-xl p-4 mb-4 shadow-md"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src="/tutor2.png"
                            alt={contractorName}
                            className="w-[73px] h-[73px] rounded-[4px] object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-[14px] text-[#17215F] mb-1">
                              {contractorName}
                            </h3>
                            <p className="text-xs text-[#434343] font-medium mb-2">
                              Topic: {appt.topic}
                            </p>
                            <p className="text-xs text-[#6F6F6F]">
                              Time: {startDateStr.substring(0, 10)}{" "}
                              {startDateStr.substring(11, 16)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={() =>
                              toggleDetail(`${pkg.pkgId}-${index}`)
                            }
                            className="w-[103px] flex items-center justify-center gap-2 
                              border border-[#C2C2C2] text-[#434343] 
                              rounded-[6px] py-1.5 text-xs"
                          >
                            View Detail
                            <ExpandMoreIcon
                              fontSize="small"
                              className={`transition-transform ${
                                isExpanded ? "rotate-180" : "rotate-0"
                              }`}
                            />
                          </button>

                          {/* {canReschedule && (
                            <button
                              className="w-[103px] bg-[#8F3D96] text-white rounded-[6px] py-1.5 text-xs"
                              onClick={() =>
                                handleRescheduleSubmit(
                                  appt.id,
                                  tutor.id,
                                  appt.topic,
                                  contractorName,
                                  contractorNameid
                                )
                              }
                            >
                              Reschedule
                            </button>
                          )} */}
                          <button
                            className="w-[103px] rounded-[6px] py-1.5 text-xs text-white
    bg-[#8F3D96]"
                            onClick={() => {
                              if (!canRescheduleByTime) {
                                toast.error(
                                  "You cannot reschedule within 48 hours before class start.",
                                );

                                return;
                              }

                              if (!canRescheduleByPackage) {
                                toast.error(
                                  "Your reschedule limit has been exhausted.",
                                );
                                return;
                              }

                              // ✅ Allowed → Navigate
                              handleRescheduleSubmit(
                                appt.id,
                                tutor.id,
                                appt.topic,
                                contractorName,
                                contractorNameid,
                              );
                            }}
                          >
                            Reschedule
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-2 text-xs text-[#333] space-y-1">
                            <p>
                              <strong>Status:</strong> {appt.status}
                            </p>
                            <p>
                              <strong>Service ID:</strong> {tutor.id}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Pagination controls */}
              <div className="flex justify-center items-center gap-4 py-4">
                <button
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center min-w-xs bg-white rounded-xl p-4 mb-4 shadow text-[#434343] py-8 text-sm font-medium">
              No available Tutors
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Packages;
