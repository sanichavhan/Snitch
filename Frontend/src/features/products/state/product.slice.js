import { createSlice } from "@reduxjs/toolkit";


const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProducts: [],
        products: [],
        suggestions: [],
        relatedSuggestions: [],
    },
    reducers: {
        setSellerProducts: (state, action) => {
            state.sellerProducts = action.payload
        },
        setProducts: (state, action) => {
            state.products = action.payload
        },
        setSearchSuggestions: (state, action) => {
            state.suggestions = action.payload.suggestions;
            state.relatedSuggestions = action.payload.related;
        }
    }
})


export const { setSellerProducts, setProducts, setSearchSuggestions } = productSlice.actions
export default productSlice.reducer