"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { CLASIFICACIONES, TX_TYPES, groupMeta } from "@/lib/categories";
import type { Clasificacion, Transaction, TxType } from "@/lib/types";
import { cn, todayISO } from "@/lib/utils";
import { Icon } from "../icon";
import { useFinance } from "../providers/finance-provider";
import { Button, Field, Input, Modal, Segmented, Select } from "../ui";

export function TransactionModal() {
  const { quickAdd, closeQuickAdd } = useFinance();
  return (
    <Modal open={quickAdd.open} onClose={closeQuickAdd} title={quickAdd.editing ? "Editar movimiento" : "Nuevo movimiento"}>
      {/* key fuerza un formulario nuevo cada vez que se abre */}
      {quickAdd.open && <TransactionForm key={quickAdd.editing?.id ?? "new"} editing={quickAdd.editing} onDone={closeQuickAdd} />}
    </Modal>
  );
}

const METODOS = ["Efectivo", "Tarjeta de débito", "Tarjeta de crédito", "Transferencia"];

function TransactionForm({ editing, onDone }: { editing: Transaction | null; onDone: () => void }) {
  const { categories, categoryById, addTransactions, updateTransaction, deleteTransaction, month } = useFinance();
  const [tipo, setTipo] = useState<TxType>(editing?.tipo ?? "gasto");
  const [monto, setMonto] = useState(editing ? String(editing.monto) : "");
  const [categoryId, setCategoryId] = useState(editing?.category_id ?? "");
  const [clasificacion, setClasificacion] = useState<Clasificacion | null>(editing?.clasificacion ?? null);
  const defaultDate = month === todayISO().slice(0, 7) ? todayISO() : `${month}-01`;
  const [fecha, setFecha] = useState(editing?.fecha ?? defaultDate);
  const [descripcion, setDescripcion] = useState(editing?.descripcion ?? "");
  const [metodo, setMetodo] = useState(editing?.metodo_pago ?? "");
  const [recurrente, setRecurrente] = useState(editing?.recurrente ?? false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const cats = categories.filter((c) => c.tipo === tipo);
  const selected = categoryById.get(categoryId);
  const effectiveClas = clasificacion ?? selected?.clasificacion_default ?? null;

  const changeTipo = (t: TxType) => {
    setTipo(t);
    setCategoryId("");
    setClasificacion(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(monto.replace(/,/g, ""));
    if (!amount || amount <= 0) return setFormError("Escribe un monto mayor a cero.");
    if (!categoryId) return setFormError("Elige una categoría.");
    if (!fecha) return setFormError("Elige una fecha.");
    setSaving(true);
    setFormError(null);
    const payload = {
      tipo,
      monto: Math.round(amount * 100) / 100,
      category_id: categoryId,
      clasificacion: tipo === "gasto" ? effectiveClas : null,
      fecha,
      descripcion: descripcion.trim() || selected?.nombre || "",
      metodo_pago: metodo || null,
      recurrente,
    };
    try {
      if (editing) await updateTransaction(editing.id, payload);
      else await addTransactions([payload]);
      onDone();
    } catch {
      setFormError("No se pudo guardar. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editing || !confirm("¿Eliminar este movimiento?")) return;
    setSaving(true);
    try {
      await deleteTransaction(editing.id);
      onDone();
    } finally {
      setSaving(false);
    }
  };

  const tipoColor = TX_TYPES.find((t) => t.key === tipo)!.color;

  return (
    <form onSubmit={submit} className="space-y-5">
      <Segmented value={tipo} onChange={changeTipo} options={TX_TYPES.map((t) => ({ value: t.key, label: t.label, color: t.color }))} />

      <div className="rounded-3xl bg-surface-2/70 px-4 py-5 text-center">
        <label htmlFor="monto" className="text-xs font-medium uppercase tracking-wide text-muted">
          Monto
        </label>
        <div className="mt-1 flex items-center justify-center gap-1">
          <span className="text-3xl font-semibold" style={{ color: tipoColor }}>
            $
          </span>
          <input
            id="monto"
            inputMode="decimal"
            data-autofocus
            placeholder="0.00"
            value={monto}
            onChange={(e) => setMonto(e.target.value.replace(/[^\d.,]/g, ""))}
            className="tabular w-48 bg-transparent text-center text-4xl font-bold text-ink outline-none placeholder:text-muted/50"
          />
          <span className="text-sm font-medium text-muted">MXN</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-ink-2">Categoría</p>
        <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
          {cats.map((c) => {
            const g = groupMeta(c.grupo);
            const active = c.id === categoryId;
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => {
                  setCategoryId(c.id);
                  setClasificacion(null);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-2.5 py-2 text-left text-[13px] transition",
                  active ? "border-transparent ring-2" : "border-line hover:bg-surface-2",
                )}
                style={active ? { background: `color-mix(in oklab, ${g.color} 12%, transparent)`, ["--tw-ring-color" as string]: g.color } : undefined}
              >
                <span style={{ color: g.color }}>
                  <Icon name={c.icono} size={16} />
                </span>
                <span className="line-clamp-2 leading-tight">{c.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tipo === "gasto" && (
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-2">¿Qué tipo de gasto es?</p>
          <Segmented
            value={(effectiveClas ?? "necesario") as Clasificacion}
            onChange={setClasificacion}
            options={CLASIFICACIONES.map((c) => ({ value: c.key, label: c.label, color: c.color }))}
          />
          {effectiveClas && <p className="mt-1.5 text-xs text-muted">{CLASIFICACIONES.find((c) => c.key === effectiveClas)!.descripcion}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha">
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </Field>
        <Field label="Método de pago">
          <Select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
            <option value="">—</option>
            {METODOS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Descripción (opcional)">
        <Input placeholder={selected?.nombre ?? "Ej. Súper de la semana"} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={80} />
      </Field>

      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-line px-4 py-3">
        <span>
          <span className="block text-sm font-medium">Se repite cada mes</span>
          <span className="block text-xs text-muted">Renta, servicios, suscripciones, sueldo…</span>
        </span>
        <input type="checkbox" checked={recurrente} onChange={(e) => setRecurrente(e.target.checked)} className="size-5 accent-[var(--brand)]" />
      </label>

      {formError && <p className="text-sm text-bad">{formError}</p>}

      <div className="flex gap-3">
        {editing && (
          <Button type="button" variant="danger" onClick={remove} disabled={saving} aria-label="Eliminar">
            <Trash2 size={16} />
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? "Guardando…" : editing ? "Guardar cambios" : "Agregar"}
        </Button>
      </div>
    </form>
  );
}
