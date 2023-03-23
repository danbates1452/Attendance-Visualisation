import { useRouteError } from "react-router-dom";
import { Alert } from "react-bootstrap";

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div id='error-page'>
            <Alert variant='warning'>
                An unexpected error has occured! Please flag this to an admin.
                <br/>
                <i>{error.statusText || error.message}</i>
            </Alert>
        </div>
    );
}