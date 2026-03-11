import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  paid: "status-paid",
  unpaid: "status-unpaid",
  overdue: "status-overdue",
  draft: "status-draft",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`capitalize ${statusStyles[status] || ""}`}>
      {status}
    </Badge>
  );
}
