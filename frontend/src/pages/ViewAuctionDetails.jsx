import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaGreaterThan } from 'react-icons/fa';

import { getAuctionDetail } from '@/store/slices/auctionSlice';

import Spinner from '@/custom-components/Spinner';

const ViewAuctionDetails = () => {
    const { id } = useParams();

    const { loading, auctionDetail, auctionBidders } = useSelector((state) => state.auction);
    const { isAuthenticated } = useSelector((state) => state.User);
    const user = useSelector((state) => state.User.user);

    const navigateTo = useNavigate();
    const dispatch = useDispatch();

   

    useEffect(() => {
        if (!isAuthenticated || (user && user.role === "Bidder")) {
            navigateTo("/");
        }
        if (id) {
            dispatch(getAuctionDetail(id));
        }
    }, [isAuthenticated, user, navigateTo, dispatch, id]);



    return (
        <>
            <section className="w-full ml-0 m-0 h-fit px-5 pt-20 lg:pl-[320px] flex flex-col">
                <div className="text-[20px] flex flex-wrap gap-2 items-center mb-4">
                    <Link
                        to="/"
                        className="font-semibold transition-all duration-300 hover:text-[#D6482B]"
                    >
                        Home
                    </Link>
                    <FaGreaterThan className="text-stone-400" />
                    <Link
                        to={"/view-my-auctions"}
                        className="font-semibold transition-all duration-300 hover:text-[#D6482B]"
                    >
                       My Auctions
                    </Link>
                    <FaGreaterThan className="text-stone-400" />
                    <p className="text-stone-600">{auctionDetail?.title || 'Loading...'}</p>
                </div>

                {loading ? <Spinner /> : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left: Image, Details, Description */}
                        <div className="flex-1 flex flex-col">
                            {/* Image and Details Section */}
                            <div className="flex flex-col gap-6 mb-6">
                                {/* Image */}
                                <div className="bg-white w-full flex justify-center items-center p-5">
                                    {auctionDetail?.image?.url && (
                                        <img
                                            src={auctionDetail.image.url}
                                            alt={auctionDetail.title || 'Auction item'}
                                            className="max-w-full h-auto object-contain"
                                        />
                                    )}
                                </div>
                                {/* Details */}
                                <div className="w-full">
                                    <h3 className="text-[#111] text-xl font-semibold mb-4 min-[480px]:text-xl md:text-2xl lg:text-3xl">
                                        {auctionDetail?.title}
                                    </h3>

                                    <p className="text-xl font-semibold mb-2">
                                    Condition:{" "}
                                        <span className="text-[#D6482B]">
                                            {auctionDetail.condition}
                                        </span>
                                    </p>

                                    <p className="text-xl font-semibold mb-2">
                                        Minimum Bid:{" "}
                                        <span className="text-[#D6482B]">
                                            Rs.{auctionDetail?.startingBid}
                                        </span>
                                    </p>
                                    {auctionDetail?.condition && (
                                        <p className="text-xl font-semibold mb-4">
                                            Condition:{" "}
                                            <span className="text-[#D6482B]">
                                                {auctionDetail.condition}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* Description Section */}
                            <div className="mb-6">
                                <h4 className="text-xl font-bold mb-2 border-b border-gray-300 pb-2">Auction Item Description</h4>
                                <ul className="list-disc pl-6 mt-4">
                                    {auctionDetail?.description ? (
                                        typeof auctionDetail.description === 'string' ? 
                                            auctionDetail.description.split(". ").map((element, index) => {
                                                return element.trim() ? (
                                                    <li key={index} className="text-[18px] my-2">{element}</li>
                                                ) : null;
                                            })
                                        : <li className="text-[18px] my-2">{String(auctionDetail.description)}</li>
                                    ) : (
                                        <li className="text-[18px] my-2">No description available for this item.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Right: BIDS and Place Bid */}
                        <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-lg shadow-md min-h-[400px]">
                            <h4 className="text-[50px] font-bold py-4 px-6 border-b border-gray-200 bg-[#f5f5f5]">BIDS</h4>
                            <div className="flex-1 px-6 py-4 min-h-[100px]">
                                {auctionDetail && (
                                    <>
                                        {new Date(auctionDetail.startTime) > Date.now() ? (
                                            <div className="flex flex-col items-center justify-center py-4">
                                                <img
                                                    src='/images/auctionnotstarted.png'
                                                    alt="Auction not started"
                                                    className="w-full max-h-[300px] object-contain mb-3"
                                                />
                                                <p className="text-center text-xl font-semibold text-gray-600">
                                                    This auction has not started yet!
                                                </p>
                                                <p className="text-center text-gray-500">
                                                    Starts on: {new Date(auctionDetail.startTime).toLocaleString()}
                                                </p>
                                            </div>
                                        ) : new Date(auctionDetail.endTime) < Date.now() ? (
                                            <div className="flex flex-col items-center justify-center py-4">
                                                <img
                                                    src="/images/auctionended.png"
                                                    alt="Auction ended"
                                                    className="w-full max-h-[300px] object-contain mb-3"
                                                />
                                                <p className="text-center text-xl font-semibold text-gray-600">
                                                    This auction has ended!
                                                </p>
                                                <p className="text-center text-gray-500">
                                                    Ended on: {new Date(auctionDetail.endTime).toLocaleString()}
                                                </p>
                                            </div>
                                        ) : auctionBidders && auctionBidders.length > 0 ? (
                                            // Sort bidders by amount descending before mapping
                                            [...auctionBidders]
                                                .sort((a, b) => b.amount - a.amount)
                                                .map((element, index) => (
                                                    <div key={index} className="py-2 flex items-center justify-between border-b border-gray-500">
                                                        <div className="flex flex-1 items-center gap-3">
                                                            <img 
                                                                src={element.profileImage}
                                                                alt={element.userName} 
                                                                className="w-10 h-10 rounded-full my-2" 
                                                            />
                                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">{element.userName}</span>
                                                        </div>


                                                        <p className='flex-1 text-center'>
                                                            {element.amount}
                                                        </p>





                                                        {index === 0 ? (
                                                            <span className="text-green-600 font-bold flex-1 text-end">1st</span>
                                                        ) : index === 1 ? (
                                                            <span className="text-blue-600 font-bold flex-1 text-end">2nd</span>
                                                        ) : index === 2 ? (
                                                            <span className="text-yellow-600 font-bold flex-1 text-end">3rd</span>
                                                        ) : (
                                                            <span className="text-gray-600 font-bold flex-1 text-end">{index + 1}th</span>
                                                        )}
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-4">
                                                <img
                                                    src="/noBids.png"
                                                    alt="No bids yet"
                                                    className="w-full max-h-[300px] object-contain mb-3"
                                                />
                                                <p className="text-center text-gray-500 py-4">No bids for this auction yet</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            {/* Place Bid input at the bottom */}
                            {auctionDetail && Date.now() >= new Date(auctionDetail.startTime) && 
                             Date.now() <= new Date(auctionDetail.endTime) && (
                                <div className="bg-[#D6482B] py-6 px-6 flex items-center justify-between rounded-b-lg">
                                    {/* <div className="flex gap-3 flex-col sm:flex-row sm:items-center">
                                        
                                       
                                    </div> */}
                                   
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}

export default ViewAuctionDetails;
