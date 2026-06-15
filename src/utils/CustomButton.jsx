// components/CustomButton.jsx

import React from "react";

const CustomButton = ({
  text,
  type,
  width = "157px",
  height = "51px",
  onClick,
  disable,
}) => {
  return (
    <div className="flex items-center justify-end">
      <button
        type={type}
        onClick={onClick}
        disabled={disable}
        className={`flex items-center justify-center text-[#FFFFFF] rounded-[6px] text-base font-semibold shadow`}
        style={{
          backgroundColor: "#49479D",
          width,
          height,
        }}
      >
        {text}
      </button>
    </div>
  );
};

export default CustomButton;
