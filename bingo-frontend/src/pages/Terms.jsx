import LegalPage, { LegalSection } from "../components/legal/LegalPage";

export default function Terms() {
  return (
    <LegalPage
      kicker="Bingonline"
      title="Términos de uso"
      updated="3 de septiembre de 2026"
    >
      <p>
        Estos términos regulan el uso de Bingonline (bingonline.fun), un bingo
        social en tiempo real para jugar en mesas con otras personas. Al entrar
        al sitio, crear una cuenta, unirte como invitado o usar Google, aceptas
        estas reglas.
      </p>

      <LegalSection title="1. Qué es este servicio">
        <p>
          Bingonline es un juego de entretenimiento. Puedes crear o unirte a
          mesas, marcar un cartón, cantar bingo y hablar en el chat de la sala.
          No hay apuestas, pagos ni premios en dinero real. Ganar una ronda no
          da derecho a dinero, bienes ni créditos canjeables.
        </p>
      </LegalSection>

      <LegalSection title="2. Quién puede usarlo">
        <p>
          Debes tener al menos 13 años. Si eres menor de 18, usa el servicio
          con permiso de un adulto responsable. El acceso como invitado también
          queda sujeto a estos términos.
        </p>
      </LegalSection>

      <LegalSection title="3. Cuentas y acceso">
        <p>Puedes entrar de tres formas:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Cuenta con apodo, correo y contraseña.</li>
          <li>Inicio de sesión con Google.</li>
          <li>Invitado, solo con un nombre, sin correo.</li>
        </ul>
        <p>
          Eres responsable de lo que ocurra con tu sesión. No compartas tu
          contraseña. El acceso de invitado es temporal y puede perderse al
          cerrar la sesión o borrar los datos del navegador.
        </p>
      </LegalSection>

      <LegalSection title="4. Mesas y partidas">
        <p>
          Las mesas públicas y privadas aparecen en el listado. Una mesa
          privada pide la clave que creó el anfitrión; sin esa clave no puedes
          entrar. El anfitrión configura nombre, tiempo, figura ganadora y
          visibilidad, y puede iniciar o pasar de ronda.
        </p>
        <p>
          Si sales de una partida en curso, abandonas esa ronda. Si la mesa
          aún no ha empezado, solo sales de la sala de espera. Quien entra con
          la ronda ya empezada queda en cola para la siguiente.
        </p>
        <p>
          Cantar bingo sin la figura correcta puede dejarte fuera de la ronda.
          El resultado lo decide el servidor.
        </p>
      </LegalSection>

      <LegalSection title="5. Conducta">
        <p>No está permitido:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Hacer trampas, usar bots o explotar fallos del juego.</li>
          <li>Acosar, insultar o amenazar a otros jugadores.</li>
          <li>Usar el chat para spam, publicidad o contenido ilegal.</li>
          <li>Intentar entrar a mesas privadas sin la clave o saltándote el acceso.</li>
          <li>Suplantar a otra persona o al anfitrión.</li>
          <li>Usar el servicio para apuestas o dinero real entre jugadores.</li>
        </ul>
        <p>
          Podemos suspender o cerrar una sesión, una mesa o una cuenta si se
          rompen estas reglas.
        </p>
      </LegalSection>

      <LegalSection title="6. Contenido del chat">
        <p>
          Los mensajes del chat se ven en la mesa y se guardan de forma
          temporal en el servidor. Eres responsable de lo que escribes. No
          publiques datos personales de otras personas.
        </p>
      </LegalSection>

      <LegalSection title="7. Disponibilidad">
        <p>
          El juego se ofrece “tal cual”. Puede haber cortes, errores o
          partidas que se cierren si la mesa queda vacía. No garantizamos que
          una ronda termine ni que tu cartón o tu progreso de invitado se
          conserven siempre.
        </p>
      </LegalSection>

      <LegalSection title="8. Propiedad">
        <p>
          El nombre Bingonline, el diseño de la mesa, el cartón y el resto de
          la interfaz nos pertenecen o se usan con licencia. Puedes usar el
          servicio para jugar; no puedes copiarlo, venderlo ni hacerlo pasar
          por tuyo.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitación de responsabilidad">
        <p>
          En la medida que permita la ley, no respondemos por pérdidas
          indirectas, interrupciones, datos perdidos o disgustos por el
          resultado de una partida. El servicio es gratuito y recreativo.
        </p>
      </LegalSection>

      <LegalSection title="10. Cambios">
        <p>
          Podemos actualizar estos términos. La fecha de arriba indica la
          versión vigente. Si sigues usando Bingonline después de un cambio,
          aceptas la nueva versión.
        </p>
      </LegalSection>

      <LegalSection title="11. Contacto">
        <p>
          Para dudas sobre estos términos, escribe a{" "}
          <a
            href="mailto:josebenjumea2005@gmail.com"
            className="font-semibold text-[var(--bingo-felt)] underline"
          >
            josebenjumea2005@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
