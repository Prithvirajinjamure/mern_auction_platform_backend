import { register } from "../store/slices/userSlice";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SignUp = () => {
    
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const [bankAccountName, setBankAccountName] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [bankName, setBankName] = useState("");
    const [easypaisaAccountNumber, setEasypaisaAccountNumber] = useState("");
    const [paypalEmail, setPaypalEmail] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [profileImagePreview, setProfileImagePreview] = useState("");


    const { loading, isAuthenticated } = useSelector(state => state.User)
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Basic validation
            if (!userName || !email || !phone || !address || !role || !password) {
                toast.error('Please fill in all required fields');
                return;
            }

            if (role === 'Auctioneer' && (!bankAccountName || !bankAccountNumber || !bankName || !easypaisaAccountNumber || !paypalEmail)) {
                toast.error('Please fill in all banking details for Auctioneer registration');
                return;
            }

            const formData = new FormData();
            formData.append("userName", userName.trim());
            formData.append("email", email.trim());
            formData.append("phone", phone.trim());
            formData.append("address", address.trim());
            formData.append("role", role);
            formData.append("password", password);
            
            // Only append profile image if it exists
            if (profileImage) {
                formData.append("profileImage", profileImage);
            }

            // Add Auctioneer specific fields
            if (role === "Auctioneer") {
                formData.append("bankAccountName", bankAccountName.trim());
                formData.append("bankAccountNumber", bankAccountNumber.trim());
                formData.append("bankName", bankName.trim());
                formData.append("easypaisaAccountNumber", easypaisaAccountNumber.trim());
                formData.append("paypalEmail", paypalEmail.trim());
            }

            // Debug log
            console.log('Form Data:', {
                userName: userName,
                email: email,
                phone: phone,
                address: address,
                role: role,
                hasPassword: !!password,
                hasProfileImage: !!profileImage,
                ...(role === 'Auctioneer' ? {
                    bankAccountName,
                    bankAccountNumber,
                    bankName,
                    easypaisaAccountNumber,
                    paypalEmail
                } : {})
            });

            dispatch(register(formData));
        } catch (error) {
            console.error('Error in handleRegister:', error);
            toast.error('An error occurred during registration');
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [dispatch, loading, isAuthenticated, navigate]);
       
        
    const imageHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setProfileImage(file);
                setProfileImagePreview(reader.result);
            };
        }
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100    py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign Up</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <input
                            type="text"
                            required
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Username"
                        />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Email"
                        />
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Phone"
                        />
                        <textarea
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Address"
                        />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Password"
                        />
                        <select
                            required
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        >
                            <option value="">Select Role</option>
                            <option value="Bidder">Bidder</option>
                            <option value="Auctioneer">Auctioneer</option>
                        </select>

                        {role === "Auctioneer" && (
                            <>

                                <input
                                    type="text"
                                    required
                                    value={bankAccountName}
                                    onChange={(e) => setBankAccountName(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Bank Account Name"
                                />
                                <input
                                    type="text"
                                    required
                                    value={bankAccountNumber}
                                    onChange={(e) => setBankAccountNumber(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Bank Account Number"
                                />
                                <input
                                    type="text"
                                    required
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Bank Name"
                                />
                                <input
                                    type="text"
                                    required
                                    value={easypaisaAccountNumber}
                                    onChange={(e) => setEasypaisaAccountNumber(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Easypaisa Account Number"
                                />
                                <input
                                    type="email"
                                    required
                                    value={paypalEmail}
                                    onChange={(e) => setPaypalEmail(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="PayPal Email"
                                />
                            </>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                        <div className="mt-1 flex items-center">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={imageHandler}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            />
                            {profileImagePreview && (
                                <img
                                    src={profileImagePreview}
                                    alt="Profile Preview"
                                    className="ml-4 h-16 w-16 object-cover rounded-full"
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#D6482B] hover:bg-[#b8381e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );



};

export default SignUp;
