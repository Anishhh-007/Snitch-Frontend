import toast from "react-hot-toast"
import { createOrder, getOrder, updateStatus } from "../service/order.api"
import { useDispatch, useSelector } from "react-redux"
import { setvariantAndProductId } from "../../products/state/product.slice"


const useOrder = () => {
    const dispatch = useDispatch()
    const { variantAndProductId } = useSelector((state) => state.product)

    const handelCreateOrder = async (productId, variantId, price, access) => {
        try {
            dispatch(setvariantAndProductId({ productId, variantId, access }))
            const res = await createOrder(productId, variantId, price, access)
            return res
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error)
        }
    }

    const handelUpdateStatus = async () => {
        try {

            const res = await updateStatus(variantAndProductId.variantId, variantAndProductId.productId)
            navigate('/')

            toast.success(res.data.message)

            return res
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error)
        }
    }

    const handelGetOrder = async () => {
        try {
            const res = await getOrder()
            return res
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error)
        }
    }
    return { handelCreateOrder, handelUpdateStatus, handelGetOrder }
}


export default useOrder
