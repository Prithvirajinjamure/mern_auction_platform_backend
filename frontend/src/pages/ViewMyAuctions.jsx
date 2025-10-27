import Spinner from '@/custom-components/Spinner';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getMyAuctionItems } from '@/store/slices/auctionSlice'; // <-- Add this import
import CardTwo from '@/custom-components/CardTwo'; // <-- Add the correct import path

const ViewMyAuctions = () => {
    const { myauctions, loading } = useSelector(state => state.auction);
    const user = useSelector(state => state.User.user); // <-- Use 'User' (uppercase)
    const isAuthenticated = useSelector(state => state.User.isAuthenticated); // <-- Use 'User' (uppercase)

    const dispatch = useDispatch();
    const navigateTo = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !user || user.role !== "Auctioneer") {
            navigateTo("/");
        } else {
            dispatch(getMyAuctionItems());
        }
    }, [dispatch, isAuthenticated, user, navigateTo]);

    return (
        <>
            <div className="w-full ml-0 m-0 h-fit px-5 pt-20 lg:pl-[320px] gap-7 flex flex-col ">
                <h1 className="text-[#d6482b] text-2xl font-bold mb-2 min-[480px]:text-4xl md:text-6xl xl:text-7xl 2xl:text-8xl">
                    My Auction
                </h1>
                {
                    loading ? <Spinner /> : (
                        <div className="flex flex-wrap gap-6">
                            {
                                myauctions && myauctions.length > 0 ? (
                                    myauctions.map(element => (
                                        <CardTwo
                                            title={element.title}
                                            startingBid={element.startingBid}
                                            endTime={element.endTime}
                                            startTime={element.startTime}
                                            imgSrc={element.image?.url}
                                            id={element._id}
                                            key={element._id}
                                        />
                                    ))
                                ) : (
                                    <h3 className="text-[#111] text-xl font-semibold mb-2 min-[480px]:text-xl md:text-2xl lg:text-3xl">No auctions found for your account.</h3>
                                )
                            }
                        </div>
                    )
                }
            </div>
        </>
    )
}
export default ViewMyAuctions