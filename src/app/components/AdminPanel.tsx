import React, { useEffect, useState } from 'react';
import { Layout } from './Layout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Item, User } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { CheckCircle, XCircle, Package, Users, TrendingUp, Trash2, Edit, UserX } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [pendingItems, setPendingItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    pendingItems: 0,
    activeReservations: 0,
  });

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const [pendingRes, itemsRes, usersRes, reservationsRes] = await Promise.all([
        supabase
          .from('items')
          .select('*, donor:users!items_donor_id_fkey(name, email)')
          .eq('status', 'Pending')
          .order('created_at', { ascending: false }),
        supabase.from('items').select('*, donor:users!items_donor_id_fkey(name, email)').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('reservations').select('id', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
      ]);

      setPendingItems(pendingRes.data || []);
      setAllItems(itemsRes.data || []);
      setAllUsers(usersRes.data || []);

      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalItems: itemsRes.data?.length || 0,
        pendingItems: pendingRes.data?.length || 0,
        activeReservations: reservationsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId: string) => {
    try {
      const { error } = await supabase.from('items').update({ status: 'Available' }).eq('id', itemId);

      if (error) throw error;

      toast.success('Item approved successfully');
      fetchAdminData();
    } catch (error: any) {
      console.error('Error approving item:', error);
      toast.error(error.message || 'Failed to approve item');
    }
  };

  const handleReject = async (itemId: string) => {
    try {
      const { error } = await supabase.from('items').delete().eq('id', itemId);

      if (error) throw error;

      toast.success('Item rejected and removed');
      fetchAdminData();
    } catch (error: any) {
      console.error('Error rejecting item:', error);
      toast.error(error.message || 'Failed to reject item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from('items').delete().eq('id', itemId);

      if (error) throw error;

      toast.success('Item deleted successfully');
      fetchAdminData();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete user from users table (auth.users will cascade delete)
      const { error } = await supabase.from('users').delete().eq('id', userId);

      if (error) throw error;

      toast.success('User deleted successfully');
      fetchAdminData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to access this page</p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage items, users, and platform activity</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeReservations}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Pending Items ({pendingItems.length})</TabsTrigger>
            <TabsTrigger value="items">All Items ({allItems.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({allUsers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingItems.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending items</h3>
                  <p className="text-muted-foreground">All items have been reviewed</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingItems.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <Badge variant="secondary" className="mt-2">
                            {item.category}
                          </Badge>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {item.image_url && (
                        <div className="w-full h-48 bg-accent rounded-lg overflow-hidden">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Condition:</span> {item.condition}
                        </p>
                        <p>
                          <span className="font-medium">Donor:</span> {item.donor?.name}
                        </p>
                        <p>
                          <span className="font-medium">Submitted:</span>{' '}
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                          onClick={() => handleApprove(item.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 dark:bg-red-700 dark:hover:bg-red-800"
                          onClick={() => handleReject(item.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="items">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {allItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.category} • {item.donor?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={item.status === 'Available' ? 'default' : 'secondary'}
                          className={
                            item.status === 'Available'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                              : ''
                          }
                        >
                          {item.status}
                        </Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0 dark:bg-red-700 dark:hover:bg-red-800"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex gap-3">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteItem(item.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {allUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{u.name}</h4>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {u.role}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{u.points} points</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 dark:border-input dark:text-foreground dark:hover:bg-input/50"
                            title="View user"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0 dark:bg-red-700 dark:hover:bg-red-800"
                                title="Delete user"
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete user "{u.name}"? This action cannot be undone.
                                  All their data will be permanently deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3 my-4">
                                <p className="text-sm text-red-800 dark:text-red-200">
                                  <strong>Warning:</strong> This will delete all items and messages associated with this user.
                                </p>
                              </div>
                              <div className="flex gap-3">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};
