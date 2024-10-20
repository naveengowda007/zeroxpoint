import { createSlice } from "@reduxjs/toolkit";

const OderFetchInt = createSlice({
	name: "Config",
	initialState: {
		OderFetchInt: null,
		LatestOrder: null
	},
	reducers: {
		setOderFetchInt(state, action) {
			return state = { ...state, OderFetchInt: action.payload }
		},
		setLatestOrder(state, action) {
			return state = { ...state, LatestOrder: action.payload }
		}
	},
});

export const { setOderFetchInt, setLatestOrder } = OderFetchInt.actions;

export default OderFetchInt.reducer;
