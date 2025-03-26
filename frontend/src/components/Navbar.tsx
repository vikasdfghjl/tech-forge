
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Moon, Sun } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Navbar = ({ isDarkMode, toggleTheme }: NavbarProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simulated login/logout functions
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleSignup = () => {
    // In real app, this would open signup form
    console.log("Sign up clicked");
  };

  return (
    <nav className="w-full py-4 px-6 flex items-center justify-between border-b border-border/30 backdrop-blur-sm bg-background/90 sticky top-0 z-40">
      <div className="flex-1">
        {/* Left side - could add logo here */}
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
            {isLoggedIn ? (
              <>
                <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
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
