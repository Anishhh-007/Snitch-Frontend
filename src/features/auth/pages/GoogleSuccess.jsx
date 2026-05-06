import axios from "axios";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

const GoogleSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();


    const setCookies = async () => {
        axios.post(`${import.meta.env.VITE_FRONTEND_URL}/api/auth/google/set-cookie`,
            { token },
            { withCredentials: true } // ← so the cookie gets stored
        )
            .then(() => navigate('/', { replace: true }))
            .catch(() => navigate('/login', { replace: true }));
    }
    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            // Send token to backend — let IT set the cookie
            setCookies()
        } else {
            navigate('/login', { replace: true });
        }
    }, []);

    return <p>Signing you in...</p>;
};

export default GoogleSuccess