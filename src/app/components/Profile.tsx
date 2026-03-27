import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export const Profile: React.FC = () => {
  const { user, session, refreshUser, changePassword, resetPassword } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Refresh user data when profile loads
  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    setNewName(user?.name || '');
  }, [user]);

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === user?.name) {
      setIsEditingName(false);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: newName })
        .eq('id', user?.id);

      if (error) throw error;

      await refreshUser();
      toast.success('Name updated successfully');
      setIsEditingName(false);
    } catch (error: any) {
      console.error('Error updating name:', error);
      toast.error(error.message || 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await changePassword(currentPassword, newPassword);
      if (error) throw error;

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(user?.email || '');
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  if (!user) {
    return (
      <Layout>
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">Please log in to view your profile</p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and information</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-medium text-sm break-all">{user.id}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  {/* Full Name */}
                  <div>
                    <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Full Name
                    </Label>
                    {isEditingName ? (
                      <div className="flex gap-2">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Enter your full name"
                          className="flex-1"
                        />
                        <Button
                          onClick={handleUpdateName}
                          disabled={loading}
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingName(false);
                            setNewName(user.name);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium">{user.name}</p>
                        <Button
                          onClick={() => setIsEditingName(true)}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <p className="text-lg font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>

                  {/* Role */}
                  <div>
                    <Label className="text-base font-semibold mb-3">Account Type</Label>
                    <Badge className="capitalize text-base py-1 px-3">
                      {user.role}
                    </Badge>
                  </div>

                  {/* Points */}
                  <div>
                    <Label className="text-base font-semibold mb-3">Contribution Points</Label>
                    <p className="text-3xl font-bold text-primary">{user.points}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Earn points by donating items and helping the community
                    </p>
                  </div>

                  {/* Member Since */}
                  <div>
                    <Label className="text-base font-semibold mb-3">Member Since</Label>
                    <p className="text-lg font-medium">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Update your password to keep your account secure
                  </p>

                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <Label htmlFor="current-password" className="text-sm font-medium">
                        Current Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="current-password"
                          type={showPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          disabled={passwordLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <Label htmlFor="new-password" className="text-sm font-medium">
                        New Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter your new password"
                          disabled={passwordLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <Label htmlFor="confirm-password" className="text-sm font-medium">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        disabled={passwordLoading}
                        className="mt-2"
                      />
                    </div>

                    <Button
                      onClick={handleChangePassword}
                      disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                      className="w-full"
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>

                {/* Reset Password */}
                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Can't remember your password? We'll send you a password reset link via email.
                  </p>

                  <Button
                    onClick={handleResetPassword}
                    variant="outline"
                    className="w-full"
                  >
                    Send Password Reset Email
                  </Button>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-200 rounded-lg p-6 bg-red-50 dark:bg-red-950/20">
                  <h3 className="text-lg font-semibold mb-2 text-red-900 dark:text-red-100">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete your account? This action cannot be undone.
                          All your data will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 my-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Warning:</strong> Deleting your account is irreversible. Please consider downloading your data first.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};
