import React from "react";

const Header = ({
  title,
  titleImg,
  leftIconOne,
  onLeftOneClick,
  leftIconTwo,
  onLeftTwoClick,
  rightIconOne, // e.g., 🔔
  onRightOneClick,
  rightText, // e.g., "Renew"
  onRightTextClick,
  rightTexticon,
  notification,
  notificationClick,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm py-4 px-6 flex justify-between items-center">
      {/* Left Icons */}
      <div className="flex items-center gap-4">
        {leftIconOne && (
          <button
            onClick={onLeftOneClick}
            className="text-xl font-normal"
            aria-label="Left button one"
          >
            {leftIconOne}
          </button>
        )}
        {leftIconTwo && (
          <button
            onClick={onLeftTwoClick}
            className="text-xl font-bold"
            aria-label="Left button two"
          >
            <img src="/arrowleft.png" alt="" />
          </button>
        )}
      </div>

      {/* Title */}
      {/* <h1 className="text-[18px] font-bold text-[#434343] truncate">{title}</h1> */}

      <h1 className="text-[18px] mr-10  font-bold text-[#434343] truncate">
        {title?.trim() ? (
          title
        ) : (
          <img
            src={titleImg}
            alt="Title"
            className="w-30 h-[28px] object-cover"
          />
        )}
      </h1>

      {/* Right Icons */}
      <div className="flex items-center gap-4">
        {rightIconOne && (
          <button
            onClick={onRightOneClick}
            className="text-xl"
            aria-label="Right icon"
          >
            {rightIconOne}
          </button>
        )}
        {notification && (
          <button
            onClick={notificationClick}
            className="text-sm flex items-center gap-1 text-[#434343] font-medium"
          >
            <img src={notification} alt="" className="w-[20px] h-[20px]" />
          </button>
        )}
        {rightText && (
          <button
            onClick={onRightTextClick}
            className="text-base flex items-center gap-1 text-[#434343] font-medium"
          >
            {rightText}

            {rightTexticon && (
              <img src={rightTexticon} alt="" className="w-[13px] h-[13px]" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
