import React, { useEffect, useState } from 'react';
import { Layout } from './Layout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, Users, TrendingUp, Award } from 'lucide-react';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalReservations: 0,
    completedReservations: 0,
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchReportsData();
  }, [user]);

  const fetchReportsData = async () => {
    try {
      const [usersRes, itemsRes, reservationsRes, completedRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('items').select('*'),
        supabase.from('reservations').select('id', { count: 'exact', head: true }),
        supabase
          .from('reservations')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'completed'),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalItems: itemsRes.data?.length || 0,
        totalReservations: reservationsRes.count || 0,
        completedReservations: completedRes.count || 0,
      });

      const items = itemsRes.data || [];
      const categoryCount = items.reduce((acc: any, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      const categoryChartData = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value,
      }));
      setCategoryData(categoryChartData);

      const statusCount = items.reduce((acc: any, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      const statusChartData = Object.entries(statusCount).map(([name, value]) => ({
        name,
        value,
      }));
      setStatusData(statusChartData);

      const monthlyCount: any = {};
      items.forEach((item) => {
        const month = new Date(item.created_at).toLocaleString('default', { month: 'short' });
        monthlyCount[month] = (monthlyCount[month] || 0) + 1;
      });

      const monthlyChartData = Object.entries(monthlyCount).map(([month, count]) => ({
        month,
        items: count,
      }));
      setMonthlyData(monthlyChartData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Platform statistics and insights</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered students</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground mt-1">Shared resources</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reservations</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReservations}</div>
              <p className="text-xs text-muted-foreground mt-1">Total bookings</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedReservations}</div>
              <p className="text-xs text-muted-foreground mt-1">Successful exchanges</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Items by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Items Added Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="items" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="font-medium mb-2">Success Rate</h4>
                <p className="text-2xl font-bold text-primary">
                  {stats.totalReservations > 0
                    ? Math.round((stats.completedReservations / stats.totalReservations) * 100)
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Reservations completed successfully
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="font-medium mb-2">Average Items/User</h4>
                <p className="text-2xl font-bold text-primary">
                  {stats.totalUsers > 0 ? (stats.totalItems / stats.totalUsers).toFixed(1) : 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Items shared per student</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="font-medium mb-2">SDG 4 Impact</h4>
                <p className="text-2xl font-bold text-primary">{stats.totalItems}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Resources made accessible
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
