import React, { useEffect, useState } from "react";

import { CalendarDays, CheckCircle } from "lucide-react";
import Header from "../utils/header/Header";
import Sidebar from "../utils/sidebar/Sidebar";

const classes = [
  {
    date: "Saturday 5",
    time: "9:00",
    name: "Alessandra",
    subject: "For English",
    avatar: "/avatar1.png",
  },
  {
    date: "Thursday 10",
    time: "9:00",
    name: "Rama",
    subject: "For Math",
    avatar: "/avatar2.png",
  },
  {
    date: "Saturday 12",
    time: "9:00",
    name: "Alessandra",
    subject: "For English",
    avatar: "/avatar1.png",
  },
  {
    date: "Thursday 17",
    time: "9:00",
    name: "Rama",
    subject: "For Math",
    avatar: "/avatar2.png",
  },
  {
    date: "Saturday 19",
    time: "9:00",
    name: "Alessandra",
    subject: "For English",
    avatar: "/avatar1.png",
  },
  {
    date: "Thursday 24",
    time: "9:00",
    name: "Rama",
    subject: "For Math",
    avatar: "/avatar2.png",
  },
];

import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

// const renderSessions = () => {
//   const sessions = {
//     "1st Week": [
//       {
//         day: "Saturday 5",
//         time: "9:00",
//         name: "Alessandra",
//         subject: "English",
//         avatar: "/tutor2.png",
//         subjectColor: "#49479D",
//         bgColor: "#49479D",
//       },
//       {
//         day: "Thursday 10",
//         time: "9:00",
//         name: "Rama",
//         subject: "Math",
//         avatar: "/tutor3.png",
//         subjectColor: "#8F3D96",
//         bgColor: "#8F3D96",
//       },
//     ],
//     "2st Week": [
//       {
//         day: "Saturday 5",
//         time: "9:00",
//         name: "Alessandra",
//         subject: "English",
//         avatar: "/tutor2.png",
//         subjectColor: "#49479D",
//         bgColor: "#49479D",
//       },
//       {
//         day: "Thursday 10",
//         time: "9:00",
//         name: "Rama",
//         subject: "Math",
//         avatar: "/tutor3.png",
//         subjectColor: "#8F3D96",
//         bgColor: "#8F3D96",
//       },
//     ],
//   };

//   const packageData = JSON.parse(localStorage.getItem("packageFormData"));
//   console.log(packageData);

//   return (
//     <div className="space-y-2">
//       {Object.keys(sessions).map((week) => (
//         <div className="flex flex-col bg-white rounded-[8px]" key={week}>
//           {sessions[week].map((session, idx) => (
//             <div key={idx}>
//               <div className="flex justify-between items-center px-4 py-3">
//                 {/* Left: icons and user card */}
//                 <div className="flex items-center gap-4">
//                   {/* Date + time */}
//                   <div className="flex flex-col gap-[2px] text-[13px] font-bold text-[#17215F]">
//                     <div className="flex items-center gap-1">
//                       <img src="/cal2.png" alt="" className="w-4 h-4" />
//                       {session.day}
//                     </div>
//                     <div className="flex items-center gap-1 text-[#17215F]">
//                       <img src="/alarm-clock.png" alt="" className="w-4 h-4" />
//                       {session.time}
//                     </div>
//                   </div>

//                   {/* Tutor card */}
//                   <div
//                     className="w-[154px] flex items-center gap-3 px-3 py-1 rounded-md"
//                     style={{
//                       backgroundColor: `rgba(${parseInt(
//                         session.bgColor.slice(1, 3),
//                         16
//                       )}, ${parseInt(
//                         session.bgColor.slice(3, 5),
//                         16
//                       )}, ${parseInt(session.bgColor.slice(5, 7), 16)}, 0.1)`,
//                     }}
//                   >
//                     <img
//                       src={session.avatar}
//                       className="w-6 h-6 rounded-full"
//                       alt={session.name}
//                     />
//                     <div className="leading-tight">
//                       <div className="text-[14px] font-bold text-[#17215F]">
//                         {session.name}
//                       </div>
//                       <div
//                         className="text-xs font-medium"
//                         style={{ color: session.subjectColor }}
//                       >
//                         For {session.subject}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right: check icon */}
//                 <Check className="h-6 w-6 text-[#65C68F]" strokeWidth={2.5} />
//               </div>

//               {/* Divider after first item */}
//               {idx !== sessions[week].length - 1 && (
//                 <div className="border-t border-dotted border-[#B1B1B1] mx-4" />
//               )}
//             </div>
//           ))}
//         </div>
//       ))}

//       {packageData.studyType &&
//         packageData.students == "2" &&
//         packageData.studyType == "no" &&
//         packageData.student1.name &&
//         packageData.student2.name && (
//           <button
//             onClick={() => {
//               localStorage.removeItem("groupedByWeek");
//               localStorage.removeItem("selectedTeachers");
//               localStorage.removeItem("selectedTeacher");
//               localStorage.removeItem("bookingdata");
//               window.location.href = "/book-class";
//             }}
//             className="mt-10 w-[306px] shadow bg-[#65C68F] hover:bg-green-600 text-[#FFFFFF] font-medium text-[18px] mx-4 px-6 py-3 rounded-[6px]"
//           >
//             Back For Second Student
//           </button>
//         )}
//     </div>
//   );
// };

const renderSessions = (sessionFormatted) => {
  const weekKeys = Object.keys(sessionFormatted);

  return (
    <div className="bg-[#FFFFFF] flex flex-col  rounded-[8px] space-y-2">
      {weekKeys.map((week, weekIndex) => (
        <div key={week}>
          <div className="flex  py-4 px-4 items-center h-full  w-full">
            {/* Week label rotated vertically */}
            {/* <div className="relative h-[120px] w-[30px] flex-shrink-0">
             
              <img
                src="/rectangle.png"
                alt=""
                className="h-full w-full object-contain"
              />

            
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-90deg] text-white text-[11px] font-semibold whitespace-nowrap">
                {week}
              </div>
            </div> */}

            {/* Sessions list */}
            <div className="flex flex-col gap-3">
              {sessionFormatted[week].map((session, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-1 ml-2 justify-between">
                    {/* Left - date and time */}
                    <div className="flex flex-col text-xs gap-[2px] w-45 text-[13px] font-bold text-[#17215F]">
                      <div className="flex items-center gap-1">
                        <img src="/cal2.png" alt="" />
                        {session.day}
                      </div>
                      <div className="flex text-xs items-center gap-1 text-[#17215F] font-bold">
                        <img src="/alarm-clock.png" alt="" />
                        {session.time}
                      </div>
                    </div>
                    {/* Right - user card */}
                    <div
                      className="flex items-center px-1 gap-2 w-full py-1 rounded-md"
                      style={{
                        backgroundColor: `rgba(${parseInt(
                          session.bgColor.slice(1, 3),
                          16
                        )}, ${parseInt(
                          session.bgColor.slice(3, 5),
                          16
                        )}, ${parseInt(session.bgColor.slice(5, 7), 16)}, 0.1)`,
                      }}
                    >
                      <img
                        src={session.avatar}
                        className="w-[30px] h-[30px] rounded-full"
                        alt={session.name}
                      />
                      <div className="flex flex-col leading-tight">
                        <div className="text-xs lg:text-[14px] font-bold text-[#17215F]">
                          {session.name2[session.subject]}
                        </div>
                        <div
                          className={`text-xs font-medium`}
                          style={{ color: session.subjectColor }}
                        >
                          For {session.subject?.split(" ")[0] + "..."}
                        </div>
                      </div>
                    </div>
                    {/* <img src="/Icon-Trash.png" alt="" /> */}

                    <Check
                      className="h-8 w-8 text-[#65C68F]"
                      strokeWidth={2.5}
                    />
                  </div>

                  {idx !== sessionFormatted[week].length - 1 && (
                    <div className="w-[250px] h-0 border-t border-dotted border-[#B1B1B1] mt-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Separator after entire week group, except last */}
          {weekIndex !== weekKeys.length - 1 && (
            <div className="w-full border-t border-dotted border-[#B1B1B1] my-2"></div>
          )}
        </div>
      ))}
    </div>
  );
};
const PaymentSummaryPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBack = (event) => {
      event.preventDefault();

      Object.keys(localStorage).forEach((key) => {
        if (key !== "userdata" && key !== "token" && key !== "BranchId") {
          localStorage.removeItem(key);
        }
      });

      navigate("/dashboard"); // redirect to book class page
    };

    // push a dummy state so back can be caught
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [navigate]);

  const groupedByWeek = JSON.parse(localStorage.getItem("groupedByWeek"));
  const storedTeacher = JSON.parse(localStorage.getItem("selectedTeacher"));
  const storedTeacher2 = JSON.parse(localStorage.getItem("selectedTeachers"));

  const subjectStyles = [
    {
      subjectColor: "#434343",
      bgColor: "#49479D",
    },
    {
      subjectColor: "#8F3D96",
      bgColor: "#8F3D96",
    },
  ];
  const getSubjectStyleMap = (groupedByWeek) => {
    const subjectMap = {};
    let styleIndex = 0;

    // Loop through all subjects and assign a style from subjectStyles
    Object.values(groupedByWeek)
      .flat()
      .forEach(({ slot }) => {
        const subject = slot.subject;
        if (!subjectMap.hasOwnProperty(subject)) {
          subjectMap[subject] =
            subjectStyles[styleIndex % subjectStyles.length];
          styleIndex++;
        }
      });

    return subjectMap;
  };
  const transformGroupByWeek = (groupedByWeek) => {
    const result = {};
    const subjectStyleMap = getSubjectStyleMap(groupedByWeek);

    Object.entries(groupedByWeek).forEach(([weekLabel, slots]) => {
      result[weekLabel] = slots.map(({ slot }) => {
        const day = new Date(slot.date).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
        });

        const { subjectColor, bgColor } = subjectStyleMap[slot.subject] || {
          subjectColor: "#434343",
          bgColor: "#D3D3D3",
        };

        const name2 = {};
        Object.entries(storedTeacher2).forEach(([subject, teachers]) => {
          name2[subject] = teachers?.[0]?.name || "TBA";
        });

        return {
          day: day || "TBD",
          time: slot.time || "TBD",
          name: storedTeacher?.name || "TBA",
          name2,
          subject: slot.subject || "Unknown",
          avatar: "/tutor2.png",
          subjectColor,
          bgColor,
        };
      });
    });

    return result;
  };

  const sessionFormatted = transformGroupByWeek(groupedByWeek);
  console.log("✅ Final Session Data:", sessionFormatted);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen pt-14 bg-[#EEEDFE]"
    style={{
    backgroundImage: "url('/Background.png')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#EEEDFE", // ya koi fallback color
  }}>
      <Header
        title="Summery"
        // leftIconOne="☰"
        // onLeftOneClick={() =>}
        leftIconTwo="←"
        onLeftTwoClick={() => {
          Object.keys(localStorage).forEach((key) => {
            if (key !== "userdata" && key !== "token" && key !== "BranchId") {
              localStorage.removeItem(key);
            }
          });

          navigate("/dashboard");
        }}
        // rightText="Renew"
        // onRightTextClick={() => alert("Renew clicked")}
      />

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="max-w-md mx-auto p-4">
        {/* Payment success card */}
        <div className="bg-gradient-to-r from-[#312A91] to-[#8D30B2] text-[#FFFFFF] rounded-xl p-4 mb-2 text-center">
          <div className="flex justify-center mb-1">
            <img src="/checkmark.png" alt="" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <h2 className="text-[20px] text-[#FFFFFF] font-normal">
              Thank you for your payment
            </h2>
            <p className="text-xs text-center font-normal w-[234.08203125px]">
              Congratulations! You have successfully purchased a package, and
              your classes have been scheduled for the next two weeks.
            </p>
          </div>
        </div>

        {/* Blocked Classes */}
        <h3 className="font-bold text-[18px] text-[#17215F] mb-2">
          Blocked Classes
        </h3>
        <div className="">{renderSessions(sessionFormatted)}</div>
      </div>
    </div>
  );
};
export default PaymentSummaryPage;
