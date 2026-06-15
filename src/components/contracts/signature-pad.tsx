"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eraser } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export function SignaturePad({ onSave, onClear, disabled = false }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = useCallback(() => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
    onClear?.();
  }, [onClear]);

  const handleSave = useCallback(() => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;
    onSave(sigCanvas.current.toDataURL("image/png"));
  }, [onSave]);

  const handleEnd = useCallback(() => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) setIsEmpty(false);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-ink">Tu firma</h3>
        <p className="text-xs text-ink-muted">Dibuja con el ratón o el dedo</p>
      </div>

      <Card padding="none" className={cn(!isEmpty && "ring-2 ring-rust/20")}>
        <div className="relative bg-paper">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: cn(
                "h-44 w-full cursor-crosshair touch-none",
                disabled && "pointer-events-none opacity-50"
              ),
              "aria-label": "Lienzo de firma digital",
            }}
            penColor="#1a1614"
            minWidth={1.5}
            maxWidth={2.5}
            onEnd={handleEnd}
          />
          {isEmpty && !disabled && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-ink-muted/40">
              Firma aquí
            </p>
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleClear} disabled={isEmpty || disabled} className="flex-1">
          <Eraser className="h-4 w-4" />
          Borrar
        </Button>
        <Button onClick={handleSave} disabled={isEmpty || disabled} className="flex-1">
          Confirmar firma
        </Button>
      </div>

      <p className="text-center text-[11px] text-ink-muted">
        Al firmar, el documento queda registrado con fecha, hora e IP. No podrá modificarse.
      </p>
    </div>
  );
}
