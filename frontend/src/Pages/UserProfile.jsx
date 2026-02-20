import React, { useState, useEffect } from 'react';

const getStatusStyles = (theme) => {
  switch (theme) {
    case 'approve': return 'bg-green-100 text-green-700';
    case 'reject': return 'bg-red-100 text-red-700';
    case 'late': return 'bg-orange-100 text-orange-700';
    case 'waiting': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export default function ProfilePage() {
  // Test data
  const [currentUserId, setCurrentUserId] = useState('user_002');

  // State
  const [userData, setUserData] = useState(currentUserId);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter
  const [filterReceive, setFilterReceive] = useState(false);
  const [filterReturn, setFilterReturn] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // ยิง API ไปพร้อมกับ ID ของคนที่กำลังใช้งานอยู่
        const response = await fetch(`http://localhost:8000/api/users/${currentUserId}/borrow-history`);
        if (!response.ok) { throw new Error("Failed to fetch history"); }
        
        const data = await response.json(); 
        
        setUserData(data.user);       // user's profile data
        setItems(data.history || []); // borrowed history data

      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false); 
      }
    };

    fetchHistory();
  }, [currentUserId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">

      {/* --- Header Section --- */}
      <div className="bg-[#1a237e] text-white px-6 py-12 max-w-6xl mx-auto shadow-md">
        <div className='flex items-center gap-5'>
          <div className="w-20 h-20 rounded-full bg-blue-100 border-2 border-white overflow-hidden shrink-0 flex items-center justify-center">
            {userData?.avatar_url ? (
              <img src={userData.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
               <span className="text-blue-500 text-xs text-center">No<br/>Image</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userData.name || 'loading...'}</h1>
            <p className="text-sm text-blue-200">{userData.email || 'loading...'}</p>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="bg-white rounded-t-3xl -mt-8 px-5 py-6 max-w-6xl mx-auto min-h-screen">
        <p className='text-lg font-bold mb-4 text-gray-800'>My borrow history</p>

        {/* Filters & Sort */}
        <div className="flex items-center justify-between border-b pb-3 mb-4 text-sm text-gray-600">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded w-4 h-4 border-gray-300"
                checked={filterReceive} onChange={(e) => setFilterReceive(e.target.checked)} />
              Must Recieve
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded w-4 h-4 border-gray-300"
                checked={filterReturn} onChange={(e) => setFilterReturn(e.target.checked)} />
              Must Return
            </label>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            {/* ไอคอน Filter/Sort */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
        </div>

        {/* --- Item grid --- */}
        <p className="text-gray-500 text-sm mb-4">Showing {items.length} Items</p>

        {loading && <div className="text-center py-10 animate-pulse">Loading items...</div>}
        {error && <div className="text-center py-10 text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Data not found */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2 opacity-20">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p>No items found matching your criteria.</p>
          </div>
        )}
      </div>

    </div>
  )
}

function ItemCard({ item }) {
  // test assets
  const isBorrowed = item.status === 'approve' || item.status === 'late'
  const imageUrl = item.image_url || item.items?.image_url || "https://placehold.co/400x250?text=No+Image";

  return (
    <div className='bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col h-full group'>

      {/* Image Area */}
      <div className='h-40 w-full bg-gray-100 relative overflow-hidden'>
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Status Badge */}
        {item.status && (
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase shadow-sm border border-white/50 bg-white/90 ${getStatusStyles(item.status)}`}>
            {item.status}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">

        {/* item name */}
        <div>
          <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-1">
            {item.category || 'General'}
          </span>
          <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
        </div>

        {/* location & details */}
        <div className='mt-3 text-sm text-gray-600 flex-1 whitespace-pre-line'>
          {item.location ? (
            <p>{item.location}</p>
          ) : (
            <p className="text-gray-400 italic">ไม่ระบุรายละเอียด/สถานที่</p>
          )}
        </div>

        {/* borrow time */}
        <div className='mt-3 text-xs text-gray-400 items-center gap-1'>
          <div className='flex'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>Borrow date: {item.borrow_date || "N/A"}</span>
          </div>
          <div className='flex'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>Return date: {item.return_date || "N/A"}</span>
          </div>
        </div>

        {/* Actions (Button) */}
        {isBorrowed ? (
          <div className='flex justify-between mt-5 pt-4 border-t border-gray-100 items-center'>
            {/* Report Issue */}
            <button
              onClick={() => alert(`Reporting issue for: ${item.name}`)}
              className='text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
              </svg>
              Report
            </button>

            {/* Ruturn Item */}
            <button
              onClick={() => alert(`Returning item: ${item.name}`)}
              className='bg-[#1a237e] hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-95'>
              Return Item
            </button>
          </div>
        ) : (
          <div className='flex justify-end mt-5 pt-4 border-t border-gray-100 items-center'>
            {/* Send new request */}
            <button
              disabled
              className="bg-gray-200 text-gray-400 text-m font-medium px-4 py-2 rounded-lg cursor-not-allowed">
              Return Item
            </button>
          </div>
        )}

      </div>
    </div>
  )
}