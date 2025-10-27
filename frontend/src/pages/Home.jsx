
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import FeaturedAuctions from "./home-sub-components/FeaturedAuctions";
import UpcomingAuction from "./home-sub-components/UpcomingAuction";
import Leaderboard from "./home-sub-components/Leaderboard";
import Spinner from "../custom-components/Spinner";

const Home = () => {
  const howItWorks = [
    { title: "Post Items", description: "Auctioneer posts items for bidding." },
    { title: "Place Bids", description: "Bidders place bids on listed items." },
    {
      title: "Win Notification",
      description: "Highest bidder receives a winning email.",
    },
    {
      title: "Payment & Fees",
      description: "Bidder pays; auctioneer pays 5% fee.",
    },
  ];

  // Fix selector: use 'User' (capital U) as per your store.js
  const { isAuthenticated } = useSelector((state) => state.User);

  return (
    <>
      <section className="w-full ml-0 m-0 h-fit px-5 pt-24 lg:pl-[320px] gap-10 flex flex-col min-h-screen py-8 justify-center bg-gradient-to-br from-[#f8fafc] via-[#e0e7ff] to-[#f0fdfa]">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <p className="font-extrabold text-2xl mb-6 text-[#4fdac7] tracking-wide uppercase">
            Transparency Leads to your victory
          </p>

          <h1 className="text-[#111] text-4xl font-black mb-2 min-[480px]:text-5xl md:text-7xl xl:text-8xl 2xl:text-9xl drop-shadow-lg">
            Transparent Auctions
          </h1>

          <h1 className="text-[#d6482b] text-4xl font-black mb-4 min-[480px]:text-5xl md:text-7xl xl:text-8xl 2xl:text-9xl drop-shadow-lg">
            Be The Winner
          </h1>

          <div className="flex gap-6 my-8">
            {
              !isAuthenticated && (
                <>
                  <Link to="/sign-up" className="bg-[#d6482b] font-bold hover:bg-[#b8381e] rounded-full px-10 py-4 text-white text-lg shadow-lg transition-all duration-300">Sign Up</Link>
                  <Link to={"/login"} className="text-[#4fdac7] border-2 border-[#4fdac7] hover:bg-[#4fdac7] hover:text-white font-bold text-lg rounded-full px-10 py-3 transition-all duration-300 shadow-lg">Login</Link>
                </>
              )
            }
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <h3 className="text-[#111] text-2xl font-bold mb-2 min-[480px]:text-2xl md:text-3xl lg:text-4xl">How it works</h3>
          <div className="flex flex-col gap-6 md:flex-row md:flex-wrap w-full">
            {
              howItWorks.map(element => (
                <div key={element.title} className="bg-white/80 flex flex-col gap-2 p-6 rounded-xl h-[120px] justify-center md:w-[48%] lg:w-[47%] 2xl:w-[24%] hover:shadow-2xl transition-all duration-300 border border-[#e0e7ff]">
                  <h5 className="font-bold text-[#d6482b] text-lg">{element.title}</h5>
                  <p className="text-[#222]">{element.description}</p>
                </div>
              ))
            }
          </div>
        </div>

        <FeaturedAuctions />
        <UpcomingAuction />
        <Leaderboard />
      </section>
    </>
  );
};

export default Home;