import React, { useEffect, useState } from "react";
import Header from "../utils/header/Header";
import Sidebar from "../utils/sidebar/Sidebar";
import CustomButton from "../utils/CustomButton";
import { useNavigate } from "react-router-dom";
import http from "../service/http";
import Swal from "sweetalert2";
import Confetti from "react-confetti";

import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
const CheckoutPage = () => {
  const [openPopup, setOpenPopup] = useState(false);
  const navigate = useNavigate();
  const branchid = localStorage.getItem("BranchId");

  useEffect(() => {
    const handleBack = (event) => {
      event.preventDefault();

      Swal.fire({
        title: "Are you sure?",
        text: "If you go back, your all data will be cleared.",
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
            if (key !== "userdata" && key !== "token" && key !== "BranchId") {
              localStorage.removeItem(key);
            }
          });

          navigate("/dashboard"); // redirect to book class page
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

  const [discount, setDiscount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState("");
  // Per student coupon + discount
  const [studentCoupons, setStudentCoupons] = useState({});
  const [studentDiscounts, setStudentDiscounts] = useState({});
  const [studentMessages, setStudentMessages] = useState({});

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

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

  console.log("username:", username);

  const applyCoupon = async (index) => {
    try {
      const code = studentCoupons[index];

      if (!code || code.trim() === "") {
        setStudentMessages((prev) => ({
          ...prev,
          [index]: "Please enter coupon code",
        }));
        return;
      }

      const response = await http.post("/apply-coupon", {
        code,
        userId: userData.clientid,
      });

      if (response.data.success) {
        setStudentDiscounts((prev) => ({
          ...prev,
          [index]: Number(response.data.discount_value),
        }));

        setStudentMessages((prev) => ({
          ...prev,
          [index]: "Coupon applied successfully 🎉",
        }));

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } else {
        setStudentDiscounts((prev) => ({
          ...prev,
          [index]: 0,
        }));

        setStudentMessages((prev) => ({
          ...prev,
          [index]: response.data.message || "Invalid coupon",
        }));
      }
    } catch (error) {
      console.error("Coupon error:", error);

      setStudentMessages((prev) => ({
        ...prev,
        [index]: "Invalid coupon",
      }));
    }
  };

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

  const getMatchedStudentFirstNames = (studentDetails, lessonData) => {
    const firstNames = [];

    const { name1 = "", name2 = "" } = lessonData?.studentName || {};
    const targetNames = [name1, name2].map((name) =>
      (name || "").trim().toLowerCase(),
    );

    studentDetails.forEach((student) => {
      const fullName =
        `${(student.first_name || "").trim()} ${(student.last_name || "").trim()}`.toLowerCase();

      if (targetNames.includes(fullName) && student.first_name) {
        firstNames.push(student.first_name);
      }
    });

    return firstNames;
  };

  const studentFirstNames = getMatchedStudentFirstNames(
    studentDetails,
    lessonData,
  );
  console.log("studentFirstNames", studentFirstNames);

  const studentIds = getMatchedStudentIds(studentDetails, lessonData);

  console.log("studentIds", studentIds);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      (item) => item.studentType === studentType,
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
        `/client/status-check?clientid=${userData.clientid}`,
      );
      console.log("status updated successfuly:", response.data);
    } catch (error) {
      console.error("error from status update:-", error);
    }
  };

  const handlePaymentSelect = (status) => {
    setOpenPopup(false);

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

  const bookdatademo = JSON.parse(localStorage.getItem("bookingdata") || "[]");

  const totalLessonsdemo = localStorage.getItem("totalLession") || "0 Lessons";
  const totalLessonsNumdemo = parseInt(totalLessonsdemo.replace(/\D/g, ""), 10);
  const remainingLessonsdemo = Math.max(
    totalLessonsNumdemo - bookdatademo.length,
    0,
  );
  console.log(
    "remainingLessonsdemo:-",
    remainingLessonsdemo,
    totalLessonsNumdemo,
    bookdatademo.length,
  );

  const handleService = async () => {
    try {
      setLoading(true);

      // ✅ Step 1: Load from localStorage safely
      const existingTeachers = JSON.parse(
        localStorage.getItem("selectedTeachers") || "{}",
      );
      const userData = JSON.parse(localStorage.getItem("userdata") || "{}");
      const lessionData = JSON.parse(
        localStorage.getItem("lessonData") || "{}",
      );
      const packageFormData = JSON.parse(
        localStorage.getItem("packageFormData") || "{}",
      );
      const bookdata = JSON.parse(localStorage.getItem("bookingdata") || "[]");
      const totalLessons = localStorage.getItem("totalLession") || "0 Lessons";

      console.log("existingTeachers:", existingTeachers);
      console.log("userdata:", userData);
      console.log("lessonData:", lessionData);
      console.log("bookdata:", bookdata);
      console.log("packageFormData:", packageFormData);

      // ✅ Step 2: Compute duration & expiry
      const durationDays = lessionData?.packageNames?.duration_days || 0;
      const currentDate = new Date();
      const formattedCurrentDate = currentDate.toISOString().split("T")[0];

      let expiryDate = null;
      if (durationDays > 0) {
        const expiry = new Date(currentDate);
        expiry.setDate(expiry.getDate() + durationDays);
        expiryDate = expiry.toISOString().split("T")[0];
      }

      // ✅ Step 3: Compute total lessons
      const totalLessonsNum = parseInt(totalLessons.replace(/\D/g, ""), 10);
      const remainingLessons = Math.max(totalLessonsNum - bookdata.length, 0);

      // ✅ Step 4: Payload for /client-packages
      const payload = {
        clientid: userData.clientid,
        packageForm: {
          lessonData: lessionData,
          packageFormData,
        },
        bookingdata: {
          bookdata,
        },
        purches_status: 0,
        booked_classess: bookdata.length,
        total_classess: totalLessons,
        remaining_classess: remainingLessons,
        completed_classess: 0,
      };

      console.log("📦 package payload:", payload);

      // ✅ Step 5: Prepare contractor list with safe date parsing
      const updatedContractorList = bookdata
        .map((b) => {
          try {
            if (!b?.key || typeof b.key !== "string") {
              console.warn("⚠️ Missing or invalid key:", b);
              return null;
            }

            // Match expected pattern: YYYY-MM-DD-HH:MM
            const match = b.key.match(/(\d{4}-\d{2}-\d{2})-(\d{2}:\d{2})$/);
            if (!match) {
              console.warn("⚠️ Invalid key format, skipping:", b.key);
              return null;
            }

            const [_, datePart, timePart] = match;
            const isoString = `${datePart}T${timePart}:00Z`; // Convert to UTC ISO
            const startIso = new Date(isoString);

            if (isNaN(startIso)) {
              console.warn(
                "⚠️ Invalid ISO parsed:",
                isoString,
                "from key:",
                b.key,
              );
              return null;
            }

            return {
              contractor: b.tutorId,
              contractorPrice: b.tutorPrice,
              subject: b.subject || "General",
              start: startIso.toISOString(), // ✅ Always valid ISO
            };
          } catch (err) {
            console.error("❌ Error parsing booking data:", b, err);
            return null;
          }
        })
        .filter(Boolean);

      console.log("👨‍🏫 updatedContractorList:", updatedContractorList);

      // ✅ Step 6: Group by contractor+subject
      const groupedData = updatedContractorList.reduce((acc, curr) => {
        const key = `${curr.contractor}_${curr.subject}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
      }, {});
      console.log("📚 groupedData:", groupedData);

      // ✅ Step 7: Compute pricing
      const rawTotal = lessionData?.packageNames?.total || "0";
      const total = parseFloat(rawTotal.replace(/,/g, ""));
      const packageType = (lessionData?.packageName || "").toUpperCase();
      let divisor = 1;
      if (packageType === "SILVER") divisor = 6;
      else if (packageType === "GOLD") divisor = 12;
      else if (packageType === "PLATINUM") divisor = 24;

      const dividedTotal = (total / divisor).toFixed(2);

      const programMap = {
        "Key Stage 1": "Primary",
        "Key Stage 2": "Middle",
        "Key Stage 3": "Senior",
        "Key Stage 4": "Advanced",
      };
      const programName =
        programMap[packageFormData.program] || packageFormData.program;

      const username = userData.firstname || "Student";
      const studentIds = (userData.studentdetails || []).map((s) => s.id);

      let grandTotal = 0;

      // ✅ Step 8: Create services + appointments per group
      for (const [key, sessions] of Object.entries(groupedData)) {
        const { contractor, subject, contractorPrice } = sessions[0];
        const quantity = sessions.length;

        // -- Service creation
        const rcrs = studentIds.map((id) => ({ recipient: id }));
        const serviceData = {
          name: `${programName}-${username}-${subject}-${quantity}`,
          dft_charge_type: "hourly",
          dft_charge_rate: dividedTotal,
          dft_contractor_rate: contractorPrice,
          conjobs: [{ contractor }],
          rcrs,
        };

        // const serviceRes = await http.post("/services/", serviceData);
        // const serviceId = serviceRes.data.id;
        console.log(`API One: ${serviceData} (${subject})`);

        const appointmentPayloads = Object.entries(groupedData).map(
          ([key, sessions]) => {
            const { contractor, subject, contractorPrice } = sessions[0];
            const quantity = sessions.length;

            const serviceData = {
              name: `${programName}-${username}-${subject}-${quantity}`,
              dft_charge_type: "hourly",
              dft_charge_rate: dividedTotal,
              dft_contractor_rate: contractorPrice,
              conjobs: [{ contractor }],
              rcrs: studentIds.map((id) => ({ recipient: id })),
            };

            console.log("🧾 Service Data:", serviceData);

            const appointments = sessions
              .map((s, i) => {
                const startDate = new Date(s.start);

                if (isNaN(startDate)) {
                  console.error("⚠️ Skipping invalid session (bad start):", s);
                  return null;
                }

                const finishDate = new Date(
                  startDate.getTime() + 60 * 60 * 1000,
                );

                return {
                  client_id: userData.clientid,
                  pkg_id: lessionData.packageNames.id,
                  start_date: formattedCurrentDate,
                  expiry_date: expiryDate,
                  start: startDate.toISOString().replace(".000Z", "+04:00"),
                  finish: finishDate.toISOString().replace(".000Z", "+04:00"),
                  topic: `${programName}-${username}-${subject}-${i + 1}`,
                  status: "planned",
                  service: "serviceId",
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
              })
              .filter(Boolean);

            console.log(`📅 Appointments for ${subject}:`, appointments);
            return { serviceData, appointments };
          },
        );

        console.log("API Two:", appointmentPayloads);

        // const res = await http.post("/appointments/", appointmentPayload);
        console.log(`✅ Appointments created for ${subject}`);

        grandTotal += quantity * dividedTotal;
      }

      console.log(`💰 Grand total for invoice: ${grandTotal}`);

      // ✅ Step 9: Proforma invoice & payment
      const performaPayload = {
        amount: grandTotal,
        client: userData.clientid,
        raise_behaviour: "raise-and-send",
        description: "Credit Request",
      };
      console.log("API three:", performaPayload);

      // const invoiceRes = await http.post("/proformainvoice", performaPayload);
      // console.log("🧾 Proforma created:", invoiceRes.data);

      const voicePayload = {
        clientid: userData.clientid,
        amount: grandTotal,
        method: "cash",
        send_receipt: "True",
      };
      console.log("API Four:", voicePayload);

      // ✅ Step 10: Save package
      const weekDataRes = await http.post("/client-packages/", payload);
      console.log("📦 Package stored:", weekDataRes.data);

      navigate("/payment-successfull");
    } catch (error) {
      console.error("❌ Error during booking process:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleService2 = async () => {
    try {
      setLoading(true);
      let grandTotal = 0;

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
                  item.subject === curr.subject,
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
        //     contractor: b.tutorId, // ✅ Use tutorId from bookdata
        //     contractorPrice: b.tutorPrice, // ✅ Use tutorId from bookdata

        //     subject: b.subject,
        //     start: startdate,
        //   };
        // });

        // Step 3: Calculate pay rate

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

        // Step 5: Loop contractor+subject groups
        for (const [key, sessions] of Object.entries(groupedData)) {
          const { contractor, subject, contractorPrice } = sessions[0]; // same for all in group

          // Determine program name
          const programName =
            programMap[packageFormData.program] || packageFormData.program;

          // Count quantity for this subject
          const quantity = sessions.length;

          // Create service for contractor (only once per group)
          const rcrs = studentIds.map((id) => ({ recipient: id }));
          const serviceData = {
            // name: username,
            name: `${programName}-${username}-${subject}-${quantity}`,
            dft_charge_type: "hourly",
            dft_charge_rate: dividedTotal,
            dft_contractor_rate: contractorPrice,
            conjobs: [{ contractor }],
            rcrs: rcrs,
          };

          const serviceRes = await http.post("/services/", serviceData);
          const serviceId = serviceRes.data.id;
          console.log(
            `Service created for contractor ${contractor}:`,
            serviceId,
          );

          // Build appointment payload for all sessions in this contractor+subject group
          const appointmentPayload = sessions.map((s, index) => {
            const startdate = new Date(s.start);
            const finish = new Date(startdate.getTime() + 60 * 60 * 1000); // +1 hour

            return {
              client_id: userData.clientid,
              pkg_id: lessonData?.packageNames?.id,
              start_date: formattedCurrentDate,
              expiry_date: expiryDate,
              // start: startdate.toISOString(),
              // finish: finish.toISOString(),
              // topic: subject,
              start: startdate.toISOString().replace(".000Z", "+04:00"),
              finish: finish.toISOString().replace(".000Z", "+04:00"),
              topic: `${programName}-${username}-${subject}-${index + 1}`,
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
          grandTotal += quantity * dividedTotal;

          // Send bulk appointments for this contractor+subject
          const res = await http.post("/appointments/", appointmentPayload);
          console.log(
            `Appointments created for contractor ${contractor}:`,
            res.data,
          );

          const weekdataresponse = await http.post(
            "/client-packages/",
            payload,
          );
          console.log("Client package created:", weekdataresponse?.data);
        }
      }

      console.log("finish:-");

      handleStatus();
      const performaPayload = {
        amount: grandTotal,
        client: userData.clientid,
        raise_behaviour: "raise-and-send",
        description: "Credit Request",
      };

      console.log("performaPayload:-", performaPayload);

      const response = await http.post("/proformainvoice", performaPayload);
      console.log("response of performa:-", response.data);

      const voicePayload = {
        clientid: userData.clientid,
        amount: grandTotal,
        method: "cash",
        send_receipt: "True",
      };

      console.log("voicePayload:-", voicePayload);

      const res = await http.post(
        `/proformainvoicetakepayment/${response.data.data?.id}`,
        voicePayload,
      );
      console.log("response of performa:-", res.data);
    } catch (error) {
      console.error("Error during booking process:", error);
    } finally {
      setLoading(false);
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

  const handleStudent = (e) => {
    e.preventDefault();
    // console.log("click");
    let value, value2;
    if (studentType == 1) {
      value = 2;
      value2 = 2;
    } else {
      value = 1;
      value2 = 2;
    }

    localStorage.setItem("studentType", value);
    localStorage.setItem("hidebutton", value2);

    localStorage.removeItem("lessonData");
    localStorage.removeItem("groupedByWeek");
    localStorage.removeItem("selectedTeachers");
    localStorage.removeItem("bookingdata");
    navigate("/manage-packages");
  };

  // For each student, compute total after discount
  // const getStudentFinalTotal = (student) => {
  //   const rawTotal = student.lessonData?.packageNames?.total ?? 0;
  //   const numericTotal = Number(String(rawTotal).replace(/[^\d.-]/g, "")) || 0;
  //  const discountNum = Number(studentDiscounts[0]) || 0;

  //   return Math.max(0, numericTotal - discountNum);
  // };
  const getStudentFinalTotal = (student, index) => {
  const rawTotal = student.lessonData?.packageNames?.total ?? 0;

  const numericTotal =
    Number(String(rawTotal).replace(/[^\d.-]/g, "")) || 0;

  const discountNum =
    Number(studentDiscounts[index]) || 0;

  const final = Math.max(0, numericTotal - discountNum);

  console.log(
    `💰 Student ${index + 1} Total:`,
    numericTotal,
    "-",
    discountNum,
    "=",
    final
  );

  return final;
};

  

  // let grandTotal = 0;

  // if (packageFormData.studyType === "no") {
  //   grandTotal = studentsData.reduce((sum, student) => {
  //     return sum + getStudentFinalTotal(student);
  //   }, 0);
  // } else {
  //   const rawTotal = lessiondata?.packageNames?.total ?? 0;
  //   console.log("finalNumeric (number):2", rawTotal);

  //   const numericTotal = Number(String(rawTotal).replace(/[^\d.-]/g, "")) || 0;
  //  const discountNum = Number(studentDiscounts[0]) || 0;


  //   grandTotal = Math.max(0, numericTotal - discountNum);

  //   console.log("finalNumeric (number):", grandTotal);

  //   const finalAmount = grandTotal.toLocaleString("en-US");
  //   console.log("finalAmount (string):", finalAmount);
  // }

  let grandTotal = 0;

// ================= INDIVIDUAL =================
if (packageFormData.studyType === "no") {
  grandTotal = studentsData.reduce((sum, student, index) => {
    return sum + getStudentFinalTotal(student, index);
  }, 0);

  console.log("✅ INDIVIDUAL GRAND TOTAL:", grandTotal);
}

// ================= GROUP / SINGLE =================
else {
  const rawTotal = lessiondata?.packageNames?.total ?? 0;

  const numericTotal =
    Number(String(rawTotal).replace(/[^\d.-]/g, "")) || 0;

  const discountNum = Number(studentDiscounts[0]) || 0;

  grandTotal = Math.max(0, numericTotal - discountNum);

  console.log("✅ GROUP/SINGLE TOTAL:", grandTotal);
}

  console.log("Grand Total (number):", grandTotal);

  // Format for display
  const grandTotalFormatted = grandTotal.toLocaleString("en-US");
  console.log("Grand Total (formatted):", grandTotalFormatted);

const getFinalPackageIds = () => {
  let ids = [];

  const studyType = packageFormData?.studyType;

  const studentsData =
    JSON.parse(localStorage.getItem("studentsData")) || [];

  // ================= INDIVIDUAL (MULTI) =================
  if (studyType === "no" && studentsData.length > 0) {

    ids = studentsData
      .map((item) => item?.lessonData?.packageNames?.id)
      .filter(Boolean);

  }

  // ================= SINGLE / GROUP =================
  else {

    const lesson =
      JSON.parse(localStorage.getItem("lessonData")) || {};

    if (lesson?.packageNames?.id) {
      ids = [lesson.packageNames.id];
    }

  }

  return ids;
};


  const createOrder = async () => {
    setLoading(true);
    let lessiondata = JSON.parse(localStorage.getItem("lessonData")) || {};

    // Step 2: Ensure packageNames exists
    if (!lessiondata.packageNames) {
      lessiondata.packageNames = {};
    }

    // Step 3: Update the total with the new formatted total
    lessiondata.packageNames.total = grandTotalFormatted;

    // Step 4: Save updated object back to localStorage
    localStorage.setItem("lessonData", JSON.stringify(lessiondata));

    console.log("Updated localStorage.lessonData:", lessiondata);

    const matchedStudentIds = getMatchedStudentIds(
  studentDetails,
  lessiondata
);


const packageIds = getFinalPackageIds();

console.log("📦 FINAL PACKAGE IDS:", packageIds);


    try {
      const payload = {
        email: userData.email,
        // student_ids: userData?.studentdetails?.map((s) => s.id) || [],
        student_ids: matchedStudentIds || [],
        client_id: userData.clientid,
        appoint_ids: ["AP56789"],
         package_ids: packageIds,  // 🔥 ADD THIS
        amount: grandTotalFormatted,
        // amount: "0.041",
        branch_id: branchid,
      };
      console.log("payload", payload);

      const response = await http.post("/create-order", payload);

      if (response.data.paymentLink) {
        console.log("Payment Link:", response.data.paymentLink);

        window.location.href = response.data.paymentLink;
      } else {
        console.error("No payment link received:", response.data);
      }
    } catch (error) {
      console.error(
        "Error creating order:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F0EDFF]"
      style={{
        backgroundImage: "url('/Background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#EEEDFE", // ya koi fallback color
      }}
    >
      <Header
        title="Checkout"
        // leftIconOne="☰"
        // onLeftOneClick={() => setIsMenuOpen(true)}
        // leftIconTwo="←"
        // onLeftTwoClick={() => window.history.back()}
        // rightText="Renew"
        // onRightTextClick={() => navigate("/new-booking")}
      />

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="max-w-md mx-auto pt-20 px-4 space-y-4 ">
        {/* Summary card */}

        {(packageFormData.studyType !== "no" &&
          packageFormData.studyType === null) ||
        packageFormData.studyType === "yes" ? (
          <div className="bg-[#FFFFFF] shadow rounded-xl overflow-hidden">
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
            {Object.entries(uniqueTeachersMap).map(
              ([teacherName, sessions], index) => (
                <>
                  <div key={teacherName}>
                    <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
                      <span className="text-[#434343]">
                        {Object.keys(uniqueTeachersMap).length > 1
                          ? `Tutor ${index + 1}`
                          : "Tutor"}
                      </span>
                      <span className="text-[#49479D] text-right">
                        {teacherName}
                      </span>
                    </div>
                  </div>
                </>
              ),
            )}
            <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
              <span className="text-[#434343]">Package</span>
              <span className="text-[#49479D] text-right font-medium">
                {lessiondata.packageNames.name}
              </span>
            </div>

            <div className="grid grid-cols-2 items-center border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3 gap-4">
              {/* Input + Button group */}

              <input
                type="text"
                placeholder="Enter coupon"
                value={studentCoupons[0] || ""}
                onChange={(e) =>
                  setStudentCoupons((prev) => ({
                    ...prev,
                    0: e.target.value,
                  }))
                }
                className="border border-[#CCCCCC] px-2 py-1 rounded-l-md text-sm  focus:outline-none"
              />
              <button
                onClick={() => applyCoupon(0)}
                className="bg-[#49479D]  hover:bg-green-600 text-white px-2 py-1 rounded-r-md text-sm"
              >
                Apply Coupon
              </button>

              {/* Success message */}
              {studentDiscounts[0] > 0 && (
                <p className="col-span-2 text-green-600 mt-2">
                  🎉 Coupon applied! You saved ₹{studentDiscounts[0]}
                </p>
              )}

              {studentMessages[0] && (
                <p className="col-span-2 text-red-600 mt-1">
                  {studentMessages[0]}
                </p>
              )}

              {/* Celebration effect */}
              {showConfetti && <Confetti />}
            </div>

            <div className="grid grid-cols-2 border-t border-[#B8B8B8] text-[14px] font-medium mt-30 px-4 py-3">
              <span className="text-[#434343]">Grand Total</span>
              <span className="text-right text-base text-[#434343] font-bold">
                {/* {lessiondata.packageNames.total} */}
                {(() => {
                  const rawTotal = lessiondata?.packageNames?.total ?? 0;
                  // remove commas, ₹ signs, spaces, etc.
                  const totalNum =
                    Number(String(rawTotal).replace(/[^\d.-]/g, "")) || 0;
                 const discountNum = Number(studentDiscounts[0]) || 0;


                  return `${Math.max(0, totalNum - discountNum)}`;
                })()}
              </span>
            </div>
          </div>
        ) : (
          ""
        )}

        {packageFormData.studyType === "no" && (
          <div>
            {studentsData.map((student, idx) => {
              // Build unique teachers map for each student
              const uniqueTeachersMap = {};

              Object.entries(student.selectedTeachers || {}).forEach(
                ([subject, sessions]) => {
                  sessions.forEach((session) => {
                    const name = session.name;

                    if (!uniqueTeachersMap[name]) {
                      uniqueTeachersMap[name] = [];
                    }

                    // Deduplicate using session key
                    const exists = uniqueTeachersMap[name].some(
                      (s) => s.key === session.key,
                    );
                    if (!exists) {
                      uniqueTeachersMap[name].push(session);
                    }
                  });
                },
              );

              return (
                <div
                  key={idx}
                  className="bg-white shadow rounded-xl overflow-hidden mb-4"
                >
                  {(student.studentType == 1
                    ? student.lessonData?.studentName?.name1
                    : student.lessonData?.studentName?.name2) && (
                    <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
                      <span className="text-[#434343]">
                        {student.studentType == 1
                          ? "Student Name"
                          : "Student Name 2"}
                      </span>
                      <span className="text-[#49479D] text-right font-medium">
                        {student.studentType == 1
                          ? student.lessonData?.studentName.name1
                          : student.lessonData?.studentName.name2}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
                    <span className="text-[#434343]">Package</span>
                    <span className="text-[#49479D] text-right font-medium">
                      {student.lessonData?.packageNames?.name || "N/A"}
                    </span>
                  </div>

                  {/* Tutors */}
                  {Object.entries(uniqueTeachersMap).map(
                    ([teacherName, sessions], index) => (
                      <div key={teacherName}>
                        <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
                          <span className="text-[#434343]">
                            {Object.keys(uniqueTeachersMap).length > 1
                              ? `Tutor ${index + 1}`
                              : "Tutor"}
                          </span>
                          <span className="text-[#49479D] text-right">
                            {teacherName}
                          </span>
                        </div>
                        {/* <div className="grid grid-cols-2 border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3">
                        <span className="text-[#434343]">Lessons</span>
                        <span className="text-[#49479D] text-right">
                          {`${sessions.length} Lesson${
                            sessions.length > 1 ? "s" : ""
                          }`}
                        </span>
                      </div> */}
                      </div>
                    ),
                  )}

                  <div className="grid grid-cols-2 items-center border-b text-[14px] font-medium border-[#B8B8B8] px-4 py-3 gap-4">
                    {/* Input + Button group */}

                    <input
                      type="text"
                      placeholder="Enter coupon"
                      value={studentCoupons[idx] || ""}
                      onChange={(e) =>
                        setStudentCoupons((prev) => ({
                          ...prev,
                          [idx]: e.target.value,
                        }))
                      }
                      className="border border-[#CCCCCC] px-2 py-1 rounded-l-md text-sm  focus:outline-none"
                    />
                    <button
                      onClick={() => applyCoupon(idx)}
                      className="bg-[#49479D]  hover:bg-green-600 text-white px-2 py-1 rounded-r-md text-sm"
                    >
                      Apply Coupon
                    </button>

                    {/* Success message */}
                    {studentDiscounts[idx] > 0 && (
                      <p className="col-span-2 text-green-600 mt-2">
                        🎉 Coupon applied! You saved ₹{studentDiscounts[idx]}
                      </p>
                    )}

                    {studentMessages[idx] && (
                      <p className="col-span-2 text-red-600 mt-1">
                        {studentMessages[idx]}
                      </p>
                    )}

                    {/* Celebration effect */}
                    {showConfetti && <Confetti />}
                  </div>
                  <div className="grid grid-cols-2 border-t border-[#B8B8B8] text-[14px] font-medium mt-30 px-4 py-3">
                    <span className="text-[#434343]">Grand Total</span>
                    <span className="text-right text-base text-[#434343] font-bold">
                      {(() => {
                        const rawTotal =
                          student.lessonData?.packageNames?.total ?? 0;
                        // remove commas, ₹ signs, spaces, etc.
                        const totalNum =
                          Number(String(rawTotal).replace(/[^\d.-]/g, "")) || 0;
                      const discountNum = Number(studentDiscounts[idx]) || 0;


                        return `₹${Math.max(0, totalNum - discountNum)}`;
                      })()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Payment Options */}
        <div className="space-y-3">
          <PaymentOption
            // label="PayPal"
            image={"/paypal.png"}
            selected={selectedPayment === "PayPal"}
            onClick={() => setSelectedPayment("PayPal")}
          />
          <PaymentOption
            // label="VISA"
            image={"/visa2.png"}
            selected={selectedPayment === "VISA"}
            onClick={() => setSelectedPayment("VISA")}
          />
          <PaymentOption
            // label="Mastercard"
            image={"/mastercard2.png"}
            selected={selectedPayment === "Mastercard"}
            onClick={() => setSelectedPayment("Mastercard")}
          />
        </div>
        <PaymentPopup
          open={openPopup}
          onClose={() => setOpenPopup(false)}
          onSelect={handlePaymentSelect}
        />

        <div
          className={`pb-36 flex items-center ${
            hidebutton == 1 ? "justify-between" : "justify-end"
          } `}
        >
          {hidebutton && hidebutton == 1 && (
            <div className="">
              <button
                onClick={(e) => handleStudent(e)}
                className={`flex items-center justify-center text-[#FFFFFF] rounded-[6px] text-base font-semibold shadow`}
                style={{
                  backgroundColor: "#49479D",
                  width: "157px",
                  height: "51px",
                }}
              >
                {studentType == 2
                  ? "Go For Next Student"
                  : "Go For Next Student"}
              </button>
            </div>
          )}
          {(!hidebutton || hidebutton == 2) && (
            <div className="flex gap-2">
              <CustomButton
                text={
                  // loading2 ? (
                  //   <div className="flex items-center justify-center gap-2">
                  //     <CircularProgress size={20} color="inherit" />
                  //     Cancel
                  //   </div>
                  // ) : (
                  "Cancel"
                  // )
                }
                disable={loading}
                width="157px"
                height="51px"
                onClick={() => {
                  Swal.fire({
                    title: "Are You Sure You Want to Cancel Your Order?",
                    text: "Your selected slots are not saved and may become unavailable. If you exit now, your order will not be completed.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#5553B5",
                    cancelButtonColor: "#8F3D96",
                    confirmButtonText: "Cancel Anyway",
                    cancelButtonText: "Go Back",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      Object.keys(localStorage).forEach((key) => {
                        if (
                          key !== "userdata" &&
                          key !== "token" &&
                          key !== "BranchId"
                        ) {
                          localStorage.removeItem(key);
                        }
                      });
                      navigate("/dashboard");
                    }
                  });
                }}
              />
              <CustomButton
                text={
                  loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <CircularProgress size={20} color="inherit" />
                      Processing...
                    </div>
                  ) : (
                    "Pay Now"
                  )
                }
                disable={loading}
                width="157px"
                height="51px"
                // onClick={(e)=>handleCheckout(e)}
                onClick={createOrder}
              />

              {/* <button onClick={createOrder} >Demo</button> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

function PaymentOption({ label, image, selected, onClick }) {
  return (
    <div
      className="flex items-center justify-between bg-[#FFFFFF] p-3 rounded-lg shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <img src={image} alt={label} className="h-6  w-auto object-cover" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 ${
          selected ? "border-[#D9D9D9]" : "border-gray-300"
        } flex items-center justify-center`}
      >
        {selected ? (
          <div className="w-2.5 h-2.5 bg-[#49479D] rounded-full" />
        ) : (
          <div className="w-2.5 h-2.5 bg-[#E3E3E3] rounded-full" />
        )}
      </div>
    </div>
  );
}

const PaymentPopup = ({ open, onClose, onSelect }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 4,
          backgroundColor: "#fff",
          borderRadius: 2,
          width: 350,
          mx: "auto",
          mt: "20vh",
          textAlign: "center",
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Select Payment Status
        </Typography>

        <Button
          variant="contained"
          color="success"
          onClick={() => onSelect("success")}
          sx={{ mt: 2, mr: 1 }}
        >
          Success
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => onSelect("failed")}
          sx={{ mt: 2 }}
        >
          Failed
        </Button>
      </Box>
    </Modal>
  );
};
