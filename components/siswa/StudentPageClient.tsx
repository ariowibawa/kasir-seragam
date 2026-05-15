"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Student {
  id: number;
  nis: string;
  name: string;
  className: string;
  grade: number;
  uniformStatus: string;
}

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface Props {
  initialData: {
    data: Student[];
    meta: PaginationMeta;
  };
}

const statusConfig: Record<string, { label: string; bg: string; dot: string }> = {
  complete: { label: "Complete", bg: "bg-tertiary-fixed text-on-tertiary-fixed", dot: "bg-on-tertiary-fixed" },
  partial: { label: "Partial", bg: "bg-secondary-container text-on-secondary-container", dot: "bg-on-secondary-container" },
  none: { label: "None", bg: "bg-error-container text-on-error-container", dot: "bg-on-error-container" },
};

export default function StudentPageClient({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [students, setStudents] = useState(initialData.data);
  const [meta, setMeta] = useState(initialData.meta);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [grade, setGrade] = useState(searchParams.get("grade") ?? "");
  const [status, setStatus] = useState(searchParams.get("uniform_status") ?? "");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const fetchStudents = useCallback(async (params: Record<string, string>) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`/api/students?${qs}`);
      const data = await res.json();
      setStudents(data.data);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    const params: Record<string, string> = { page: "1" };
    if (search) params.search = search;
    if (grade) params.grade = grade;
    if (status) params.uniform_status = status;
    fetchStudents(params);
  };

  const handlePageChange = (page: number) => {
    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    if (grade) params.grade = grade;
    if (status) params.uniform_status = status;
    fetchStudents(params);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await fetch(`/api/students/${id}`, { method: "DELETE" });
      fetchStudents({ page: String(meta.current_page) });
    } catch (err) {
      alert("Failed to delete student");
    }
  };

  const handleSave = async (formData: { nis: string; name: string; className: string; grade: number }) => {
    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students";
      const method = editingStudent ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      setShowModal(false);
      setEditingStudent(null);
      fetchStudents({ page: String(meta.current_page) });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main className="flex-1 overflow-y-auto p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header & Actions */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Student Data</h2>
            <p className="text-on-surface-variant font-body mt-1 text-sm">Manage student records and monitor uniform distribution status.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditingStudent(null); setShowModal(true); }}
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl px-5 py-2.5 flex items-center gap-2 hover:opacity-90 transition-opacity font-label font-medium text-sm ambient-shadow"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add Student
            </button>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between">
          <div className="flex-1 max-w-md relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              className="w-full bg-surface-container-lowest outline-none border-b-2 border-outline-variant/20 focus:border-primary pl-12 pr-4 py-3 font-body text-sm rounded-lg transition-colors placeholder:text-on-surface-variant/60"
              placeholder="Search by NIS or Name..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                className="appearance-none bg-surface-container-lowest outline-none border-b-2 border-outline-variant/20 focus:border-primary pl-4 pr-10 py-3 font-body text-sm rounded-lg transition-colors text-on-surface cursor-pointer min-w-[140px]"
                value={grade}
                onChange={(e) => { setGrade(e.target.value); setTimeout(handleSearch, 0); }}
              >
                <option value="">All Classes</option>
                <option value="7">Kelas 7</option>
                <option value="8">Kelas 8</option>
                <option value="9">Kelas 9</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-surface-container-lowest outline-none border-b-2 border-outline-variant/20 focus:border-primary pl-4 pr-10 py-3 font-body text-sm rounded-lg transition-colors text-on-surface cursor-pointer min-w-[160px]"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setTimeout(handleSearch, 0); }}
              >
                <option value="">Any Status</option>
                <option value="complete">Complete</option>
                <option value="partial">Partial</option>
                <option value="none">None</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
          <div className="w-full text-left font-body">
            <div className="grid grid-cols-12 gap-4 pb-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <div className="col-span-2">NIS</div>
              <div className="col-span-3">Nama Siswa</div>
              <div className="col-span-2">Kelas</div>
              <div className="col-span-3">Status Seragam</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="py-12 text-center text-on-surface-variant">Loading...</div>
              ) : students.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant">No students found</div>
              ) : (
                students.map((student) => {
                  const sc = statusConfig[student.uniformStatus] || statusConfig.none;
                  return (
                    <div key={student.id} className="grid grid-cols-12 gap-4 items-center p-4 rounded-lg hover:bg-surface-container-high/50 transition-colors cursor-pointer group">
                      <div className="col-span-2 text-sm font-medium text-on-surface">{student.nis}</div>
                      <div className="col-span-3 text-sm text-on-surface font-medium flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-primary">
                          {getInitials(student.name)}
                        </div>
                        {student.name}
                      </div>
                      <div className="col-span-2 text-sm text-on-surface-variant">{student.className}</div>
                      <div className="col-span-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${sc.bg} text-xs font-semibold`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                          {sc.label}
                        </span>
                      </div>
                      <div className="col-span-2 text-right flex justify-end gap-1">
                        <button
                          onClick={() => { setEditingStudent(student); setShowModal(true); }}
                          className="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            <div className="mt-6 pt-6 flex items-center justify-between text-sm text-on-surface-variant font-body px-4 border-t border-outline-variant/10">
              <span>
                Showing {(meta.current_page - 1) * meta.per_page + 1} to{" "}
                {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} entries
              </span>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded-md hover:bg-surface-container transition-colors disabled:opacity-50"
                  disabled={meta.current_page <= 1}
                  onClick={() => handlePageChange(meta.current_page - 1)}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`px-3 py-1 rounded-md transition-colors ${p === meta.current_page
                      ? "bg-surface-container text-on-surface font-medium"
                      : "hover:bg-surface-container"
                      }`}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="px-3 py-1 rounded-md hover:bg-surface-container transition-colors disabled:opacity-50"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => handlePageChange(meta.current_page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <StudentFormModal
          student={editingStudent}
          onClose={() => { setShowModal(false); setEditingStudent(null); }}
          onSave={handleSave}
        />
      )}
    </main>
  );
}

function StudentFormModal({
  student,
  onClose,
  onSave,
}: {
  student: Student | null;
  onClose: () => void;
  onSave: (data: { nis: string; name: string; className: string; grade: number }) => void;
}) {
  const [nis, setNis] = useState(student?.nis ?? "");
  const [name, setName] = useState(student?.name ?? "");
  const [className, setClassName] = useState(student?.className ?? "");
  const [grade, setGrade] = useState(student?.grade ?? 7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nis, name, className, grade });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md ambient-shadow">
        <h3 className="font-headline text-xl font-bold text-on-surface mb-6">
          {student ? "Edit Student" : "Add New Student"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">NIS</label>
            <input
              className="bg-surface-container-low text-on-surface text-sm border-0 border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary py-2.5 px-3 rounded-t-md transition-all outline-none"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              placeholder="e.g. 10293847"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Student Name</label>
            <input
              className="bg-surface-container-low text-on-surface text-sm border-0 border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary py-2.5 px-3 rounded-t-md transition-all outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Class</label>
              <input
                className="bg-surface-container-low text-on-surface text-sm border-0 border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary py-2.5 px-3 rounded-t-md transition-all outline-none"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. 7A"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Grade</label>
              <select
                className="bg-surface-container-low text-on-surface text-sm border-0 border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary py-2.5 px-3 rounded-t-md transition-all outline-none cursor-pointer"
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value))}
              >
                <option value={7}>7</option>
                <option value={8}>8</option>
                <option value={9}>9</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {student ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
