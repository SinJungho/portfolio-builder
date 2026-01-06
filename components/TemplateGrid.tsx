import { TemplateCard } from "./TemplateCard";

export function TemplateGrid() {
  const templates = [
    {
      id: 1,
      name: "Developer Portfolio",
      description: "Clean layout focused on projects and GitHub activity",
      tags: ["Minimalist", "Dark Mode", "Projects"],
    },
    {
      id: 2,
      name: "Creative Designer",
      description: "Visual-first design showcasing creative work",
      tags: ["Bold", "Visual", "Gallery"],
    },
    {
      id: 3,
      name: "Full-Stack Engineer",
      description: "Technical portfolio with detailed project breakdowns",
      tags: ["Technical", "Detailed", "Code"],
    },
    {
      id: 4,
      name: "Minimal Resume",
      description: "Simple one-page portfolio with essential information",
      tags: ["Minimalist", "One-page", "Clean"],
    },
    {
      id: 5,
      name: "Data Scientist",
      description: "Analytics-focused with charts and visualizations",
      tags: ["Analytics", "Charts", "Data"],
    },
    {
      id: 6,
      name: "Product Manager",
      description: "Product case studies and project management focus",
      tags: ["Projects", "Case Study", "UX"],
    },
    {
      id: 7,
      name: "Open Source Contributor",
      description: "Highlights contributions and community involvement",
      tags: ["GitHub", "Community", "Stats"],
    },
    {
      id: 8,
      name: "Startup Founder",
      description: "Entrepreneurial portfolio with company highlights",
      tags: ["Business", "Startup", "Projects"],
    },
    {
      id: 9,
      name: "Freelance Developer",
      description: "Client work showcase with testimonials",
      tags: ["Freelance", "Testimonials", "Work"],
    },
  ];

  return (
    <section className="py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
}
