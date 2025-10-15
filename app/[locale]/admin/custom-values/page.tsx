'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, GitMerge, Loader2, TrendingUp, AlertCircle } from 'lucide-react';

interface CustomValueSuggestion {
  id: string;
  attribute_key: string;
  custom_value: string;
  canonical_value: string;
  times_used: number;
  status: 'pending_review' | 'approved' | 'rejected' | 'merged';
  merged_into?: string;
  created_at: string;
  last_used_at: string;
}

export default function CustomValuesPage() {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<CustomValueSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CustomValueSuggestion | null>(null);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [promoteValue, setPromoteValue] = useState('');
  const [mergeTargetValue, setMergeTargetValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load custom value suggestions
  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/custom-suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load custom value suggestions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromote = (suggestion: CustomValueSuggestion) => {
    setSelectedSuggestion(suggestion);
    setPromoteValue(suggestion.canonical_value);
    setPromoteDialogOpen(true);
  };

  const handleMerge = (suggestion: CustomValueSuggestion) => {
    setSelectedSuggestion(suggestion);
    setMergeTargetValue('');
    setMergeDialogOpen(true);
  };

  const confirmPromote = async () => {
    if (!selectedSuggestion || !promoteValue.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/custom-suggestions/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestionId: selectedSuggestion.id,
          newOptionValue: promoteValue.trim(),
          newOptionLabel: promoteValue.trim().charAt(0).toUpperCase() + promoteValue.trim().slice(1),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to promote');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: `Promoted "${promoteValue}" to official value`,
      });

      setPromoteDialogOpen(false);
      loadSuggestions();
    } catch (error) {
      console.error('Promote error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to promote value',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmMerge = async () => {
    if (!selectedSuggestion || !mergeTargetValue.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/custom-suggestions/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestionId: selectedSuggestion.id,
          mergeIntoValue: mergeTargetValue.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to merge');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: `Merged "${selectedSuggestion.custom_value}" into "${mergeTargetValue}"`,
      });

      setMergeDialogOpen(false);
      loadSuggestions();
    } catch (error) {
      console.error('Merge error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to merge value',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (suggestion: CustomValueSuggestion) => {
    if (!confirm(`Reject "${suggestion.custom_value}"? This marks it as spam/invalid.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/custom-suggestions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId: suggestion.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject');
      }

      toast({
        title: 'Success',
        description: `Rejected "${suggestion.custom_value}"`,
      });

      loadSuggestions();
    } catch (error) {
      console.error('Reject error:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject value',
        variant: 'destructive',
      });
    }
  };

  // Group by attribute key
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.attribute_key]) {
      acc[suggestion.attribute_key] = [];
    }
    acc[suggestion.attribute_key].push(suggestion);
    return acc;
  }, {} as Record<string, CustomValueSuggestion[]>);

  // Only show pending_review
  const pendingSuggestions = suggestions.filter(s => s.status === 'pending_review');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Value Review</h1>
          <p className="text-muted-foreground mt-1">
            Review and promote user-submitted custom attribute values
          </p>
        </div>
        <Button onClick={loadSuggestions} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold">Pending Review</h3>
          </div>
          <p className="text-3xl font-bold mt-2">{pendingSuggestions.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Total Submissions</h3>
          </div>
          <p className="text-3xl font-bold mt-2">
            {suggestions.reduce((sum, s) => sum + s.times_used, 0)}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Unique Attributes</h3>
          </div>
          <p className="text-3xl font-bold mt-2">{Object.keys(groupedSuggestions).length}</p>
        </div>
      </div>

      {/* Table */}
      {pendingSuggestions.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm">No pending custom values to review</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attribute</TableHead>
                <TableHead>Custom Value</TableHead>
                <TableHead className="text-center">Times Used</TableHead>
                <TableHead>First Used</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingSuggestions
                .sort((a, b) => b.times_used - a.times_used)
                .map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell>
                      <Badge variant="outline">{suggestion.attribute_key}</Badge>
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      {suggestion.custom_value}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={suggestion.times_used >= 10 ? 'default' : 'secondary'}
                        className={suggestion.times_used >= 10 ? 'bg-green-600' : ''}
                      >
                        {suggestion.times_used}x
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(suggestion.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(suggestion.last_used_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handlePromote(suggestion)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Promote
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMerge(suggestion)}
                      >
                        <GitMerge className="h-4 w-4 mr-1" />
                        Merge
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(suggestion)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Promote Dialog */}
      <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote Custom Value</DialogTitle>
            <DialogDescription>
              Add this custom value as an official option in the attribute schema.
              All existing experiences will be updated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Attribute Key</Label>
              <Input value={selectedSuggestion?.attribute_key || ''} disabled />
            </div>
            <div>
              <Label>New Official Value</Label>
              <Input
                value={promoteValue}
                onChange={(e) => setPromoteValue(e.target.value)}
                placeholder="e.g., cross, boomerang"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use lowercase English canonical form
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              <p className="font-medium text-blue-900">This will:</p>
              <ul className="list-disc list-inside text-blue-700 mt-1 space-y-1">
                <li>Add "{promoteValue}" to attribute_schema.allowed_values</li>
                <li>Update {selectedSuggestion?.times_used} experiences</li>
                <li>Make it available in dropdowns for all future users</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoteDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={confirmPromote} disabled={isProcessing || !promoteValue.trim()}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Promote Value
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Custom Value</DialogTitle>
            <DialogDescription>
              Merge this custom value with an existing official value.
              All experiences will be updated to use the target value.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Custom Value</Label>
              <Input value={selectedSuggestion?.custom_value || ''} disabled />
            </div>
            <div>
              <Label>Merge Into (Existing Official Value)</Label>
              <Input
                value={mergeTargetValue}
                onChange={(e) => setMergeTargetValue(e.target.value)}
                placeholder="e.g., cross, triangle"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be an existing value in the schema
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm">
              <p className="font-medium text-orange-900">This will:</p>
              <ul className="list-disc list-inside text-orange-700 mt-1 space-y-1">
                <li>Update {selectedSuggestion?.times_used} experiences</li>
                <li>Change "{selectedSuggestion?.custom_value}" → "{mergeTargetValue}"</li>
                <li>Mark suggestion as merged</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={confirmMerge} disabled={isProcessing || !mergeTargetValue.trim()}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Merge Values
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
