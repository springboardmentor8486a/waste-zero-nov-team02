import PageHeader from "./components/PageHeader";

export default function Settings() {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">

        <PageHeader
          title="Settings"
          subtitle="Manage your preferences and app behavior."
        />

        <div className="space-y-4">
          <SettingItem title="Theme" desc="Light-only theme (dark mode disabled)" />
          <SettingItem title="Notifications" desc="Manage alerts" />
        </div>

      </div>
    </div>
  );
}

function SettingItem({ title, desc }) {
  return (
    <div className="border border-gray-200 rounded-lg p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
