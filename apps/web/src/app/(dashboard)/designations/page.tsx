'use client';

import * as React from 'react';
import { Plus, RefreshCw, Briefcase, Loader2, Save } from 'lucide-react';
import {
  useDesignations,
  useCreateDesignation,
  useUpdateDesignation,
  useDeleteDesignation,
  useDepartments,
} from '@/hooks/use-department-designation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { DesignationCard } from '@/components/employee/designation-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import type { Designation } from '@/types/employee';

export default function DesignationsPage() {
  // Queries & Mutations
  const { data: designations, isLoading, refetch, isFetching } = useDesignations(true);
  const { data: departments } = useDepartments();

  const createMutation = useCreateDesignation();
  const updateMutation = useUpdateDesignation();
  const deleteMutation = useDeleteDesignation();

  // Dialog States
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingDesig, setEditingDesig] = React.useState<Designation | null>(null);

  // Form States
  const [name, setName] = React.useState('');
  const [departmentId, setDepartmentId] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Load editing state
  React.useEffect(() => {
    if (editingDesig) {
      setName(editingDesig.name);
      setDepartmentId(editingDesig.departmentId);
      setDescription(editingDesig.description || '');
      setStatus(editingDesig.status);
    } else {
      setName('');
      setDepartmentId('');
      setDescription('');
      setStatus('ACTIVE');
    }
  }, [editingDesig, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !departmentId) return;

    // Get Department Name
    const deptName = departments?.find((d) => d.id === departmentId)?.name || 'General';

    const payload = {
      name,
      departmentId,
      departmentName: deptName,
      description: description || null,
      status,
    };

    if (editingDesig) {
      updateMutation.mutate(
        { id: editingDesig.id, payload },
        {
          onSuccess: () => {
            setIsOpen(false);
            setEditingDesig(null);
            void refetch();
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setIsOpen(false);
          void refetch();
        },
      });
    }
  };

  const handleEdit = (desig: Designation) => {
    setEditingDesig(desig);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this designation?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  return (
    PageContainer && (
      <PageContainer>
        <PageHeader
          title="Designations"
          description="Structure corporate titles, define job positions, and assign departmental hierarchies."
          actions={
            <Button onClick={() => setIsOpen(true)} className="gap-1.5" size="sm">
              <Plus className="w-4 h-4" />
              Create Designation
            </Button>
          }
        />

        {/* Toolbar */}
        <div className="flex justify-between items-center bg-card border border-border rounded-2xl p-4">
          <span className="text-xs text-muted-foreground font-semibold">
            {designations?.length ?? 0} designations configured
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refetch();
            }}
            className="p-2"
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-xs text-muted-foreground animate-pulse">
            Loading designations registry...
          </div>
        ) : !designations || designations.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border bg-card rounded-2xl text-xs text-muted-foreground">
            No designations configured yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            {designations.map((desig) => (
              <DesignationCard
                key={desig.id}
                designation={desig}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Dialog for CRUD */}
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setEditingDesig(null);
          }}
        >
          <DialogContent className="max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>
                  {editingDesig ? 'Modify Designation' : 'Configure Designation'}
                </DialogTitle>
                <DialogDescription>
                  Define operational titles and link them to corporate departments.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 text-left">
                <Input
                  label="Designation Title *"
                  placeholder="e.g. Lead POS Cashier"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                {/* Department Selector */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Target Corporate Department *
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select Department...</option>
                    {departments?.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Summarize key responsibilities, expectations, or reporting relationships..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Designation Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setEditingDesig(null);
                  }}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="gap-1"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  <Save className="w-3.5 h-3.5" />
                  {editingDesig ? 'Update Designation' : 'Save Designation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageContainer>
    )
  );
}
