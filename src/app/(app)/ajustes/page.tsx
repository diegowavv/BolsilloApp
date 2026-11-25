"use client";

import { useState } from "react";
import { Crown, Laptop, Lock, Moon, Plus, Sun, Trash2 } from "lucide-react";
import { Icon, ICON_CHOICES } from "@/components/icon";
import { useFinance } from "@/components/providers/finance-provider";
import { useTheme, type ThemePref } from "@/components/providers/theme";
import { Button, Card, CardHeader, Chip, Field, Input, Modal, PageHeader, Segmented, Select } from "@/components/ui";
import { CLASIFICACIONES, EXPENSE_GROUPS, clasificacionMeta, groupMeta } from "@/lib/categories";
import { FEATURES, PREMIUM_FEATURES } from "@/lib/features";
import type { Clasificacion, GroupKey } from "@/lib/types";

export default function AjustesPage() {
  const f = useFinance();
  const { pref, setTheme } = useTheme();
  const [nombre, setNombre] = useState<string | null>(null);
  const [newCat, setNewCat] = useState(false);
  const custom = f.categories.filter((c) => c.user_id);

  return (
    <div className="space-y-5">
      <PageHeader title="Ajustes" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Perfil" subtitle={f.mode === "cloud" ? f.profile.email : "Modo demo (sin cuenta)"} />
          <form
            className="flex gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (nombre != null) await f.updateProfile({ nombre: nombre.trim() || null });
              setNombre(null);
            }}
          >
            <Input placeholder="¿Cómo te llamas?" value={nombre ?? f.profile.nombre ?? ""} onChange={(e) => setNombre(e.target.value)} maxLength={60} aria-label="Nombre" />
            <Button type="submit" variant="secondary" disabled={nombre == null}>
              Guardar
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted">Moneda: Peso mexicano (MXN)</p>
        </Card>

        <Card>
          <CardHeader title="Apariencia" />
          <Segmented<ThemePref>
            value={pref}
            onChange={setTheme}
            options={[
              { value: "light", label: "Claro" },
              { value: "dark", label: "Oscuro" },
              { value: "system", label: "Sistema" },
            ]}
          />
          <div className="mt-4 flex gap-4 text-muted">
            <Sun size={16} /> <Moon size={16} /> <Laptop size={16} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Mis categorías"
          subtitle="Crea categorías propias además de las que vienen incluidas."
          action={
            <Button size="sm" variant="secondary" onClick={() => setNewCat(true)}>
              <Plus size={15} /> Nueva
            </Button>
          }
        />
        {custom.length ? (
          <ul className="divide-y divide-line">
            {custom.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2.5">
                <span style={{ color: groupMeta(c.grupo).color }}>
                  <Icon name={c.icono} />
                </span>
                <span className="flex-1 text-sm font-medium">{c.nombre}</span>
                <span className="hidden text-xs text-muted sm:inline">{groupMeta(c.grupo).label}</span>
                {c.clasificacion_default && <Chip color={clasificacionMeta(c.clasificacion_default).color}>{clasificacionMeta(c.clasificacion_default).label}</Chip>}
                <button
                  onClick={() => confirm(`¿Eliminar "${c.nombre}"?`) && f.deleteCategory(c.id).catch(() => {})}
                  className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-bad"
                  aria-label="Eliminar categoría"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Aún no has creado categorías propias.</p>
        )}

        <details className="mt-4 rounded-2xl bg-surface-2/60 px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium">Ver categorías incluidas</summary>
          <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXPENSE_GROUPS.map((g) => (
              <div key={g.key}>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: g.color }}>
                  <Icon name={g.icono} size={13} /> {g.label}
                </p>
                <ul className="space-y-0.5 text-sm text-ink-2">
                  {f.categories
                    .filter((c) => c.grupo === g.key && !c.user_id)
                    .map((c) => (
                      <li key={c.id}>{c.nombre}</li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-brand/15 blur-2xl" />
        <CardHeader
          title="Bolsillo Premium"
          subtitle="Estamos preparando funciones avanzadas. Por ahora, todo lo esencial es gratis."
          action={
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
              <Crown size={13} /> Próximamente
            </span>
          }
        />
        <ul className="grid gap-2 sm:grid-cols-2">
          {PREMIUM_FEATURES.map((k) => (
            <li key={k} className="flex items-center gap-2.5 rounded-2xl border border-line px-3 py-2.5 text-sm text-ink-2">
              <Lock size={14} className="text-muted" /> {FEATURES[k].label}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">Tu plan actual: {f.profile.plan === "premium" ? "Premium" : "Gratis"}</p>
      </Card>

      {f.mode === "demo" && (
        <Card>
          <CardHeader title="Datos del modo demo" subtitle="Se guardan solo en este navegador." />
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => f.loadSampleData()}>
              Cargar datos de ejemplo
            </Button>
            <Button variant="danger" onClick={() => confirm("¿Borrar todos los datos del modo demo en este navegador? No se puede deshacer.") && f.signOut()}>
              Borrar todo
            </Button>
          </div>
        </Card>
      )}

      {f.mode === "cloud" && (
        <Button variant="danger" onClick={f.signOut} className="w-full sm:w-auto">
          Cerrar sesión
        </Button>
      )}

      <Modal open={newCat} onClose={() => setNewCat(false)} title="Nueva categoría">
        {newCat && (
          <CategoryForm
            onSubmit={async (c) => {
              await f.addCategory(c);
              setNewCat(false);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function CategoryForm({
  onSubmit,
}: {
  onSubmit: (c: { nombre: string; grupo: GroupKey; icono: string; tipo: "gasto" | "ingreso"; clasificacion_default: Clasificacion | null }) => Promise<void>;
}) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<"gasto" | "ingreso">("gasto");
  const [grupo, setGrupo] = useState<GroupKey>("otros");
  const [clas, setClas] = useState<Clasificacion>("necesario");
  const [icono, setIcono] = useState("shapes");
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        await onSubmit({
          nombre: nombre.trim(),
          tipo,
          grupo: tipo === "ingreso" ? "ingresos" : grupo,
          icono,
          clasificacion_default: tipo === "gasto" ? clas : null,
        });
      }}
    >
      <Segmented value={tipo} onChange={setTipo} options={[{ value: "gasto", label: "Gasto" }, { value: "ingreso", label: "Ingreso" }]} />
      <Field label="Nombre">
        <Input autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Mascotas" required maxLength={40} />
      </Field>
      {tipo === "gasto" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Grupo">
            <Select value={grupo} onChange={(e) => setGrupo(e.target.value as GroupKey)}>
              {EXPENSE_GROUPS.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Clasificación por defecto">
            <Select value={clas} onChange={(e) => setClas(e.target.value as Clasificacion)}>
              {CLASIFICACIONES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}
      <div>
        <p className="mb-2 text-[13px] font-medium text-ink-2">Ícono</p>
        <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
          {ICON_CHOICES.map((i) => (
            <button
              type="button"
              key={i}
              onClick={() => setIcono(i)}
              aria-label={i}
              className={"flex size-9 items-center justify-center rounded-xl border transition " + (icono === i ? "border-brand bg-brand-soft text-brand" : "border-line text-ink-2 hover:bg-surface-2")}
            >
              <Icon name={i} size={16} />
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full">
        Crear categoría
      </Button>
    </form>
  );
}
