'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChangePasswordForm } from '@/components/profile/change-password-form';

export default function ChangePasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure. Your new password must be at least 8
          characters and contain uppercase, lowercase, and numbers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChangePasswordForm />
      </CardContent>
    </Card>
  );
}
