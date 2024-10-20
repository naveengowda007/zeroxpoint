import { configureStore } from "@reduxjs/toolkit";

// Admin Imports
import UserData from './UserData';
import UserOrders from "./UserOrders";
import Config from "./Config";

// User Imports
import Cart from "./Cart";
import Prices from "./Prices";
import UserLocation from "./UserLocation";


export const store = configureStore({
	reducer: {
		Config,
		UserData,
		UserOrders,
		Prices,
		Cart,
		UserLocation
	},
	//To tackle serialisation problem
	middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});
