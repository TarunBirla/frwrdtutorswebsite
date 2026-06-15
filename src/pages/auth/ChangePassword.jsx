import React, { useState } from "react";
import { data, useNavigate, useParams } from "react-router-dom";
import http from "../../service/http";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.new_password !== formData.confirm_password) {
      toast.error("New password and confirm password does not match.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await http.post(`/changepassword/${id}`, {
        newPassword: formData.new_password,
      });

      const data = response.data;

      toast.success(`${data.message}`, {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed", {
        position: "top-right",
        autoClose: 3000,
      });
      setError(err.response?.data?.message || "Password change failed");
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
      <img
        src="/image 1.png"
        alt="FRWRD Logo"
        className="w-[206px] mt-4 lg:mt-10"
      />
      <img
        src="/top.png"
        alt="Top Style"
        className="w-full h-auto mb-[-50px] lg:hidden"
      />

      <div className="w-full max-w-sm px-4 lg:pt-15">
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow-lg rounded-xl p-6 relative z-10">
            <img
              src="/lock.png"
              alt="lock"
              className="w-[57px] h-[57px] absolute top-4  right-4"
            />
            <h2 className="text-[28px] font-roboto text-[#434343] font-bold mb-8">
              Change Password
            </h2>

            {/* <label className="block text-sm font-roboto text-[#434343] mb-1">
              New Password
            </label>
            <div className="relative mb-4">
              <input
                type={showNewPassword ? "text" : "password"}
                name="new_password"
                required
                placeholder="New password"
                value={formData.new_password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#49479D] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <label className="block text-sm font-roboto text-[#434343] mb-1">
              Confirm New Password
            </label>
            <div className="relative mb-5">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                required
                placeholder="Confirm new password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#49479D] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div> */}

            <label className="block text-sm font-roboto text-[#434343] mb-1">
              New Password
            </label>
            <div className="relative mb-4">
              <input
                type={showNewPassword ? "text" : "password"}
                name="new_password"
                required
                placeholder="New password"
                value={formData.new_password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#49479D] pr-10"
              />
              {formData.new_password.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              )}
            </div>

            <label className="block text-sm font-roboto text-[#434343] mb-1">
              Confirm New Password
            </label>
            <div className="relative mb-5">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                required
                placeholder="Confirm new password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#49479D] pr-10"
              />
              {formData.confirm_password.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-[156px] bg-[#49479D] text-[22px] text-white py-2 rounded-md font-normal hover:bg-[#3c3a86] transition"
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
                  "Change"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <img
        src="/bottomstyle.png"
        alt="Bottom Style"
        className="w-full h-auto mt-6 object-fill lg:hidden"
      />
    </div>
  );
};

export default ChangePassword;
