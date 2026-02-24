import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface AccessDeniedScreenProps {
  message?: string;
}

export default function AccessDeniedScreen({ 
  message = 'You do not have access to this page' 
}: AccessDeniedScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="container max-w-md py-16 px-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base">{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => navigate({ to: '/' })}>
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
