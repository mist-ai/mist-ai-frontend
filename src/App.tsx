import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Dashboard } from "./dashboard";

function App() {
  return (
    <TooltipProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Dashboard />
      </ThemeProvider>
    </TooltipProvider>
  );
}

export default App;
