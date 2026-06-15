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
import { useNavigate } from "react-router-dom";
import Header from "../../utils/header/Header";
import Sidebar from "../../utils/sidebar/Sidebar";
import axios from "axios";
import http from "../../service/http";

const BookClass = () => {
  const [appointments, setAppointments] = useState([]);
  const [studentDetails, setStudentDetails] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await http.get("/availabilityalldata");
        console.log("Fetched data:", response.data);

        setAppointments(response.data);
      } catch (err) {
        console.error("Error fetching location data:", err);
      }
    };

    fetchData();
  }, []);

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

  const lessionData = JSON.parse(localStorage.getItem("lessonData")) || {};
  console.log("subjext:--", lessionData.packageNames.subjects[0]);

  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const currentMonth = new Date().getMonth(); // Current month index (0 = Jan)

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0); // selected week
  const [startVisibleIndex, setStartVisibleIndex] = useState(0); // controls visible window
  const weeksData = [0, 1, 2, 3, 4, 5];
  // Total 6 weeks

  const [selectedSubject, setSelectedSubject] = useState(
    lessionData.packageNames.subjects[0]
  );
  const [selectedSlots, setSelectedSlots] = useState({});
  const [subjectPatterns, setSubjectPatterns] = useState({});
  const [popupInfo, setPopupInfo] = useState(null);
  const [activeStudent, setActiveStudent] = useState("student1");

  const selectedSubjects = Object.keys(
    lessionData.lessonCounts?.[activeStudent] || {}
  );

  // const subjectColors = { English: "#5553B5", Maths: "#8F3D96" };
  const subjectColors = ["#5553B5", "#8F3D96"];
  const months = [...Array(12)].map((_, i) =>
    new Date(0, i).toLocaleString("en-US", { month: "long" })
  );

  // const getWeeksInMonth = (month, year) => {
  //   const firstDay = new Date(year, month, 1);
  //   const lastDay = new Date(year, month + 1, 0);
  //   const weeks = [];
  //   let startOfWeek = new Date(firstDay);
  //   startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  //   while (startOfWeek <= lastDay) {
  //     const week = Array.from({ length: 7 }, (_, i) => {
  //       const date = new Date(startOfWeek);
  //       date.setDate(startOfWeek.getDate() + i);
  //       return date;
  //     });
  //     weeks.push(week);
  //     startOfWeek.setDate(startOfWeek.getDate() + 7);
  //   }
  //   return weeks;
  // };

  const [weeks, setWeeks] = useState([]);

  // const getWeeksInMonth = (month, year) => {
  //   const today = new Date();
  //   const isCurrentMonth =
  //     month === today.getMonth() && year === today.getFullYear();

  //   // If it's the current month, start from today + 2 days, otherwise from 1st
  //   let baseStart = isCurrentMonth
  //     ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)
  //     : new Date(year, month, 1);

  //   baseStart.setHours(0, 0, 0, 0);

  //   // Find the previous Sunday (or same day if already Sunday)
  //   const startOfWeek = baseStart;

  //   startOfWeek.setDate(startOfWeek.getDate());
  //   console.log("today:-", startOfWeek);

  //   // Get the last day of the month
  //   const endOfMonth = new Date(year, month + 1, 0);
  //   const endDate = new Date(endOfMonth);
  //   endDate.setHours(0, 0, 0, 0);
  //   endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // Extend to Saturday

  //   const weeks = [];
  //   let current = new Date(startOfWeek);

  //   while (current <= endDate) {
  //     const week = Array.from({ length: 7 }, (_, i) => {
  //       const d = new Date(current);
  //       d.setDate(d.getDate() + i);
  //       return new Date(d); // clone
  //     });
  //     weeks.push(week);
  //     current.setDate(current.getDate() + 7);
  //   }

  //   return weeks;
  // };

  // const getWeeksInMonth = (month, year) => {
  //   const today = new Date();
  //   const isCurrentMonth =
  //     today.getMonth() === month && today.getFullYear() === year;

  //   // Start date: today + 2 if current month, otherwise 1st of that month
  //   const startDate = isCurrentMonth
  //     ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)
  //     : new Date(year, month, 1);

  //   const lastDay = new Date(year, month + 1, 0);
  //   const weeks = [];

  //   let startOfWeek = new Date(startDate);
  //   startOfWeek.setHours(0, 0, 0, 0);

  //   while (startOfWeek <= lastDay) {
  //     const week = Array.from({ length: 7 }, (_, i) => {
  //       const date = new Date(startOfWeek);
  //       date.setDate(startOfWeek.getDate() + i);
  //       return date;
  //     });

  //     weeks.push(week);
  //     startOfWeek.setDate(startOfWeek.getDate() + 7);
  //   }

  //   return weeks;
  // };
  const getWeeksInMonth = (month, year) => {
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === month && today.getFullYear() === year;

    // Start from today + 2 if it's the current month, else from the 1st of selected month
    const startDate = isCurrentMonth
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)
      : new Date(year, month, 1);

    const weeks = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    // Add 4 or 5 weeks depending on the number of days remaining
    while (weeks.length < 6) {
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

  // useEffect(() => {
  //   const newWeeks = getWeeksInMonth(selectedMonth, selectedYear);
  //   setWeeks(newWeeks);
  //   setCurrentWeekIndex(0);
  //   setStartVisibleIndex(0);
  // }, [selectedMonth, selectedYear]);

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

  // const navigateWeek = (dir) => {
  //   const newIndex = currentWeekIndex + dir;
  //   if (newIndex >= 0 && newIndex < weeks.length) setCurrentWeekIndex(newIndex);
  // };

  // const navigateWeek = (dir) => {
  //   const newIndex = currentWeekIndex + dir;
  //   if (newIndex < 0 || newIndex >= weeks.length) return;

  //   // Slide the visible window
  //   if (dir === 1 && startVisibleIndex + 3 < weeks.length) {
  //     setStartVisibleIndex((prev) => prev + 1);
  //   } else if (dir === -1 && startVisibleIndex > 0) {
  //     setStartVisibleIndex((prev) => prev - 1);
  //   }

  //   setCurrentWeekIndex(newIndex);
  // };
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

      // console.log(
      //   `UK Time Slot: ${ukStart.toISOString().substring(11, 16)} - ${ukFinish
      //     .toISOString()
      //     .substring(11, 16)}`
      // );

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
    const other = selectedSubject === "English" ? "Maths" : "English";
    const key = `${other}-${dateStr}-${time}`;
    return selectedSlots[key] || false;
  };

  // const generatePatternSlots = (pattern, startWeekIndex) => {
  //   const slots = {};
  //   const { time, dayOfWeek, subject } = pattern;
  //   for (let i = 0; i < 3; i++) {
  //     const weekIndex = startWeekIndex + i;
  //     if (weekIndex < weeks.length) {
  //       const targetDate = weeks[weekIndex].find(
  //         (d) => d.getDay() === dayOfWeek
  //       );
  //       if (targetDate && targetDate.getMonth() === selectedMonth) {
  //         const available = getAvailableSlotsForDate(targetDate);
  //         if (
  //           available.some((slot) => slot.time === time) &&
  //           !hasConflict(targetDate, time)
  //         ) {
  //           const key = getSlotKey(subject, targetDate, time);
  //           slots[key] = true;
  //         }
  //       }
  //     }
  //   }
  //   return slots;
  // };

  const generatePatternSlots = (pattern, startWeekIndex) => {
    const slots = {};
    const { time, dayOfWeek, subject } = pattern;

    // Loop for current + next 2 weeks (total 3 weeks)
    for (let i = 0; i <= 2; i++) {
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
      setSelectedSlots(updated);
      return;
    }

    // Prevent selecting another slot for same subject
    if (alreadySelectedCount >= 1) {
      alert(`You can only select one slot for ${selectedSubject}.`);
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
      console.log("teacherdata:-", data.data);

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
      // 1. Safely check student details
      // const students = userData?.studentdetails;
      // if (Array.isArray(students)) {
      //   const lessonNameRaw =
      //     lessonData?.studentName?.name1 ||
      //     lessonData?.studentName?.name2 ||
      //     "";
      //   const lessonName = lessonNameRaw.trim().toLowerCase();

      //   const matchedStudent = students.find((student) => {
      //     const fullName = `${(student?.first_name || "").trim()} ${(
      //       student?.last_name || ""
      //     ).trim()}`.toLowerCase();
      //     console.log("Comparing:", fullName, "vs", lessonName);
      //     return fullName === lessonName;
      //   });

      //   console.log("Matched student:", matchedStudent);

      //   if (matchedStudent?.id) {
      //     studentId = matchedStudent.id;
      //   } else {
      //     console.warn("No matching student found.");
      //   }
      // } else {
      //   console.warn("No studentdetails available in userData.");
      // }

      // console.log("studentId found:", studentId);

      const payload = {
        clientid: userData.clientid,
        studentName1: lessonData?.studentName?.name1,
        studentName2: lessonData?.studentName?.name2,
        packageDetails: {
          name: lessonData.packageNames?.name || lessonData.name,
          lessons: lessonData.packageNames.lessons,
          lession2: lessonData.packageNames.lession2,
          price: lessonData.packageNames.price,
          description: lessonData.packageNames.description,
          duration_days: lessonData.packageNames.duration_days,
        },
        // subjects: lessonData?.subjects,
        teacherData: Object.keys(existingTeachers).reduce((acc, subject) => {
          const teachers = existingTeachers[subject] || [];
          teachers.forEach((t) => {
            acc.push({
              name: t.name,
              apt_id: t.apt_id,
              id: t.id,
              key: t.key,
              subject: subject, // you can also use t.subject if it's reliable
              teacherId: t.teacherId,
              time: t.time,
              weekIndex: t.weekIndex,
            });
          });
          return acc;
        }, []),

        weekData: Object.keys(groupedByWeek).flatMap((week) =>
          groupedByWeek[week].map((entry) => ({
            week,
            date: entry.slot.date,
            key: entry.slot.key,
            subject: entry.slot.subject,
            time: entry.slot.time,
          }))
        ),

        // bookedData: bookedData,
        packageForm: {
          location: packageFormData.location,
          program: packageFormData.program,
          students: packageFormData.students,
          studyType: packageFormData.studyType,
          name1: packageFormData.name1,
          name2: packageFormData.name2,
          subjects: packageFormData.subject, // overall selected subjects
          studentDetails: {
            student1: {
              name: packageFormData.student1?.name,
              program: packageFormData.student1?.program,
              subjects: packageFormData.student1?.subject || [],
            },
            student2: {
              name: packageFormData.student2?.name,
              program: packageFormData.student2?.program,
              subjects: packageFormData.student2?.subject || [],
            },
          },
        },
      };

      console.log("payload:", payload);

      const contractorList = Object.values(existingTeachers)
        .flat()
        .map((t) => ({
          contractor: t.teacherId,
          subject: t.subject,
          start: t.date, // ✅ Use full ISO date
        }));
      console.log("contractorList:-", contractorList);

      for (const [index, contractorObj] of contractorList.entries()) {
        const { contractor, subject, start } = contractorObj;

        console.log("all the the data:-", contractor, subject, start);
        const rcrs = studentIds.map((id) => ({ recipient: id }));

        const startdate = new Date(start);

        const finish = new Date(startdate.getTime() + 60 * 60 * 1000); // +1 hour

        // const serviceData = {
        //   name: username,
        //   dft_charge_type: "hourly",
        //   dft_charge_rate: "0",
        //   dft_contractor_rate: "0",
        //   conjobs: [{ contractor }],
        //   rcrs: [{ recipient: studentId }],
        // };
        const serviceData = {
          name: username,
          dft_charge_type: "hourly",
          dft_charge_rate: "0",
          dft_contractor_rate: "0",
          conjobs: [{ contractor }],
          rcrs: rcrs,
        };

        const serviceRes = await http.post("/services/", serviceData);
        const serviceId = serviceRes.data.id;
        console.log(`[${index}] Service created:`, serviceId);

        const appointmentPayload = [
          {
            start: startdate.toISOString(),
            finish: finish.toISOString(),
            topic: subject,
            status: "planned",
            service: serviceId,
            contractor,
          },
        ];

        console.log("📅 appointmentsAPI:", appointmentPayload);

        await http.post("/appointments/", appointmentPayload);

        console.log(
          `[${index}] Appointment created for contractor ${contractor}`
        );
      }

      const weekdataresponse = await http.post("/client-packages/", payload);

      console.log(weekdataresponse?.data);
      handleStatus();

      navigate("/booking-summary");
    } catch (error) {
      console.error("Error during booking process:", error);
    } finally {
      setLoading(false);
    }
  };
  console.log("allSelectedSlotsallSelectedSlots", allSelectedSlots);

  return (
    <div className="bg-[#EEEDFE] min-h-screen p-4 font-sans">
      <div className="max-w-md mx-auto">
        <Header
          title="Book Classes"
          leftIconOne="☰"
          onLeftOneClick={() => setIsMenuOpen(true)}
          leftIconTwo
          onLeftTwoClick={() => window.history.back()}
          rightText="Renew"
          onRightTextClick={() => (window.location.href = "/booking-summary")}
        />

        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <div className="mt-20">
          <p className="text-xs text-[#7A7A7A] font-medium mb-2">
            The package you selected allows you to choose up to 6 classes in
            total, with a maximum of 2 per week.
          </p>

          <div className="flex gap-2 mb-4">
            {lessionData.packageNames.subjects.map((subj, index) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-xs font-medium text-white ${
                  selectedSubject === subj ? "ring-2 ring-white" : ""
                }`}
                // style={{ backgroundColor: subjectColors[subj] }}
                style={{
                  backgroundColor: subjectColors[index % subjectColors.length],
                }}
              >
                <span className="bg-white text-[10px] text-[#434343] font-medium w-[14px] h-[14px] rounded-full flex items-center justify-center">
                  {getSubjectSlotCount(subj)}
                </span>
                {subj}
              </button>
            ))}
            {lessionData.lessonCounts.student1 &&
              lessionData.lessonCounts.student2 &&
              lessionData.studentName?.name1 &&
              lessionData.studentName?.name2 && (
                <>
                  <div className="w-full flex flex-col">
                    {/* Student Tabs */}
                    {/* <div className="flex gap-2 p-2 bg-[#FFFFFF]  rounded-[11px] w-full my-4">
                      {["student1", "student2"].map((key) => (
                        <button
                          key={key}
                          onClick={() => setActiveStudent(key)}

                          className={`px-4 py-2 text-[12px] font-medium rounded-[8px] transition-all duration-200 ${
                            activeStudent === key
                              ? "bg-[#434343] text-[#FFFFFF]"
                              : "bg-[#F5F5F5] text-[#434343]"
                          }`}
                        >
                          {key === "student1"
                            ? lessionData.studentName.name1
                            : lessionData.studentName.name2}
                        </button>
                      ))}
                    </div> */}
                    <div className="flex gap-2 p-2 bg-[#FFFFFF] rounded-[11px] w-full my-4">
                      {["student1", "student2"].map((key) => {
                        // Check if any slots are selected (for any student)
                        const allSelectedSlotKeys = Object.keys(
                          selectedSlots || {}
                        );
                        const disableOtherButton =
                          allSelectedSlotKeys.length > 0 &&
                          activeStudent !== key;
                        const isStudent1CheckedOut =
                          localStorage.getItem("checkStudent1");

                        // Determine if the current button should be disabled due to checkout
                        const isDisabled =
                          disableOtherButton ||
                          (isStudent1CheckedOut && key === "student1");
                        return (
                          <button
                            key={key}
                            onClick={() => setActiveStudent(key)}
                            // disabled={disableOtherButton}
                            disabled={isDisabled}
                            className={`px-4 py-2 text-[12px] font-medium rounded-[8px] transition-all duration-200 ${
                              activeStudent === key
                                ? "bg-[#434343] text-[#FFFFFF]"
                                : "bg-[#F5F5F5] text-[#434343]"
                            } ${
                              isDisabled ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            {key === "student1"
                              ? lessionData?.studentName?.name1 || "Student 1"
                              : lessionData?.studentName?.name2 || "Student 2"}
                          </button>
                        );
                      })}
                    </div>

                    {/* Subject Buttons for Selected Student */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedSubjects.map((subj, index) => (
                        <button
                          key={subj}
                          onClick={() => setSelectedSubject(subj)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-xs font-medium text-white ${
                            selectedSubject === subj ? "ring-2 ring-white" : ""
                          }`}
                          style={{
                            // backgroundColor: subjectColors[subj] || "#666",
                            backgroundColor:
                              subjectColors[index % subjectColors.length],
                          }}
                        >
                          <span className="bg-white text-[10px] text-[#434343] font-medium w-[14px] h-[14px] rounded-full flex items-center justify-center">
                            {/* {lessionData?.lessonCounts?.[activeStudent]?.[
                              subj
                            ] ?? */}
                            {getSubjectSlotCount2(subj)}
                            {/* ?? */}
                            {/* 0} */}
                          </span>
                          {subj}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
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
                <option key={i} value={i} disabled={i < currentMonth}>
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
                    className={`px-1 lg:px-3 py-1 lg:py-2 rounded text-[10px] lg:text-xs font-medium ${
                      currentWeekIndex === actualIndex
                        ? "bg-[#434343] border-[#EBEBEB] shadow text-white"
                        : "bg-[#FFFF] border-[#EBEBEB] shadow text-[#434343]"
                    }`}
                  >
                    {getWeekNumber(actualIndex)}
                  </button>
                );
              })}

            <button
              onClick={() => navigateWeek(-1)}
              disabled={currentWeekIndex === 0}
              className="w-5 h-5 lg:w-8 lg:h-8 flex items-center justify-center rounded border border-[#EEEEEE]"
            >
              <NavigateBefore fontSize="small" />
            </button>

            {/* Next Button */}
            <button
              onClick={() => navigateWeek(1)}
              disabled={currentWeekIndex === weeks.length - 1}
              className="w-5 h-5 lg:w-8 lg:h-8 flex items-center justify-center rounded border border-[#EEEEEE]"
            >
              <NavigateNext fontSize="small" />
            </button>

            <div className="ml-auto text-xs text-[#7A7A7A]">
              {months[selectedMonth]} {selectedYear}
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
          <div className="mt-4 space-y-6">
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
                            <div className="flex flex-col text-xs ml-2 text-[13px] font-bold text-[#17215F]">
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
                                    {slot.subject}
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
                              setSelectedSlots(updated);
                            }}
                            className="text-[#434343] flex items-center justify-center py-1 px-2 rounded-full bg-[#F0F0F0] text-sm"
                          >
                            ✕
                          </button>
                        </div>
                        {idx !== groupedByWeek[weekLabel].length - 1 && (
                          <div className="w-[250px] h-0 border-t border-dotted border-[#B1B1B1] mt-4"></div>
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
          {/* <button
            onClick={() => {
              const bookedData = getAllSelectedSlots();
              localStorage.setItem("bookingdata", JSON.stringify(bookedData));
              console.log("Booked slots:", bookedData);
              navigate("/booking-summary");
            }}
            disabled={allSelectedSlots.length === 0}
            className={`px-6 py-2 rounded text-white font-bold ${
              allSelectedSlots.length === 0
                ? "bg-gray-400"
                : "bg-[#49479D] hover:bg-[#3a3782]"
            }`}
          >
            Book Now
          </button> */}

          <button
            onClick={handleService}
            disabled={allSelectedSlots.length === 0 || loading}
            className={`px-6 py-2 rounded text-white font-bold ${
              allSelectedSlots.length === 0 || loading
                ? "bg-gray-400 cursor-not-allowed"
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
                            {/* <div className="flex flex-col items-end text-xs w-[60px]">
                              <span className="text-[#17215F] font-bold text-[15px] flex items-center gap-1">
                                <img src="/star.png" alt="" />
                                {tutor.rating}
                              </span>
                              <span className="text-[#17215F] font-medium text-xs">
                                {tutor.review}
                              </span>
                            </div> */}
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          // onClick={() => toggleDetail(index)}
                          className={`w-[103px]  flex items-center justify-center gap-2 
                            border border-[#C2C2C2] 
                          text-[#434343] rounded-[6px] py-1.5 text-xs`}
                        >
                          View Detail
                          <span>
                            {/* {openDetailIndex === index ? ( */}
                            <ExpandMoreIcon fontSize="small" />
                            {/* ) : ( */}
                            {/* // <ExpandLessIcon fontSize="small" />
                              ""
                            )} */}
                          </span>
                        </button>
                        {popupInfo?.teacher?.id !== null && (
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
                            Select
                          </button>
                        )}
                      </div>
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

export default BookClass;
