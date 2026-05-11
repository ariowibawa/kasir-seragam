interface Activity {
  id: number;
  date: Date;
  studentName: string;
  className: string;
  uniforms: string;
  totalAmount: number;
  invoiceNumber: string;
  status: string;
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return `Today, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  if (diffHours < 24) return `Today, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function ActivityTable({ activities }: { activities: Activity[] }) {
  const statusClass = (status: string) =>
    status === "Completed"
      ? "bg-tertiary-fixed text-on-tertiary-fixed"
      : "bg-secondary-container text-on-secondary-container";

  return (
    <section className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 ambient-shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline text-xl font-bold text-on-surface">Recent Activity</h3>
        <button className="text-primary font-label text-sm font-medium hover:underline">View All</button>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-surface-variant">
              <th className="pb-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Date</th>
              <th className="pb-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Name</th>
              <th className="pb-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Class</th>
              <th className="pb-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Uniform</th>
              <th className="pb-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="font-body text-sm">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                  No recent activity
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-surface-container-highest transition-colors group cursor-pointer">
                  <td className="py-4 text-secondary">{formatRelativeDate(activity.date)}</td>
                  <td className="py-4 font-medium text-on-surface">{activity.studentName}</td>
                  <td className="py-4 text-secondary">{activity.className}</td>
                  <td className="py-4 text-on-surface">{activity.uniforms}</td>
                  <td className="py-4">
                    <span className={`${statusClass(activity.status)} px-3 py-1 rounded-full text-xs font-medium`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
