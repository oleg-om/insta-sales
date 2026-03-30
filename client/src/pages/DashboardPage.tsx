import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';
import { Instagram, LogOut, Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';

interface SocialAccount {
  id: string;
  provider: string;
  username: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'instagram_connected') {
      toast({
        title: 'Success!',
        description: 'Instagram account connected successfully',
      });
      refreshUser();
      window.history.replaceState({}, '', '/dashboard');
    }

    if (error === 'auth_failed') {
      toast({
        variant: 'destructive',
        title: 'Connection failed',
        description: 'Failed to connect Instagram account',
      });
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams, toast, refreshUser]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/social/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const handleConnectInstagram = async () => {
    setLoading(true);
    try {
      const response = await api.get('/social/instagram/authorize');
      window.location.href = response.data.url;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to initiate Instagram connection',
      });
      setLoading(false);
    }
  };

  const handleDisconnectInstagram = async (accountId: string) => {
    try {
      await api.delete('/social/instagram');
      toast({
        title: 'Disconnected',
        description: 'Instagram account disconnected successfully',
      });
      setAccounts(accounts.filter((acc) => acc.id !== accountId));
      refreshUser();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to disconnect Instagram account',
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const instagramAccount = accounts.find((acc) => acc.provider === 'instagram');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">InstaSales</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Manage your social media accounts and connections
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                Connect your social media accounts to manage them from one place
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Instagram className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Instagram</h3>
                    {instagramAccount ? (
                      <p className="text-sm text-muted-foreground">
                        Connected as @{instagramAccount.username || 'Unknown'}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                {instagramAccount ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDisconnectInstagram(instagramAccount.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    onClick={handleConnectInstagram}
                    disabled={loading}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {instagramAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Overview of your Instagram account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connected since {new Date(instagramAccount.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
