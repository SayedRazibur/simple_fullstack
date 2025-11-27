'use client';
import { useNavigate } from 'react-router';
import {
  Moon,
  Sun,
  LogOut,
  User,
  Search,
  Download,
  Calendar,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import SwitchUserMode from '@/components/auth/SwitchUserMode';
// import { SearchForm } from './search-form';

const Header = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-background border-b min-h-[64px]">
      <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
        {/* Sidebar Trigger (shadcn) */}
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Search - Hidden on small mobile */}
        {/* <div className="relative hidden sm:block">
                    <Search className="absolute left-2 md:left-3 top-2.5 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-7 md:pl-8 w-32 sm:w-48 md:w-64 h-8 md:h-9 text-sm" />
                </div> */}
        {/* <SearchForm /> */}

        <SwitchUserMode />

        {/* Action Buttons - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 bg-transparent">
            <Calendar className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden md:inline">Pick a date</span>
          </Button>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleThemeToggle}
          className="h-8 w-8 md:h-9 md:w-9"
        >
          {theme === 'light' ? (
            <Moon className="h-3 w-3 md:h-4 md:w-4" />
          ) : (
            <Sun className="h-3 w-3 md:h-4 md:w-4" />
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 md:h-9 md:w-9 rounded-full"
            >
              <Avatar className="h-8 w-8 md:h-9 md:w-9">
                {/* <AvatarImage
                  src={user?.avatar || '/placeholder.svg'}
                  alt={user?.name}
                /> */}
                <AvatarFallback className="text-xs md:text-sm">
                  {isAdmin ? 'A' : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium text-sm">
                  {isAdmin ? 'Admin' : 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {'super@admin.com'}
                </p>
              </div>
            </div>

            {/* Mobile-only menu items */}
            <div className="lg:hidden">
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                Pick a date
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
