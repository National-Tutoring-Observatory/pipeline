import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { Collection } from '~/modules/collections/collections.types';

interface MergeCollectionsDialogProps {
  mergeableCollections: Collection[];
  onMergeCollectionsClicked: (sourceCollectionIds: string[]) => void;
}

export default function MergeCollectionsDialog({
  mergeableCollections,
  onMergeCollectionsClicked
}: MergeCollectionsDialogProps) {
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

  const isSubmitDisabled = selectedCollectionIds.length === 0;

  const toggleCollection = (collectionId: string) => {
    setSelectedCollectionIds(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const toggleAll = () => {
    if (selectedCollectionIds.length === mergeableCollections.length) {
      setSelectedCollectionIds([]);
    } else {
      setSelectedCollectionIds(mergeableCollections.map(c => c._id));
    }
  };

  const totalRuns = selectedCollectionIds.reduce((sum, id) => {
    const collection = mergeableCollections.find(c => c._id === id);
    return sum + (collection?.runs?.length || 0);
  }, 0);

  if (mergeableCollections.length === 0) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Merge Collections</DialogTitle>
          <DialogDescription>
            No compatible collections found. Collections must have the same sessions and annotation type to be merged.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Merge Collections</DialogTitle>
        <DialogDescription>
          Select collections to import runs from. Source collections will remain unchanged.
        </DialogDescription>
      </DialogHeader>
      <div className="border rounded-md max-h-80 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedCollectionIds.length === mergeableCollections.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Runs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mergeableCollections.map((collection) => (
              <TableRow
                key={collection._id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => toggleCollection(collection._id)}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedCollectionIds.includes(collection._id)}
                    onCheckedChange={() => toggleCollection(collection._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell className="font-medium">{collection.name}</TableCell>
                <TableCell className="text-right">{collection.runs?.length || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedCollectionIds.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedCollectionIds.length} collection{selectedCollectionIds.length !== 1 ? 's' : ''} selected ({totalRuns} run{totalRuns !== 1 ? 's' : ''} to import)
        </div>
      )}
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={isSubmitDisabled}
            onClick={() => onMergeCollectionsClicked(selectedCollectionIds)}
          >
            Merge {selectedCollectionIds.length > 0 ? `(${selectedCollectionIds.length})` : ''}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
