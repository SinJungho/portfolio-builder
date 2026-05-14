"use client";

import { FolderGit2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-spotify-near-black p-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Projects</h1>
            <p className="text-spotify-silver font-medium">Manage and curate your featured projects.</p>
          </div>
          <Button className="btn-pill-primary h-12 px-8">
            <Plus className="mr-2 h-5 w-5" />
            Add Project
          </Button>
        </div>

        {/* Empty State / Placeholder */}
        <div className="flex flex-col items-center justify-center py-24 bg-spotify-dark-surface rounded-[40px] border border-white/5 border-dashed">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-spotify-silver mb-6">
            <FolderGit2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No projects selected yet</h3>
          <p className="text-spotify-silver font-medium text-center max-w-sm mb-8">
            Select projects from your GitHub repositories to showcase them in your portfolio.
          </p>
          <Button variant="outline" className="btn-pill-secondary h-11 px-8">
            Import from GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
