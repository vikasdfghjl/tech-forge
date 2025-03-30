import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, Moon, Sun, LogOut } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Navbar = ({ isDarkMode, toggleTheme }: NavbarProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  // Navigation handlers
  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    // If we're on a protected route, navigate to home
    if (window.location.pathname === "/profile") {
      navigate("/");
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleSubmit = () => {
    navigate("/submit");
  };

  return (
    <nav className="w-full py-4 px-6 flex items-center justify-between border-b border-border/30 backdrop-blur-sm bg-background/90 sticky top-0 z-40">
      <div className="flex-1 flex items-center">
        {/* Logo/Home link */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")} 
          className="text-lg font-semibold subtle-text-gradient"
        >
          Tech Forge
        </Button>
        
        {/* Add Submit Tool button */}
        <Button 
          variant="outline" 
          onClick={handleSubmit} 
          className="ml-4"
        >
          Submit Tool
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          <Switch 
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            aria-label="Toggle dark mode"
          />
          <Moon className="h-4 w-4" />
        </div>

        {/* User Profile Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {isAuthenticated ? (
              <>
                <div className="px-2 py-1.5 text-sm font-medium">
                  Signed in as<br />
                  <span className="text-muted-foreground">{user?.name || "User"}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleProfile}>Profile</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogin}>
                  Log in
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignup}>
                  Sign up
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
