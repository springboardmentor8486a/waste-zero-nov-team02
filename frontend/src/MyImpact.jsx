import PageHeader from "./components/PageHeader";

export default function MyImpact() {
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-[#0f172a]">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#111827] rounded-xl shadow p-6">

        <PageHeader
          title="My Impact"
          subtitle="Track your contributions and activities."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <ImpactCard
            title="Pickups Completed"
            value="0"
          />

          <ImpactCard
            title="Hours Volunteered"
            value="0"
          />

          <ImpactCard
            title="Communities Helped"
            value="0"
          />

        </div>

        <div className="mt-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Your impact data will appear here once you start participating.
          </p>
        </div>

      </div>
    </div>
  );
}

function ImpactCard({ title, value }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 text-center">
      <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        {title}
      </h3>
      <p className="text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}
