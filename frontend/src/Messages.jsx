import PageHeader from "./components/PageHeader";

export default function Messages() {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">

        <PageHeader
          title="Messages"
          subtitle="Your conversations and notifications."
        />

        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-500">
            No messages yet.
          </p>
        </div>

      </div>
    </div>
  );
}
