import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { StatusProvider } from "@/context/StatusContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import SignUpPage from "./pages/SignUpPage";
import ChatsPage from "./pages/ChatsPage";
import ChatPage from "./pages/ChatPage";
import ContactsPage from "./pages/ContactsPage";
import StatusPage from "./pages/StatusPage";
import StatusViewPage from "./pages/StatusViewPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ChatProvider>
          <StatusProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/chats" element={<ChatsPage />} />
                <Route path="/chat/:chatId" element={<ChatPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/status" element={<StatusPage />} />
                <Route path="/status/:statusId" element={<StatusViewPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </StatusProvider>
        </ChatProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
