import React, { useEffect, useState, useRef } from 'react';
import { Layout } from './Layout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Message, User, Item } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { MessageSquare, Send, User as UserIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

type Conversation = {
  user: User;
  lastMessage: Message | null;
  unreadCount: number;
};

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize selected user from URL params (when contacting donor)
  useEffect(() => {
    const itemId = searchParams.get('item');
    const userId = searchParams.get('user');
    
    // Prioritize userId - if both are present, use userId for the chat partner
    // and fetch item separately for context display
    if (userId) {
      fetchUserById(userId);
      if (itemId) {
        fetchItemForContext(itemId);
      }
    } else if (itemId) {
      fetchItemAndDonor(itemId);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchConversations();
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        handleNewMessage
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser, selectedItem]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchItemAndDonor = async (itemId: string) => {
    try {
      // Fetch the item with donor details
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*, donor:users(*)')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;

      setSelectedItem(itemData as Item);
      if (itemData?.donor) {
        setSelectedUser(itemData.donor as User);
      }
    } catch (error) {
      console.error('Error fetching item and donor:', error);
    }
  };

  const fetchDonorForItem = async (itemId: string) => {
    try {
      // First get the item with donor_id
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('donor_id')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;

      // Then fetch the donor user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', itemData.donor_id)
        .single();

      if (userError) throw userError;
      if (userData) {
        setSelectedUser(userData as User);
      }
    } catch (error) {
      console.error('Error fetching donor:', error);
    }
  };

  const fetchUserById = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchItemForContext = async (itemId: string) => {
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;
      setSelectedItem(itemData as Item);
    } catch (error) {
      console.error('Error fetching item:', error);
    }
  };

  const handleNewMessage = (payload: any) => {
    const newMsg = payload.new as Message;
    if (
      (newMsg.sender_id === user?.id || newMsg.receiver_id === user?.id) &&
      (newMsg.sender_id === selectedUser?.id || newMsg.receiver_id === selectedUser?.id)
    ) {
      // If we have a selected item, only add message if it's for that item
      if (selectedItem && newMsg.item_id !== selectedItem.id) {
        return;
      }
      setMessages((prev) => [...prev, newMsg]);
    }
    fetchConversations();
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*, sender:users!messages_sender_id_fkey(*), receiver:users!messages_receiver_id_fkey(*)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const conversationMap = new Map<string, Conversation>();

      messagesData?.forEach((msg) => {
        const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
        if (!otherUser) return;

        if (!conversationMap.has(otherUser.id)) {
          conversationMap.set(otherUser.id, {
            user: otherUser,
            lastMessage: msg,
            unreadCount: 0,
          });
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('messages')
        .select('*, sender:users!messages_sender_id_fkey(*), receiver:users!messages_receiver_id_fkey(*)')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        );

      // If we have a selected item, filter by item_id
      if (selectedItem) {
        query = query.eq('item_id', selectedItem.id);
      }

      const { data, error } = await query.order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUser || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from('messages').insert([
        {
          sender_id: user.id,
          receiver_id: selectedUser.id,
          item_id: selectedItem?.id || null,
          message_text: newMessage,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.from('messages').delete().eq('id', messageId);

      if (error) throw error;

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast.error(error.message || 'Failed to delete message');
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
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-1">Communicate with other students</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 h-[600px]">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {conversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <button
                      key={conv.user.id}
                      onClick={() => setSelectedUser(conv.user)}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-accent transition-colors ${
                        selectedUser?.id === conv.user.id ? 'bg-accent' : ''
                      }`}
                    >
                      <Avatar>
                        <AvatarFallback className="bg-primary text-white">
                          {conv.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="font-medium truncate">{conv.user.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage?.message_text || 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 flex flex-col">
            <CardHeader>
              <div className="space-y-3">
                <CardTitle className="flex items-center gap-3">
                  {selectedUser ? (
                    <>
                      <Avatar>
                        <AvatarFallback className="bg-primary text-white">
                          {selectedUser.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3>{selectedUser.name}</h3>
                        <p className="text-sm font-normal text-muted-foreground">{selectedUser.email}</p>
                      </div>
                    </>
                  ) : (
                    'Select a conversation'
                  )}
                </CardTitle>
                {selectedItem && (
                  <div className="bg-accent p-3 rounded-lg border">
                    <p className="text-sm font-semibold text-muted-foreground">About this item</p>
                    <p className="text-lg font-bold mt-1">{selectedItem.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{selectedItem.description}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">{selectedItem.category}</span>
                      <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded">{selectedItem.condition}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {!selectedUser ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select a conversation to start messaging</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex group ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="relative max-w-[70%] flex items-end gap-2">
                          <div
                            className={`rounded-lg p-3 ${
                              msg.sender_id === user?.id
                                ? 'bg-primary text-white'
                                : 'bg-accent text-accent-foreground'
                            }`}
                          >
                            <p className="text-sm">{msg.message_text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.sender_id === user?.id ? 'text-white/70' : 'text-muted-foreground'
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          {msg.sender_id === user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity dark:hover:bg-destructive/20"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive dark:text-red-400" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this message? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex gap-3">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
