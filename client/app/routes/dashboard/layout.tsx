'use client';

import { useState, createContext, useContext } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { AppShell } from '@astryxdesign/core/AppShell';
import { SideNav, SideNavSection, SideNavItem } from '@astryxdesign/core/SideNav';
import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav';
import { Avatar } from '@astryxdesign/core/Avatar';
import { IconButton } from '@astryxdesign/core/IconButton';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { ToastViewport } from '@astryxdesign/core/Toast';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  Bell,
  Moon,
  Sun,
  LogOut,
  Search,
  User,
} from 'lucide-react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

function DashboardShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>('light');
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next;
  };

  const currentPath = location.pathname || '/';

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={16} />, path: '/' },
    { label: 'Documents', icon: <FileText size={16} />, path: '/documents' },
    { label: 'AI Chat', icon: <MessageSquare size={16} />, path: '/chat' },
    { label: 'Settings', icon: <Settings size={16} />, path: '/settings' },
  ];

  const topNav = (
    <TopNav
      label="Main navigation"
      heading={<TopNavHeading heading="DocMind AI" />}
      endContent={
        <>
          <IconButton label="Search documents" variant="ghost" icon={<Search size={16} />} />
          <IconButton label="Notifications" variant="ghost" icon={<Bell size={16} />} />
          <IconButton
            label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            variant="ghost"
            icon={theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            onClick={toggleTheme}
          />
          <DropdownMenu
            button={{ label: 'User menu', variant: 'ghost', icon: <Avatar size={24} name="Alex Johnson" />, isIconOnly: true }}
            placement="end"
            items={[
              { label: 'Profile', icon: <User size={16} /> },
              { label: 'Settings', icon: <Settings size={16} /> },
              { type: 'divider' as const },
              { label: 'Sign out', icon: <LogOut size={16} /> },
            ]}
          />
        </>
      }
    />
  );

  const sideNav = (
    <SideNav
      collapsible
      footerIcons={
        <IconButton label="Settings" variant="ghost" icon={<Settings size={16} />} onClick={() => navigate('/settings')} />
      }
    >
      <SideNavSection title="Main">
        {navItems.map((item) => (
          <SideNavItem
            key={item.path}
            label={item.label}
            icon={item.icon}
            isSelected={currentPath === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </SideNavSection>
    </SideNav>
  );

  return (
    <ThemeContext value={{ theme, toggleTheme }}>
      <ToastViewport position="bottomEnd" maxVisible={3}>
        <AppShell
          topNav={topNav}
          sideNav={sideNav}
          variant="elevated"
          contentPadding={6}
          mobileNav={{ isOpen: mobileOpen, onOpenChange: setMobileOpen }}
        >
          <Outlet />
        </AppShell>
      </ToastViewport>
    </ThemeContext>
  );
}

export default DashboardShell;
