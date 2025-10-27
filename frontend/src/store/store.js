// Redux store setup for your React app
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import commissionReducer from './slices/commissionSlice';
import auctionReducer from './slices/auctionSlice';
import bidReducer from './slices/bidSlice';
import superAdminReducer from './slices/superAdminSlice';

export const store = configureStore({
  reducer: {
    User: userReducer,
    Commission: commissionReducer,
    auction: auctionReducer,
    bid: bidReducer,
    superAdmin : superAdminReducer,
  },
});
