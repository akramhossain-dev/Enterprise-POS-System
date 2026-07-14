'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employee.service';
import type { Employee, EmployeeFilterParams, EmployeeMetadata } from '@/types/employee';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const EMPLOYEES_KEY = ['employees'] as const;

export function useEmployees(params?: EmployeeFilterParams) {
  return useQuery({
    queryKey: [...EMPLOYEES_KEY, params],
    queryFn: () => employeeService.listEmployees(params),
    staleTime: 10_000,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: [...EMPLOYEES_KEY, id],
    queryFn: () => employeeService.getEmployee(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (
      payload: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> & { metadata?: EmployeeMetadata },
    ) => employeeService.createEmployee(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      toast.success('Employee created successfully');
      router.push(`/employees/${data.id}`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>> & {
        metadata?: Partial<EmployeeMetadata>;
      };
    }) => employeeService.updateEmployee(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      void queryClient.invalidateQueries({ queryKey: [...EMPLOYEES_KEY, data.id] });
      toast.success('Employee updated successfully');
      router.push(`/employees/${data.id}`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      toast.success('Employee archived successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}
