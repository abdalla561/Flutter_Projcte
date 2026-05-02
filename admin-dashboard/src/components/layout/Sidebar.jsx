import React from "react"
import { NavLink } from "react-router-dom"
import { 
  LayoutDashboard, 
  Layers,
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Megaphone,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "../../lib/utils"

const SidebarItem = ({ icon: Icon, label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent hover:text-accent-foreground",
      isActive ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground"
    )}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </NavLink>
)

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card pt-16 transition-transform sm:translate-x-0">
      <div className="h-full overflow-y-auto px-3 py-4">
        <div className="mb-6 px-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Main Menu
          </h2>
        </div>
        <nav className="space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
          <SidebarItem icon={Layers} label="Categories" to="/categories" />
          <SidebarItem icon={Package} label="Products" to="/products" />
          <SidebarItem icon={ShoppingCart} label="Orders" to="/orders" />
          <SidebarItem icon={Users} label="Users" to="/users" />
          <SidebarItem icon={Megaphone} label="Ads" to="/ads" />
        </nav>
        
        <div className="mt-10 mb-6 px-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            System
          </h2>
        </div>
        <nav className="space-y-1">
          <SidebarItem icon={Settings} label="Settings" to="/settings" />
        </nav>
      </div>
    </aside>
  )
}

export { Sidebar }
