import React from "react";
import { useSelector } from"react-redux";
import { Link } from "react-router-dom";

const Leaderboard = () => {
    const user = useSelector((state) => state.User);
    const leaderboard = user?.leaderboard || [];

    return (
    <>
        {/* Reduce top margin from my-3 to mt-0 or a smaller value */}
        <section className="mt-0 lg:px-5">
            <div className="flex flex-col min-[340px]:flex-row min-[340px]:gap-2">
                <h3 className="text-[#111] text-xl font-semibold mb-2 min-[480px]:text-xl md:text-2xl lg:text-3xl">Top 10</h3>
                <h3 className="text-[#D6482B] text-xl font-semibold mb-2 min-[480px]:text-xl md:text-2xl lg:text-3xl">Bidders LeaderBoard</h3>
            </div>

            <div className="overflow-auto">
                                <table className="min-w-full bg-white border my-5 border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4  text-left">
                                                profile Pic
                                            </th>

                                            <th className="py-2 px-4  text-left">
                                                User Name
                                            </th>

                                            <th className="py-2 px-4  text-left">
                                                Bid Expenditure
                                            </th>

                                            <th className="py-2 px-4  text-left">
                                                Auction won
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="text-gray-700">
                                        {leaderboard && leaderboard.length > 0 ? (
                                            leaderboard.slice(0, 100).map((element, index) => {
                                                return (
                                                    <tr key={element._id} className="border-b border-gray-300">
                                                        <td className="flex gap-2 items-center py-2 px-4">
                                                            <span className="text-stone-400 font-semibold text-xl w-7">
                                                                {index + 1}
                                                            </span>

                                                            <span>
                                                                <img src={element.profileImage?.url}
                                                                    alt={element.userName || "User"}
                                                                    className="h-12 w-12 object-cover rounded-full" />
                                                            </span>
                                                        </td>

                                                        <td className="py-2 px-4">{element.userName || "N/A"}</td>
                                                        <td className="py-2 px-4">{element.moneySpent || 0}</td>
                                                        <td className="py-2 px-4">{element.auctionsWon || 0}</td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="py-4 px-4 text-center">
                                                    No bidders found in the leaderboard. Be the first to place a bid!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>




            <Link to={"/leaderboard"} className="border-2 border-stone-200 font-bold text-xl w-full py-2 flex justify-center rounded-md bg-[#D6482B] hover:border-stone-500 transition-all duration-300"> GO to leaderboard</Link>
        </section>
    </>
    );
};
export default Leaderboard;