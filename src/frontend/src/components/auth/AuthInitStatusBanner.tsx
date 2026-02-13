import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface AuthInitStatusBannerProps {
  variant: 'warning' | 'error';
  onDismiss?: () => void;
  onReload?: () => void;
}

export default function AuthInitStatusBanner({ variant, onDismiss, onReload }: AuthInitStatusBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-40 px-4 py-2 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto">
        <Alert variant={variant === 'error' ? 'destructive' : 'default'} className="relative">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {variant === 'warning' ? 'Sign-in initialization delayed' : 'Authentication initialization failed'}
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>
              {variant === 'warning'
                ? 'Authentication is taking longer than expected. You can continue using the app anonymously.'
                : 'Unable to initialize authentication. You can reload the page to try again or continue using the app anonymously.'}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {variant === 'error' && onReload && (
                <Button size="sm" variant="outline" onClick={onReload}>
                  Reload
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
