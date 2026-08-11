import React from "react";
import { Route } from "./Sidebar";
interface HeaderProps {
    activeRoute: Route;
    onWalkInLogger: () => void;
}
declare const Header: React.FC<HeaderProps>;
export default Header;
