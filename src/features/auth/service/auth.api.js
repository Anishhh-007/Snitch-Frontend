import axios from "axios";

const authApiInstance = axios.create({
    baseURL: `${import.meta.env.VITE_FRONTEND_URL}/api/auth`,
    withCredentials: true
})

export async function register({ email, password, fullname, contact, isSeller }) {

    const res = await authApiInstance.post("/register", { email, password, fullname, contact, isSeller })
    return res
}

export async function login({ email, password }) {
    const res = await authApiInstance.post("/login", { email, password })
    return res
}

export async function fetchUser() {
    const res = await authApiInstance.get("/get-user")
    return res
}


export async function logout() {
    const res = await authApiInstance.post("/logout")
    return res
}