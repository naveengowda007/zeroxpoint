import { createSlice } from "@reduxjs/toolkit";

const UserData = createSlice({
	name: "UserData",
	initialState: {},
	reducers: {
		setUserData(state, action) {
			return state = { ...state, ...action.payload }
		},
		
		deleteUserData(state, action) {
			return state = {}
		},
	},
});

export const {
	setUserData,
	deleteUserData
} = UserData.actions;

export default UserData.reducer;
