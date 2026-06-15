import { Card } from "@/components/ui/card";

interface ContractPreviewProps {
  renderedHtml: string;
  isLocked?: boolean;
}

export function ContractPreview({ renderedHtml, isLocked = false }: ContractPreviewProps) {
  return (
    <Card className="relative" padding="md">
      {isLocked && (
        <span className="absolute right-4 top-4 rounded-sm border border-forest/30 bg-forest-light px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-forest">
          Inmutable
        </span>
      )}
      <div
        className="prose-contract max-h-96 overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </Card>
  );
}
