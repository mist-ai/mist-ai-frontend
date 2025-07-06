import { Button } from "@/components/ui/button";
import { LayoutProps } from "@/models/layout";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import {
  Triangle,
  SquareTerminal,
  Bot,
  TrendingUp,
  Book,
  Settings2,
  LifeBuoy,
  SquareUser,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  return (
    <div className="grid h-screen w-full pl-[64px]">
      <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r bg-gradient-to-b from-background to-muted/20 backdrop-blur-sm shadow-lg">
        <div className="border-b p-3 bg-background/80 backdrop-blur-sm">
          <Button
            variant="outline"
            size="icon"
            aria-label="Home"
            className="w-10 h-10 border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
          >
            <Triangle className="size-5 fill-primary text-primary" />
          </Button>
        </div>
        <nav className="grid gap-2 p-3 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-xl h-11 w-11 transition-all duration-200 hover:scale-105 ${
                    isActive("/dashboard")
                      ? "bg-primary/20 text-primary hover:bg-primary/25"
                      : "hover:bg-primary/10 hover:text-primary"
                  }`}
                  aria-label="Dashboard"
                >
                  <SquareTerminal className="size-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="bg-popover/95 backdrop-blur-sm"
            >
              Dashboard
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/chat">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-xl h-11 w-11 transition-all duration-200 hover:scale-105 ${
                    isActive("/chat") || isActive("/")
                      ? "bg-primary/20 text-primary hover:bg-primary/25"
                      : "hover:bg-primary/10 hover:text-primary"
                  }`}
                  aria-label="Chat"
                >
                  <Bot className="size-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="bg-popover/95 backdrop-blur-sm"
            >
              Chat
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/graph">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-xl h-11 w-11 transition-all duration-200 hover:scale-105 ${
                    isActive("/graph")
                      ? "bg-primary/20 text-primary hover:bg-primary/25"
                      : "hover:bg-primary/10 hover:text-primary"
                  }`}
                  aria-label="Analytics"
                >
                  <TrendingUp className="size-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="bg-popover/95 backdrop-blur-sm"
            >
              Analytics
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/documentation">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-xl h-11 w-11 transition-all duration-200 hover:scale-105 ${
                    isActive("/documentation")
                      ? "bg-primary/20 text-primary hover:bg-primary/25"
                      : "hover:bg-primary/10 hover:text-primary"
                  }`}
                  aria-label="Documentation"
                >
                  <Book className="size-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="bg-popover/95 backdrop-blur-sm"
            >
              Documentation
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-xl h-11 w-11 transition-all duration-200 hover:scale-105 ${
                    isActive("/settings")
                      ? "bg-primary/20 text-primary hover:bg-primary/25"
                      : "hover:bg-primary/10 hover:text-primary"
                  }`}
                  aria-label="Settings"
                >
                  <Settings2 className="size-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="bg-popover/95 backdrop-blur-sm"
            >
              Settings
            </TooltipContent>
          </Tooltip>
        </nav>

        <nav className="grid gap-2 p-3 border-t border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
                aria-label="Help"
              >
                <LifeBuoy className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="bg-popover/95 backdrop-blur-sm"
            >
              Help
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
                aria-label="Account"
              >
                <SquareUser className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="bg-popover/95 backdrop-blur-sm"
            >
              Account
            </TooltipContent>
          </Tooltip>
        </nav>
      </aside>
      {children}
    </div>
  );
};

export default Layout;
