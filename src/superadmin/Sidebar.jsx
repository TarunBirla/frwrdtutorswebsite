import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  GraduationCap,
  Receipt,
  Wallet,
  CalendarDays,
  ChevronRight,
  ChevronDown,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const menus = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/superadmin/dashboard",
  },

  

   {
    name: "Clients",
    icon: <Users size={20} />,
    children: [
      {
        name: "Dashboard",
        path: "/superadmin/clients-dashboard",
      },
      {
        name: "Clients",
        path: "/superadmin/clients",
      },
    ],
  },

  {
    name: "Tutors",
    icon: <UserCog size={20} />,
    children: [
      {
        name: "Dashboard",
        path: "/superadmin/tutors-dashboard",
      },
      {
        name: "Tutors",
        path: "/superadmin/tutors",
      },
    ],
  },

  {
    name: "Students",
    icon: <GraduationCap size={20} />,
    children: [
      {
        name: "Dashboard",
        path: "/superadmin/students-dashboard",
      },
      {
        name: "Students",
        path: "/superadmin/students",
      },
    ],
  },

  {
    name: "Invoices",
    icon: <Receipt size={20} />,
    children: [
      {
        name: "Dashboard",
        path: "/superadmin/invoices-dashboard",
      },
      {
        name: "Invoices",
        path: "/superadmin/invoices",
      },
    ],
  },

  {
    name: "Payments",
    icon: <Wallet size={20} />,
    path: "/superadmin/payments-dashboard",
  },

  {
    name: "Appointments",
    icon: <CalendarDays size={20} />,
    children: [
      {
        name: "Dashboard",
        path: "/superadmin/appointments-dashboard",
      },
      {
        name: "Appointments",
        path: "/superadmin/appointments",
      },
    ],
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
      {/* Logo */}
      <div className="px-6 py-5 bg-white border-b border-white/20">
        <img
          src="/image 1.png"
          alt="logo"
          className="h-5 w-auto object-cover"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 px-3 space-y-1">
        {menus.map((item) => {
          if (item.children) {
            const isMenuActive = item.children.some(
              (sub) => location.pathname === sub.path
            );

            const isMenuOpen =
              openMenu === item.name || isMenuActive;

            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isMenuActive
                      ? "bg-white text-[#3C3A86]"
                      : "text-white/80 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.name}
                  </div>

                  {isMenuOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                {isMenuOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((sub) => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        className={({ isActive }) =>
                          `block px-4 py-2 rounded-lg text-sm transition-all ${
                            isActive
                              ? "bg-white text-[#3C3A86] font-medium"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                          }`
                        }
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
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
          );
        })}
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