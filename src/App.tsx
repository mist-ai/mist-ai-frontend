import { TooltipProvider } from "@radix-ui/react-tooltip";
import Chat from "./pages/chat";

function App() {
  return (
    <TooltipProvider>
      <Chat />
    </TooltipProvider>
  );
}

export default App;
