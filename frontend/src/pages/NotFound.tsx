import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function NotFound() {
    const { user } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-6xl font-semibold">404</h1>
                <p className="text-xl mt-4">Page not found</p>
                <Link to="/chat" className="text-blue-500 mt-4 inline-block">
                    Go back
                </Link>
            </div>
        </div>
    );
}

export default NotFound;