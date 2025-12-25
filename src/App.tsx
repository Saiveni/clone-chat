import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import SignUpPage from "./pages/SignUpPage";
import ChatsPage from "./pages/ChatsPage";
import ChatPage from "./pages/ChatPage";
import ContactsPage from "./pages/ContactsPage";
import CallsPage from "./pages/CallsPage";
import SettingsPage from "./pages/SettingsPage";
import StatusPage from "./pages/StatusPage";
import AccountSettings from "./pages/AccountSettings";
import NotificationsSettings from "./pages/NotificationsSettings";
import PrivacySettings from "./pages/PrivacySettings";
import ChatsSettings from "./pages/ChatsSettings";
import HelpPage from "./pages/HelpPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <ChatProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/chats" element={<ChatsPage />} />
              <Route path="/chat/:chatId" element={<ChatPage />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/calls" element={<CallsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/account" element={<AccountSettings />} />
              <Route path="/settings/notifications" element={<NotificationsSettings />} />
              <Route path="/settings/privacy" element={<PrivacySettings />} />
              <Route path="/settings/chats" element={<ChatsSettings />} />
              <Route path="/settings/help" element={<HelpPage />} />
              <Route path="/settings/about" element={<AboutPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ChatProvider>
      </AuthProvider>
    </TooltipProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
