import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../utils/header/Header";
import Sidebar from "../utils/sidebar/Sidebar";
import http from "../service/http"; // your axios or fetch wrapper
import Swal from "sweetalert2";
import Confetti from "react-confetti";
import { CircularProgress } from "@mui/material";
import { Check } from "lucide-react"; // Optional: or use an SVG image

const SuccessPage = () => {
  const location = useLocation();
  const hasRun = useRef(false);
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openPopup, setOpenPopup] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState("");
  const [studentDetails, setStudentDetails] = useState([]);
  const branchid = localStorage.getItem("BranchId");

  // useEffect(() => {
  //     const timer = setTimeout(() => {
  //       navigate("/manage-booking");
  //     }, 30000);

  //     return () => clearTimeout(timer);
  //   }, [navigate]);

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
    username = `${firstName}`;
  } else {
    console.warn("userData not found in localStorage");
  }

  console.log("username:", userData);

  const existingTeachers =
    JSON.parse(localStorage.getItem("selectedTeachers")) || {};

  const lessonData = JSON.parse(localStorage.getItem("lessonData") || "{}");

  console.log("existingTeachers", existingTeachers, lessonData);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");

    if (!ref) {
      Swal.fire({
        icon: "error",
        title: "Payment reference missing",
        text: "Cannot verify payment.",
      });
      setLoading(false);
      return;
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const startProcess = async () => {
      try {
        setLoading(true);
        const students = await fetchStudents();
        if (!students || students.length === 0) {
          throw new Error("No students found, cannot continue");
        }
        await sleep(3000);
        // 2️⃣ Payment select aur services banani hain
        await handlePaymentSelect("success", students);
        await sleep(8000);

        // 3️⃣ Order status update karo
        const response = await http.post("/order_status", {
          ref,
          status: "success",
        });
        await sleep(2000);

        //   console.log("Order status response:", response.data);
        //    Object.keys(localStorage).forEach((key) => {
        //   if (key !== "userdata" && key !== "token") {
        //     localStorage.removeItem(key);
        //   }
        // });

        Swal.fire({
          icon: "success",
          title: "Payment Successful",
          text: `Payment ${ref} verified.`,
        });
      } catch (error) {
        console.error("Error in payment flow:", error);
        // Swal.fire({
        //   icon: "error",
        //   title: "Payment Failed",
        //   text: error.message,
        // });
      } finally {
        setLoading(false);
      }
    };

    startProcess();
  }, [location.search]);

  const fetchStudents = async () => {
    try {
      const response = await http.get(`/clientsdata/${userData.clientid}`);
      const students = response.data.client?.studentdetails || [];
      console.log("Fetched student details:", students);
      setStudentDetails(students);
      return students;
    } catch (err) {
      console.error("Failed to fetch student details:", err);
    }
  };

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
  console.log("studentIds", studentIds);

  const getMatchedStudentFirstNames = (studentDetails, lessonData) => {
    const firstNames = [];

    const { name1 = "", name2 = "" } = lessonData?.studentName || {};
    const targetNames = [name1, name2].map((name) =>
      (name || "").trim().toLowerCase()
    );

    studentDetails.forEach((student) => {
      const fullName = `${(student.first_name || "").trim()} ${(
        student.last_name || ""
      ).trim()}`.toLowerCase();

      if (targetNames.includes(fullName) && student.first_name) {
        firstNames.push(student.first_name);
      }
    });

    return firstNames;
  };

  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("PayPal");
  const lessiondata = JSON.parse(localStorage.getItem("lessonData"));

  const packageFormData = JSON.parse(localStorage.getItem("packageFormData"));

  const storedTeacher = JSON.parse(localStorage.getItem("selectedTeachers"));

  let studentsData = JSON.parse(localStorage.getItem("studentsData")) || [];
  const hidebutton = localStorage.getItem("hidebutton");

  useEffect(() => {
    const studentType = localStorage.getItem("studentType");

    if (!studentType) return; // no studentType, nothing to save

    let studentsData = JSON.parse(localStorage.getItem("studentsData")) || [];

    const studentData = {
      studentType: studentType,
      lessonData: JSON.parse(localStorage.getItem("lessonData")),
      groupedByWeek: JSON.parse(localStorage.getItem("groupedByWeek")),
      selectedTeachers: JSON.parse(localStorage.getItem("selectedTeachers")),
      bookingData: JSON.parse(localStorage.getItem("bookingdata")),
      packageFormData: JSON.parse(localStorage.getItem("packageFormData")),
    };

    const exists = studentsData.some(
      (item) => item.studentType === studentType
    );

    if (!exists) {
      studentsData.push(studentData);
      localStorage.setItem("studentsData", JSON.stringify(studentsData));
    }
  }, []);

  const studentType = localStorage.getItem("studentType");
  console.log("storedData:-", storedTeacher);

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

  const handlePaymentSelect = (status) => {
    // setOpenPopup(false);
    console.log("handlePaymentSelect", status);

    if (status === "success") {
      if (studentsData && studentsData.length > 0) {
        console.log("inside2");

        handleService2();
      } else {
        handleService();
        console.log("inside1");
      }
    } else {
      Object.keys(localStorage).forEach((key) => {
        if (key !== "userdata" && key !== "token" && key !== "BranchId") {
          localStorage.removeItem(key);
        }
      });
      navigate("/dashboard");
    }
  };

  const freeAssessment = JSON.parse(
    localStorage.getItem("freeAssessment") || "{}"
  );

  // ✅ Safe date parsing helper for booking keys
  function parseISOFromKey(key) {
    try {
      if (!key || typeof key !== "string") return null;

      // Split and safely take last 4 parts
      const parts = key.split("-");
      if (parts.length < 5) return null;

      const year = parts[parts.length - 4];
      const month = parts[parts.length - 3];
      const day = parts[parts.length - 2];
      let time = parts[parts.length - 1];

      if (!time.includes(":") && time.length === 4) {
        time = `${time.slice(0, 2)}:${time.slice(2)}`;
      }

      const formatted = `${year}-${month}-${day}T${time}:00.000Z`;
      const date = new Date(formatted);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch (err) {
      console.error("parseISOFromKey error:", err);
      return null;
    }
  }

  const handleService = async () => {
    console.log("fisrtAPI===");

    try {
      // setLoading(true);

      const existingTeachers =
        JSON.parse(localStorage.getItem("selectedTeachers")) || {};
      console.log("existingTeachers", existingTeachers);

      console.log("userdata:-", userData.studentdetails);

      let studentId = null;

      const lessonData = JSON.parse(localStorage.getItem("lessonData") || "{}");
      const packageId = lessonData?.packageNames?.id;
      const RESCHEDULE_BY_PACKAGE_ID = {
        2: 0, // SILVER
        3: 1, // GOLD
        4: 3, // PLATINUM
      };

      const reschedule_count = RESCHEDULE_BY_PACKAGE_ID[packageId] ?? 0;

      console.log("pakageTOtal:-", lessiondata.packageNames.total);

      const durationDays = lessonData?.packageNames.duration_days || 0;

      const currentDate = new Date();
      const formattedCurrentDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD

      let expiryDate = null;

      if (durationDays > 0) {
        const expiry = new Date(currentDate);
        expiry.setDate(currentDate.getDate() + durationDays);

        expiryDate = expiry.toISOString().split("T")[0]; // YYYY-MM-DD
      }

      const packageFormData = JSON.parse(
        localStorage.getItem("packageFormData") || "{}"
      );

      const bookdata = JSON.parse(localStorage.getItem("bookingdata") || "{}");
      // const freeAssessment = JSON.parse(
      //   localStorage.getItem("freeAssessment") || "{}"
      // );

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
        purches_status: reschedule_count,
        booked_classess: bookdata.length,
        total_classess: totallessons,
        remaining_classess: 8,
        completed_classess: 0,
      };

      console.log("payload:", payload);

      const contractorList = Object.values(existingTeachers)
        .flat()
        .reduce((acc, curr) => {
          const key = `${curr.teacherId}_${curr.subject}`;
          if (
            !acc.some(
              (item) =>
                item.contractor === curr.teacherId &&
                item.subject === curr.subject
            )
          ) {
            acc.push({
              contractor: curr.teacherId,
              subject: curr.subject,
              start: curr.date,
            });
          }
          return acc;
        }, []);

      // Step 2: Prepare updated contractor list
      // const updatedContractorList = bookdata.map((b) => {
      //   const keyParts = b.key.split("-");
      //   const formattedDateTime = `${keyParts[1]}-${keyParts[2]}-${keyParts[3]}T${keyParts[4]}:00.000Z`;
      //   const startdate = new Date(formattedDateTime).toISOString();

      //   return {
      //     contractor: b.tutorId,
      //     contractorPrice: b.tutorPrice, // ✅ Use tutorId from bookdata
      //     // ✅ Use tutorId from bookdata
      //     subject: b.subject,
      //     start: startdate,
      //   };
      // });

      const updatedContractorList = bookdata
        .map((b) => {
          const startdate = parseISOFromKey(b.key);
          if (!startdate) {
            console.warn("⛔ Invalid booking key:", b.key);
            return null;
          }

          return {
            contractor: b.tutorId,
            contractorPrice: b.tutorPrice,
            subject: b.subject,
            start: startdate,
          };
        })
        .filter(Boolean); // remove nulls

      // Step 3: Calculate pay rate
      const rawTotal = lessiondata?.packageNames?.total || "0";
      const total = parseFloat(rawTotal.replace(/,/g, ""));
      const packageType = (lessiondata?.packageName || "").toUpperCase();
      let divisor = 1;

      if (packageType === "SILVER") divisor = 6;
      else if (packageType === "GOLD") divisor = 12;
      else if (packageType === "PLATINUM") divisor = 24;

      const discountNum = Number(discount) || 0;
      const discountedTotal = Math.max(0, total - discountNum);

      const dividedTotal = (discountedTotal / divisor).toFixed(2);

      const groupedData = updatedContractorList.reduce((acc, curr) => {
        const key = `${curr.contractor}_${curr.subject}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
      }, {});

      console.log("groupedData:-", groupedData);

      const programMap = {
        "Key Stage 1": "Primary",
        "Key Stage 2": "Middle",
        "Key Stage 3": "Senior",
        "Key Stage 4": "Advanced",
      };
      let grandTotal = 0;
      // Step 5: Loop contractor+subject groups
      for (const [key, sessions] of Object.entries(groupedData)) {
        const { contractor, subject, contractorPrice } = sessions[0]; // same for all in group

        // Determine program name
        const programName =
          programMap[packageFormData.program] || packageFormData.program;

        // Count quantity for this subject
        const quantity = sessions.length;
        const studentIds = getMatchedStudentIds(
          userData.studentdetails,
          lessonData
        );
        console.log("studentIds inside handleService:", studentIds);

        const branchtype = packageFormData?.branch;
        // Create service for contractor (only once per group)
        const rcrs = studentIds.map((id) => ({ recipient: id }));
        const serviceName =
          branchtype === "online"
            ? `${username}-1-1-${subject}-${quantity}/online`
            : `${username}-1-1-${subject}-${quantity}`;
        const serviceData = {
          // name: username,
          name: serviceName,
          dft_charge_type: "hourly",
          dft_charge_rate: dividedTotal,
          dft_contractor_rate: contractorPrice,
          conjobs: [{ contractor }],
          rcrs: rcrs,
          branch_id: branchid,
        };

        const serviceRes = await http.post("/services/", serviceData);
        const serviceId = serviceRes.data.id;
        console.log(`Service created for contractor ${contractor}:`, serviceId);
        console.log(`API First:`, serviceData);

        // ✅ Make sure lessonData and studentDetails are loaded before this line

        const studentName =
          packageFormData?.name1?.trim().split(" ")[0] ||
          packageFormData?.name2?.trim().split(" ")[0] ||
          "student";

        const program = packageFormData?.program || "";

        // Extract the first number and prefix it with 'Y'
        const programYearMatch = program.match(/\d+/);
        const programCode = programYearMatch ? `Y${programYearMatch[0]}` : "";

        // Build appointment payload for all sessions in this contractor+subject group
        const appointmentPayload = sessions.map((s, index) => {
          const startdate = new Date(s.start);
          const finish = new Date(startdate.getTime() + 60 * 60 * 1000); // +1 hour

          return {
            client_id: userData.clientid,
            branch_id: branchid,
            pkg_id: lessonData?.packageNames?.id,

            // freeassismentemailsend: freeAssessment,

            start_date: formattedCurrentDate,
            expiry_date: expiryDate,

            start: startdate.toISOString().replace(".000Z", "+04:00"),
            finish: finish.toISOString().replace(".000Z", "+04:00"),
            // topic: subject,
            topic: `${studentName}-${programCode}-${subject}-${index + 1}`,
            status: "planned",
            service: serviceId,
            rcras: studentIds.map((id) => ({
              recipient: id,
              charge_rate: dividedTotal,
            })),
            cjas: [
              {
                contractor,
                pay_rate: dividedTotal,
              },
            ],
          };
        });

        console.log("📅 Sending appointments:", appointmentPayload);
        console.log(`API Secound:`, appointmentPayload);

        // 🔹 Add to grand total
        grandTotal += quantity * dividedTotal;

        // Send bulk appointments for this contractor+subject
        const res = await http.post("/appointments/", appointmentPayload);
        console.log(
          `Appointments created for contractor ${contractor}:`,
          res.data
        );
      }

      console.log(`💰 Grand total of all appointment pay rates: ${grandTotal}`);

      handleStatus();
      const performaPayload = {
        branch_id: branchid,
        amount: total,
        client: userData.clientid,
        raise_behaviour: "raise-and-send",
        description: "Credit Request",
      };

      console.log("API three:-", performaPayload);

      const response = await http.post("/proformainvoice", performaPayload);
      console.log("response of performa:-", response.data);

      const voicePayload = {
        branch_id: branchid,
        clientid: userData.clientid,
        amount: total,
        method: "cash",
        send_receipt: "True",
      };

      console.log("API Four:-", voicePayload);

      const res = await http.post(
        `/proformainvoicetakepayment/${response.data.data?.id}`,
        voicePayload
      );
      console.log("response of performa:-", res.data);

      const dashboard = localStorage.getItem("dashboard");
      if (dashboard == 1) {
        const response = await http.delete(
          `client-packagesfree/${userData.clientid}`
        );

        console.log("response of delete:-", response.data);
      }

      const weekdataresponse = await http.post("/client-packages/", payload);
      console.log("weekdata:-", weekdataresponse?.data);
      // navigate("/payment-successfull");
    } catch (error) {
      console.error("Error during booking process:", error);
    } finally {
      // setLoading(false);
    }
  };
  // ✅ Get Year From Package Form (Correct Source)
// ✅ Get Year From Package Form (Match by FULL NAME)
const getStudentYearFromPackage = (fullName, packageFormData) => {
  if (!fullName || !packageFormData) return "N/A";

  const clean = (v) =>
    String(v || "").toLowerCase().trim();

  const students = [
    packageFormData.student1,
    packageFormData.student2,
    packageFormData.student3,
  ];

  const match = students.find(
    (s) => clean(s?.name) === clean(fullName)
  );

  if (!match?.program) return "N/A";

  const yearMatch = match.program.match(/Year\s*(\d+)/i);

  return yearMatch ? `Y${yearMatch[1]}` : "N/A";
};



  const handleService2 = async () => {
    console.log("SecondAPI===");

    try {
      // setLoading(true);
      let grandTotal = 0;
      const rawTotal = lessiondata?.packageNames?.total || "0";
      const total = parseFloat(rawTotal.replace(/,/g, ""));

      for (let i = 0; i < studentsData.length; i++) {
        console.log("item:-", i);
        const currentStudent = studentsData[i];

        const existingTeachers = currentStudent.selectedTeachers;
        const lessonData = currentStudent.lessonData;
        const bookdata = currentStudent.bookingData;
        const packageFormData = currentStudent.packageFormData;

        const durationDays = lessonData?.packageNames.duration_days || 0;

        const currentDate = new Date();
        const formattedCurrentDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD

        let expiryDate = null;

        if (durationDays > 0) {
          const expiry = new Date(currentDate);
          expiry.setDate(currentDate.getDate() + durationDays);

          expiryDate = expiry.toISOString().split("T")[0]; // YYYY-MM-DD
        }

        console.log(`Processing Student ${i + 1}:`, {
          existingTeachers,
          lessonData,
          bookdata,
        });

        const payload = {
          clientid: userData.clientid,
          packageForm: {
            lessonData,
            packageFormData,
          },
          bookingdata: {
            bookdata,
          },
        };

        // Step 1: Prepare contractor list
        const contractorList = Object.values(existingTeachers)
          .flat()
          .reduce((acc, curr) => {
            const key = `${curr.teacherId}_${curr.subject}`;
            if (
              !acc.some(
                (item) =>
                  item.contractor === curr.teacherId &&
                  item.subject === curr.subject
              )
            ) {
              acc.push({
                contractor: curr.teacherId,
                subject: curr.subject,
                start: curr.date,
              });
            }
            return acc;
          }, []);

        // const updatedContractorList = bookdata.map((b) => {
        //   const keyParts = b.key.split("-");
        //   const formattedDateTime = `${keyParts[1]}-${keyParts[2]}-${keyParts[3]}T${keyParts[4]}:00.000Z`;
        //   const startdate = new Date(formattedDateTime).toISOString();

        //   return {
        //     contractor: b.tutorId,
        //     contractorPrice: b.tutorPrice,
        //     subject: b.subject,
        //     start: startdate,
        //   };
        // });

        const updatedContractorList = bookdata
          .map((b) => {
            const startdate = parseISOFromKey(b.key);
            if (!startdate) {
              console.warn("⚠️ Skipping invalid booking key:", b.key);
              return null;
            }
            return {
              contractor: b.tutorId,
              contractorPrice: b.tutorPrice,
              subject: b.subject,
              start: startdate,
            };
          })
          .filter(Boolean);

        // Step 3: Calculate pay rate
        const rawTotal = lessiondata?.packageNames?.total || "0";
        const total = parseFloat(rawTotal.replace(/,/g, ""));
        const packageType = (lessiondata?.packageName || "").toUpperCase();
        let divisor = 1;

        if (packageType === "SILVER") divisor = 6;
        else if (packageType === "GOLD") divisor = 12;
        else if (packageType === "PLATINUM") divisor = 24;

        const dividedTotal = (total / divisor).toFixed(2);

        // Step 4: Group by contractor and subject
        const groupedData = updatedContractorList.reduce((acc, curr) => {
          const key = `${curr.contractor}_${curr.subject}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(curr);
          return acc;
        }, {});

        const programMap = {
          "Key Stage 1": "Primary",
          "Key Stage 2": "Middle",
          "Key Stage 3": "Senior",
          "Key Stage 4": "Advanced",
        };

        for (const [key, sessions] of Object.entries(groupedData)) {
          const { contractor, subject, contractorPrice } = sessions[0];

          // Determine program name
          const programName =
            programMap[packageFormData.program] || packageFormData.program;

          const quantity = sessions.length;

          // ✅ Get all student IDs that match this subject/group
          const studentIds = getMatchedStudentIds(
            userData.studentdetails,
            lessonData
          );
          console.log("studentIds inside handleService:", studentIds);

          // Create recipients
          const rcrs = studentIds.map((id) => ({ recipient: id }));
          const branchtype = packageFormData?.branch;
          const serviceName =
            branchtype === "online"
              ? `${username}-1-1-${subject}-${quantity}/online`
              : `${username}-1-1-${subject}-${quantity}`;

          const serviceData = {
            name: serviceName,
            dft_charge_type: "hourly",
            dft_charge_rate: dividedTotal,
            dft_contractor_rate: contractorPrice,
            conjobs: [{ contractor }],
            rcrs: rcrs,
            branch_id: branchid,
          };

          const serviceRes = await http.post("/services/", serviceData);
          const serviceId = serviceRes.data.id;
          console.log(
            `Service created for contractor ${contractor}:`,
            serviceId
          );

          console.log("API First", serviceData);
          // const programMapById = {};
          // const studentEntries = Object.entries(packageFormData).filter(
          //   ([key]) => key.startsWith("student")
          // );

          // for (const [key, val] of studentEntries) {
          //   if (val?.name && val?.program) {
          //     const shortCode = val.program.match(/Year\s*(\d+)/i)?.[1]
          //       ? `Y${val.program.match(/Year\s*(\d+)/i)[1]}`
          //       : val.program; // fallback if pattern not found
          //     const match = userData.studentdetails.find((s) =>
          //       val.name.includes(s.first_name)
          //     );
          //     if (match) programMapById[match.id] = shortCode;
          //   }
          // }
          // ✅ Loop through each student separately to generate topics
          for (const studentId of studentIds) {
            const studentInfo = userData.studentdetails.find(
              (s) => s.id === studentId
            );

            // const programCode = programMapById[studentId] || "N/A";
            // Full name for YEAR match
const fullName = `${studentInfo.first_name} ${studentInfo.last_name}`.trim();

// Only first name for TOPIC
const firstName = studentInfo.first_name || "Student";

// Get year using full name
const programCode = getStudentYearFromPackage(
  fullName,
  currentStudent.packageFormData
);

console.log("🎓 FINAL:", firstName, programCode);


            const appointmentPayload = sessions.map((s, index) => {
              const startdate = new Date(s.start);
              const finish = new Date(startdate.getTime() + 60 * 60 * 1000); // +1h

              return {
                client_id: userData.clientid,
                branch_id: branchid,
                pkg_id: lessonData?.packageNames?.id,
                start_date: formattedCurrentDate,
                expiry_date: expiryDate,
                start: startdate.toISOString().replace(".000Z", "+04:00"),
                finish: finish.toISOString().replace(".000Z", "+04:00"),

                // ✅ Correct topic format per student
                topic: `${firstName}-${programCode}-${subject}-${index + 1}`,

                status: "planned",
                service: serviceId,
                rcras: [
                  {
                    recipient: studentId,
                    charge_rate: dividedTotal,
                  },
                ],
                cjas: [
                  {
                    contractor,
                    pay_rate: dividedTotal,
                  },
                ],
              };
            });

            console.log("API secound", appointmentPayload);
            await http.post("/appointments/", appointmentPayload);
          }

          grandTotal += quantity * dividedTotal;

          const weekdataresponse = await http.post(
            "/client-packages/",
            payload
          );
          console.log("Client package created:", weekdataresponse?.data);
        }
      }

      console.log("finish:-");

      handleStatus();

      const performaPayload = {
        branch_id: branchid,

        amount: total,
        client: userData.clientid,
        raise_behaviour: "raise-and-send",
        description: "Credit Request",
      };

      console.log("API three", performaPayload);

      const response = await http.post("/proformainvoice", performaPayload);
      console.log("response of performa:-", response.data);

      const voicePayload = {
        branch_id: branchid,
        clientid: userData.clientid,
        amount: total,
        method: "cash",
        send_receipt: "True",
      };

      console.log("API four", voicePayload);

      const res = await http.post(
        `/proformainvoicetakepayment/${response.data.data?.id}`,
        voicePayload
      );
      console.log("response of performa:-", res.data);

      // navigate("/payment-successfull");
    } catch (error) {
      console.error("Error during booking process:", error);
    } finally {
      // setLoading(false);
    }
  };

  const uniqueTeachersMap = {};

  Object.entries(storedTeacher).forEach(([subject, sessions]) => {
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

  return (
    <div
      className="min-h-screen bg-[#F0EDFF]"
      style={{
        backgroundImage: "url('/Background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#EEEDFE",
      }}
    >
      <Header
        title="Success"
        titleImg={"/frwrdlogo.jpg"}
        leftIconOne="☰"
        onLeftOneClick={() => setIsMenuOpen(true)}
        leftIconTwo="←"
        onLeftTwoClick={() => window.history.back()}
      />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="max-w-md mx-auto pt-20 px-4 space-y-4 text-center">
        {loading ? (
          <div className="flex justify-center items-center">
            <CircularProgress />
            <p className="ml-2">Verifying payment...</p>
          </div>
        ) : (
          <>
            <Confetti width={window.innerWidth} height={window.innerHeight} />
            <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
              {/* Success icon */}
              <Check className="h-14 w-14 text-[#65C68F]" strokeWidth={2.5} />

              {/* Success text */}
              <h2 className=" text-[40px] font-semibold text-[#65C68F]">
                Successful!
              </h2>
              <p className="mt-10 text-[14px] w-[156px] font-medium text-[#434343]">
                You will receive order <br />
                confirmation by email shortly
              </p>

              {/* Button */}
              <button
                // onClick={() => (window.location.href = "/payment-summary")}
                onClick={() => {
                  Object.keys(localStorage).forEach((key) => {
                    if (
                      key !== "userdata" &&
                      key !== "token" &&
                      key !== "BranchId"
                    ) {
                      localStorage.removeItem(key);
                    }
                  });

                  navigate("/manage-booking");
                }}
                className="mt-10 w-[306px] shadow bg-[#65C68F] hover:bg-green-600 text-[#FFFFFF] font-medium text-[18px] mx-4 px-6 py-3 rounded-[6px]"
              >
                Manage your Slots
              </button>
            </div>
          </>
        )}
      </div>

      {/* <button onClick={() => handlePaymentSelect("success")}>Save Data</button> */}
    </div>
  );
};

export default SuccessPage;
