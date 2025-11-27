import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar as Sidebar } from '@/components/sidebar/app-sidebar';
import { Outlet } from 'react-router';
import Header from './Header';

export default function Layout() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
