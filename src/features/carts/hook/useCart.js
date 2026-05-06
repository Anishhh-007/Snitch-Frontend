import toast from "react-hot-toast"
import { addToCart, deleteProductFromCart, decrementQuantity, incrementQuantity, viewCart } from "../service/cart.api"


export const useCart = () => {


    const handelAddToCart = async (productId, variantId) => {
        try {
            const res = await addToCart(productId, variantId)
            toast.success(res.data.message)
        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
    }
    const handelGetCart = async () => {
        try {
            const res = await viewCart()
            return res.data.carts
        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
    }
    const handelIncrementQuantity = async (itemId) => {
        try {
            const res = await incrementQuantity(itemId)
            toast.success(res.data.message)
        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
    }
    const handelDeleteProductFromCart = async (itemId) => {
        try {
            const res = await deleteProductFromCart(itemId)
            toast.success(res.data.message)
        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
    }
    const handelDecrementQuantity = async (itemId) => {
        try {
            const res = await decrementQuantity(itemId)
            toast.success(res.data.message)
        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
    }
    return { handelAddToCart, handelGetCart, handelDeleteProductFromCart, handelIncrementQuantity, handelDecrementQuantity }
}
