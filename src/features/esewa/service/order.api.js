import axios from "axios"


const orderApiInstance = axios.create({
    baseURL: `${import.meta.env.VITE_FRONTEND_URL}/api/order`,
    withCredentials: true,
})
export const createOrder = async (productId, variantId, price, access) => {
    const res = await orderApiInstance.post(`/create-order/${variantId}/${productId}`, {
        price: price.amount,
        access
    })
    return res
}

export const updateStatus = async (variantId, productId) => {
    const res = await orderApiInstance.patch(`/update-order/${variantId}/${productId}`)
    return res
}

export const getOrder = async () => {
    const res = await orderApiInstance.get(`/get-orders`)
    return res
} 