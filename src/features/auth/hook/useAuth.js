import { setLoading, setUser } from "../state/auth.slice";
import { register, login, fetchUser, logout } from "../service/auth.api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from 'react-hot-toast'

export const useAuth = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    async function handelRegister({ email, password, fullname, contact, isSeller = false }) {
        try {

            const res = await register({ email, password, fullname, contact, isSeller })
            if (res.status === 201) {
                if (res.data.user.role) {
                    navigate('/dashboard')
                } else {
                    navigate('/')
                }
                dispatch(setUser(res.data.user))
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
    }
    async function handelLogin({ email, password }) {
        try {

            const res = await login({ email, password })
            console.log(res.data.user)
            if (res.status === 200) {
                toast.success(res.data.message)
                if (res.data.user.role === 'seller') {
                    navigate('/dashboard')
                } else {
                    navigate('/')
                }

                dispatch(setUser(res.data.user))
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
    }

    async function handeluser() {
        try {
            dispatch(setLoading(true))
            const res = await fetchUser();
            dispatch(setUser(res.data.user))
            return res.data.user
        } catch (error) {
            navigate('/register')
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function handelLogout() {
        try {
            const res = await logout()
            dispatch(setUser(null))
            toast.success(res?.data?.message)
        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
    }
    return { handelRegister, handelLogin, handeluser, handelLogout }
}