'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { updateProfileSchema, type UpdateProfileInput } from '@/utils/validators';
import { useUpdateProfile } from '@/hooks/use-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/types/auth';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
];

interface EditProfileFormProps {
  user: User;
  onSuccess?: () => void;
}

export function EditProfileForm({ user, onSuccess }: EditProfileFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput, unknown, UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema) as never,
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? '',
      bio: user.bio ?? '',
      timezone: user.timezone ?? 'UTC',
    },
    mode: 'onBlur',
  });

  const onSubmit = (data: UpdateProfileInput) => {
    updateProfile(data, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          id="firstName"
          label="First name"
          placeholder="John"
          required
          error={errors.firstName?.message}
        />
        <Input
          {...register('lastName')}
          id="lastName"
          label="Last name"
          placeholder="Doe"
          required
          error={errors.lastName?.message}
        />
      </div>

      <Input
        id="email"
        type="email"
        label="Email address"
        value={user.email}
        disabled
        hint="Email cannot be changed. Contact your administrator."
      />

      <Input
        {...register('phone')}
        id="phone"
        type="tel"
        label="Phone number"
        placeholder="+1 (555) 000-0000"
        error={errors.phone?.message}
      />

      <Textarea
        {...register('bio')}
        id="bio"
        label="Bio"
        placeholder="Tell us a little about yourself…"
        rows={3}
        error={errors.bio?.message}
        hint={`${(register('bio') as unknown as Record<string, unknown>)?.value?.toString?.()?.length ?? 0}/500`}
      />

      <div className="space-y-1.5">
        <label htmlFor="timezone" className="block text-sm font-medium text-foreground">
          Timezone
        </label>
        <select
          {...register('timezone')}
          id="timezone"
          className="w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={isPending}
          disabled={!isDirty}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}
