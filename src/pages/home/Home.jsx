import React from "react";

const Home = () => {
  return (
    <div>
      <div className="relative h-screen w-full overflow-hidden">
        {/* Background image */}
        <img
          src="/Group 171.png"
          alt="background"
          className="absolute top-0 left-0 w-full h-full object-fill z-0"
        />

        {/* Foreground content over the image */}
        <div className="absolute top-0 left-0 z-10 h-full w-full pt-62 text-center text-[#333] flex flex-col items-center justify-center">
          <img
            src="/image 1.png"
            alt="logo"
            className="w-[220px] h-auto mb-3"
          />
          <div className="mt-2">
            <p className="text-[20px] text-[#434343] leading-normal font-medium mb-1">
              Discover your next skill
              <br />
              Learn anything you want!
            </p>
            <p className="text-[15px] mt-4 font-medium text-[#C6C6C6] mb-4">
              Learn and grow
            </p>
          </div>
          <a href="/login">
            <button className="bg-[#49479D] mt-6 text-[#FFFFFF] rounded-[6px] px-10 py-2 text-[22px] font-normal border-none">
              Get Started
            </button>
          </a>
          <p className="mt-20 lg:mt-25 mb-0  text-[12px] font-medium text-[#C6C6C6]">
            www.frwrddtutors.com/
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
