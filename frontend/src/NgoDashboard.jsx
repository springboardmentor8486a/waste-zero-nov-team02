import React from "react";

export default function NgoDashboard() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-black font-display min-h-screen transition-colors">
      <div className="flex h-screen overflow-hidden">
        {/* Main Content only */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black">Welcome back, Green Earth</h1>
                <p className="text-[#61896f] dark:text-gray-400">
                  Here is your impact overview for today.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="size-10 rounded-full bg-white dark:bg-surface-dark border flex items-center justify-center">
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                <div
                  className="size-10 rounded-full bg-cover bg-center border"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB7YtrmB_oPesLhgyVlmBMY_PqOMFzrwMHSvdzF_cmku87F9LeckXEOIj1hqFnxhpzcAKKmYaXlfrwl7Vk--o7ZburtoJQGV0Q8SUjrd36n1ge4y70Xh_iTzcg0CyiiT6XI-O3UjZI69Ggy6Uep15WiOlhWTao2-icKtYH9YlFMYZ5PR534sWNfDPkQ5D9vYS2mqDstG8zC626AaIen9le4hmhqUh93JRb81Jv1CMAt1wHa2Wc9G9xp1vEk0z0itvFRXg-e1OT2l0gB')",
                  }}
                />
              </div>
            </header>

            {/* Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {["Active Opportunities", "Total Volunteers", "Waste Collected (kg)", "Upcoming Events"].map(
                (title, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-xl bg-surface-light dark:bg-surface-dark border shadow-sm"
                  >
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-3xl font-bold mt-2">{[12, "1,245", "5,420", 3][i]}</p>
                  </div>
                )
              )}
            </section>

            {/* Table */}
            <section className="bg-surface-light dark:bg-surface-dark rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="font-bold text-lg">Recent Opportunities</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-background-dark text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Opportunity</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    "Coastal Clean-up Drive",
                    "City Park Recycling",
                    "School E-Waste Drive",
                  ].map((name) => (
                    <tr key={name} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-6 py-4 font-bold">{name}</td>
                      <td className="px-6 py-4">Location</td>
                      <td className="px-6 py-4">Oct 2023</td>
                      <td className="px-6 py-4">Open</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
