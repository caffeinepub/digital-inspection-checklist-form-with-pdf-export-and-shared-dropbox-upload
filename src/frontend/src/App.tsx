import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import ChecklistFormPage from './pages/ChecklistFormPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import AuthInitStatusBanner from './components/auth/AuthInitStatusBanner';
import RequireAdmin from './components/auth/RequireAdmin';
import { useState, useEffect } from 'react';

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AppContent />
      </main>
      <Footer />
    </div>
  );
}

function AppContent() {
  const { identity, isInitializing, isLoginError } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { mutate: saveProfile } = useSaveCallerUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [initTimedOut, setInitTimedOut] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const isAuthenticated = !!identity;

  // Timeout for auth initialization (8 seconds)
  useEffect(() => {
    if (isInitializing) {
      const timer = setTimeout(() => {
        setInitTimedOut(true);
        setShowBanner(true);
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      setInitTimedOut(false);
      setShowBanner(false);
    }
  }, [isInitializing]);

  // Show error banner if auth initialization fails
  useEffect(() => {
    if (isLoginError) {
      setShowBanner(true);
    }
  }, [isLoginError]);

  // Hide banner when initialization completes successfully
  useEffect(() => {
    if (!isInitializing && !isLoginError) {
      setShowBanner(false);
    }
  }, [isInitializing, isLoginError]);

  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setShowProfileSetup(true);
    } else {
      setShowProfileSetup(false);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  const handleProfileSave = (name: string) => {
    saveProfile({ name }, {
      onSuccess: () => {
        setShowProfileSetup(false);
      },
    });
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
  };

  // Show lightweight loading only before timeout
  if (isInitializing && !initTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // After timeout or on error, render the app with banner
  return (
    <>
      {showBanner && (
        <AuthInitStatusBanner
          variant={isLoginError ? 'error' : 'warning'}
          onDismiss={handleDismissBanner}
          onReload={isLoginError ? handleReload : undefined}
        />
      )}
      <RouterProvider router={router} />
      <ProfileSetupModal
        open={showProfileSetup}
        onSave={handleProfileSave}
      />
    </>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ChecklistFormPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <RequireAdmin>
      <AdminSettingsPage />
    </RequireAdmin>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContent />
      <Toaster />
    </ThemeProvider>
  );
}
