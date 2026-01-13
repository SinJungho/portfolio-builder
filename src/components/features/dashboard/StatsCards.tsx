export function StatsCards() {
  const stats = [
    { label: "Total Views", value: "12,543" },
    { label: "Total Clicks", value: "1,829" },
    { label: "Active Portfolios", value: "5" },
  ];

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="text-3xl text-gray-900 mb-1">{stat.value}</div>
          <div className="text-sm text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
