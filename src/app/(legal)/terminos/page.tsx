import type { Metadata } from "next";

export const metadata: Metadata = { title: "Términos de uso" };

export default function TerminosPage() {
  return (
    <>
      <h1>Términos de uso</h1>
      <p className="text-sm">Última actualización: 26 de noviembre de 2026</p>

      <p>
        Al usar Bolsillo aceptas estos términos. Bolsillo es una herramienta gratuita para organizar tus finanzas
        personales.
      </p>

      <h2>El servicio</h2>
      <ul>
        <li>Bolsillo se ofrece &quot;tal cual&quot;, sin garantías. Hacemos lo posible por mantenerlo disponible y seguro.</li>
        <li>
          Los cálculos, gráficas e indicadores (como la salud financiera) son orientativos y no constituyen asesoría
          financiera, fiscal ni de inversión.
        </li>
        <li>En el futuro podrían añadirse funciones de pago opcionales; las funciones gratuitas actuales seguirán disponibles.</li>
      </ul>

      <h2>Tu cuenta</h2>
      <ul>
        <li>Eres responsable de mantener segura tu contraseña o tu cuenta de Google.</li>
        <li>Los datos que registras son tuyos. Puedes borrarlos o pedir la eliminación de tu cuenta en cualquier momento.</li>
        <li>No uses Bolsillo para actividades ilegales ni para intentar acceder a datos de otras personas.</li>
      </ul>

      <h2>Privacidad</h2>
      <p>
        El tratamiento de tus datos se describe en el{" "}
        <a href="/privacidad" className="font-medium text-brand underline">
          aviso de privacidad
        </a>
        .
      </p>
    </>
  );
}
