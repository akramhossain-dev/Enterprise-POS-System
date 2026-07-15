'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Monitor,
  Wifi,
  WifiOff,
  Settings,
  Keyboard,
  LogOut,
  Clock,
  LayoutDashboard,
  HelpCircle,
  Maximize,
  Minimize,
  User,
  FolderHeart,
  FileText,
  DollarSign,
  Printer,
  Coins,
  RefreshCw,
  History,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { usePOSStore } from '@/stores/pos.store';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { carts, activeCartId, heldOrders, setActiveCartId, clearCart } = usePOSStore();
  const activeCart = carts.find((c) => c.id === activeCartId);

  // States
  const [time, setTime] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState<boolean>(false);

  // Sync clock and online status
  useEffect(() => {
    setTime(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    );
    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    }, 1000);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('System is back online. Syncing POS ledger.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('System offline. Using local storage simulation.');
    };

    if (typeof window !== 'undefined') {
      setIsOnline(window.navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      clearInterval(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const handleExitPOS = () => {
    if (activeCart && activeCart.items.length > 0) {
      const confirm = window.confirm(
        'You have items in the cart. Are you sure you want to exit the POS?',
      );
      if (!confirm) return;
    }
    router.push('/dashboard');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.error('Fullscreen mode not supported by this browser.');
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070b13] text-slate-100 font-sans selection:bg-primary selection:text-white">
      {/* POS Topbar Bar Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#0c1220]/90 backdrop-blur-md shadow-lg z-30 select-none">
        {/* Left Actions & Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 mr-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-black tracking-widest text-emerald-400">EPOS TERMINAL</h1>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitPOS}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-xs gap-1.5 h-8 px-2.5"
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </Button>

          {/* Quick Info bar */}
          <div className="hidden lg:flex items-center space-x-3 text-xs border-l border-slate-800 pl-4 text-slate-400">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-slate-300">Terminal:</span>
              <span>T-01 (Main)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-slate-300">Warehouse:</span>
              <span>Central distribution</span>
            </div>
          </div>
        </div>

        {/* Center Clock and status */}
        <div className="flex items-center space-x-4 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-1">
          <div className="flex items-center space-x-1.5 text-xs">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-mono text-emerald-400 tracking-wider font-semibold">{time}</span>
          </div>

          <div className="h-3 w-[1px] bg-slate-800" />

          {/* Connectivity Status */}
          <div className="flex items-center space-x-1.5 text-xs">
            {isOnline ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-medium">ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-rose-500 animate-bounce" />
                <span className="text-rose-500 font-medium">OFFLINE</span>
              </>
            )}
          </div>
        </div>

        {/* Right Session Details */}
        <div className="flex items-center space-x-2">
          {/* Shortcuts indicator */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShortcutHelp(true)}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8 rounded-full"
            title="Keyboard Shortcuts Guide"
          >
            <Keyboard className="h-4.5 w-4.5" />
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8 rounded-full"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="h-4.5 w-4.5" />
            ) : (
              <Maximize className="h-4.5 w-4.5" />
            )}
          </Button>

          {/* Held Orders link */}
          <Link href="/pos/held-orders">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'relative text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8 rounded-full',
                pathname === '/pos/held-orders' && 'bg-slate-800 text-emerald-400',
              )}
              title={`Held Orders Queue (${heldOrders.length})`}
            >
              <FolderHeart className="h-4.5 w-4.5" />
              {heldOrders.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-slate-950 font-black font-mono text-[9px] h-4 w-4 rounded-full flex items-center justify-center border border-[#0c1220] scale-90">
                  {heldOrders.length}
                </span>
              )}
            </Button>
          </Link>

          {/* Recent Orders link */}
          {/* Orders History link */}
          <Link href="/pos/orders">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8 rounded-full',
                pathname === '/pos/orders' && 'bg-slate-800 text-emerald-400',
              )}
              title="Order History Archive"
            >
              <History className="h-4.5 w-4.5" />
            </Button>
          </Link>

          {/* Sales Returns Directory link */}
          <Link href="/pos/returns">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8 rounded-full',
                pathname === '/pos/returns' && 'bg-slate-800 text-emerald-400',
              )}
              title="Sales Return Claims"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </Button>
          </Link>

          {/* Refund Settlements link */}
          <Link href="/pos/refunds">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8 rounded-full',
                pathname === '/pos/refunds' && 'bg-slate-800 text-emerald-400',
              )}
              title="Refund Settlements Log"
            >
              <Coins className="h-4.5 w-4.5" />
            </Button>
          </Link>

          {/* Payment History link */}
          <Link href="/pos/payments">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8 rounded-full',
                pathname === '/pos/payments' && 'bg-slate-800 text-emerald-400',
              )}
              title="Payments Ledger Log"
            >
              <DollarSign className="h-4.5 w-4.5" />
            </Button>
          </Link>

          {/* Receipt Reprint Registry link */}
          <Link href="/pos/receipts">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8 rounded-full',
                pathname === '/pos/receipts' && 'bg-slate-800 text-emerald-400',
              )}
              title="Receipt Reprint Registry"
            >
              <Printer className="h-4.5 w-4.5" />
            </Button>
          </Link>

          {/* Cash Drawer Shift link */}
          <Link href="/pos/cash-drawer">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8 rounded-full',
                pathname === '/pos/cash-drawer' && 'bg-slate-800 text-emerald-400',
              )}
              title="Cash Drawer Shifts"
            >
              <Coins className="h-4.5 w-4.5" />
            </Button>
          </Link>

          {/* Settings link */}
          <Link href="/pos/settings">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-slate-400 hover:text-slate-100 hover:bg-slate-800 h-8 w-8 rounded-full',
                pathname === '/pos/settings' && 'bg-slate-800 text-emerald-400',
              )}
              title="POS Configurations"
            >
              <Settings className="h-4.5 w-4.5" />
            </Button>
          </Link>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Cashier Info block */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1 text-xs select-none">
            <User className="h-3.5 w-3.5 text-emerald-400" />
            <div className="flex flex-col text-left">
              <span className="font-semibold text-slate-200">
                {user?.fullName || 'Cashier Admin'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Operator</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitPOS}
            className="text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 h-8 w-8 rounded-full"
            title="Sign out of Terminal"
          >
            <LogOut className="h-4.5 w-4.5" />
          </Button>
        </div>
      </header>

      {/* Main content frame */}
      <main className="flex-1 flex overflow-hidden min-h-0 bg-[#080d19]">{children}</main>

      {/* Keyboard Shortcuts Cheat Sheet Dialog */}
      <Dialog open={showShortcutHelp} onOpenChange={setShowShortcutHelp}>
        <DialogContent className="sm:max-w-[425px] bg-[#0c1220] border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-100">
              <Keyboard className="h-5 w-5 text-emerald-400" />
              <span>Cashier Hotkeys / Shortcuts</span>
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-xs sm:text-sm">
            <p className="text-slate-400 text-xs">
              Use these global hotkeys to accelerate order management and checkouts without relying
              on mouse input.
            </p>
            <div className="grid grid-cols-2 gap-y-2.5 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-emerald-400">
                  F1
                </kbd>
                <span className="text-slate-300">Focus Search</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-emerald-400">
                  F2
                </kbd>
                <span className="text-slate-300">Customer Link</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-emerald-400">
                  F3
                </kbd>
                <span className="text-slate-300">Hold Active Cart</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-emerald-400">
                  F4
                </kbd>
                <span className="text-slate-300">Create New Cart</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-emerald-400">
                  F5
                </kbd>
                <span className="text-slate-300">Open Discount Drawer</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-emerald-400">
                  F6
                </kbd>
                <span className="text-slate-300">Initiate Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-emerald-400">
                  Esc
                </kbd>
                <span className="text-slate-300">Close Overlay / Cancel</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-emerald-400">
                  Ctrl + Enter
                </kbd>
                <span className="text-slate-300">Complete Checkout</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 text-center border-t border-slate-800 pt-3">
              Press <kbd className="px-1 py-0.5 bg-slate-800 rounded">Esc</kbd> at any time to
              return to workspace.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
