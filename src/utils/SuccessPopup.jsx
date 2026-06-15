import { Check, Phone } from "lucide-react";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
const SuccessPopup = ({
  onClose,
  title,
  icontop,
  messages = [],
  highlight,
}) => {
  return (
    <div className="fixed inset-0 bg-[#000000]/50 bg-opacity-30 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>

        {/* Check icon with green border */}
        <div className="flex justify-center mb-4">
          {/* <div className="border-2 border-[#65C68F] rounded-full p-2">
            <Check className="text-[#65C68F] w-6 h-6" strokeWidth={2.5} />
          </div> */}
          <img src={icontop} alt="" className="w-11 h-11" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#595959] mb-3">{title}</h2>

        {/* Main message content */}
        <div className="font-medium text-base text-[#595959] space-y-3 mb-3">
          {messages}
        </div>

        {/* Optional highlighted message */}
        {highlight && (
          <div className="flex items-center ">
            <span className=" font-medium text-sm">
              <LocalPhoneIcon fontSize="small" color="#474747" />

              <span className="text-[#A382F0]">{highlight}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessPopup;
