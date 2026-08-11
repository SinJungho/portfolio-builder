import { ReactNode } from "react";

export default function GenerateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-0 pb-20 md:p-6">
      {children}
    </div>
  );
}
