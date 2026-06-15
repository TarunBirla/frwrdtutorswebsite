import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SuperAdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        if (
            email === "superadmin@gmail.com" &&
            password === "123456"
        ) {
            localStorage.setItem("superAdminToken", "token123");
            localStorage.setItem("isSuperAdmin", "true");

            navigate("/superadmin/dashboard");
        } else {
            alert("Invalid Credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="w-full max-w-md">
                <div className="bg-white backdrop-blur-lg border border-[#3C3A86] rounded-3xl shadow-2xl p-8">

                    {/* Logo */}
                    <div className="flex justify-center ">
                        <div className="w-30 h-30   flex items-center justify-center ">
                                     <img
            src="/image 1.png"
            alt="logo"
            className=""
          />
                        </div>
                    </div>
           

                    <h2 className="text-3xl font-bold text-center text-[#3C3A86]">
                        Super Admin
                    </h2>

                    <p className="text-center text-[#3C3A86] mt-2 mb-8">
                        Login to access dashboard
                    </p>

                    <form onSubmit={handleLogin}>
                        {/* Email */}
                        <div className="mb-5">
                            <label className="block text-[#3C3A86] mb-2 text-sm">
                                Email Address
                            </label>

                            <input
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-[#3C3A86] text-[#3C3A86] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label className="block text-[#3C3A86] mb-2 text-sm">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-[#3C3A86] text-[#3C3A86] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-4 top-4 text-black hover:text-[#3C3A86]"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash />
                                    ) : (
                                        <FaEye />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-[#3C3A86] hover:bg-indigo-700 text-white font-semibold transition duration-300 shadow-lg"
                        >
                            Login
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            © 2026 Super Admin Panel
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;