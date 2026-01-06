export function SocialProof() {
  const companies = [
    { name: "Vercel", width: "w-24" },
    { name: "GitHub", width: "w-28" },
    { name: "Linear", width: "w-24" },
    { name: "Stripe", width: "w-24" },
    { name: "Supabase", width: "w-32" },
  ];

  return (
    <section className="border-y border-gray-200 bg-gray-50">
      <div className="max-w-300 mx-auto px-6 py-12">
        <div className="flex flex-col items-center gap-8">
          <p className="text-gray-500 text-sm uppercase tracking-wider">
            Trusted by developers from
          </p>

          <div className="flex items-center gap-12 flex-wrap justify-center">
            {companies.map((company) => (
              <div
                key={company.name}
                className={`${company.width} h-8 bg-linear-to-br from-gray-300 to-gray-400 rounded opacity-60 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center`}
              >
                <span className="text-white text-xs opacity-50">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
