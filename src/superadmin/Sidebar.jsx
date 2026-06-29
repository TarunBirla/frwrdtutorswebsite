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
          name: "All Clients",
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
          name: "All Tutors",
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
          name: "All Students",
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
          name: "All Invoices",
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
          name: "All Appointments",
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
      <div className="flex justify-center  bg-[#FFF]">
        <div className="w-30 h-16   flex items-center justify-center ">
          <img src="/image 1.png" alt="logo" className="" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 px-3 space-y-1">
        {menus.map((item) => {
          if (item.children) {
            const isMenuActive = item.children.some((sub) => {
              if (location.pathname === sub.path) return true;

              // Client Dashboard -> All Clients Active
              if (
                item.name === "Clients" &&
                sub.name === "All Clients" &&
                location.pathname.startsWith(
                  "/superadmin/clients-student-dashboard",
                )
              ) {
                return true;
              }

              return false;
            });

            const isMenuOpen = openMenu === item.name || isMenuActive;

            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isMenuActive
                      ? "bg-[#FFFFFF] text-[#3C3A86]"
                      : "text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#3C3A86]"
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
                        className={({ isActive }) => {
                          const active =
                            isActive ||
                            (sub.name === "All Clients" &&
                              location.pathname.startsWith(
                                "/superadmin/clients-student-dashboard",
                              ));

                          return `block px-4 py-2 rounded-lg text-sm transition-all ${
                            active
                              ? "bg-[#FFFFFF] text-[#3C3A86] font-medium"
                              : "text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#3C3A86]"
                          }`;
                        }}
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
                    ? "bg-[#FFFFFF] text-[#3C3A86] shadow-md"
                    : "text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#3C3A86]"
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
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[#FFFFFF] hover:bg-red-500 hover:text-[#FFFFFF] transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
