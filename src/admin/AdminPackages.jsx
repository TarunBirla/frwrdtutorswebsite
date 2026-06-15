import React, { useEffect, useState } from "react";
// import Header from "../utils/header/Header";
// import Sidebar from "../utils/sidebar/Sidebar";
import CustomNotification from "../admin/utils/CustomNotification";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import httpadmin from "../service/httpadmin";


const AdminPackages = () => {
  const [rawPackages, setrawPackages] = useState([]);

  const location = useLocation();

  const pkgData = JSON.parse(localStorage.getItem("packageFormData"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        let level = "";

        const extractYear = (programStr) => {
          if (!programStr) return null;
          const match = programStr.match(/Year\s*(\d+)/i);
          return match && match[1] ? match[1] : null;
        };

        // if studentType is selected, respect it first
        const studentType = localStorage.getItem("studentType");

        if (studentType === "1" && pkgData?.student1?.program) {
          level = extractYear(pkgData.student1.program);
        } else if (studentType === "2" && pkgData?.student2?.program) {
          level = extractYear(pkgData.student2.program);
        }

        // fallback: check top-level program
        if (!level && pkgData?.program) {
          level = extractYear(pkgData.program);
        }

        // fallback: scan all students if still nothing
        if (!level) {
          Object.keys(pkgData || {}).forEach((key) => {
            if (
              key.toLowerCase().startsWith("student") &&
              pkgData[key]?.program
            ) {
              const found = extractYear(pkgData[key].program);
              if (found) level = found;
            }
          });
        }

        const studyType = pkgData?.studyType === "yes" ? "group" : "individual";

        const response = await httpadmin.get(
          `/allpackegastudent?student=${pkgData.students}&level=${level}&studyType=${studyType}`,
        );

        console.log("Fetched data:", response.data.data);
        setrawPackages(response.data.data);
      } catch (err) {
        console.error("Error fetching location data:", err);
      }
    };

    fetchData();
  }, []);

  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("packageFormData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setPackageData(parsedData);
    }
  }, []);

  useEffect(() => {
    if (packageData) {
      console.log("Updated packageData:", packageData);
      console.log("studentCount:", packageData?.subject);
    }
  }, [packageData]);

  // console.log("subjectCount:", packageData?.subject?.length);
  const studentType = localStorage.getItem("studentType");

  console.log("studentType:-", studentType);

  const [show, setShow] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [lessonCounts, setLessonCounts] = useState({});
  const [lessonCounts2, setLessonCounts2] = useState({});

  const [packageNames, setPackageName] = useState(null);

  const [lessonCount, setLessonCount] = useState(1);
  const [studentName, setStudentName] = useState("");

  const [paymentInfo, setPaymentInfo] = useState(null);

useEffect(() => {
  const fetchPaymentStatus = async () => {
    try {
            const rawUser = localStorage.getItem("adminuserdata");
      if (!rawUser) return;

      const user = JSON.parse(rawUser);

      const res = await httpadmin.get(
        `/payments/by-client/${user.clientid}`
      );


      console.log("Payment Info:", res.data);

      setPaymentInfo(res.data);

    } catch (err) {
      console.error("Payment API Error:", err);
    }
  };

  fetchPaymentStatus();
}, []);

const getCurrentStudentId = () => {
  if (!packageData) return null;

  const rawUser = localStorage.getItem("adminuserdata");
  if (!rawUser) return null;

  const user = JSON.parse(rawUser);

  const students = user?.studentdetails || [];

  // Current student name from form
  const currentName = packageData?.name1?.toLowerCase()?.trim();

  if (!currentName) return null;

  // Match by name
  const matched = students.find(
    (s) =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(currentName)
  );

  return matched?.id || null;
};

const shouldApplyDiscount = () => {
  if (!paymentInfo?.data) return false;

  const rawUser = localStorage.getItem("adminuserdata");
  if (!rawUser) return false;

  const user = JSON.parse(rawUser);

  const students = user?.studentdetails || [];

  if (students.length < 2) return false;

  // Get paid student IDs
  const paidStudentIds = new Set();

  paymentInfo.data.forEach((p) => {
    if (p.status === "SUCCESS" && Array.isArray(p.student_ids)) {
      p.student_ids.forEach((id) => paidStudentIds.add(id));
    }
  });

  // Current student
  const currentStudentId = getCurrentStudentId();

  console.log("CURRENT STUDENT:", currentStudentId);
  console.log("PAID IDS:", [...paidStudentIds]);

  // If current student is already paid → NO discount
  if (paidStudentIds.has(currentStudentId)) {
    return false;
  }

  const paidCount = paidStudentIds.size;
  const total = students.length;
  const unpaidCount = total - paidCount;

  // Only unpaid student gets discount
  return paidCount >= 1 && unpaidCount >= 1;
};



useEffect(() => {

    if (location.pathname === "/admin/manage-packages") {

        Object.keys(localStorage).forEach((key) => {

            if (
                key !== "isAdmin" &&
                key !== "admintoken" &&
                key !== "token" &&
                key !== "adminuserdata" &&
                key !== "BranchId" &&
                key !== "packageFormData" &&
                key !== "totalLession" &&
                key !== "lessonData"
            ) {

                localStorage.removeItem(key);

            }
        });
    }

}, [location.pathname]);


  useEffect(() => {
    if (packageData?.name1) {
      setStudentName({
        name1: packageData.name1 || null,
        name2: packageData.name2 || null,
      });
    } else if (
      packageData?.student1?.name ||
      packageData?.student2?.name ||
      studentType
    ) {
      setStudentName({
        name1: studentType == 1 ? packageData?.student1?.name : null,
        name2: studentType == 2 ? packageData?.student2?.name : null,
      });
    }
  }, [packageData]);

  console.log("studentName:-", studentName);
  // console.log(studentType)

  const totalSubjects = packageData?.subject?.length;
  const totalSubjects1 = packageData?.student1?.subject?.length;
  const totalSubjects2 = packageData?.student2?.subject?.length;

  const safeSubjects =
    packageData?.studyType === "no" && packageData.subject?.length === 0
      ? studentType == 1
        ? (packageData?.student1?.subject ?? [])
        : (packageData?.student2?.subject ?? [])
      : packageData?.subject || [];

  console.log("subject:-", safeSubjects);

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
        (pkg) => pkg.name?.toUpperCase() === "PLATINUM",
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
        (pkg) => pkg.name?.toUpperCase() === "PLATINUM",
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

  // 20% discount for second student
  const applySecondStudentDiscount = (price) => {
    const num = Number(String(price).replace(/[^\d.-]/g, "")) || 0;

    return Math.round(num * 0.8); // 80% = 20% OFF
  };

  // Final mapping
  // filteredPackages = filteredPackages.map((pkg) => ({
  //   ...pkg,
  //   lessons: `${pkg.numberofclass} ${pkg.types}`,
  //   lession2: `${pkg.offers ? `(${pkg.offers})` : ""}`,
  //   price: pkg.total,
  //   subjects: safeSubjects,
  // }));

  filteredPackages = filteredPackages.map((pkg) => {
    let finalPrice = pkg.total;

   const isIndividual = packageData?.studyType === "no";

// Rule 1: Individual → studentType based
const individualDiscount =
  isIndividual && studentType === "2";

// Rule 2: Group / Mixed → payment based
const paymentDiscount =
  !isIndividual && shouldApplyDiscount();

if (individualDiscount || paymentDiscount) {
  finalPrice = applySecondStudentDiscount(pkg.total);
}


    

    return {
      ...pkg,
      lessons: `${pkg.numberofclass} ${pkg.types}`,
      lession2: `${pkg.offers ? `(${pkg.offers})` : ""}`,
      price: `AED ${finalPrice}`,
      subjects: safeSubjects,
    };
  });

  console.log(filteredPackages);

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

  console.log("lessonsCounts:-", lessonCounts);

  // Map lessonsData from localStorage if it exists
  useEffect(() => {
    const lessonsDataString = localStorage.getItem("lessonData");
    if (lessonsDataString) {
      try {
        const lessonsData = JSON.parse(lessonsDataString);
        console.log("Found lessonsData:", lessonsData);

        // Map the data to existing state if it exists
        if (lessonsData.packageNames) {
          setPackageName(lessonsData.packageNames);
        }

        if (lessonsData.studentName) {
          setStudentName(lessonsData.studentName);
        }

        if (lessonsData.lessonCounts) {
          setLessonCounts(lessonsData.lessonCounts);
        }

        // Set expanded index based on package name if available
        if (lessonsData.packageName && rawPackages.length > 0) {
          const packageIndex = rawPackages.findIndex(
            (pkg) =>
              pkg.name?.toUpperCase() ===
              lessonsData.packageName?.toUpperCase(),
          );
          if (packageIndex !== -1) {
            setExpandedIndex(packageIndex);
          }
        }
      } catch (error) {
        console.error("Error parsing lessonsData:", error);
      }
    }
  }, [rawPackages]); // Depend on rawPackages to ensure they're loaded

  console.log("studentName:-", studentName);

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

        <div className="space-y-4">
          {filteredPackages.map((pkg, index) => (
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
                onClick={() => {
                  // setExpandedIndex(index === expandedIndex ? null : index)
                  const isCollapsing = index === expandedIndex;
                  setExpandedIndex(isCollapsing ? null : index);
                  setPackageName(isCollapsing ? null : pkg);
                }}
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
                    Kindly select number of lessons required per week for each
                    subject
                  </p>

                  {studentName.name1 && (
                    <>
                      <label className="block mb-1 text-base text-[#434343] font-medium">
                        {packageData?.studyType === null ? "" : `1st`} Student
                        Name
                      </label>
                      <input
                        type="text"
                        value={studentName.name1}
                        readOnly
                        className="w-full px-4 py-2 mb-2 border border-[#FFFFFF] bg-[#FFFFFF] text-sm text-[#434343] rounded-md font-medium"
                      />
                    </>
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
                          <div className="relative group inline-block">
                            <label className="text-sm font-semibold text-[#434343] cursor-help">
                              {pkg.subjects?.length === 1 ? subject : subject}
                            </label>

                            <div
                              className="absolute left-0 top-full z-50 mt-1 
                  hidden group-hover:block 
                  whitespace-nowrap rounded 
                  bg-black px-2 py-1 text-xs text-white shadow-lg"
                            >
                              {subject}
                            </div>
                          </div>

                          <Select
                            placeholder="Lessons Per Week"
                            value={options.find(
                              (opt) => opt.value === lessonCounts[subject],
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
                          <div className="relative group inline-block">
                            <label className="text-sm font-semibold text-[#434343] cursor-help">
                              {pkg.subjects?.length === 1 ? subject : subject}
                            </label>

                            <div
                              className="absolute left-0 top-full z-50 mt-1 
                  hidden group-hover:block 
                  whitespace-nowrap rounded 
                  bg-black px-2 py-1 text-xs text-white shadow-lg"
                            >
                              {subject}
                            </div>
                          </div>

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

                  {studentName.name2 && (
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
                  )}

                  {studentName.name2 && (
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
                          <div className="relative group inline-block">
                            <label className="text-sm font-semibold text-[#434343] cursor-help">
                              {pkg.subjects?.length === 1 ? subject : subject}
                            </label>

                            <div
                              className="absolute left-0 top-full z-50 mt-1 
                  hidden group-hover:block 
                  whitespace-nowrap rounded 
                  bg-black px-2 py-1 text-xs text-white shadow-lg"
                            >
                              {subject}
                            </div>
                          </div>

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
                  )}

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
                        e.stopPropagation();
                        localStorage.removeItem("lessonData");

                        const studyType = packageData?.studyType;

                        console.log("studyLogin:-", studyType);

                        const totalLessons = Object.values(lessonCounts).reduce(
                          (sum, val) => sum + parseInt(val || 0),
                          0,
                        );

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
                                ([x, y]) => a === x && b === y,
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
                            console.log("inside 3");

                            const values = Object.values(lessonCounts)
                              .map((val) => parseInt(val || 0))
                              .filter((v) => v > 0);

                            const isThreeSubjects = values.length === 3;
                            const isEachBetween1And4 = values.every(
                              (v) => v >= 1 && v <= 2,
                            );
                            const totalLessons = values.reduce(
                              (a, b) => a + b,
                              0,
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
                          console.log("yes");
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
                                ([x, y]) => a === x && b === y,
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
                            console.log("inside 3");

                            const values = Object.values(lessonCounts)
                              .map((val) => parseInt(val || 0))
                              .filter((v) => v > 0);

                            const isThreeSubjects = values.length === 3;
                            const isEachBetween1And4 = values.every(
                              (v) => v >= 1 && v <= 4,
                            );
                            const totalLessons = values.reduce(
                              (a, b) => a + b,
                              0,
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
                        // const formDataObject = {
                        //   packageNames,
                        //   packageName,
                        //   studentName,
                        //   lessonCounts,
                        // };
                        const formDataObject = {
                          packageNames: {
                            ...packageNames,
                            total:
                              studentType === "2"
                                ? applySecondStudentDiscount(packageNames.total)
                                : packageNames.total,
                          },
                          packageName,
                          studentName,
                          lessonCounts,
                        };

                        localStorage.setItem(
                          "lessonData",
                          JSON.stringify(formDataObject),
                        );
                        localStorage.setItem("totalLession", pkg.lessons);

                        navigate("/admin/book-class");
                      }}
                      className="w-[102px] bg-[#49479D] text-white py-2 text-base rounded font-medium"
                    >
                      Select
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPackages;
