// React component: /auth/google/success
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie'; // npm install js-cookie

const GoogleSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            // Set the cookie on the FRONTEND domain ✅
            Cookies.set('token', token, {
                expires: 7,
                secure: true,
                sameSite: 'None',
            });

            // OR use localStorage if you prefer:
            // localStorage.setItem('token', token);

            // Clean the URL and redirect
            navigate('/', { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    }, []);

    return <p>Signing you in...</p>;
};

export default GoogleSuccess;