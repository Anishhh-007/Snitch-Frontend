import axios from 'axios'

const cartApiInstance = axios.create({
    baseURL: `/api/cart`,
    withCredentials: true,
})

export const addToCart = async (productId, variantId) => {
    const res = await cartApiInstance.post(`/add-items/${productId}/${variantId}`, {
        quantity: 1
    });
    return res;
};

export const viewCart = async () => {
    const res = await cartApiInstance.get("/get");
    return res;
};


export const deleteProductFromCart = async (itemId) => {
    const res = await cartApiInstance.delete(`/delete/${itemId}`);
    return res;
};

export const incrementQuantity = async (itemId) => {
    const res = await cartApiInstance.patch(`/increment/${itemId}`, {});
    return res;
};

export const decrementQuantity = async (itemId) => {
    const res = await cartApiInstance.patch(`/decrement/${itemId}`, {});
    return res;
};
