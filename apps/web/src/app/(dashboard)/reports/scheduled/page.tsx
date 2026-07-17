'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  useScheduledReportsQuery,
  useCreateScheduledReportMutation,
  useUpdateScheduledReportStatusMutation,
} from '@/hooks/use-reports';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Clock,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const schedulerSchema = zod.object({
  reportId: zod.string().min(1, 'Target report type is required.'),
  frequency: zod.enum(['daily', 'weekly', 'monthly']),
  emails: zod.string().min(1, 'At least one recipient email address is required.'),
  timeOfDay: zod.string().min(1, 'Delivery schedule time is required.'),
});

type SchedulerFormValues = zod.infer<typeof schedulerSchema>;

export default function ScheduledReportsPage() {
  const { data: schedules = [], isLoading } = useScheduledReportsQuery();
  const createMutation = useCreateScheduledReportMutation();
  const updateStatusMutation = useUpdateScheduledReportStatusMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchedulerFormValues>({
    resolver: zodResolver(schedulerSchema),
    defaultValues: {
      reportId: 'rep-sales-summary',
      frequency: 'daily',
      emails: '',
      timeOfDay: '09:00',
    },
  });

  const onSubmit = (values: SchedulerFormValues) => {
    const reportNames: Record<string, string> = {
      'rep-sales-summary': 'Sales Summary Report',
      'rep-current-stock': 'Current Stock Report',
      'rep-vat-report': 'VAT/GST Tax Summary',
    };

    createMutation.mutate(
      {
        reportId: values.reportId,
        reportName: reportNames[values.reportId] || 'Custom Report',
        frequency: values.frequency,
        emailList: values.emails.split(',').map((e) => e.trim()),
        timeOfDay: values.timeOfDay,
        status: 'active',
      },
      {
        onSuccess: () => {
          toast.success('Scheduled email delivery job created successfully.');
          reset();
        },
        onError: () => {
          toast.error('Failed to configure scheduled report scheduler.');
        },
      },
    );
  };

  const handleToggleStatus = (id: string, currentStatus: 'active' | 'paused') => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    updateStatusMutation.mutate(
      { id, status: nextStatus },
      {
        onSuccess: () => {
          toast.success(
            `Job scheduling ${nextStatus === 'active' ? 'resumed' : 'paused'} successfully.`,
          );
        },
      },
    );
  };

  return (
    <PageContainer className="text-foreground select-none text-left print:bg-white print:text-black">
      <div className="mb-4 print:hidden">
        <Link href="/reports">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Reports Center</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Scheduled Reports Centre"
        description="Configure cron triggers to email operational reports to stakeholders on recurring loops."
      />

      <div className="grid gap-6 lg:grid-cols-3 mt-6 print:hidden">
        {/* Left Side: Cron setup form */}
        <div className="lg:col-span-1">
          <Card className="bg-cardard border-border p-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-emerald-450" />
                <span>Add Scheduled Job</span>
              </h3>

              {/* Target Report */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                  Target Report Template
                </label>
                <select
                  {...register('reportId')}
                  className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none"
                >
                  <option value="rep-sales-summary">Sales Summary Report</option>
                  <option value="rep-current-stock">Current Stock Report</option>
                  <option value="rep-vat-report">VAT/GST Tax Summary</option>
                </select>
                {errors.reportId && (
                  <span className="text-[9px] text-rose-500">{errors.reportId.message}</span>
                )}
              </div>

              {/* Recurrence frequency */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                  Execution Recurrence
                </label>
                <select
                  {...register('frequency')}
                  className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none"
                >
                  <option value="daily">Daily Loop</option>
                  <option value="weekly">Weekly Loop</option>
                  <option value="monthly">Monthly Loop</option>
                </select>
                {errors.frequency && (
                  <span className="text-[9px] text-rose-500">{errors.frequency.message}</span>
                )}
              </div>

              {/* Recipient email lists */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                  Recipient Emails (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="exec@company.com, finance@company.com"
                  {...register('emails')}
                  className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none focus:border-emerald-500"
                />
                {errors.emails && (
                  <span className="text-[9px] text-rose-500">{errors.emails.message}</span>
                )}
              </div>

              {/* Execution time */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                  Execution Time
                </label>
                <input
                  type="time"
                  {...register('timeOfDay')}
                  className="w-full h-8 px-2 bg-muted border border-slate-855 rounded text-xs text-foreground focus:outline-none focus:border-emerald-500"
                />
                {errors.timeOfDay && (
                  <span className="text-[9px] text-rose-500">{errors.timeOfDay.message}</span>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase text-xs"
              >
                {isSubmitting ? 'Scheduling Job...' : 'Configure Schedule'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Side: active schedulers list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span>Active Scheduled Triggers</span>
          </h3>

          <Card className="bg-cardard border-border p-4 font-mono">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px] pb-2">
                    <th className="py-2">Report Name</th>
                    <th className="py-2">Frequency</th>
                    <th className="py-2">Time</th>
                    <th className="py-2">Recipients</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-muted-foreground">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        Loading scheduled triggers...
                      </td>
                    </tr>
                  ) : schedules.length > 0 ? (
                    schedules.map((sch) => (
                      <tr key={sch.id} className="hover:bg-muted/20">
                        <td className="py-3 font-sans font-bold text-foreground">
                          {sch.reportName}
                        </td>
                        <td className="py-3 capitalize text-muted-foreground">{sch.frequency}</td>
                        <td className="py-3">{sch.timeOfDay}</td>
                        <td className="py-3 truncate max-w-[150px]">{sch.emailList.join(', ')}</td>
                        <td className="py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStatus(sch.id, sch.status)}
                            className={`h-6 text-[10px] uppercase font-bold px-2 rounded border ${
                              sch.status === 'active'
                                ? 'text-rose-500 border-rose-950/30 hover:bg-rose-500/10'
                                : 'text-emerald-400 border-emerald-950/30 hover:bg-emerald-500/10'
                            }`}
                          >
                            {sch.status === 'active' ? 'Pause' : 'Resume'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No active scheduling triggers configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
