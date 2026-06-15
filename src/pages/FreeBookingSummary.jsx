import React, { useEffect, useState } from "react";
import Header from "../utils/header/Header";
import Sidebar from "../utils/sidebar/Sidebar";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import http from "../service/http";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";

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
                          className={`text-xs  font-medium`}
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
const renderSessions2 = (sessionFormatted) => {
  const weekKeys = Object.keys(sessionFormatted);

  console.log("session formate:-", sessionFormatted);

  return (
    <div>
      <h3 className="text-[18px] font-bold text-[#434343] mb-2">
        Pre Booking Data
      </h3>
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
                            16
                          )}, ${parseInt(
                            session.bgColor.slice(3, 5),
                            16
                          )}, ${parseInt(
                            session.bgColor.slice(5, 7),
                            16
                          )}, 0.1)`,
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
                            className={`text-xs  font-medium`}
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
    </div>
  );
};
const FreeBookingSummary = () => {
  const navigate = useNavigate();

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
              key !== "totalLession"
            ) {
              localStorage.removeItem(key);
            }
          });

          navigate("/free-book"); // redirect to book class page
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

  let userData = null;

  try {
    const raw = localStorage.getItem("userdata");
    userData = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing userdata:", error);
  }
  const freebook = localStorage.getItem("freebook");
  const [pendingPayment, setPendingPayment] = useState(null);

  useEffect(() => {
    const fetchPendingPayment = async () => {
      try {
        const response = await http.get(
          `/client-packagesfree/${userData.clientid}`
        );
        if (response.data?.data[0]) {
          console.log(
            `PackageForm:`,
            JSON.parse(response.data.data[0].packageForm)
          );
          const packageForm = JSON.parse(response.data.data[0].packageForm);

          const groupedByWeek = packageForm.groupedByWeek;

          localStorage.setItem("groupedByWeek2", JSON.stringify(groupedByWeek));
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    if (userData?.clientid) {
      fetchPendingPayment();
    }
  }, []);

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
          `${matchedStudent.first_name} ${matchedStudent.last_name}`
        );
        console.log("Matched student:", matchedStudent);
      } else {
        console.warn("No matching student found.");
      }
    } else {
      console.warn("No studentdetails available in userData.");
    }
  }, []);

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
          `/services/${data?.data?.results[0]?.service?.id}`
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

  const groupedByWeek2 = JSON.parse(localStorage.getItem("groupedByWeek2"));

  const transformGroupByWeek2 = (groupedByWeek) => {
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

  // const sessionFormatted2 = transformGroupByWeek2(groupedByWeek2);
  const sessionFormatted2 = groupedByWeek2
    ? transformGroupByWeek2(groupedByWeek2)
    : null;

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

      const programMap = {
        "Key Stage 1": "Primary",
        "Key Stage 2": "Secondary",
        "Key Stage 3": "Senior",
      };

      for (const [index, contractorObj] of updatedContractorList.entries()) {
        const { contractor, subject, start } = contractorObj;

        const programName =
          programMap[packageFormData.program] || packageFormData.program;

        console.log("all the the data:-", contractor, subject, start);
        const rcrs = studentIds.map((id) => ({ recipient: id }));
        const rcras = studentIds.map((id) => ({
          recipient: id,
          charge_rate: "00.00",
        }));

        const startdate = new Date(start);

        const finish = new Date(startdate.getTime() + 60 * 60 * 1000); // +1 hour

        const serviceData = {
          name: `${programName}-${username}-${subject}-${index + 1}`,
          dft_charge_type: "hourly",
          dft_charge_rate: "00",
          dft_contractor_rate: "00",
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
            pricestatus: 1,
            start: startdate.toISOString(),
            finish: finish.toISOString(),
            topic: `${programName}-${username}-${subject}-${index + 1}`,
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
          `[${index}] Appointment created for contractor ${contractor}`
        );
      }
      localStorage.setItem("freebook", 0);
      navigate("/payment-summary");
      // navigate("/payment-successfull");
    } catch (error) {
      console.error("Error during booking process:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F4F3FF] min-h-screen font-sans overflow-x-hidden"
    style={{
    backgroundImage: "url('/Background.png')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#EEEDFE", // ya koi fallback color
  }}>
      <Header
        title="Booking Summery"
        // leftIconOne="☰"
        // onLeftOneClick={() => setIsMenuOpen(true)}

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
                  key !== "freebook"
                ) {
                  localStorage.removeItem(key);
                }
              });

              localStorage.setItem("freebook", 0);
              navigate("/free-book");
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
                {lessiondata.packageNames.lessons.replace(/\D/g, "")} Classes)
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
                {/* 45 Min Classes */}
                {lessonDuration}
              </span>
            </div>
            <div className="grid grid-cols-2  text-[14px] font-medium px-4 py-3">
              <span className="text-[#434343]">Total</span>
              <span className="text-right text-base text-[#434343] font-bold">
                {/* AED 30 */}
                {/* {lessiondata.packageNames.price} */}0
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

          {sessionFormatted2 ? (
            <div className="mt-4">{renderSessions2(sessionFormatted2)}</div>
          ) : (
            ""
          )}
        </div>
      </div>

      <div className="px-4 py-2 mb-24 max-w-md mx-auto flex items-center justify-end">
        <button
          disabled={loading}
          onClick={() => {
            handleService();
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
    </div>
  );
};

export default FreeBookingSummary;
