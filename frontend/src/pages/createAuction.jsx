import React, { useState, useEffect } from "react";
import { createAuction } from "@/store/slices/auctionSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CreateAuction = () => {
    const [image, setImage] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [startingBid, setStartingBid] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const auctionCategories = [
        "Electronics",
        "Furniture",
        "Art & Antiques",
        "Jewelry & Watches",
        "Automobiles",
        "Real Estate",
        "Collectibles",
        "Fashion & Accessories",
        "Sports Memorabilia",
        "Books & Manuscripts",
    ];

    const Condition = ["New", "Used"];

    const imageHandler = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setImage(file);
            setImagePreview(reader.result);
        }
    }

    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auction);

    // Only ONE selector for user and isAuthenticated
    const { isAuthenticated, user } = useSelector((state) => state.User);

    const navigate = useNavigate();
    useEffect(() => {
        if (!isAuthenticated || !user || user.role !== "Auctioneer") {
            navigate("/");
        }
    }, [isAuthenticated, user, navigate]);

    const handleCreateAuction = (e) => {
        e.preventDefault();
        // handle auction creation logic here
        const formData = new FormData();
        formData.append("image", image); // must be a File
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("condition", condition);
        formData.append("startingBid", Number(startingBid)); // ensure number
        formData.append("startTime", startTime);
        formData.append("endTime", endTime);
        // make API call to create auction
        // Debug: log all form data
        for (let pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }
        dispatch(createAuction(formData));
    };

  

    return (
        <article className="w-full ml-0 m-0 h-fit px-5 pt-10 pb-10 lg:pl-[320px] gap-7 flex flex-col ">
            <h1 className="text-[#d6482b] text-2xl font-bold mb-2 min-[480px]:text-4xl md:text-6xl xl:text-7xl 2xl:text-8xl">
                Create an Auction
            </h1>
            <form className="flex flex-col gap-4 " onSubmit={handleCreateAuction}>

                {/* <input className="h-15 bg-blue-200 pl-2 pb-5 pt-5 rounded " type="file" accept="image/*" onChange={imageHandler} required />
                {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover" />} */}

                <input className="h-10 bg-blue-200 pl-2 rounded" type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />

                <div className="flex flex-col sm:flex-1 gap-2">
                    <label className="text-[16px] text-stone-600 bg-blue-200 pb-3 pl-3 pt-2 rounded ">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="text-[16px] py-2 bg-transparent border-2 border-stone-500 focus:outline-none px-2 rounded-md"
                        rows={10}
                    />
                </div>

                {/* <textarea className="h-10 bg-blue-200 pt-2 pl-2" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required /> */}

                <select className="h-10 bg-blue-200 pt-2 pl-2 pb-3 rounded-md" value={category} onChange={e => setCategory(e.target.value)} required>
                    <option value="">Select Category</option>
                    {auctionCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                {/* FIX: This select should update condition, not category */}
                <select className="h-10 bg-blue-200 pt-2 pl-2 pb-3 rounded-md" value={condition} onChange={e => setCondition(e.target.value)} required>
                    <option value="">Select Condition</option>
                    {Condition.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                {/* <input  className="h-10 bg-blue-200 pt-2 pl-2 pb-3" type="text" placeholder="Condition" value={condition} onChange={e => setCondition(e.target.value)} required /> */}

                <input className="h-10 bg-blue-200 pt-2 pl-2 pb-3 rounded-md" type="number" placeholder="Starting Bid" value={startingBid} onChange={e => setStartingBid(e.target.value)} required />

                <input className="h-10 bg-blue-200 pt-2 pl-2 pb-3 pr-10 rounded-md  " type="datetime-local" placeholder="Start Time" value={startTime} onChange={e => setStartTime(e.target.value)} required />

                <input className="h-10 bg-blue-200 pt-2 pl-2 pb-3 pr-10 rounded-md " type="datetime-local" placeholder="End Time" value={endTime} onChange={e => setEndTime(e.target.value)} required />

                <h1 className="text-[#111]  font-bold text-[30px] ">
                    Upload Image
                </h1>

                <div class="flex items-center justify-center w-full">
                    <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                            {
                                imagePreview ? (<img src= {imagePreview} alt= {title}
                                 className="w-44 h-auto"/>) : (
                                    <>
                                        <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                    </>
                                )

                            }

                            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <input id="dropzone-file" type="file" class="hidden" onChange={imageHandler}/>
                    </label>
                </div>

                <button type="submit" className="bg-[#d6482b] font-semibold hover:bg-[#b8381e] text-xl transition-all duration-300 py-2 px-4 rounded-md text-white w-[280px] mx-auto lg:w-[640px] my-4" disabled={loading}>
                    {loading ? "Creating..." : "Submit"}
                </button>

            </form>
        </article>
    );
}

export default CreateAuction;