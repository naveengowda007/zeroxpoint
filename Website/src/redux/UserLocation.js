import { createSlice } from "@reduxjs/toolkit";

const UserLocation = createSlice({
	name: "UserLocation",
	initialState: [],
	reducers: {
		setUserLocation(state, action) {
			return action.payload
		},

		deleteUserLocation(state, action) {
			state = state.filter(location => location !== action.payload);
			return state;
		},
	},
});

export const {
	setUserLocation,
	deleteUserLocation

} = UserLocation.actions;

export default UserLocation.reducer;
