import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setSellerLoading, setAllProducts } from "../state/product.slice";
import { createProduct, deleteProduct, getAllProduct, getProduct, getProductById, negociatePrice, updateProduct } from "../service/product.api";
import { useNavigate } from "react-router";

export const useProduct = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handelCreateProduct = async (formdata) => {
        try {
            dispatch(setSellerLoading(true))
            const res = await createProduct(formdata)
            toast.success(res.data.message)
            navigate("/dashboard")
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error)
        } finally {
            dispatch(setSellerLoading(false))
        }
    }

    const handelGetProduct = async () => {
        try {
            dispatch(setSellerLoading(true))
            const res = await getProduct()
            return res.data.products
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error)
        } finally {
            dispatch(setSellerLoading(false))
        }
    }

    const handelGetAllproduct = async () => {
        try {
            const res = await getAllProduct()
            dispatch(setAllProducts(res.data.product))
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error)
        }
    }

    const handelGetProductById = async (productId) => {
        try {
            const res = await getProductById(productId)
            return res
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error)
        }
    }
    const handelDeleteProduct = async (productId) => {
        try {
            const res = await deleteProduct(productId)
            toast.success(res.data.message)
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error)
        }
    }

    const handelEditProduct = async (productId, productData) => {
        try {
            const res = await updateProduct(productId, productData)
            toast.success(res.data.message)
            navigate("/dashboard")
            return res
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error)
        }
    }

    const handelNegociatePrice = async (details, messages) => {
        try {
            const res = await negociatePrice(details, messages)
            return res
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error)
        }
    }

    return { handelCreateProduct, handelGetProduct, handelGetAllproduct, handelGetProductById, handelDeleteProduct, handelEditProduct, handelNegociatePrice }
}