import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { LandingPage } from '../features/landing/LandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ArenaPage } from '../features/arena/ArenaPage';
import { LeaderboardsPage } from '../features/leaderboard/LeaderboardsPage';
import { AchievementsPage } from '../features/achievements/AchievementsPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { StyleGuidePage } from '../features/dev/StyleGuidePage';
import { PlaceholderView } from '../features/common/PlaceholderView';
import { ExploreGroupsPage } from '../features/groups/ExploreGroupsPage';
import { CreateGroupPage } from '../features/groups/CreateGroupPage';
import { MyGroupsPage } from '../features/groups/MyGroupsPage';
import { GroupDashboardPage } from '../features/groups/GroupDashboardPage';
import { JoinInvitePage } from '../features/groups/JoinInvitePage';

export const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Public Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Development UI Kit */}
        <Route path="/dev/ui" element={<StyleGuidePage />} />

        {/* Protected Application Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/arena"
          element={
            <ProtectedRoute>
              <ArenaPage />
            </ProtectedRoute>
          }
        />
        {/* Groups & Community Routes */}
        <Route path="/groups" element={<ExploreGroupsPage />} />
        <Route path="/invite/:token" element={<JoinInvitePage />} />
        <Route
          path="/groups/create"
          element={
            <ProtectedRoute>
              <CreateGroupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-groups"
          element={
            <ProtectedRoute>
              <MyGroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:id"
          element={
            <ProtectedRoute>
              <GroupDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboards"
          element={
            <ProtectedRoute>
              <LeaderboardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <AchievementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PlaceholderView
                title="ACCOUNT &amp; PLATFORM SETTINGS"
                indexLabel="[SET_01]"
                phase="ACTIVATES IN PHASE 4"
                description="Personal preferences, timezone selection, and notification channels activate in Phase 4."
              />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
export default App;
