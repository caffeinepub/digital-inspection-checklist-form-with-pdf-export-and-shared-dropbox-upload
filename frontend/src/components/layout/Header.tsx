import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Settings, ClipboardList, ShieldCheck, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin, useAreAdminPrivilegesAvailable, useClaimAdminPrivileges } from '../../hooks/useQueries';
import { toast } from 'sonner';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: adminAvailable, isLoading: availableLoading } = useAreAdminPrivilegesAvailable();
  const { mutate: claimAdmin, isPending: claiming } = useClaimAdminPrivileges();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleClaimAdmin = () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      return;
    }

    claimAdmin(undefined, {
      onSuccess: () => {
        toast.success('Admin access granted successfully');
      },
      onError: (error: any) => {
        console.error('Claim admin error:', error);
        toast.error(error?.message || 'Failed to claim admin access');
      },
    });
  };

  const showClaimButton = isAuthenticated && !isAdmin && adminAvailable && !adminLoading && !availableLoading;

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ClipboardList className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              <h1 className="text-xl font-bold">Safety Inspection</h1>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {showClaimButton && (
              <Button
                variant="default"
                size="sm"
                onClick={handleClaimAdmin}
                disabled={claiming}
              >
                {claiming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Get Admin Access
                  </>
                )}
              </Button>
            )}

            {isAuthenticated && isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/admin' })}
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            
            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
