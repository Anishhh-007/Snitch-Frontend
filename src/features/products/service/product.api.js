import axios from "axios";

const productApiInstance = axios.create({
    baseURL: `/api/product`,
    withCredentials: true,
})
const negotiateApiInstance = axios.create({
    baseURL: `/api/negotiate`,
    withCredentials: true,
})
export const createProduct = async (productData) => {
    const res = await productApiInstance.post("/create-products", productData)
    return res
}

export const getProduct = async () => {
    const res = await productApiInstance.get("/get-products")
    return res
}

export const getAllProduct = async () => {
    const res = await productApiInstance.get(`/get-all`)
    return res
}

export const getProductById = async (productId) => {
    const res = await productApiInstance.get(`/get-product/${productId}`)
    return res
}


export const updateProduct = async (productId, productData) => {
    const res = await productApiInstance.put(`/update-product/${productId}`, productData);
    return res;
};

export const deleteProduct = async (productId) => {
    const res = await productApiInstance.delete(`/delete-product/${productId}`);
    return res;
};
export const negociatePrice = async (details, messages) => {
    const res = await negotiateApiInstance.post("/", { details, messages });
    return res.data;
};