import { Suspense } from "react";
import { CommandPalette } from "@/components/command-palette";
import { DatasetProvider } from "@/components/dataset-context";
import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <Suspense>
      <DatasetProvider>
        <div className="md:flex">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">{children}</main>
        </div>
        <CommandPalette />
      </DatasetProvider>
    </Suspense>
  );
}
