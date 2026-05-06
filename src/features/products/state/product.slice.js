import { createSlice } from "@reduxjs/toolkit";


const productSlice = createSlice({
    name: "product",
    initialState: {
        variantAndProductId: null,
        allProducts: [],
        sellerLoading: false,
        negotiatedPrice: null,
        dealDone: false,
    },
    reducers: {
        setvariantAndProductId: (state, action) => {
            state.variantAndProductId = action.payload
        },
        setSellerLoading: (state, action) => {
            state.sellerLoading = action.payload
        },
        setNegotiatedPrice: (state, action) => {
            state.negotiatedPrice = action.payload
        },
        setDealDone: (state, action) => {
            state.dealDone = action.payload
        },

        setAllProducts: (state, action) => {
            state.allProducts = action.payload
        }
    }
})


export const { setvariantAndProductId, setDealDone, setAllProducts, setNegotiatedPrice, setSellerLoading } = productSlice.actions
export default productSlice.reducer