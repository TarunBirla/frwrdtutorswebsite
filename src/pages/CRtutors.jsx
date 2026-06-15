import React, { useEffect, useState } from "react";
import Header from "../utils/header/Header";
import Sidebar from "../utils/sidebar/Sidebar";
import CustomNotification from "../utils/CustomNotification";
import http from "../service/http";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link } from "react-router-dom";
import Select from "react-select";

const Packages = () => {
  const [crTutors, setCRtutors] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [show, setShow] = useState(false);
        const branchid = localStorage.getItem("BranchId");


  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState("");
const [selectedLevel, setSelectedLevel] = useState("");
const [selectedSubject, setSelectedSubject] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const tutorsPerPage = 10;


  const toggleDetail = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };
const topTutors = [
  "Simon Mackenzie",
  "Ellie Thomas",
  "Rachel Murdoch",
  "Gizem Aksu",
  "Rebecca Murrall",
];
const levelOptions = [
  "Year 1 / Grade 0",
  "Year 2 / Grade 1",
  "Year 3 / Grade 2",
  "Year 4 / Grade 3",
  "Year 5 / Grade 4",
  "Year 6 / Grade 5",
  "Year 7 / Grade 6",
  "Year 8 / Grade 7",
  "Year 9 / Grade 8",
  "Year 10 / Grade 9",
  "Year 11 / Grade 10",
  "Year 12 / Grade 11",
  "Year 13 / Grade 12",
];


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await http.get(`/contractorsalldata?branch_id=${branchid}`);
        console.log("setCRtutors:", response.data);
        const data = response.data;

        setCRtutors(data);
      } catch (err) {
        console.error("Error fetching setCRtutors data:", err);
      }
    };

    fetchData();
  }, []);

  const sortedTutors = [...crTutors].sort((a, b) => {
  const nameA = `${a.first_name} ${a.last_name}`;
  const nameB = `${b.first_name} ${b.last_name}`;

  const indexA = topTutors.indexOf(nameA);
  const indexB = topTutors.indexOf(nameB);

  if (indexA !== -1 && indexB !== -1) return indexA - indexB;
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
  return 0;
});
const tutorOptions = crTutors.map(
  (t) => `${t.first_name} ${t.last_name}`
);

const subjectOptions = Array.from(
  new Set(
    crTutors.flatMap((t) =>
      JSON.parse(t.subject || "[]").map((s) => s.name)
    )
  )
);

const filteredTutors = sortedTutors.filter((tutor) => {
  const fullName = `${tutor.first_name} ${tutor.last_name}`;

  const tutorLevels = tutor.quallevel
    ? tutor.quallevel.split(",").map((l) => l.trim())
    : [];

  const subjects = JSON.parse(tutor.subject || "[]").map(
    (s) => s.name
  );

  return (
    (!selectedTutor || fullName === selectedTutor) &&
    (!selectedLevel || tutorLevels.includes(selectedLevel)) &&
    (!selectedSubject || subjects.includes(selectedSubject))
  );
});


const indexOfLastTutor = currentPage * tutorsPerPage;
const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;

const currentTutors = filteredTutors.slice(
  indexOfFirstTutor,
  indexOfLastTutor
);

const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);
useEffect(() => {
  setCurrentPage(1);
}, [selectedTutor, selectedLevel, selectedSubject]);


  return (
    

    <div className="bg-[#EEEDFE] min-h-screen overflow-x-hidden"
 
    >
      <Header
        title="Available Tutors"
        leftIconOne="☰"
        onLeftOneClick={() => setIsMenuOpen(true)}
        leftIconTwo="←"
        onLeftTwoClick={() => window.history.back()}
        // notification="/notification.png"
        // onRightOneClick={() => alert("Notifications")}
        rightText=""
        // onRightTextClick={() => (window.location.href = "/book-class")}
      />

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {/* Notification */}
      {show && (
        <div className="fixed w-full p-4 top-14 left-1/2 transform -translate-x-1/2 z-50">
          <CustomNotification
            message="You cannot select more than 2 lessons per week with this package. A maximum of 2 lessons is allowed in total per week — 1 lesson per subject."
            onClose={() => setShow(false)}
          />
        </div>
      )}
      <div className="pt-20 max-w-md mx-auto px-4 pb-10"
      >
        <div className="bg-white p-4 rounded-xl mb-4 shadow space-y-3">

  {/* Tutor Name */}
  <Select
  options={tutorOptions.map(t => ({ label: t, value: t }))}
  value={
    selectedTutor
      ? { label: selectedTutor, value: selectedTutor }
      : null
  }
  onChange={(opt) => setSelectedTutor(opt?.value || "")}
  placeholder="All Tutors"
  isClearable
  styles={{
    control: (base) => ({
      ...base,
      minHeight: 40,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: 300, // ✅ dropdown height
    }),
  }}
/>


{/* Level */}

<Select
  options={levelOptions.map((lvl) => ({
    label: lvl,
    value: lvl,
  }))}
  value={
    selectedLevel
      ? { label: selectedLevel, value: selectedLevel }
      : null
  }
  onChange={(opt) => setSelectedLevel(opt?.value || "")}
  placeholder="All Levels"
  isClearable
  styles={{
    control: (base) => ({
      ...base,
      width: "100%",
      minHeight: 40,
      borderRadius: 6,
      fontSize: 14,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: 300, // ✅ dropdown height
    }),
  }}
/>


  {/* Subject */}
<Select
  options={subjectOptions.map((sub) => ({
    label: sub,
    value: sub,
  }))}
  value={
    selectedSubject
      ? { label: selectedSubject, value: selectedSubject }
      : null
  }
  onChange={(opt) => setSelectedSubject(opt?.value || "")}
  placeholder="All Subjects"
  isClearable
  styles={{
    control: (base) => ({
      ...base,
      width: "100%",
      minHeight: 40,
      borderRadius: 6,
      fontSize: 14,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: 300, // ✅ dropdown height
    }),
  }}
/>


</div>

        <h2 className="text-[18px] font-bold text-[#17215F] mb-2">Available Tutors</h2>
        <div className="">
          {currentTutors?.length > 0 ? (
            currentTutors.map((tutor, index) => {
              const rawSubjects = JSON.parse(tutor.subject || "[]");

              const uniqueSubjects = Array.from(
                new Map(rawSubjects.map((subj) => [subj.name, subj])).values()
              );

              const isExpanded = expandedIndex === index;

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 mb-4 shadow"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={tutor.photo || "/tutor2.png"}
                      alt={tutor.first_name}
                      className="w-[73px] h-[73px] rounded-[4px] object-cover"
                    />

                    <div className="flex-1">
                      {/* Name and Details */}
                      <div className="flex justify-between mb-2">
                        <div className="flex flex-col gap-1 flex-wrap">
                          <h3 className="font-bold text-[14px] text-[#17215F]">
                            {`${tutor?.first_name ?? ""} ${
                              tutor?.last_name ?? ""
                            }`.trim()}
                          </h3>

                          {/* Subjects */}
                          <div className="flex gap-2 flex-wrap">
                            {uniqueSubjects.map((subject, idx) => (
                              <span
                                key={idx}
                                className="bg-[#F2F2F2] text-xs text-[#6F6F6F] font-semibold px-4 py-0.5 rounded-full"
                              >
                                {subject.name}
                              </span>
                            ))}
                          </div>

                          {/* Optional description */}
                          <p className="text-xs text-[#434343] font-medium mb-2">
                            I will prove that learning a new subject is fun.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <button
                      onClick={() => toggleDetail(index)}
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
                    {/* <Link to="/rescheduling">
                    <button
                   className=" w-[103px] bg-[#17215F] text-[#FFFFFF] rounded-[6px] py-1.5 text-xs"
                          >
                            Reschedule
                          </button>
                          </Link> */}
                  </div>

                  {isExpanded && (
                    <div className="mt-2 text-xs text-[#333] space-y-2">
                      {tutor.quallevel && (
                        <p>
                          <strong>Levels:</strong> {tutor.quallevel}
                        </p>
                      )}
                      {(tutor.town || tutor.country) && (
                        <p>
                          <strong>Location:</strong> {tutor.town},{" "}
                          {tutor.country}
                        </p>
                      )}
                      {tutor.qualifications && (
                        <p>
                          <strong>Qualifications:</strong>{" "}
                          {tutor.qualifications}
                        </p>
                      )}
                      {tutor.speciality && (
                        <p>
                          <strong>Speciality:</strong> {tutor.speciality}
                        </p>
                      )}
                      {tutor.bio && (
                        <p>
                          <strong>Bio:</strong> {tutor.bio}
                        </p>
                      )}
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
        {totalPages > 1 && (
  <div className="flex justify-center items-center gap-2 mt-6">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      className={`px-3 py-1 rounded border text-sm ${
        currentPage === 1
          ? "opacity-50 cursor-not-allowed"
          : "bg-white"
      }`}
    >
      Prev
    </button>

    {Array.from({ length: totalPages }).map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-3 py-1 rounded text-sm ${
          currentPage === i + 1
            ? "bg-[#17215F] text-white"
            : "bg-white border"
        }`}
      >
        {i + 1}
      </button>
    ))}

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      className={`px-3 py-1 rounded border text-sm ${
        currentPage === totalPages
          ? "opacity-50 cursor-not-allowed"
          : "bg-white"
      }`}
    >
      Next
    </button>
  </div>
)}

      </div>
    </div>
    

  );
};

export default Packages;
