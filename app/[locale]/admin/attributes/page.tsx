'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface AttributeSchema {
  key: string;
  display_name: string;
  display_name_de: string | null;
  display_name_fr: string | null;
  display_name_es: string | null;
  category_slug: string | null;
  data_type: string;
  allowed_values: string | null;
  description: string | null;
  is_searchable: boolean;
  is_filterable: boolean;
  sort_order: number;
}

export default function AdminAttributesPage() {
  const router = useRouter();
  const [attributes, setAttributes] = useState<AttributeSchema[]>([]);
  const [filteredAttributes, setFilteredAttributes] = useState<AttributeSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<AttributeSchema | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    display_name: '',
    display_name_de: '',
    display_name_fr: '',
    display_name_es: '',
    category_slug: '',
    data_type: 'enum',
    allowed_values: [] as string[],
    description: '',
    is_searchable: true,
    is_filterable: true,
    sort_order: 999,
  });

  const [newAllowedValue, setNewAllowedValue] = useState('');

  useEffect(() => {
    fetchAttributes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attributes, categoryFilter, typeFilter]);

  const fetchAttributes = async () => {
    try {
      const response = await fetch('/api/admin/attributes');
      if (!response.ok) throw new Error('Failed to fetch attributes');
      const data = await response.json();
      setAttributes(data.attributes || []);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      toast.error('Failed to load attributes');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attributes];

    if (categoryFilter !== 'all') {
      if (categoryFilter === 'generic') {
        filtered = filtered.filter(attr => !attr.category_slug);
      } else {
        filtered = filtered.filter(attr => attr.category_slug === categoryFilter);
      }
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(attr => attr.data_type === typeFilter);
    }

    setFilteredAttributes(filtered);
  };

  const handleCreateNew = () => {
    setEditingAttribute(null);
    setFormData({
      key: '',
      display_name: '',
      display_name_de: '',
      display_name_fr: '',
      display_name_es: '',
      category_slug: '',
      data_type: 'enum',
      allowed_values: [],
      description: '',
      is_searchable: true,
      is_filterable: true,
      sort_order: 999,
    });
    setShowDialog(true);
  };

  const handleEdit = (attribute: AttributeSchema) => {
    setEditingAttribute(attribute);
    setFormData({
      key: attribute.key,
      display_name: attribute.display_name,
      display_name_de: attribute.display_name_de || '',
      display_name_fr: attribute.display_name_fr || '',
      display_name_es: attribute.display_name_es || '',
      category_slug: attribute.category_slug || '',
      data_type: attribute.data_type,
      allowed_values: attribute.allowed_values ? JSON.parse(attribute.allowed_values) : [],
      description: attribute.description || '',
      is_searchable: attribute.is_searchable,
      is_filterable: attribute.is_filterable,
      sort_order: attribute.sort_order,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const url = editingAttribute
        ? `/api/admin/attributes/${editingAttribute.key}`
        : '/api/admin/attributes';

      const method = editingAttribute ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category_slug: formData.category_slug || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save attribute');
      }

      toast.success(editingAttribute ? 'Attribute updated' : 'Attribute created');
      setShowDialog(false);
      fetchAttributes();
    } catch (error: any) {
      console.error('Error saving attribute:', error);
      toast.error(error.message || 'Failed to save attribute');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete attribute "${key}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/attributes/${key}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete attribute');
      }

      toast.success('Attribute deleted');
      fetchAttributes();
    } catch (error: any) {
      console.error('Error deleting attribute:', error);
      toast.error(error.message || 'Failed to delete attribute');
    }
  };

  const addAllowedValue = () => {
    if (newAllowedValue.trim()) {
      setFormData({
        ...formData,
        allowed_values: [...formData.allowed_values, newAllowedValue.trim()],
      });
      setNewAllowedValue('');
    }
  };

  const removeAllowedValue = (index: number) => {
    setFormData({
      ...formData,
      allowed_values: formData.allowed_values.filter((_, i) => i !== index),
    });
  };

  // Get unique categories
  const categories = ['all', 'generic', ...Array.from(new Set(attributes.map(a => a.category_slug).filter(Boolean)))];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Attribute Schema</h1>
          <p className="text-text-secondary mt-1">
            Manage structured attributes for experience categorization
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          New Attribute
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="w-64">
          <Label>Category Filter</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat === 'generic' ? '(Generic)' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Label>Type Filter</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="enum">Enum</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Attributes Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Values</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAttributes.map((attr) => (
              <tr key={attr.key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 text-sm font-mono">{attr.key}</td>
                <td className="px-4 py-3 text-sm">{attr.display_name}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                    {attr.data_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{attr.category_slug || '(generic)'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {attr.allowed_values ? JSON.parse(attr.allowed_values).length + ' values' : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(attr)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attr.key)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAttributes.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No attributes found
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredAttributes.length} of {attributes.length} attributes
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAttribute ? 'Edit Attribute' : 'Create New Attribute'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Key */}
            <div>
              <Label>Key (technical) *</Label>
              <Input
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="my_attribute"
                disabled={!!editingAttribute}
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lowercase with underscores only
              </p>
            </div>

            {/* Display Names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Display Name (EN) *</Label>
                <Input
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Display Name (DE)</Label>
                <Input
                  value={formData.display_name_de}
                  onChange={(e) => setFormData({ ...formData, display_name_de: e.target.value })}
                />
              </div>
              <div>
                <Label>Display Name (FR)</Label>
                <Input
                  value={formData.display_name_fr}
                  onChange={(e) => setFormData({ ...formData, display_name_fr: e.target.value })}
                />
              </div>
              <div>
                <Label>Display Name (ES)</Label>
                <Input
                  value={formData.display_name_es}
                  onChange={(e) => setFormData({ ...formData, display_name_es: e.target.value })}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <Input
                value={formData.category_slug}
                onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                placeholder="ufo-uap (optional: leave blank for all categories)"
              />
            </div>

            {/* Data Type */}
            <div>
              <Label>Data Type *</Label>
              <Select
                value={formData.data_type}
                onValueChange={(value) => setFormData({ ...formData, data_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enum">Enum (predefined values)</SelectItem>
                  <SelectItem value="text">Text (free text)</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Allowed Values (for enum) */}
            {formData.data_type === 'enum' && (
              <div>
                <Label>Allowed Values *</Label>
                <div className="space-y-2">
                  {formData.allowed_values.map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={value} disabled className="flex-1 font-mono" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAllowedValue(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newAllowedValue}
                      onChange={(e) => setNewAllowedValue(e.target.value)}
                      placeholder="Add value..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllowedValue())}
                    />
                    <Button onClick={addAllowedValue}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
              />
            </div>

            {/* Options */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_searchable}
                  onChange={(e) => setFormData({ ...formData, is_searchable: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Searchable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_filterable}
                  onChange={(e) => setFormData({ ...formData, is_filterable: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Filterable</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingAttribute ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
