'use client';

import * as React from 'react';
import { Plus, RefreshCw, Network, Loader2, Save } from 'lucide-react';
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '@/hooks/use-department-designation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { DepartmentCard } from '@/components/employee/department-card';
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
import type { Department } from '@/types/employee';

export default function DepartmentsPage() {
  // Queries & Mutations
  const { data: departments, isLoading, refetch, isFetching } = useDepartments(true);
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  // Dialog States
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingDept, setEditingDept] = React.useState<Department | null>(null);

  // Form States
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [headName, setHeadName] = React.useState('');
  const [status, setStatus] = React.useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Load editing state
  React.useEffect(() => {
    if (editingDept) {
      setName(editingDept.name);
      setDescription(editingDept.description || '');
      setHeadName(editingDept.headName || '');
      setStatus(editingDept.status);
    } else {
      setName('');
      setDescription('');
      setHeadName('');
      setStatus('ACTIVE');
    }
  }, [editingDept, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const payload = {
      name,
      description: description || null,
      headName: headName || null,
      status,
    };

    if (editingDept) {
      updateMutation.mutate(
        { id: editingDept.id, payload },
        {
          onSuccess: () => {
            setIsOpen(false);
            setEditingDept(null);
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

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      void refetch();
    } catch {}
  };

  return (
    <PageContainer>
      <PageHeader
        title="Departments"
        description="Configure corporate staff divisions, designate department heads, and structure teams."
        actions={
          <Button onClick={() => setIsOpen(true)} className="gap-1.5" size="sm">
            <Plus className="w-4 h-4" />
            Create Department
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-cardard border border-border rounded-2xl p-4">
        <span className="text-xs text-muted-foreground font-semibold">
          {departments?.length ?? 0} departments configured
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
          Loading departments registry...
        </div>
      ) : !departments || departments.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border bg-cardard rounded-2xl text-xs text-muted-foreground">
          No departments configured yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
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
          if (!open) setEditingDept(null);
        }}
      >
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {editingDept ? 'Modify Department' : 'Configure Department'}
              </DialogTitle>
              <DialogDescription>
                Define operational group tags for corporate organization mapping.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 text-left">
              <Input
                label="Department Name *"
                placeholder="e.g. Sales & Retail Marketing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Department Manager / Head Name"
                placeholder="e.g. Robert Baratheon"
                value={headName}
                onChange={(e) => setHeadName(e.target.value)}
              />

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize department tasks, key responsibilities, or division boundaries..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Operational Status
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
                  setEditingDept(null);
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
                {editingDept ? 'Update Department' : 'Save Department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
