import React, { useEffect, useState } from 'react';
import { Layout } from './Layout';
import { supabase, Item } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Search, Package, Filter, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const categories = ['Textbooks', 'Notes', 'Calculators', 'Lab Equipment', 'Art Supplies', 'Electronics', 'Other'];

export const ItemListing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<(Item & { displayStatus?: string })[]>([]);
  const [filteredItems, setFilteredItems] = useState<(Item & { displayStatus?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*, donor:users!items_donor_id_fkey(name, email), reservations(id, status)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add computed reservation status based on active reservations
      const itemsWithStatus = (data || []).map(item => {
        const hasActiveReservation = item.reservations?.some((r: any) => r.status === 'pending' || r.status === 'confirmed');
        return {
          ...item,
          displayStatus: hasActiveReservation ? 'Reserved' : item.status
        };
      });
      
      setItems(itemsWithStatus);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  };

  const handleReserve = async (itemId: string) => {
    if (!user) {
      console.error('❌ No user logged in');
      return;
    }

    try {
      console.log('🎯 Starting reservation for item:', itemId);
      console.log('👤 Current user ID:', user.id);
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      console.log('📝 Creating reservation with data:', {
        item_id: itemId,
        borrower_id: user.id,
        status: 'pending',
        reserved_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      const { data, error } = await supabase.from('reservations').insert([
        {
          item_id: itemId,
          borrower_id: user.id,
          status: 'pending',
          reserved_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        },
      ]).select();

      console.log('Response - Data:', data, 'Error:', error);

      if (error) {
        console.error('❌ INSERT Error:', error);
        throw error;
      }

      console.log('✅ Reservation created:', data);

      // Don't change item status - it should stay Available
      // The reservation table tracks who reserved it, not the item status

      toast.success('Item reserved successfully! Expires in 24 hours.');
      fetchItems();
    } catch (error: any) {
      console.error('❌ Error reserving item:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
      toast.error(error.message || 'Failed to reserve item');
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Browse Items</h1>
          <p className="text-muted-foreground mt-1">Discover academic resources shared by fellow students</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Package className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {item.category}
                      </Badge>
                    </div>
                    <Badge
                      variant={
                        item.displayStatus === 'Reserved'
                          ? 'outline'
                          : item.status === 'Available'
                          ? 'default'
                          : item.status === 'Pending'
                          ? 'secondary'
                          : 'outline'
                      }
                      className={
                        item.displayStatus === 'Reserved'
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
                          : item.status === 'Available'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                          : item.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : ''
                      }
                    >
                      {item.displayStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.image_url && (
                    <div className="w-full h-48 bg-accent rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>Condition: {item.condition}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Shared by: {item.donor?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Posted: {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  {item.status === 'Pending' ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Pending Approval
                    </Button>
                  ) : item.status === 'Available' && user?.role !== 'donor' && item.donor_id !== user?.id ? (
                    <Button className="w-full" onClick={() => handleReserve(item.id)}>
                      {item.displayStatus === 'Reserved' ? 'Add to Waitlist' : 'Reserve Item'}
                    </Button>
                  ) : item.status === 'Available' && item.donor_id === user?.id ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Your Item
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => navigate(`/messages?item=${item.id}&user=${item.donor_id}`)}
                    >
                      Contact Donor
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
