import React, { useEffect, useState } from "react";
import {
  Person,
  ExpandLess,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import PersonIcon from "@mui/icons-material/Person";
import ExpandLessSharpIcon from "@mui/icons-material/ExpandLessSharp";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../utils/header/Header";
import Sidebar from "../../utils/sidebar/Sidebar";
import axios from "axios";
import http from "../../service/http";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const FreeBookClass = () => {
  const [appointments, setAppointments] = useState([]);
  const [studentDetails, setStudentDetails] = useState([]);
  const packageFormData =
    JSON.parse(localStorage.getItem("packageFormData")) || {};
  const lessionData = JSON.parse(localStorage.getItem("lessonData")) || {};
  console.log("subjext:--", lessionData.packageNames.subjects[0]);
  const studentType = localStorage.getItem("studentType");
  const [selectedSubject, setSelectedSubject] = useState(
    lessionData.packageNames.subjects[0]
  );

  const location = useLocation();

  // ✅ Clear localStorage on /dashboard load (except userdata & token)
  useEffect(() => {
    if (location.pathname === "/free-book") {
      Object.keys(localStorage).forEach((key) => {
        if (
          key !== "userdata" &&
          key !== "token" &&
          key !== "packageFormData" &&
          key !== "lessonData" &&
          key !== "totalLession"
        ) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [location.pathname]);

  useEffect(() => {
    console.log("selectedsubject:-", selectedSubject);
    const fetchData = async () => {
      // const subjectNames = getUniqueSubjects(packageFormData, studentType);
      // if (subjectNames.length === 0) return;

      try {
        const response = await http.post("/subjectFilter/", {
          subjectNames: [selectedSubject],
        });
        console.log("Fetched data:", response.data);

        // Attach subject info (assuming API returns subject)
        setAppointments(response.data);
      } catch (err) {
        console.error("Error fetching subject filter data:", err);
      }
    };

    fetchData();
  }, [selectedSubject]);

  let userData = null;

  try {
    const raw = localStorage.getItem("userdata");
    userData = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing userdata:", error);
  }

  let username = "";

  if (userData) {
    const firstName = userData.firstname || "";
    const lastName = userData.lastname || "";
    username = `${firstName} ${lastName}`;
  } else {
    console.warn("userData not found in localStorage");
  }

  console.log("username:", username);

  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const currentMonth = new Date().getMonth(); // Current month index (0 = Jan)

  const [firstSelectedMonth, setFirstSelectedMonth] = useState(null); // e.g., 6 for July

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0); // selected week
  const [startVisibleIndex, setStartVisibleIndex] = useState(0); // controls visible window
  const weeksData = [0, 1, 2, 3, 4, 5];
  // Total 6 weeks

  const [selectedSlots, setSelectedSlots] = useState({});
  const [subjectPatterns, setSubjectPatterns] = useState({});
  const [popupInfo, setPopupInfo] = useState(null);
  const [activeStudent, setActiveStudent] = useState("student1");

  const selectedSubjects = Object.keys(
    lessionData.lessonCounts?.[activeStudent] || {}
  );

  // const subjectColors = { English: "#5553B5", Maths: "#8F3D96" };
  const subjectColors = ["#5553B5", "#8F3D96", "#65C68F", "#49C4E9"];

  const months = [...Array(12)].map((_, i) =>
    new Date(0, i).toLocaleString("en-US", { month: "long" })
  );

  const [weeks, setWeeks] = useState([]);

  const getMaxWeeksAllowed = (packageName, lessonCounts) => {
    const totalLessons = Object.values(lessonCounts || {}).reduce(
      (sum, val) => sum + val,
      0
    );

    switch ((packageName || "").toUpperCase()) {
      case "SILVER":
        if (totalLessons === 1) {
          return 6; // 6 weeks if only 1 lesson
        } else if (totalLessons === 2) {
          return 6; // 3 weeks if 2 lessons
        }
        return Math.min(3, Math.ceil(6 / totalLessons));
      case "GOLD":
        if (totalLessons === 2) return 6;
        if (totalLessons === 3) return 6;
        if (totalLessons === 4) return 6;
        return 6;
      case "PLATINUM":
        if (totalLessons <= 4) return 6;
        if (totalLessons <= 6) return 6;
        if (totalLessons <= 8) return 6;
        return 6;
      default:
        return 6;
    }
  };
  const getWeeksInMonth = (month, year) => {
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === month && today.getFullYear() === year;

    const startDate = isCurrentMonth
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)
      : new Date(year, month, 1);

    const weeks = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    const allowedWeeks = getMaxWeeksAllowed(
      lessonData.packageName,
      lessonData.lessonCounts
    );

    while (weeks.length < allowedWeeks) {
      const week = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + i);
        return date;
      });

      weeks.push(week);
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeks;
  };

  useEffect(() => {
    const newWeeks = getWeeksInMonth(selectedMonth, selectedYear);
    setWeeks(newWeeks);
    setCurrentWeekIndex(0);
    setStartVisibleIndex(0);
  }, [selectedMonth, selectedYear]);

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    setSelectedMonth(newMonth);
    setSelectedSlots({});
    setSubjectPatterns({});
  };

  const currentWeek = weeks[currentWeekIndex] || [];

  const navigateWeek = (dir) => {
    const newIndex = currentWeekIndex + dir;
    if (newIndex < 0 || newIndex >= weeks.length) return;

    if (dir === 1 && startVisibleIndex + 3 < weeks.length) {
      setStartVisibleIndex((prev) => prev + 1);
    } else if (dir === -1 && startVisibleIndex > 0) {
      setStartVisibleIndex((prev) => prev - 1);
    }

    setCurrentWeekIndex(newIndex);
  };

  const formatDateLocal = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  const getAvailableSlotsForDate = (date) => {
    const dateStr = formatDateLocal(date); // "YYYY-MM-DD"
    const slots = [];
    const addedTimes = new Set();

    const formatTimeToDate = (isoStr) => {
      const baseDate = new Date(isoStr);
      const [hour, minute] = baseDate
        .toISOString()
        .substring(11, 16)
        .split(":");
      const local = new Date(baseDate);
      local.setUTCHours(parseInt(hour), parseInt(minute), 0, 0);
      return local;
    };

    appointments.forEach((appt) => {
      const ukStart = formatTimeToDate(appt.start);
      const ukFinish = formatTimeToDate(appt.finish);

      if (isNaN(ukStart) || isNaN(ukFinish)) return;

      let current = new Date(ukStart.getTime());

      // console.log("current", current); // prevent mutation of ukStart

      while (current < ukFinish) {
        const slotDateStr = formatDateLocal(current); // "YYYY-MM-DD"
        // console.log("slotDateStrcurrent", slotDateStr);
        if (slotDateStr === dateStr) {
          const time = current.toISOString().substring(11, 16);
          // console.log("time:-", time);
          // "HH:MM"
          const key = `${slotDateStr}-${time}`;
          if (!addedTimes.has(key)) {
            slots.push({
              date: slotDateStr,
              time,
              apt_id: appt.apt_id,
            });
            addedTimes.add(key);
          }
        }

        current.setMinutes(current.getMinutes() + 60);
      }
    });

    return slots;
  };

  const getSlotKey = (subject, date, time) => {
    // console.log("the slot are from teacher:-", subject, date, time);
    const dateStr = formatDateLocal(date);
    return `${subject}-${dateStr}-${time}`;
  };

  const isSlotSelected = (date, time) => {
    const key = getSlotKey(selectedSubject, date, time);
    return selectedSlots[key] || false;
  };

  const hasConflict = (date, time) => {
    console.log("date and time", date, time);
    const dateStr = formatDateLocal(date);
    const other = selectedSubject;
    const key = `${other}-${dateStr}-${time}`;
    return selectedSlots[key] || false;
  };

  const generatePatternSlots = (pattern, startWeekIndex) => {
    const slots = {};
    const { time, dayOfWeek, subject } = pattern;

    // Loop for current + next 2 weeks (total 3 weeks)
    const totallessons = localStorage.getItem("totalLession") || "{}";
    const lessonsCounts = lessionData.lessonCounts;
    const totalCount = Object.values(lessonsCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const totalLessonsNum = parseInt(totallessons.replace(/\D/g, ""), 10);

    // const totalValue = totalLessonsNum / totalCount;

    for (let i = 0; i < 1; i++) {
      const weekIndex = startWeekIndex + i;
      if (weekIndex < weeks.length) {
        const targetDate = weeks[weekIndex].find(
          (d) => d.getDay() === dayOfWeek
        );

        if (targetDate) {
          const available = getAvailableSlotsForDate(targetDate);
          if (
            available.some((slot) => slot.time === time) &&
            !hasConflict(targetDate, time)
          ) {
            const key = getSlotKey(subject, targetDate, time);
            slots[key] = true;
          }
        }
      }
    }

    return slots;
  };

  const removeSubjectSlots = (subject) => {
    setSelectedSlots((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        if (key.startsWith(`${subject}-`)) {
          delete updated[key];
          localStorage.removeItem(key); // remove teacher data too
        }
      });
      return updated;
    });
    setSubjectPatterns((prev) => {
      const newPatterns = { ...prev };
      delete newPatterns[subject];
      return newPatterns;
    });
  };

  const handleToggleSlot = async (date, time, apt_id) => {
    const packageFormData =
      JSON.parse(localStorage.getItem("packageFormData")) || {};

    const currentSlotKey = getSlotKey(selectedSubject, date, time);

    const alreadySelectedCount = Object.keys(selectedSlots).filter((key) =>
      key.startsWith(`${selectedSubject}-`)
    ).length;

    // If slot is already selected, allow deselecting
    if (selectedSlots[currentSlotKey]) {
      const updated = { ...selectedSlots };
      delete updated[currentSlotKey];
      localStorage.removeItem(currentSlotKey);

      localStorage.removeItem("selectedTeacher");
      localStorage.removeItem("selectedTeachers");
      setSelectedSlots(updated);
      return;
    }

    // Find the week index of the selected date
    const selectedWeekIndex = weeks.findIndex((week) =>
      week.some((d) => d.toDateString() === date.toDateString())
    );

    // Count how many slots are already selected for this subject in this same week
    let weekSlotCount = 0;
    Object.keys(selectedSlots).forEach((key) => {
      if (key.startsWith(`${selectedSubject}-`)) {
        const parts = key.split("-");
        if (parts.length >= 4) {
          const [_, year, month, day] = parts;
          const slotDate = new Date(`${year}-${month}-${day}`);
          const weekIndex = weeks.findIndex((week) =>
            week.some((d) => d.toDateString() === slotDate.toDateString())
          );
          if (weekIndex === selectedWeekIndex) {
            weekSlotCount++;
          }
        }
      }
    });

    // Get allowed count per week from lessonData
    const allowedPerWeek = 1; // default 1 if undefined

    if (weekSlotCount >= allowedPerWeek) {
      toast.error(
        `You can only select ${allowedPerWeek} slot${
          allowedPerWeek > 1 ? "s" : ""
        } for "${selectedSubject}" in this week.`
      );
      return;
    }

    // Prevent conflict with other subject
    if (hasConflict(date, time)) {
      alert("This time slot conflicts with a slot from another subject.");
      return;
    }

    // Fetch teacher data from API
    const dateStr = formatDateLocal(date);

    console.log("date str of the datL-", dateStr);
    try {
      const response = await http.get(
        `/filter_tutor?subject=${encodeURIComponent(
          selectedSubject
        )}&date=${dateStr}&time=${time}&quallevel=${packageFormData.program}`
      );

      const data = await response.json();
      const teacherData = data?.data?.[0];
      const teacherData2 = data?.data || [];
      console.log("teacherdata:-", data?.data?.[0]);

      const teacher = teacherData
        ? {
            id: teacherData.id,
            name: `${teacherData.first_name} ${teacherData.last_name}`,
            subject: selectedSubject,
          }
        : {
            id: null,
            name: "No Teacher Found",
            subject: selectedSubject,
          };

      setPopupInfo({ teacherData2, date, time, teacher, apt_id });
    } catch (error) {
      console.error("Failed to fetch tutor data", error);
      alert("Failed to fetch tutor info");
    }
  };

  const formatDate = (date) => {
    const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    return { day: days[date.getDay()], date: date.getDate() };
  };

  const getWeekNumber = (weekIndex) => {
    const labels = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
    return `${labels[weekIndex] || `${weekIndex + 1}th`} Week`;
  };

  const getSubjectSlotCount = (subject) =>
    Object.keys(selectedSlots).filter((key) => key.startsWith(`${subject}-`))
      .length;

  const getSubjectSlotCount2 = (subject) => {
    console.log("subject:-", subject);
    return Object.keys(selectedSlots || {}).filter((key) =>
      key.startsWith(`${subject}-`)
    ).length;
  };

  const getAllSelectedSlots = () => {
    return Object.keys(selectedSlots)
      .map((key) => {
        const parts = key.split("-");
        const subject = parts[0];
        const dateStr = `${parts[1]}-${parts[2]}-${parts[3]}`; // safely reconstruct "YYYY-MM-DD"
        const time = parts.slice(4).join("-"); // handles times like "09:00"

        const [year, month, day] = dateStr.split("-").map(Number);
        const date = new Date(year, month - 1, day);

        return { subject, date, time, key };
      })
      .sort((a, b) => a.date - b.date || a.subject.localeCompare(b.subject));
  };

  const allSelectedSlots = getAllSelectedSlots();

  useEffect(() => {
    const allSelectedSlots = getAllSelectedSlots();

    if (allSelectedSlots.length >= 1) {
      toast.error("You can't select more than 1 slot for a free assessment");
      // Optional: disable slot selection or clear extra slots here
    }
  }, []);
  const groupedByWeek = allSelectedSlots.reduce((acc, slot) => {
    const weekIndex = weeks.findIndex((week) =>
      week.some((d) => d.toDateString() === slot.date.toDateString())
    );
    const weekKey = getWeekNumber(weekIndex);

    if (!acc[weekKey]) acc[weekKey] = [];
    acc[weekKey].push({ slot, weekIndex });

    return acc;
  }, {});

  localStorage.setItem("groupedByWeek", JSON.stringify(groupedByWeek));

  const [loading, setLoading] = useState(false);

  const existingTeachers =
    JSON.parse(localStorage.getItem("selectedTeachers")) || {};

  const lessonData = JSON.parse(localStorage.getItem("lessonData") || "{}");

  console.log("existingTeachers", existingTeachers, lessonData);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await http.get(`/clientsdata/${userData.clientid}`);
        const students = response.data.client?.studentdetails || [];
        console.log("Fetched student details:", students);
        setStudentDetails(students);
      } catch (err) {
        console.error("Failed to fetch student details:", err);
      }
    };

    if (userData?.clientid) {
      fetchStudents();
    }
  }, []);

  const getMatchedStudentIds = (studentDetails, lessonData) => {
    const ids = [];

    const { name1 = "", name2 = "" } = lessonData?.studentName || {};
    const targetNames = [name1, name2].map((name) =>
      (name || "").trim().toLowerCase()
    );

    studentDetails.forEach((student) => {
      const fullName = `${(student.first_name || "").trim()} ${(
        student.last_name || ""
      ).trim()}`.toLowerCase();
      if (targetNames.includes(fullName) && student.id) {
        ids.push(student.id);
      }
    });

    return ids;
  };

  const studentIds = getMatchedStudentIds(studentDetails, lessonData);

  const handleSubjectClick = (subj) => {
    setSelectedSubject(subj);
  };

  const handleStatus = async () => {
    try {
      const response = await http.get(
        `/client/status-check?clientid=${userData.clientid}`
      );
      console.log("status updated successfuly:", response.data);
    } catch (error) {
      console.error("error from status update:-", error);
    }
  };
  const handleService = async () => {
    try {
      localStorage.setItem("freebook", 1);
      setLoading(true);
      const existingTeachers =
        JSON.parse(localStorage.getItem("selectedTeachers")) || {};
      console.log("existingTeachers", existingTeachers);

      const bookedData = getAllSelectedSlots();

      localStorage.setItem("bookingdata", JSON.stringify(bookedData));
      console.log("📦 Booked Slots:", bookedData);

      console.log("userdata:-", userData.studentdetails);

      let studentId = null;

      const lessonData = JSON.parse(localStorage.getItem("lessonData") || "{}");
      const packageFormData = JSON.parse(
        localStorage.getItem("packageFormData") || "{}"
      );
      const bookdata = JSON.parse(localStorage.getItem("bookingdata") || "{}");
      const totallessons = localStorage.getItem("totalLession") || "{}";
      const totalLessonsNum = parseInt(totallessons.replace(/\D/g, ""), 10);

      const remainingLessons = Math.max(
        Number(totalLessonsNum) - Number(bookdata?.length),
        0
      );

      const payload = {
        clientid: userData.clientid,

        packageForm: {
          lessonData,
          packageFormData,
        },
        bookingdata: {
          bookdata,
        },
        purches_status: 0,
        booked_classess: bookdata.length,
        total_classess: totallessons,
        remaining_classess: remainingLessons,
        completed_classess: 0,
      };

      console.log("payload:", payload);

      // const weekdataresponse = await http.post("/client-packages/", payload);
      // console.log(weekdataresponse?.data);

      navigate("/freebooking-summary");
    } catch (error) {
      console.error("Error during booking process:", error);
    } finally {
      setLoading(false);
    }
  };
  console.log("allSelectedSlotsallSelectedSlots", allSelectedSlots);

  const [openDetailIndex, setOpenDetailIndex] = useState(null);

  const toggleDetail = (index) => {
    setOpenDetailIndex(openDetailIndex === index ? null : index);
  };
  const buildFullDetails = (tutor) => [
    `Qualification Level: ${tutor.quallevel || "N/A"}`,
    `Town: ${tutor.town || "N/A"}`,
    `Country: ${tutor.country || "N/A"}`,
  ];

  return (
    <div className="bg-[#EEEDFE] min-h-screen p-4 font-sans">
      <div className="max-w-md mx-auto">
        <Header
          title="Book Classes"
          leftIconTwo
          onLeftTwoClick={() => {
            Swal.fire({
              title: "Are you sure?",
              text: "If you go back, your appointment data will be cleared.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#5553B5",
              cancelButtonColor: "#8F3D96",
              confirmButtonText: "Yes, go back",
              cancelButtonText: "Cancel",
            }).then((result) => {
              if (result.isConfirmed) {
                Object.keys(localStorage).forEach((key) => {
                  if (key !== "userdata" && key !== "token" && key !== "BranchId") {
                    localStorage.removeItem(key);
                  }
                });

                navigate("/dashboard");
              }
            });
          }}
        />

        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <div className="mt-20">
          {/* <div className="flex gap-2 mb-4"> */}
          {/* <div className="grid grid-cols-2 gap-2 mb-4">
            {lessionData.packageNames.subjects.map((subj, index) => (
              <button
                key={subj}
                onClick={() => handleSubjectClick(subj)}
                className={`flex items-center gap-2 px-4 py-3 rounded-[8px] text-xs shadow font-medium ${
                  selectedSubject === subj
                    ? "text-white"
                    : "bg-white text-[#434343]"
                }`}
                style={{
                  backgroundColor:
                    selectedSubject === subj
                      ? subjectColors[index % subjectColors.length]
                      : "white",
                  color:
                    selectedSubject === subj
                      ? "white"
                      : subjectColors[index % subjectColors.length],
                }}
              >
                <span
                  className={`text-[10px] font-medium w-[14px] h-[14px] rounded-full flex items-center justify-center ${
                    selectedSubject === subj ? "bg-white text-[#434343]" : ""
                  }`}
                  style={{
                    backgroundColor:
                      selectedSubject === subj
                        ? "white"
                        : subjectColors[index % subjectColors.length],
                    color: selectedSubject === subj ? "#434343" : "white",
                  }}
                >
                  {getSubjectSlotCount(subj)}
                </span>
                {subj?.split(" ")[0] + "..."}
              </button>
            ))}
          </div> */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {lessionData.packageNames.subjects.map((subj, index) => {
              const isSelected = selectedSubject === subj;
              const bookedData = getAllSelectedSlots();
              const shouldDisable = bookedData.length > 0 && !isSelected;

              return (
                <button
                  key={subj}
                  onClick={() => handleSubjectClick(subj)}
                  disabled={shouldDisable}
                  className={`flex items-center gap-2 px-4 py-3 rounded-[8px] text-xs shadow font-medium ${
                    isSelected ? "text-white" : "bg-white text-[#434343]"
                  } ${shouldDisable ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={{
                    backgroundColor: isSelected
                      ? subjectColors[index % subjectColors.length]
                      : "white",
                    color: isSelected
                      ? "white"
                      : subjectColors[index % subjectColors.length],
                  }}
                >
                  <span
                    className={`text-[10px] font-medium w-[14px] h-[14px] rounded-full flex items-center justify-center ${
                      isSelected ? "bg-white text-[#434343]" : ""
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? "white"
                        : subjectColors[index % subjectColors.length],
                      color: isSelected ? "#434343" : "white",
                    }}
                  >
                    {getSubjectSlotCount(subj)}
                  </span>
                  {subj?.split(" ")[0] + "..."}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-bold text-[#17215F]">
              Available Slots
            </h2>
            <select
              className="border-[#CCCCCC] border rounded px-3 py-1"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              {months.map((m, i) => (
                <option
                  key={i}
                  value={i}
                  disabled={
                    (firstSelectedMonth !== null && i > firstSelectedMonth) ||
                    i < currentMonth
                  }
                >
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {weeks
              .slice(startVisibleIndex, startVisibleIndex + 3)
              .map((week, index) => {
                const actualIndex = startVisibleIndex + index;
                return (
                  <button
                    key={actualIndex}
                    onClick={() => setCurrentWeekIndex(actualIndex)}
                    className={`px-2 lg:px-4 py-2 lg:py-2 border-1 border-[#EEEEEE] rounded-[6px] text-[10px] lg:text-xs font-medium ${
                      currentWeekIndex === actualIndex
                        ? "bg-[#434343] border-[#EBEBEB] shadow text-white"
                        : "bg-[#FFFF] border-[#EBEBEB] shadow text-[#434343]"
                    }`}
                  >
                    {getWeekNumber(actualIndex)}
                  </button>
                );
              })}

            <div className="flex gap-6">
              <button
                onClick={() => navigateWeek(-1)}
                disabled={currentWeekIndex === 0}
                className="w-8 h-8 flex items-center shadow justify-center rounded border border-[#EEEEEE]"
              >
                <NavigateBefore fontSize="small" />
              </button>

              {/* Next Button */}
              <button
                onClick={() => navigateWeek(1)}
                disabled={currentWeekIndex === weeks.length - 1}
                className="w-8 h-8 flex items-center shadow justify-center rounded border border-[#EEEEEE]"
              >
                <NavigateNext fontSize="small" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-sm mt-4">
            {currentWeek.map((date, i) => {
              const { day, date: dateNum } = formatDate(date);
              const isCurrentMonth = date.getMonth() === selectedMonth;
              return (
                <div key={i} className="text-center">
                  <div
                    className={`text-xs font-semibold ${
                      isCurrentMonth ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {day}
                  </div>
                  <div
                    className={`text-xs lg:text-sm font-bold ${
                      isCurrentMonth ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {dateNum}
                  </div>
                </div>
              );
            })}

            {currentWeek.map((date, i) => {
              const available = getAvailableSlotsForDate(date);
              const subjectColorMap = lessionData.packageNames.subjects.reduce(
                (acc, subj, i) => {
                  acc[subj] = subjectColors[i % subjectColors.length];
                  return acc;
                },
                {}
              );

              return (
                <div key={i} className="flex flex-col items-center gap-1 mt-2">
                  {available.map(({ time, apt_id }) => {
                    const matchedSlot = allSelectedSlots.find(
                      (s) =>
                        s.date.toDateString() === date.toDateString() &&
                        s.time === time
                    );

                    const selected = Boolean(matchedSlot);

                    return (
                      <button
                        key={time}
                        onClick={() => handleToggleSlot(date, time, apt_id)}
                        className={`relative w-[41px] lg:w-[45px] h-[40px] text-[10.75px] font-semibold rounded-md transition-all duration-150 ${
                          selected
                            ? "text-white font-semibold"
                            : "bg-white border border-[#EBEBEB] text-[#000000] font-semibold"
                        }`}
                        style={
                          selected
                            ? {
                                backgroundColor:
                                  subjectColorMap[matchedSlot?.subject],
                              }
                            : {}
                        }
                      >
                        {selected && (
                          <>
                            <div className="absolute top-0 left-0">
                              <PersonIcon
                                sx={{ fontSize: 12, color: "white" }}
                              />
                            </div>
                            <div className="absolute top-0 right-0 rotate-45">
                              <ExpandLessSharpIcon
                                sx={{ fontSize: 16, color: "white" }}
                              />
                            </div>
                          </>
                        )}
                        <div className="flex mt-0.5 items-center justify-center h-full">
                          {time}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {allSelectedSlots.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="font-bold text-sm mb-2 px-2">Selected Slots</h3>
            {Object.entries(groupedByWeek).map(([weekLabel, slotsInWeek]) => (
              <div
                key={weekLabel}
                className="relative bg-[#FFFF] p-4 rounded-xl shadow-md"
              >
                {/* Left vertical week label */}
                <div
                  className={`absolute ${
                    slotsInWeek.length === 1 ? "left-[-10px]" : "left-[-40px]"
                  } top-1/2 -translate-y-1/2 rotate-[-90deg] bg-[#434343] text-white text-[11px] font-semibold ${
                    slotsInWeek.length === 1 ? "px-4" : "px-12"
                  } py-1 rounded-full`}
                >
                  {weekLabel}
                </div>

                {/* Slots inside this week */}
                <div className="space-y-4 pl-6">
                  {slotsInWeek.map(({ slot }, idx) => {
                    const teacherInfo = JSON.parse(
                      localStorage.getItem(slot.key) || "{}"
                    );

                    // console.log("teacherInfo:-", teacherInfo);
                    return (
                      <div>
                        <div
                          key={slot.key}
                          className="flex justify-between items-center bg-white rounded-md  py-2"
                        >
                          <div className="flex items-center">
                            <div className="flex flex-col gap-1 text-xs ml-2 text-[13px] font-bold text-[#17215F]">
                              <div className="flex w-25 items-center gap-1">
                                <img src="/cal2.png" alt="" />
                                {slot.date.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                              <div className="flex text-xs items-center gap-1 text-[#17215F] font-bold">
                                <img src="/alarm-clock.png" alt="" />
                                {slot.time}
                              </div>
                            </div>
                            <div
                              className={`
                               ${
                                 slot.subject === selectedSubject
                                   ? "bg-[#49479D]/10"
                                   : "bg-[#8F3D96]/10"
                               }
                                flex items-center w-full gap-1 px-2 py-2 rounded-md`}
                            >
                              <img
                                src="/tutorlady.jpg"
                                className="w-6 h-6 rounded-full"
                                alt={teacherInfo?.name}
                              />
                              <div className="flex flex-col leading-tight">
                                <div className="text-xs lg:text-[14px] font-bold text-[#17215F]">
                                  {teacherInfo?.name}
                                </div>
                                <div
                                  className={`text-xs text-[#434343] font-medium `}
                                  // style={{ color: session.subjectColor }}
                                >
                                  For{" "}
                                  <span
                                    className={`${
                                      slot.subject === selectedSubject
                                        ? "text-[#49479D]"
                                        : "text-[#8F3D96]"
                                    }`}
                                  >
                                    {slot.subject?.split(" ")[0] + "..."}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => {
                              const updated = { ...selectedSlots };
                              delete updated[slot.key];
                              localStorage.removeItem(slot.key);
                              localStorage.removeItem("key");
                              setSelectedSlots(updated);
                            }}
                            className="text-[#434343] flex items-center justify-center py-1 px-2 rounded-full bg-[#F0F0F0] text-sm"
                          >
                            ✕
                          </button>
                        </div>
                        {idx !== groupedByWeek[weekLabel].length - 1 && (
                          <div className="w-full h-0 border-t border-dotted border-[#B1B1B1] mt-4"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOOK BUTTON */}
        <div className="mt-6 text-right">
          <button
            onClick={handleService}
            disabled={allSelectedSlots.length === 0 || loading}
            className={`px-6 py-2 rounded text-white font-bold ${
              allSelectedSlots.length === 0 || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#49479D] hover:bg-[#3a3782]"
            }`}
          >
            {loading ? "Processing..." : "Book Free Assessment"}
          </button>
        </div>
      </div>

      {/* POPUP */}
      {popupInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
          <div className="bg-[#EEEDFE] mx-2 px-2 rounded-lg max-h-[85vh] overflow-y-auto  shadow-lg">
            <div>
              <div className="flex justify-end top-0">
                <button
                  className="text-[25px] text-[#3C3C3C] font-bold"
                  onClick={() => setPopupInfo(null)}
                >
                  ×
                </button>
              </div>
              <div className="mb-4">
                <h2 className="text-[18px] text-[#434343] font-bold">
                  Available Tutors
                </h2>
              </div>
            </div>

            <div className="">
              {/* <h2 className="text-xl font-semibold mb-4">Available Tutors</h2> */}
              {Array.isArray(popupInfo?.teacherData2) &&
              popupInfo.teacherData2.length > 0 ? (
                popupInfo.teacherData2.map((tutor, index) => {
                  // const subjects = JSON.parse(tutor.subject || "[]");
                  const rawSubjects = JSON.parse(tutor.subject || "[]");

                  // Deduplicate by subject name
                  const uniqueSubjects = Array.from(
                    new Map(
                      rawSubjects.map((subj) => [subj.name, subj])
                    ).values()
                  );

                  console.log("first:-", popupInfo?.teacherData2);

                  const fullDetails = buildFullDetails(tutor);
                  return (
                    <div
                      key={index}
                      className=" bg-white rounded-xl p-4 mb-4 shadow"
                    >
                      {/* Tutor Image */}

                      <div className="flex items-start gap-1">
                        <img
                          // src={tutor?.photo}
                          // src="/tutor2.png"
                          src={tutor.photo || "/tutor2.png"}

                          alt={tutor.first_name}
                          className="w-[73px] h-[73px] rounded-[4px] object-cover"
                        />

                        <div className="flex-1">
                          {/* Name */}
                          <div className="flex justify-between mb-2">
                            <div className="flex flex-col gap-1 flex-wrap ">
                              <h3 className="font-bold text-[14px] text-[#17215F]">
                                {`${tutor?.first_name ?? ""} ${
                                  tutor?.last_name ?? ""
                                }`.trim()}
                              </h3>

                              {/* Subjects */}
                              <div className="flex gap-2 flex-wrap">
                                {/* {subjects.map((subject, idx) => ( */}
                                {uniqueSubjects.map((subject, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-[#F2F2F2] text-xs text-[#6F6F6F] font-semibold px-4 py-0.5 rounded-full"
                                  >
                                    {subject.name}
                                  </span>
                                ))}
                              </div>

                              {/* Description */}
                              <p className="text-xs text-[#434343] font-medium mb-2">
                                I will prove that learning a new language is fun
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => toggleDetail(index)}
                          className={`w-[103px]  flex items-center justify-center gap-2 
                            border border-[#C2C2C2] 
                          text-[#434343] rounded-[6px] py-1.5 text-xs`}
                        >
                          View Detail
                          <span>
                            {openDetailIndex === index ? (
                              <ExpandMoreIcon fontSize="small" />
                            ) : (
                              <ExpandLess fontSize="small" />
                            )}
                          </span>
                        </button>

                        {popupInfo?.teacher?.id && (
                          <button
                            onClick={() => {
                              const key = getSlotKey(
                                popupInfo.teacher.subject,
                                popupInfo.date,
                                popupInfo.time
                              );

                              console.log(
                                "key when select the data:-",
                                key
                                // popupInfo.date
                              );
                              const parts = key.split("-");
                              if (parts.length < 4) {
                                console.error("Invalid input format");
                                return;
                              }

                              const subject = parts
                                .slice(0, parts.length - 3)
                                .join("-");
                              const [year, month, day, time] = parts.slice(-4);
                              const dateTimeString = `${year}-${month}-${day}T${time}:00.000Z`;

                              const isoDate = new Date(dateTimeString);

                              if (isNaN(isoDate)) {
                                console.error(
                                  "Invalid date string:",
                                  dateTimeString
                                );
                                return;
                              }

                              if (firstSelectedMonth === null) {
                                setFirstSelectedMonth(isoDate.getMonth());
                              }

                              console.log("Subject:", subject);
                              console.log("ISO Date:", isoDate.toISOString());

                              const teacherData = {
                                ...popupInfo.teacher,
                                date: isoDate.toISOString(),
                                time: popupInfo.time,
                                apt_id: popupInfo.apt_id,
                                weekIndex: currentWeekIndex,
                                key,
                                teacherId: popupInfo.teacher.id,
                              };

                              localStorage.setItem(
                                key,
                                JSON.stringify(teacherData)
                              );
                              localStorage.setItem(
                                "selectedTeacher",
                                JSON.stringify(teacherData)
                              );
                              const existingTeachers =
                                JSON.parse(
                                  localStorage.getItem("selectedTeachers")
                                ) || {};

                              // Get array for selected subject or empty array
                              const currentSubjectArray =
                                existingTeachers[selectedSubject] || [];

                              // Check if this exact slot already exists (to avoid duplicate)
                              const alreadyExists = currentSubjectArray.some(
                                (t) => t.key === teacherData.key
                              );

                              const subjectCountLimit = 1;
                              const currentSlotWeekIndex = currentWeekIndex;

                              const sameWeekSlotCount =
                                currentSubjectArray.filter(
                                  (t) => t.weekIndex === currentSlotWeekIndex
                                ).length;

                              if (
                                !alreadyExists &&
                                sameWeekSlotCount >= subjectCountLimit
                              ) {
                                // alert(
                                //   `You can only select ${subjectCountLimit} slot(s) for ${selectedSubject} in one week.`
                                // );
                                // return;
                                toast.error(
                                  `You can only select ${subjectCountLimit} slot(s) for ${selectedSubject} in one week.`
                                );
                                return;
                              }

                              const updatedSubjectArray = alreadyExists
                                ? currentSubjectArray.map((t) =>
                                    t.key === teacherData.key ? teacherData : t
                                  ) // update
                                : [...currentSubjectArray, teacherData]; // add new

                              const updatedTeachers = {
                                ...existingTeachers,
                                [selectedSubject]: updatedSubjectArray,
                              };

                              localStorage.setItem(
                                "selectedTeachers",
                                JSON.stringify(updatedTeachers)
                              );

                              const weekIndexForDate = weeks.findIndex((week) =>
                                week.some(
                                  (d) =>
                                    d.toDateString() ===
                                    popupInfo.date.toDateString()
                                )
                              );
                              const newPattern = {
                                time: popupInfo.time,
                                dayOfWeek: popupInfo.date.getDay(),
                                subject: selectedSubject,
                              };
                              const patternSlots = generatePatternSlots(
                                newPattern,
                                weekIndexForDate
                              );
                              const clickedSlotKey = getSlotKey(
                                selectedSubject,
                                popupInfo.date,
                                popupInfo.time
                              );
                              patternSlots[clickedSlotKey] = true; // Ensure current slot is included

                              // Save teacherData for all pattern slots in localStorage
                              Object.keys(patternSlots).forEach((slotKey) => {
                                const dateParts = slotKey.split("-").slice(-4); // [year, month, day, time]
                                const [year, month, day, time] = dateParts;
                                const date = new Date(
                                  `${year}-${month}-${day}T${time}:00.000Z`
                                );

                                const slotTeacherData = {
                                  ...popupInfo.teacher,
                                  date: date.toISOString(),
                                  time: time,
                                  apt_id: popupInfo.apt_id,
                                  weekIndex: weeks.findIndex((week) =>
                                    week.some(
                                      (d) =>
                                        d.toDateString() === date.toDateString()
                                    )
                                  ),
                                  key: slotKey,
                                  teacherId: popupInfo.teacher.id,
                                };

                                localStorage.setItem(
                                  slotKey,
                                  JSON.stringify(slotTeacherData)
                                );
                              });

                              setSelectedSlots((prev) => ({
                                ...prev,
                                ...patternSlots,
                              }));

                              setSubjectPatterns((prev) => ({
                                ...prev,
                                [selectedSubject]: {
                                  ...newPattern,
                                  startWeek: weekIndexForDate,
                                },
                              }));
                              setPopupInfo(null);
                            }}
                            className=" w-[103px] bg-[#65C68F] text-[#FFFFFF] rounded-[6px] py-1.5 text-xs"
                          >
                            Select Tutor
                          </button>
                        )}
                      </div>

                      {openDetailIndex === index && (
                        <div
                          className={`px-4 pb-4  border-gray-200 bg-gray-50 rounded-b-xl 
                overflow-hidden transition-all duration-300 ease-in-out`}
                          style={{
                            maxHeight:
                              openDetailIndex === index ? "200px" : "0",
                            opacity: openDetailIndex === index ? 1 : 0,
                          }}
                        >
                          <div className="font-normal text-xs text-[#434343] space-y-2 mt-3">
                            {fullDetails.map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center min-w-xs bg-white rounded-xl p-4 mb-4 shadow text-[#434343] py-8 text-sm font-medium">
                  No available Tutors
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeBookClass;
