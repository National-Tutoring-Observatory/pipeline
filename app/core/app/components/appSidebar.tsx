import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { FolderKanban, LifeBuoy, SquareTerminal, Users } from "lucide-react";
import { NavLink } from "react-router";

export default function AppSidebar() {

  return (
    <Sidebar variant="inset" >
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={'/'}>
                    {({ isActive }) => (
                      <>
                        <FolderKanban />
                        <span className={isActive ? "underline" : ""}>Projects</span>
                      </>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={'/prompts'}>
                    {({ isActive }) => (
                      <>
                        <SquareTerminal />
                        <span className={isActive ? "underline" : ""}>Prompts</span>
                      </>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild >
                  <NavLink to={'/teams'}>
                    {({ isActive }) => (
                      <>
                        <Users />
                        <span className={isActive ? "underline" : ""}>Teams</span>
                      </>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={'/users'}>
                    {({ isActive }) => (
                      <span className={isActive ? "underline" : ""}>Users</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-0 pb-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="sm">
                  <Button variant="ghost" className="justify-start cursor-pointer">
                    <LifeBuoy />
                    <span>Help & Support</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter >
    </Sidebar>
  );
}