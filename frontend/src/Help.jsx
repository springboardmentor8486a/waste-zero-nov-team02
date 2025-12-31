import PageHeader from "./components/PageHeader";

export default function Help() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white/85 backdrop-blur-md rounded-xl shadow p-6 border border-white/40">

        <PageHeader
          title="Help & Support"
          subtitle="Get assistance and support."
        />

        <div className="space-y-3 text-sm">
          <p>• How to schedule a pickup</p>
          <p>• Account and profile help</p>
          <p>• Contact support</p>
        </div>

      </div>
    </div>
  );
}
