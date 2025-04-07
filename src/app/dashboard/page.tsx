export default function DashboardPage({
  params,
}: {
  params: { userId: string };
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h1>
    </div>
  );
}
