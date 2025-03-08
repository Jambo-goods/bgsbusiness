
import QuickActions from "./QuickActions";

export default function QuickActionsSection() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4">
        Actions rapides
      </h2>
      <QuickActions />
    </div>
  );
}
