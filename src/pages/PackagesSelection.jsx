import React, { useEffect, useState } from "react";
import Header from "../utils/header/Header";
import Sidebar from "../utils/sidebar/Sidebar";
import CustomNotification from "../utils/CustomNotification";
import { useLocation, useNavigate } from "react-router-dom";
import http from "../service/http";
import Select from "react-select";

const PackagesSelection = () => {
  const [rawPackages, setrawPackages] = useState([]);
  const [packagedata, setPackagedata] = useState();
  const id = localStorage.getItem("remainingId");
  const remainingClassess = localStorage.getItem("remainingClassess");

  const [packageData, setPackageData] = useState(null);
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await http.get(`/client-packagesid/${id}`);
        console.log("Fetched data of package:", response.data);
        const packageFormData = JSON.parse(response.data?.data[0].packageForm);
        // const data = response.data;
        console.log("Fetched data of package:", response.data);

        console.log("Fetched data of package:", packageFormData);
        setRemaining(response.data?.data[0]?.remaining_classess);
        setPackageData(packageFormData?.packageFormData);
        localStorage.setItem(
          "packageFormData",
          JSON.stringify(packageFormData?.packageFormData)
        );
        setrawPackages(packageFormData?.lessonData?.packageNames);
      } catch (err) {
        console.error("Error fetching location data:", err);
      }
    };

    fetchData();
  }, []);

  console.log("package data:-", packageData);

  const navigate = useNavigate();

  useEffect(() => {
    if (packageData) {
      console.log("Updated packageData:", packageData);
      console.log("studentCount:", packageData?.subject);
    }
  }, [packageData]);

  // console.log("subjectCount:", packageData?.subject?.length);
  const studentType = localStorage.getItem("studentType");

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

  const [show, setShow] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [lessonCounts, setLessonCounts] = useState({});
  const [lessonCounts2, setLessonCounts2] = useState({});

  const [packageNames, setPackageName] = useState(null);

  const [lessonCount, setLessonCount] = useState(1);
  const [studentName, setStudentName] = useState("");

  // console.log(studentType)

  const totalSubjects = packageData?.subject?.length;
  const totalSubjects1 = packageData?.student1?.subject?.length;
  const totalSubjects2 = packageData?.student2?.subject?.length;

  const safeSubjects =
    packageData?.studyType === "no" && packageData.subject?.length === 0
      ? studentType == 1
        ? packageData?.student1?.subject ?? []
        : packageData?.student2?.subject ?? []
      : packageData?.subject || [];

  console.log("subject:-", safeSubjects);

  console.log("rawPackage:-", rawPackages);

  let filteredPackages = Array.isArray(rawPackages)
    ? rawPackages
    : [rawPackages];

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
    price: "AED 60",
    subjects: safeSubjects,
    remainingClassess: remaining,
  }));

  // console.log(filteredPackages);

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

  return (
    <div className="bg-[#EEEDFE] min-h-screen overflow-x-hidden">
      <Header
        title="Package"
        leftIconOne="☰"
        onLeftOneClick={() => setIsMenuOpen(true)}
        leftIconTwo="←"
        onLeftTwoClick={() => window.history.back()}
        // notification="/notification.png"
        // onRightOneClick={() => alert("Notifications")}
        rightText="Renew"
        onRightTextClick={() => navigate("/new-booking")}
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

        <div className="space-y-4">
          {filteredPackages.map((pkg, index) => (
            <div>
              <h2 className="text-[18px] font-bold text-[#17215F] mb-2">
                Remaining Classess: {pkg?.remainingClassess}
              </h2>
              <div
                key={index}
                className="relative bg-white rounded-xl  shadow-md cursor-pointer"
                onClick={() => {
                  // setExpandedIndex(index === expandedIndex ? null : index)
                  const isCollapsing = index === expandedIndex;
                  setExpandedIndex(isCollapsing ? null : index);
                  setPackageName(isCollapsing ? null : pkg);
                }}
              >
                {pkg.mostPopular && (
                  <div className="absolute  right-0">
                    <img
                      src="/mostpopular.png"
                      alt=""
                      className="object-cover w-[100px] h-[111px]"
                    />
                  </div>
                )}

                <div className="p-4">
                  <h3 className="text-[28px] text-[#434343] font-bold mb-3">
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
                        <span className="text-[#49479D] font-medium text-[12px]">
                          {pkg.lession2}
                        </span>
                      </span>
                      <span className="text-[#434343] text-[24px] font-bold">
                        {pkg.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Expanded Section */}
              {expandedIndex === index && (
                <div className="bg-[#EAE7FF] p-4 rounded-b-md">
                  <p className="text-base font-bold mb-3 text-[#434343]">
                    Kindly select number of lessons required per week for each
                    subject
                  </p>

                  {studentName.name1 && (
                    <>
                      <label className="block mb-1 text-base text-[#434343] font-medium">
                        1st Student Name
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
                            options={options}
                            styles={customStyles}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {studentName.name1 && packageData?.studyType === "no" && (
                    <div className="grid grid-cols-2 gap-4 mt-1 mb-4">
                      {(pkg.subjects?.length
                        ? pkg.subjects
                        : packageData?.student1?.subject || []
                      ).map((subject) => (
                        <div key={subject}>
                          <label className="text-sm font-semibold text-[#434343]">
                            {subject}
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
                    <div className="grid grid-cols-2 gap-4 mt-1 mb-4">
                      {(pkg.subjects?.length
                        ? pkg.subjects
                        : packageData?.student2?.subject || []
                      ).map((subject) => (
                        <div key={subject}>
                          <label className="text-sm font-semibold text-[#434343]">
                            {subject}
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

                        const studyType = packageData?.studyType;

                        console.log("studyLogin:-", studyType);

                        const totalLessons = Object.values(lessonCounts).reduce(
                          (sum, val) => sum + parseInt(val || 0),
                          0
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
                            console.log("inside 3");

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
                            console.log("inside 3");

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
                        //  else if (studyType == "no") {
                        //   console.log("no");

                        //   if (packageName === "SILVER") {
                        //     const student1Lessons = Object.values(
                        //       lessonCounts?.student1 || {}
                        //     )
                        //       .map((val) => parseInt(val || 0))
                        //       .filter((v) => v > 0);

                        //     const student2Lessons = Object.values(
                        //       lessonCounts?.student2 || {}
                        //     )
                        //       .map((val) => parseInt(val || 0))
                        //       .filter((v) => v > 0);

                        //     console.log("studentLessons:-", student1Lessons);

                        //     const validPairs = [
                        //       [1, 1],
                        //       [2, 2],
                        //       [1, 2],
                        //       [2, 1],
                        //     ];

                        //     if (
                        //       student1Lessons.length === 1 &&
                        //       student2Lessons.length === 1
                        //     ) {
                        //       const a = student1Lessons[0];
                        //       const b = student2Lessons[0];

                        //       const isValid = validPairs.some(
                        //         ([x, y]) => a === x && b === y
                        //       );

                        //       if (!isValid) showWarning = true;
                        //     } else {
                        //       showWarning = true;
                        //     }
                        //   } else if (
                        //     ["PLATINUM", "GOLD"].includes(packageName) &&
                        //     (packageData?.student1.subject?.length === 1 ||
                        //       packageData?.student1.subject?.length === 2)
                        //   ) {
                        //     const student1Lessons = Object.values(
                        //       lessonCounts?.student1 || {}
                        //     )
                        //       .map((val) => parseInt(val || 0))
                        //       .filter((v) => v > 0);
                        //     const student2Lessons = Object.values(
                        //       lessonCounts?.student2 || {}
                        //     )
                        //       .map((val) => parseInt(val || 0))
                        //       .filter((v) => v > 0);

                        //     const allLessons = [
                        //       ...student1Lessons,
                        //       ...student2Lessons,
                        //     ];
                        //     const isValid = allLessons.every((v) =>
                        //       [1, 2, 3, 4].includes(v)
                        //     );

                        //     if (!isValid) {
                        //       showWarning = true;
                        //     }
                        //   } else if (
                        //     ["PLATINUM", "GOLD"].includes(packageName) &&
                        //     pkg.subjects?.length === 3
                        //   ) {
                        //     console.log("inside 3");

                        //     const student1Lessons = Object.values(
                        //       lessonCounts?.student1 || {}
                        //     )
                        //       .map((val) => parseInt(val || 0))
                        //       .filter((v) => v > 0);
                        //     const student2Lessons = Object.values(
                        //       lessonCounts?.student2 || {}
                        //     )
                        //       .map((val) => parseInt(val || 0))
                        //       .filter((v) => v > 0);

                        //     const values = [
                        //       ...student1Lessons,
                        //       ...student2Lessons,
                        //     ];
                        //     const isThreeSubjects = values.length === 3;
                        //     const isEachBetween1And4 = values.every(
                        //       (v) => v >= 1 && v <= 4
                        //     );
                        //     const totalLessons = values.reduce(
                        //       (a, b) => a + b,
                        //       0
                        //     );
                        //     const isTotalValid = totalLessons <= 12;

                        //     const isValid =
                        //       isThreeSubjects &&
                        //       isEachBetween1And4 &&
                        //       isTotalValid;

                        //     if (!isValid) {
                        //       showWarning = true;
                        //     }
                        //   }
                        // }

                        if (showWarning) {
                          setShow(true);
                          setTimeout(() => setShow(false), 3000);
                          return;
                        }

                        // Proceed with booking
                        setExpandedIndex(null);
                        const formDataObject = {
                          packageNames,
                          packageName,
                          studentName,
                          lessonCounts,
                        };

                        // const selectedSlotsPerWeek = 3; // default selection

                        // Calculate total lessons count
                        // const totalLessonCount = Object.values(
                        //   formDataObject.lessonCounts
                        // ).reduce((acc, val) => acc + val, 0);

                        // const totalSlotsNeeded =
                        //   totalLessonCount * selectedSlotsPerWeek;

                        // if (totalSlotsNeeded >= remainingClassess) {
                        //   console.error(
                        //     "❌ Cannot proceed. Total slots selected exceed remaining classes."
                        //   );
                        //   alert(`You have only ${remainingClassess} remaining classes,
                        //     but you're trying to book ${totalSlotsNeeded}. Reduce weekly slots or subjects.`);
                        //   return;
                        // }

                        localStorage.setItem(
                          "lessonData",
                          JSON.stringify(formDataObject)
                        );
                        localStorage.setItem("totalLession", pkg.lessons);

                        navigate("/remainingbookclass");
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

export default PackagesSelection;
