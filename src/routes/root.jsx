import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navigation from "./navigation";

export default function Root() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/') {
            navigate('/home') //auto-redirect to /home from /
        }
    }, [location, navigate])

    return (
        <>
            <Navigation/>
            <div id='body'>
                <Outlet/>
            </div>
        </>
    );
}