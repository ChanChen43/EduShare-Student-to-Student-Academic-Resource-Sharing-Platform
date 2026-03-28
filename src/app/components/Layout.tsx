import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  BookOpen,
  LayoutDashboard,
  Package,
  Plus,
  MessageSquare,
  Settings,
  Shield,
  BarChart3,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Persist dark mode preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['donor', 'beneficiary', 'admin'] },
    { name: 'Browse Items', href: '/items', icon: Package, roles: ['donor', 'beneficiary', 'admin'] },
    { name: 'Add Item', href: '/add-item', icon: Plus, roles: ['donor', 'admin'] },
    { name: 'My Items', href: '/my-items', icon: BookOpen, roles: ['donor', 'admin'] },
    { name: 'Reservations', href: '/reservations', icon: BookOpen, roles: ['beneficiary', 'admin'] },
    { name: 'Messages', href: '/messages', icon: MessageSquare, roles: ['donor', 'beneficiary', 'admin'] },
    { name: 'Admin Panel', href: '/admin', icon: Shield, roles: ['admin'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="p-2 bg-primary rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-primary hidden sm:block">EduShare</span>
              </Link>

              <div className="hidden md:flex ml-8 space-x-1">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-lg">
                <Sun className="w-4 h-4 text-foreground" />
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <Moon className="w-4 h-4 text-foreground" />
              </div>

              <Link to="/profile" title="Go to Profile">
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="px-2 pt-2 border-t border-border">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};
