import { BottomNav } from "@/components/layout/BottomNav";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNav role="instructor" />
    </div>
  );
}
