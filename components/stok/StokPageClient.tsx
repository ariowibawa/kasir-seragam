"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SizeEntry {
  size: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  alert: string | null;
}

interface UniformItem {
  id: number;
  name: string;
  category: string;
  type: string;
  icon: string | null;
  imageUrl: string | null;
  minStockThreshold: number;
  sizes: SizeEntry[];
}

interface StockAlert {
  level: string;
  itemName: string;
  size: string;
  remaining: number;
  threshold: number;
}

interface Props {
  uniformItems: UniformItem[];
  stockAlerts: StockAlert[];
}

export default function StokPageClient({ uniformItems, stockAlerts }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(uniformItems);
  const [hargaBeli, setHargaBeli] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleHargaBeliChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") { setHargaBeli(""); return; }
    setHargaBeli(new Intl.NumberFormat("id-ID").format(Number(rawValue)));
  };

  const handleHargaJualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") { setHargaJual(""); return; }
    setHargaJual(new Intl.NumberFormat("id-ID").format(Number(rawValue)));
  };

  const parseFormattedNumber = (val: string) => Number(val.replace(/\./g, ""));

  const handleSubmitInbound = async () => {
    const itemObj = items.find((i) => i.name === selectedItem);
    if (!itemObj || !selectedSize || !quantity || !hargaBeli || !hargaJual) {
      alert("Lengkapi semua field.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/stock/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uniformItemId: itemObj.id,
          size: selectedSize,
          quantity: parseInt(quantity),
          unitCost: parseFormattedNumber(hargaBeli),
          unitPrice: parseFormattedNumber(hargaJual),
          note: note || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }

      // Refresh data
      const refreshRes = await fetch("/api/uniforms");
      const refreshedItems = await refreshRes.json();
      setItems(refreshedItems);

      // Reset form
      setSelectedItem("");
      setSelectedSize("");
      setQuantity("");
      setHargaBeli("");
      setHargaJual("");
      setNote("");
      alert("Stock recorded successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to record inbound");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 p-10 flex gap-8 relative items-start overflow-y-auto h-full">
      {/* Left Side: Data Grid */}
      <div className="flex-1 flex flex-col gap-8 pb-10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Inventory Ledger</h2>
            <p className="font-body text-sm text-on-surface-variant mt-2">Real-time stock levels across all uniform categories.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-surface-container-high text-on-surface px-4 py-2.5 rounded-md font-label text-sm font-medium hover:bg-surface-container-highest transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
            </button>
            <button className="bg-surface-container-high text-on-surface px-4 py-2.5 rounded-md font-label text-sm font-medium hover:bg-surface-container-highest transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span> Export
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-12 text-center text-on-surface-variant ambient-shadow">
              No uniform items found. Add items via the API first.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-surface-container-lowest rounded-xl p-6 flex flex-col 2xl:flex-row gap-8 transition-all hover:bg-white ambient-shadow">
                <div className="flex items-center gap-5 w-full 2xl:w-[320px] shrink-0">
                  <div className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 ${item.imageUrl ? "bg-surface-container-low" : "bg-secondary-container text-on-secondary-container flex items-center justify-center"}`}>
                    {item.imageUrl ? (
                      <img className="w-full h-full object-cover mix-blend-multiply" alt={item.name} src={item.imageUrl} />
                    ) : (
                      <span className="material-symbols-outlined text-[32px]">{item.icon || "checkroom"}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-headline text-base font-bold text-on-surface leading-tight">{item.name}</h3>
                    <p className="font-body text-xs text-on-surface-variant mt-1">{item.category}</p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-surface-container-low text-[10px] font-semibold tracking-wide text-secondary uppercase">{item.type}</span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-5 gap-2 items-center">
                  {item.sizes.map((size) => (
                    <div key={size.size} className="flex flex-col items-center gap-1.5">
                      <span className="font-label text-[11px] text-outline font-medium tracking-widest">{size.size}</span>
                      <div className={`font-headline font-bold text-base w-10 h-10 rounded-full flex items-center justify-center ${size.alert ? "bg-error-container text-on-error-container ring-4 ring-error-container/30" : "bg-surface-container-low text-on-surface"}`}>
                        {size.quantity < 10 ? `0${size.quantity}` : size.quantity}
                      </div>
                    </div>
                  ))}
                  {/* Fill empty slots if fewer than 5 sizes */}
                  {item.sizes.length < 5 && Array.from({ length: 5 - item.sizes.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex flex-col items-center gap-1.5">
                      <span className="font-label text-[11px] text-outline font-medium tracking-widest">-</span>
                      <div className="font-headline font-bold text-base w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-on-surface-variant">—</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side: Action Panel */}
      <aside className="w-[340px] shrink-0 flex flex-col gap-6 sticky top-0">
        <div className="bg-surface/80 backdrop-blur-xl rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_box</span>
              </div>
              <h3 className="font-headline text-lg font-extrabold text-on-surface">Record Inbound</h3>
            </div>
            <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); handleSubmitInbound(); }}>
              <div className="flex flex-col gap-1">
                <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Item Name</label>
                <select
                  className="bg-surface-container-lowest text-on-surface text-sm border-0 border-b border-outline-variant/20 focus:ring-0 focus:border-primary focus:border-b-2 py-2 px-1 transition-all"
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                >
                  <option value="">Pilih item...</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Size</label>
                  <select
                    className="bg-surface-container-lowest text-on-surface text-sm border-0 border-b border-outline-variant/20 focus:ring-0 focus:border-primary focus:border-b-2 py-2 px-1 transition-all"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    <option value="">Pilih...</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Quantity</label>
                  <input
                    className="bg-surface-container-lowest text-on-surface text-sm border-0 border-b border-outline-variant/20 focus:ring-0 focus:border-primary focus:border-b-2 py-2 px-1 transition-all"
                    placeholder="0"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Harga Beli / Item</label>
                  <div className="relative">
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-semibold">Rp</span>
                    <input className="bg-surface-container-lowest w-full text-on-surface text-sm border-0 border-b border-outline-variant/20 focus:ring-0 focus:border-primary focus:border-b-2 py-2 pl-8 pr-1 transition-all" placeholder="0" type="text" value={hargaBeli} onChange={handleHargaBeliChange} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Harga Jual / Item</label>
                  <div className="relative">
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-semibold">Rp</span>
                    <input className="bg-surface-container-lowest w-full text-on-surface text-sm border-0 border-b border-outline-variant/20 focus:ring-0 focus:border-primary focus:border-b-2 py-2 pl-8 pr-1 transition-all" placeholder="0" type="text" value={hargaJual} onChange={handleHargaJualChange} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Note (Optional)</label>
                <input className="bg-surface-container-lowest text-on-surface text-sm border-0 border-b border-outline-variant/20 focus:ring-0 focus:border-primary focus:border-b-2 py-2 px-1 transition-all" placeholder="e.g. Delivery from Vendor A" type="text" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <button
                className="mt-4 w-full bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-md px-6 py-3.5 font-headline font-bold text-sm shadow-[0_4px_14px_rgba(0,45,127,0.2)] hover:shadow-[0_6px_20px_rgba(0,45,127,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Processing..." : "+ Add Stock"}
              </button>
            </form>
          </div>
        </div>
        {stockAlerts.length > 0 && (
          <div className="bg-surface-container-low rounded-xl p-5">
            <h4 className="font-headline text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-error">warning</span>
              Low Stock Warnings
            </h4>
            <div className="flex flex-col gap-2">
              {stockAlerts.slice(0, 3).map((alert, idx) => (
                <p key={idx} className="font-body text-xs text-on-surface-variant leading-relaxed">
                  <span className="font-semibold text-on-surface">{alert.itemName} ({alert.size})</span> — {alert.remaining} remaining (threshold: {alert.threshold})
                </p>
              ))}
            </div>
          </div>
        )}
      </aside>
    </main>
  );
}
