import React from "react";
import { Bell, LogOut, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const pageTitles = {
  "/superadmin/dashboard": "Dashboard",
  "/superadmin/clients": "Clients",
  "/superadmin/tutors": "Tutors",
  "/superadmin/students": "Students",
  "/superadmin/settings": "Settings",
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || "Dashboard";

    const handleLogout = () => {
        localStorage.clear();
        navigate("/superadmin/login");
    };

  return (
    <div className="bg-white h-16 shadow-sm px-6 flex justify-between items-center border-b border-gray-100">
      
      <div>
        
        <h1 className="text-xl font-bold" style={{ color: "#5D4C29" }}>
          {title}
        </h1>
        <p className="text-xs text-gray-400">Welcome back, Admin</p>
      </div>

      <div className="flex items-center gap-3">
        {/* <div className="relative hidden sm:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D4C29]/30 w-52"
          />
        </div> */}

        

        {/* <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <img
            src="https://i.pravatar.cc/40"
            alt="admin"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#5D4C29]/30"
          />
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-gray-800">Admin</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div> */}
        <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-500 hover:text-white transition-all duration-200"
                >
                    <LogOut size={18} />
                    Logout
                </button>
      </div>
    </div>
  );
};

export default Navbar;