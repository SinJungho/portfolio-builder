import { ReactNode } from "react";

export default function GenerateLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-0 md:p-6 pb-20">
      {children}
    </main>
  );
}
