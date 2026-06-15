import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import http from "../../service/http";
import { toast } from "react-toastify";


const FeedbackPopup = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  let userData = null;

  try {
    const raw = localStorage.getItem("userdata");
    userData = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing userdata:", error);
  }

  const handleSubmit = async () => {
     if (!userData) {
    toast.error("User data not found. Please login again.");
    return;
  }

  if (!rating) {
    toast.error("Please select a rating");
    return;
  }

  if (!description.trim()) {
    toast.error("Please write your feedback");
    return;
  }

    const payload = {
      clientid: userData.clientid,
      client_email: userData.email,
      review_number: rating,
      description: description,
    };

    try {
      setLoading(true);
      const response = await http.post("/sendReviewEmail", payload);
      console.log("Review submitted:", response.data);
      if (response.data.success) {
         toast.success("Thank you! Your feedback has been submitted.");
        setRating(0);
        setDescription("");
        onClose();
      }  else {
      toast.error(response.data?.error || "Something went wrong");
    }
    } catch (error) {
       toast.error(
      error.response?.data?.error ||
      "Failed to submit feedback. Please try again later."
    );
      console.error("Error sending review:", error);
    } finally {
    setLoading(false); // ✅ STOP LOADING (ALWAYS)
  }

    // Send data to parent
    // Close popup
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000]/50 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-96 transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 text-center">Rate Us</h2>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <FaStar
                key={index}
                size={32}
                className={`cursor-pointer transition ${
                  ratingValue <= (hover || rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                onClick={() => setRating(ratingValue)}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </div>

        {/* Rating Count */}
        <p className="text-center text-sm mb-3 text-gray-600">
          {rating > 0 ? `You rated ${rating} star(s)` : "Tap a star to rate"}
        </p>

        {/* Feedback Textarea */}
        <textarea
          placeholder="Write your feedback..."
          className="w-full border border-gray-300  font-semibold rounded-lg p-3 mb-4 focus:ring focus:ring-blue-200 text-sm"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        {/* Buttons */}
        <div className="flex justify-between gap-3">
          <button
            onClick={onClose}
            className="w-1/2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
           disabled={loading}
            onClick={handleSubmit}
            className={`w-1/2 px-4 py-2 rounded-lg text-sm
    ${loading ? "bg-gray-400" : "bg-[#49479D] text-white"}`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPopup;
