import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SideDrawer from "./layout/SideDrawer";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import SubmitCommission from "./pages/SubmitCommission";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUser } from "./store/slices/userSlice";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import { getAllAuctionItems } from "./store/slices/auctionSlice";
import { fetchLeaderboard } from "./store/slices/userSlice.js";
import LeaderboardPage from "./pages/LeaderboardPage";
import Auctions from "./pages/Auctions";
import AuctionItem from "./pages/AuctionItem";
import CreateAuction from "./pages/CreateAuction";
import ViewMyAuctions from "./pages/ViewMyAuctions";
import ViewAuctionDetails from "./pages/ViewAuctionDetails";
import Dashboard from "./pages/dashboard/dashboard";
import Contact from "./pages/Contact";
import UserProfile from "./pages/UserProfile";


const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
      dispatch(loadUser());
      dispatch(getAllAuctionItems());
      dispatch(fetchLeaderboard());
  }, [dispatch]);
  return (
    <Router>
      <div className="app">
        <SideDrawer />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/submit-commission" element={<SubmitCommission />} />
            <Route path="/how-it-works-info" element={<HowItWorks  />} />
            <Route path="/about" element={<About  />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auction/item/:id" element={<AuctionItem />} />
            <Route path="/create-auction" element={<CreateAuction />} />
            <Route path="/view-my-auctions" element={<ViewMyAuctions/>} />
            <Route path="/auction/details/:id" element={<ViewAuctionDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/me" element={<UserProfile />} />



          </Routes>
        </main>
        <ToastContainer position="top-right" />
      </div>
    </Router>
  );
};

export default App;
// ... existing code ...


// https://mern-auction-platform-backend-1-kpby.onrender.com