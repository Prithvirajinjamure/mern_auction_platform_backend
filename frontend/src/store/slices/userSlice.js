import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { ClimbingBoxLoader } from "react-spinners";
import { toast } from "react-toastify";





const userSlice = createSlice({
    name: "user",
    initialState: {
        loading: false,
        isAuthenticated: false,
        user: {},
        leaderboard: []
     
    },
    reducers: {

      registerRequest(state, action){
        state.loading = true;
        state.isAuthenticated = false;
        state.user = {};
        
      },

      registerSuccess(state, action){
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        
      },

      registerFailed(state, action){
        state.loading = false;
        state.isAuthenticated = false;
        state.user = {};
      },




      logoutSuccess(state, action){
        state.isAuthenticated = false;
        state.user = {};
        
      },
      logoutFailed(state, action){
            state.loading = false;
            state.isAuthenticated = state.isAuthenticated;
            state.user = state.user;
          },

        fetchLeaderboardRequest(state, action){
          state.loading = true;
          state.leaderboard = [];
        },
        fetchLeaderboardSuccess(state, action){
          state.loading = false;
          state.leaderboard = action.payload;
        },
        fetchLeaderboardFailed(state, action){
          state.loading = false;
          state.leaderboard = [];
        },
            
      clearAllErrors(state, action){
        state.user  = state.user;
        state.isAuthenticated = state.isAuthenticated;
        state.leaderboard = state.leaderboard;
        state.loading = false;
      },
    }

});





export const register = (data) => async(dispatch) =>{
  dispatch(userSlice.actions.registerRequest());

  try{
    // Log the form data being sent
    console.log('Sending registration data:', Object.fromEntries(data.entries()));

    const response = await axios.post("http://localhost:5000/api/v1/user/register", data, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    console.log('Registration response:', response.data); // Log successful response
    
    if (response.data.success) {
      dispatch(userSlice.actions.registerSuccess(response.data));
      toast.success(response.data.message || 'Registration successful');
      dispatch(userSlice.actions.clearAllErrors());
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  }
  catch(error){
    console.error('Registration error details:', {
      response: error.response?.data,
      status: error.response?.status,
      error: error.message
    });

    dispatch(userSlice.actions.registerFailed());
    
    let errorMessage;
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 404) {
      errorMessage = 'Backend server is not running. Please start the server.';
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = 'Registration failed. Please try again.';
    }

    toast.error(errorMessage);
    dispatch(userSlice.actions.clearAllErrors());
  }
};












export const logout = () => async (dispatch) => 
    {
  try {
     const response = await axios.get("http://localhost:5000/api/v1/user/logout", {withCredentials: true}); 
     dispatch(userSlice.actions.logoutSuccess());
     toast.success(response.data.message);
     dispatch(userSlice.actions.clearAllErrors());
  } 

  catch (error) {
    dispatch(userSlice.actions.logoutFailed());
    toast.error(error.response.data.message);
    dispatch(userSlice.actions.clearAllErrors());
    
  }


  
};



export const fetchUser = () => async (dispatch) => 
  {
try {
   const response = await axios.get("http://localhost:5000/api/v1/user/logout", {withCredentials: true}); 
   dispatch(userSlice.actions.logoutSuccess());
   toast.success(response.data.message);
   dispatch(userSlice.actions.clearAllErrors());
} 

catch (error) {
  dispatch(userSlice.actions.logoutFailed());
  toast.error(error.response.data.message);
  dispatch(userSlice.actions.clearAllErrors());
  
}
  };




export const fetchLeaderboard = () => async (dispatch) => 
  {
    dispatch(userSlice.actions.fetchLeaderboardRequest());
try {
   const response = await axios.get("http://localhost:5000/api/v1/user/leaderboard", {withCredentials: true}); 
   dispatch(userSlice.actions.fetchLeaderboardSuccess(response.data.leaderboard));
   dispatch(userSlice.actions.clearAllErrors());
} 

catch (error) {
  dispatch(userSlice.actions.fetchLeaderboardFailed());
  dispatch(userSlice.actions.clearAllErrors());
  console.error(error);
  
}
  };






export default userSlice.reducer;
export const { registerSuccess } = userSlice.actions;




export const loadUser = () => async (dispatch) => {
  try {
    const response = await axios.get("http://localhost:5000/api/v1/user/me", { withCredentials: true });
    if (response.data.success) {
      dispatch(userSlice.actions.registerSuccess(response.data));
    }
  } catch (error) {
    dispatch(userSlice.actions.registerFailed());
  }
};