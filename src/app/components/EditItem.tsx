import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Item } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Upload } from 'lucide-react';

const categories = ['Textbooks', 'Notes', 'Calculators', 'Lab Equipment', 'Art Supplies', 'Electronics', 'Other'];
const conditions = ['Like New', 'Good', 'Fair', 'Poor'];

export const EditItem: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    image: null as File | null,
  });

  useEffect(() => {
    if (itemId) {
      fetchItem();
    }
  }, [itemId, user]);

  const fetchItem = async () => {
    if (!itemId || !user) return;

    try {
      const { data, error } = await supabase.from('items').select('*').eq('id', itemId).single();

      if (error) throw error;

      if (data.donor_id !== user.id) {
        toast.error('You can only edit your own items');
        navigate('/my-items');
        return;
      }

      setItem(data);
      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
        condition: data.condition,
        image: null,
      });
    } catch (error: any) {
      console.error('Error fetching item:', error);
      toast.error(error.message || 'Failed to load item');
      navigate('/my-items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSave = async () => {
    if (!item) return;

    if (!formData.title.trim() || !formData.description.trim() || !formData.category || !formData.condition) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);

    try {
      let imageUrl = item.image_url;

      // Upload new image if selected
      if (formData.image) {
        const fileName = `${item.id}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, formData.image, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('item-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      // Update item
      const { error } = await supabase
        .from('items')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          condition: formData.condition,
          image_url: imageUrl,
        })
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Item updated successfully');
      navigate('/my-items');
    } catch (error: any) {
      console.error('Error saving item:', error);
      toast.error(error.message || 'Failed to save item');
    } finally {
      setSaving(false);
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/my-items')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Items
          </Button>
          <h1 className="text-3xl font-bold">Edit Item</h1>
          <p className="text-muted-foreground mt-1">Update the details of your shared item</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Update your item information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter item title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your item in detail"
                rows={4}
              />
            </div>

            {/* Category and Condition Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleSelectChange('condition', value)}>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {cond}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Item Image</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {item?.image_url && !formData.image && (
                  <div className="mb-4">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <p className="text-sm text-muted-foreground">Current image</p>
                  </div>
                )}
                {formData.image && (
                  <div className="mb-4">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <p className="text-sm text-muted-foreground">New image preview</p>
                  </div>
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change Image
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => navigate('/my-items')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
