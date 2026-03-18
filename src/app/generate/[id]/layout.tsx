import { ReactNode } from "react";
import { GenerateHeader } from "./Header";

export default function GenerateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <GenerateHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        {children}
      </main>
    </div>
  );
}
