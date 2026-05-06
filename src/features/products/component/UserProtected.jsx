import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { useAuth } from "../../auth/hook/useAuth";
import { useEffect, useState } from "react";

const Protected = ({ children }) => {
    const { handeluser } = useAuth();

    // 1. Create state for the role and a local loading catch
    const [userRole, setUserRole] = useState(null);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await handeluser();
                console.log(user)
                setUserRole(user);
            } catch (error) {
                console.error("Failed to fetch User", error);
            } finally {
                setIsFetching(false);
            }
        };
        fetchUser();
    }, []);

    // 2. Wait for BOTH Redux loading and your local fetch to finish
    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
                <span>Loading...</span>
            </div>
        );
    }

    // 3. Now userRole will persist across the re-render
    if (userRole) {
        return children;
    } else {
        return <Navigate to="/login" />;
    }
};

export default Protected;