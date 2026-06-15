import React, { useEffect, useState } from "react";
import Header from "../utils/header/Header";
import Sidebar from "../utils/sidebar/Sidebar";
import http from "../service/http";
import { CircularProgress, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import FeedbackPopup from "./forms/FeedbackPopup";

const packageNames = {
  2: "SILVER",
  3: "GOLD",
  4: "PLATINUM",
};

const ManageBooking = () => {
  const [activeTab, setActiveTab] = useState("current");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();
  const [serviceDetails, setServiceDetails] = useState([]);
  const branchid = localStorage.getItem("BranchId");

  const [loading, setLoading] = useState(true);
  const [currentBookingsData, setCurrentBookingsData] = useState([]);
  const [pastBookingsData, setPastBookingsData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
          // const appointments = response.data.alldata;
          // let appointments = [...response.data.alldata].reverse();
          let appointments = [...response.data.data];

          console.log("silverdata11111:-", appointments);

          // appointments.sort((a, b) => new Date(b.start) - new Date(a.start));

          const mapped = await Promise.all(
            appointments.map(async (appt) => {
              const startDate = new Date(appt.start);
              startDate.setHours(startDate.getHours() + 4);
              console.log("startDate:-", startDate.toISOString()); // stays consistent

              const startDate1 = appt.start;
              console.log("startDate1:-", startDate);
              console.log("startDate12:-", startDate1);

              const now = new Date();
              let action = "Completed";

              if (appt.status === "planned") {
                action =
                  startDate.toISOString() > now ? "Join Now" : "Reschedule";
              }
              let serviceDetails = appt.service;
              if (appt.service?.id) {
                try {
                  const serviceRes = await http.get(
                    `/services/${appt.service.id}?branch_id=${branchid}`,
                  );
                  serviceDetails = serviceRes.data;
                  console.log("service:-", serviceDetails);
                } catch (error) {
                  console.error(
                    `Error fetching service ${appt.service.id}:`,
                    error,
                  );
                }
              }

              const teacherNames =
                serviceDetails?.conjobs?.map((cj) => cj.name).join(", ") ||
                "N/A";
              const studentNames =
                serviceDetails?.rcrs
                  ?.map((rc) => rc.recipient_name)
                  .join(", ") || "N/A";

              return {
                id: appt.id,
                subject: appt.topic,
                // studentName: appt?.service?.name ?? "N/A",
                studentName: studentNames, // from rcrs
                teacherName: teacherNames,
                startDateTime: startDate,
                date: startDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
                time: startDate.toISOString().substring(11, 16),
                status: appt.status.toLowerCase(),
                action,
                pkg_id: appt.db?.pkg_id ?? null,
              };
            }),
          );

          console.log("mapped:-", mapped);

          const now = new Date();

          const past = mapped.filter((b) => b.startDateTime < now);

          const current = mapped.filter((b) => b.startDateTime >= now);

          // Group function
          const groupByPackage = (data) => {
            return Object.values(
              data.reduce((acc, item) => {
                const pkgId = item.pkg_id;
                if (!acc[pkgId]) {
                  acc[pkgId] = {
                    pkgId,
                    packageName: packageNames[pkgId] || "Unknown Package",
                    bookings: [],
                  };
                }
                acc[pkgId].bookings.push(item);
                return acc;
              }, {}),
            );
          };

          setPastBookingsData(groupByPackage(past));
          setCurrentBookingsData(groupByPackage(current));
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Reset page on tab switch

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleOpenPopup = (e) => {
    e.preventDefault();
    setIsPopupOpen(true);
  };

  // Flatten bookings for pagination
  const flatBookings =
    activeTab === "current"
      ? currentBookingsData.flatMap((pkg) =>
          pkg.bookings.map((b) => ({
            ...b,
            packageName: pkg.packageName,
            pkgId: pkg.pkgId,
          })),
        )
      : pastBookingsData.flatMap((pkg) =>
          pkg.bookings.map((b) => ({
            ...b,
            packageName: pkg.packageName,
            pkgId: pkg.pkgId,
          })),
        );

  const totalPages = Math.max(1, Math.ceil(flatBookings.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = flatBookings.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Regroup after pagination
  const paginatedGrouped = Object.values(
    paginatedBookings.reduce((acc, item) => {
      if (!acc[item.pkgId]) {
        acc[item.pkgId] = {
          pkgId: item.pkgId,
          packageName: item.packageName,
          bookings: [],
        };
      }
      console.log("paginatedBookings:-", paginatedBookings);

      acc[item.pkgId].bookings.push(item);
      return acc;
    }, {}),
  );

  return (
    <div
      className="w-full min-h-screen bg-[#EEEDFE] flex flex-col"
      style={{
        backgroundImage: "url('/Background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#EEEDFE", // ya koi fallback color
      }}
    >
      <Header
        title="Manage Booking"
        leftIconOne="☰"
        onLeftOneClick={() => setIsMenuOpen(true)}
        leftIconTwo
        onLeftTwoClick={() => window.history.back()}
      />

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <FeedbackPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />

      <div className="flex justify-center items-center">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex justify-around p-2 pt-20">
            <button
              className={`flex-1 mx-1 py-2 text-[18px] font-normal rounded-md ${
                activeTab === "current"
                  ? "bg-[#49479D] text-white"
                  : "border-2 border-[#CDCDCD] text-[#434343]"
              }`}
              onClick={() => setActiveTab("current")}
            >
              Current Booking
            </button>
            <button
              className={`flex-1 mx-1 py-2 text-[18px] rounded-md font-normal ${
                activeTab === "past"
                  ? "bg-[#49479D] text-white"
                  : "border-2 border-[#CDCDCD] text-[#434343]"
              }`}
              onClick={() => setActiveTab("past")}
            >
              Past Booking
            </button>
          </div>

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
              <CircularProgress size={50} sx={{ color: "#49479D" }} />
            </Box>
          ) : flatBookings.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
                {paginatedGrouped.map((pkg) => (
                  <div key={pkg.pkgId} className="space-y-3">
                    {/* <h3 className="text-lg font-bold text-[#49479D] bg-gray-100 p-2 rounded">
                      {pkg.packageName}
                    </h3> */}

                    {pkg.bookings.map((booking, idx) => (
                      <div
                        key={booking.id}
                        className="bg-white rounded-md p-3 shadow-sm space-y-2 text-sm"
                      >
                        <div className="flex justify-between text-[#17215F]">
                          <span className="font-bold text-xs">S.No.</span>
                          <span className="text-xs font-medium">
                            {startIndex + idx + 1}
                          </span>
                        </div>
                        <hr className="text-[#EEEEEE]" />

                        <div className="flex justify-between text-[#17215F]">
                          <span className="font-bold text-xs">Subject</span>
                          <span className="text-xs font-medium">
                            {booking.subject}
                          </span>
                        </div>
                        <hr className="text-[#EEEEEE]" />

                        <div className="flex justify-between text-[#17215F]">
                          <span className="font-bold text-xs">
                            Student Name
                          </span>
                          <span className="text-xs font-medium">
                            {booking.studentName}
                          </span>
                        </div>
                        <hr className="text-[#EEEEEE]" />

                        <div className="flex justify-between text-[#17215F]">
                          <span className="font-bold text-xs">Tutor Name</span>
                          <span className="text-xs font-medium">
                            {booking.teacherName}
                          </span>
                        </div>
                        <hr className="text-[#EEEEEE]" />

                        <div className="flex justify-between text-[#17215F]">
                          <span className="font-bold text-xs">
                            Start Date / Time
                          </span>
                          <span className="flex gap-4 items-center">
                            <div className="flex items-center gap-1">
                              <img src="/cal.png" alt="calendar" />
                              <span className="font-bold text-xs text-[#17215F]">
                                {booking.date}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <img src="/alarm-clock.png" alt="clock" />
                              <span className="text-[#17215F] text-xs font-bold">
                                {booking.time}
                              </span>
                            </div>
                          </span>
                        </div>
                        <hr className="text-[#EEEEEE]" />

                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#17215F] text-xs">
                            Status
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              booking.status === "pending"
                                ? "text-[#F5A439]"
                                : "text-[#4CAF50]"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        {activeTab === "past" && (
                          <>
                            <hr className="text-[#EEEEEE]" />
                            <div className="flex justify-between items-center gap-2">
                              <span className="font-bold text-xs text-[#17215F]">
                                Action
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleOpenPopup}
                                  className="px-2 py-1 bg-[#49479D] text-white text-xs rounded-full"
                                >
                                  Comment
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                        {/* Reschedule Only For Current Booking */}
                        {activeTab === "current" && (
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#17215F] text-xs">
                              Reschedule
                            </span>

                            <Link to="/rescheduling">
                              <button className="w-[103px] bg-[#17215F] text-white rounded-[6px] py-1.5 text-xs">
                                Reschedule
                              </button>
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-4 py-4">
                <button
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={handlePrev}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <BookingPrompt />
          )}
        </div>
      </div>
    </div>
  );
};

const BookingPrompt = () => (
  <div className="flex items-center justify-center h-auto pt-10 bg-[#f1efff]">
    <div className="text-center p-6 max-w-xs">
      <div className="mb-4 flex items-center justify-center">
        <img src="/toy.png" alt="" className="w-[88px] h-[88px]" />
      </div>
      <p className="text-[#434343] text-[18px] font-medium mb-2">
        Currently, no classes are available
      </p>
      {/* <p className="text-[#4CAF50] text-[18px] font-medium mb-2">
        Now is a great time to continue their learning journey!
      </p>
      <p className="text-[#434343] font-medium text-[18px] mb-6">
        Book the next session today and receive a 10% discount.
      </p> */}

      {/* <Link to="/new-booking">
      <button
        // onClick={() => navigate("/new-booking")}
        className="bg-[#49479D] text-white text-[22px] font-normal px-6 py-2 rounded"
      >
        New Booking
      </button>
      </Link> */}
    </div>
  </div>
);

export default ManageBooking;
