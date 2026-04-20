import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        cart: null,
        loading: false,
        error: null,
    },
    reducers: {
        setCart: (state, action) => {
            state.cart = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    },
});

export const { setCart, setLoading, setError } = cartSlice.actions;
export default cartSlice.reducer;
