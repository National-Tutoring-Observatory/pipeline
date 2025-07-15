import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { NavLink } from "react-router";

export default function AppSidebar() {

  const {
    toggleSidebar,
  } = useSidebar()

  return (
    <Sidebar variant="inset" >
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={toggleSidebar}>
                  <NavLink to={'/'}>
                    {({ isActive }) => (
                      <span className={isActive ? "underline" : ""}>Projects</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={toggleSidebar}>
                  <NavLink to={'/prompts'}>
                    {({ isActive }) => (
                      <span className={isActive ? "underline" : ""}>Prompts</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}