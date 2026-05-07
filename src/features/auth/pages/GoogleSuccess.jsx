import axios from "axios";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../hook/useAuth";

const GoogleSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { handeluser } = useAuth()

    const setCookies = async (token) => {
        try {
            await axios.post(`${import.meta.env.VITE_FRONTEND_URL}/api/auth/google/set-cookie`,
                { token },
                { withCredentials: true } // ← so the cookie gets stored
            )
        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            // Send token to backend — let IT set the cookie
            setCookies(token)
            navigate('/', { replace: true })
        } else {
            navigate('/login', { replace: true });
        }
    }, []);

    return <p>Signing you in...</p>;
};

export default GoogleSuccess