import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { FolderKanban, LifeBuoy, SquareTerminal, Users } from "lucide-react";
import { NavLink } from "react-router";

export default function AppSidebar() {

  const onHelpAndSupportClicked = () => {
    console.log('onHelpClicked');
  }

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
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton size="sm" className="cursor-pointer" onClick={onHelpAndSupportClicked}>
                      <LifeBuoy />
                      <span>Help & Support</span>
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <SheetContent side="left" className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="flex items-center">
                        <LifeBuoy size={16} />
                        <span className="ml-2">Help & Support</span>
                      </SheetTitle>

                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter >
    </Sidebar>
  );
}