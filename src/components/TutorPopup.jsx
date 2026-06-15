import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const tutors = [
  {
    name: "Alessandra",
    subjects: ["English", "Physics"],
    review: "1 review",
    rating: 5,
    description: "I will prove that learning a new language is fun",
    fullDetails: [
      "10 years’ teaching experience",
      "Qualifications: Post Graduate Certificate in Education (PGCE) – University of Manchester, Mathematics Teaching Enhancement Course – Manchester Metropolitan University",
      "Speciality: Maths Specialist (Key stage 3, GCSE & A-Level, IB)",
      "Pearson GCSE Exam Marker",
      "Former Maths Literacy Coordinator at West Hill School",
    ],
    image: "/tutorlady.jpg",
  },
  {
    name: "Rama",
    subjects: ["English", "Physics"],
    review: "1 review",
    rating: 5,
    description: "I will prove that learning a new language is fun",
    fullDetails: [],
    image: "/tutor4.png",
  },
  {
    name: "Rama",
    subjects: ["English", "Math"],
    review: "1 review",
    rating: 5,
    description: "I will prove that learning a new language is fun",
    fullDetails: [],
    image: "/tutor6.png",
  },
  {
    name: "Rama",
    subjects: ["English", "Math"],
    review: "1 review",
    rating: 5,
    description: "I will prove that learning a new language is fun",
    fullDetails: [],
    image: "/tutor6.png",
  },
  {
    name: "Rama",
    subjects: ["English", "Math"],
    review: "1 review",
    rating: 5,
    description: "I will prove that learning a new language is fun",
    fullDetails: [],
    image: "/tutor6.png",
  },
];

const TutorPopup = ({ isOpen, onClose }) => {
  const [openDetailIndex, setOpenDetailIndex] = useState(null);

  if (!isOpen) return null;

  const toggleDetail = (index) => {
    setOpenDetailIndex(openDetailIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/50 bg-opacity-40 flex justify-center items-start pt-20 px-4">
      <div className="bg-[#EEEDFE]  w-full max-w-md rounded-xl shadow-xl px-2 max-h-[85vh] overflow-y-auto relative">
        <div className="flex justify-end top-0">
          <button
            className="text-xl text-[#3C3C3C] font-bold"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="mb-4">
          <h2 className="text-[18px] text-[#434343] font-bold">
            Available Tutors
          </h2>
        </div>

        {tutors.map((tutor, index) => (
          <div
            key={index}
            className=" bg-[#FFFFFF] border-[#C2C2C2] rounded-lg p-2 mb-4 shadow"
          >
            <div className="flex items-start gap-2">
              <img
                src={tutor.image}
                alt={tutor.name}
                className="w-[73px] h-[73px] rounded-[4px] object-cover"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="flex flex-col gap-1 flex-wrap ">
                    <h3 className="font-bold text-[14px] text-[#17215F]">
                      {tutor.name}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {tutor.subjects.map((sub, i) => (
                        <span
                          key={i}
                          className="bg-[#F2F2F2] text-xs text-[#6F6F6F] font-semibold px-4 py-0.5 rounded-full"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-[#434343] font-medium mb-2">
                      {tutor.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end text-xs w-[60px]">
                    <span className="text-[#17215F] font-bold text-[15px] flex items-center gap-1">
                      <img src="/star.png" alt="" />
                      {tutor.rating}
                    </span>
                    <span className="text-[#17215F] font-medium text-xs">
                      {tutor.review}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* View Detail Toggle Button */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => toggleDetail(index)}
                className={`w-[103px]  flex items-center justify-center gap-2 ${
                  openDetailIndex === index ? "" : "border border-[#C2C2C2]"
                } text-[#434343] rounded-[6px] py-1.5 text-xs`}
              >
                View Detail
                <span>
                  {openDetailIndex === index ? (
                    <ExpandMoreIcon fontSize="small" />
                  ) : (
                    // <ExpandLessIcon fontSize="small" />
                    ""
                  )}
                </span>
              </button>
              <button className=" w-[103px] bg-[#65C68F] text-[#FFFFFF] rounded-[6px] py-1.5 text-xs">
                Select Tutor
              </button>
            </div>
            {/* Expanded Details */}
            {openDetailIndex === index && tutor.fullDetails.length > 0 && (
              <div className="my-3 font-normal text-xs text-[#434343] space-y-2">
                {tutor.fullDetails.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorPopup;
