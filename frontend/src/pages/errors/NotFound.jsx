'use client';

import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              404 - Page Not Found
            </CardTitle>
            <CardDescription className="mt-2">
              The page you're looking for doesn't exist. It might have been
              moved, deleted, or you entered the wrong URL.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button onClick={handleGoBack} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help?{' '}
              <Link to="/support" className="text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
