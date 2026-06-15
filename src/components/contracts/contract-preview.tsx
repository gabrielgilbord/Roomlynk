import { Card } from "@/components/ui/card";

interface ContractPreviewProps {
  renderedHtml: string;
  isLocked?: boolean;
}

export function ContractPreview({ renderedHtml, isLocked = false }: ContractPreviewProps) {
  return (
    <Card className="relative min-w-0 overflow-hidden" padding="md">
      {isLocked && (
        <span className="absolute right-3 top-3 rounded-sm border border-forest/30 bg-forest-light px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-forest sm:right-4 sm:top-4 sm:text-[11px]">
          Inmutable
        </span>
      )}
      <div
        className="prose-contract max-h-[60vh] overflow-y-auto overflow-x-hidden break-words sm:max-h-96"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </Card>
  );
}
