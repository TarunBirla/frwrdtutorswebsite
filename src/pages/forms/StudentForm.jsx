import React, { useState } from "react";
import Select from "react-select";
import SuccessPopup from "../../utils/SuccessPopup";
import CustomButton from "../../utils/CustomButton";
import { useNavigate } from "react-router-dom";

const StudentForm = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    students: "",
    email: "",
    phone: "",
    agree: false,
  });

  const handleChange = (eOrValue, actionMeta) => {
    if (actionMeta) {
      // react-select
      setFormData((prev) => ({
        ...prev,
        [actionMeta.name]: eOrValue.value,
      }));
    } else {
      const { name, value, type, checked } = eOrValue.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agree) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    const studentCount = parseInt(formData.students);
    console.log(studentCount);
    if (!isNaN(studentCount)) {
      setShowPopup(true);
      // setTimeout(() => {
      //   navigate("/");
      // }, 3000);
    } else {
      console.log("Form Data (1-2 students):", formData);
      // Make API call here
    }
  };

  const studentOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3+" },
  ];

  return (
    <div className="min-h-screen bg-[#EEEDFE] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-md p-6 shadow-sm space-y-6"
      >
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full text-base font-semibold text-[#6A6A6A] border border-[#CCCCCC] rounded px-3 py-2 focus:outline-none"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full text-base font-semibold text-[#6A6A6A] border border-[#CCCCCC] rounded px-3 py-2 focus:outline-none"
        />

        {/* Updated Students Dropdown */}
        <div>
          <Select
            placeholder="Number of Students"
            name="students"
            options={studentOptions}
            value={studentOptions.find(
              (opt) => opt.value === formData.students
            )}
            onChange={handleChange}
            className="text-sm text-[#6A6A6A] font-medium"
            styles={{
              control: (provided) => ({
                ...provided,
                borderRadius: 6,

                borderColor: "#CCCCCC",
                boxShadow: "none",
                paddingTop: 2,
                paddingBottom: 2,
              }),
            }}
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full text-base font-semibold text-[#6A6A6A] border border-[#CCCCCC] rounded px-3 py-2 focus:outline-none"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full text-base font-semibold text-[#6A6A6A] border border-[#CCCCCC] rounded px-3 py-2 focus:outline-none"
        />

        <label className="flex items-start text-sm gap-2">
          <input
            type="checkbox"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
            className="w-5 h-5 accent-black border border-[#C5C5C5] rounded-sm"
          />

          <span className="text-[#6A6A6A] text-sm font-normal">
            I have read and agree to the{" "}
            <a href="#" className="text-[#A382F0] ">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#A382F0] ">
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <div className="py-8 flex items-start">
          <CustomButton
            type="submit"
            text="Submit Form"
            width="157px"
            height="51px"
          />
        </div>
      </form>
      {showPopup && (
        <SuccessPopup
          icontop={
            parseInt(formData.students) > 2 ? "/thumb.png" : "/tick2.png"
          }
          title={
            parseInt(formData.students) > 2
              ? "Thank You! We've Received Your Request"
              : "Thank You! We've Received Your Quote Request"
          }
          messages={
            parseInt(formData.students) > 2
              ? [
                  "We’ve successfully received your details for booking a consultation for 3 children.",
                  "Since bookings for 3 or more children are handled personally, one of our representatives will contact you shortly to assist you with tutor selection, time slot options, and the next steps.",
                ]
              : [
                  "For 1 or 2 children, we’ve sent you a link with your username and password to book a tutor and choose your preferred time slots online.",
                  "Please check your email for the login details and next steps.",
                ]
          }
          highlight={
            parseInt(formData.students) > 2
              ? "No need to take further action — we’ll be in touch soon!"
              : ""
          }
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default StudentForm;
