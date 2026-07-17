'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { KeyRound, ListChecks } from 'lucide-react';
import { toast } from 'sonner';

interface SerialSelectorProps {
  serials: string[];
  requiredCount: number;
  onChangeSerials: (serials: string[]) => void;
  disabled?: boolean;
}

export function SerialSelector({
  serials,
  requiredCount,
  onChangeSerials,
  disabled = false,
}: SerialSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputText, setInputText] = React.useState('');

  React.useEffect(() => {
    setInputText(serials.join('\n'));
  }, [serials, isOpen]);

  const handleSave = () => {
    const list = inputText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (list.length !== requiredCount) {
      toast.warning(
        `Quantity mismatch: Entered ${list.length} serials, but received quantity is ${requiredCount}.`,
      );
    }

    onChangeSerials(list);
    setIsOpen(false);
  };

  return (
    <div className="relative text-xs">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className="h-8 gap-1.5 text-[11px] font-semibold border-indigo-500/20 text-primary hover:bg-primary/5"
      >
        <KeyRound className="w-3.5 h-3.5" />
        Configure Serials ({serials.length}/{requiredCount})
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cardard border border-border rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-primary" /> Assign Product Serial Numbers
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-muted-foreground">Required Serials:</span>
                <span className="font-mono text-primary">{requiredCount} units</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase font-bold block">
                  Serial List (One serial code per line)
                </label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="SN-9812A&#10;SN-9812B&#10;SN-9812C..."
                  rows={6}
                  className="font-mono text-xs bg-muted/10 border-border placeholder:text-muted-foreground/45"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={handleSave}>
                  Save Serial Codes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
