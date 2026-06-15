import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../utils/header/Header";
import Sidebar from "../../utils/sidebar/Sidebar";
import { useNavigate } from "react-router-dom";

const ClientPackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  let userData = null;

  try {
    const raw = localStorage.getItem("userdata");
    userData = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing userdata:", error);
  }
  useEffect(() => {
    axios
      .get(`/client-packages/${userData.clientid}`)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setPackages(res.data.data);
        }
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const navigate = useNavigate();

  const handleClick = (pkg) => {
    console.log("Clicked:", { id: pkg.id, clientid: pkg.clientid });
    console.log("Clicked:", pkg);

    localStorage.setItem("remainingId", pkg.id);
    localStorage.setItem("bookedClassess", pkg.booked_classess);

    localStorage.setItem("remainingClassess", pkg.remaining_classess);

    navigate("/remaining-package");
  };

  return (
    <div className="bg-[#EEEDFE] p-4 w-full min-h-screen"
     style={{
    backgroundImage: "url('/Background.png')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#EEEDFE", // ya koi fallback color
  }}>
      <Header
        title="Remaining Classes"
        leftIconOne="☰"
        onLeftOneClick={() => setIsMenuOpen(true)}
        leftIconTwo
        onLeftTwoClick={() => window.history.back()}
        rightText="Renew"
        onRightTextClick={() => navigate("/new-booking")}
      />

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className="mt-15 xl:mt-20 flex justify-center items-center">
        {/* <h1 className="text-xl sm:text-2xl font-bold mb-4 text-start">
          Client Packages
        </h1> */}
        <div className="max-w-md mx-auto w-full">
          <div className="flex flex-col space-y-2 w-full">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition duration-300"
                onClick={() => handleClick(pkg)}
              >
                {/* <p className="text-sm sm:text-base">
                <strong>Purchased Status:</strong> {pkg.purches_status || "N/A"}
              </p> */}
                <p className="text-sm sm:text-base">
                  <strong>Booked Classes:</strong> {pkg.booked_classess}
                </p>
                <p className="text-sm sm:text-base">
                  <strong>Total Classes:</strong> {pkg.total_classess || "N/A"}
                </p>
                <p className="text-sm sm:text-base">
                  <strong>Remaining Classes:</strong>{" "}
                  {pkg.remaining_classess || "N/A"}
                </p>
                {/* <p className="text-sm sm:text-base">
                <strong>Completed Classes:</strong> {pkg.completed_classess}
              </p> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPackagesPage;
