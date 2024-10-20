import { createSlice } from "@reduxjs/toolkit";

const Cart = createSlice({
	name: "Cart",
	initialState: [],
	reducers: {
		setCart(state, action) {
			return state = [...state, ...action.payload]
		},
		deleteCart(state, action) {
			state = state.filter(item => item.id !== action.payload);
			return state
		},
		updateCart(state, action) {
			const itemIndex = state.findIndex(item => item.id === action.payload.id);
			if (itemIndex >= 0) {
				state[itemIndex] = action.payload
			}
			return state
		},
		resetCart(state, action) {
			return state = []
		},
		setNewCart(state, action) {
			return state = action.payload
		},
	},
});

export const {
	setCart,
	deleteCart,
	updateCart,
	resetCart,
	setNewCart
} = Cart.actions;

export default Cart.reducer;
