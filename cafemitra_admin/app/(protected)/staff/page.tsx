"use client";

import { useEffect, useState } from "react";
import { addStaff, fetchStaff, revokeStaff, setStaffRole, type AdminRoleValue, type StaffMember } from "@/lib/api";

const ROLES: AdminRoleValue[] = ["super_admin", "finance", "support", "sales"];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRoleValue>("support");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    fetchStaff()
      .then((res) => setStaff(res.staff))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load staff."));
  }

  useEffect(load, []);

  async function handleRoleChange(id: number, role: AdminRoleValue) {
    setSavingId(id);
    try {
      await setStaffRole(id, role);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await addStaff(email.trim(), newRole);
      setEmail("");
      setNewRole("support");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add staff.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevoke(member: StaffMember) {
    if (!window.confirm(`Revoke staff access for ${member.email}? Their RepetiGo account itself is not affected.`)) return;
    setSavingId(member.id);
    try {
      await revokeStaff(member.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke staff access.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-slate-900">Staff & Roles</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add staff
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Only super admins can see this page. finance sees Wallet/Shops/Agents/Analytics; support sees
        Shops/Orders/Support/Print Agent; sales sees Agents/Leads/Analytics; super_admin sees everything.
      </p>

      {showForm && (
        <form onSubmit={handleAddStaff} className="mb-4 rounded-xl border border-slate-200 bg-white p-4 max-w-md flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Existing RepetiGo account email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="person@example.com"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-400">
              They must already have a verified RepetiGo account (check the Shops list for their email) - this
              promotes that account to staff, it doesn&apos;t create a new one.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as AdminRoleValue)}
              className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="self-start rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add as staff"}
          </button>
        </form>
      )}

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-700">{member.email}</td>
                <td className="px-4 py-2 text-slate-700">{member.fullName || "-"}</td>
                <td className="px-4 py-2">
                  <select
                    value={member.role}
                    disabled={savingId === member.id}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as AdminRoleValue)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button
                    disabled={savingId === member.id}
                    onClick={() => handleRevoke(member)}
                    className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
