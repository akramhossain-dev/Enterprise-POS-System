'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useProfile } from '@/hooks/use-profile';
import { ProfileCard } from '@/components/profile/profile-card';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { titleCase } from '@/utils/format';
import { Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user: storeUser } = useAuthStore();
  const { data: user, isLoading } = useProfile();

  const profile = user ?? storeUser;

  if (isLoading && !profile) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">My Profile</h2>
          <p className="text-sm text-muted-foreground">Your personal information</p>
        </div>
        <Button asChild leftIcon={<Pencil className="w-4 h-4" />} variant="outline" size="sm">
          <Link href="/settings/profile/edit">Edit profile</Link>
        </Button>
      </div>

      <ProfileCard user={profile} />

      {/* Permissions overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Roles & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {profile.roles.map((role) => (
              <Badge key={role} variant="outline">
                {titleCase(role)}
              </Badge>
            ))}
          </div>
          {profile.permissions.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                {profile.permissions.length} permissions granted
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.permissions.slice(0, 12).map((perm) => (
                  <Badge key={perm} variant="secondary" className="text-xs font-mono">
                    {perm}
                  </Badge>
                ))}
                {profile.permissions.length > 12 && (
                  <Badge variant="secondary" className="text-xs">
                    +{profile.permissions.length - 12} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
