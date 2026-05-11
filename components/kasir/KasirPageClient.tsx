"use client";

import { useState, useCallback, useRef } from "react";

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
  sizes: SizeEntry[];
}

interface Student {
  id: number;
  nis: string;
  name: string;
  className: string;
  grade: number;
  uniformStatus: string;
}

interface CartItem {
  uniformItemId: number;
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export default function KasirPageClient({ uniformItems }: { uniformItems: UniformItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSizePicker, setShowSizePicker] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Debounced student search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/students?search=${encodeURIComponent(value)}&per_page=5`);
        const data = await res.json();
        setSearchResults(data.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchQuery(student.name);
  };

  const addToCart = (item: UniformItem, size: string) => {
    const sizeEntry = item.sizes.find((s) => s.size === size);
    if (!sizeEntry || sizeEntry.quantity <= 0) {
      alert(`${item.name} size ${size} is out of stock`);
      return;
    }

    const existingIdx = cart.findIndex(
      (c) => c.uniformItemId === item.id && c.size === size
    );

    if (existingIdx >= 0) {
      const updated = [...cart];
      updated[existingIdx].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          uniformItemId: item.id,
          name: item.name,
          size,
          quantity: 1,
          unitPrice: sizeEntry.unitPrice,
        },
      ]);
    }
    setShowSizePicker(null);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const processTransaction = async () => {
    if (!selectedStudent) {
      alert("Please select a student first.");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/cashier/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          amountPaid: subtotal,
          items: cart.map((c) => ({
            uniformItemId: c.uniformItemId,
            size: c.size,
            quantity: c.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Transaction failed");
      }

      const result = await res.json();
      alert(`Transaction successful!\nInvoice: ${result.invoiceNumber}\nTotal: Rp ${new Intl.NumberFormat("id-ID").format(subtotal)}`);

      // Reset
      setCart([]);
      setSelectedStudent(null);
      setSearchQuery("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID").format(amount);
  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const statusLabel = (s: string) => {
    if (s === "complete") return { text: "Lunas", cls: "bg-tertiary-fixed text-on-tertiary-fixed" };
    if (s === "partial") return { text: "Sebagian", cls: "bg-secondary-container text-on-secondary-container" };
    return { text: "Belum Lunas", cls: "bg-error-container text-on-error-container" };
  };

  return (
    <div className="flex-1 flex gap-6 px-10 pb-8 overflow-hidden h-full">
      {/* Left Panel: Search & Selection */}
      <section className="flex-[3] flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
        {/* Search & Registration Card */}
        <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-4">Student Search</h3>
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[24px]">badge</span>
            <input
              className="w-full bg-surface-container-low border-none rounded-lg pl-12 pr-4 py-4 text-base font-body text-on-surface placeholder-on-surface-variant focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all outline-none"
              placeholder="Scan NIS or type Student Name..."
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/20 z-10 max-h-60 overflow-y-auto">
                {searchResults.map((s) => (
                  <button
                    key={s.id}
                    className="w-full text-left px-4 py-3 hover:bg-surface-container-high transition-colors flex items-center gap-3"
                    onClick={() => selectStudent(s)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-fixed-dim text-on-primary-fixed flex items-center justify-center text-xs font-bold">
                      {getInitials(s.name)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-on-surface">{s.name}</div>
                      <div className="text-xs text-on-surface-variant">NIS: {s.nis} • {s.className}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/20 z-10 px-4 py-3 text-sm text-on-surface-variant">
                Searching...
              </div>
            )}
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg ghost-border">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">person_add</span>
              <span className="text-sm font-medium font-body text-on-surface-variant">Student not found?</span>
            </div>
            <button className="text-sm font-semibold text-primary hover:text-primary-container transition-colors">Quick Register</button>
          </div>
        </div>

        {/* Active Student Context */}
        {selectedStudent && (
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-full bg-primary-fixed-dim text-on-primary-fixed flex items-center justify-center font-headline font-bold text-xl">
                  {getInitials(selectedStudent.name)}
                </div>
                <div>
                  <h4 className="font-headline text-lg font-bold text-on-surface">{selectedStudent.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-label text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-sm">NIS: {selectedStudent.nis}</span>
                    <span className="text-xs font-label text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-sm">Class {selectedStudent.className}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs font-label text-on-surface-variant mb-1">Uniform Status</span>
                {(() => {
                  const st = statusLabel(selectedStudent.uniformStatus);
                  return (
                    <span className={`inline-flex items-center gap-1 ${st.cls} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      {st.text}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Uniform Selection Matrix */}
        <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow flex-1">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-4">Select Items</h3>
          <div className="grid grid-cols-2 gap-4">
            {uniformItems.map((item) => (
              <div key={item.id} className="relative">
                <button
                  className="w-full p-4 rounded-lg bg-surface-container-low hover:bg-surface-container-highest cursor-pointer transition-colors ghost-border flex justify-between items-center group text-left"
                  onClick={() => setShowSizePicker(showSizePicker === item.id ? null : item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-md flex items-center justify-center">
                      <span className="material-symbols-outlined">{item.icon || "checkroom"}</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold font-body text-on-surface group-hover:text-primary transition-colors">{item.name}</h5>
                      <span className="text-xs text-on-surface-variant font-label">{item.type}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">add_circle</span>
                </button>
                {/* Size picker dropdown */}
                {showSizePicker === item.id && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/20 z-10 p-3">
                    <div className="text-xs font-label text-on-surface-variant mb-2 uppercase tracking-wider">Select Size</div>
                    <div className="flex gap-2 flex-wrap">
                      {item.sizes.map((s) => (
                        <button
                          key={s.size}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            s.quantity <= 0
                              ? "bg-error-container/30 text-on-surface-variant cursor-not-allowed"
                              : "bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface"
                          }`}
                          onClick={() => s.quantity > 0 && addToCart(item, s.size)}
                          disabled={s.quantity <= 0}
                          title={`Stock: ${s.quantity} • Rp ${new Intl.NumberFormat("id-ID").format(s.unitPrice)}`}
                        >
                          {s.size}
                          <span className="block text-[10px] opacity-70">{s.quantity > 0 ? `${s.quantity}` : "—"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Panel: Ledger & Checkout */}
      <section className="flex-[2] flex flex-col bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
        <div className="p-6 bg-surface-container-low border-b ghost-border">
          <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            Collection Ledger
          </h3>
        </div>
        {/* Added Items List */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
              <div className="text-center">
                <span className="material-symbols-outlined text-[48px] mb-2 block text-outline">shopping_cart</span>
                No items added yet
              </div>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.uniformItemId}-${item.size}-${idx}`} className="flex justify-between items-center pb-4 border-b ghost-border">
                <div className="flex-1">
                  <h6 className="text-sm font-semibold font-body text-on-surface">{item.name}</h6>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-label text-on-surface-variant bg-surface px-2 py-1 rounded">Size: {item.size}</span>
                    <span className="text-xs font-label text-on-surface-variant">Qty: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-semibold font-body text-on-surface">Rp {formatCurrency(item.unitPrice * item.quantity)}</span>
                  <button
                    className="text-xs text-error hover:text-on-error-container mt-1 transition-colors"
                    onClick={() => removeFromCart(idx)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Checkout Block */}
        <div className="p-6 bg-surface-container-highest mt-auto rounded-t-xl">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-on-surface-variant font-body">Subtotal ({cart.length} Items)</span>
            <span className="text-xl font-headline font-bold text-on-surface">Rp {formatCurrency(subtotal)}</span>
          </div>
          <button
            className="w-full btn-gradient py-4 rounded-xl font-headline font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
            onClick={processTransaction}
            disabled={processing || cart.length === 0 || !selectedStudent}
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            {processing ? "Processing..." : "Process & Save"}
          </button>
        </div>
      </section>
    </div>
  );
}
