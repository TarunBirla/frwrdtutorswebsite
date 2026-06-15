import React, { useEffect, useState } from "react";
import Header from "../utils/header/Header";
import Sidebar from "../utils/sidebar/Sidebar";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import http from "../service/http";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
const weekData = [
  {
    label: "1st Week",
    classes: [
      {
        day: "Saturday 5",
        time: "9:00",
        tutor: "Alessandra",
        subject: "English",
        image: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      {
        day: "Thursday 10",
        time: "9:00",
        tutor: "Rama",
        subject: "Math",
        image: "https://randomuser.me/api/portraits/women/2.jpg",
      },
    ],
  },
  {
    label: "2nd Week",
    classes: [
      {
        day: "Saturday 12",
        time: "9:00",
        tutor: "Alessandra",
        subject: "English",
        image: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      {
        day: "Thursday 17",
        time: "9:00",
        tutor: "Rama",
        subject: "Math",
        image: "https://randomuser.me/api/portraits/women/2.jpg",
      },
    ],
  },
  {
    label: "3rd Week",
    classes: [
      {
        day: "Saturday 19",
        time: "9:00",
        tutor: "Alessandra",
        subject: "English",
        image: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      {
        day: "Thursday 24",
        time: "9:00",
        tutor: "Rama",
        subject: "Math",
        image: "https://randomuser.me/api/portraits/women/2.jpg",
      },
    ],
  },
];

const renderSessions = (sessionFormatted) => {
  const weekKeys = Object.keys(sessionFormatted);

  console.log("session formate:-", sessionFormatted);

  return (
    <div className="bg-[#FFFFFF] flex flex-col rounded-[8px] space-y-2">
      {weekKeys.map((week, weekIndex) => (
        <div key={week}>
          <div className="flex py-3 px-4 items-center h-full  w-full">
            {/* Week label rotated vertically */}
            <div className="relative h-[91px] w-[21px] flex-shrink-0">
              <img
                src="/rectangle.png"
                alt=""
                className="h-full w-full object-contain"
              />

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-90deg]  text-white text-[11px] font-semibold whitespace-nowrap">
                {week}
              </div>
            </div>

            {/* Sessions list */}
            <div className="flex flex-col gap-2">
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
                          16,
                        )}, ${parseInt(
                          session.bgColor.slice(3, 5),
                          16,
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
                          {/* {session.name2[session.subject]} */}
                          {session.name}
                        </div>
                        <div
                          className={`text-xs  font-medium`}
                          title={session.subject}
                          style={{ color: session?.subjectColor }}
                        >
                          For {session.subject?.split(" ")[0] + "..."}
                        </div>
                      </div>
                    </div>

                    {/* <img src="/Icon-Trash.png" alt="" /> */}
                  </div>

                  {idx !== sessionFormatted[week].length - 1 && (
                    <div className="w-full h-0 border-t border-dotted border-[#B1B1B1] mt-4"></div>
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
const BookingSummary = () => {
  const navigate = useNavigate();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const handleBack = (event) => {
      event.preventDefault();

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
          // clear everything except required keys
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

          navigate("/book-class"); // redirect to book class page
        } else {
          // prevent leaving page
          window.history.pushState(null, "", window.location.pathname);
        }
      });
    };

    // push a dummy state so back can be caught
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [navigate]);

  const [studentId, setStudentId] = useState(null);
  const [error, setError] = useState(null);
  const [matchedName, setMatchedName] = useState(null);

  const bookedData = localStorage.getItem("bookedDtat");

  useEffect(() => {
    let userData = null;

    try {
      const raw = localStorage.getItem("userdata");
      userData = raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error("Error parsing userdata:", err);
      setError("Failed to parse userdata");
      return;
    }

    let lessonData = null;
    try {
      lessonData = JSON.parse(localStorage.getItem("lessonData") || "{}");
    } catch (err) {
      console.error("Error parsing lessonData:", err);
      setError("Failed to parse lessonData");
      return;
    }

    const name1 = (lessonData?.studentName?.name1 || "").trim().toLowerCase();
    const name2 = (lessonData?.studentName?.name2 || "").trim().toLowerCase();

    if (userData?.studentdetails && Array.isArray(userData.studentdetails)) {
      const matchedStudent = userData.studentdetails.find((student) => {
        const fullName = `${(student.first_name || "").trim()} ${(
          student.last_name || ""
        ).trim()}`.toLowerCase();
        console.log("Comparing:", fullName, "vs", name1, "and", name2);

        return fullName === name1 || fullName === name2;
      });

      if (matchedStudent) {
        setStudentId(matchedStudent.id);
        setMatchedName(
          `${matchedStudent.first_name} ${matchedStudent.last_name}`,
        );
        console.log("Matched student:", matchedStudent);
      } else {
        console.warn("No matching student found.");
      }
    } else {
      console.warn("No studentdetails available in userData.");
    }
  }, []);

  const handleAcceptTerms = async () => {
    if (!termsChecked) return;

    try {
      setTermsLoading(true);

      const raw = localStorage.getItem("userdata");
      const userData = raw ? JSON.parse(raw) : null;

      if (!userData?.clientid || !userData?.email) {
        Swal.fire("Error", "User data missing", "error");
        return;
      }

      // 1️⃣ Save acceptance in DB
      await http.post("/terms/accept", {
        client_id: userData.clientid,
        is_accepted: true,
      });

      // 2️⃣ Send email (Client + Admin)
      await http.post("/clientemailsend", {
        email: userData.email,
        type: "terms_accepted",
      });

      // 3️⃣ Update UI
      setTermsAccepted(true);
      setShowTermsModal(false);
      setIsChecked(true);

      Swal.fire({
        icon: "success",
        title: "Accepted",
        text: "Terms & Conditions accepted successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to accept terms or send email",
      });
    } finally {
      setTermsLoading(false);
    }
  };

  const [appointmentData, setAppointmentData] = useState([]);
  const [teacherDetails, setTeacherDetails] = useState([]);

  const fetchStudentDetail = async (studentId) => {
    try {
      const response = await http.get(`/appointments/${studentId}`);

      const data = response.data;
      console.log("data of student:-", data?.data);
      const formattedData = data.results.map((item) => ({
        topic: item.topic,
        start: item.start,
      }));

      setAppointmentData(formattedData);
      // setAppointmentData(data?.data.results[0]);

      if (data && data?.data?.results[0]?.service?.id) {
        const studentInfo = await http.get(
          `/services/${data?.data?.results[0]?.service?.id}`,
        );

        console.log("studentdata of the student:-", studentInfo.data);
        setTeacherDetails(studentInfo.data.conjobs[0]);
      }
    } catch (error) {
      console.log("error:-", error);
    }
  };

  useEffect(() => {
    fetchStudentDetail(studentId);
  }, [studentId]);

  const bookingdata = JSON.parse(localStorage.getItem("bookingdata"));
  // console.log("data:", bookingdata);

  const groupbyweek = JSON.parse(localStorage.getItem("groupedByWeek"));
  console.log("datagroupbyweek :", groupbyweek);

  // const groupedByWeek = JSON.parse(localStorage.getItem("groupedByWeek"));

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
          weekday: "short",
          month: "short",
          day: "numeric",
        });

        const { subjectColor, bgColor } = subjectStyleMap[slot.subject] || {
          subjectColor: "#434343",
          bgColor: "#D3D3D3",
        };

        let tutorName = "TBA";

        if (
          storedTeacher2 &&
          storedTeacher2[slot.subject] &&
          Array.isArray(storedTeacher2[slot.subject])
        ) {
          const matched = storedTeacher2[slot.subject].find(
            (t) =>
              t.key === slot.key ||
              (t.date === slot.date && t.time === slot.time),
          );

          if (matched?.name) {
            tutorName = matched.name;
          }
        }

        return {
          day: day || "TBD",
          time: slot.time || "TBD",
          name: tutorName, // 👈 FIXED
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

  const lessiondata = JSON.parse(localStorage.getItem("lessonData"));
  console.log("datalessiondata:", lessiondata.packageNames);
  const durationMatch =
    lessiondata.packageNames.description
      .split("<br/>")
      .find((line) => line.toLowerCase().includes("min")) || "";

  const lessonDuration = durationMatch
    .replace(/✔|\s+/g, " ") // clean up checkmark and extra spaces
    .replace(/class/i, "Class") // normalize wording
    .trim(); // remove leading/trailing space

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleConfirm = () => {};

  const uniqueTeachersMap = {};

  Object.entries(storedTeacher2).forEach(([subject, sessions]) => {
    sessions.forEach((session) => {
      const name = session.name;
      if (!uniqueTeachersMap[name]) {
        uniqueTeachersMap[name] = [];
      }

      // Use key or id to deduplicate inside each teacher's list
      const exists = uniqueTeachersMap[name].some((s) => s.key === session.key);
      if (!exists) {
        uniqueTeachersMap[name].push(session);
      }
    });
  });

  const [studentDetails, setStudentDetails] = useState([]);

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

  const lessonData = JSON.parse(localStorage.getItem("lessonData") || "{}");

  const studentIds = getMatchedStudentIds(studentDetails, lessonData);

  const [loading, setLoading] = useState(false);

  const handleService = async () => {
    try {
      setLoading(true);

      const existingTeachers =
        JSON.parse(localStorage.getItem("selectedTeachers")) || {};
      console.log("existingTeachers", existingTeachers);

      console.log("userdata:-", userData.studentdetails);

      let studentId = null;

      const lessonData = JSON.parse(localStorage.getItem("lessonData") || "{}");
      const packageFormData = JSON.parse(
        localStorage.getItem("packageFormData") || "{}",
      );

      const bookdata = JSON.parse(localStorage.getItem("bookingdata") || "{}");

      const totallessons = localStorage.getItem("totalLession") || "{}";
      const totalLessonsNum = parseInt(totallessons.replace(/\D/g, ""), 10);

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
        remaining_classess: remainingLessons,
        completed_classess: 0,
      };

      // console.log("payload:", payload);

      const contractorList = Object.values(existingTeachers)
        .flat()
        .map((t) => ({
          contractor: t.teacherId,
          subject: t.subject,
          start: t.date,
        }));

      const updatedContractorList = contractorList.flatMap((contractor) => {
        return bookdata
          .filter((b) => b.subject === contractor.subject)
          .map((b) => {
            const keyParts = b.key.split("-");
            const formattedDateTime = `${keyParts[1]}-${keyParts[2]}-${keyParts[3]}T${keyParts[4]}:00.000Z`;
            const startdate = new Date(formattedDateTime).toISOString();

            return {
              contractor: contractor.contractor,
              subject: contractor.subject,
              start: startdate,
            };
          });
      });

      console.log("contractorList:-", updatedContractorList);

      for (const [index, contractorObj] of updatedContractorList.entries()) {
        const { contractor, subject, start } = contractorObj;

        console.log("all the the data:-", contractor, subject, start);
        const rcrs = studentIds.map((id) => ({ recipient: id }));
        const rcras = studentIds.map((id) => ({
          recipient: id,
          charge_rate: "00.00",
        }));

        const startdate = new Date(start);

        const finish = new Date(startdate.getTime() + 60 * 60 * 1000); // +1 hour

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
            // start: startdate.toISOString(),
            // finish: finish.toISOString(),
            // topic: subject,
            // status: "planned",
            // service: serviceId,
            // contractor,
            client_id: userData.clientid,
            pkg_id: lessonData?.packageNames?.id,

            start: startdate.toISOString(),
            finish: finish.toISOString(),
            topic: subject,
            status: "planned",
            service: serviceId,
            // rcras: [
            //   {
            //     recipient: rcrs,
            //     charge_rate: "00.00",
            //   },
            // ],
            rcras,
            cjas: [
              {
                contractor,

                pay_rate: "00.00",
              },
            ],
          },
        ];

        console.log("📅 appointmentsAPI:", appointmentPayload);

        const res = await http.post("/appointments/", appointmentPayload);
        console.log("1response of the sappopjsn:-", res.data);
        console.log(
          `[${index}] Appointment created for contractor ${contractor}`,
        );
      }

      navigate("/payment-summary");
      // navigate("/payment-successfull");
    } catch (error) {
      console.error("Error during booking process:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-[#F4F3FF] min-h-screen font-sans overflow-x-hidden"
      style={{
        backgroundImage: "url('/Background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#EEEDFE", // ya koi fallback color
      }}
    >
      <Header
        title="Booking Summery"
        // leftIconOne="☰"
        // onLeftOneClick={() => setIsMenuOpen(true)}

        // leftIconTwo={"←"}
        leftIconTwo={localStorage.getItem("dashboard") == 1 ? "" : "←"}
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

              navigate("/book-class");
            }
          });
        }}
        // rightText="Renew"
        // onRightTextClick={() => alert("Renew clicked")}
      />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="pt-18 px-4 max-w-md mx-auto pb-4">
        {/* Package Detail */}
        <div className="mb-2">
          <h3 className="text-[18px] font-bold text-[#434343] mb-3">
            Package detail
          </h3>
          <div className="bg-[#FFFFFF] shadow rounded-xl overflow-hidden">
            {/* <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
              <span className="text-[#434343]">Student Name</span>
              <span className="text-[#49479D] text-right font-medium">
                {lessiondata.studentName}
              </span>
            </div> */}

            {lessiondata?.studentName?.name1 && (
              <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
                <span className="text-[#434343]">Student Name</span>
                <span className="text-[#49479D] text-right font-medium">
                  {lessiondata.studentName.name1}
                </span>
              </div>
            )}

            {lessiondata?.studentName?.name2 && (
              <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
                <span className="text-[#434343]">Student Name 2</span>
                <span className="text-[#49479D] text-right font-medium">
                  {lessiondata.studentName.name2}
                </span>
              </div>
            )}

            {/* {Object.entries(uniqueTeachersMap).map(
              ([teacherName, sessions]) => (
                <div key={teacherName}>
                  <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
                    <span className="text-[#434343]">Tutor</span>
                    <span className="text-[#49479D] text-right">
                      {teacherName}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
                    <span className="text-[#434343]">Lessons</span>
                    <span className="text-[#49479D] text-right">
                      {`${sessions.length} Lesson${
                        sessions.length > 1 ? "s" : ""
                      }`}{" "}
                      per week
                    </span>
                  </div>
                </div>
              )
            )} */}

            <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
              <span className="text-[#434343]">Package</span>
              <span className="text-[#49479D] text-right font-medium">
                {lessiondata.packageNames.name} (
                {lessiondata.packageNames.numberofclass}
                Classes)
              </span>
            </div>
            {/* <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
              <span className="text-[#434343]">Classes</span>
              <span className="text-[#49479D] text-right font-medium">
                
                {lessiondata.packageNames.lessons} -{" "}
                {lessiondata.packageNames.numberofclass / 3} Per Week
              </span>
            </div> */}
            <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
              <span className="text-[#434343]">Class duration</span>
              <span className="text-[#49479D] text-right font-medium">
                60 Min Classes
                {/* {lessonDuration} */}
              </span>
            </div>
            <div className="grid grid-cols-2  text-[14px] font-medium px-4 py-3">
              <span className="text-[#434343]">Total</span>
              <span className="text-right text-base text-[#434343] font-bold">
                {/* AED 30 */}
                {lessiondata.packageNames.total}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Detail */}
        <div className=" ">
          <h3 className="text-[18px] font-bold text-[#434343] mb-2">
            Booking detail
          </h3>

          <div className="">{renderSessions(sessionFormatted)}</div>
        </div>
      </div>
      <div className="flex max-w-md mx-auto items-center px-5 gap-2">
        {/* check box par click par modal open  */}
        <input
          type="checkbox"
          id="terms"
          checked={isChecked}
          onChange={(e) => {
            const checked = e.target.checked;

            setIsChecked(checked);

            if (checked && !termsAccepted) {
              setShowTermsModal(true); // open modal
            }
          }}
          className="w-4 h-4"
        />

        <label htmlFor="terms" className="text-sm text-gray-700 font-medium">
          I have read and accept Terms & Conditions
        </label>
      </div>

      <div className="px-4 py-2 mb-24 max-w-md mx-auto flex items-center justify-end">
        <button
          disabled={loading}
          onClick={() => {
            if (!isChecked) {
              Swal.fire({
                icon: "warning",
                title: "Terms Required",
                text: "Please accept the Terms & Conditions before proceeding.",
                confirmButtonColor: "#49479D",
              });
              return;
            }

            navigate("/checkout");
          }}
          className=" w-[157px] h-[51px] bg-[#49479D] flex items-center justify-center text-[#FFFFFF] rounded-[6px] text-base font-semibold shadow-md"
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            "Confirm Booking"
          )}
        </button>
      </div>

      {/* ================= TERMS MODAL ================= */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white max-w-lg w-full rounded-xl shadow-lg p-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-center mb-3 text-[#49479D]">
              TERMS & CONDITIONS
            </h2>

            <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
              <p className="font-semibold text-red-600 text-center">
                Please read and ensure that you fully understand the following
                terms and conditions before proceeding with any booking.
              </p>

              <p>
                <b>Lesson Cancellation Policy</b>
              </p>
              <p>
                All lessons scheduled during term breaks or half-term breaks can
                be rescheduled free of charge.
                <br />
                Please consider all term-time bookings as confirmed
                appointments.
                <br />
                With our Gold and Platinum packages, you are entitled to 1
                (Gold) or 3 (Platinum) complimentary reschedules. We kindly ask
                that any requests for changes are registeredat least 36 hours in
                advance. Lessons cancelled or rescheduled with less notice will
                be fully charged.
              </p>

              <p>
                <b>Lesson Reschedule Policy</b>
              </p>
              <p>
                We are happy to offer catch-up lessons for rescheduled sessions.
                These must be arranged and completed before the end of your
                current lesson block, on a mutually convenient day and time.
              </p>
              <p>
                <b>Packages Renewals</b>
              </p>
              <p>
                Please note that in-order to keep your preferred schedules,
                packages need to be renewed one week before the start of the new
                package.
              </p>

              <p>
                <b>Fixed Price Packages</b>
              </p>
              <p>
                FRWRD offers three fixed packages – Silver, Gold, and Platinum.
                All package prices are inclusive of VAT and credit card charges.
              </p>
              <p>Each package includes:</p>
              <ui>
                <li>One optional complimentary assessment</li>
                <li>Access to our online parent portal</li>
                <li>
                  Workbooks, textbooks, exam papers, learning materials, and
                  stationery
                </li>
              </ui>
              <p>
                From time to time, we may run promotions, offers, or discounts.
                Please note that these cannot be combined or transferred between
                packages.
              </p>

              <p>
                <b>Tailor-Made Packages</b>
              </p>
              <p>
                Should you require a customised learning plan, we are happy to
                discuss tailor-made packages. These are typically available for
                bookings that exceed the Gold package offering
              </p>
              <p>Examples include:</p>
              <ui>
                <li>Students requiring three or more lessons per week</li>
                <li>Full-time or part-time home schooling</li>
                <li>International visiting students</li>
                <li>Holiday tuition</li>
              </ui>
              <p>
                Please note that while we strive to accommodate your needs,
                tailor-made packages are subject to tutor availability and
                cannot always be guaranteed.
              </p>
              <p>
                <b>Assessments</b>
              </p>
              <p>Assessments may be conducted either online or face-to-face.</p>
              <p>
                Any assessment is arranged with the understanding that a package
                and package price have been discussed and are acceptable to the
                client. Following the assessment and 1:1 session with the tutor,
                and once you are satisfied, you may proceed with your chosen
                package by making payment in advance.
              </p>
              <p>
                <b>Assessment Appointments</b>
              </p>
              <p>
                We will arrange an assessment time that suits both parties,
                confirmed by phone or email.
              </p>
              <p>
                The assessment is not a full lesson; its purpose is to evaluate
                the student’s current level and agree on a set of learning goals
                with the student and/or parent.
              </p>
              <p>
                We will do our best to schedule your appointment at the earliest
                convenience, but specific times and dates cannot be guaranteed.
                Appointments will always be arranged at a mutually suitable
                time.
              </p>
              <p>
                <b>Payment Terms</b>
              </p>
              <p>
                All lessons must be booked, confirmed, and paid for in advance.
                Payment can be made by credit card.
              </p>
              <p>
                After the complimentary assessment and the first paid lesson, we
                will issue an invoice for your selected package. The package
                must be paid in full prior to continuing with lessons.
              </p>
              <p>
                <b>Satisfaction Guarantee</b>
              </p>
              <p>
                Your first paid lesson acts as a trial. If, for any reason, you
                decide not to continue, FRWRD will refund the cost of the
                remaining lessons within 7 days.
              </p>
              <p>
                <b>Variation of Fees and Services</b>
              </p>
              <p>
                Our fees and service offerings may be updated from time to time.
                However, fees will not change during an active course or
                package.
                <br />
                In the event of any change to pricing or structure, FRWRD will
                provide a minimum of two weeks’ notice to all clients.
              </p>
              <p>
                <b>Late Arrival</b>
              </p>
              <p>
                Students are encouraged to arrive 5 minutes before their lesson
                start time. If a student arrives late, the lesson will continue
                for the remainder of the scheduled time.
                <br />
                If running late, please notify us by phone or text with your
                estimated arrival time.
              </p>

              <p>
                <b>Personal Belongings</b>
              </p>
              <p>
                Students are responsible for their own belongings.
                <br />
                FRWRD cannot accept responsibility for any lost or damaged
                personal items.
              </p>
              <p>
                <b>Pre-Existing Conditions</b>
              </p>
              <p>
                For the safety and well-being of all students, please inform the
                centre of any medical or other conditions that may affect your
                child during lessons.
              </p>
              <p>
                <b>General Conduct</b>
              </p>
              <p>
                Students must always follow the rules and regulations of FRWRD
                Tuition Centre.
                <br />
                Parents and guardians are expected to support the learning
                process by encouraging their children and respecting our staff.
                <br />
                Any damage caused to the centre’s property by a student will be
                the responsibility of the parent or guardian, including the full
                cost of repairs.
                <br />
                Students must attend all lessons punctually and follow the
                agreed timetable.
                <br />
                When entering or leaving the premises, students should do so
                quietly and respectfully to avoid disturbing others.
                <br />
                All workbooks, exercise books, and materials provided by the
                centre must be kept neat and in good condition.
              </p>
              <p>
                <b>Amendments</b>
              </p>
              <p>
                FRWRD Tuition Centre reserves the right to amend these rules,
                regulations, and policies as required. Clients will be notified
                in advance of any significant changes.
              </p>

              <p className="italic text-xs text-gray-500">
                Full terms apply as per FRWRD Tuition Centre policy.
              </p>
            </div>

            {/* Checkbox */}
            <div className="flex items-center mt-4 gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
                className="w-4 h-4"
              />

              <label
                htmlFor="terms"
                className="text-sm text-gray-700 font-medium"
              >
                I have read and accept Terms & Conditions
              </label>
            </div>

            {/* Button */}
            <button
              disabled={!termsChecked || termsLoading}
              onClick={handleAcceptTerms}
              className={`w-full mt-4 h-[45px] rounded-lg font-semibold text-white
        ${termsChecked ? "bg-[#49479D]" : "bg-gray-400 cursor-not-allowed"}`}
            >
              {termsLoading ? "Processing..." : "Accept & Continue"}
            </button>
          </div>
        </div>
      )}
      {/* ================= END MODAL ================= */}
    </div>
  );
};

export default BookingSummary;
