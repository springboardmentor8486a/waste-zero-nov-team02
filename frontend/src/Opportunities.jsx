import PageHeader from "./components/PageHeader";

export default function Opportunities() {
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-[#0f172a]">
      <div className="max-w-6xl mx-auto bg-white dark:bg-[#111827] rounded-xl shadow p-6">

        <PageHeader
          title="Opportunities"
          subtitle="Available volunteering opportunities."
        />

        <div className="space-y-4">
          <OpportunityCard />
          <OpportunityCard />
        </div>

      </div>
    </div>
  );
}

function OpportunityCard() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
      <h3 className="font-semibold">Community Cleanup</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Location: Not specified
      </p>
    </div>
  );
}
