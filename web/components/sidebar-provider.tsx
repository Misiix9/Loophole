"use client";

import { createContext, useContext, useEffect, useState } from "react";

type SidebarContextType = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
    setIsInitialized(true);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  // Prevent hydration mismatch by rendering children only after init, 
  // OR accepting the flash but preventing the reset. 
  // For standard UX, we usually just render. The 'jump' on F5 is harder to fix without cookies,
  // but this fixes the 'jump' on navigation.
  
  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
