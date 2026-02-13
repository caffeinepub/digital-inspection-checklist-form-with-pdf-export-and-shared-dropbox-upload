import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useGetDropboxToken, useSetDropboxToken } from '../hooks/useQueries';
import RequireAdmin from '../components/auth/RequireAdmin';

function AdminSettingsContent() {
  const { data: existingToken, isLoading: tokenLoading } = useGetDropboxToken();
  const { mutate: setToken, isPending: isSaving } = useSetDropboxToken();
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const isTokenSet = !!existingToken;

  const handleSave = () => {
    if (!tokenInput.trim()) {
      toast.error('Please enter a Dropbox access token');
      return;
    }

    setSaveStatus('idle');
    setToken(tokenInput, {
      onSuccess: () => {
        setSaveStatus('success');
        setTokenInput('');
        setShowToken(false);
        toast.success('Dropbox token saved successfully');
      },
      onError: (error) => {
        setSaveStatus('error');
        toast.error('Failed to save Dropbox token');
        console.error('Save error:', error);
      },
    });
  };

  if (tokenLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
          <CardTitle className="text-2xl">Admin Settings</CardTitle>
          <CardDescription>
            Configure Dropbox integration for automatic PDF uploads
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Current Status */}
          <Alert className={isTokenSet ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : ''}>
            <AlertDescription className="flex items-center gap-2">
              {isTokenSet ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">Dropbox token is configured</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="font-medium">No Dropbox token configured</span>
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Token Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dropboxToken" className="text-base font-semibold">
                Dropbox Access Token
              </Label>
              <p className="text-sm text-muted-foreground">
                Enter your Dropbox access token to enable automatic PDF uploads to your shared Dropbox account.
              </p>
            </div>

            <div className="relative">
              <Input
                id="dropboxToken"
                type={showToken ? 'text' : 'password'}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter Dropbox access token"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving || !tokenInput.trim()}
              className="w-full"
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Token
                </>
              )}
            </Button>

            {saveStatus === 'success' && (
              <Alert className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800 dark:text-emerald-200">
                  Token saved successfully. PDF uploads will now be sent to Dropbox.
                </AlertDescription>
              </Alert>
            )}

            {saveStatus === 'error' && (
              <Alert className="border-destructive bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  Failed to save token. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold text-sm">How to get a Dropbox access token:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to the Dropbox App Console</li>
              <li>Create a new app or select an existing one</li>
              <li>Generate an access token in the OAuth 2 section</li>
              <li>Copy and paste the token above</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <RequireAdmin>
      <AdminSettingsContent />
    </RequireAdmin>
  );
}
