import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReactNode } from 'react';

interface ChecklistSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function ChecklistSection({ title, description, children }: ChecklistSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Separator />
      <div className="pl-2">
        {children}
      </div>
    </div>
  );
}
