import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../utils/header/Header";
import Sidebar from "../../utils/sidebar/Sidebar";
import http from "../../service/http"; // agar tum use kar rahe ho
// ya
// import axios from "axios";

const AutoRenew = () => {
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clientData, setClientData] = useState(null);
const [loading, setLoading] = useState(false);

 let userData = null;

  try {
    const raw = localStorage.getItem("userdata");
    userData = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing userdata:", error);
  }
  // ✅ Page load hote hi modal open
useEffect(() => {
  setShowModal(true);

  if (userData?.clientid) {
    fetchClientPackage(userData.clientid);
  }

}, []);
// Convert any ISO date to UK Date + Time
const toUKDateTime = (iso) => {
  const d = new Date(iso);

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const obj = {};
  parts.forEach((p) => (obj[p.type] = p.value));

  return {
    date: `${obj.year}-${obj.month}-${obj.day}`,
    time: `${obj.hour}:${obj.minute}`,
  };
};



const fetchClientPackage = async (clientId) => {
  try {
    setLoading(true);

    const res = await http.get(`/clientbookdata/${clientId}`);

    console.log("📦 Client Package Response:", res.data?.data);

    setClientData(res.data.data); // rows

  } catch (error) {
    console.error("❌ API Error:", error);
  } finally {
    setLoading(false);
  }
};


  const handleChangePackage = () => {
    navigate("/renew-change-packages");
  };

  const getLatestPackage = (data) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  return data.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )[0];
};
const getLastBooking = (bookingdata) => {
  const parsed = JSON.parse(bookingdata || "{}");

  if (!parsed?.bookdata?.length) return null;

  const sorted = parsed.bookdata.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const last = sorted[0];

  const uk = toUKDateTime(last.date);

  return {
    ...last,
    ukDate: uk.date,
    ukTime: uk.time,
  };
};

const getNextWeekDate = (ukDate) => {
  const d = new Date(ukDate + "T00:00:00");

  d.setDate(d.getDate() + 7);

  return d; // RETURN DATE OBJECT
};



const handleAutoRenew = async () => {
  try {
    setLoading(true);

    console.log("🚀 Auto Renew Started");

    if (!clientData?.length) {
      alert("No package found");
      return;
    }

    /* =======================
       1️⃣ Get Latest Package
    ======================= */
    const latest = getLatestPackage(clientData);

    if (!latest) {
      alert("No latest package");
      return;
    }

    /* =======================
       2️⃣ Parse Data
    ======================= */
    const packageForm = JSON.parse(latest.packageForm);
    const bookingData = JSON.parse(latest.bookingdata);

    const lessonData = packageForm.lessonData;
    const packageFormData = packageForm.packageFormData;

    /* =======================
       3️⃣ Sort Old Slots
    ======================= */
    const sortedSlots = [...bookingData.bookdata].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    if (!sortedSlots.length) {
      alert("No old slots found");
      return;
    }

    /* =======================
       4️⃣ Find Base Date
    ======================= */
    const lastUK = toUKDateTime(
      sortedSlots[sortedSlots.length - 1].date
    );

    let baseDate = new Date(lastUK.date + "T00:00:00");
    baseDate.setDate(baseDate.getDate() + 7);

    console.log("📌 BASE DATE:", baseDate.toISOString());

    /* =======================
       5️⃣ Subject Filter
    ======================= */
    const rawLevel = packageFormData.program;

    const extractYear = (str) => {
      const match = String(str).match(/Year\s*(\d+)/i);
      return match ? match[1] : null;
    };

    const level = extractYear(rawLevel);

    const branchid = localStorage.getItem("BranchId");

    const subject = sortedSlots[0].subject;

    const slotRes = await http.post("/subjectFilter/", {
      subjectNames: [subject],
      branch_id: branchid,
      yearLevels: [level],
    });

    const appointments = slotRes.data || [];

    /* =======================
       6️⃣ Slot Availability
    ======================= */
    const isSlotAvailable = (date, time) => {
      return appointments.some((a) => {
        if (!a.start || !a.finish) return false;

        const start = toUKDateTime(a.start);
        const end = toUKDateTime(a.finish);

        const toMin = (t) => {
          const [h, m] = t.split(":").map(Number);
          return h * 60 + m;
        };

        const slotMin = toMin(time);
        const startMin = toMin(start.time);
        const endMin = toMin(end.time);

        return (
          start.date === date &&
          slotMin >= startMin &&
          slotMin < endMin
        );
      });
    };

    let tempDate = new Date(baseDate);

    for (const slot of sortedSlots) {
      const uk = toUKDateTime(slot.date);

      const checkDate = tempDate.toISOString().split("T")[0];

      console.log("🕐 Slot Check:", checkDate, uk.time);

      const ok = isSlotAvailable(checkDate, uk.time);

      if (!ok) {
        alert(`Slot not available on ${checkDate}`);
        return;
      }

      tempDate.setDate(tempDate.getDate() + 7);
    }

    console.log("✅ All slots available");

    /* =======================
       7️⃣ Lock Tutor
    ======================= */
    // const lockedTutorId = sortedSlots[0].tutorId;
    // Lock tutor per slot
const lockedTutors = sortedSlots.map((s) => ({
  subject: s.subject,
  tutorId: s.tutorId,
  time: s.time,
}));



   let tutorDate = new Date(baseDate);

for (let i = 0; i < sortedSlots.length; i++) {

  const slot = sortedSlots[i];
  const uk = toUKDateTime(slot.date);

  const checkDate = tutorDate.toISOString().split("T")[0];

  const expectedTutor = slot.tutorId;

  console.log("👨‍🏫 Tutor Check:", checkDate, uk.time, expectedTutor);

  const tutorRes = await http.get(
    `/filter_tutor?subject=${slot.subject}&date=${checkDate}&time=${uk.time}&quallevel=${encodeURIComponent(
      rawLevel
    )}&branch_id=${branchid}`
  );

  const tutors = tutorRes.data?.data || [];

 const found = tutors.find(
  (t) => String(t.id) === String(expectedTutor)
);

if (found) {
  const tutorName =
    found.name ||
    `${found.first_name || ""} ${found.last_name || ""}`.trim() ||
    "TBA";

  slot._tutorName = tutorName;
}



  if (!found) {
    alert(`Tutor not available on ${checkDate}`);
    return;
  }

  tutorDate.setDate(tutorDate.getDate() + 7);
}


    console.log("✅ Tutor available");

    /* =======================
       8️⃣ Build New Slots
    ======================= */
    let buildDate = new Date(baseDate);

    let slots = [];
    let groupedWeeks = {};
    let teachers = {};

    sortedSlots.forEach((oldSlot, i) => {
      const newDate = new Date(buildDate);

      const dateStr = newDate.toISOString().split("T")[0];

      const key = `${oldSlot.subject}-${dateStr}-${oldSlot.time}`;

     const slot = {
  subject: oldSlot.subject,
  date: newDate.toISOString(),
  time: oldSlot.time,
  key,
  tutorId: oldSlot.tutorId,
  tutorName: oldSlot._tutorName || "TBA",
  tutorPrice: oldSlot.tutorPrice,
};



      slots.push(slot);

      /* Week Group */
      const week = i + 1;
      const label = `${week} Week`;

      if (!groupedWeeks[label]) groupedWeeks[label] = [];

      groupedWeeks[label].push({
        slot,
        weekIndex: i,
      });

      /* Teachers */
      if (!teachers[oldSlot.subject]) {
        teachers[oldSlot.subject] = [];
      }

  teachers[oldSlot.subject].push({
  key,
  teacherId: oldSlot.tutorId,
  name: oldSlot._tutorName || "TBA", // 👈 ADD THIS
  subject: oldSlot.subject,
  date: slot.date,
  time: oldSlot.time,
  weekIndex: i,
});



      buildDate.setDate(buildDate.getDate() + 7);
    });

    console.log("✅ New Slots:", slots);

    /* =======================
       9️⃣ Save Storage
    ======================= */
    localStorage.setItem("lessonData", JSON.stringify(lessonData));
    localStorage.setItem(
      "packageFormData",
      JSON.stringify(packageFormData)
    );
    localStorage.setItem("bookingdata", JSON.stringify(slots));
    localStorage.setItem(
      "groupedByWeek",
      JSON.stringify(groupedWeeks)
    );
    localStorage.setItem(
      "selectedTeachers",
      JSON.stringify(teachers)
    );

    console.log("💾 Saved Successfully");

    /* =======================
       🔟 Redirect
    ======================= */
    navigate("/bookingsummary");
  } catch (err) {
    console.error("🔥 Auto Renew Error:", err);
    alert("Auto renew failed");
  } finally {
    setLoading(false);
  }
};



  return (
    <div
      className="bg-[#EEEDFE] min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: "url('/Background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#EEEDFE",
      }}
    >
      {/* HEADER */}
      <Header
        title="Renew Package"
        leftIconTwo="←"
        onLeftTwoClick={() => {
          Object.keys(localStorage).forEach((key) => {
            if (key !== "userdata" && key !== "token" && key !== "BranchId") {
              localStorage.removeItem(key);
            }
          });
          navigate("/dashboard");
        }}
      />

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-sm rounded-xl p-6 shadow-xl">

            {/* Title */}
            <h2 className="text-lg font-bold text-center mb-4 text-[#17215F]">
              Renew Your Package
            </h2>

            {/* Message */}
            <p className="text-sm text-center text-gray-600 mb-6">
              Please choose how you want to continue your subscription.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">

              {/* Auto Renew */}
              <button
                onClick={handleAutoRenew}
                className="flex-1 bg-[#1bad5a] text-white py-2 rounded-md font-semibold hover:bg-green-600 transition"
              >
                Auto Renew
              </button>

              <button
                onClick={handleChangePackage}
                className="flex-1 bg-[#49479D] text-white py-2 rounded-md font-semibold hover:bg-[#3a3782] transition"
              >
                Change Package
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoRenew;
