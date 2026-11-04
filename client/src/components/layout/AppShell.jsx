import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { RightRail } from './RightRail';
import { Breadcrumbs } from './Breadcrumbs';
import { StatusStrip } from './StatusStrip';
import { MobileTabBar } from './MobileTabBar';

export const AppShell = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-ink font-mono flex flex-col justify-between selection:bg-accent selection:text-ink">
      {/* Top Header */}
      <TopBar
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Grid Viewport */}
      <div className="flex-1 flex items-stretch overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Central Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto pb-16 md:pb-0">
          <Breadcrumbs />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>

        {/* Right Rail (Desktop) */}
        <RightRail />
      </div>

      {/* Bottom Status Strip */}
      <StatusStrip />

      {/* Mobile Tab Bar */}
      <MobileTabBar />
    </div>
  );
};
