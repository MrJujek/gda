import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-6xl font-semibold">404</h1>
                <p className="text-xl mt-4">Page not found</p>
                <Link to="/" className="text-blue-500 mt-4 inline-block">
                    Go back to home
                </Link>
            </div>
        </div>
    );
}

export default NotFound;