import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from './Layout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase, Item, Reservation } from '../../lib/supabase';
import { BookOpen, Package, TrendingUp, Users, Award } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalItems: 0,
    myItems: 0,
    reservations: 0,
    totalUsers: 0,
  });
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const [itemsRes, myItemsRes, reservationsRes, usersRes, recentItemsRes, myReservationsRes] =
        await Promise.all([
          supabase.from('items').select('id', { count: 'exact', head: true }),
          supabase.from('items').select('id', { count: 'exact', head: true }).eq('donor_id', user.id),
          supabase
            .from('reservations')
            .select('id', { count: 'exact', head: true })
            .eq('borrower_id', user.id),
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase
            .from('items')
            .select('*, donor:users!items_donor_id_fkey(name, email)')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('reservations')
            .select('*, item:items(*)')
            .eq('borrower_id', user.id)
            .neq('status', 'completed')
            .order('reserved_at', { ascending: false })
            .limit(5),
        ]);

      setStats({
        totalItems: itemsRes.count || 0,
        myItems: myItemsRes.count || 0,
        reservations: reservationsRes.count || 0,
        totalUsers: usersRes.count || 0,
      });

      setRecentItems(recentItemsRes.data || []);
      setMyReservations(myReservationsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your account today
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground mt-1">Available for sharing</p>
            </CardContent>
          </Card>

          {user?.role === 'donor' || user?.role === 'admin' ? (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">My Donations</CardTitle>
                <BookOpen className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.myItems}</div>
                <p className="text-xs text-muted-foreground mt-1">Items you're sharing</p>
              </CardContent>
            </Card>
          ) : null}

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Reservations</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reservations}</div>
              <p className="text-xs text-muted-foreground mt-1">Active reservations</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Karma Points</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.points || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Your contribution score</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Items</CardTitle>
            </CardHeader>
            <CardContent>
              {recentItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No items available yet</p>
              ) : (
                <div className="space-y-4">
                  {recentItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{item.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              item.status === 'Available'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : item.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              {myReservations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No reservations yet</p>
              ) : (
                <div className="space-y-4">
                  {myReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{reservation.item?.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Reserved on {new Date(reservation.reserved_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                              reservation.status === 'confirmed'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : reservation.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : reservation.status === 'completed'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {reservation.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
