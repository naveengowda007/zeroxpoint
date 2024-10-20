import { createSlice } from "@reduxjs/toolkit";

const UserOrders = createSlice({
	name: "UserOrders",
	initialState: [],
	reducers: {
		setUserOrders(state, action) {
			return state = action.payload
		},

		deleteUserOrders(state, action) {
			state = state.filter(order => order !== action.payload);
			return state;
		},
	},
});

export const {
	setUserOrders,
	deleteUserOrders
} = UserOrders.actions;

export default UserOrders.reducer;
