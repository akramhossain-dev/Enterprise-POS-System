'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useProfile } from '@/hooks/use-profile';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SkeletonCard } from '@/components/ui/skeleton';

export default function EditProfilePage() {
  const router = useRouter();
  const { user: storeUser } = useAuthStore();
  const { data: user, isLoading } = useProfile();

  const profile = user ?? storeUser;

  if (isLoading && !profile) return <SkeletonCard />;
  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <EditProfileForm user={profile} onSuccess={() => router.push('/settings/profile')} />
      </CardContent>
    </Card>
  );
}
