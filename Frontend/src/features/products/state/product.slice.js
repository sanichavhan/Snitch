import { createSlice } from "@reduxjs/toolkit";


const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProducts: [],
        products: [],
        suggestions: [],
        relatedSuggestions: [],
        relatedTerms: [],
        loading: false,
        error: null
    },
    reducers: {
        setSellerProducts: (state, action) => {
            state.sellerProducts = action.payload
        },
        setProducts: (state, action) => {
            state.products = action.payload
        },
        setSearchSuggestions: (state, action) => {
            state.suggestions = action.payload.suggestions || [];
            state.relatedSuggestions = action.payload.related || [];
            state.relatedTerms = action.payload.relatedTerms || [];
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        }
    }
})


export const { setSellerProducts, setProducts, setSearchSuggestions, setLoading, setError } = productSlice.actions
export default productSlice.reducer