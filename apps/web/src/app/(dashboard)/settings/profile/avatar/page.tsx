'use client';

import { useAuthStore } from '@/stores/auth.store';
import { AvatarUpload } from '@/components/profile/avatar-upload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AvatarPage() {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Photo</CardTitle>
        <CardDescription>
          Upload a photo to personalize your account. Recommended size: 400×400px or larger.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AvatarUpload user={user} />
      </CardContent>
    </Card>
  );
}
