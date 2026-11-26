import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aviso de privacidad" };

const CONTACTO = "https://github.com/diegowavv/BolsilloApp/issues";

export default function PrivacidadPage() {
  return (
    <>
      <h1>Aviso de privacidad</h1>
      <p className="text-sm">Última actualización: 26 de noviembre de 2026</p>

      <p>
        Bolsillo es una aplicación web gratuita para registrar ingresos y gastos personales. Este aviso explica qué datos
        guardamos, para qué los usamos y cómo puedes pedir que se borren.
      </p>

      <h2>Datos que recopilamos</h2>
      <ul>
        <li>
          <b>Datos de tu cuenta:</b> tu correo electrónico y, si lo escribes o entras con Google, tu nombre. Al entrar con
          Google solo pedimos los permisos básicos de perfil y correo; no accedemos a tus correos, archivos ni contactos.
        </li>
        <li>
          <b>Datos que tú registras:</b> movimientos (montos, fechas, categorías, descripciones), presupuestos, metas de
          ahorro y categorías personalizadas.
        </li>
        <li>
          <b>Preferencias locales:</b> el tema claro u oscuro y el mes que estabas viendo se guardan solo en tu navegador.
        </li>
      </ul>

      <h2>Para qué los usamos</h2>
      <p>
        Únicamente para darte el servicio: iniciar tu sesión, guardar tus datos y mostrarte tus resúmenes y gráficas. No
        vendemos, rentamos ni compartimos tus datos con terceros para publicidad, y no mostramos anuncios.
      </p>

      <h2>Dónde se guardan</h2>
      <p>
        La aplicación se aloja en Vercel y los datos se guardan en una base de datos de Supabase ubicada en Estados Unidos.
        Cada usuario solo puede leer y modificar sus propios registros (seguridad a nivel de fila). La conexión siempre es
        cifrada (HTTPS).
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes consultar, corregir o eliminar tus movimientos en cualquier momento desde la app, y exportarlos a CSV. Para
        borrar tu cuenta y todos tus datos, o para cualquier duda sobre privacidad, escríbenos en{" "}
        <a href={CONTACTO} className="font-medium text-brand underline">
          la página de contacto del proyecto
        </a>
        .
      </p>

      <h2>Cambios a este aviso</h2>
      <p>Si este aviso cambia, actualizaremos la fecha de arriba. Los cambios importantes se avisarán dentro de la app.</p>
    </>
  );
}
