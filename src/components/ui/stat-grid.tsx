import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string | number;
}

interface StatGridProps {
  stats: Stat[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const columnClass = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

export function StatGrid({ stats, columns = 4, className }: StatGridProps) {
  return (
    <div className={cn("grid gap-3", columnClass[columns], className)}>
      {stats.map((stat) => (
        <Card key={stat.label} padding="sm" className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            {stat.label}
          </p>
          <p className="rl-display mt-1 truncate text-xl font-medium text-ink sm:text-2xl">
            {stat.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
