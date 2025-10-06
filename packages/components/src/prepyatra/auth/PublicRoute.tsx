import {useRouter} from "next/router";
import React, {ReactNode} from "react";

interface PublicRouteProps {
    children: ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({children}) => {
    const router = useRouter();

    // For public routes, we don't need any authentication checks
    // Just render the children directly
    return <>{children}</>;
};

export default PublicRoute;
