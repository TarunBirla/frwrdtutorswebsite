// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Header from "../../utils/header/Header";
// import Sidebar from "../../utils/sidebar/Sidebar";
// import CustomNotification from "../../utils/CustomNotification";
// import http from "../../service/http";
// import Swal from "sweetalert2";
// import CircularProgress from "@mui/material/CircularProgress";
// import Box from "@mui/material/Box";
// import { toast } from "react-toastify";

// const RenewChangePackages = () => {
//   const [rawPackages, setrawPackages] = useState([]);
//   const [studentName, setStudentName] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [chooseStudentPopup, setChooseStudentPopup] = useState(false); // 🔥 popup state
//   const [loading, setLoading] = useState(true);
//   let userData = null;
//   const [show, setShow] = useState(false);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [expandedIndex, setExpandedIndex] = useState(null);
//   const [lessonCounts, setLessonCounts] = useState({});
//   const [packageNames, setPackageName] = useState(null);
//   const [packageData, setPackageData] = useState(null);
//   const navigate = useNavigate();

//   try {
//     const raw = localStorage.getItem("userdata");
//     userData = raw ? JSON.parse(raw) : null;
//   } catch (error) {
//     console.error("Error parsing userdata:", error);
//   }

//   const fetchClientData = async () => {
//     try {
//       setLoading(true);
//       const response = await http.get(`/client-packages/${userData.clientid}`);
//       const data = response.data;
//       if (Array.isArray(data.data)) {
//         data.data.forEach((pkg, index) => {
//           try {
//             const parsedPackageForm = JSON.parse(pkg.packageForm);
//             const { lessonData, packageFormData } = parsedPackageForm;
//             localStorage.setItem(`lessonData`, JSON.stringify(lessonData));
//             localStorage.setItem(
//               `packageFormData`,
//               JSON.stringify(packageFormData)
//             );
//           } catch (err) {}
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching client data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchClientData();
//   }, [userData.clientid]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const stored = localStorage.getItem("packageFormData");
//       if (!stored) return;
//       clearInterval(interval);
//       const storedData = JSON.parse(stored);
//       const students = parseInt(storedData?.students || 1);
//       let year = null;
//       if (storedData?.program) {
//         const match = storedData.program.match(/\d+/);
//         if (match) year = parseInt(match[0]);
//       }
//       if (!year && storedData?.programOne)
//         year = parseInt(storedData.programOne);
//       if (!year) return;
//       fetchPackages(students, year);
//     }, 500);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchPackages = async (students, year) => {
//     try {
//       setLoading(true);
//       const response = await http.get(
//         `/allpackegastudent?student=${1}&level=${year}`
//       );
//       const data = response.data?.data || [];
//       const matchedPackages = data.filter((pkg) => [2, 3, 4].includes(pkg.id));
//       setrawPackages(matchedPackages);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getYearFromProgram = (obj) => {
//     if (!obj) return null;

//     let year = null;

//     // Case 1: Program like "Year 8"
//     if (obj.program) {
//       const match = obj.program.match(/\d+/);
//       if (match) year = parseInt(match[0]);
//     }

//     // Case 2: programOne contains only number "8"
//     if (!year && obj.programOne) {
//       const num = parseInt(obj.programOne);
//       if (!isNaN(num)) year = num;
//     }

//     return year;
//   };
//   useEffect(() => {
//     try {
//       const storedData = localStorage.getItem("packageFormData");
//       if (storedData) setPackageData(JSON.parse(storedData));
//     } catch {}
//   }, []);

//   useEffect(() => {
//     const fetchAndLoad = async () => {
//       await fetchClientData();
//       const storedData = localStorage.getItem("packageFormData");
//       if (storedData) setPackageData(JSON.parse(storedData));
//     };
//     fetchAndLoad();
//   }, []);

//   useEffect(() => {
//     if (!packageData) return;
//     let name1 = null;
//     let name2 = null;

//     if (packageData.name1 && packageData.name1 !== "null")
//       name1 = packageData.name1;
//     if (packageData.name2 && packageData.name2 !== "null")
//       name2 = packageData.name2;

//     if (packageData.students === "1") {
//       name1 = packageData?.name1 || null;
//       name2 = null;
//     }
//     if (packageData.students === "2") {
//       name1 = packageData?.student1?.name || null;
//       name2 = packageData?.student2?.name || null;
//     }

//     setStudentName({ name1, name2 });
//   }, [packageData]);

//   const totalSubjects = packageData?.subject?.length;
//   const totalSubjects1 = packageData?.student1?.subject?.length;
//   const totalSubjects2 = packageData?.student2?.subject?.length;

//   const safeSubjects =
//     packageData?.studyType === "no" && packageData.subject?.length === 0
//       ? studentType == 1
//         ? packageData?.student1?.subject ?? []
//         : packageData?.student2?.subject ?? []
//       : packageData?.subject || [];

//   let filteredPackages = rawPackages;

//   if (packageData?.studyType === "no") {
//     if (totalSubjects1 === 2 && totalSubjects2 === 2) {
//       filteredPackages = rawPackages.filter((pkg) =>
//         ["GOLD", "PLATINUM"].includes(pkg.name?.toUpperCase())
//       );
//     } else if (totalSubjects1 === 3 && totalSubjects2 === 3) {
//       filteredPackages = rawPackages.filter(
//         (pkg) => pkg.name?.toUpperCase() === "PLATINUM"
//       );
//     }
//   } else if (packageData?.studyType === "yes") {
//     if (packageData?.name1 && packageData?.name2 && totalSubjects === 2) {
//       filteredPackages = rawPackages.filter((pkg) =>
//         ["GOLD", "PLATINUM"].includes(pkg.name?.toUpperCase())
//       );
//     } else if (
//       packageData?.name1 &&
//       packageData?.name2 &&
//       totalSubjects === 3
//     ) {
//       filteredPackages = rawPackages.filter(
//         (pkg) => pkg.name?.toUpperCase() === "PLATINUM"
//       );
//     } else if (packageData?.name1 && totalSubjects === 3) {
//       filteredPackages = rawPackages.filter((pkg) =>
//         ["GOLD", "PLATINUM"].includes(pkg.name?.toUpperCase())
//       );
//     }
//   }

//   filteredPackages = filteredPackages.map((pkg) => ({
//     ...pkg,
//     lessons: `${pkg.numberofclass} ${pkg.types}`,
//     lession2: `${pkg.offers ? `(${pkg.offers})` : ""}`,
//     price: pkg.total,
//     subjects: safeSubjects,
//   }));

//   const options = [1, 2, 3, 4, 5].map((num) => ({
//     value: num,
//     label: `${num}`,
//   }));

//   const customStyles = {
//     control: (base) => ({
//       ...base,
//       borderRadius: "6px",
//       fontSize: "14px",
//     }),
//   };

//   useEffect(() => {
//     if (studentName?.name1 && studentName?.name2 && !selectedStudent) {
//       setChooseStudentPopup(true);
//     }
//   }, [studentName, selectedStudent]);

//   const hasAutoOpened = useRef(false);

//   useEffect(() => {
//     if (hasAutoOpened.current) return;
//     const lessonsDataString = localStorage.getItem("lessonData");
//     const formDataString = localStorage.getItem("packageFormData") || "{}";
//     if (!lessonsDataString) return;

//     try {
//       const lessonsData = JSON.parse(lessonsDataString);
//       const formData = JSON.parse(formDataString);
//       let fixedSubjects = lessonsData.packageNames?.subjects || [];

//       if (
//         (!fixedSubjects || fixedSubjects.length === 0) &&
//         lessonsData.lessonCounts
//       ) {
//         fixedSubjects = Object.keys(lessonsData.lessonCounts);
//       }
//       if (
//         (!fixedSubjects || fixedSubjects.length === 0) &&
//         Array.isArray(formData.subject)
//       ) {
//         fixedSubjects = formData.subject;
//       }

//       fixedSubjects = [...new Set((fixedSubjects || []).filter(Boolean))];

//       const updatedPackageNames = {
//         ...(lessonsData.packageNames || {}),
//         subjects: fixedSubjects,
//       };

//       const updatedLessonsData = {
//         ...lessonsData,
//         packageNames: updatedPackageNames,
//         packageName: updatedPackageNames.name || lessonsData.packageName,
//       };

//       localStorage.setItem("lessonData", JSON.stringify(updatedLessonsData));
//       setPackageName(updatedPackageNames);
//       setLessonCounts(updatedLessonsData.lessonCounts);

//       if (!rawPackages || rawPackages.length === 0) return;
//       const selectedPackageId = updatedPackageNames.id;
//       const selectedPackageName = updatedPackageNames.name;

//       let matchedIndex = -1;
//       if (selectedPackageId)
//         matchedIndex = rawPackages.findIndex(
//           (pkg) => pkg.id === selectedPackageId
//         );
//       if (matchedIndex === -1 && selectedPackageName)
//         matchedIndex = rawPackages.findIndex(
//           (pkg) =>
//             pkg.name?.trim().toUpperCase() ===
//             selectedPackageName?.trim().toUpperCase()
//         );

//       if (matchedIndex !== -1) {
//         setExpandedIndex(matchedIndex);
//         hasAutoOpened.current = true;
//       }
//     } catch {}
//   }, [rawPackages]);

//   // 🔥 UPDATED — popup before expanding package if 2 students
//   const handlePackageClick = (index, pkg) => {
//     const isCollapsing = index === expandedIndex;

//     if (!isCollapsing) {
//       Swal.fire({
//         title: "Are You Sure You Want to Renew Your Package?",
//         text: "You still have classes remaining in your current package. Do you still want to proceed with the renewal?",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonColor: "#5553B5",
//         cancelButtonColor: "#8F3D96",
//         confirmButtonText: "Yes, Proceed",
//         cancelButtonText: "No, Cancel",
//       }).then((result) => {
//         if (result.isConfirmed) {
//           setExpandedIndex(index);
//           setPackageName(pkg);

//           // 🔥 NEW — Show popup if 2 students
//           if (studentName.name1 && studentName.name2) {
//             setChooseStudentPopup(true);
//           }
//         }
//       });
//     } else {
//       setExpandedIndex(null);
//       setPackageName(null);
//     }
//   };

//   return (
//     <div
//       className="bg-[#EEEDFE] min-h-screen overflow-x-hidden"
//       style={{
//         backgroundImage: "url('/Background.png')",
//         backgroundRepeat: "no-repeat",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundColor: "#EEEDFE",
//       }}
//     >
//       <Header
//         title="Renew Package"
//         leftIconTwo="←"
//         onLeftTwoClick={() => {
//           Object.keys(localStorage).forEach((key) => {
//             if (key !== "userdata" && key !== "token" && key !== "BranchId") {
//               localStorage.removeItem(key);
//             }
//           });
//           navigate("/dashboard");
//         }}
//       />

//       <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

//       {/* Popup only when 2 students */}
//       {chooseStudentPopup && (
//         <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-xl w-[85%] max-w-sm text-center">
//             <h2 className="text-lg font-bold text-[#434343] mb-5">
//               Select Student
//             </h2>

//             {/* Student 1 */}
//             <button
//               className="w-full mb-3 bg-[#49479D] text-white py-2 rounded-md font-medium"
//               onClick={() => {
//                 const year = getYearFromProgram(packageData.student1);
//                 setSelectedStudent(packageData.student1.name);
//                 setStudentName({ name1: packageData.student1.name });
//                 setChooseStudentPopup(false);
//                 fetchPackages(1, year); // 🔥 fetch packages for selected student
//               }}
//             >
//               {packageData.student1?.name}
//             </button>

//             {/* Student 2 */}
//             <button
//               className="w-full bg-[#49479D] text-white py-2 rounded-md font-medium"
//               onClick={() => {
//                 const year = getYearFromProgram(packageData.student2);
//                 setSelectedStudent(packageData.student2.name);
//                 setStudentName({ name1: packageData.student2.name });
//                 setChooseStudentPopup(false);
//                 fetchPackages(1, year); // 🔥 fetch packages for selected student
//               }}
//             >
//               {packageData.student2?.name}
//             </button>

//             <button
//               onClick={() => setChooseStudentPopup(false)}
//               className="mt-4 text-[#434343] underline text-sm font-medium"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {show && (
//         <div className="fixed w-full p-4 top-14 left-1/2 transform -translate-x-1/2 z-50">
//           <CustomNotification
//             message="You cannot select more than 2 lessons per week with this package. A maximum of 2 lessons is allowed in total per week — 1 lesson per subject."
//             onClose={() => setShow(false)}
//           />
//         </div>
//       )}

//       <div className="pt-20 max-w-md mx-auto px-4 pb-10">
//         <h2 className="text-[18px] font-bold text-[#17215F] mb-2">
//           Select Package
//         </h2>
//         {loading ? (
//           <Box
//             display="flex"
//             justifyContent="center"
//             alignItems="center"
//             minHeight="200px"
//           >
//             <CircularProgress />
//           </Box>
//         ) : (
//           <div className="space-y-4">
//             {filteredPackages?.length > 0 ? (
//               filteredPackages.map((pkg, index) => (
//                 <div
//                   key={index}
//                   className="relative bg-white rounded-xl shadow-md cursor-pointer"
//                 >
//                   {pkg.name === "GOLD" && (
//                     <img
//                       src="/mostpopular.png"
//                       alt="Most Popular"
//                       className="object-contain w-[80px] h-[80px] absolute top-0 right-0"
//                     />
//                   )}

//                   <div
//                     className="p-4"
//                     onClick={() => handlePackageClick(index, pkg)}
//                   >
//                     <h3 className="text-[22px] text-[#434343] font-bold mb-2">
//                       {pkg.name}
//                     </h3>

//                     <div className="flex items-end justify-between">
//                       <div
//                         className="text-xs text-[#434343] font-medium mb-4 w-[200px] space-y-1"
//                         dangerouslySetInnerHTML={{ __html: pkg.description }}
//                       ></div>

//                       <div className="flex flex-col items-end gap-0">
//                         <span className="flex flex-col items-center gap-0">
//                           <h1 className="text-[#49479D] font-bold text-[20px]">
//                             {pkg.lessons}
//                           </h1>
//                         </span>
//                         <span className="text-[#434343] text-[24px] font-bold">
//                           {pkg.price}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {expandedIndex === index && (
//                     <div className="bg-[#CBC9EE] p-4 rounded-b-md">
//                       <p className="text-base font-bold mb-3 text-[#434343]">
//                         Kindly select number of lessons required per week for
//                         each subject
//                       </p>

//                       {/* 🔥 NO DROPDOWN ANYMORE — Popup handles student selection */}

//                       {(pkg.subjects?.length
//                         ? pkg.subjects
//                         : packageData?.student1?.subject || []
//                       ).map((subject) => (
//                         <div key={subject} className="mb-3">
//                           <label className="text-sm font-semibold text-[#434343]">
//                             {subject}
//                           </label>
//                           <Select
//                             placeholder="Lessons Per Week"
//                             value={options.find(
//                               (opt) => opt.value === lessonCounts[subject]
//                             )}
//                             onChange={(selected) => {
//                               setLessonCounts((prev) => ({
//                                 ...prev,
//                                 [subject]: selected.value,
//                               }));
//                             }}
//                             components={{ IndicatorSeparator: () => null }}
//                             isClearable
//                             options={options}
//                             styles={customStyles}
//                           />
//                         </div>
//                       ))}

//                       <div className="flex justify-between gap-4 mt-2">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setExpandedIndex(null);
//                           }}
//                           className="w-[102px] bg-[#FFFFFF]/40 text-[#434343] py-2 text-base rounded font-medium"
//                         >
//                           Close
//                         </button>

//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();

//                             // if (studentName.name1 && studentName.name2 && !selectedStudent) {
//                             //   toast.error("Please select a student before proceeding.");
//                             //   return;
//                             // }
//                             if (
//                               !selectedStudent &&
//                               studentName.name1 &&
//                               studentName.name2
//                             ) {
//                               setChooseStudentPopup(true);
//                               return;
//                             }
//                             handlePackageClick(index, pkg);

//                             const oldLessonData = JSON.parse(
//                               localStorage.getItem("lessonData") || "{}"
//                             );
//                             const fixedSubjects =
//                               oldLessonData?.packageNames?.subjects?.length > 0
//                                 ? oldLessonData.packageNames.subjects
//                                 : Object.keys(lessonCounts).filter(
//                                     (key) => parseInt(lessonCounts[key]) > 0
//                                   );

//                             const formDataObject = {
//                               packageName: pkg.name,
//                               packageNames: {
//                                 ...pkg,
//                                 subjects: fixedSubjects,
//                               },
//                               studentName,
//                               lessonCounts,
//                             };

//                             localStorage.setItem(
//                               "lessonData",
//                               JSON.stringify(formDataObject)
//                             );
//                             localStorage.setItem("totalLession", pkg.lessons);
//                             localStorage.setItem("fromRenew", 1);
//                             navigate("/book-class");
//                           }}
//                           className="w-[102px] bg-[#49479D] text-white py-2 text-base rounded font-medium"
//                         >
//                           Select
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <div className="text-center min-w-xs bg-white rounded-xl p-4 mb-4 shadow text-[#434343] py-8 text-sm font-medium">
//                 No available Package
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RenewChangePackages;

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Header from "../../utils/header/Header";
import Sidebar from "../../utils/sidebar/Sidebar";
import CustomNotification from "../../utils/CustomNotification";
import http from "../../service/http";
import Swal from "sweetalert2";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { toast } from "react-toastify";

const RenewChangePackages = () => {
  const [rawPackages, setrawPackages] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chooseStudentPopup, setChooseStudentPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [lessonCounts, setLessonCounts] = useState({});
  const [packageNames, setPackageName] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]); // 🔥 ADDED
  const navigate = useNavigate();

  let userData = null;
  try {
    const raw = localStorage.getItem("userdata");
    userData = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing userdata:", error);
  }

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/client-packages/${userData.clientid}`);
      const data = response.data;
      if (Array.isArray(data.data)) {
        data.data.forEach((pkg) => {
          try {
            const parsedPackageForm = JSON.parse(pkg.packageForm);
            const { lessonData, packageFormData } = parsedPackageForm;
            localStorage.setItem("lessonData", JSON.stringify(lessonData));
            localStorage.setItem(
              "packageFormData",
              JSON.stringify(packageFormData)
            );
          } catch (err) {}
        });
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [userData.clientid]);

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem("packageFormData");
      if (!stored) return;
      clearInterval(interval);
      const storedData = JSON.parse(stored);
      const students = parseInt(storedData?.students || 1);
      let year = null;
      if (storedData?.program) {
        const match = storedData.program.match(/\d+/);
        if (match) year = parseInt(match[0]);
      }
      if (!year && storedData?.programOne)
        year = parseInt(storedData.programOne);
      if (!year) return;
      fetchPackages(students, year);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  
  const fetchPackages = async (students, year) => {
    try {
      setLoading(true);
  const pkgData = JSON.parse(localStorage.getItem("packageFormData"));

       const studyType = pkgData?.studyType === "yes" ? "group" : "individual";
      
              const response = await http.get(
                `/allpackegastudent?student=${1}&level=${year}&studyType=${studyType}`,
              );
      // const response = await http.get(
      //   `/allpackegastudent?student=${1}&level=${year}`
      // );
      const data = response.data?.data || [];
      const matchedPackages = data.filter((pkg) => [2, 3, 4].includes(pkg.id));
      setrawPackages(matchedPackages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getYearFromProgram = (obj) => {
    if (!obj) return null;
    let year = null;
    if (obj.program) {
      const match = obj.program.match(/\d+/);
      if (match) year = parseInt(match[0]);
    }
    if (!year && obj.programOne) {
      const num = parseInt(obj.programOne);
      if (!isNaN(num)) year = num;
    }
    return year;
  };

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("packageFormData");
      if (storedData) setPackageData(JSON.parse(storedData));
    } catch {}
  }, []);

  useEffect(() => {
    const fetchAndLoad = async () => {
      await fetchClientData();
      const storedData = localStorage.getItem("packageFormData");
      if (storedData) setPackageData(JSON.parse(storedData));
    };
    fetchAndLoad();
  }, []);

  // useEffect(() => {
  //   if (!packageData) return;
  //   let name1 = null;
  //   let name2 = null;

  //   if (packageData.name1 && packageData.name1 !== "null")
  //     name1 = packageData.name1;
  //   if (packageData.name2 && packageData.name2 !== "null")
  //     name2 = packageData.name2;

  //   if (packageData.students === "1") {
  //     name1 = packageData?.name1 || null;
  //     name2 = null;
  //   }
  //   if (packageData.students === "2") {
  //     name1 = packageData?.student1?.name || null;
  //     name2 = packageData?.student2?.name || null;
  //   }

  //   setStudentName({ name1, name2 });
  // }, [packageData]);

  useEffect(() => {
    if (!packageData) return;

    let name1 = null;
    let name2 = null;

    if (packageData.students === "1") {
      name1 = packageData?.name1 || null;
      name2 = null;

      // ✅ Auto set subjects for single student
      setSelectedSubjects(packageData?.subject || []);

      // ✅ No popup for single student
      setChooseStudentPopup(false);
      setSelectedStudent(name1);
    } else {
      // ✅ 2 students case
      name1 = packageData?.student1?.name || null;
      name2 = packageData?.student2?.name || null;
    }

    setStudentName({ name1, name2 });
  }, [packageData]);

  const options = [1, 2, 3, 4, 5].map((num) => ({
    value: num,
    label: `${num}`,
  }));

  useEffect(() => {
    if (
      packageData?.students === "2" &&
      studentName?.name1 &&
      studentName?.name2 &&
      !selectedStudent
    ) {
      setChooseStudentPopup(true);
    }
  }, [studentName, selectedStudent, packageData]);

  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (hasAutoOpened.current) return;
    const lessonsDataString = localStorage.getItem("lessonData");
    const formDataString = localStorage.getItem("packageFormData") || "{}";
    if (!lessonsDataString) return;

    try {
      const lessonsData = JSON.parse(lessonsDataString);
      const formData = JSON.parse(formDataString);
      let fixedSubjects = lessonsData.packageNames?.subjects || [];

      if (
        (!fixedSubjects || fixedSubjects.length === 0) &&
        lessonsData.lessonCounts
      ) {
        fixedSubjects = Object.keys(lessonsData.lessonCounts);
      }
      if (
        (!fixedSubjects || fixedSubjects.length === 0) &&
        Array.isArray(formData.subject)
      ) {
        fixedSubjects = formData.subject;
      }

      fixedSubjects = [...new Set((fixedSubjects || []).filter(Boolean))];

      const updatedPackageNames = {
        ...(lessonsData.packageNames || {}),
        subjects: fixedSubjects,
      };

      const updatedLessonsData = {
        ...lessonsData,
        packageNames: updatedPackageNames,
        packageName: updatedPackageNames.name || lessonsData.packageName,
      };

      localStorage.setItem("lessonData", JSON.stringify(updatedLessonsData));
      setPackageName(updatedPackageNames);
      setLessonCounts(updatedLessonsData.lessonCounts);
      if (!rawPackages || rawPackages.length === 0) return;

      const selectedPackageName = updatedPackageNames.name;
      let matchedIndex = rawPackages.findIndex(
        (pkg) =>
          pkg.name?.trim().toUpperCase() ===
          selectedPackageName?.trim().toUpperCase()
      );

      if (matchedIndex !== -1) {
        setExpandedIndex(matchedIndex);
        hasAutoOpened.current = true;
      }
    } catch {}
  }, [rawPackages]);

  const handlePackageClick = (index, pkg) => {
    const isCollapsing = index === expandedIndex;

    if (!isCollapsing) {
      Swal.fire({
        title: "Are You Sure You Want to Renew Your Package?",
        text: "You still have classes remaining in your current package. Do you still want to proceed with the renewal?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#5553B5",
        cancelButtonColor: "#8F3D96",
        confirmButtonText: "Yes, Proceed",
        cancelButtonText: "No, Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          setExpandedIndex(index);
          setPackageName(pkg);
          if (studentName.name1 && studentName.name2)
            setChooseStudentPopup(true);
        }
      });
    } else {
      setExpandedIndex(null);
      setPackageName(null);
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

      {/* 🔥 Student Selection Popup */}
      {chooseStudentPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[85%] max-w-sm text-center">
            <h2 className="text-lg font-bold text-[#434343] mb-5">
              Select Student
            </h2>

            {/* First Student */}
            <button
              className="w-full mb-3 bg-[#49479D] text-white py-2 rounded-md font-medium"
              onClick={() => {
                const year = getYearFromProgram(packageData.student1);
                setSelectedStudent(packageData.student1.name);
                setStudentName({ name1: packageData.student1.name });
                setSelectedSubjects(packageData.student1.subject || []);
                setChooseStudentPopup(false);
                fetchPackages(1, year);
              }}
            >
              {packageData.student1?.name}
            </button>

            {/* Second Student */}
            <button
              className="w-full bg-[#49479D] text-white py-2 rounded-md font-medium"
              onClick={() => {
                const year = getYearFromProgram(packageData.student2);
                setSelectedStudent(packageData.student2.name);
                setStudentName({ name1: packageData.student2.name });
                setSelectedSubjects(packageData.student2.subject || []);
                setChooseStudentPopup(false);
                fetchPackages(1, year);
              }}
            >
              {packageData.student2?.name}
            </button>

            <button
              onClick={() => setChooseStudentPopup(false)}
              className="mt-4 text-[#434343] underline text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {show && (
        <div className="fixed w-full p-4 top-14 left-1/2 transform -translate-x-1/2 z-50">
          <CustomNotification
            message="You cannot select more than 2 lessons per week with this package."
            onClose={() => setShow(false)}
          />
        </div>
      )}

      <div className="pt-20 max-w-md mx-auto px-4 pb-10">
        <h2 className="text-[18px] font-bold text-[#17215F] mb-2">
          Select Package
        </h2>

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        ) : (
          <div className="space-y-4">
            {rawPackages.length > 0 ? (
              rawPackages.map((pkg, index) => (
                <div
                  key={index}
                  className="relative bg-white rounded-xl shadow-md cursor-pointer"
                >
                  {pkg.name === "GOLD" && (
                    <img
                      src="/mostpopular.png"
                      alt="Most Popular"
                      className="object-contain w-[80px] h-[80px] absolute top-0 right-0"
                    />
                  )}

                  <div
                    className="p-4"
                    onClick={() => handlePackageClick(index, pkg)}
                  >
                    <h3 className="text-[22px] text-[#434343] font-bold mb-2">
                      {pkg.name}
                    </h3>

                    <div className="flex items-end justify-between">
                      <div
                        className="text-xs text-[#434343] font-medium mb-4 w-[200px] space-y-1"
                        dangerouslySetInnerHTML={{ __html: pkg.description }}
                      />
                      <div className="flex flex-col items-end gap-0">
                        <span className="flex flex-col items-center gap-0">
                          <h1 className="text-[#49479D] font-bold text-[20px]">
                            {pkg.numberofclass} {pkg.types}
                          </h1>
                        </span>
                        <span className="text-[#434343] text-[24px] font-bold">
                          {pkg.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  {expandedIndex === index && (
                    <div className="bg-[#CBC9EE] p-4 rounded-b-md">
                      <p className="text-base font-bold mb-3 text-[#434343]">
                        Kindly select number of lessons required per week for
                        each subject
                      </p>

                      {/* 🔥 Subject dropdown now uses selected student's subjects */}
                      {selectedSubjects.map((subject) => (
                        <div key={subject} className="mb-3">
                          <label className="text-sm font-semibold text-[#434343]">
                            {subject}
                          </label>
                          <Select
                            placeholder="Lessons Per Week"
                            value={options.find(
                              (opt) => opt.value === lessonCounts[subject]
                            )}
                            onChange={(selected) => {
                              setLessonCounts((prev) => ({
                                ...prev,
                                [subject]: selected.value,
                              }));
                            }}
                            components={{ IndicatorSeparator: () => null }}
                            isClearable
                            options={options}
                          />
                        </div>
                      ))}

                      <div className="flex justify-between gap-4 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedIndex(null);
                          }}
                          className="w-[102px] bg-[#FFFFFF]/40 text-[#434343] py-2 text-base rounded font-medium"
                        >
                          Close
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            if (
                              !selectedStudent &&
                              studentName.name1 &&
                              studentName.name2
                            ) {
                              setChooseStudentPopup(true);
                              return;
                            }

                            handlePackageClick(index, pkg);

                            const formDataObject = {
                              packageName: pkg.name,
                              packageNames: {
                                ...pkg,
                                subjects: selectedSubjects, // 🔥 FIXED
                              },
                              studentName,
                              lessonCounts,
                            };

                            localStorage.setItem(
                              "lessonData",
                              JSON.stringify(formDataObject)
                            );
                            localStorage.setItem(
                              "totalLession",
                              `${pkg.numberofclass} ${pkg.types}`
                            );
                            localStorage.setItem("fromRenew", 1);
                            // navigate("/book-class");
                            navigate("/book-class", {
                              state: { fromRenew: true },
                            });
                          }}
                          className="w-[102px] bg-[#49479D] text-white py-2 text-base rounded font-medium"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center min-w-xs bg-white rounded-xl p-4 mb-4 shadow text-[#434343] py-8 text-sm font-medium">
                No available Package
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RenewChangePackages;
