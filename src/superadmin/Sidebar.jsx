import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    UserCog,
    GraduationCap,
    Settings,
    LogOut,
} from "lucide-react";

const Sidebar = () => {
    const navigate = useNavigate();

    const menus = [
        {
            name: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            path: "/superadmin/dashboard",
        },
        {
            name: "Clients",
            icon: <Users size={20} />,
            path: "/superadmin/clients",
        },
        {
            name: "Tutors",
            icon: <UserCog size={20} />,
            path: "/superadmin/tutors",
        },
        {
            name: "Students",
            icon: <GraduationCap size={20} />,
            path: "/superadmin/students",
        },
        {
            name: "Invoices",
            icon: <Settings size={20} />,
            path: "/superadmin/invoices",
        },
        {
            name: "Appointments",
            icon: <Settings size={20} />,
            path: "/superadmin/appointments",
        },
  
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate("/superadmin/login");
    };

    return (
        <div
            className="w-64 min-h-screen flex flex-col shadow-xl"
            style={{ backgroundColor: "#3C3A86" }}
        >
            {/* Logo / Brand */}
            <div className="px-6 py-5 bg-[#fff] border-b border-white/20">
                <div className="flex items-center gap-3">
                    {/* <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <LayoutDashboard size={18} className="text-white" />
                    </div> */}
                    <div>
                                                   <img
            src="/image 1.png"
            alt="logo"
            className=" h-5 w-auto object-cover"
          />
                        {/* <h2 className="text-[] text-base font-bold leading-tight">
                            Super Admin
                        </h2>
                        <p className="text-white/50 text-xs">FRWRD Tutors</p> */}
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 mt-4 px-3 space-y-1">
                {menus.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? "bg-white text-[#3C3A86] shadow-md"
                                    : "text-white/80 hover:bg-white/15 hover:text-white"
                            }`
                        }
                    >
                        {item.icon}
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-5">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-red-500 hover:text-white transition-all duration-200"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
