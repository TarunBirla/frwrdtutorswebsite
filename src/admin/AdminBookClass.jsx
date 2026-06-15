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
// import Header from "../../utils/header/Header";
// import Sidebar from "../../utils/sidebar/Sidebar";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import httpadmin from "../service/httpadmin";

const AdminBookClass = () => {
    const locationpage = useLocation();

    const fromRenew = locationpage.state?.fromRenew === true;
    const [appointments, setAppointments] = useState([]);
    const [studentDetails, setStudentDetails] = useState([]);
    const packageFormData =
        JSON.parse(localStorage.getItem("packageFormData")) || {};
    const lessionData = JSON.parse(localStorage.getItem("lessonData")) || {};
    console.log("subjext:--", lessionData.packageNames.subjects[0]);
    const studentType = localStorage.getItem("studentType");
    const [selectedSubject, setSelectedSubject] = useState(
        lessionData.packageNames.subjects[0],
    );

    const location = useLocation();
    const branchid = localStorage.getItem("BranchId");

    useEffect(() => {
        console.log("selectedsubject:-", selectedSubject);
        const fetchData = async () => {
            const pkgData = JSON.parse(localStorage.getItem("packageFormData"));

            let level = "";

            const extractYear = (programStr) => {
                if (!programStr) return null;
                const match = programStr.match(/Year\s*(\d+)/i);
                return match && match[1] ? match[1] : null;
            };

            // if studentType is selected, respect it first
            const studentType = localStorage.getItem("studentType");

            if (studentType === "1" && pkgData?.student1?.program) {
                level = extractYear(pkgData.student1.program);
            } else if (studentType === "2" && pkgData?.student2?.program) {
                level = extractYear(pkgData.student2.program);
            }

            // fallback: check top-level program
            if (!level && pkgData?.program) {
                level = extractYear(pkgData.program);
            }

            // fallback: scan all students if still nothing
            if (!level) {
                Object.keys(pkgData || {}).forEach((key) => {
                    if (
                        key.toLowerCase().startsWith("student") &&
                        pkgData[key]?.program
                    ) {
                        const found = extractYear(pkgData[key].program);
                        if (found) level = found;
                    }
                });
            }
            // const subjectNames = getUniqueSubjects(packageFormData, studentType);
            // if (subjectNames.length === 0) return;

            try {
                const response = await httpadmin.post("/subjectFilter/", {
                    subjectNames: [selectedSubject],
                    branch_id: branchid,
                    yearLevels: [level],
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
        const raw = localStorage.getItem("adminuserdata");
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

    const [priceStatus, setPriceStatus] = useState(null);

    useEffect(() => {
        const fetchPriceStatus = async () => {
            try {
                const response = await httpadmin.get(
                    `/clientpricestatus/${userData.clientid}`,
                );
                setPriceStatus(response.data.pricestatus);
            } catch (error) {
                console.error("Error fetching price status:", error);
            }
        };

        fetchPriceStatus();
    }, []);

    const [showButton, setShowButton] = useState(0);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await httpadmin.get(
                    `/freeassismentstatus/${userData.clientid}`,
                );

                if (res.data.success) {
                    // Only show button if freeassismentemailsend is 0
                    setShowButton(1);
                }
            } catch (error) {
                console.error("Error fetching free assessment status:", error);
            }
        };

        fetchStatus();
    }, []);

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
        lessionData.lessonCounts?.[activeStudent] || {},
    );

    // const subjectColors = { English: "#5553B5", Maths: "#8F3D96" };
    const subjectColors = ["#5553B5", "#8F3D96", "#65C68F", "#49C4E9"];

    const months = [...Array(12)].map((_, i) =>
        new Date(0, i).toLocaleString("en-US", { month: "long" }),
    );

    const [weeks, setWeeks] = useState([]);

    const getMaxWeeksAllowed = (packageName, lessonCounts) => {
        const totalLessons = Object.values(lessonCounts || {}).reduce(
            (sum, val) => sum + val,
            0,
        );

        console.log("totalLessons:-", totalLessons);

        switch ((packageName || "").toUpperCase()) {
            case "SILVER":
                if (totalLessons == 1) {
                    return 6; // 6 weeks if only 1 lesson
                } else if (totalLessons == 2) {
                    return 3; // 3 weeks if 2 lessons
                }
                return Math.min(3, Math.ceil(6 / totalLessons));
            case "GOLD":
                if (totalLessons == 2) return 6;
                if (totalLessons == 3) return 4;
                if (totalLessons == 4) return 3;
                return 12;
            // case "PLATINUM":
            //   if (totalLessons <= 4) return 6;
            //   if (totalLessons <= 6) return 4;
            //   if (totalLessons <= 8) return 3;
            //   return 24;
            case "PLATINUM":
                if (totalLessons == 4) return 6;
                if (totalLessons == 6) return 4;
                if (totalLessons == 8) return 3;
                return 24;
            default:
                return 6;
        }
    };

    // const getWeeksInMonth = (month, year) => {
    //   const today = new Date();
    //   const isCurrentMonth =
    //     today.getMonth() === month && today.getFullYear() === year;

    //   const startDate = isCurrentMonth
    //     ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)
    //     : new Date(year, month, 1);

    //   const weeks = [];
    //   const currentDate = new Date(startDate);
    //   currentDate.setHours(0, 0, 0, 0);

    //   const allowedWeeks = getMaxWeeksAllowed(
    //     lessonData.packageName,
    //     lessonData.lessonCounts,
    //   );

    //   while (weeks.length < allowedWeeks) {
    //     const week = Array.from({ length: 7 }, (_, i) => {
    //       const date = new Date(currentDate);
    //       date.setDate(currentDate.getDate() + i);
    //       return date;
    //     });

    //     weeks.push(week);
    //     currentDate.setDate(currentDate.getDate() + 7);
    //   }

    //   return weeks;
    // };

    //   const getWeeksInMonth = (month, year) => {
    //   const today = new Date();

    //   // Previous months bhi allow karo
    //   let startDate = new Date(year, month, 1);

    //   // Sirf current month me today+2 se start karo
    //   if (
    //     today.getMonth() === month &&
    //     today.getFullYear() === year
    //   ) {
    //     startDate = new Date(
    //       today.getFullYear(),
    //       today.getMonth(),
    //       today.getDate() + 2
    //     );
    //   }

    //   const weeks = [];
    //   const currentDate = new Date(startDate);

    //   currentDate.setHours(0, 0, 0, 0);

    //   const allowedWeeks = getMaxWeeksAllowed(
    //     lessonData.packageName,
    //     lessonData.lessonCounts
    //   );

    //   while (weeks.length < allowedWeeks) {
    //     const week = Array.from({ length: 7 }, (_, i) => {
    //       const date = new Date(currentDate);
    //       date.setDate(currentDate.getDate() + i);
    //       return date;
    //     });

    //     weeks.push(week);
    //     currentDate.setDate(currentDate.getDate() + 7);
    //   }

    //   return weeks;
    // };
    const getWeeksInMonth = (month, year) => {
        const allowedWeeks = getMaxWeeksAllowed(
            lessonData.packageName,
            lessonData.lessonCounts,
        );

        let currentDate = new Date(year, month, 1);

        // First Monday find karo
        while (currentDate.getDay() !== 1) {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const weeks = [];

        while (weeks.length < allowedWeeks) {
            const week = [];

            for (let i = 0; i < 7; i++) {
                const d = new Date(currentDate);
                d.setDate(currentDate.getDate() + i);
                week.push(d);
            }

            weeks.push(week);

            // next Monday
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
            "0",
        )}-${String(date.getDate()).padStart(2, "0")}`;

    // const getAvailableSlotsForDate = (date) => {
    //   const dateStr = formatDateLocal(date); // YYYY-MM-DD
    //   const slots = [];
    //   const addedTimes = new Set();

    //   appointments.forEach((appt) => {
    //     const startDateStr = appt.start.substring(0, 10);

    //     if (startDateStr !== dateStr) return;

    //     let [startH, startM] = appt.start
    //       .substring(11, 16)
    //       .split(":")
    //       .map(Number);

    //     let [endH, endM] = appt.finish.substring(11, 16).split(":").map(Number);

    //     let startTotal = startH * 60 + startM;
    //     let endTotal = endH * 60 + endM;

    //     if (startTotal % 60 !== 0) {
    //       startTotal = Math.ceil(startTotal / 60) * 60;
    //     }

    //     while (startTotal + 60 <= endTotal) {
    //       const hour = Math.floor(startTotal / 60);
    //       const min = startTotal % 60;

    //       const time = `${String(hour).padStart(2, "0")}:${String(min).padStart(
    //         2,
    //         "0",
    //       )}`;

    //       const key = `${dateStr}-${time}`;

    //       if (!addedTimes.has(key)) {
    //         slots.push({
    //           date: dateStr,
    //           time,
    //           apt_id: appt.apt_id,
    //         });

    //         addedTimes.add(key);
    //       }

    //       startTotal += 60;
    //     }
    //   });

    //   return slots;
    // };

    const getAvailableSlotsForDate = (date) => {
        const dateStr = formatDateLocal(date);

        const slots = [];

        // 09:00 → 20:00 fixed slots
        for (let hour = 9; hour <= 20; hour++) {
            slots.push({
                date: dateStr,
                time: `${String(hour).padStart(2, "0")}:00`,
                apt_id: null, // keep same flow
            });
        }

        return slots;
    };
    const getSlotKey = (subject, date, time) => {
        // console.log("the slot are from teacher:-", subject, date, time);
        const dateStr = formatDateLocal(date);
        return `${subject}-${dateStr}-${time}`;
    };

    const hasConflict = (date, time) => {
        console.log("date and time", date, time);
        const dateStr = formatDateLocal(date);
        const other = selectedSubject;
        const key = `${other}-${dateStr}-${time}`;
        return selectedSlots[key] || false;
    };

    const getTotalClasses = () => {
        const packageClasses = {
            SILVER: 6,
            GOLD: 12,
            PLATINUM: 24,
        };

        return (
            packageClasses[(lessionData?.packageName || "").toUpperCase()] || 0
        );
    };

    const generatePatternSlots = (pattern, startWeekIndex) => {
        const slots = {};
        const { time, dayOfWeek, subject } = pattern;

        // Loop for current + next 2 weeks (total 3 weeks)
        const totallessons = localStorage.getItem("totalLession") || "{}";
        const lessonsCounts = lessionData.lessonCounts;
        const totalCount = Object.values(lessonsCounts).reduce(
            (sum, count) => sum + count,
            0,
        );
        const totalLessonsNum = parseInt(totallessons.replace(/\D/g, ""), 10);

        const totalValue = totalLessonsNum / totalCount;

        for (let i = 0; i < totalValue; i++) {
            const weekIndex = startWeekIndex + i;
            if (weekIndex < weeks.length) {
                const targetDate = weeks[weekIndex].find(
                    (d) => d.getDay() === dayOfWeek,
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

    const removeSlot = (slotKey) => {
        const updated = { ...selectedSlots };

        delete updated[slotKey];

        // Remove from localStorage
        localStorage.removeItem(slotKey);

        // Update selectedTeachers also
        const teachers =
            JSON.parse(localStorage.getItem("selectedTeachers")) || {};

        Object.keys(teachers).forEach((subj) => {
            teachers[subj] = teachers[subj].filter((t) => t.key !== slotKey);
        });

        localStorage.setItem("selectedTeachers", JSON.stringify(teachers));

        setSelectedSlots(updated);
    };

    const handleToggleSlot = async (date, time, apt_id) => {
        console.log("date, time, apt_id", date, time, apt_id);

        const packageFormData =
            JSON.parse(localStorage.getItem("packageFormData")) || {};

        const currentSlotKey = getSlotKey(selectedSubject, date, time);

        const alreadySelectedCount = Object.keys(selectedSlots).filter((key) =>
            key.startsWith(`${selectedSubject}-`),
        ).length;

        const storedTeacher = JSON.parse(
            localStorage.getItem("selectedTeacher"),
        );

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
        if (selectedSlots[currentSlotKey]) {
            removeSlot(currentSlotKey);
            return;
        }

        // Find the week index of the selected date
        const selectedWeekIndex = weeks.findIndex((week) =>
            week.some((d) => d.toDateString() === date.toDateString()),
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
                        week.some(
                            (d) => d.toDateString() === slotDate.toDateString(),
                        ),
                    );
                    if (weekIndex === selectedWeekIndex) {
                        weekSlotCount++;
                    }
                }
            }
        });

        // Get allowed count per week from lessonData
        const allowedPerWeek = lessonData?.lessonCounts?.[selectedSubject] || 1; // default 1 if undefined

        if (weekSlotCount >= allowedPerWeek) {
            toast.error(
                `You can only select ${allowedPerWeek} slot${
                    allowedPerWeek > 1 ? "s" : ""
                } for "${selectedSubject}" in this week.`,
            );
            return;
        }

        // Prevent conflict with other subject
        if (hasConflict(date, time)) {
            toast.error(
                "This time slot conflicts with a slot from another subject.",
            );
            return;
        }

        // Fetch teacher data from API
        const dateStr = formatDateLocal(date);

        console.log("date str of the datL-", dateStr);
        try {
            const response = await httpadmin.get(
                `/filter_tutor?subject=${encodeURIComponent(
                    selectedSubject,
                )}&date=${dateStr}&time=${time}&quallevel=${packageFormData.program}&branch_id=${branchid}`,
            );

            const data = await response.data;
            const teacherData = data?.data;
            const teacherData2 = data?.data || [];
            console.log("teacherdata:-", data?.data);

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
        // const labels = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
        const labels = [
            "1st",
            "2nd",
            "3rd",
            "4th",
            "5th",
            "6th",
            "7th",
            "8th",
            "9th",
            "10th",
            "11th",
            "12th",
            "13th",
            "14th",
            "15th",
            "16th",
            "17th",
            "18th",
            "19th",
            "20th",
            "21st",
            "22nd",
            "23rd",
            "24th",
        ];
        return `${labels[weekIndex] || `${weekIndex + 1}th`} Week`;
    };

    const getSubjectSlotCount = (subject) =>
        Object.keys(selectedSlots).filter((key) =>
            key.startsWith(`${subject}-`),
        ).length;

    const getSubjectSlotCount2 = (subject) => {
        console.log("subject:-", subject);
        return Object.keys(selectedSlots || {}).filter((key) =>
            key.startsWith(`${subject}-`),
        ).length;
    };

    const getAllSelectedSlots = () => {
        return Object.keys(selectedSlots)
            .map((key) => {
                const parts = key.split("-").map((p) => p.trim());
                const yearIndex = parts.findIndex((p) => /^\d{4}$/.test(p));

                // ✅ Fix: subject includes everything before the year, safely
                const subject =
                    yearIndex > 0
                        ? parts.slice(0, yearIndex).join(" - ").trim()
                        : parts[0] || "Unknown Subject";

                const year = parts[yearIndex];
                const month = parts[yearIndex + 1];
                const day = parts[yearIndex + 2];
                const time = parts.slice(yearIndex + 3).join("-");

                // ✅ Safe date creation
                const date = new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                );
                if (isNaN(date)) {
                    console.error("Invalid date in slot key:", key);
                }

                return {
                    subject,
                    date,
                    time: time.padStart(5, "0"), // ensure "9:00" → "09:00"
                    key,
                    tutorId: selectedSlots[key]?.tutorId || null,
                    tutorPrice: selectedSlots[key]?.tutorPrice || null,
                };
            })
            .sort(
                (a, b) => a.date - b.date || a.subject.localeCompare(b.subject),
            );
    };

    const allSelectedSlots = getAllSelectedSlots();
    console.log("date, time, apt_id:-", allSelectedSlots);

    const groupedByWeek = allSelectedSlots.reduce((acc, slot) => {
        const weekIndex = weeks.findIndex((week) =>
            week.some((d) => d.toDateString() === slot.date.toDateString()),
        );
        const weekKey = getWeekNumber(weekIndex);
        console.log("weekIndex", weekIndex, "acc", acc, "slot", slot);

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
                const response = await httpadmin.get(
                    `/clientsdata/${userData.clientid}`,
                );
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
            (name || "").trim().toLowerCase(),
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
            const response = await httpadmin.get(
                `/client/status-check?clientid=${userData.clientid}`,
            );
            console.log("status updated successfuly:", response.data);
        } catch (error) {
            console.error("error from status update:-", error);
        }
    };

    const handleService = async () => {
        try {
            setLoading(true);
            const existingTeachers =
                JSON.parse(localStorage.getItem("selectedTeachers")) || {};
            console.log("existingTeachers", existingTeachers);

            const bookedData = getAllSelectedSlots();

            localStorage.setItem("bookingdata", JSON.stringify(bookedData));
            console.log("📦 Booked Slots:", bookedData);

            console.log("userdata:-", userData.studentdetails);

            let studentId = null;

            const lessonData = JSON.parse(
                localStorage.getItem("lessonData") || "{}",
            );
            const packageFormData = JSON.parse(
                localStorage.getItem("packageFormData") || "{}",
            );
            const bookdata = JSON.parse(
                localStorage.getItem("bookingdata") || "{}",
            );

            const totallessons = localStorage.getItem("totalLession") || "{}";
            const totalLessonsNum = parseInt(
                totallessons.replace(/\D/g, ""),
                10,
            );

            const remainingLessons = Math.max(
                Number(totalLessonsNum) - Number(bookdata?.length),
                0,
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
                remaining_classess: 8,
                completed_classess: 0,
            };
            const weekdataresponse = await httpadmin.post(
                "/client-packages/",
                payload,
            );
            console.log("weekdataresponse", weekdataresponse?.data);

            console.log("payload:", payload);
            navigate("/admin/booking-summary");
        } catch (error) {
            console.error("Error during booking process:", error);
        } finally {
            setLoading(false);
        }
    };

    const [paidLoading, setPaidLoading] = useState(false);
    const handlePaidService = async () => {
        try {
            setPaidLoading(true);

            const bookedData = getAllSelectedSlots();

            localStorage.setItem("bookingdata", JSON.stringify(bookedData));
            // console.log("📦 Booked Slots:", bookedData);

            console.log("userdata:-", userData.studentdetails);

            let studentId = null;

            const lessonData = JSON.parse(
                localStorage.getItem("lessonData") || "{}",
            );
            const packageFormData = JSON.parse(
                localStorage.getItem("packageFormData") || "{}",
            );
            const bookdata = JSON.parse(
                localStorage.getItem("bookingdata") || "{}",
            );
            const totallessons = localStorage.getItem("totalLession") || "{}";

            const groupedByWeek = JSON.parse(
                localStorage.getItem("groupedByWeek"),
            );
            const storedTeacher = JSON.parse(
                localStorage.getItem("selectedTeacher"),
            );
            const storedTeacher2 = JSON.parse(
                localStorage.getItem("selectedTeachers"),
            );

            const payload = {
                clientid: userData.clientid,

                packageForm: {
                    lessonData,
                    packageFormData,
                    groupedByWeek,
                    storedTeacher,
                    storedTeacher2,
                },
                bookingdata: {
                    bookdata,
                },
                total_classess: totallessons,
            };

            console.log("payload:", payload);

            const weekdataresponse = await httpadmin.post(
                "/client-packagesfree/",
                payload,
            );
            console.log(weekdataresponse?.data);
            // Paid button clicked
            Object.keys(localStorage).forEach((key) => {
                if (
                    key !== "userdata" &&
                    key !== "token" &&
                    key !== "packageFormData" &&
                    key !== "lessonData" &&
                    key !== "totalLession" &&
                    key !== "BranchId"
                ) {
                    localStorage.removeItem(key);
                }
            });
            navigate("/free-book");
        } catch (error) {
            console.error("Error during booking process:", error);
        } finally {
            setPaidLoading(false);
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

    // Load initial state from localStorage on mount
    const [checked, setChecked] = useState(false);
    useEffect(() => {
        const saved = localStorage.getItem("freeAssessment");
        if (saved === "true") {
            setChecked(true);
        }
    }, []);

    // Save to localStorage whenever it changes
    const handleChange = async (e) => {
        const isChecked = e.target.checked;
        setChecked(isChecked);
        localStorage.setItem("freeAssessment", isChecked ? "1" : "0");

        // ✅ Sirf jab checkbox ON ho tab email bhejo
        if (isChecked) {
            try {
                const raw = localStorage.getItem("adminuserdata");
                const userData = raw ? JSON.parse(raw) : null;

                if (!userData?.email) {
                    toast.error("Email not found!");
                    return;
                }

                const response = await httpadmin.post("/clientemailsend/", {
                    email: userData.email,
                    type: "free_assessment",
                });

                if (response.data.success) {
                    toast.success("Support Email sent successfully!");
                } else {
                    toast.error("Failed to send email.");
                }
            } catch (error) {
                console.error("Email error:", error);
                toast.error("Something went wrong while sending email!");
            }
        }
    };

    const [noSlotAvailable, setNoSlotAvailable] = useState(false);
    useEffect(() => {
        if (!weeks.length) return;

        let hasSlot = false;

        weeks.forEach((week) => {
            week.forEach((date) => {
                const slots = getAvailableSlotsForDate(date);
                if (slots.length > 0) {
                    hasSlot = true;
                }
            });
        });

        setNoSlotAvailable(!hasSlot);
    }, [appointments, weeks, selectedSubject]);

    const handleSupportClick = async () => {
        try {
            const raw = localStorage.getItem("adminuserdata");
            const userData = raw ? JSON.parse(raw) : null;

            if (!userData?.email) {
                toast.error("Email not found!");
                return;
            }

            const response = await httpadmin.post("/clientemailsend/", {
                email: userData.email,
                type: "no_slot",
            });

            if (response.data.success) {
                toast.success("Support team notified!");
            } else {
                toast.error("Failed to send email.");
            }
        } catch (error) {
            console.error("Email error:", error);
            toast.error("Something went wrong!");
        }
    };

    return (
        <div
            className="bg-[#EEEDFE] min-h-screen p-4 font-sans"
            style={{
                backgroundImage: "url('/Background.png')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#EEEDFE", // ya koi fallback color
            }}
        >
            <div className="max-w-md mx-auto">
                <div className="mt-18">
                    <p className="text-xs text-[#7A7A7A] font-medium mb-2">
                        {(() => {
                            const packageClasses = {
                                SILVER: 6,
                                GOLD: 12,
                                PLATINUM: 24,
                            };

                            const totalClasses =
                                packageClasses[lessionData?.packageName] || 0;

                            // Sum all lesson counts
                            const maxPerWeek = Object.values(
                                lessionData?.lessonCounts || {},
                            ).reduce((sum, val) => sum + val, 0);

                            return `The package you selected allows you to choose up to ${totalClasses} classes in total, with a maximum of ${maxPerWeek} per week.`;
                        })()}
                    </p>

                    {/* <div className="flex gap-2 mb-4"> */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {lessionData.packageNames.subjects.map(
                            (subj, index) => (
                                <div
                                    key={subj}
                                    className="relative group w-full"
                                >
                                    <button
                                        key={subj}
                                        onClick={() => handleSubjectClick(subj)}
                                        className={` w-full flex items-center gap-2 px-4 py-3 rounded-[8px] text-xs shadow font-medium ${
                                            selectedSubject === subj
                                                ? "text-white"
                                                : "bg-white text-[#434343]"
                                        }`}
                                        style={{
                                            backgroundColor:
                                                selectedSubject === subj
                                                    ? subjectColors[
                                                          index %
                                                              subjectColors.length
                                                      ]
                                                    : "white",
                                            color:
                                                selectedSubject === subj
                                                    ? "white"
                                                    : subjectColors[
                                                          index %
                                                              subjectColors.length
                                                      ],
                                        }}
                                    >
                                        <span
                                            className={`text-[10px] font-medium w-[14px] h-[14px] rounded-full flex items-center justify-center ${
                                                selectedSubject === subj
                                                    ? "bg-white text-[#434343]"
                                                    : ""
                                            }`}
                                            style={{
                                                backgroundColor:
                                                    selectedSubject === subj
                                                        ? "white"
                                                        : subjectColors[
                                                              index %
                                                                  subjectColors.length
                                                          ],
                                                color:
                                                    selectedSubject === subj
                                                        ? "#434343"
                                                        : "white",
                                            }}
                                        >
                                            {getSubjectSlotCount(subj)}
                                        </span>
                                        {subj?.split(" ")[0] + "..."}
                                    </button>
                                    <div
                                        className="absolute left-1/2 -translate-x-1/2 top-full mt-1
                   hidden group-hover:block
                   bg-black text-white text-xs px-2 py-1
                   rounded whitespace-nowrap z-50"
                                    >
                                        {subj}
                                    </div>
                                </div>
                            ),
                        )}
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
                                    // disabled={
                                    //   (firstSelectedMonth !== null && i > firstSelectedMonth) ||
                                    //   i < currentMonth
                                    // }
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
                                        onClick={() =>
                                            setCurrentWeekIndex(actualIndex)
                                        }
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

                            <button
                                onClick={() => navigateWeek(1)}
                                disabled={currentWeekIndex === weeks.length - 1}
                                className="w-8 h-8 flex items-center shadow justify-center rounded border border-[#EEEEEE]"
                            >
                                <NavigateNext fontSize="small" />
                            </button>
                        </div>

                        <div className="ml-auto text-xs text-[#7A7A7A]">
                            {months[selectedMonth]} {selectedYear}
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-sm mt-4">
                        {currentWeek.map((date, i) => {
                            const { day, date: dateNum } = formatDate(date);
                            const isCurrentMonth =
                                date.getMonth() === selectedMonth;
                            return (
                                <div key={i} className="text-center">
                                    <div
                                        className={`text-xs font-semibold ${
                                            isCurrentMonth
                                                ? "text-black"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {day}
                                    </div>
                                    <div
                                        className={`text-xs lg:text-sm font-bold ${
                                            isCurrentMonth
                                                ? "text-black"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {dateNum}
                                    </div>
                                </div>
                            );
                        })}

                        {currentWeek.map((date, i) => {
                            const available = getAvailableSlotsForDate(date);

                            // Safely handle missing subject data
                            const subjects =
                                lessionData?.packageNames?.subjects || [];
                            const subjectColorMap = subjects.reduce(
                                (acc, subj, i) => {
                                    acc[subj] =
                                        subjectColors[i % subjectColors.length];
                                    return acc;
                                },
                                {},
                            );

                            return (
                                <div
                                    key={i}
                                    className="flex flex-col items-center gap-1 mt-2"
                                >
                                    {available.map(({ time, apt_id }) => {
                                        const normalizedTime = time.padStart(
                                            5,
                                            "0",
                                        );

                                        // find if this slot is already selected
                                        const matchedSlot =
                                            allSelectedSlots.find(
                                                (s) =>
                                                    s.date.toDateString() ===
                                                        date.toDateString() &&
                                                    s.time === normalizedTime,
                                            );

                                        const selected = Boolean(matchedSlot);

                                        return (
                                            <button
                                                key={`${date}-${time}`}
                                                onClick={() =>
                                                    handleToggleSlot(
                                                        date,
                                                        time,
                                                        apt_id,
                                                    )
                                                }
                                                className={`relative w-[41px] lg:w-[45px] h-[40px] text-[10.75px] font-semibold rounded-md transition-all duration-150 ${
                                                    selected
                                                        ? "text-white font-semibold"
                                                        : "bg-white border border-[#EBEBEB] text-[#000000] font-semibold"
                                                }`}
                                                style={
                                                    selected
                                                        ? {
                                                              backgroundColor:
                                                                  subjectColorMap[
                                                                      matchedSlot
                                                                          ?.subject
                                                                  ] ||
                                                                  "#4C51BF",
                                                          }
                                                        : {}
                                                }
                                            >
                                                {selected && (
                                                    <>
                                                        <div className="absolute top-0 left-0">
                                                            <PersonIcon
                                                                sx={{
                                                                    fontSize: 12,
                                                                    color: "white",
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="absolute top-0 right-0 rotate-45">
                                                            <ExpandLessSharpIcon
                                                                sx={{
                                                                    fontSize: 16,
                                                                    color: "white",
                                                                }}
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

                        {/* No Slot Available Message + Support Button */}
                    </div>
                    {noSlotAvailable && (
                        <div className="mt-6 bg-black-50 border border-black-200 rounded-lg p-4 text-center">
                            <p className="text-sm text-black-600 font-medium mb-3">
                                ⚠️ No slots are currently available for this
                                subject.
                            </p>

                            <button
                                onClick={handleSupportClick}
                                className="bg-[#49479D] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition"
                            >
                                Contact Support
                            </button>
                        </div>
                    )}
                </div>
                {allSelectedSlots.length > 0 && (
                    <div className="mt-4 space-y-3">
                        <h3 className="font-bold text-sm mb-2 px-2">
                            Selected Slots
                        </h3>
                        {Object.entries(groupedByWeek).map(
                            ([weekLabel, slotsInWeek]) => (
                                <div
                                    key={weekLabel}
                                    className="relative bg-[#FFFF] p-4 rounded-xl shadow-md"
                                >
                                    {/* Left vertical week label */}
                                    <div
                                        className={`absolute ${
                                            slotsInWeek.length === 1
                                                ? "left-[-10px]"
                                                : "left-[-40px]"
                                        } top-1/2 -translate-y-1/2 rotate-[-90deg] bg-[#434343] text-white text-[11px] font-semibold ${
                                            slotsInWeek.length === 1
                                                ? "px-4"
                                                : "px-12"
                                        } py-1 rounded-full`}
                                    >
                                        {weekLabel}
                                    </div>

                                    {/* Slots inside this week */}
                                    <div className="space-y-4 pl-6">
                                        {slotsInWeek.map(({ slot }, idx) => {
                                            const teacherInfo = JSON.parse(
                                                localStorage.getItem(
                                                    slot.key,
                                                ) || "{}",
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
                                                                    <img
                                                                        src="/cal2.png"
                                                                        alt=""
                                                                    />
                                                                    {slot.date.toLocaleDateString(
                                                                        "en-US",
                                                                        {
                                                                            weekday:
                                                                                "short",
                                                                            month: "short",
                                                                            day: "numeric",
                                                                        },
                                                                    )}
                                                                </div>
                                                                <div className="flex text-xs items-center gap-1 text-[#17215F] font-bold">
                                                                    <img
                                                                        src="/alarm-clock.png"
                                                                        alt=""
                                                                    />
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
                                                                    alt={
                                                                        teacherInfo?.name
                                                                    }
                                                                />
                                                                <div className="flex flex-col leading-tight">
                                                                    <div className="text-xs lg:text-[14px] font-bold text-[#17215F]">
                                                                        {
                                                                            teacherInfo?.name
                                                                        }
                                                                    </div>
                                                                    <div
                                                                        className={`text-xs text-[#434343] font-medium `}
                                                                        // style={{ color: session.subjectColor }}
                                                                    >
                                                                        For{" "}
                                                                        <span
                                                                            title={
                                                                                slot.subject
                                                                            }
                                                                            className={`${
                                                                                slot.subject ===
                                                                                selectedSubject
                                                                                    ? "text-[#49479D]"
                                                                                    : "text-[#8F3D96]"
                                                                            }`}
                                                                        >
                                                                            {slot.subject?.split(
                                                                                " ",
                                                                            )[0] +
                                                                                "..."}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Remove button */}
                                                        <button
                                                            onClick={() => {
                                                                removeSlot(
                                                                    slot.key,
                                                                );
                                                            }}
                                                            className="text-[#434343] flex items-center justify-center py-1 px-2 rounded-full bg-[#F0F0F0] text-sm"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                    {idx !==
                                                        groupedByWeek[weekLabel]
                                                            .length -
                                                            1 && (
                                                        <div className="w-full h-0 border-t border-dotted border-[#B1B1B1] mt-4"></div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}

                {/* BOOK BUTTON */}
                <div>
                    {!showButton && !fromRenew && (
                        <label className="mt-6 flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={handleChange}
                                className="w-4 h-4"
                            />
                            <span>Free Assessment</span>
                        </label>
                    )}
                </div>
                <div className="mt-6 flex gap-2 justify-end text-right">
                    <button
                        onClick={() => navigate("/admin/manage-packages")}
                        className="px-6 py-3 flex items-center justify-center  rounded-[6px] text-white font-bold bg-[#49479D] hover:bg-[#3a3782]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleService}
                        disabled={allSelectedSlots.length === 0 || loading}
                        className={`px-6 py-3 flex items-center justify-center  rounded-[6px] text-white font-bold ${
                            allSelectedSlots.length === 0 || loading
                                ? "bg-[#464646]/20  cursor-not-allowed"
                                : "bg-[#49479D] hover:bg-[#3a3782]"
                        }`}
                    >
                        {loading ? "Processing..." : "Book Now"}
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
                            <div className="">
                                {Array.isArray(popupInfo?.teacherData2) &&
                                popupInfo.teacherData2.length > 0 ? (
                                    popupInfo.teacherData2.map(
                                        (tutor, index) => {
                                            const rawSubjects = JSON.parse(
                                                tutor.subject || "[]",
                                            );

                                            // Deduplicate subjects
                                            const uniqueSubjects = Array.from(
                                                new Map(
                                                    rawSubjects.map((subj) => [
                                                        subj.name,
                                                        subj,
                                                    ]),
                                                ).values(),
                                            );

                                            const fullDetails =
                                                buildFullDetails(tutor);

                                            return (
                                                <div
                                                    key={index}
                                                    className="bg-white rounded-xl p-4 mb-4 shadow"
                                                >
                                                    {/* Tutor Image + Info */}
                                                    <div className="flex items-start gap-1">
                                                        <img
                                                            src={
                                                                tutor.photo ||
                                                                "/tutor2.png"
                                                            }
                                                            alt={
                                                                tutor.first_name
                                                            }
                                                            className="w-[73px] h-[73px] rounded-[4px] object-cover"
                                                        />

                                                        <div className="flex-1">
                                                            <div className="flex justify-between mb-2">
                                                                <div className="flex flex-col gap-1 flex-wrap">
                                                                    <h3 className="font-bold text-[14px] text-[#17215F]">
                                                                        {`${tutor?.first_name ?? ""} ${
                                                                            tutor?.last_name ??
                                                                            ""
                                                                        }`.trim()}
                                                                    </h3>

                                                                    {/* Subjects */}
                                                                    <div className="flex gap-2 flex-wrap">
                                                                        {uniqueSubjects.map(
                                                                            (
                                                                                subject,
                                                                                idx,
                                                                            ) => (
                                                                                <span
                                                                                    key={
                                                                                        idx
                                                                                    }
                                                                                    className="bg-[#F2F2F2] text-xs text-[#6F6F6F] font-semibold px-4 py-0.5 rounded-full"
                                                                                >
                                                                                    {
                                                                                        subject.name
                                                                                    }
                                                                                </span>
                                                                            ),
                                                                        )}
                                                                    </div>

                                                                    {/* Description */}
                                                                    <p className="text-xs text-[#434343] font-medium mb-2">
                                                                        I will
                                                                        prove
                                                                        that
                                                                        learning
                                                                        a new
                                                                        language
                                                                        is fun
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center justify-between gap-2">
                                                        <button
                                                            onClick={() =>
                                                                toggleDetail(
                                                                    index,
                                                                )
                                                            }
                                                            className={`w-[103px] flex items-center justify-center gap-2 border border-[#C2C2C2] text-[#434343] rounded-[6px] py-1.5 text-xs`}
                                                        >
                                                            View Detail
                                                            <span>
                                                                {openDetailIndex ===
                                                                index ? (
                                                                    <ExpandMoreIcon fontSize="small" />
                                                                ) : (
                                                                    <ExpandLess fontSize="small" />
                                                                )}
                                                            </span>
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                const key =
                                                                    getSlotKey(
                                                                        selectedSubject,
                                                                        popupInfo.date,
                                                                        popupInfo.time,
                                                                    );
                                                                const parts =
                                                                    key.split(
                                                                        "-",
                                                                    );
                                                                if (
                                                                    parts.length <
                                                                    4
                                                                ) {
                                                                    console.error(
                                                                        "Invalid slot key format",
                                                                    );
                                                                    return;
                                                                }

                                                                const subject =
                                                                    parts
                                                                        .slice(
                                                                            0,
                                                                            -3,
                                                                        )
                                                                        .join(
                                                                            "-",
                                                                        );
                                                                const [
                                                                    year,
                                                                    month,
                                                                    day,
                                                                    time,
                                                                ] =
                                                                    parts.slice(
                                                                        -4,
                                                                    );
                                                                const dateTimeString = `${year}-${month}-${day}T${time}:00.000Z`;
                                                                const isoDate =
                                                                    new Date(
                                                                        dateTimeString,
                                                                    );

                                                                if (
                                                                    firstSelectedMonth ===
                                                                    null
                                                                ) {
                                                                    setFirstSelectedMonth(
                                                                        isoDate.getMonth(),
                                                                    );
                                                                }

                                                                const teacherData =
                                                                    {
                                                                        id: tutor.id,
                                                                        name: `${tutor.first_name} ${tutor.last_name}`,
                                                                        subject:
                                                                            selectedSubject,
                                                                        date: isoDate.toISOString(),
                                                                        time: popupInfo.time,
                                                                        apt_id: popupInfo.apt_id,
                                                                        weekIndex:
                                                                            currentWeekIndex,
                                                                        key,
                                                                        teacherId:
                                                                            tutor.id,
                                                                    };

                                                                localStorage.setItem(
                                                                    key,
                                                                    JSON.stringify(
                                                                        teacherData,
                                                                    ),
                                                                );
                                                                localStorage.setItem(
                                                                    "selectedTeacher",
                                                                    JSON.stringify(
                                                                        teacherData,
                                                                    ),
                                                                );

                                                                const existingTeachers =
                                                                    JSON.parse(
                                                                        localStorage.getItem(
                                                                            "selectedTeachers",
                                                                        ),
                                                                    ) || {};

                                                                const currentSubjectArray =
                                                                    existingTeachers[
                                                                        selectedSubject
                                                                    ] || [];

                                                                const alreadyExists =
                                                                    currentSubjectArray.some(
                                                                        (t) =>
                                                                            t.key ===
                                                                            teacherData.key,
                                                                    );

                                                                const subjectCountLimit =
                                                                    lessonData
                                                                        .lessonCounts[
                                                                        selectedSubject
                                                                    ] || 1;
                                                                const sameWeekSlotCount =
                                                                    currentSubjectArray.filter(
                                                                        (t) =>
                                                                            t.weekIndex ===
                                                                            currentWeekIndex,
                                                                    ).length;

                                                                if (
                                                                    !alreadyExists &&
                                                                    sameWeekSlotCount >=
                                                                        subjectCountLimit
                                                                ) {
                                                                    toast.error(
                                                                        `You can only select ${subjectCountLimit} slot(s) for ${selectedSubject} in one week.`,
                                                                    );
                                                                    return;
                                                                }

                                                                const updatedSubjectArray =
                                                                    alreadyExists
                                                                        ? currentSubjectArray.map(
                                                                              (
                                                                                  t,
                                                                              ) =>
                                                                                  t.key ===
                                                                                  teacherData.key
                                                                                      ? teacherData
                                                                                      : t,
                                                                          )
                                                                        : [
                                                                              ...currentSubjectArray,
                                                                              teacherData,
                                                                          ];

                                                                const updatedTeachers =
                                                                    {
                                                                        ...existingTeachers,
                                                                        [selectedSubject]:
                                                                            updatedSubjectArray,
                                                                    };

                                                                localStorage.setItem(
                                                                    "selectedTeachers",
                                                                    JSON.stringify(
                                                                        updatedTeachers,
                                                                    ),
                                                                );

                                                                const weekIndexForDate =
                                                                    weeks.findIndex(
                                                                        (
                                                                            week,
                                                                        ) =>
                                                                            week.some(
                                                                                (
                                                                                    d,
                                                                                ) =>
                                                                                    d.toDateString() ===
                                                                                    popupInfo.date.toDateString(),
                                                                            ),
                                                                    );

                                                                const newPattern =
                                                                    {
                                                                        time: popupInfo.time,
                                                                        dayOfWeek:
                                                                            popupInfo.date.getDay(),
                                                                        subject:
                                                                            selectedSubject,
                                                                    };
                                                                const patternSlots =
                                                                    generatePatternSlots(
                                                                        newPattern,
                                                                        weekIndexForDate,
                                                                    );

                                                                // Replace the boolean with tutor data
                                                                Object.keys(
                                                                    patternSlots,
                                                                ).forEach(
                                                                    (
                                                                        slotKey,
                                                                    ) => {
                                                                        patternSlots[
                                                                            slotKey
                                                                        ] = {
                                                                            selected: true,
                                                                            tutorId:
                                                                                tutor.id,
                                                                            tutorPrice:
                                                                                tutor.tutorprice,
                                                                        };
                                                                    },
                                                                );

                                                                const clickedSlotKey =
                                                                    getSlotKey(
                                                                        selectedSubject,
                                                                        popupInfo.date,
                                                                        popupInfo.time,
                                                                    );
                                                                // patternSlots[clickedSlotKey] = true;
                                                                patternSlots[
                                                                    clickedSlotKey
                                                                ] = {
                                                                    selected: true,
                                                                    tutorId:
                                                                        tutor.id,
                                                                    tutorPrice:
                                                                        tutor.tutorprice,
                                                                };

                                                                Object.keys(
                                                                    patternSlots,
                                                                ).forEach(
                                                                    (
                                                                        slotKey,
                                                                    ) => {
                                                                        const dateParts =
                                                                            slotKey
                                                                                .split(
                                                                                    "-",
                                                                                )
                                                                                .slice(
                                                                                    -4,
                                                                                );
                                                                        const [
                                                                            y,
                                                                            m,
                                                                            d,
                                                                            t,
                                                                        ] =
                                                                            dateParts;
                                                                        const date =
                                                                            new Date(
                                                                                `${y}-${m}-${d}T${t}:00.000Z`,
                                                                            );

                                                                        const slotTeacherData =
                                                                            {
                                                                                id: tutor.id,
                                                                                name: `${tutor.first_name} ${tutor.last_name}`,
                                                                                subject:
                                                                                    selectedSubject,
                                                                                date: date.toISOString(),
                                                                                time: t,
                                                                                apt_id: popupInfo.apt_id,
                                                                                weekIndex:
                                                                                    weeks.findIndex(
                                                                                        (
                                                                                            week,
                                                                                        ) =>
                                                                                            week.some(
                                                                                                (
                                                                                                    dd,
                                                                                                ) =>
                                                                                                    dd.toDateString() ===
                                                                                                    date.toDateString(),
                                                                                            ),
                                                                                    ),
                                                                                key: slotKey,
                                                                                teacherId:
                                                                                    tutor.id,
                                                                            };

                                                                        localStorage.setItem(
                                                                            slotKey,
                                                                            JSON.stringify(
                                                                                slotTeacherData,
                                                                            ),
                                                                        );
                                                                    },
                                                                );
                                                                // ✅ ALSO save pattern slots in selectedTeachers
                                                                let storedTeachers =
                                                                    JSON.parse(
                                                                        localStorage.getItem(
                                                                            "selectedTeachers",
                                                                        ),
                                                                    ) || {};

                                                                let subjectArray =
                                                                    storedTeachers[
                                                                        selectedSubject
                                                                    ] || [];

                                                                Object.keys(
                                                                    patternSlots,
                                                                ).forEach(
                                                                    (
                                                                        slotKey,
                                                                    ) => {
                                                                        const dateParts =
                                                                            slotKey
                                                                                .split(
                                                                                    "-",
                                                                                )
                                                                                .slice(
                                                                                    -4,
                                                                                );
                                                                        const [
                                                                            y,
                                                                            m,
                                                                            d,
                                                                            t,
                                                                        ] =
                                                                            dateParts;

                                                                        const isoDate =
                                                                            new Date(
                                                                                `${y}-${m}-${d}T${t}:00.000Z`,
                                                                            );

                                                                        const slotTeacherData =
                                                                            {
                                                                                id: tutor.id,
                                                                                name: `${tutor.first_name} ${tutor.last_name}`,
                                                                                subject:
                                                                                    selectedSubject,
                                                                                date: isoDate.toISOString(),
                                                                                time: t,
                                                                                weekIndex:
                                                                                    weeks.findIndex(
                                                                                        (
                                                                                            week,
                                                                                        ) =>
                                                                                            week.some(
                                                                                                (
                                                                                                    dd,
                                                                                                ) =>
                                                                                                    dd.toDateString() ===
                                                                                                    isoDate.toDateString(),
                                                                                            ),
                                                                                    ),
                                                                                key: slotKey,
                                                                                teacherId:
                                                                                    tutor.id,
                                                                            };

                                                                        const index =
                                                                            subjectArray.findIndex(
                                                                                (
                                                                                    t,
                                                                                ) =>
                                                                                    t.key ===
                                                                                    slotKey,
                                                                            );

                                                                        if (
                                                                            index ===
                                                                            -1
                                                                        ) {
                                                                            subjectArray.push(
                                                                                slotTeacherData,
                                                                            );
                                                                        } else {
                                                                            subjectArray[
                                                                                index
                                                                            ] =
                                                                                slotTeacherData;
                                                                        }
                                                                    },
                                                                );

                                                                storedTeachers[
                                                                    selectedSubject
                                                                ] =
                                                                    subjectArray;

                                                                localStorage.setItem(
                                                                    "selectedTeachers",
                                                                    JSON.stringify(
                                                                        storedTeachers,
                                                                    ),
                                                                );

                                                                setSelectedSlots(
                                                                    (prev) => {
                                                                        const updated =
                                                                            {
                                                                                ...prev,
                                                                            };

                                                                        const maxClasses =
                                                                            getTotalClasses();

                                                                        Object.entries(
                                                                            patternSlots,
                                                                        ).forEach(
                                                                            ([
                                                                                slotKey,
                                                                                value,
                                                                            ]) => {
                                                                                // already selected ho to skip
                                                                                if (
                                                                                    updated[
                                                                                        slotKey
                                                                                    ]
                                                                                )
                                                                                    return;

                                                                                // bas jitni missing hai utni hi add karo
                                                                                if (
                                                                                    Object.keys(
                                                                                        updated,
                                                                                    )
                                                                                        .length <
                                                                                    maxClasses
                                                                                ) {
                                                                                    updated[
                                                                                        slotKey
                                                                                    ] =
                                                                                        value;
                                                                                }
                                                                            },
                                                                        );

                                                                        return updated;
                                                                    },
                                                                );

                                                                setSubjectPatterns(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [selectedSubject]:
                                                                            {
                                                                                ...newPattern,
                                                                                startWeek:
                                                                                    weekIndexForDate,
                                                                            },
                                                                    }),
                                                                );

                                                                setPopupInfo(
                                                                    null,
                                                                );
                                                            }}
                                                            className="w-[103px] bg-[#1bad5a] text-[#FFF] rounded-[6px] py-1.5 text-xs"
                                                        >
                                                            Select Tutor
                                                        </button>
                                                    </div>

                                                    {/* Details */}
                                                    {openDetailIndex ===
                                                        index && (
                                                        <div
                                                            className={`px-4 pb-4 border-gray-200 bg-gray-50 rounded-b-xl overflow-hidden transition-all duration-300 ease-in-out`}
                                                            style={{
                                                                maxHeight:
                                                                    openDetailIndex ===
                                                                    index
                                                                        ? "200px"
                                                                        : "0",
                                                                opacity:
                                                                    openDetailIndex ===
                                                                    index
                                                                        ? 1
                                                                        : 0,
                                                            }}
                                                        >
                                                            <div className="font-normal text-xs text-[#434343] space-y-2 mt-3">
                                                                {fullDetails.map(
                                                                    (
                                                                        line,
                                                                        i,
                                                                    ) => (
                                                                        <p
                                                                            key={
                                                                                i
                                                                            }
                                                                        >
                                                                            {
                                                                                line
                                                                            }
                                                                        </p>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        },
                                    )
                                ) : (
                                    <div className="text-center min-w-xs bg-white rounded-xl p-4 mb-4 shadow text-[#434343] py-8 text-sm font-medium">
                                        No available Tutors
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookClass;
