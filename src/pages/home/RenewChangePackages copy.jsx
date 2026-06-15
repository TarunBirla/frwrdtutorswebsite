import React, { useEffect, useRef, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

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

  const [loading, setLoading] = useState(true);
  let userData = null;
  const [show, setShow] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [lessonCounts, setLessonCounts] = useState({});
  const [lessonCounts2, setLessonCounts2] = useState({});

  const [packageNames, setPackageName] = useState(null);

  const [lessonCount, setLessonCount] = useState(1);
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);

  try {
    const raw = localStorage.getItem("userdata");
    userData = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing userdata:", error);
  }

  const fetchClientData = async () => {
      try {
        setLoading(true);
        const response = await http.get(
          `/client-packages/${userData.clientid}`
        );
        const data = response.data;
        //console.log("data of the packages:-", data.data);
        if (Array.isArray(data.data)) {
          data.data.forEach((pkg, index) => {
            try {
              const parsedPackageForm = JSON.parse(pkg.packageForm);
              //console.log(`Package Form ${index + 1}:`, parsedPackageForm);
              const { lessonData, packageFormData } = parsedPackageForm;

              // Save to localStorage
              localStorage.setItem(`lessonData`, JSON.stringify(lessonData));
              localStorage.setItem(
                `packageFormData`,
                JSON.stringify(packageFormData)
              );
            } catch (err) {
              console.error(
                `Error parsing packageForm for package ${index + 1}:`,
                err
              );
            }
          });
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
      } finally {
        setLoading(false); // stop loading
      }
    };


  useEffect(() => {
    

    fetchClientData();
  }, [userData.clientid]);

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem("packageFormData");

      // console.log("stored:-", stored);

      // if (!stored) {
      //   //console.log("Waiting for packageFormData...");
      //   return;
      // }

      clearInterval(interval); // stop checking

      const storedData = JSON.parse(stored);

      const students = parseInt(storedData?.students || 1);

      let year = null;

      if (storedData?.program) {
        const match = storedData.program.match(/\d+/);
        if (match) year = parseInt(match[0]);
      }

      if (!year && storedData?.programOne) {
        year = parseInt(storedData.programOne);
      }

      if (!year) {
        console.warn("Year still not found");
        return;
      }

      fetchPackages(students, year);
    }, 500); // check every 500ms

    return () => clearInterval(interval);
  }, []);

  const fetchPackages = async (students, year) => {
    try {
      setLoading(true);

      const response = await http.get(
        `/allpackegastudent?student=${1}&level=${year}`
      );

      const data = response.data?.data || [];

      const matchedPackages = data.filter((pkg) => [2, 3, 4].includes(pkg.id));

      setrawPackages(matchedPackages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("packageFormData");

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // console.log("storedData:", parsedData);

        setPackageData((prev) => ({
          ...prev,
          ...parsedData, // merge with existing structure to avoid undefined fields
        }));
      }
    } catch (error) {
      console.error("Error parsing packageFormData:", error);
    }
  }, []);



  //console.log("outsite",packageData);

  // useEffect(() => {
  //   // if (!packageData) return;
  //   console.log("packageDatauseeffect", packageData);

  //   if (packageData?.name1 || packageData?.name2) {
  //     setStudentName({
  //       name1:
  //         packageData.name1 && packageData.name1 !== "null"
  //           ? packageData.name1
  //           : null,
  //       name2:
  //         packageData.name2 && packageData.name2 !== "null"
  //           ? packageData.name2
  //           : null,
  //     });
  //   }

  //   // Case 2: If students count is provided
  //   if (packageData?.students == "1") {
  //     setStudentName({
  //       name1: packageData?.student1?.name || null,
  //       name2: null,
  //     });
  //   }

  //   if (packageData?.students == "2") {
  //     setStudentName({
  //       name1: packageData?.student1?.name || null,
  //       name2: packageData?.student2?.name || null,
  //     });

  //     console.log("students:-", packageData?.student1?.name, studentName);
  //   }

  //   // Case 3: Fallback if structure is different
  //   setStudentName({
  //     name1: packageData?.student1?.name || null,
  //     name2: packageData?.student2?.name || null,
  //   });
  // }, [packageData]);

  
  useEffect(() => {

    const fetchAndLoad = async () => {

      await fetchClientData(); // 🔥 Wait until API data is stored in localStorage



      const storedData = localStorage.getItem("packageFormData");

      if (storedData) {

        setPackageData(JSON.parse(storedData)); // NOW packageData is ready

      }

    };



    fetchAndLoad();

  }, []); // 👈 RUN ONLY ONCE

  useEffect(() => {
    if (!packageData) return;

    console.log("packageData:", packageData);

    let name1 = null;
    let name2 = null;

    // Case 1: name1/name2 directly present and not empty
    if (packageData.name1 && packageData.name1 !== "null") {
      name1 = packageData.name1;
    }
    if (packageData.name2 && packageData.name2 !== "null") {
      name2 = packageData.name2;
    }

    // Case 2: student count 1 or 2 overrides above
    if (packageData.students === "1") {
      name1 = packageData?.name1 || null;
      name2 = null;
    }

    if (packageData.students === "2") {
      name1 = packageData?.student1?.name || null;
      name2 = packageData?.student2?.name || null;
    }

    // Final update once
    setStudentName({ name1, name2 });
  }, [packageData]);

  console.log(studentName);
  const totalSubjects = packageData?.subject?.length;
  const totalSubjects1 = packageData?.student1?.subject?.length;
  const totalSubjects2 = packageData?.student2?.subject?.length;

  const safeSubjects =
    packageData?.studyType === "no" && packageData.subject?.length === 0
      ? studentType == 1
        ? packageData?.student1?.subject ?? []
        : packageData?.student2?.subject ?? []
      : packageData?.subject || [];

  //console.log("subject:-", safeSubjects);

  let filteredPackages = rawPackages;

  if (packageData?.studyType === "no") {
    if (totalSubjects1 === 2 && totalSubjects2 === 2) {
      // GOLD or PLATINUM for 2 subjects
      filteredPackages = rawPackages.filter((pkg) => {
        const name = pkg.name?.toUpperCase();
        return name === "GOLD" || name === "PLATINUM";
      });
    } else if (totalSubjects1 === 3 && totalSubjects2 === 3) {
      // PLATINUM for other cases
      filteredPackages = rawPackages.filter(
        (pkg) => pkg.name?.toUpperCase() === "PLATINUM"
      );
    }
  } else if (packageData?.studyType === "yes") {
    if (
      packageData?.name1 &&
      packageData?.name2 &&
      packageData?.students &&
      totalSubjects === 2
    ) {
      filteredPackages = rawPackages.filter((pkg) => {
        const name = pkg.name?.toUpperCase();
        return name === "GOLD" || name === "PLATINUM";
      });
    } else if (
      packageData?.name1 &&
      packageData?.name2 &&
      packageData?.students &&
      totalSubjects === 3
    ) {
      filteredPackages = rawPackages.filter(
        (pkg) => pkg.name?.toUpperCase() === "PLATINUM"
      );
    } else if (packageData?.name1 && totalSubjects === 3) {
      filteredPackages = rawPackages.filter((pkg) => {
        const name = pkg.name?.toUpperCase();
        return name === "GOLD" || name === "PLATINUM";
      });
    }
  } else if (packageData?.name1 && totalSubjects == 3) {
    filteredPackages = rawPackages.filter((pkg) => {
      const name = pkg.name?.toUpperCase();
      return name === "GOLD" || name === "PLATINUM";
    });
  }

  // Final mapping
  filteredPackages = filteredPackages.map((pkg) => ({
    ...pkg,
    lessons: `${pkg.numberofclass} ${pkg.types}`,
    lession2: `${pkg.offers ? `(${pkg.offers})` : ""}`,
    price: pkg.total,
    subjects: safeSubjects,
  }));

  // //console.log(filteredPackages);

  const options = [1, 2, 3, 4, 5].map((num) => ({
    value: num,
    label: `${num}`,
  }));

  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "6px",
      fontSize: "14px",
    }),
  };

  //console.log("lessonsCounts:-", lessonCounts);

  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (hasAutoOpened.current) return; // stop repeat auto-open

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
      // setStudentName(updatedLessonsData.studentName);
      setLessonCounts(updatedLessonsData.lessonCounts);

      if (!rawPackages || rawPackages.length === 0) return;

      const selectedPackageId = updatedPackageNames.id;
      const selectedPackageName = updatedPackageNames.name;

      let matchedIndex = -1;

      if (selectedPackageId) {
        matchedIndex = rawPackages.findIndex(
          (pkg) => pkg.id === selectedPackageId
        );
      }

      if (matchedIndex === -1 && selectedPackageName) {
        matchedIndex = rawPackages.findIndex(
          (pkg) =>
            pkg.name?.trim().toUpperCase() ===
            selectedPackageName?.trim().toUpperCase()
        );
      }

      if (matchedIndex !== -1) {
        setExpandedIndex(matchedIndex);
        hasAutoOpened.current = true;
      }
    } catch (err) {
      console.error(" Error fixing auto-open:", err);
    }
  }, [rawPackages]);

  const handlePackageClick = (index, pkg) => {
    const isCollapsing = index === expandedIndex;

    if (!isCollapsing) {
      // Show confirmation only when expanding
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
        }
      });
    } else {
      // Directly collapse
      setExpandedIndex(null);
      setPackageName(null);
    }
  };

  console.log("studentName1234",studentName.name1,studentName.name2);

  return (
    <div
      className="bg-[#EEEDFE] min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: "url('/Background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#EEEDFE", // ya koi fallback color
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
      {/* Notification */}
      {show && (
        <div className="fixed w-full p-4 top-14 left-1/2 transform -translate-x-1/2 z-50">
          <CustomNotification
            message="You cannot select more than 2 lessons per week with this package. A maximum of 2 lessons is allowed in total per week — 1 lesson per subject."
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
            {filteredPackages?.length > 0 ? (
              filteredPackages.map((pkg, index) => (
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
                    className=" p-4"
                    // onClick={() => {

                    //   const isCollapsing = index === expandedIndex;
                    //   setExpandedIndex(isCollapsing ? null : index);
                    //   setPackageName(isCollapsing ? null : pkg);
                    // }}
                    onClick={() => handlePackageClick(index, pkg)}
                  >
                    {/* Package Header */}
                    <h3 className="text-[22px] text-[#434343] font-bold mb-2">
                      {pkg.name}
                    </h3>

                    <div className="flex items-end justify-between">
                      <div
                        className="text-xs text-[#434343] font-medium mb-4 w-[200px] space-y-1"
                        dangerouslySetInnerHTML={{ __html: pkg.description }}
                      ></div>

                      <div className="flex flex-col items-end gap-0">
                        <span className="flex flex-col items-center gap-0">
                          <h1 className="text-[#49479D] font-bold text-[20px]">
                            {pkg.lessons}
                          </h1>
                          {/* <span className="text-[#49479D] font-medium text-[12px]">
                        {pkg.lession2}
                      </span> */}
                        </span>
                        <span className="text-[#434343] text-[24px] font-bold">
                          {pkg.price}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Expanded Section */}
                  {expandedIndex === index && (
                    <div className="bg-[#CBC9EE] p-4 rounded-b-md">
                      <p className="text-base font-bold mb-3 text-[#434343]">
                        Kindly select number of lessons required per week for
                        each subject
                      </p>

                      {/* {studentName.name1 && (
                        <>
                          <label className="block mb-1 text-base text-[#434343] font-medium">
                            {packageData?.studyType === null ? "" : `1st`}{" "}
                            Student Name
                          </label>
                          <input
                            type="text"
                            value={studentName.name1}
                            readOnly
                            className="w-full px-4 py-2 mb-2 border border-[#FFFFFF] bg-[#FFFFFF] text-sm text-[#434343] rounded-md font-medium"
                          />
                        </>
                      )} */}

                      {studentName.name1 && studentName.name2 ? (
                        <>
                          <label className="block mb-1 text-base text-[#434343] font-medium">
                            Select Student
                          </label>

                          <select
                            className="w-full px-4 py-2 mb-2 border border-[#D0D0D0] bg-white text-sm text-[#434343] rounded-md font-medium"
                            value={selectedStudent || ""}
                            onChange={(e) => {
                              const value = e.target.value;

                              setSelectedStudent(value);

                              // Update studentName as user requested
                              setStudentName({
                                name1: value, // selected student
                                name2: null, // clear second student
                              });
                            }}
                          >
                            <option value="" disabled>
                              -- Select Student --
                            </option>
                            <option value={studentName.name1}>
                              {studentName.name1}
                            </option>
                            <option value={studentName.name2}>
                              {studentName.name2}
                            </option>
                          </select>
                        </>
                      ) : (
                        // If only one student, show input
                        studentName.name1 && (
                          <>
                            <label className="block mb-1 text-base text-[#434343] font-medium">
                              {packageData?.studyType === null ? "" : "1st"}{" "}
                              Student Name
                            </label>
                            <input
                              type="text"
                              value={studentName.name1}
                              readOnly
                              className="w-full px-4 py-2 mb-2 border border-[#FFFFFF] bg-[#FFFFFF] text-sm text-[#434343] rounded-md font-medium"
                            />
                          </>
                        )
                      )}

                      {studentName.name1 && packageData?.studyType === null && (
                        <div
                          className={`grid ${
                            pkg.subjects?.length === 1
                              ? "grid-cols-1"
                              : "grid-cols-2"
                          } gap-4 mt-1 mb-4`}
                        >
                          {(pkg.subjects?.length
                            ? pkg.subjects
                            : packageData?.student1?.subject || []
                          ).map((subject) => (
                            <div key={subject}>
                              <label className="text-sm font-semibold text-[#434343]">
                                {pkg.subjects?.length === 1
                                  ? subject
                                  : subject.split(" ")[0] + "..."}
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
                                components={{
                                  IndicatorSeparator: () => null, // 🚀 Removes vertical line
                                }}
                                isClearable
                                options={options}
                                styles={customStyles}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {studentName.name1 && packageData?.studyType === "no" && (
                        <div
                          className={`grid ${
                            (pkg.subjects?.length ||
                              packageData?.student1?.subject?.length) === 1
                              ? "grid-cols-1"
                              : "grid-cols-2"
                          } gap-4 mt-1 mb-4`}
                        >
                          {(pkg.subjects?.length
                            ? pkg.subjects
                            : packageData?.student1?.subject || []
                          ).map((subject) => (
                            <div key={subject}>
                              <label className="text-sm font-semibold text-[#434343]">
                                {pkg.subjects?.length === 1
                                  ? subject
                                  : subject.split(" ")[0] + "..."}
                              </label>
                              <Select
                                placeholder="Lessons Per Week"
                                value={options.find((opt) => {
                                  const value = pkg.subjects?.length
                                    ? lessonCounts[subject]
                                    : lessonCounts?.student1?.[subject];
                                  return opt.value === value;
                                })}
                                onChange={(selected) => {
                                  setLessonCounts((prev) => {
                                    if (pkg.subjects?.length) {
                                      // First condition – flat structure
                                      return {
                                        ...prev,
                                        [subject]: selected.value,
                                      };
                                    } else {
                                      // Second condition – nested structure
                                      return {
                                        ...prev,
                                        student1: {
                                          ...prev.student1,
                                          [subject]: selected.value,
                                        },
                                      };
                                    }
                                  });
                                }}
                                components={{
                                  IndicatorSeparator: () => null, // 🚀 Removes vertical line
                                }}
                                isClearable
                                options={options}
                                styles={customStyles}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* {studentName.name2 && (
                        <>
                          <label className="block mb-1 text-base text-[#434343] font-medium">
                            2nd Student Name
                          </label>
                          <input
                            type="text"
                            value={studentName.name2}
                            readOnly
                            className="w-full px-4 py-2 border border-[#FFFFFF] bg-[#FFFFFF] text-sm text-[#434343] rounded-md font-medium"
                          />
                        </>
                      )} */}

                      {/* {studentName.name2 && (
                        <div
                          className={`grid ${
                            pkg.subjects?.length === 1
                              ? "grid-cols-1"
                              : "grid-cols-2"
                          } gap-4 mt-1 mb-4`}
                        >
                          {(pkg.subjects?.length
                            ? pkg.subjects
                            : packageData?.student2?.subject || []
                          ).map((subject) => (
                            <div key={subject}>
                              <label className="text-sm font-semibold text-[#434343]">
                                {pkg.subjects?.length === 1
                                  ? subject
                                  : subject.split(" ")[0] + "..."}
                              </label>
                              <Select
                                placeholder="Lessons Per Week"
                                value={options.find((opt) => {
                                  const value = pkg.subjects?.length
                                    ? lessonCounts[subject]
                                    : lessonCounts?.student2?.[subject];
                                  return opt.value === value;
                                })}
                                onChange={(selected) => {
                                  setLessonCounts((prev) => {
                                    if (pkg.subjects?.length) {
                                      // First condition – flat structure
                                      return {
                                        ...prev,
                                        [subject]: selected.value,
                                      };
                                    } else {
                                      // Second condition – nested structure
                                      return {
                                        ...prev,
                                        student2: {
                                          ...prev.student2,
                                          [subject]: selected.value,
                                        },
                                      };
                                    }
                                  });
                                }}
                                components={{
                                  IndicatorSeparator: () => null, // 🚀 Removes vertical line
                                }}
                                isClearable
                                options={options}
                                styles={customStyles}
                              />
                            </div>
                          ))}
                        </div>
                      )} */}

                      <div className="flex justify-between gap-4">
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
                            // ✅ Update selected package

                            e.stopPropagation();
                            // 🚫 If two students exist but no student is selected
if (studentName.name1 && studentName.name2 && !selectedStudent) {
  toast.error("Please select a student before proceeding.");
  return;
}

                            // localStorage.removeItem("lessonData");

                            const studyType = packageData?.studyType;

                            //console.log("studyLogin:-", studyType);

                            const totalLessons = Object.values(
                              lessonCounts
                            ).reduce((sum, val) => sum + parseInt(val || 0), 0);

                            const packageName = pkg.name?.toUpperCase() || "";
                            let showWarning = false;

                            if (!studyType || studyType == "no") {
                              if (packageName === "SILVER") {
                                const values = Object.values(lessonCounts)
                                  .map((val) => parseInt(val || 0))
                                  .filter((v) => v > 0);

                                if (values.length === 1) {
                                  if (values[0] !== 1 && values[0] !== 2) {
                                    showWarning = true;
                                  }
                                } else if (values.length === 2) {
                                  const [a, b] = values;
                                  const validCombinations = a === 1 && b === 1;

                                  if (!validCombinations) {
                                    showWarning = true;
                                  }
                                } else {
                                  showWarning = true;
                                }
                              } else if (
                                ["PLATINUM", "GOLD"].includes(packageName) &&
                                (pkg.subjects?.length === 2 ||
                                  pkg.subjects?.length === 1)
                              ) {
                                const values = Object.values(lessonCounts)
                                  .map((val) => parseInt(val || 0))
                                  .filter((v) => v > 0);

                                if (values.length === 1) {
                                  const [a] = values;
                                  if (![1, 2, 3, 4].includes(a)) {
                                    showWarning = true;
                                  }
                                } else if (values.length === 2) {
                                  const [a, b] = values;

                                  const allowedCombinations = [
                                    [1, 1],
                                    [1, 2],
                                    [1, 3],
                                    [2, 1],
                                    [2, 2],
                                  ];

                                  const isValid = allowedCombinations.some(
                                    ([x, y]) => a === x && b === y
                                  );

                                  if (!isValid) {
                                    showWarning = true;
                                  }
                                } else {
                                  showWarning = true;
                                }
                              } else if (
                                ["PLATINUM", "GOLD"].includes(packageName) &&
                                pkg.subjects?.length === 3
                              ) {
                                //console.log("inside 3");

                                const values = Object.values(lessonCounts)
                                  .map((val) => parseInt(val || 0))
                                  .filter((v) => v > 0);

                                const isThreeSubjects = values.length === 3;
                                const isEachBetween1And4 = values.every(
                                  (v) => v >= 1 && v <= 2
                                );
                                const totalLessons = values.reduce(
                                  (a, b) => a + b,
                                  0
                                );
                                const isTotalValid = totalLessons <= 4;

                                const isValid =
                                  isThreeSubjects &&
                                  isEachBetween1And4 &&
                                  isTotalValid;

                                if (!isValid) {
                                  showWarning = true;
                                }
                              }
                            } else if (studyType == "yes") {
                              //console.log("yes");
                              if (packageName === "SILVER") {
                                const values = Object.values(lessonCounts)
                                  .map((val) => parseInt(val || 0))
                                  .filter((v) => v > 0);

                                if (values.length === 1) {
                                  if (values[0] !== 1 && values[0] !== 2) {
                                    showWarning = true;
                                  }
                                } else if (values.length === 2) {
                                  const [a, b] = values;
                                  const validCombinations = a === 1 && b === 1;

                                  if (!validCombinations) {
                                    showWarning = true;
                                  }
                                } else {
                                  showWarning = true;
                                }
                              } else if (
                                ["PLATINUM", "GOLD"].includes(packageName) &&
                                (pkg.subjects?.length === 2 ||
                                  pkg.subjects?.length === 1)
                              ) {
                                const values = Object.values(lessonCounts)
                                  .map((val) => parseInt(val || 0))
                                  .filter((v) => v > 0);

                                if (values.length === 1) {
                                  const [a] = values;
                                  if (![1, 2, 3, 4].includes(a)) {
                                    showWarning = true;
                                  }
                                } else if (values.length === 2) {
                                  const [a, b] = values;

                                  const allowedCombinations = [
                                    [1, 1],
                                    [1, 2],
                                    [1, 3],
                                    [2, 1],
                                    [2, 2],
                                  ];

                                  const isValid = allowedCombinations.some(
                                    ([x, y]) => a === x && b === y
                                  );

                                  if (!isValid) {
                                    showWarning = true;
                                  }
                                } else {
                                  showWarning = true;
                                }
                              } else if (
                                ["PLATINUM", "GOLD"].includes(packageName) &&
                                pkg.subjects?.length === 3
                              ) {
                                //console.log("inside 3");

                                const values = Object.values(lessonCounts)
                                  .map((val) => parseInt(val || 0))
                                  .filter((v) => v > 0);

                                const isThreeSubjects = values.length === 3;
                                const isEachBetween1And4 = values.every(
                                  (v) => v >= 1 && v <= 4
                                );
                                const totalLessons = values.reduce(
                                  (a, b) => a + b,
                                  0
                                );
                                const isTotalValid = totalLessons <= 12;

                                const isValid =
                                  isThreeSubjects &&
                                  isEachBetween1And4 &&
                                  isTotalValid;

                                if (!isValid) {
                                  showWarning = true;
                                }
                              }
                            }

                            if (showWarning) {
                              setShow(true);
                              setTimeout(() => setShow(false), 3000);
                              return;
                            }

                            // Proceed with booking
                            setExpandedIndex(null);
                            const oldLessonData = JSON.parse(
                              localStorage.getItem("lessonData") || "{}"
                            );

                            const fixedSubjects =
                              oldLessonData?.packageNames?.subjects?.length > 0
                                ? oldLessonData.packageNames.subjects
                                : Object.keys(lessonCounts).filter(
                                    (key) => parseInt(lessonCounts[key]) > 0
                                  );

                            // ✅ Final data to save
                            const formDataObject = {
                              packageName: pkg.name,
                              packageNames: {
                                ...pkg,
                                subjects: fixedSubjects, // ✅ subject preserved
                              },
                              studentName,
                              lessonCounts,
                            };

                            localStorage.setItem(
                              "lessonData",
                              JSON.stringify(formDataObject)
                            );
                            localStorage.setItem("totalLession", pkg.lessons);

                            localStorage.setItem("fromRenew", 1);
                            navigate("/book-class");
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
