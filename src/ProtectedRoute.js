import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("jwtToken");
    const location = useLocation();

    if (!token) {
        localStorage.setItem("intendedUrl", location.pathname + location.search);
        return <Navigate to="/candidate" state={{ from: location }} replace />;
    }

    return children;
};
export default ProtectedRoute;