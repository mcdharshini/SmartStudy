"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Search, Bell, Settings, LogOut, User, BarChart3, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"

export function AppHeader() {
  const router = useRouter()
  const { user, logout, notebooks } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const initials =
    user?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

  const filteredNotebooks = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return notebooks
      .filter((nb) => nb.title.toLowerCase().includes(query) || nb.subject.toLowerCase().includes(query))
      .slice(0, 5)
  }, [searchQuery, notebooks])

  const handleNotebookClick = (notebookId: string) => {
    setSearchQuery("")
    setIsSearchFocused(false)
    router.push(`/notebook/${notebookId}`)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        {/* Logo */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 font-semibold text-foreground hover:opacity-80 transition-opacity"
          aria-label="Go to dashboard"
        >
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block">Smart Study Hub</span>
        </button>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/infographics")}
            className="text-muted-foreground hover:text-foreground"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Infographics
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/study-plan")}
            className="text-muted-foreground hover:text-foreground"
          >
            Study Plan
          </Button>
        </nav>

        <div className="flex-1 max-w-md relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notebooks..."
              className="pl-8 pr-8 bg-secondary border-border"
              aria-label="Search notebooks"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
              {filteredNotebooks.length > 0 ? (
                <ul className="py-1">
                  {filteredNotebooks.map((notebook) => (
                    <li key={notebook.id}>
                      <button
                        onClick={() => handleNotebookClick(notebook.id)}
                        className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-3 transition-colors"
                      >
                        <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{notebook.title}</p>
                          <p className="text-xs text-muted-foreground">{notebook.subject}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                  No notebooks found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/settings")}
            aria-label="Settings"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/infographics")}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Infographics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
