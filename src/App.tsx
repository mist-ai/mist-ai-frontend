import { TooltipProvider } from "@radix-ui/react-tooltip";
import Chat from "./pages/chat";
import Layout from "./pages/layout";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import SettingsPage from "./pages/settings";
import Graph from "./pages/graph";
import DocumentationPage from "./pages/documentation";

function App() {
  return (
    <TooltipProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
          </Routes>
        </Layout>
      </Router>
    </TooltipProvider>
  );
}

export default App;
