import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import { useActor } from './hooks/useActor';
import ChecklistFormPage from './pages/ChecklistFormPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import InitErrorScreen from './components/system/InitErrorScreen';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { Loader2 } from 'lucide-react';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
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
  component: AdminSettingsPage,
});

const routeTree = rootRoute.addChildren([indexRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { mutate: saveProfile } = useSaveCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleProfileSave = (name: string) => {
    saveProfile({ name });
  };

  // Show loading state while actor is initializing
  if (actorFetching && !actor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Initializing application...</p>
        </div>
      </div>
    );
  }

  // If actor failed to initialize, show error
  if (!actor && !actorFetching) {
    return <InitErrorScreen error="Failed to initialize application. Please refresh the page." />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <ProfileSetupModal
        open={showProfileSetup}
        onSave={handleProfileSave}
      />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
