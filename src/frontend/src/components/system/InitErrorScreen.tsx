import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InitErrorScreenProps {
  error?: Error | string;
  onRetry?: () => void;
}

export default function InitErrorScreen({ error, onRetry }: InitErrorScreenProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Unable to Load Application</CardTitle>
          <CardDescription>
            The application failed to initialize properly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm text-muted-foreground break-words">
              {errorMessage}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Try the following:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Refresh the page</li>
              <li>Clear your browser cache</li>
              <li>Try logging in again</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </div>

          {onRetry && (
            <Button onClick={onRetry} className="w-full" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
