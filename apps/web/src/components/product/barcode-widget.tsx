'use client';

import { useState } from 'react';
import { Printer, RefreshCw, Barcode as BarcodeIcon, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productService } from '@/services/product.service';

interface BarcodeWidgetProps {
  barcode?: string;
  name?: string;
  price?: number;
  onGenerate?: () => void;
}

export function BarcodeWidget({
  barcode,
  name = 'Product Name',
  price,
  onGenerate,
}: BarcodeWidgetProps) {
  const [printing, setPrinting] = useState(false);

  const handlePrint = () => {
    if (!barcode) return;
    setPrinting(true);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setPrinting(false);
      return;
    }

    const svgHtml = productService.generateBarcodeSvg(barcode);

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode - ${barcode}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: monospace;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .label {
              border: 1px dashed #ccc;
              padding: 15px;
              border-radius: 8px;
              width: 250px;
            }
            .title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 5px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .price {
              font-size: 16px;
              font-weight: bold;
              margin-top: 5px;
              color: #111;
            }
            .barcode {
              width: 100%;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="title">${name}</div>
            <div class="barcode">${svgHtml}</div>
            ${price !== undefined ? `<div class="price">$${price.toFixed(2)}</div>` : ''}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    setPrinting(false);
  };

  if (!barcode) {
    return (
      <div className="border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/30">
        <BarcodeIcon className="w-8 h-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">No barcode generated</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generate or enter a barcode to preview and print.
          </p>
        </div>
        {onGenerate && (
          <Button size="sm" onClick={onGenerate} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Generate Barcode
          </Button>
        )}
      </div>
    );
  }

  const svgContent = productService.generateBarcodeSvg(barcode);

  return (
    <div className="border border-border rounded-xl p-5 bg-cardard space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Barcode Preview
        </span>
        <Button
          size="xs"
          variant="outline"
          leftIcon={<Printer className="w-3 h-3" />}
          onClick={handlePrint}
          loading={printing}
        >
          Print Label
        </Button>
      </div>

      {/* Barcode Render */}
      <div className="p-3 bg-white rounded-lg flex items-center justify-center border border-border/60">
        <div className="w-full max-w-[280px]" dangerouslySetInnerHTML={{ __html: svgContent }} />
      </div>

      {/* Info footer */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Format: CODE-128</span>
        <span className="font-mono">{barcode}</span>
      </div>
    </div>
  );
}
