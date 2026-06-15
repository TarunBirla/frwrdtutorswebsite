import React, { useEffect, useState } from "react";
import Header from "../../utils/header/Header";
import Sidebar from "../../utils/sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import SuccessPopup from "../../utils/SuccessPopup";
import Select from "react-select";
import CustomActionPopup from "../../utils/CustomActionPopup";
import CustomNotification from "../../utils/CustomNotification";
import http from "../../service/http";
import { toast } from "react-toastify";
const actions = [
  {
    label: "Yes - Group study",
    subtitle: "(both siblings together)",
    value: "yes",
    variant: "primary",
  },
  {
    label: "No - Individual study",
    subtitle: "(separate tutors or timings)",
    value: "no",
    variant: "secondary",
  },
];

const actions2 = [
  {
    label: "Student 1",
    value: 1,
  },
  {
    label: "Student 2",
    value: 2,
  },
];

const programOptionsone = [
  { id: "1", value: "primary", label: "Primary Years (1–6)" },
  { id: "2", value: "middle", label: "Middle Years (7–9)" },
  { id: "3", value: "senior", label: "Senior Years (10–11)" },
  { id: "4", value: "advanced", label: "Advanced Years (12–13)" },
];

const programOptions = [
  { id: "1", value: "Year 1 / Grade 0", label: "Year 1" },
  { id: "1", value: "Year 2 / Grade 1", label: "Year 2" },
  { id: "1", value: "Year 3 / Grade 2", label: "Year 3" },
  { id: "1", value: "Year 4 / Grade 3", label: "Year 4" },
  { id: "1", value: "Year 5 / Grade 4", label: "Year 5" },
  { id: "1", value: "Year 6 / Grade 5", label: "Year 6" },
  { id: "2", value: "Year 7 / Grade 6", label: "Year 7" },
  { id: "2", value: "Year 8 / Grade 7", label: "Year 8" },
  { id: "2", value: "Year 9 / Grade 8", label: "Year 9" },
  { id: "3", value: "Year 10 / Grade 9", label: "Year 10" },
  { id: "3", value: "Year 11 / Grade 10", label: "Year 11" },
  { id: "4", value: "Year 12 / Grade 11", label: "Year 12" },
  { id: "4", value: "Year 13 / Grade 12", label: "Year 13" },
];

const NewBooking = () => {
  const [status, setStatus] = useState("");
  const fetchAppointments = async () => {
    try {
      const raw = localStorage.getItem("userdata");
      const userData = raw ? JSON.parse(raw) : null;

      if (userData?.clientid) {
        const url = `/clientsdata/${userData?.clientid}`;

        const response = await http.get(url);

        const appointments = response?.data?.status;

        console.log(appointments);
        setStatus(appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // navigate("/new-booking");
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, []);

  let userData = null;
  let studentList = [];

  try {
    const raw = localStorage.getItem("userdata");
    userData = raw ? JSON.parse(raw) : null;

    if (userData?.studentdetails) {
      studentList = userData.studentdetails; // already a JS array
    }

    console.log("Student list:", studentList);
  } catch (error) {
    console.error("Error parsing userdata:", error);
  }

  const studentNameOptions = studentList.map((student) => ({
    value: `${student.first_name} ${student.last_name}`,
    label: `${student.first_name} ${student.last_name}`,
  }));

  const [show, setShow] = useState(false);
  const [disabled, setDisbaled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showStudentPopup, setShowStudentPopup] = useState(false);

  const [studyType, setStudyType] = useState(null);
  const [studentType, setStudentType] = useState(null); // "yes" or "no"
  // "yes" or "no"
  const navigate = useNavigate();

  const savedData = JSON.parse(localStorage.getItem("packageFormData")) || {};

  // const [formData, setFormData] = useState({
  //   location: savedData.location || "Dubai JLT",
  //   students: savedData.students || "",
  //   name1: savedData.name1 || "",
  //   name2: savedData.name2 || "",
  //   program: savedData.program || "",
  //   subject: savedData.subject || [],
  //   student1: savedData.student1 || { name: "", program: "", subject: [] },
  //   student2: savedData.student2 || { name: "", program: "", subject: [] },
  // });

  const [formData, setFormData] = useState({
    branch: "face_to_face" || "",
    students: savedData.students || "",
    name1: savedData.name1 || "",
    name2: savedData.name2 || "",
    programOne: savedData.programOne || "", // new
    program: savedData.program || "", // new
    subject: savedData.subject || [],
    student1: savedData.student1 || {
      name: "",
      programOne: "",
      program: "",
      subject: [],
    },
    student2: savedData.student2 || {
      name: "",
      programOne: "",
      program: "",
      subject: [],
    },
  });

  const filteredProgramTwoOptions = programOptions.filter(
    (opt) => opt.id.toString() === formData.programOne.toString(),
  );

  const filteredProgramTwoOptionsStudent1 = programOptions.filter(
    (opt) => opt.id === formData.student1.programOne,
  );

  const filteredProgramTwoOptionsStudent2 = programOptions.filter(
    (opt) => opt.id === formData.student2.programOne,
  );

  // const handleProgramOneChange = (selected, studentKey = null) => {
  //   console.log("indu", selected, studentKey);
  //   if (studentKey) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [studentKey]: {
  //         ...prev[studentKey],
  //         programOne: selected?.id || "",
  //         program: "",
  //       },
  //     }));
  //     console.log("indu1", formData);
  //   } else {
  //     setFormData((prev) => ({
  //       ...prev,
  //       programOne: selected?.id || "",
  //       program: "",
  //     }));
  //   }
  // };

  // const handleProgramOneChange = (selected, studentKey = null) => {
  //   if (studentKey) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [studentKey]: {
  //         ...prev[studentKey],
  //         programOne: selected?.id || "",
  //         program: "", // ✅ Year reset
  //         subject: [], // ✅ Subject reset
  //       },
  //     }));
  //   } else {
  //     setFormData((prev) => ({
  //       ...prev,
  //       programOne: selected?.id || "",
  //       program: "", // ✅ Year reset
  //       subject: [], // ✅ Subject reset
  //     }));
  //   }
  // };

  const handleProgramOneChange = (selected, studentKey = null) => {
    setFormData((prev) => {
      const updated = studentKey
        ? {
            ...prev,
            [studentKey]: {
              ...prev[studentKey],
              programOne: selected?.id || "",
              program: "", // Year reset
              subject: [], // Subject reset
            },
          }
        : {
            ...prev,
            programOne: selected?.id || "",
            program: "", // Year reset
            subject: [], // Subject reset
          };

      // 🔥 REMOVE OLD YEAR FROM LOCALSTORAGE
      const saved = JSON.parse(localStorage.getItem("packageFormData")) || {};
      delete saved.program;
      delete saved?.[studentKey]?.program;
      localStorage.setItem("packageFormData", JSON.stringify(saved));

      return updated;
    });
  };

  //  const handleProgramTwoChange = (selected, studentKey = null) => {
  //   const value = selected ? selected.value : "";

  //   if (studentKey) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [studentKey]: {
  //         ...prev[studentKey],
  //         program: value,
  //       },
  //     }));
  //   } else {
  //     setFormData((prev) => ({
  //       ...prev,
  //       program: value,
  //     }));
  //   }
  // };

  const handleProgramTwoChange = (selected, studentKey = null) => {
    const value = selected ? selected.value : "";

    if (studentKey) {
      setFormData((prev) => ({
        ...prev,
        [studentKey]: {
          ...prev[studentKey],
          program: value,
          subject: [], // ✅ Year change → Subject reset
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        program: value,
        subject: [], // ✅
      }));
    }
  };

  console.log(formData.programOne);

  const validateForm = () => {
    if (!formData.branch) {
      toast.error("Branch selection is required");
      return false;
    }
    // Check common required fields one by one
    if (studyType !== "no" || !studyType || studyType === "yes") {
      // if (!formData.location) {
      //   toast.error("Location is required");
      //   return false;
      // }
      if (!formData.program) {
        toast.error("Program is required");
        return false;
      }
      if (!formData.students) {
        toast.error("Number of students is required");
        return false;
      }
      if (!formData.name1) {
        toast.error("Student Name is required");
        return false;
      }
      if ((formData.subject?.length || 0) === 0) {
        toast.error("Subject is required");
        return false;
      }
    }
    // Conditional checks
    if (studyType === "yes" && !formData.name2) {
      toast.error("2nd Student Name is required when study type is yes");
      return false;
    }

    if (studyType === "no") {
      if (!formData.student1.name) {
        toast.error("Student1 name is required");
        return false;
      }
      if (!formData.student1.program) {
        toast.error("Student1 program is required");
        return false;
      }
      if ((formData.student1.subject?.length || 0) === 0) {
        toast.error("Student1 subject is required");
        return false;
      }
      if (!formData.student2.name) {
        toast.error("Student2 name is required");
        return false;
      }
      if (!formData.student2.program) {
        toast.error("Student2 program is required");
        return false;
      }
      if ((formData.student2.subject?.length || 0) === 0) {
        toast.error("Student2 subject is required");
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    localStorage.setItem("packageFormData", JSON.stringify(formData));
  }, [formData]);

  const [showTextField, setShowTextField] = useState(false);
  const [showTextField1, setShowTextField1] = useState(false);
  const [showTextField2, setShowTextField2] = useState(false);
  const [showTextField3, setShowTextField3] = useState(false);
  const [showTextField4, setShowTextField4] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const branchid = localStorage.getItem("BranchId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await http.get(
          `/locationalldata?branch_id=${branchid}`,
        );
        console.log("Fetched data:", response.data);

        const formatted = response.data.map((item) => ({
          value: item.id,
          label: `${item.town}`,
        }));
        setLocationOptions(formatted);
      } catch (err) {
        console.error("Error fetching location data:", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (input, actionMeta, studentKey = null) => {
    const isIndividual = studyType === "no" && studentKey;

    if (isIndividual) {
      if (actionMeta?.name === "subject") {
        const selected = input.map((opt) => opt.value);
        // if (selected.length > 2) {
        //   alert("Max 2 subjects");
        //   return;
        // }
        setFormData((prev) => ({
          ...prev,
          [studentKey]: {
            ...prev[studentKey],
            subject: selected,
          },
        }));
      } else if (actionMeta?.name) {
        setFormData((prev) => ({
          ...prev,
          [studentKey]: {
            ...prev[studentKey],
            [actionMeta.name]: input ? input.value : "",
          },
        }));
      } else {
        const { name, value } = input.target;
        setFormData((prev) => ({
          ...prev,
          [studentKey]: {
            ...prev[studentKey],
            [name]: value,
          },
        }));
      }
    } else {
      if (actionMeta?.name === "subject") {
        const selected = input.map((opt) => opt.value);
        // if (selected.length > 3) {
        //   alert("Max 3 subjects");
        //   return;
        // }
        setFormData((prev) => ({ ...prev, subject: selected }));
      } else if (actionMeta?.name) {
        setFormData((prev) => ({
          ...prev,
          [actionMeta.name]: input ? input.value : "", // ✅
        }));
      } else {
        const { name, value } = input.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  useEffect(() => {
    const students = parseInt(formData.students);
    const subjectLength = formData.subject?.length || 0;
    const s1Len = formData.student1?.subject?.length || 0;
    const s2Len = formData.student2?.subject?.length || 0;

    if (students === 2 && subjectLength != 4 && !hasShownPopup) {
      setShowPopup(true);
      setHasShownPopup(true);
      setDisbaled(false);
    }

    if (
      (students === 1 && subjectLength === 4) ||
      (students === 2 &&
        ((studyType === "no" && s1Len === 4) ||
          s2Len === 4 ||
          subjectLength === 4)) ||
      students >= 3
    ) {
      setShow(true);
      setDisbaled(true);
    } else {
      setShow(false); // reset if < 3
      setDisbaled(false);
    }

    // Optional: reset popup if user switches away from 2
    if (students !== 2) {
      setHasShownPopup(false);
    }
  }, [
    formData.students,
    formData.subject,
    formData.student1?.subject,
    formData.student2?.subject,
    studyType,
  ]);

  const buildStudentPayload = () => {
    const students = [];
    const paying_client = userData.clientid;

    // Helper: Check if student already exists
    const isExistingStudent = (name) => {
      if (!name) return false;
      const [first_name, ...rest] = name.trim().split(" ");
      const last_name = rest.join(" ");

      return userData?.studentdetails?.some(
        (s) =>
          s.first_name?.toLowerCase() === first_name.toLowerCase() &&
          s.last_name?.toLowerCase() === last_name.toLowerCase(),
      );
    };

    const addStudent = (name) => {
      if (!name) return;
      const [first_name, ...rest] = name.trim().split(" ");
      const last_name = rest.join(" ");

      // ✅ Skip adding if student already exists
      if (isExistingStudent(name)) {
        return;
      }

      if (!first_name || !last_name) {
        toast.error("Please provide both first and last names for all new students.");
        throw new Error("Missing required fields");
      }

      students.push({ first_name, last_name, paying_client });
    };

    if (studyType === "yes") {
      addStudent(formData.name1);
      addStudent(formData.name2);
    } else if (studyType === "no") {
      addStudent(formData.student1?.name);
      addStudent(formData.student2?.name);
    } else if (studyType === null) {
      addStudent(formData.name1);
    }

    return students;
  };

  const [runapi, setRunapi] = useState(0);
  const handleNext = async () => {
    localStorage.removeItem("packageFormData");

    const isValid = validateForm();
    if (!isValid) return;

    const students = buildStudentPayload();
    if (students && students.length > 0) {
      try {
        const response = await http.post(
          `/students?branch_id=${branchid}`,
          students,
        );
        console.log("Students submitted successfully:", response.data);

        // alert("Students submitted successfully!");
        // alert("Students submitted successfully!");
        const response2 = await http.get(`/clientsdata/${userData.clientid}`);
        const data = await response2.data;
        console.log("data:-", data.client);
        // // Update localStorage with user data
        if (data && data.client) {
          localStorage.setItem("userdata", JSON.stringify(data.client));
        }
      } catch (error) {
        console.error("Failed to submit students:", error);

        // toast.error(err.response?.data?.message || "Failed to create student", {
        //   position: "top-right",
        //   autoClose: 3000,
        // });
      }
    }

    console.log("Form Data:", { ...formData, studyType });
    const fullData = { ...formData, studyType };
    localStorage.setItem("packageFormData", JSON.stringify(fullData));
    if (formData.students == 2 && studyType === "no") {
      setShowStudentPopup(true);
    } else {
      navigate("/manage-packages");
    }
  };

  useEffect(() => {
    if (formData.students == 2 && studyType === "no") {
      setFormData((prev) => ({
        ...prev,
        name1: "",
        name2: "",
        subject: [],
      }));
    }
  }, [formData.students, studyType]);

  const handleSelect = (value) => {
    setStudyType(value);
    setShowPopup(false);
  };
  const handleStudentSelect = (value) => {
    console.log("valuestudent", value);

    setStudentType(value);
    localStorage.setItem("studentType", value);
    let value2 = 1;
    localStorage.setItem("hidebutton", value2);

    setShowStudentPopup(false);
    navigate("/manage-packages");
  };

  console.log("studentType", studentType);

  const studentOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "More than 2" },
  ];

  useEffect(() => {
    http
      .get(`/subjectsalldata?branch_id=${branchid}`)
      .then((res) => {
        const options = res.data
          .filter((subject) => {
            try {
              const levels = JSON.parse(subject.level_category);
              return (
                Array.isArray(levels) &&
                (levels.includes(Number(formData.programOne)) ||
                  levels.includes(Number(formData.student1.programOne)) ||
                  levels.includes(Number(formData.student2.programOne)))
              );
            } catch {
              return false;
            }
          })
          .map((subject) => ({
            value: subject.name,
            label: subject.name,
          }));

        setSubjectOptions(options); // ✅ always an array
      })
      .catch((err) => {
        console.error("Failed to fetch subjects:", err);
      });
  }, [
    formData.programOne,
    formData.student1.programOne,
    formData.student2.programOne,
  ]);

  useEffect(() => {
    const savedBranch = localStorage.getItem("branch");
    if (savedBranch) {
      setFormData((prev) => ({
        ...prev,
        branch: savedBranch,
      }));
    } else {
      // ✅ If nothing saved, default to "face_to_face"
      localStorage.setItem("branch", "face_to_face");
    }
  }, []);

  // ✅ Handle radio change
  const handleBranchChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      branch: value,
    }));
    localStorage.setItem("branch", value);
  };

const resetStudents = () => {
  setShow(false);
  setDisbaled(false);
  setHasShownPopup(false);

  setFormData((prev) => ({
    ...prev,
    students: "",          // 👈 important
    subject: [],
    name1: "",
    name2: "",
    student1: { name: "", programOne: "", program: "", subject: [] },
    student2: { name: "", programOne: "", program: "", subject: [] },
  }));
};

useEffect(() => {
  if (formData.students === "1") {
    setStudyType(null);
  }
}, [formData.students]);


  // re-run when programOne changes

  return (
    <div
      className="relative min-h-screen bg-[#EEEDFE] font-sans overflow-x-hidden"
      style={{
        backgroundImage: "url('/Background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#EEEDFE", // ya koi fallback color
      }}
    >
      <Header
        title="New Booking"
        // leftIconOne="☰"
        // onLeftOneClick={() => setIsMenuOpen(true)}
        leftIconTwo="←"
        onLeftTwoClick={() => {
          Object.keys(localStorage).forEach((key) => {
            if (key !== "userdata" && key !== "token" && key !== "BranchId") {
              localStorage.removeItem(key);
            }
          });
          navigate("/dashboard");
        }}
        // notification="/notification.png"
        // notificationClick={() => alert("Notification clicked")}
      />

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {show && (
        <div className="fixed w-full p-4 top-14 left-1/2 transform -translate-x-1/2 z-50">
          <CustomNotification
            message="You cannot select more than 2 students for more details contact our customer  support."
             onClose={resetStudents}
          />
        </div>
      )}
      {/* Form */}
      <div className="pt-20 px-4 max-w-md mx-auto pb-10 z-10 relative">
        <div className="bg-white p-4 rounded-2xl shadow-md">
          {/* Location */}

          <div className="flex gap-6 mb-4 items-center">
            <label className="flex items-center gap-2 text-[14px] font-medium cursor-pointer">
              <input
                type="radio"
                name="branch"
                value="online"
                checked={formData.branch === "online"}
                onChange={handleBranchChange}
                className="accent-[#49479D] w-4 h-4 cursor-pointer"
              />
              <span>Online</span>
            </label>

            <label className="flex items-center gap-2 text-[14px] font-medium cursor-pointer">
              <input
                type="radio"
                name="branch"
                value="face_to_face"
                checked={formData.branch === "face_to_face"}
                onChange={handleBranchChange}
                className="accent-[#49479D] w-4 h-4 cursor-pointer"
              />
              <span>Face to Face (Branch)</span>
            </label>
          </div>

          {/* Students */}
          <label className="block mb-1 text-[16px] text-[#434343] font-medium">
            Number of Students
          </label>
          <Select
          key={formData.students || "reset"}
            name="students"
            required
            options={studentOptions}
            // value={studentOptions.find(
            //   (opt) => opt.value === formData.students
            // )}
            // onChange={handleChange}
            value={
              studentOptions.find((opt) => opt.value === formData.students)
              // ||
              // studentOptions.find(
              //   (opt) => opt.value === String(userData?.numberofstudent)
              // )
            } // 👈 just for show
            // onChange={(selectedOption) =>
            //   setFormData((prev) => ({
            //     ...prev,
            //     students: selectedOption ? selectedOption.value : "",
            //   }))
            // }

            onChange={(selectedOption) => {
  const value = selectedOption ? selectedOption.value : "";

  setFormData((prev) => ({
    ...prev,
    students: value,
    subject: [],
    name1: "",
    name2: "",
    student1: { name: "", programOne: "", program: "", subject: [] },
    student2: { name: "", programOne: "", program: "", subject: [] },
  }));

  // ✅ IMPORTANT RESET
  if (value === "1") {
    setStudyType(null);
    setShowPopup(false);
    setShowStudentPopup(false);
    setHasShownPopup(false);
    setShow(false);
    setDisbaled(false);
  }
}}

            className="mb-4 text-sm font-medium"
            styles={{
              control: (provided) => ({
                ...provided,
                borderRadius: 6,
                borderColor: "#CCCCCC",
                paddingTop: 2,
                paddingBottom: 2,
                boxShadow: "none",
                fontSize: "14px",
              }),
            }}
            components={{
              IndicatorSeparator: () => null, // 🚀 Removes vertical line
            }}
            placeholder="Select Student"
            isClearable
          />

          {!studyType && (
            <>
              {studentNameOptions.length > 0 && !showTextField ? (
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                      Student Full Name
                    </label>
                    <Select
                      name="name1"
                      required
                      options={studentNameOptions}
                      value={studentNameOptions.find(
                        (opt) => opt.value === formData.name1,
                      )}
                      onChange={handleChange}
                      className="mb-4 text-sm font-medium text-[#434343]"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          borderRadius: 6,
                          borderColor: "#CCCCCC",
                          paddingTop: 2,
                          paddingBottom: 2,
                          boxShadow: "none",
                          fontSize: "14px",
                        }),
                      }}
                      components={{
                        IndicatorSeparator: () => null, // 🚀 Removes vertical line
                      }}
                      placeholder="Select Name"
                      isClearable
                    />
                  </div>

                  {!showTextField &&
                    // userData.numberofstudent >
                    //   userData.studentdetails.length
                    userData.studentdetails.length < 2 && (
                      <AddButton onClick={() => setShowTextField(true)} />
                    )}
                </div>
              ) : null}

              {/* Show input field only if: no options OR user clicked Add */}
              {studentNameOptions.length === 0 || showTextField ? (
                <div className="mb-2">
                  <label className="block mb-1 text-[16px] text-[#434343]  font-medium">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    name="name1"
                    required
                    value={formData.name1}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    className="w-full border border-[#CCCCCC] text-sm text-[#434343] font-medium rounded px-3 py-2"
                  />
                </div>
              ) : null}
            </>
          )}

          {/* Study Type === "yes" (Group) */}
          {studyType === "yes" && (
            <div className="">
              {studentNameOptions.length > 0 && !showTextField1 ? (
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                      1st Student Full Name
                    </label>
                    <Select
                      name="name1"
                      required
                      options={studentNameOptions}
                      value={studentNameOptions.find(
                        (opt) => opt.value === formData.name1,
                      )}
                      onChange={handleChange}
                      className="mb-4 text-sm font-medium text-[#434343]"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          borderRadius: 6,
                          borderColor: "#CCCCCC",
                          paddingTop: 2,
                          paddingBottom: 2,
                          boxShadow: "none",
                          fontSize: "14px",
                        }),
                      }}
                      components={{
                        IndicatorSeparator: () => null, // 🚀 Removes vertical line
                      }}
                      placeholder="Select Name"
                      isClearable
                    />
                  </div>

                  {!showTextField1 &&
                    // userData.numberofstudent >
                    //   userData.studentdetails.length
                    userData.studentdetails.length < 2 && (
                      <AddButton onClick={() => setShowTextField1(true)} />
                    )}
                </div>
              ) : null}

              {/* Show input field only if: no options OR user clicked Add */}
              {studentNameOptions.length === 0 || showTextField1 ? (
                <div className="mb-2">
                  <label className="block mb-1 text-[16px] text-[#434343]  font-medium">
                    1st Student Full Name
                  </label>
                  <input
                    type="text"
                    name="name1"
                    required
                    value={formData.name1}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    className="w-full border border-[#CCCCCC] text-sm text-[#434343] font-medium rounded px-3 py-2"
                  />
                </div>
              ) : null}

              {formData.students === "2" && (
                <>
                  {studentNameOptions.length > 0 && !showTextField2 ? (
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                          2nd Student Full Name
                        </label>
                        <Select
                          name="name2"
                          required
                          options={studentNameOptions.filter(
                            (opt) => opt.value !== formData.name1,
                          )}
                          value={studentNameOptions.find(
                            (opt) => opt.value === formData.name2,
                          )}
                          onChange={handleChange}
                          className="mb-4 text-sm font-medium text-[#434343]"
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              borderRadius: 6,
                              borderColor: "#CCCCCC",
                              paddingTop: 2,
                              paddingBottom: 2,
                              boxShadow: "none",
                              fontSize: "14px",
                            }),
                          }}
                          components={{
                            IndicatorSeparator: () => null, // 🚀 Removes vertical line
                          }}
                          placeholder="Select Name"
                          isClearable
                        />
                      </div>

                      {!showTextField2 &&
                        // userData.numberofstudent >
                        //   userData.studentdetails.length
                        userData.studentdetails.length < 2 && (
                          <AddButton onClick={() => setShowTextField2(true)} />
                        )}
                    </div>
                  ) : null}

                  {/* Show input field only if: no options OR user clicked Add */}
                  {studentNameOptions.length === 0 || showTextField2 ? (
                    <div className="mb-2">
                      <label className="block mb-1 text-[16px] text-[#434343]  font-medium">
                        2nd Student Full Name
                      </label>
                      <input
                        type="text"
                        name="name2"
                        required
                        value={formData.name2}
                        onChange={handleChange}
                        placeholder="Enter student name"
                        className="w-full border border-[#CCCCCC] text-sm text-[#434343] font-medium rounded px-3 py-2"
                      />
                    </div>
                  ) : null}
                </>
              )}

              <div className="mb-2 ">
                {/* <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                  Select Program
                </label>
                <Select
                  name="program"
                  required
                  options={programOptions}
                  value={programOptions.find(
                    (o) => o.value === formData.program
                  )}
                  onChange={(selected) => {
                    handleChange({
                      target: { name: "program", value: selected.value },
                    });

                    // Reset subject when program changes
                    handleChange({
                      target: { name: "subject", value: [] },
                    });
                  }}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      borderRadius: 6,
                      borderColor: "#CCCCCC",
                      paddingTop: 2,
                      paddingBottom: 2,
                      boxShadow: "none",
                      fontSize: "14px",
                    }),
                  }}
                  components={{
                    IndicatorSeparator: () => null, // 🚀 Removes vertical line
                  }}
                  placeholder="Select Program"
                  isClearable
                /> */}

                <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                  Select Program
                </label>
                <Select
                  options={programOptionsone}
                  value={programOptionsone.find(
                    (opt) =>
                      opt.id.toString() === formData.programOne.toString(),
                  )}
                  onChange={(selected) => handleProgramOneChange(selected)}
                  placeholder="Select Program"
                  components={{
                    IndicatorSeparator: () => null, // 🚀 Removes vertical line
                  }}
                  isClearable
                />

                <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                  Select Year
                </label>
                <Select
                  key={formData.programOne}
                  options={filteredProgramTwoOptions}
                  value={
                    filteredProgramTwoOptions.find(
                      (opt) => opt.value === formData.program,
                    ) || null // ✅ THIS IS THE MAIN FIX
                  }
                  onChange={(selected) => handleProgramTwoChange(selected)}
                  placeholder="Select Year"
                  isDisabled={
                    !formData.programOne ||
                    filteredProgramTwoOptions.length === 0
                  }
                  components={{
                    IndicatorSeparator: () => null, // 🚀 Removes vertical line
                  }}
                  isClearable
                />
              </div>

              <div>
                <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                  Select Subject
                </label>
                <Select
                  name="subject"
                  isMulti
                  required
                  options={subjectOptions}
                  value={subjectOptions.filter((opt) =>
                    formData.subject.includes(opt.value),
                  )}
                  className="text-[14px] font-medium text-[#434343]"
                  onChange={(selectedOptions) =>
                    handleChange({
                      target: {
                        name: "subject",
                        value: selectedOptions.map((opt) => opt.value),
                      },
                    })
                  }
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      borderRadius: 6,
                      borderColor: "#CCCCCC",
                      paddingTop: 2,
                      paddingBottom: 2,
                      boxShadow: "none",
                      fontSize: "14px",
                    }),
                  }}
                  components={{
                    IndicatorSeparator: () => null, // 🚀 Removes vertical line
                  }}
                  placeholder="Select Subject"
                  isClearable
                />
              </div>
            </div>
          )}

          {/* Study Type === "no" (Individual) */}
          {studyType === "no" && (
            <div className="space-y-4">
              <div className="bg-[#62BED6]/20 text-base font-medium text-[#434343] px-3 py-1 mt-4">
                Student 1
              </div>

              {studentNameOptions.length > 0 && !showTextField3 ? (
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                      Student Full Name
                    </label>
                    <Select
                      name="name"
                      required
                      options={studentNameOptions}
                      value={studentNameOptions.find(
                        (opt) => opt.value === formData.student1.name,
                      )}
                      onChange={(val, meta) =>
                        handleChange(val, meta, "student1")
                      }
                      className=" text-sm font-medium text-[#434343]"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          borderRadius: 6,
                          borderColor: "#CCCCCC",
                          paddingTop: 2,
                          paddingBottom: 2,
                          boxShadow: "none",
                          fontSize: "14px",
                        }),
                      }}
                      components={{
                        IndicatorSeparator: () => null,
                      }}
                      placeholder="Select Name"
                      isClearable
                    />
                  </div>

                  {!showTextField3 && userData.studentdetails.length < 2 && (
                    <AddButton onClick={() => setShowTextField3(true)} />
                  )}
                </div>
              ) : null}

              {studentNameOptions.length === 0 || showTextField3 ? (
                <div className="">
                  <label className="block mb-1 text-[16px] text-[#434343]  font-medium">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.student1.name}
                    onChange={(e) => handleChange(e, null, "student1")}
                    placeholder="Enter student name"
                    className="w-full border border-[#CCCCCC] text-sm text-[#434343] font-medium rounded px-3 py-2"
                  />
                </div>
              ) : null}

              <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                Select Program
              </label>
              <Select
                options={programOptionsone}
                value={programOptionsone.find(
                  (opt) =>
                    opt.id.toString() ===
                    formData.student1.programOne.toString(),
                )}
                onChange={(selected) =>
                  handleProgramOneChange(selected, "student1")
                }
                placeholder="Select Program"
                components={{
                  IndicatorSeparator: () => null,
                }}
                isClearable
              />

              <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                Select Year
              </label>
              {/* <Select
                options={filteredProgramTwoOptions}
                value={filteredProgramTwoOptions.find(
                  (opt) =>
                    opt.value.toString() ===
                    formData.student1.program.toString()
                )}
                onChange={(selected) =>
                  handleProgramTwoChange(selected, "student1")
                }
                placeholder="Select Year"
                isDisabled={
                  !formData.student1.programOne
                   ||
                  filteredProgramTwoOptions.length === 0
                }
                components={{
                  IndicatorSeparator: () => null, 
                }}
                isClearable
              /> */}

              <Select
                key={formData.student1.programOne}
                options={filteredProgramTwoOptionsStudent1}
                value={
                  filteredProgramTwoOptionsStudent1.find(
                    (opt) => opt.value === formData.student1.program,
                  ) || null
                }
                onChange={(selected) =>
                  handleProgramTwoChange(selected, "student1")
                }
                isDisabled={!formData.student1.programOne}
                isClearable
              />

              <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                Select Subject
              </label>
              <Select
                name="subject"
                isMulti
                required
                options={subjectOptions}
                value={subjectOptions.filter((opt) =>
                  formData.student1.subject.includes(opt.value),
                )}
                onChange={(val, meta) => handleChange(val, meta, "student1")}
                components={{
                  IndicatorSeparator: () => null,
                }}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderRadius: 6,
                    borderColor: "#CCCCCC",
                    paddingTop: 2,
                    paddingBottom: 2,
                    boxShadow: "none",
                    fontSize: "14px",
                  }),
                }}
                placeholder="Select Subject"
                isClearable
              />

              {formData.students === "2" && (
                <div className="space-y-4">
                  <div className="bg-[#62BED6]/20 text-base font-medium text-[#434343] px-3 py-1 mt-4">
                    Student 2
                  </div>

                  {studentNameOptions.length > 0 && !showTextField4 ? (
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                          Student Full Name
                        </label>
                        <Select
                          name="name"
                          required
                          options={studentNameOptions.filter(
                            (opt) => opt.value !== formData.student1.name,
                          )}
                          value={studentNameOptions.find(
                            (opt) => opt.value === formData.student2.name,
                          )}
                          onChange={(val, meta) =>
                            handleChange(val, meta, "student2")
                          }
                          className=" text-sm font-medium text-[#434343]"
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              borderRadius: 6,
                              borderColor: "#CCCCCC",
                              paddingTop: 2,
                              paddingBottom: 2,
                              boxShadow: "none",
                              fontSize: "14px",
                            }),
                          }}
                          components={{
                            IndicatorSeparator: () => null,
                          }}
                          placeholder="Select Name"
                          isClearable
                        />
                      </div>

                      {!showTextField4 &&
                        userData.studentdetails.length < 2 && (
                          <AddButton onClick={() => setShowTextField4(true)} />
                        )}
                    </div>
                  ) : null}

                  {studentNameOptions.length === 0 || showTextField4 ? (
                    <div className="">
                      <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                        Student Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.student2.name}
                        onChange={(e) => handleChange(e, null, "student2")}
                        placeholder="Enter student name"
                        className="w-full border border-[#CCCCCC] text-sm text-[#434343] font-medium rounded px-3 py-2"
                      />
                    </div>
                  ) : null}

                  <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                    Select Program
                  </label>
                  <Select
                    options={programOptionsone}
                    value={programOptionsone.find(
                      (opt) =>
                        opt.id.toString() ===
                        formData.student2.programOne.toString(),
                    )}
                    onChange={(selected) =>
                      handleProgramOneChange(selected, "student2")
                    }
                    placeholder="Select Program"
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    isClearable
                  />

                  <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                    Select Year
                  </label>
                  {/* <Select
                    options={filteredProgramTwoOptions}
                    value={filteredProgramTwoOptions.find(
                      (opt) =>
                        opt.value.toString() ===
                        formData.student2.program.toString()
                    )}
                    onChange={(selected) =>
                      handleProgramTwoChange(selected, "student1")
                    }
                    placeholder="Select Year"
                    isDisabled={
                      !formData.student2.programOne ||
                      filteredProgramTwoOptions.length === 0
                    }
                    components={{
                      IndicatorSeparator: () => null, 
                    }}
                    isClearable
                  /> */}

                  <Select
                    key={formData.student2.programOne}
                    options={filteredProgramTwoOptionsStudent2}
                    value={
                      filteredProgramTwoOptionsStudent2.find(
                        (opt) => opt.value === formData.student2.program,
                      ) || null
                    }
                    onChange={(selected) =>
                      handleProgramTwoChange(selected, "student2")
                    }
                    isDisabled={!formData.student2.programOne}
                    isClearable
                  />

                  <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                    Select Subject
                  </label>
                  <Select
                    name="subject"
                    isMulti
                    required
                    options={subjectOptions}
                    value={subjectOptions.filter((opt) =>
                      formData.student2.subject.includes(opt.value),
                    )}
                    onChange={(val, meta) =>
                      handleChange(val, meta, "student2")
                    }
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderRadius: 6,
                        borderColor: "#CCCCCC",
                        paddingTop: 2,
                        paddingBottom: 2,
                        boxShadow: "none",
                        fontSize: "14px",
                      }),
                    }}
                    placeholder="Select Subject"
                    isClearable
                  />
                </div>
              )}
            </div>
          )}

          {!studyType && (
            <>
              {/*<label className="block mb-1 mt-1 text-[16px] text-[#434343] font-medium">
                Select Program
              </label>
              <Select
                name="program"
                required
                options={programOptions}
                value={programOptions.find(
                  (opt) => opt.value === formData.program
                )}
                onChange={(selectedOption) => {
                  handleChange({
                    target: { name: "program", value: selectedOption.value },
                  });
                  // Reset subject when program changes
                  handleChange({ target: { name: "subject", value: [] } });
                }}
                className="mb-4 text-sm font-medium"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderRadius: 6,
                    borderColor: "#CCCCCC",
                    paddingTop: 2,
                    paddingBottom: 2,
                    boxShadow: "none",
                    fontSize: "14px",
                  }),
                }}
                components={{
                  IndicatorSeparator: () => null, // 🚀 Removes vertical line
                }}
                placeholder="Select Program"
                isClearable
              />*/}

              <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                Select Program
              </label>
              <Select
                options={programOptionsone}
                value={programOptionsone.find(
                  (opt) => opt.id.toString() === formData.programOne.toString(),
                )}
                onChange={(selected) => handleProgramOneChange(selected)}
                placeholder="Select Program"
                components={{
                  IndicatorSeparator: () => null, // 🚀 Removes vertical line
                }}
                isClearable
              />

              <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                Select Year
              </label>
              <Select
                key={formData.programOne}
                options={filteredProgramTwoOptions}
                value={
                  filteredProgramTwoOptions.find(
                    (opt) => opt.value === formData.program,
                  ) || null
                }
                onChange={(selected) => handleProgramTwoChange(selected)}
                placeholder="Select Year"
                isDisabled={
                  !formData.programOne || filteredProgramTwoOptions.length === 0
                }
                components={{
                  IndicatorSeparator: () => null, // 🚀 Removes vertical line
                }}
                isClearable
              />

              <label className="block mb-1 text-[16px] text-[#434343] font-medium">
                Select Subject
              </label>
              <Select
                name="subject"
                isMulti
                required
                options={subjectOptions}
                value={subjectOptions.filter((opt) =>
                  formData.subject.includes(opt.value),
                )}
                onChange={(selectedOptions) =>
                  handleChange({
                    target: {
                      name: "subject",
                      value: selectedOptions.map((opt) => opt.value),
                    },
                  })
                }
                className="mb-6 text-sm font-medium"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderRadius: 6,
                    borderColor: "#CCCCCC",
                    paddingTop: 2,
                    paddingBottom: 2,
                    boxShadow: "none",
                    fontSize: "14px",
                  }),
                }}
                components={{
                  IndicatorSeparator: () => null, // 🚀 Removes vertical line
                }}
                placeholder="Select Subject"
                isClearable
              />
            </>
          )}

          {/* Submit Button */}
          <div className="flex my-4 justify-end">
            <button
              onClick={handleNext}
              disabled={disabled}
              className="bg-[#49479D] text-white text-[22px] py-2 px-12 rounded-[6px] font-normal"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <CustomActionPopup
          title="Please select your preferred study type for further sessions:"
          actions={actions}
          onClose={() => setShowPopup(false)}
          onSelect={(value) => handleSelect(value)}
        />
      )}
      {showStudentPopup && (
        <CustomActionPopup
          title="Please select your preferred Student for future sessions:"
          actions={actions2}
          onClose={() => setShowStudentPopup(false)}
          onSelect={(value) => handleStudentSelect(value)}
        />
      )}
    </div>
  );
};

export default NewBooking;

const AddButton = ({ onClick, label = "Add", className = "", studyType }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 mt-3 ${
        studyType == "no" ? "mt-6" : ""
      } bg-[#49479D] text-white text-sm font-medium rounded ${className}`}
    >
      {label}
    </button>
  );
};
