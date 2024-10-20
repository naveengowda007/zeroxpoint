import { createSlice } from "@reduxjs/toolkit";

const Prices = createSlice({
  name: "Prices",
  initialState:{},
  reducers: {
    setPrices(state, action) {
      // This will replace the entire state with the new payload
      return action.payload;
    },
  },
});

export const { setPrices } = Prices.actions;

export default Prices.reducer;
