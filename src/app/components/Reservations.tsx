import React, { useEffect, useState } from 'react';
import { Layout } from './Layout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Reservation } from '../../lib/supabase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Package, Calendar, Clock, User, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Reservations: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          item:items(*),
          borrower:users!reservations_borrower_id_fkey(name, email)
        `)
        .eq('borrower_id', user.id)
        .neq('status', 'completed')
        .order('reserved_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId: string, itemId: string) => {
    try {
      const { error: resError } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);

      if (resError) throw resError;

      // Don't manually set item status - it calculates from active reservations

      toast.success('Reservation cancelled');
      fetchReservations();
    } catch (error: any) {
      console.error('Error cancelling reservation:', error);
      toast.error(error.message || 'Failed to cancel reservation');
    }
  };

  const handleComplete = async (reservationId: string, itemId: string) => {
    try {
      console.log('🎯 Starting reservation completion process for:', reservationId);
      
      // Step 1: Get reservation details and donor ID
      const { data: reservationData, error: resError } = await supabase
        .from('reservations')
        .select('*, item:items(donor_id)')
        .eq('id', reservationId)
        .single();

      if (resError) {
        console.error('❌ Failed to fetch reservation:', resError);
        throw resError;
      }
      console.log('📋 Reservation details:', reservationData);

      const donorId = reservationData?.item?.donor_id;
      console.log('👤 Donor ID:', donorId);

      if (!donorId) {
        console.error('❌ No donor ID found in reservation data!');
        throw new Error('Cannot determine donor for this item');
      }

      // Step 2: Award karma points BEFORE deleting reservation
      console.log('🎯 Awarding points to donor:', donorId);
      try {
        const { data: donorData, error: fetchError } = await supabase
          .from('users')
          .select('points')
          .eq('id', donorId)
          .single();

        if (fetchError) {
          console.error('❌ Error fetching donor points:', fetchError);
          throw fetchError;
        }

        const currentPoints = donorData?.points || 0;
        const newPoints = currentPoints + 10;
        console.log('Current donor points:', currentPoints, '→ New points:', newPoints);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ points: newPoints })
          .eq('id', donorId);

        if (updateError) {
          console.error('❌ Error updating donor points:', updateError);
          throw updateError;
        }
        console.log('✅ Points awarded successfully!');
      } catch (pointsError: any) {
        console.error('⚠️ Points update failed:', pointsError);
        // Don't stop completion if points fail
      }

      // Step 3: Update reservation status to 'completed'
      console.log('🔄 Updating reservation status to completed...');
      const { error: statusError } = await supabase
        .from('reservations')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', reservationId);

      if (statusError) {
        console.error('❌ Error updating reservation status:', statusError);
        throw statusError;
      }
      console.log('✅ Reservation status updated to completed');

      // Check if there are any other active reservations for this item
      const { data: otherReservations, error: checkError } = await supabase
        .from('reservations')
        .select('id, status')
        .eq('item_id', itemId)
        .in('status', ['pending', 'confirmed']);

      if (checkError) {
        console.error('❌ Error checking for other reservations:', checkError);
        throw checkError;
      }

      // If no other active reservations, set item back to Available
      if (!otherReservations || otherReservations.length === 0) {
        console.log('🔄 No other active reservations - setting item back to Available...');
        const { error: itemError } = await supabase
          .from('items')
          .update({ status: 'Available' })
          .eq('id', itemId);

        if (itemError) {
          console.error('❌ Error updating item status:', itemError);
          throw itemError;
        }
        console.log('✅ Item status updated to Available');
      } else {
        console.log('ℹ️ Other active reservations exist - item remains Reserved');
      }

      toast.success('Reservation completed! Donor earned 10 karma points.');
      await refreshUser();
      fetchReservations();
    } catch (error: any) {
      console.error('❌ Error completing reservation:', error);
      toast.error(error.message || 'Failed to complete reservation');
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff <= 0) return 'Expired';
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
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
          <h1 className="text-3xl font-bold">My Reservations</h1>
          <p className="text-muted-foreground mt-1">Track and manage your borrowed items</p>
        </div>

        {reservations.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reservations yet</h3>
              <p className="text-muted-foreground mb-4">
                Browse available items and make your first reservation
              </p>
              <Button onClick={() => (window.location.href = '/items')}>Browse Items</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{reservation.item?.title}</CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        reservation.status === 'confirmed'
                          ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400'
                          : reservation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : reservation.status === 'completed'
                          ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400'
                      }
                    >
                      {reservation.status}
                    </Badge>
                  </div>
                  <Badge variant="secondary">{reservation.item?.category}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {reservation.item?.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Reserved: {new Date(reservation.reserved_at).toLocaleDateString()}</span>
                    </div>
                    {reservation.status === 'pending' && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeRemaining(reservation.expires_at)}</span>
                      </div>
                    )}
                  </div>

                  {reservation.status === 'pending' &&
                    new Date(reservation.expires_at) < new Date() && (
                      <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-sm">
                        This reservation has expired
                      </div>
                    )}
                </CardContent>
                <CardFooter className="gap-2 flex-wrap">
                  {reservation.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCancel(reservation.id, reservation.item_id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => navigate(`/messages?item=${reservation.item_id}&user=${reservation.item?.donor_id}`)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat with Donor
                      </Button>
                    </>
                  )}
                  {reservation.status === 'confirmed' && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          handleComplete(
                            reservation.id,
                            reservation.item_id
                          )
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => navigate(`/messages?item=${reservation.item_id}&user=${reservation.item?.donor_id}`)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat with Donor
                      </Button>
                    </>
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
