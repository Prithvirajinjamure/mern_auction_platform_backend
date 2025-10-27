import { deleteAuctionItem } from "@/store/slices/superAdminSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const AuctionItemDelete = () => {
  const { allauctions } = useSelector((state) => state.auction);
  const dispatch = useDispatch();

  const handleAuctionDelete = (id) => {
    dispatch(deleteAuctionItem(id));
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white/90 rounded-xl shadow-lg border border-[#e0e7ff]">
          <thead className="bg-gradient-to-r from-[#4fdac7] to-[#d6482b] text-white">
            <tr>
              <th className="py-3 px-4 text-left rounded-tl-xl">Image</th>
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {allauctions && allauctions.length > 0 ? (
              allauctions.map((element) => (
                <tr key={element._id} className="hover:bg-[#f8fafc] transition-all">
                  <td className="py-3 px-4">
                    <img src={element.image?.url} alt={element.title} className="h-14 w-14 object-cover rounded-lg shadow" />
                  </td>
                  <td className="py-3 px-4 font-semibold">{element.title}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Link to={`/auction/details/${element._id}`} className="bg-[#4fdac7] text-white py-2 px-4 rounded-lg hover:bg-[#38b2ac] font-bold shadow transition-all duration-300">View</Link>
                    <button className="bg-[#d6482b] text-white py-2 px-4 rounded-lg hover:bg-[#b8381e] font-bold shadow transition-all duration-300" onClick={() => handleAuctionDelete(element._id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="text-left text-xl text-sky-600 py-3">
                <td>No Auctions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AuctionItemDelete;
