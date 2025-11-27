// pages/Settings.jsx
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('password');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Admin code change state
  const [currentAdminCode, setCurrentAdminCode] = useState('');
  const [newAdminCode, setNewAdminCode] = useState('');
  const [confirmAdminCode, setConfirmAdminCode] = useState('');
  const [isAdminCodeLoading, setIsAdminCodeLoading] = useState(false);

  const { changePassword, changeAdminCode } = useAuthStore();

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err?.message || 'Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleAdminCodeChange = async (e) => {
    e.preventDefault();

    if (!currentAdminCode) {
      toast.error('Current admin code is required');
      return;
    }

    if (newAdminCode !== confirmAdminCode) {
      toast.error('New admin codes do not match');
      return;
    }

    if (newAdminCode.length !== 6 || !/^\d{6}$/.test(newAdminCode)) {
      toast.error('Admin code must be 6 digits');
      return;
    }

    if (currentAdminCode.length !== 6 || !/^\d{6}$/.test(currentAdminCode)) {
      toast.error('Current admin code must be 6 digits');
      return;
    }

    setIsAdminCodeLoading(true);
    try {
      await changeAdminCode(currentAdminCode, newAdminCode);
      toast.success('Admin code updated successfully!');
      setCurrentAdminCode('');
      setNewAdminCode('');
      setConfirmAdminCode('');
    } catch (err) {
      toast.error(err?.message || 'Failed to update admin code');
    } finally {
      setIsAdminCodeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Settings</CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">Change Password</TabsTrigger>
                <TabsTrigger value="admin">Change Admin Code</TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="space-y-4 mt-6">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="w-full"
                  >
                    {isPasswordLoading ? 'Updating...' : 'Change Password'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <form onSubmit={handleAdminCodeChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentAdminCode">Current Admin Code</Label>
                    <Input
                      type="text"
                      id="currentAdminCode"
                      value={currentAdminCode}
                      onChange={(e) =>
                        setCurrentAdminCode(
                          e.target.value.replace(/\D/g, '').slice(0, 6)
                        )
                      }
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-lg tracking-widest font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newAdminCode">New Admin Code</Label>
                    <Input
                      type="text"
                      id="newAdminCode"
                      value={newAdminCode}
                      onChange={(e) =>
                        setNewAdminCode(
                          e.target.value.replace(/\D/g, '').slice(0, 6)
                        )
                      }
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-lg tracking-widest font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmAdminCode">
                      Confirm New Admin Code
                    </Label>
                    <Input
                      type="text"
                      id="confirmAdminCode"
                      value={confirmAdminCode}
                      onChange={(e) =>
                        setConfirmAdminCode(
                          e.target.value.replace(/\D/g, '').slice(0, 6)
                        )
                      }
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-lg tracking-widest font-mono"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isAdminCodeLoading}
                    className="w-full"
                  >
                    {isAdminCodeLoading ? 'Updating...' : 'Change Admin Code'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
