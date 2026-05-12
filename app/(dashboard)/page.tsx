export const dynamic = "force-dynamic";

import StatsCard from "@/components/dashboard/StatsCard";
import ActivityTable from "@/components/dashboard/ActivityTable";
import StockAlerts from "@/components/dashboard/StockAlerts";
import { getDashboardStats, getRecentActivity } from "@/services/dashboard.service";
import { getStockAlerts } from "@/services/stock.service";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, recentActivity, stockAlerts] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(5),
    getStockAlerts(),
  ]);

  const formatAmount = (amount: number) => {
    if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `Rp ${formatCurrency(amount)}`;
    return `Rp ${amount}`;
  };

  return (
    <main className="flex-1 p-10 max-w-7xl mx-auto w-full flex flex-col gap-10 overflow-y-auto">
      {/* Welcome Header */}
      <section>
        <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Selamat Datang!</h2>
        <p className="font-body text-on-surface-variant">Berikut adalah rangkuman data seragam terbaru.</p>
      </section>

      {/* Quick Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Siswa"
          icon="groups"
          value={stats.totalStudents.toLocaleString("id-ID")}
          subtext={`Siswa terdata`}
          bgClass="bg-primary-fixed"
          textClass="text-on-primary-fixed"
        />
        <StatsCard
          title="Seragam Terbeli"
          icon="checkroom"
          value={stats.uniformsDistributed.total.toLocaleString("id-ID")}
          subtext={`Hari ini: ${stats.uniformsDistributed.today} / Total`}
          subtextHighlight={String(stats.uniformsDistributed.today)}
          bgClass="bg-secondary-container"
          textClass="text-on-secondary-container"
          highlightClass="text-primary"
        />
        <StatsCard
          title="Pendapatan Hari Ini"
          icon="payments"
          value={formatAmount(stats.incomeToday.amount)}
          subtext={`${stats.incomeToday.transactionCount} Transaksi`}
          bgClass="bg-primary-container"
          textClass="text-on-primary-container"
        />
      </section>

      {/* Lower Section: Alerts & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ActivityTable activities={recentActivity} />
        <StockAlerts alerts={stockAlerts} />
      </div>
    </main>
  );
}
