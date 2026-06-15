import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../../service/http";
import { toast } from "react-toastify";
const Forgotpassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await http.post("/forget_password", formData); // Adjust the URL
      const data = response.data;

      // Save JWT token or user data if needed
      console.log(data.message);
      toast.success(`${data.message}`, {
        position: "top-right",
        autoClose: 2000,
      });
      //   localStorage.setItem("userdata", JSON.stringify(data.user));
      //   localStorage.setItem("token", data.token);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submit failed", {
        position: "top-right",
        autoClose: 3000,
      });
      setError(err.response?.data?.message || "Submit failed");
      console.log(err || "Submit failed");
    } finally {
      setLoading(false); // Stop loading
    }
  };
  return (
    <div className="h-screen bg-[#EEEDFE] overflow-y-hidden flex flex-col items-center justify-start pt-6 "
     style={{
    backgroundImage: "url('/Background.png')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#EEEDFE", // ya koi fallback color
  }}>
      {/* Logo */}
      <img
        src="/image 1.png"
        alt="FRWRD Logo"
        className="w-[206px] h-auto mt-4 lg:mt-10"
      />

      {/* Top Wave/Style Image */}
      <img
        src="/top.png"
        alt="Top Style"
        className="w-full h-auto mb-[-50px] lg:hidden"
      />

      {/* Login Card */}
      <div className="w-full max-w-sm px-4 lg:pt-15">
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow-lg rounded-xl  p-6 relative z-10">
            {/* Lock Icon */}
            <img
              src="/lock.png"
              alt="lock"
              className="w-[57px] h-[57px] absolute top-4  right-4"
            />

            {/* Title */}
            <h2 className="text-3xl font-roboto text-[#434343]  font-bold  mb-10">
              Forgot Password
            </h2>

            {/* Email */}
            <label className="block text-sm font-roboto font-medium text-[#434343] mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="Your registered email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-3 border placeholder:text-[#989691] border-[#CCCCCC] rounded-md text-sm font-medium  focus:outline-none focus:ring-2 focus:ring-[#49479D]"
            />

            {/* Password 
            <label className="block text-sm font-roboto font-medium text-[#434343] mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full mb-5 px-4 py-3 border font-normal border-[#CCCCCC] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#49479D]"
            />
            */}

            {/* Button */}
            <div className="flex items-center justify-end gap-4">
              {/* <Link to="/dashboard"> */}
              <button
                onClick={() => navigate("/login")}
                className=" bg-[#EEEEEE] px-4 text-[#434343] py-2 rounded-md font-normal text-base hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className=" bg-[#49479D] px-4 text-[#FFFFFF] py-2 rounded-md font-normal text-base hover:bg-[#3c3a86] transition"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    ></path>
                  </svg>
                ) : (
                  "Submit"
                )}
              </button>
              {/* </Link> */}
            </div>

            {/* Divider */}
            {/*<hr className="my-5 w-full h-0 border border-[#DADADA]" />*/}

            {/* Bottom Links */}
            {/* <div className="text-center text-sm space-y-2">
              <a
                href="#"
                className="text-[#A6A6A6] text-sm font-medium underline"
              >
                Forgot password ?
              </a>
              <br />
              <a
                href="/student-form"
                className="text-[#A6A6A6] text-sm font-medium underline"
              >
                Request a new profile
              </a>
            </div> */}
          </div>
        </form>
      </div>

      {/* Bottom Wave Image */}
      <img
        src="/bottomstyle.png"
        alt="Bottom Style"
        className="w-full h-auto mt-6 object-fill lg:hidden"
      />
    </div>
  );
};

export default Forgotpassword;
