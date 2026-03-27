import React, { useEffect, useState } from 'react';
import { Layout } from './Layout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Item, User } from '../../lib/supabase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2, Edit, Package, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

type ItemWithReservations = Item & {
  reservations?: Array<{ id: string; status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; borrower: User }>;
  displayStatus?: string;
};

export const MyItems: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemWithReservations[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyItems();
  }, [user]);

  const fetchMyItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('items')
        .select('*, reservations(id, status, borrower:users!borrower_id(id, name, email))')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add computed reservation status and filter out completed/cancelled
      const filteredItems = (data || []).map(item => {
        const activeReservations = item.reservations?.filter((r: any) => r.status !== 'completed' && r.status !== 'cancelled') || [];
        const hasActiveReservation = activeReservations.length > 0;
        return {
          ...item,
          displayStatus: hasActiveReservation ? 'Reserved' : item.status,
          reservations: activeReservations
        };
      });
      
      setItems(filteredItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load your items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItemId) return;

    try {
      const { error } = await supabase.from('items').delete().eq('id', deleteItemId);

      if (error) throw error;

      toast.success('Item deleted successfully');
      setItems(items.filter((item) => item.id !== deleteItemId));
      setDeleteItemId(null);
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const handleConfirmReservation = async (reservationId: string, itemId: string) => {
    try {
      const { error: resError } = await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', reservationId);

      if (resError) throw resError;

      // Don't manually set item status - it calculates from active reservations
      // Item will show "Reserved" if there are confirmed/pending reservations

      toast.success('Reservation confirmed!');
      fetchMyItems();
    } catch (error: any) {
      console.error('Error confirming reservation:', error);
      toast.error(error.message || 'Failed to confirm reservation');
    }
  };

  const handleDeclineReservation = async (reservationId: string, itemId: string) => {
    try {
      const { error: resError } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);

      if (resError) throw resError;

      // Don't manually set item status - it calculates from active reservations
      // Item will show "Available" only if no other pending/confirmed reservations exist

      toast.success('Reservation declined');
      fetchMyItems();
    } catch (error: any) {
      console.error('Error declining reservation:', error);
      toast.error(error.message || 'Failed to decline reservation');
    }
  };

  const handleCompleteReservation = async (reservationId: string, itemId: string) => {
    try {
      // Step 1: Get reservation details and award points
      const { data: reservationData, error: resError } = await supabase
        .from('reservations')
        .select('id')
        .eq('id', reservationId)
        .single();

      if (resError) throw resError;

      // Step 2: Award karma points to the donor (yourself)
      try {
        if (user) {
          const { data: donorData, error: fetchError } = await supabase
            .from('users')
            .select('points')
            .eq('id', user.id)
            .single();

          if (fetchError) {
            console.error('❌ Error fetching donor points:', fetchError);
            throw fetchError;
          }

          const currentPoints = donorData?.points || 0;
          const newPoints = currentPoints + 10;
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ points: newPoints })
            .eq('id', user.id);

          if (updateError) {
            console.error('❌ Error updating donor points:', updateError);
            throw updateError;
          }
          console.log('✅ Points awarded to donor successfully!');
        }
      } catch (pointsError: any) {
        console.error('⚠️ Points update failed:', pointsError);
        // Don't stop completion if points fail
      }

      // Step 3: Mark reservation as completed instead of deleting (keeps history)
      const { error: statusError } = await supabase
        .from('reservations')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', reservationId);

      if (statusError) throw statusError;

      // Step 4: Check if there are any other active reservations for this item
      const { data: otherReservations, error: checkError } = await supabase
        .from('reservations')
        .select('id, status')
        .eq('item_id', itemId)
        .in('status', ['pending', 'confirmed']);

      if (checkError) throw checkError;

      // If no other active reservations, set item back to Available
      if (!otherReservations || otherReservations.length === 0) {
        const { error: itemError } = await supabase
          .from('items')
          .update({ status: 'Available' })
          .eq('id', itemId);

        if (itemError) throw itemError;
      }

      toast.success('Reservation completed! You earned 10 karma points.');
      fetchMyItems();
    } catch (error: any) {
      console.error('Error completing reservation:', error);
      toast.error(error.message || 'Failed to complete reservation');
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Items</h1>
            <p className="text-muted-foreground mt-1">Manage the items you're sharing</p>
          </div>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items yet</h3>
              <p className="text-muted-foreground mb-4">
                Start sharing your academic resources with fellow students
              </p>
              <Button onClick={() => (window.location.href = '/add-item')}>Add Your First Item</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    <Badge
                      variant="default"
                      className={
                        item.displayStatus === 'Reserved'
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
                          : item.status === 'Available'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }
                    >
                      {item.displayStatus}
                    </Badge>
                  </div>
                  <Badge variant="secondary">{item.category}</Badge>
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
                      <Calendar className="w-4 h-4" />
                      <span>Posted: {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="gap-2 flex-wrap">
                  {item.reservations && item.reservations.length > 0 ? (
                    <div className="w-full space-y-3">
                      {item.reservations.map((reservation) => (
                        <div key={reservation.id} className="w-full border-t pt-3">
                          <div className="text-sm font-medium mb-2">
                            {reservation.status === 'pending' && '⏳ Pending from: '}
                            {reservation.status === 'confirmed' && '✅ Confirmed from: '}
                            {reservation.status === 'completed' && '✔️ Completed from: '}
                            <strong>{reservation.borrower.name}</strong>
                          </div>
                          {reservation.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleConfirmReservation(reservation.id, item.id)}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleDeclineReservation(reservation.id, item.id)}
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="flex-1"
                                onClick={() => navigate(`/messages?item=${item.id}&user=${reservation.borrower.id}`)}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Chat
                              </Button>
                            </>
                          )}
                          {reservation.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleCompleteReservation(reservation.id, item.id)}
                            >
                              Mark as Completed
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/edit-item/${item.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => setDeleteItemId(item.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item and remove it from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};
