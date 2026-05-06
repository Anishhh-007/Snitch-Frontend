import { createSlice } from "@reduxjs/toolkit";
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: true,
        err: null,
        cartCount: 0
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setErr: (state, action) => {
            state.err = action.payload
        },
        inrCartCount: (state, action) => {
            state.cartCount += action.payload ?? 1
        },
        dcrCartCount: (state, action) => {
            state.cartCount -= action.payload ?? 1
        },
    }
})

export const { setUser, setLoading, setErr, inrCartCount, dcrCartCount } = authSlice.actions
export default authSlice.reducer