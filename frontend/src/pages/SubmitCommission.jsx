import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { postCommissionProof } from "../store/slices/commissionSlice";

const SubmitCommission = () => {
    const [proof, setProof] = useState(null);
    const [amount, setAmount] = useState("");
    const [comment, setComment] = useState("");

    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.Commission);

    const proofHandler = (e) => {
        const file = e.target.files[0];
        setProof(file);
    };

    const handlePaymentProof = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("proof", proof);
        formData.append("amount", amount);
        formData.append("comment", comment);
        dispatch(postCommissionProof(formData));
    };

    return (
        <div className="min-h-screen flex items-center justify-center  bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className=" flex items-center justify-center   bg-blue-300 text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full  space-y-8">
                <form className="flex flex-col gap-5 w-full text-black " onSubmit={handlePaymentProof}>
                    <h3>Upload payment proof</h3>
                    <div className="flex flex-col gap-2">
                        <label className="text-[25px] text-stone-1000">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-[16px] py-2 bg-transparent border-b-[1px] border-stone-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[16px] text-stone-500">Proof (screenshot/image)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={proofHandler}
                            className="text-[16px] py-2 bg-transparent border-b-[1px] border-stone-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[16px] text-stone-1000">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="text-[16px] py-2 bg-transparent border-b-[1px] border-stone-500 focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit Commission"}
                    </button>
                </form>
            </div>
        </div>
        </div>
  
    );
};

export default SubmitCommission;