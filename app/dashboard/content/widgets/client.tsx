"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStack } from "@/components/ui/toast-stack";
import { WIDGET_TEMPLATES, WidgetTile } from "@/components/profile/widgets";
import type { WidgetState } from "@/lib/widget-types";

type ModalState = null | { view: "picker" } | { view: "config"; type: string };

const inputClass =
  "w-full rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-pink-400/40 focus:ring-2 focus:ring-pink-400/10";

const fieldLabelClass =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40";

function riotDisplay(config: Record<string, string>): string {
  if (config.riotId?.trim()) return config.riotId.trim();
  if (config.name?.trim() && config.tag?.trim())
    return `${config.name.trim()}#${config.tag.trim()}`;
  return "";
}

function subtitleFor(templateType: string, config: Record<string, string>): string {
  if (templateType === "valorant") return riotDisplay(config) || "Not connected";
  if (templateType === "lanyard") return config.discordId?.trim() || "Not connected";
  if (templateType === "weather") return config.city?.trim() || "Not connected";
  if (templateType === "clock")
    return (config.format ?? "24") === "12" ? "12-hour" : "24-hour";
  return "Not connected";
}

function isConnected(templateType: string, config: Record<string, string>): boolean {
  if (templateType === "clock") return true;
  return subtitleFor(templateType, config) !== "Not connected";
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-pink-500" : "bg-[#2a2a2e]"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function ModalShell({
  onClose,
  children,
  wide,
}: {
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative max-h-[85vh] w-full ${
          wide ? "max-w-lg" : "max-w-md"
        } overflow-y-auto rounded-3xl border border-[#1f1f23] bg-[#131315] p-6 shadow-2xl shadow-black/60`}
      >
        {children}
      </div>
    </div>
  );
}

function ConfigModal({
  templateType,
  initial,
  onClose,
  onBack,
  onSave,
  onDelete,
  saving,
}: {
  templateType: string;
  initial: WidgetState;
  onClose: () => void;
  onBack: () => void;
  onSave: (next: WidgetState) => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const template = WIDGET_TEMPLATES.find((t) => t.type === templateType)!;
  const [config, setConfig] = useState<Record<string, string>>(initial.config);
  const [enabled, setEnabled] = useState(initial.enabled);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setConfig((current) => ({ ...current, [key]: e.target.value }));

  const connected = isConnected(templateType, config);

  return (
    <ModalShell onClose={onClose}>
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1b1b1b] bg-[#080808] text-white/60 transition-colors hover:border-white/20 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1b1b1b] bg-[#080808] text-white/60 transition-colors hover:border-white/20 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <WidgetTile template={template} size="h-14 w-14" rounded="rounded-2xl" />
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-white">{template.label}</h3>
          <p className={`text-sm ${connected ? "text-emerald-400" : "text-white/40"}`}>
            {connected ? "Connected" : "Not connected"}
          </p>
        </div>
      </div>

      <div className="my-5 border-t border-white/[0.07]" />

      <div className="space-y-5">
        {templateType === "valorant" && (
          <div>
            <label className={fieldLabelClass}>Riot username / tag</label>
            <input
              value={config.riotId ?? ""}
              maxLength={60}
              onChange={set("riotId")}
              placeholder="TenZ#NA1"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-white/30">Use Name#TAG.</p>
          </div>
        )}

        {templateType === "lanyard" && (
          <div>
            <label className={fieldLabelClass}>Discord user ID</label>
            <input
              value={config.discordId ?? ""}
              maxLength={30}
              inputMode="numeric"
              onChange={(e) =>
                setConfig((current) => ({
                  ...current,
                  discordId: e.target.value.trim(),
                }))
              }
              placeholder="931503229747986432"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-white/30">
              Enable Developer Mode in Discord → right-click yourself → Copy
              User ID.
            </p>
          </div>
        )}

        {templateType === "weather" && (
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div>
              <label className={fieldLabelClass}>City</label>
              <input
                value={config.city ?? ""}
                maxLength={80}
                onChange={set("city")}
                placeholder="Berlin"
                className={inputClass}
              />
            </div>
            <div>
              <label className={fieldLabelClass}>Units</label>
              <select
                value={config.units ?? "celsius"}
                onChange={set("units")}
                className={`${inputClass} cursor-pointer appearance-none`}
              >
                <option value="celsius">°C</option>
                <option value="fahrenheit">°F</option>
              </select>
            </div>
          </div>
        )}

        {templateType === "clock" && (
          <div>
            <label className={fieldLabelClass}>Format</label>
            <select
              value={config.format ?? "24"}
              onChange={set("format")}
              className={`${inputClass} cursor-pointer appearance-none`}
            >
              <option value="24">24-hour</option>
              <option value="12">12-hour</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">
              Show {template.label} widget
            </p>
            <p className="mt-0.5 text-xs text-white/40">{template.description}</p>
          </div>
          <Toggle checked={enabled} onChange={setEnabled} />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          disabled={saving}
          onClick={() =>
            onSave({ ...initial, enabled, config })
          }
          className="rounded-xl bg-[#7c5cff] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#8d6fff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onDelete}
          className="text-sm font-semibold text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </ModalShell>
  );
}

export default function WidgetsClient({
  initialWidgets,
}: {
  initialWidgets: WidgetState[];
}) {
  const router = useRouter();
  const { pushToast } = useToastStack();

  const [widgets, setWidgets] = useState<WidgetState[]>(initialWidgets);
  const [modal, setModal] = useState<null | { view: "picker" } | { view: "config"; type: string }>(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerCat, setPickerCat] = useState("All");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const enabledCount = useMemo(
    () => widgets.filter((widget) => widget.enabled).length,
    [widgets]
  );

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of WIDGET_TEMPLATES) {
      counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
    }
    return [
      { name: "All", count: WIDGET_TEMPLATES.length },
      ...[...counts.entries()].map(([name, count]) => ({ name, count })),
    ];
  }, []);

  const pickerList = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    return WIDGET_TEMPLATES.filter((t) => {
      if (pickerCat !== "All" && t.category !== pickerCat) return false;
      if (!q) return true;
      return (
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [pickerQuery, pickerCat]);

  const persist = async (next: WidgetState[]) => {
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch("/api/widgets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          widgets: next.map((widget) => ({
            type: widget.type,
            enabled: widget.enabled,
            config: widget.config,
          })),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Could not save widgets.");
      }
      const body = await response.json().catch(() => ({}));
      if (Array.isArray(body.widgets)) setWidgets(body.widgets);
      else setWidgets(next);
      router.refresh();
      return true;
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not save widgets."
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openConfig = (type: string) => setModal({ view: "config", type });

  const saveConfig = async (next: WidgetState) => {
    const merged = widgets.map((widget) =>
      widget.type === next.type ? next : widget
    );
    const ok = await persist(merged);
    if (ok) {
      pushToast("Widget Saved!");
      setModal(null);
    }
  };

  const deleteWidget = async (type: string) => {
    const merged = widgets.map((widget) =>
      widget.type === type
        ? { ...widget, enabled: false, config: {} }
        : widget
    );
    const ok = await persist(merged);
    if (ok) {
      pushToast("Widget Deleted");
      setModal(null);
      setMenuFor(null);
    }
  };

  const toggleEnabled = async (type: string, enabled: boolean) => {
    setMenuFor(null);
    const merged = widgets.map((widget) =>
      widget.type === type ? { ...widget, enabled } : widget
    );
    const ok = await persist(merged);
    if (ok) pushToast(enabled ? "Widget On" : "Widget Off");
  };

  const listed = widgets.filter((widget) => {
    const template = WIDGET_TEMPLATES.find((t) => t.type === widget.type);
    if (!template) return false;
    return widget.enabled || Object.keys(widget.config).length > 0;
  });

  const configState = (type: string): WidgetState =>
    widgets.find((widget) => widget.type === type) ?? {
      type,
      enabled: false,
      position: 0,
      config: {},
    };

  return (
    <div className="rounded-3xl border border-[#1f1f23] bg-[#101012] p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white">Widgets</h2>
      <p className="mt-1 text-sm text-white/40">
        Connect services and show them on your profile
      </p>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">
          Widgets ({enabledCount})
        </p>
        <button
          type="button"
          onClick={() => {
            setPickerQuery("");
            setPickerCat("All");
            setModal({ view: "picker" });
          }}
          className="rounded-xl bg-[#7c5cff] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#8d6fff]"
        >
          + Add widget
        </button>
      </div>

      {saveError && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {saveError}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {listed.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/35">
            No widgets yet — add one to show it on your profile.
          </p>
        )}
        {listed.map((widget) => {
          const template = WIDGET_TEMPLATES.find(
            (t) => t.type === widget.type
          )!;
          return (
            <div
              key={widget.type}
              className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3"
            >
              <WidgetTile template={template} size="h-12 w-12" rounded="rounded-2xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {template.label}
                </p>
                <p className="truncate text-xs text-white/40">
                  {subtitleFor(widget.type, widget.config)}
                </p>
              </div>
              <div className="relative flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label={`Edit ${template.label}`}
                  onClick={() => openConfig(widget.type)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:border-white/20 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="More options"
                  onClick={() =>
                    setMenuFor(menuFor === widget.type ? null : widget.type)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:border-white/20 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="19" cy="12" r="1.8" />
                  </svg>
                </button>
                {menuFor === widget.type && (
                  <>
                    <div
                      className="fixed inset-0 z-[110]"
                      onClick={() => setMenuFor(null)}
                    />
                    <div className="absolute right-0 top-11 z-[120] w-44 overflow-hidden rounded-xl border border-[#1f1f23] bg-[#17171a] p-1.5 shadow-2xl shadow-black/60">
                      <button
                        type="button"
                        onClick={() => toggleEnabled(widget.type, !widget.enabled)}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/5"
                      >
                        Turn {widget.enabled ? "off" : "on"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteWidget(widget.type)}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal?.view === "picker" && (
        <ModalShell onClose={() => setModal(null)} wide>
          <div className="mb-1 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Add widget</h3>
              <p className="mt-1 text-sm text-white/40">
                Choose a widget to show on your profile
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModal(null)}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1b1b1b] bg-[#080808] text-white/60 transition-colors hover:border-white/20 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative mt-5">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 110-16 8 8 0 010 16z" />
            </svg>
            <input
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder="Search widgets..."
              className="w-full rounded-xl border border-[#1b1b1b] bg-[#080808] py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 hover:border-white/20 focus:border-white/20"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setPickerCat(cat.name)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  pickerCat === cat.name
                    ? "bg-white text-black"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {cat.name} <span className="opacity-60">{cat.count}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 border-t border-white/[0.07]">
            {pickerList.length === 0 && (
              <p className="py-8 text-center text-sm text-white/35">
                No widgets match “{pickerQuery.trim()}”.
              </p>
            )}
            {pickerList.map((template) => {
              const state = widgets.find((w) => w.type === template.type);
              const added = !!state?.enabled;
              return (
                <button
                  key={template.type}
                  type="button"
                  onClick={() => openConfig(template.type)}
                  className="flex w-full items-center gap-4 border-b border-white/[0.07] py-4 text-left transition-colors last:border-0 hover:bg-white/[0.02]"
                >
                  <WidgetTile template={template} size="h-12 w-12" rounded="rounded-2xl" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-white">
                      {template.label}
                      {added && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                          Added
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-white/40">
                      {template.description}
                    </span>
                  </span>
                  <svg className="h-4 w-4 shrink-0 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              );
            })}
          </div>
        </ModalShell>
      )}

      {modal?.view === "config" && (
        <ConfigModal
          key={modal.type}
          templateType={modal.type}
          initial={configState(modal.type)}
          onClose={() => setModal(null)}
          onBack={() => setModal({ view: "picker" })}
          onSave={saveConfig}
          onDelete={() => deleteWidget(modal.type)}
          saving={saving}
        />
      )}
    </div>
  );
}
