import { TooltipProvider } from "@radix-ui/react-tooltip";
import Dashboard from "./pages/dashboard";

function App() {
  return (
    <TooltipProvider>
      <Dashboard />
    </TooltipProvider>
  );
}

export default App;
