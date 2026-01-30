import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, InstagramAccount } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Instagram, LogOut, User } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [instagramAccount, setInstagramAccount] =
    useState<InstagramAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadInstagramAccount();

    // Check for Instagram connection success/error
    if (searchParams.get('instagram_connected') === 'true') {
      toast({
        title: 'Success',
        description: 'Instagram account connected successfully',
      });
      // Reload account info
      loadInstagramAccount();
    } else if (searchParams.get('error') === 'instagram_auth_failed') {
      toast({
        title: 'Error',
        description: 'Failed to connect Instagram account',
        variant: 'destructive',
      });
    }
  }, [searchParams]);

  const loadInstagramAccount = async () => {
    try {
      const data = await authApi.getInstagramAccount();
      if (data.connected && data.account) {
        setInstagramAccount(data.account);
      }
    } catch (error) {
      console.error('Failed to load Instagram account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectInstagram = async () => {
    setConnecting(true);
    try {
      const data = await authApi.getInstagramAuthUrl();
      window.location.href = data.authUrl;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate Instagram connection',
        variant: 'destructive',
      });
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Insta Sales</h1>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-base font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Member since
                </p>
                <p className="text-base font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Instagram Connection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Instagram Connection
              </CardTitle>
              <CardDescription>
                Connect your Instagram account to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : instagramAccount ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Connected
                      </p>
                      <p className="text-lg font-bold text-green-900">
                        @{instagramAccount.username}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Instagram className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Connected on{' '}
                    {new Date(instagramAccount.connectedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    No Instagram account connected yet. Connect your account to
                    start managing your Instagram sales.
                  </p>
                  <Button
                    onClick={handleConnectInstagram}
                    disabled={connecting}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Instagram className="mr-2 h-4 w-4" />
                    {connecting
                      ? 'Connecting...'
                      : 'Connect Instagram Account'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
