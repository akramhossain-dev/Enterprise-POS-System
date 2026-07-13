'use client';

import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, Zap } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import Link from 'next/link';

function getGreeting(): { text: string; icon: typeof Sun } {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', icon: Sun };
  if (h < 17) return { text: 'Good afternoon', icon: Sunset };
  return { text: 'Good evening', icon: Moon };
}

const QUICK_STAT = [
  { label: "Today's Sales", value: '$4,280', delta: '+12.4%', positive: true },
  { label: 'Orders', value: '38', delta: '+5', positive: true },
  { label: 'Pending', value: '7', delta: '—', positive: null },
];

export function WelcomeCard() {
  const { user } = useAuthStore();
  const { text: greeting, icon: GreetingIcon } = getGreeting();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-violet-500/5 p-6"
    >
      {/* Aurora blobs */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-violet-500/10 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GreetingIcon className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{greeting}!</p>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {user ? `${user.firstName} ${user.lastName}` : 'Welcome back'}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">{today}</p>
        </div>

        {/* Quick stats strip */}
        <div className="flex gap-4 sm:gap-6 flex-wrap">
          {QUICK_STAT.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold text-foreground tabular-nums">{stat.value}</p>
              <p
                className={
                  stat.positive === true
                    ? 'text-[10px] text-emerald-500'
                    : stat.positive === false
                      ? 'text-[10px] text-red-500'
                      : 'text-[10px] text-muted-foreground'
                }
              >
                {stat.delta}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/pos"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors self-start sm:self-auto flex-shrink-0"
        >
          <Zap className="w-3.5 h-3.5" />
          Open POS
        </Link>
      </div>
    </motion.div>
  );
}
