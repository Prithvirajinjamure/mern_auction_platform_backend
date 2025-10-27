import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const auctionSlice = createSlice({
    name: "auction",
    initialState: {
        loading: false,
        itemDetails: {},
        auctionDetail: {},
        auctionBidders: {},
        myauctions: [],
        allauctions: [],
    },
    reducers: {

        createAuctionRequest(state, action){
            state.loading = true;
        },  
        createAuctionSuccess(state, action){
            state.loading = false;
        },  
        createAuctionFailed(state, action){
            state.loading = false;
        },  

            
        

        getAllAuctionItemsRequest: (state, action) => {
            state.loading = true;
        },
        getAllAuctionItemsSuccess: (state, action) => {
            state.loading = false;
            state.allauctions = action.payload;
        },
        getAllAuctionItemsFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },




        getAuctionDetailRequest(state, action) {
            state.loading = true;
        },
        getAuctionDetailSuccess(state, action) {
            state.loading = false;
            state.auctionDetail = action.payload.auctionItem;
            state.auctionBidders = action.payload.bidders;
        },
        getAuctionDetailFailed(state, action) {
            state.loading = false;
            state.auctionDetail = state.auctionDetail;
            state.auctionBidders = state.auctionBidders; 
        },




        getAuctionsRequest(state, action){
            state.loading = true;
            state.myauctions = [];
        },
        getAuctionsSuccess(state, action){
            state.loading = false;
            state.myauctions = action.payload;
        },
        getAuctionsFailed(state, action){
            state.loading = false;
            state.myauctions = [];
        },


        deleteAuctionItemRequest(state, action){
            state.loading = true
        },
        deleteAuctionItemSuccess(state, action){
            state.loading = false
        },
        deleteAuctionItemFailed(state, action){
            state.loading = false
        },


        
        republishItemRequest(state, action){
            state.loading = true
        },
        republishItemSuccess(state, action){
            state.loading = false
        },
        republishItemFailed(state, action){
            state.loading = false
        },
        







        resetSlice(state, action) {
            state.loading = false;
            state.auctionDetail = state.auctionDetail;
            state.itemDetails = state.itemDetails;
            state.myauctions = state.myauctions;
            state.allauctions = state.allauctions;

        },
    },

});

export const getAllAuctionItems = () => async (dispatch) => {
    dispatch(auctionSlice.actions.getAllAuctionItemsRequest());
    try {
        const respone = await axios.get("http://localhost:5000/api/v1/auctionitem/allitems", { withCredentials: true});
        dispatch(auctionSlice.actions.getAllAuctionItemsSuccess(respone.data.items));
        dispatch(auctionSlice.actions.resetSlice());
    }
        
    catch (error) {
        dispatch(auctionSlice.actions.getAllAuctionItemsFailed());
        console.log(error);
        dispatch(auctionSlice.actions.resetSlice());
    }
}


export const getAuctionDetail = (id) => async (dispatch) => {
    dispatch(auctionSlice.actions.getAuctionDetailRequest());
    try {
        const respone = await axios.get(`http://localhost:5000/api/v1/auctionitem/auction/${id}`, { withCredentials: true});
        dispatch(auctionSlice.actions.getAuctionDetailSuccess(respone.data));
        dispatch(auctionSlice.actions.resetSlice());
    }
        
    catch (error) {
        dispatch(auctionSlice.actions.getAuctionDetailFailed());
        console.log(error);
        dispatch(auctionSlice.actions.resetSlice());
    }
}

export const createAuction = (data) => async (dispatch) => {
    dispatch(auctionSlice.actions.createAuctionRequest());
    try {
        // FIX: Use correct endpoint
        //http://localhost:5000
        const respone = await axios.post("http://localhost:5000/api/v1/auctionitem/create", data, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" }});
        dispatch(auctionSlice.actions.createAuctionSuccess());
        toast.success(respone.data.message);
        dispatch(getAllAuctionItems());
        dispatch(auctionSlice.actions.resetSlice());
    }
    catch (error) {
        dispatch(auctionSlice.actions.createAuctionFailed());
        console.log(error);
        toast.error(error.response.data.message);
        dispatch(auctionSlice.actions.resetSlice());
    }
}


export const getMyAuctionItems = () => async (dispatch) => {
    console.log("view my auction")
    dispatch(auctionSlice.actions.getAuctionsRequest());
    try {
        const respone = await axios.get("http://localhost:5000/api/v1/auctionitem/myitems", { withCredentials: true});
        dispatch(auctionSlice.actions.getAuctionsSuccess(respone.data.items));
        // dispatch(auctionSlice.actions.resetSlice()); // <-- Remove this line
    }
        
    catch (error) {
        dispatch(auctionSlice.actions.getAuctionsFailed());
        console.log(error);
        // dispatch(auctionSlice.actions.resetSlice()); // <-- Remove this line
    }
}




export const republishAuction = (id, data) => async(dispatch)=>{
    dispatch(auctionSlice.actions.republishItemRequest());   
    try{
        const response = await axios.put(`http://localhost:5000/api/v1/auctionitem/item/republish/${id}`,data,{
            withCredentials: true,
            headers :{"content-type" : "application/json"},
        }) ;
        dispatch(auctionSlice.actions.republishItemSuccess());
        toast.success(response.data.message);
        dispatch(getMyAuctionItems());
        dispatch(getAllAuctionItems());
        dispatch(auctionSlice.actions.resetSlice());
    } 
    catch(error){
        dispatch(auctionSlice.actions.republishItemFailed());
        toast.error(error.response.data.message);
        console.error(error.respone.data.message);
        dispatch(auctionSlice.actions.resetSlice());
    }
};

export const deleteAuction = (id) => async(dispatch)=>{
    dispatch(auctionSlice.actions.deleteAuctionItemRequest());   
    try{
        const response = await axios.delete(`http://localhost:5000/api/v1/auctionitem/delete/${id}`,{
            withCredentials: true,
           
        }) ;
        dispatch(auctionSlice.actions.deleteAuctionItemSuccess());
        toast.success(response.data.message);
        dispatch(getMyAuctionItems());
        dispatch(getAllAuctionItems());
        dispatch(auctionSlice.actions.resetSlice());
    } 
    catch(error){
        dispatch(auctionSlice.actions.deleteAuctionItemFailed());
        toast.error(error.response.data.message);
        console.error(error.respone.data.message);
        dispatch(auctionSlice.actions.resetSlice());
    }
}

export default auctionSlice.reducer;