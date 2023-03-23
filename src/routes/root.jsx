import { Outlet } from "react-router-dom";
import Navigation from "./navigation";

export default function Root() {
    return (
        <>
            <Navigation/>
            <div id='body'>
                <Outlet/>
            </div>
        </>
    );
}