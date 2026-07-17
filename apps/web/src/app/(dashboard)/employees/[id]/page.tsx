'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  Building,
  Briefcase,
  User as UserIcon,
  Shield,
  Clock,
  FileText,
  AlertCircle,
  FileDown,
  Monitor,
  Trash2,
} from 'lucide-react';
import { useEmployee, useDeleteEmployee } from '@/hooks/use-employee';
import { useDepartments, useDesignations } from '@/hooks/use-department-designation';
import { useUserSessions, useRevokeUserSession } from '@/hooks/use-admin-user';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionCard } from '@/components/user/session-card';
import { cn } from '@/utils/cn';

export default function EmployeeDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Queries
  const { data: employee, isLoading, refetch } = useEmployee(id);
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();

  const boundUserId = employee?.userId || '';
  const { data: sessions, isLoading: isLoadingSessions } = useUserSessions(boundUserId);
  const revokeSessionMutation = useRevokeUserSession(boundUserId);
  const deleteMutation = useDeleteEmployee();

  const [activeTab, setActiveTab] = React.useState<
    'personal' | 'attendance' | 'documents' | 'security'
  >('personal');

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading employee profile folder...
        </div>
      </PageContainer>
    );
  }

  if (!employee) {
    return (
      <PageContainer>
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground" />
          <h2 className="font-semibold text-foreground text-sm mt-3">Employee Record Not Found</h2>
          <Link href="/employees" className="mt-4 inline-block">
            <Button size="sm">Back to Directory</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const initials = `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase();
  const deptName =
    departments?.find((d) => d.id === employee.metadata?.departmentId)?.name ||
    'General Administration';
  const desigName =
    designations?.find((d) => d.id === employee.metadata?.designationId)?.name || 'Staff';

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to archive this employee?')) return;
    deleteMutation.mutate(employee.id, {
      onSuccess: () => {
        router.push('/employees');
      },
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Employee File"
        description={`Manage credentials, contracts, and attendance summaries for ${employee.firstName}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/employees">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                Directory
              </Button>
            </Link>
            <Link href={`/employees/${employee.id}/edit`}>
              <Button
                size="sm"
                className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-rose-500 hover:bg-rose-500/10 border-rose-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Archive
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - card summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary text-3xl shadow-sm border border-primary/5">
              {employee.metadata?.photoUrl ? (
                <img
                  src={employee.metadata.photoUrl}
                  alt={employee.fullName}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                initials
              )}
              <span
                className={cn(
                  'absolute bottom-0 right-0 h-4.5 w-4.5 rounded-full border-3 border-card',
                  employee.status === 'ACTIVE'
                    ? 'bg-emerald-500'
                    : employee.status === 'INACTIVE'
                      ? 'bg-amber-500'
                      : 'bg-rose-500',
                )}
              />
            </div>

            <h2 className="mt-4 font-bold text-foreground text-lg leading-none">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 font-mono uppercase tracking-wider">
              ID: {employee.id.slice(0, 8).toUpperCase()}
            </p>

            <span
              className={cn(
                'mt-3.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                employee.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : employee.status === 'INACTIVE'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20',
              )}
            >
              {employee.status}
            </span>

            {/* Quick stats grid */}
            <div className="w-full mt-6 grid grid-cols-2 gap-3 pt-6 border-t border-border/60">
              <div className="bg-muted/40 p-2.5 rounded-xl text-center">
                <span className="block text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Placement
                </span>
                <span className="block mt-1 font-semibold text-foreground text-xs truncate">
                  {deptName}
                </span>
              </div>
              <div className="bg-muted/40 p-2.5 rounded-xl text-center">
                <span className="block text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Position
                </span>
                <span className="block mt-1 font-semibold text-foreground text-xs truncate">
                  {desigName}
                </span>
              </div>
            </div>

            {/* Quick Contacts details */}
            <div className="w-full mt-6 space-y-3 pt-6 border-t border-border/60 text-left text-xs text-muted-foreground">
              {employee.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
              )}
              {employee.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.hireDate && (
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                  <span>Hired: {new Date(employee.hireDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                <span className="truncate">{employee.branch?.name || 'Main Branch Office'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - detailed info tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation header */}
          <div className="flex border-b border-border bg-card rounded-2xl p-1.5 gap-1 shadow-sm">
            {(['personal', 'attendance', 'documents', 'security'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all select-none',
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="rounded-2xl border border-border bg-card p-6 min-h-[300px]">
            {activeTab === 'personal' && (
              <div className="space-y-6 text-left">
                {/* Personal Information section */}
                <div className="space-y-3.5">
                  <h3 className="font-semibold text-foreground text-sm md:text-base border-b border-border/50 pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block font-medium">Gender</span>
                      <span className="text-foreground block mt-1 font-semibold">
                        {employee.metadata?.gender || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Date of Birth</span>
                      <span className="text-foreground block mt-1 font-semibold">
                        {employee.metadata?.dateOfBirth
                          ? new Date(employee.metadata.dateOfBirth).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">
                        National ID / Passport
                      </span>
                      <span className="text-foreground block mt-1 font-semibold">
                        {employee.metadata?.nationalId || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">
                        Employment Type
                      </span>
                      <span className="text-foreground block mt-1 font-semibold">
                        {employee.metadata?.employmentType?.replace(/_/g, ' ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Residential Address details */}
                <div className="space-y-3 pt-4">
                  <h3 className="font-semibold text-foreground text-sm md:text-base border-b border-border/50 pb-2">
                    Residential Address & Notes
                  </h3>
                  <div className="text-xs space-y-3.5">
                    <div>
                      <span className="text-muted-foreground block font-medium">Full Address</span>
                      <p className="text-foreground block mt-1 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/30">
                        {employee.metadata?.address || 'No residential address configured.'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">
                        Onboarding Notes
                      </span>
                      <p className="text-foreground block mt-1 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/30 italic">
                        {employee.metadata?.notes || 'No notes added.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact details */}
                <div className="space-y-3 pt-4">
                  <h3 className="font-semibold text-foreground text-sm md:text-base border-b border-border/50 pb-2">
                    Emergency Contact Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block font-medium">Contact Name</span>
                      <span className="text-foreground block mt-1 font-semibold">
                        {employee.metadata?.emergencyContactName || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Contact Phone</span>
                      <span className="text-foreground block mt-1 font-semibold">
                        {employee.metadata?.emergencyContactPhone || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-6 text-left">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm md:text-base">
                    Attendance Summary
                  </h3>
                </div>

                {/* Summary boxes */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
                    <span className="block text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">
                      On-Time
                    </span>
                    <span className="block mt-1 font-bold text-emerald-500 text-lg">94.2%</span>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-center">
                    <span className="block text-[10px] text-amber-500 font-semibold uppercase tracking-wider">
                      Late Arrival
                    </span>
                    <span className="block mt-1 font-bold text-amber-500 text-lg">4.8%</span>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 text-center">
                    <span className="block text-[10px] text-rose-500 font-semibold uppercase tracking-wider">
                      Absent
                    </span>
                    <span className="block mt-1 font-bold text-rose-500 text-lg">1.0%</span>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 border border-border/50 text-xs space-y-2 text-muted-foreground">
                  <p>
                    <strong>System Note:</strong> Shift schedules are managed at the terminal level.
                  </p>
                  <p>
                    Current roster: <strong>Day Shift (09:00 AM - 06:00 PM)</strong>
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6 text-left">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm md:text-base">
                    Employment Documents
                  </h3>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'Offer_Letter.pdf', size: '242 KB', category: 'Offer Letter' },
                    { title: 'Employment_Contract.pdf', size: '1.2 MB', category: 'Contract' },
                    { title: 'Staff_CV_Resume.pdf', size: '350 KB', category: 'Resume' },
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/5 p-2 rounded-lg text-primary">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-foreground">
                            {doc.title}
                          </span>
                          <span className="block text-[10px] text-muted-foreground mt-0.5">
                            {doc.category} &bull; {doc.size}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="xs" className="gap-1 text-primary">
                        <FileDown className="w-3.5 h-3.5" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 text-left">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <Monitor className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm md:text-base">
                    Active Security Sessions
                  </h3>
                </div>

                {!boundUserId ? (
                  <div className="text-center py-8 text-xs text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl">
                    This employee does not have a linked user account to track security logs.
                  </div>
                ) : isLoadingSessions ? (
                  <div className="text-xs text-muted-foreground">Loading active logins...</div>
                ) : !sessions || sessions.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No active logins tracked.</div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((sess) => (
                      <SessionCard
                        key={sess.id}
                        session={sess}
                        onTerminate={(sessId) => revokeSessionMutation.mutate(sessId)}
                        isTerminating={revokeSessionMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
