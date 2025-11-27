'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wrench, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router';

const Maintenance = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
            <Wrench className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              Under Maintenance
            </CardTitle>
            <CardDescription className="mt-2">
              We're currently performing scheduled maintenance to improve your
              experience. We'll be back shortly.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Estimated downtime:</strong> 30 minutes
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Started:</strong> {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Again
            </Button>
            <Link to="/">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Follow us on{' '}
              <Link to="#" className="text-primary hover:underline">
                Twitter
              </Link>{' '}
              for updates
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;
