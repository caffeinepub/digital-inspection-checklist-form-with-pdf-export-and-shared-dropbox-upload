import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Settings } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const text = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

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

  const handleAdminClick = () => {
    navigate({ to: '/admin' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: '/' })}
            className="text-xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Safety Inspection
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdminClick}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Admin
            </Button>
          )}
          
          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
            size="sm"
          >
            {text}
          </Button>
        </div>
      </div>
    </header>
  );
}
