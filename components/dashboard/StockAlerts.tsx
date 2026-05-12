interface StockAlert {
  level: "Stok habis" | "Stok hampir habis" | "Stok sedikit";
  itemName: string;
  size: string;
  remaining: number;
  threshold: number;
}

const levelConfig = {
  "Stok habis": {
    label: "Stok habis",
    dotClass: "bg-error",
    textClass: "text-error",
    bgClass: "bg-error-container/30",
  },
  "Stok hampir habis": {
    label: "Stok hampir habis",
    dotClass: "bg-error",
    textClass: "text-on-error-container",
    bgClass: "bg-error-container/20",
  },
  "Stok sedikit": {
    label: "Stok sedikit",
    dotClass: "bg-tertiary",
    textClass: "text-on-tertiary-container",
    bgClass: "bg-tertiary-fixed/20",
  },
};

export default function StockAlerts({ alerts }: { alerts: StockAlert[] }) {
  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline text-xl font-bold text-on-surface">Stock Alerts</h3>
        <span className="bg-error-container text-on-error-container text-xs font-bold px-2 py-1 rounded-full">
          {alerts.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {alerts.length === 0 ? (
          <div className="py-6 text-center text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-[32px] mb-2 block text-tertiary">check_circle</span>
            All stock levels are healthy
          </div>
        ) : (
          alerts.slice(0, 5).map((alert, idx) => {
            const config = levelConfig[alert.level];
            return (
              <div
                key={`${alert.itemName}-${alert.size}-${idx}`}
                className={`flex items-center justify-between p-3 rounded-lg ${config.bgClass} transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${config.dotClass}`}></span>
                  <div>
                    <span className="text-sm font-medium text-on-surface">{alert.itemName}</span>
                    <span className="text-xs text-on-surface-variant ml-2">Size {alert.size}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${config.textClass}`}>{alert.remaining}</span>
                  <span className="text-xs text-on-surface-variant ml-1">/ {alert.threshold}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
