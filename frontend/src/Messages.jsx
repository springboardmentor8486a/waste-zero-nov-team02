import PageHeader from "./components/PageHeader";

export default function Messages() {
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-[#0f172a]">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#111827] rounded-xl shadow p-6">

        <PageHeader
          title="Messages"
          subtitle="Your conversations and notifications."
        />

        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No messages yet.
          </p>
        </div>

      </div>
    </div>
  );
}
