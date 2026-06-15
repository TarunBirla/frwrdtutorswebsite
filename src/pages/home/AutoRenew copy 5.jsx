import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../utils/header/Header";
import Sidebar from "../../utils/sidebar/Sidebar";
import http from "../../service/http";
import { toast } from "react-toastify";


const AutoRenew = () => {
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showStudentSelect, setShowStudentSelect] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  let userData = null;

  try {
    userData = JSON.parse(localStorage.getItem("userdata"));
  } catch {}

  /* ================= INIT ================= */

  useEffect(() => {
    setShowModal(true);

    if (userData?.clientid) {
      fetchClientPackage(userData.clientid);
    }
  }, []);

  /* ================= DATE ================= */

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

  /* ================= API ================= */

  const fetchClientPackage = async (id) => {
    try {
      setLoading(true);

      const res = await http.get(`/clientbookdata/${id}`);

      setClientData(res.data?.data || []);
    } catch (e) {
      console.log("❌ API Error", e);
    } finally {
      setLoading(false);
    }
  };

  /* ================= HELPERS ================= */

  const getLatestPackage = (data) => {
    if (!data?.length) return null;

    return data.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];
  };

  useEffect(() => {
    if (selectedStudent) {
      handleAutoRenew();
    }
  }, [selectedStudent]);

  /* ================= AUTO RENEW ================= */
// ================= CLEAN STUDENT NAME =================
const cleanName = (val) => {
  if (!val) return "";

  const t = String(val).trim().toLowerCase();

  if (t === "null" || t === "undefined") return "";

  return String(val).trim();
};

const redirectToChangePackage = (msg) => {
  setLoading(false); // ✅ stop loader

  toast.error(msg);

  setTimeout(() => {
    navigate("/renew-change-packages");
  }, 2000);
};


  const handleAutoRenew = async () => {
    try {
      setShowModal(false);   // ✅ CLOSE MODAL
      setLoading(true);

      console.log("🚀 AUTO RENEW STARTED");

      if (!clientData?.length) {
        redirectToChangePackage("No package found");
        return;
      }

      /* ================= PACKAGE ================= */

    /* ================= PACKAGE ================= */

// ✅ Use LET (not const)
let latest = getLatestPackage(clientData);

if (!latest) {
  redirectToChangePackage("No package");
  return;
}

// First parse
let packageForm = JSON.parse(latest.packageForm);
let bookingData = JSON.parse(latest.bookingdata);

let lessonData = packageForm.lessonData;
let packageFormData = packageForm.packageFormData;

// Read values
let studentsCount = Number(packageFormData?.students || 1);
let studyType = packageFormData?.studyType;


// ✅ Individual student case → re-pick correct package
if (studentsCount > 1 && studyType === "no" && selectedStudent) {

  const matched = clientData
    .map((row) => {
      try {
        return {
          row,
          pkg: JSON.parse(row.packageForm),
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .find(({ pkg }) => {
      const names = pkg?.lessonData?.studentName || {};

      return (
        cleanName(names.name1) === cleanName(selectedStudent.name) ||
        cleanName(names.name2) === cleanName(selectedStudent.name)
      );
    });

  if (!matched) {
    redirectToChangePackage("No package for selected student");
    return;
  }

  // ✅ Reassign allowed (because LET)
  latest = matched.row;

  // Re-parse
  packageForm = matched.pkg;
  bookingData = JSON.parse(latest.bookingdata);

  lessonData = packageForm.lessonData;
  packageFormData = packageForm.packageFormData;

  studentsCount = Number(packageFormData?.students || 1);
  studyType = packageFormData?.studyType;

  console.log("🎯 Individual Package Selected:", latest);
}

console.log("📘 Final Package:", latest);

      

      console.log("👨‍🎓 Students:", studentsCount);
      console.log("📚 Study Type:", studyType);
      

      /* ================= SIBLING MODAL ================= */

      if (
        studentsCount > 1 &&
        studyType === "no" &&
        !selectedStudent &&
        !showStudentSelect
      ) {
        const list = [];

        if (packageFormData.student1) list.push(packageFormData.student1);
        if (packageFormData.student2) list.push(packageFormData.student2);
        if (packageFormData.student3) list.push(packageFormData.student3);

        console.log("📋 Student List:", list);

        setStudentsList(list);

        setShowModal(false);
        setShowStudentSelect(true);
        setLoading(false);

        return;
      }

      /* ================= ACTIVE STUDENT ================= */

      let activeStudent = null;

      // SINGLE
      if (studentsCount === 1) {
        activeStudent = {
          name: packageFormData?.name1,
          subject: packageFormData?.subject?.[0],
          program: packageFormData?.program,
        };
      }

     // ================= 2 STUDENT INDIVIDUAL =================
else if (studentsCount > 1 && studyType === "no") {

  // Find selected student full object
  let studentObj = null;

  if (selectedStudent?.name === packageFormData?.student1?.name) {
    studentObj = packageFormData.student1;
  }

  else if (selectedStudent?.name === packageFormData?.student2?.name) {
    studentObj = packageFormData.student2;
  }

  console.log("🎯 SELECTED STUDENT OBJ:", studentObj);

  activeStudent = {
    name: studentObj?.name,
    subject: studentObj?.subject?.[0],
    program: studentObj?.program,
  };
}


      // GROUP
      else if (studentsCount > 1 && studyType === "yes") {
        activeStudent = {
          name: lessonData?.studentName?.name1,
          subject: packageFormData?.subject?.[0],
          program: packageFormData?.program,
        };
      }

      console.log("🎯 ACTIVE STUDENT:", activeStudent);

      if (!activeStudent?.subject || !activeStudent?.program) {
        redirectToChangePackage("Student data missing");
        return;
      }
const subject = activeStudent.subject;   // ✅ ADD THIS
const rawLevel = activeStudent.program;
      /* ================= OLD SLOTS ================= */

      const sortedSlots = [...bookingData.bookdata].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      console.log("🗂 Old Slots:", sortedSlots);

      // ================= GET ORIGINAL GAPS =================
let gaps = [];

for (let i = 1; i < sortedSlots.length; i++) {

  const prev = new Date(sortedSlots[i - 1].date);
  const curr = new Date(sortedSlots[i].date);

  const diff =
    Math.round((curr - prev) / (1000 * 60 * 60 * 24));

  gaps.push(diff);
}

console.log("📏 ORIGINAL GAPS:", gaps);


      if (!sortedSlots.length) {
       redirectToChangePackage("No  available slots");
        return;
      }

      /* ================= BASE DATE ================= */

      // const lastUK = toUKDateTime(
      //   sortedSlots[sortedSlots.length - 1].date
      // );

      // let baseDate = new Date(lastUK.date + "T00:00:00");
      // baseDate.setDate(baseDate.getDate() + 8);

      // console.log("📅 Base Date:", baseDate);
      // Helper: get next weekday


/* ================= BASE DATE ================= */

// Last slot (use original UTC date)
const lastSlot = sortedSlots[sortedSlots.length - 1];
const lastDateObj = new Date(lastSlot.date);

// First slot weekday directly from UTC
const firstSlot = sortedSlots[0];
const firstDateObj = new Date(firstSlot.date);

const firstDay = firstDateObj.getUTCDay(); // ✅ IMPORTANT

// Helper (UTC safe)
const getNextWeekday = (startDate, targetDay) => {
  const date = new Date(startDate);

  const currentDay = date.getUTCDay();

  let diff = (targetDay - currentDay + 7) % 7;

  if (diff === 0) diff = 7;

  date.setUTCDate(date.getUTCDate() + diff);

  return date;
};

// Base date
let baseDate = getNextWeekday(lastDateObj, firstDay);

console.log("📅 CORRECT BASE DATE:", baseDate);


      /* ================= FILTER ================= */

      const extractYear = (str = "") => {
        const m = str.match(/Year\s*(\d+)/i);
        return m ? m[1] : null;
      };

      const level = extractYear(activeStudent.program);
      const branch = localStorage.getItem("BranchId");

      console.log("🏫 Branch:", branch);
      console.log("📘 Level:", level);

      const slotRes = await http.post("/subjectFilter/", {
        subjectNames: [activeStudent.subject],
        branch_id: branch,
        yearLevels: [level],
      });

      const appointments = slotRes.data || [];

      console.log("📆 Available Slots:", appointments);

      /* ================= CHECK SLOT ================= */

      const isAvailable = (date, time) => {
        return appointments.some((a) => {
          if (!a.start) return false;

          const s = toUKDateTime(a.start);
          const e = toUKDateTime(a.finish);

          const toMin = (t) => {
            const [h, m] = t.split(":");
            return h * 60 + Number(m);
          };

          return (
            s.date === date &&
            toMin(time) >= toMin(s.time) &&
            toMin(time) < toMin(e.time)
          );
        });
      };

     let temp = new Date(baseDate);

for (let i = 0; i < sortedSlots.length; i++) {

  const slot = sortedSlots[i];
  const uk = toUKDateTime(slot.date);

  const d = temp.toISOString().split("T")[0];

  console.log("⏱ Checking Slot:", d, uk.time);

  if (!isAvailable(d, uk.time)) {
    redirectToChangePackage("Slot not available " + d);
    return;
  }

  // ✅ use real gap
  if (i < gaps.length) {
    temp.setDate(temp.getDate() + gaps[i]);
  }
}


      console.log("✅ All Slots Available");

      /* ================= CHECK TUTOR ================= */

     /* =======================
   7️⃣ Lock Tutor
======================= */

let tutorDate = new Date(baseDate);

for (let i = 0; i < sortedSlots.length; i++) {

  const slot = sortedSlots[i];
  const uk = toUKDateTime(slot.date);

  const checkDate = tutorDate.toISOString().split("T")[0];

  console.log("👨‍🏫 Tutor Check:", checkDate, uk.time);

  const tutorRes = await http.get(
    `/filter_tutor?subject=${slot.subject}&date=${checkDate}&time=${uk.time}&quallevel=${encodeURIComponent(
      rawLevel
    )}&branch_id=${branch}`
  );

  let tutors = tutorRes.data?.data || [];

  if (!Array.isArray(tutors)) tutors = [tutors];

  console.log("Available Tutors:", tutors);

  // ✅ Pick ANY available tutor
 // ✅ Match original tutor first
const expectedTutorId = slot.tutorId;

// 1️⃣ Try same tutor first
let picked = tutors.find(
  (t) => String(t.id) === String(expectedTutorId)
);

// 2️⃣ Fallback: same subject teacher
if (!picked) {
  picked = tutors.find(
    (t) =>
      t.subjects?.includes(subject) ||
      t.main_subject === subject
  );
}

// 3️⃣ If still not found → stop
if (!picked) {
  redirectToChangePackage(
    `No suitable tutor found on ${checkDate} at ${uk.time}`
  );
  
  return;
}



  slot._tutorName =
  picked.name ||
  `${picked.first_name || ""} ${picked.last_name || ""}`.trim() ||
  "TBA";

slot.tutorId = picked.id;

console.log("✅ Selected Tutor:", slot._tutorName);


  // tutorDate.setDate(tutorDate.getDate() + 7);
  if (i < gaps.length) {
  tutorDate.setDate(
    tutorDate.getDate() + gaps[i]
  );
}

}


      console.log("✅ Tutors Locked");

      /* ================= BUILD ================= */

      let buildDate = new Date(baseDate);

      let slots = [];
      let grouped = {};
      let teachers = {};

      sortedSlots.forEach((old, i) => {
        const d = new Date(buildDate);

        const dateStr = d.toISOString().split("T")[0];

        const key = `${old.subject}-${dateStr}-${old.time}`;

        const slot = {
          subject: old.subject,
          date: d.toISOString(),
          time: old.time,
          key,
          tutorId: old.tutorId,
          tutorName: old._tutorName,
          tutorPrice: old.tutorPrice,
        };

        slots.push(slot);

        const label = `${i + 1} Week`;

        if (!grouped[label]) grouped[label] = [];

        grouped[label].push({ slot, weekIndex: i });

        if (!teachers[old.subject]) teachers[old.subject] = [];

        teachers[old.subject].push({
          key,
          teacherId: old.tutorId,
          name: slot.tutorName,
          subject: old.subject,
          date: slot.date,
          time: slot.time,
          weekIndex: i,
        });

        if (i < gaps.length) {
  buildDate.setDate(
    buildDate.getDate() + gaps[i]
  );
}

      });

      console.log("📦 New Slots:", slots);

      /* ================= SAVE STUDENTS ================= */

      console.log("👨‍🎓 BEFORE SAVE:", lessonData.studentName);
/* ================= SAVE STUDENTS ================= */

console.log("👨‍🎓 BEFORE SAVE:", lessonData.studentName);

// Clean top-level names
const topName1 = cleanName(packageFormData?.name1);
const topName2 = cleanName(packageFormData?.name2);

// Clean lessonData names
const lessonName1 = cleanName(
  packageForm.lessonData?.studentName?.name1
);

const lessonName2 = cleanName(
  packageForm.lessonData?.studentName?.name2
);

// Clean student object names (individual case)
const studentObj1 = cleanName(packageFormData?.student1?.name);
const studentObj2 = cleanName(packageFormData?.student2?.name);

console.log("🧹 CLEAN VALUES:");
console.log("topName1:", topName1);
console.log("topName2:", topName2);
console.log("lessonName1:", lessonName1);
console.log("lessonName2:", lessonName2);
console.log("studentObj1:", studentObj1);
console.log("studentObj2:", studentObj2);


// ================= SINGLE =================
if (studentsCount === 1) {

  const finalSingle =
    topName1 ||
    lessonName1 ||
    topName2 ||
    lessonName2 ||
    studentObj1 ||
    studentObj2 ||
    "";

  lessonData.studentName = {
    name1: finalSingle,
    name2: "",
  };

}


// ================= GROUP STUDY =================
else if (studentsCount > 1 && studyType === "yes") {

  lessonData.studentName = {
    name1: lessonName1 || topName1,
    name2: lessonName2 || topName2,
  };

}


// ================= 2 STUDENT INDIVIDUAL =================
else if (studentsCount > 1 && studyType === "no") {

  lessonData.studentName = {
    name1: cleanName(selectedStudent?.name),
    name2: "",
  };

  console.log("👤 INDIVIDUAL STUDENT SAVED:", lessonData.studentName);
}


console.log("✅ FINAL STUDENTS SAVED:", lessonData.studentName);


      console.log("👨‍🎓 AFTER SAVE:", lessonData.studentName);

      /* ================= SAVE ================= */

      if (studentsCount === 1) {
        localStorage.setItem("studentType", "single");
      } else if (studyType === "no") {
        localStorage.setItem("studentType", "individual");
      } else {
        localStorage.setItem("studentType", "group");
      }

      localStorage.setItem("lessonData", JSON.stringify(lessonData));
      localStorage.setItem("packageFormData", JSON.stringify(packageFormData));
      localStorage.setItem("bookingdata", JSON.stringify(slots));
      localStorage.setItem("groupedByWeek", JSON.stringify(grouped));
      localStorage.setItem("selectedTeachers", JSON.stringify(teachers));

      console.log("💾 Data Saved");

      navigate("/bookingsummary");

    } catch (e) {
      console.log("🔥 ERROR", e);
      // toast.error("Auto renew failed");
      redirectToChangePackage("Auto renew failed")

    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */




  return (
    <div className="bg-[#EEEDFE] min-h-screen">
{/* GLOBAL LOADER */}
{loading && (
  <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center">
    <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)}

      <Header
        title="Renew Package"
        leftIconTwo="←"
        onLeftTwoClick={() => navigate("/dashboard")}
      />

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* MAIN MODAL */}
     {showModal && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div className="bg-white w-[90%] max-w-sm p-5 rounded-xl">

      {/* Heading */}
      <h2 className="text-lg font-bold text-center mb-2">
        Renew Package
      </h2>

      {/* Sub Text */}
      <p className="text-sm text-gray-600 text-center mb-4">
        Please choose how you would like to continue.
      </p>

      <div className="flex gap-3">

        {/* Auto Renew */}
        <div className="flex-1 text-center">
          <button
            onClick={handleAutoRenew}
            className="w-full bg-[#8F3D96] text-white py-2 text-sm rounded"
          >
            Auto Renew
          </button>

          <p className="text-[11px] text-gray-500 mt-1">
            Continue with same Package and classes
          </p>
        </div>

        {/* Change Package */}
        <div className="flex-1 text-center">
          <button
            onClick={() => navigate("/renew-change-packages")}
            className="w-full bg-[#8F3D96] text-white py-2 text-sm rounded"
          >
            Change Package
          </button>

          <p className="text-[11px] text-gray-500 mt-1">
            Select new Package or classes
          </p>
        </div>

      </div>
    </div>
  </div>
)}


      {/* STUDENT SELECT */}
      {showStudentSelect && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">

          <div className="bg-white w-[90%] max-w-sm p-6 rounded-xl">

            <h3 className="text-center mb-3 font-semibold">
              Select Student
            </h3>

            {studentsList.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedStudent(s);
                  setShowStudentSelect(false);
                  setShowModal(true);
                }}
                className="border w-full py-2 mb-2 rounded"
              >
                {s?.name} ({s?.subject?.join(", ")})
              </button>
            ))}

          </div>
        </div>
      )}

    </div>
  );
};

export default AutoRenew;
