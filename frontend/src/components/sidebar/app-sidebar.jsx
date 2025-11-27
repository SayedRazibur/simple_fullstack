import * as React from 'react';
import { LayoutDashboard } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { getSidebarData } from '@/constants/sidebar-data';
import { NavGroup } from './nav-group';
import { useAuthStore } from '@/store/authStore';

function AppSidebar({ ...props }) {
  const { isAdmin } = useAuthStore();

  const sidebarData = getSidebarData(isAdmin);
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-foreground truncate">
              SmartBiz
            </h1>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
export { AppSidebar };
