import React from "react";
import { X } from "lucide-react";

const CustomActionPopup = ({ title, actions, onClose, onSelect }) => {
  const [selectedValue, setSelectedValue] = React.useState(null);

  const handleSelect = (value) => {
    setSelectedValue(value);
    // Optional: auto-close after selection or wait for user to close
    setTimeout(() => {
      onSelect(value);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/50 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#FFFFFF] rounded-lg w-[320px] p-6 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[#3C3C3C] hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center">
          <div className="text-center mt-2  mb-6">
            <p className="text-[#434343] w-[221px] text-[18px] font-bold leading-relaxed">
              {title}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {actions.map((action, idx) => {
            const isSelected = selectedValue === action.value;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(action.value)}
                className={`w-full py-3 px-4 rounded-lg text-base font-medium transition duration-200 border ${
                  action.variant === "primary"
                    ? isSelected
                      ? "bg-[#49479D] text-[#FFFFFF] border-[#49479D]"
                      : "border-[#49479D] text-[#49479D] hover:bg-blue-50"
                    : isSelected
                    ? "bg-[#8E3D96] text-[#FFFFFF] border-[#8E3D96]"
                    : "border-[#8E3D96] text-[#8E3D96] hover:bg-pink-50"
                }`}
              >
                <div className="text-center">
                  <div className="font-medium">{action.label}</div>
                  {action.subtitle && (
                    <div
                      className={`text-base  ${
                        isSelected ? "text-[#FFFFFF] opacity-90" : ""
                      }`}
                    >
                      {action.subtitle}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default CustomActionPopup;
