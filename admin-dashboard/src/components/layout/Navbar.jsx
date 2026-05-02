import React from "react"
import { Bell, Search, User, Menu, LogOut } from "lucide-react"
import { Input } from "../ui/Input"
import { Button } from "../ui/Button"
import { authService } from "../../services/auth"

const Navbar = () => {
  const handleLogout = async () => {
    try {
      await authService.signOut()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start gap-4">
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 px-3">
              <div className="h-9 w-9 rounded-lg overflow-hidden flex items-center justify-center border shadow-sm bg-white">
                <img src="/logo.png" alt="Latech Logo" className="h-full w-full object-contain p-1" />
              </div>
              <span className="self-center whitespace-nowrap text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Latech Admin
              </span>
            </div>

          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search anything..." 
                className="pl-10 h-9 bg-muted/50 border-none focus-visible:ring-1"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              </Button>
              
              <div className="h-8 w-px bg-border mx-2" />
              
              <div className="flex items-center gap-3 pl-2">
                <div className="flex flex-col items-end text-sm">
                  <span className="font-semibold">Al Hamed</span>
                  <span className="text-xs text-muted-foreground">Super Admin</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center border">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export { Navbar }
