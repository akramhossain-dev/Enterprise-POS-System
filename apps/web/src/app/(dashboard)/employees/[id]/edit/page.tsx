'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronLeft,
  Save,
  Loader2,
  User,
  Building,
  Phone,
  Mail,
  Award,
  DollarSign,
} from 'lucide-react';
import { useEmployee, useUpdateEmployee } from '@/hooks/use-employee';
import { useDepartments, useDesignations } from '@/hooks/use-department-designation';
import { useBranches } from '@/hooks/use-branch';
import { useAdminUsers } from '@/hooks/use-admin-user';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const employeeFormSchema = z.object({
  firstName: z.string().min(1, 'First Name is required').max(100),
  lastName: z.string().min(1, 'Last Name is required').max(100),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').max(255).optional().or(z.literal('')),
  hireDate: z.string().optional().or(z.literal('')),
  branchId: z.string().min(1, 'Branch Location is required'),
  userId: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED']).optional(),

  // Extended Metadata Fields
  photoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
  nationalId: z.string().optional().or(z.literal('')),
  departmentId: z.string().optional().or(z.literal('')),
  designationId: z.string().optional().or(z.literal('')),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).optional(),
  salary: z.coerce.number().positive().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export default function EditEmployeePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Queries
  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(id);
  const { data: branches } = useBranches();
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const { data: usersResponse } = useAdminUsers({ limit: 100 });
  const users = usersResponse?.data || [];

  const updateMutation = useUpdateEmployee();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
  });

  // Reset form once employee loads
  React.useEffect(() => {
    if (employee) {
      reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone || '',
        email: employee.email || '',
        hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
        branchId: employee.branchId,
        userId: employee.userId || '',
        status: employee.status,
        photoUrl: employee.metadata?.photoUrl || '',
        gender: employee.metadata?.gender || 'MALE',
        dateOfBirth: employee.metadata?.dateOfBirth || '',
        nationalId: employee.metadata?.nationalId || '',
        departmentId: employee.metadata?.departmentId || '',
        designationId: employee.metadata?.designationId || '',
        employmentType: employee.metadata?.employmentType || 'FULL_TIME',
        salary: employee.metadata?.salary || '',
        address: employee.metadata?.address || '',
        emergencyContactName: employee.metadata?.emergencyContactName || '',
        emergencyContactPhone: employee.metadata?.emergencyContactPhone || '',
        notes: employee.metadata?.notes || '',
      });
    }
  }, [employee, reset]);

  const onSubmit = async (values: EmployeeFormValues) => {
    const payload = {
      branchId: values.branchId,
      userId: values.userId || null,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone || null,
      email: values.email || null,
      hireDate: values.hireDate || null,
      status: values.status,
      metadata: {
        photoUrl: values.photoUrl || null,
        gender: values.gender || null,
        dateOfBirth: values.dateOfBirth || null,
        nationalId: values.nationalId || null,
        departmentId: values.departmentId || null,
        designationId: values.designationId || null,
        employmentType: values.employmentType || null,
        salary: values.salary ? Number(values.salary) : null,
        address: values.address || null,
        emergencyContactName: values.emergencyContactName || null,
        emergencyContactPhone: values.emergencyContactPhone || null,
        notes: values.notes || null,
      },
    };

    updateMutation.mutate({ id, payload });
  };

  if (isLoadingEmployee) {
    return (
      <PageContainer>
        <div className="flex h-40 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading employee profile record...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Edit Staff Member"
        description={`Modify corporate profile details for ${employee?.firstName} ${employee?.lastName}.`}
        actions={
          <Link href={`/employees/${id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ChevronLeft className="w-4 h-4" />
              Cancel
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
        {/* Core Personal Details Card */}
        <div className="rounded-2xl border border-border bg-cardard p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-base">Personal Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              placeholder="e.g. John"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last Name *"
              placeholder="e.g. Doe"
              error={errors.lastName?.message}
              {...register('lastName')}
            />

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Gender</label>
              <select
                {...register('gender')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <Input
              label="Date of Birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />

            <Input
              label="Phone Number"
              placeholder="e.g. +1 555-0199"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. john.doe@enterprise.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="National ID / SSN"
              placeholder="e.g. NID-882910"
              error={errors.nationalId?.message}
              {...register('nationalId')}
            />

            <Input
              label="Profile Photo URL"
              placeholder="e.g. https://images.unsplash.com/photo-..."
              error={errors.photoUrl?.message}
              {...register('photoUrl')}
            />
          </div>
        </div>

        {/* Corporate Placement Details */}
        <div className="rounded-2xl border border-border bg-cardard p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <Building className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-base">Employment Placement</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Selector */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Employment Status
              </label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>

            {/* Branch Selection */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Branch Location *
              </label>
              <select
                {...register('branchId')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Corporate Branch...</option>
                {branches?.data?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.branchId && (
                <p className="text-xs text-destructive mt-1">{errors.branchId.message}</p>
              )}
            </div>

            {/* Department Selection */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Department</label>
              <select
                {...register('departmentId')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">No Department Assign</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation Selection */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Designation Position
              </label>
              <select
                {...register('designationId')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">No Designation Assign</option>
                {designations?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Employment Type Selection */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Employment Type
              </label>
              <select
                {...register('employmentType')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Internship</option>
              </select>
            </div>

            <Input
              label="Joining Date"
              type="date"
              error={errors.hireDate?.message}
              {...register('hireDate')}
            />

            {/* User Account Link */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                System User Account Link
              </label>
              <select
                {...register('userId')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">No Bound User Account</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Monthly Salary (Optional)"
              type="number"
              placeholder="e.g. 5200"
              leftElement={<DollarSign className="w-4 h-4 text-muted-foreground" />}
              error={errors.salary?.message}
              {...register('salary')}
            />
          </div>
        </div>

        {/* Address and Emergency Contacts */}
        <div className="rounded-2xl border border-border bg-cardard p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3">
            <Phone className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-base">Address & Emergency Contact</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Residential Address
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 42 Main St, Apartment 3B, New York, NY"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                {...register('address')}
              />
            </div>

            <Input
              label="Emergency Contact Name"
              placeholder="e.g. Jane Doe (Wife)"
              error={errors.emergencyContactName?.message}
              {...register('emergencyContactName')}
            />

            <Input
              label="Emergency Contact Phone"
              placeholder="e.g. +1 555-0922"
              error={errors.emergencyContactPhone?.message}
              {...register('emergencyContactPhone')}
            />

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Onboarding Notes
              </label>
              <textarea
                rows={3}
                placeholder="Add special onboarding instructions, certifications, or custom remarks..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                {...register('notes')}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href={`/employees/${id}`}>
            <Button variant="outline" type="button">
              Discard
            </Button>
          </Link>
          <Button type="submit" disabled={updateMutation.isPending} className="gap-1.5">
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Profile Changes
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
