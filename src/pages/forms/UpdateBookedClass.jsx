import React, { useEffect, useMemo, useState } from "react";
import {
  Person,
  ExpandLess,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import PersonIcon from "@mui/icons-material/Person";
import ExpandLessSharpIcon from "@mui/icons-material/ExpandLessSharp";
import { data, useNavigate } from "react-router-dom";
import Header from "../../utils/header/Header";
import Sidebar from "../../utils/sidebar/Sidebar";
import axios from "axios";
import http from "../../service/http";
import { toast } from "react-toastify";

const UpdateBookedClass = () => {
  const [appointments, setAppointments] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
        const branchid = localStorage.getItem("BranchId");
  const packageFormData =
    JSON.parse(localStorage.getItem("packageFormData")) || {};
  const rescheduleData =
    JSON.parse(localStorage.getItem("rescheduleData")) || {};
  const selectedSubject = rescheduleData?.topic || "Subject";
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [weeks, setWeeks] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [startVisibleIndex, setStartVisibleIndex] = useState(0);
  const months = [...Array(12)].map((_, i) =>
    new Date(0, i).toLocaleString("en-US", { month: "long" })
  );

  const [selectedSlots, setSelectedSlots] = useState(() => {
    try {
      const raw = localStorage.getItem("selectedSlots");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [holidaySet, setHolidaySet] = useState(new Set());

useEffect(() => {
  const fetchHolidays = async () => {
    try {
      const res = await http.get("/holidays/upcoming");

      const dates = res.data.data.map(h =>
        new Date(h.holiday_date).toISOString().slice(0, 10)
      );

      setHolidaySet(new Set(dates));
    } catch (err) {
      console.error("Holiday API error", err);
    }
  };

  fetchHolidays();
}, []);

const normalizeDate = (dateStr) => {
  return new Date(dateStr + "T00:00:00Z").toISOString().slice(0, 10);
};



  const persistSelected = (next) => {
    setSelectedSlots(next);
    localStorage.setItem("selectedSlots", JSON.stringify(next));
  };


useEffect(() => {
  const fetchData = async () => {
    try {
      const branchId = localStorage.getItem("BranchId");
      const rescheduleData = JSON.parse(localStorage.getItem("rescheduleData")) || {};
      const tutorId = rescheduleData?.contractorNameid;

      const tutorAPI = await http.get(`/contractorsalldata?branch_id=${branchId}`);
      const tutors = tutorAPI.data;

      const tutor = tutors.find(t => t.id === tutorId);
      if (!tutor) {
        setAppointments([]);
        return;
      }

      const selectedSubject = rescheduleData?.topic;
      const subjectNames = selectedSubject ? [selectedSubject] : [];

      let yearLevels = [];
      if (tutor?.quallevel) {
        yearLevels = Array.from(new Set(
          tutor.quallevel
            .split(",")
            .map(lvl => {
              const match = lvl.match(/Year\s*(\d+)/);
              return match ? match[1] : null;
            })
            .filter(Boolean)
        ));
      }

      const payload = { branch_id: branchId, subjectNames, yearLevels };
      const response = await http.post("/subjectFilter/", payload);

      console.log("responseresponse",response)
      const tutorAvailability = JSON.parse(tutor.availability || "[]"); // Parse string to array
      setAppointments(tutorAvailability);

    } catch (err) {
      console.error("Error fetching subject filter data:", err);
    }
  };

  fetchData();
}, [rescheduleData?.topic]);

  const formatDateLocal = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  const formatHumanDate = (dateObj) =>
    dateObj.toLocaleDateString("en-GB", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const keyOf = (subject, dateObj, time) =>
    `${subject}|${formatDateLocal(dateObj)}|${time}`;

  const parseKey = (key) => {
    const [subject, d, time] = key.split("|");
    const [y, m, day] = d.split("-").map(Number);
    const dateObj = new Date(y, m - 1, day);
    return { subject, dateObj, dateStr: d, time };
  };

  const getWeekNumberLabel = (idx) => {
    const labels = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
    return `${labels[idx] || `${idx + 1}th`} Week`;
  };

  const buildWeeks = (month, year) => {
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === month && today.getFullYear() === year;

    const startDate = isCurrentMonth
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)
      : new Date(year, month, 1);

    const out = [];
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);

    while (out.length < 6) {
      const week = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(cursor);
        d.setDate(cursor.getDate() + i);
        return d;
      });
      out.push(week);
      cursor.setDate(cursor.getDate() + 7);
    }
    return out;
  };

  useEffect(() => {
    const w = buildWeeks(selectedMonth, selectedYear);
    setWeeks(w);
    setCurrentWeekIndex(0);
    setStartVisibleIndex(0);
  }, [selectedMonth, selectedYear]);

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
    
  };

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

 
  const getAvailableSlotsForDate = (date) => {
    const dateStr = formatDateLocal(date);
    const slots = [];
    const added = new Set();

    const toUTCBase = (iso) => {
      const base = new Date(iso);
      const [hour, minute] = base.toISOString().substring(11, 16).split(":");
      const local = new Date(base);
      local.setUTCHours(parseInt(hour), parseInt(minute), 0, 0);
      return local;
    };

    appointments.forEach((appt) => {
      const start = toUTCBase(appt.start);
      const end = toUTCBase(appt.finish);
      if (isNaN(start) || isNaN(end)) return;

      const cursor = new Date(start);
      while (cursor < end) {
        const slotDateStr = formatDateLocal(cursor);
        if (slotDateStr === dateStr) {
          const time = cursor.toISOString().substring(11, 16); // HH:mm
          const key = `${slotDateStr}-${time}`;
          if (!added.has(key)) {
            slots.push({ date: slotDateStr, time, apt_id: appt.apt_id });
            added.add(key);
          }
        }
        cursor.setMinutes(cursor.getMinutes() + 60);
      }
    });

    return slots;
  };

  const currentWeek = weeks[currentWeekIndex] || [];

  const handleToggleSlot = (dateObj, time, apt_id) => {

    console.log("dateObj, time, apt_id", dateObj, time, apt_id);
    
    const key = keyOf(selectedSubject, dateObj, time);
    persistSelected((prev) => {
      if (prev[key]) return {};

      return {
        [key]: {
          subject: selectedSubject,
          date: formatDateLocal(dateObj),
          time,
          apt_id,
        },
      };
    });
  };

  const isSelected = (dateObj, time) => {
    const key = keyOf(selectedSubject, dateObj, time);
    return Boolean(selectedSlots[key]);
  };

  const selectedList = useMemo(() => {
    const rows = Object.entries(selectedSlots).map(([key, val]) => {
      const { subject, dateObj, dateStr, time } = parseKey(key);
      return { key, subject, dateObj, dateStr, time, apt_id: val?.apt_id };
    });
    rows.sort(
      (a, b) =>
        a.dateObj - b.dateObj ||
        a.time.localeCompare(b.time) ||
        a.subject.localeCompare(b.subject)
    );
    return rows;
  }, [selectedSlots]);

  const removeSelected = (k) => {
    persistSelected((prev) => {
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };
    const [userPackageId, setUserPackageId] = useState(null);
  
 let userData = null;
  try {
    const raw = localStorage.getItem("userdata");
    userData = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing userdata:", error);
  }
   useEffect(() => {
      const fetchUserPackage = async () => {
        try {
          if (!userData?.clientid) return;
  
          const res = await http.get(`/client-packages/${userData.clientid}`);
  
          const pkg = res.data?.data?.[0];

if (pkg?.id) {
  setUserPackageId(pkg.id); 
}
        } catch (err) {
          console.error("Package fetch error", err);
        }
      };
  
      fetchUserPackage();
    }, []);

  const handleService = async () => {
    try {
      setLoading(true);
        const branchid = localStorage.getItem("BranchId");
      localStorage.setItem(
        "selectedSlotsPayload",
        JSON.stringify(selectedList)
      );

      console.log("selectedList:-", selectedList[0]);
      const selected = selectedList[0];

  const selectedDateStr = normalizeDate(selected.dateStr);

const isSelectedDateHoliday = holidaySet.has(selectedDateStr);

console.log("Selected Date:", selectedDateStr);
console.log("Is Holiday:", isSelectedDateHoliday);




      const startTime = new Date(
        `${selected.dateStr}T${selected.time}:00.000Z`
      );

      console.log("startTime" ,startTime);
      
      const now = new Date();
      if (startTime <= now) {
        alert("Please choose a future date and time.");
        return;
      }

      const finishTime = new Date(startTime.getTime() + 60 * 60000);
      console.log("startTime1" ,finishTime);

      const payload = {
        // start: startTime.toISOString(),
        // finish: finishTime.toISOString(),
          start: new Date(startTime.getTime() - 4 * 60 * 60 * 1000).toISOString(),
  finish: new Date(finishTime.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        topic: selected.subject,
        service: rescheduleData.serviceId,
        branch_id: branchid,
      };

      console.log("payload:-", payload);

      try {
        await http.put(
          `/appointments/${rescheduleData.appointmentId}`,
          payload
        );

        if (!isSelectedDateHoliday) {
      await http.post("/client-package/reschedule", {
        client_package_row_id: userPackageId,
      });
      console.log("✅ Package reschedule API called");
    } else {
      console.log("🎉 Holiday selected → API skipped");
    }

        toast.success("Appointment rescheduled successfully");
      } catch (error) {
        console.error("Error updating appointment:", error);
        toast.error("Failed to update appointment.");
      }

      localStorage.removeItem("rescheduleData");

      navigate("/rescheduling");
    } catch (error) {
      console.error("Error during booking process:", error);
    } finally {
      setLoading(false);
    }
  };

  const stored = localStorage.getItem("rescheduleData");
const data = stored ? JSON.parse(stored) : null;

if (data?.paymentRequired === true) {
  console.log("✅ Payment required");
} else {
  console.log("❌ No payment");
}



  // ---------- UI ----------
  const formatHeaderDay = (date) => {
    const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    return { day: days[date.getDay()], date: date.getDate() };
  };

  console.log("selectedList:-", selectedList);


  
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
          onRightTextClick={() => navigate("/new-booking")}
        />

        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        <div className="mt-20">
          <p className="text-xs text-[#7A7A7A] font-medium mb-2">
            The package you selected allows you to choose up to 6 classes in
            total, with a maximum of 2 per week.
          </p>

          <div className="flex gap-2 mb-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-xs font-medium text-white bg-[#5553B5]">
              {selectedSubject}
            </button>
          </div>
        </div>

        {/* Calendar / Slots */}
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
              .map((week, idx) => {
                const actualIndex = startVisibleIndex + idx;
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
                    {getWeekNumberLabel(actualIndex)}
                  </button>
                );
              })}

            <button
              onClick={() => navigateWeek(-1)}
              disabled={currentWeekIndex === 0}
              className="w-5 h-5 lg:w-8 lg:h-8 flex items-center justify-center rounded border border-[#EEEEEE]"
              title="Previous week"
            >
              <NavigateBefore fontSize="small" />
            </button>

            <button
              onClick={() => navigateWeek(1)}
              disabled={currentWeekIndex === weeks.length - 1}
              className="w-5 h-5 lg:w-8 lg:h-8 flex items-center justify-center rounded border border-[#EEEEEE]"
              title="Next week"
            >
              <NavigateNext fontSize="small" />
            </button>

            <div className="ml-auto text-xs text-[#7A7A7A]">
              {months[selectedMonth]} {selectedYear}
            </div>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 gap-2 text-sm mt-4">
            {currentWeek.map((date, i) => {
              const { day, date: dateNum } = formatHeaderDay(date);
              const isCurrentMonth = date.getMonth() === selectedMonth;
              return (
                <div key={`head-${i}`} className="text-center">
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

            {/* Time slots per day */}
            {currentWeek.map((date, i) => {
              const available = getAvailableSlotsForDate(date);
              return (
                <div
                  key={`col-${i}`}
                  className="flex flex-col items-center gap-1 mt-2"
                >
                  {available.map(({ time, apt_id }) => {
                    const selected = isSelected(date, time);
                    return (
                      <button
                        key={`${formatDateLocal(date)}-${time}`}
                        onClick={() => handleToggleSlot(date, time, apt_id)}
                        className={`relative w-[41px] lg:w-[45px] h-[40px] text-[10.75px] rounded-md transition-all duration-150 ${
                          selected
                            ? "bg-[#49479D] text-white font-semibold"
                            : "bg-white border border-[#EBEBEB] text-[#000000] font-semibold"
                        }`}
                        title={`${formatHumanDate(date)} • ${time}`}
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
                        <div className="flex items-center justify-center h-full">
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

        {/* Selected Slots */}
        <div className="mt-6">
          <h3 className="font-bold text-sm mb-2 px-2">Selected Slots</h3>

          {selectedList.length === 0 ? (
            <div className="bg-white p-4 rounded-xl shadow text-sm text-[#7A7A7A]">
              No slots selected yet. Tap a time slot above to add it here.
            </div>
          ) : (
            <div className="bg-white px-4 py-4 rounded-xl shadow divide-y">
              {selectedList.map(({ key, subject, dateObj, time }, idx) => (
                <div key={key} className="flex items-center justify-between">
                  {/* Left Section - Date & Time */}
                  <div className="flex flex-col gap-2 text-xs font-medium text-[#434343]">
                    <div className="flex items-center gap-1">
                      <img src="/cal2.png" alt="" className="w-4 h-4" />
                      <span className="font-semibold ">
                        {formatHumanDate(dateObj)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[#434343]">
                      <img src="/alarm-clock.png" alt="" className="w-4 h-4" />
                      <span className="font-semibold">{time}</span>
                    </div>
                  </div>

                  {/* Middle Section - Contractor Card */}
                  <div className="flex items-center bg-[#F5F5FF] rounded-lg px-2 py-2 ml-3">
                    <img
                      src={rescheduleData.avatarUrl || "/tutorlady.jpg"}
                      alt={rescheduleData.contractorName}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <div className="flex flex-col leading-tight text-left">
                      <span className="text-xs font-semibold text-[#17215F]">
                        {rescheduleData.contractorName}
                      </span>
                      <span className="text-xs text-[#434343]">
                        For{" "}
                        <b className="text-[#49479D]">
                          {subject.split(" ")[0] + "..."}
                        </b>
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeSelected(key)}
                    className="ml-3 text-[#434343] flex items-center justify-center w-6 h-6 rounded-full bg-[#F0F0F0] hover:bg-gray-300 transition"
                    aria-label="Remove"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOOK BUTTON */}
        <div className="mt-6 text-right">
          <button
            onClick={handleService}
            disabled={selectedList.length === 0 || loading}
            className={`px-6 py-2 rounded text-white font-bold ${
              selectedList.length === 0 || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#49479D] hover:bg-[#3a3782]"
            }`}
          >
            {loading ? "Processing..." : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateBookedClass;
