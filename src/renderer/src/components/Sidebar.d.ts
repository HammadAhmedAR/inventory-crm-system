import React from "react";
export type Route = "/workbench" | "/inventory" | "/prospects" | "/agreements";
interface SidebarProps {
    activeRoute: Route;
    onNavigate: (route: Route) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}
declare const Sidebar: React.FC<SidebarProps>;
export default Sidebar;
