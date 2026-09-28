import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/useAuthHook";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    toast({ title: "Até logo!", description: "Você saiu da sua conta." });
  };

  return (
    <header className="flex h-16 md:h-20 items-center justify-between border-b border-border bg-card px-4 md:px-8">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted lg:hidden shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="font-display text-lg md:text-2xl font-bold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* User Menu */}
        {user && (
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-sm text-muted-foreground">
              {user.name || user.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 md:h-10 md:w-10"
              title="Sair"
            >
              <LogOut className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
