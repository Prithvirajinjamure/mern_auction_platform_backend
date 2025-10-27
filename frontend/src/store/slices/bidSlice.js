import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// Create async thunk for placing a bid
export const placeBid = createAsyncThunk(
  "bid/placeBid",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      };
      
      const { data } = await axios.post(
        `http://localhost:5000/api/v1/bid/place/${id}`,
        formData,
        config
      );
      
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Initial state
const initialState = {
  loading: false,
  success: false,
  error: null,
};

// Create slice
const bidSlice = createSlice({
  name: "bid",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeBid.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        toast.success("Bid placed successfully!");
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to place bid");
      });
  },
});

export const { clearErrors, resetSuccess } = bidSlice.actions;
export default bidSlice.reducer;