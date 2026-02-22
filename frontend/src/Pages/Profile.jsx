// Profile.jsx
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../utils/supabaseClient";

const getStatusStyles = (theme) => {
  switch (theme) {
    case "approve":
      return "bg-green-100 text-green-700";
    case "reject":
      return "bg-red-100 text-red-700";
    case "late":
      return "bg-orange-100 text-orange-700";
    case "waiting":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function Profile() {
  const [isSortReversed, setIsSortReversed] = useState(false);

  // States
  const [userData, setUserData] = useState({}); // ใช้ Object ว่างเพื่อป้องกัน UI พัง
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter
  const [filterMustReceive, setFilterMustReceive] = useState(true);
  const [filterBorrowing, setFilterBorrowing] = useState(true);
  const [filterMustReturn, setFilterMustReturn] = useState(true);
  const [filterReturned, setFilterReturned] = useState(true);

  useEffect(() => {
    const fetchProfileAndHistory = async () => {
      try {
        setLoading(true);

        // 1. เช็ค Auth ยืนยันตัวตน
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("User not authenticated. Please log in.");
        }

        // 2. ดึงข้อมูล Profile และ History จาก FastAPI
        const response = await fetch(`/api/profile?user_id=${user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data from API");
        }

        const data = await response.json();

        // --- จัดการข้อมูล User ---
        const profileData = data.user[0] || {};

        setUserData({
          ...profileData,
          // 🟢 ใช้ avatar_url จาก FastAPI เป็นหลัก! (ถ้าไม่มีค่อยไปเอาจาก Google Auth สำรอง)
          avatar_url:
            profileData.avatar_url || user.user_metadata?.avatar_url || null,
          // จัด Format ชื่อให้สวยงาม
          name: profileData.first_name
            ? `${profileData.first_name} ${profileData.last_name || ""}`.trim()
            : user.user_metadata?.full_name || user.email,
          email: user.email,
        });

        // --- จัดการข้อมูล History ---
        const statusPriority = {
          late: 1,
          approve: 2,
          waiting: 3,
          returned: 4,
        };
        const toTime = (dateStr) => {
          if (!dateStr) return Infinity;
          const parts = dateStr.split("-");
          if (parts.length !== 3) return Infinity;
          return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
        };

        const transformedData = (data.history || []).map((item) => ({
          ...item,
          _sortPriority: statusPriority[item.status] || 5,
          _sortTimestamp: toTime(item.return_date || item.borrow_date),
        }));

        setItems(transformedData);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndHistory();
  }, []);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (
          filterMustReceive &&
          filterBorrowing &&
          filterMustReturn &&
          filterReturned
        ) {
          return true;
        }

        if (!filterMustReceive && item.status === "waiting") return false;
        if (!filterBorrowing && item.status === "approve") return false;
        if (!filterMustReturn && item.status === "late") return false;
        if (!filterReturned && item.status === "returned") return false;

        return true;
      })
      .sort((a, b) => {
        const sortVal =
          a._sortPriority - b._sortPriority ||
          a._sortTimestamp - b._sortTimestamp ||
          (a.name || "").localeCompare(b.name || "", "th");

        // สลับการเรียงเมื่อกด Reverse
        return isSortReversed ? -sortVal : sortVal;
      });
  }, [
    items,
    isSortReversed,
    filterMustReceive,
    filterBorrowing,
    filterMustReturn,
    filterReturned,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* --- Header Section --- */}
      <div className="bg-[#1a237e] text-white px-6 py-12 max-w-6xl mx-auto shadow-md">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-blue-100 border-2 border-white overflow-hidden shrink-0 flex items-center justify-center">
            {userData?.avatar_url ? (
              <img
                src={userData.avatar_url}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-blue-500 text-xs text-center font-medium">
                No
                <br />
                Image
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {userData.name || "Loading..."}
            </h1>
            <p className="text-sm text-blue-200">
              {userData.email || "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="bg-white rounded-t-3xl -mt-8 px-5 py-6 max-w-6xl mx-auto min-h-screen">
        <p className="text-lg font-bold mb-4 text-gray-800">
          My borrow history
        </p>

        {/* Filters & Sort */}
        <div className="flex items-center justify-between border-b pb-3 mb-4 text-sm text-gray-600">
          <div className="flex flex-wrap gap-x-4 gap-y-3 flex-1">
            <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
              <input
                type="checkbox"
                className="rounded w-4 h-4 border-gray-300 accent-blue-600"
                checked={filterMustReceive}
                onChange={(e) => setFilterMustReceive(e.target.checked)}
              />
              Must Receive
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
              <input
                type="checkbox"
                className="rounded w-4 h-4 border-gray-300 accent-blue-600"
                checked={filterBorrowing}
                onChange={(e) => setFilterBorrowing(e.target.checked)}
              />
              Borrowing
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
              <input
                type="checkbox"
                className="rounded w-4 h-4 border-gray-300 accent-blue-600"
                checked={filterMustReturn}
                onChange={(e) => setFilterMustReturn(e.target.checked)}
              />
              Must Return
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
              <input
                type="checkbox"
                className="rounded w-4 h-4 border-gray-300 accent-blue-600"
                checked={filterReturned}
                onChange={(e) => setFilterReturned(e.target.checked)}
              />
              Returned
            </label>
          </div>

          <button
            onClick={() => setIsSortReversed(!isSortReversed)}
            className={`p-1.5 rounded shrink-0 transition-colors duration-200 
              ${isSortReversed ? "bg-blue-100 text-blue-700 shadow-inner" : "hover:bg-gray-100 text-gray-500"}`}
            title="Toggle Sort"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-300 ${isSortReversed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
          </button>
        </div>

        {/* --- Item grid --- */}
        <p className="text-gray-500 text-sm mb-4">
          Showing {filteredItems.length} Items
        </p>

        {loading && (
          <div className="text-center py-10 animate-pulse text-gray-400 font-medium">
            Loading items...
          </div>
        )}
        {error && (
          <div className="text-center py-10 text-red-500 font-medium bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id || Math.random()} item={item} />
            ))}
          </div>
        )}

        {/* Data not found */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 mx-auto mb-2 opacity-20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <p>No items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemCard({ item }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isReturned = item.status === "returned";
  const isBorrowed = item.status === "approve" || item.status === "late";
  const imageUrl =
    item.image_url ||
    item.items?.image_url ||
    "https://placehold.co/400x250?text=No+Image";
  const remainingTime = DayLeftCalc(item.return_date);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col h-full group">
      {/* Image Area */}
      <div className="h-40 w-full bg-gray-100 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Status Badge */}
        {item.status && (
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase shadow-sm border border-white/50 bg-white/90 ${getStatusStyles(item.status)}`}
          >
            {item.status}
          </span>
        )}

        {/* qty */}
        <span className="absolute bottom-3 right-3 rounded-lg shadow-sm flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold px-2.5 py-1">
          x{item.stock || 1}
        </span>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4">
          {/* item name */}
          <div className="flex-1">
            <span className="text-blue-600 text-[11px] font-bold uppercase tracking-wider block mb-1">
              {item.category || "General"}
            </span>
            <h3
              className="font-bold text-gray-900 text-lg leading-tight line-clamp-2"
              title={item.name}
            >
              {item.name}
            </h3>
          </div>

          {/* --- 3-Dot Menu Logic --- */}
          {(item.status === "waiting" ||
            item.status === "reject" ||
            item.status === "returned") && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
                className={`p-1.5 rounded-full transition-colors ${isMenuOpen ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-10 py-1.5">
                  {/* 1. state == Waiting */}
                  {item.status === "waiting" && (
                    <div>
                      <button
                        onClick={() => {
                          alert(`Edit request: ${item.name}`);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 text-gray-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          alert(`Cancel request: ${item.name}`);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4 text-orange-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* 2. state == Reject or Returned */}
                  {(item.status === "reject" || item.status === "returned") && (
                    <button
                      onClick={() => {
                        alert(`Delete history: ${item.name}`);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-red-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* location & details */}
        <div className="mt-3 text-sm text-gray-600 flex-1 whitespace-pre-line">
          {item.location ? (
            <p>{item.location}</p>
          ) : (
            <p className="text-gray-400 italic">ไม่ระบุรายละเอียด/สถานที่</p>
          )}
        </div>

        {/* borrow time */}
        <div className="mt-3 text-sm text-gray-400 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            <span>Borrow date: {item.borrow_date || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            <span>Return date: {item.return_date || "N/A"}</span>
          </div>
        </div>

        {/* Actions (Button) */}
        {isReturned ? (
          <div className="flex justify-between mt-5 pt-4 border-t border-gray-100 items-center">
            <button
              onClick={() => alert(`Reporting issue for: ${item.name}`)}
              className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z"
                />
              </svg>
              Report
            </button>

            <button
              onClick={() => alert(`Borrow again: ${item.name}`)}
              className="bg-[#1a237e] hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-95"
            >
              Borrow Again
            </button>
          </div>
        ) : isBorrowed ? (
          <div className="flex justify-between mt-5 pt-4 border-t border-gray-100 items-center">
            {remainingTime && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border
                ${
                  remainingTime.status === "overdue"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : remainingTime.status === "today"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : remainingTime.status === "normal"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <span>{remainingTime.text}</span>
              </div>
            )}

            <button
              onClick={() => alert(`Returning item: ${item.name}`)}
              className="bg-[#1a237e] hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-95"
            >
              Return Item
            </button>
          </div>
        ) : (
          <div className="flex justify-end mt-5 pt-4 border-t border-gray-100 items-center">
            <button
              disabled
              className="bg-gray-200 text-gray-400 text-sm font-medium px-4 py-2 rounded-lg cursor-not-allowed"
            >
              Return Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DayLeftCalc(returnDateStr) {
  if (!returnDateStr) return { text: "N/A", status: null };

  const parts = returnDateStr.split("-");
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;
  const returnDate = new Date(year, month - 1, day);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  returnDate.setHours(0, 0, 0, 0);

  const diffTime = returnDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `เลยกำหนด ${Math.abs(diffDays)} วัน`, status: "overdue" };
  } else if (diffDays === 0) {
    return { text: "ครบกำหนดวันนี้", status: "today" };
  } else {
    return { text: `เหลือ ${diffDays} วัน`, status: "normal" };
  }
}
