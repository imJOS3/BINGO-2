import LegalPage, { LegalSection } from "../components/legal/LegalPage";

export default function Privacy() {
  return (
    <LegalPage
      kicker="Bingonline"
      title="Política de privacidad"
      updated="3 de septiembre de 2026"
    >
      <p>
        Esta política explica qué datos usa Bingonline (bingonline.fun) para
        que puedas entrar, jugar en una mesa y hablar en el chat. El servicio
        es un bingo social: no pedimos pagos ni datos de tarjetas.
      </p>

      <LegalSection title="1. Datos que usamos">
        <p>Según cómo entres, podemos tratar:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Cuenta local:</strong> apodo, correo y contraseña (la
            contraseña se guarda cifrada, no en texto claro).
          </li>
          <li>
            <strong>Google:</strong> el identificador, el nombre y el correo
            que Google nos envía al iniciar sesión.
          </li>
          <li>
            <strong>Invitado:</strong> solo el nombre que eliges. Creamos una
            sesión temporal, sin pedirte correo.
          </li>
          <li>
            <strong>Partida:</strong> mesas que creas o a las que te unes,
            cartón, marcas, bolas cantadas, si eres anfitrión y si sales o
            abandonas una ronda.
          </li>
          <li>
            <strong>Chat y presencia:</strong> mensajes de la sala y si estás
            conectado o ausente.
          </li>
          <li>
            <strong>Técnicos:</strong> token de sesión en tu navegador e
            información básica de conexión para mantener el juego en tiempo
            real.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Para qué los usamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Crear tu sesión y reconocerte en la mesa.</li>
          <li>Mostrar tu apodo a los demás jugadores de esa sala.</li>
          <li>Guardar el cartón, las marcas y el estado de la ronda.</li>
          <li>Dejar entrar a mesas privadas solo si la clave coincide.</li>
          <li>Mantener el chat, la presencia y el listado de mesas.</li>
          <li>Prevenir abusos, trampas o accesos no autorizados.</li>
        </ul>
        <p>No usamos tus datos para vender publicidad de terceros.</p>
      </LegalSection>

      <LegalSection title="3. Con quién se ven">
        <p>
          Otros jugadores de tu mesa pueden ver tu apodo, si estás conectado,
          tu cartón cuando aplica (por ejemplo desde la cola) y lo que
          escribes en el chat. El anfitrión ve la clave de su mesa privada
          para poder compartirla; el resto de jugadores no la recibe.
        </p>
        <p>
          Si entras con Google, Google trata tus datos según su propia
          política. Nosotros solo recibimos lo necesario para crear o abrir
          tu sesión.
        </p>
        <p>
          No vendemos tu información. Podemos usar proveedores de hosting y
          base de datos solo para operar el sitio.
        </p>
      </LegalSection>

      <LegalSection title="4. Claves de mesa">
        <p>
          La clave de una mesa privada la elige el anfitrión. Sirve para
          entrar a esa sala, no es tu contraseña de cuenta. Compártela solo
          con quien quieras en la partida.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies y almacenamiento local">
        <p>
          Guardamos en tu navegador el token de sesión y preferencias
          mínimas del juego (por ejemplo la mesa seleccionada). Son
          necesarias para que no tengas que entrar de nuevo en cada página.
          Puedes borrarlas desde el navegador; al hacerlo se cierra la
          sesión.
        </p>
      </LegalSection>

      <LegalSection title="6. Conservación">
        <p>
          Los datos de cuenta se conservan mientras la cuenta exista. El
          chat de cada mesa se guarda un tiempo limitado en memoria del
          servidor. Las partidas y cartones se mantienen para el
          funcionamiento del juego y pueden borrarse cuando la mesa se
          cierra o queda vacía. El acceso de invitado dura lo que dure esa
          sesión.
        </p>
      </LegalSection>

      <LegalSection title="7. Tus derechos">
        <p>Puedes:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Ver y corregir el apodo o los datos de tu cuenta.</li>
          <li>Cerrar sesión cuando quieras.</li>
          <li>Pedir que borremos tu cuenta y los datos asociados.</li>
          <li>Dejar de usar Google y entrar de otra forma, si lo prefieres.</li>
        </ul>
        <p>
          Para ejercer estos derechos, escribe a{" "}
          <a
            href="mailto:josebenjumea2005@gmail.com"
            className="font-semibold text-[var(--bingo-felt)] underline"
          >
            josebenjumea2005@gmail.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Menores">
        <p>
          El servicio no está pensado para menores de 13 años. No pedimos
          datos extra a menores a propósito. Si detectamos una cuenta de
          alguien por debajo de esa edad, la cerraremos.
        </p>
      </LegalSection>

      <LegalSection title="9. Seguridad">
        <p>
          Protegemos las contraseñas y limitamos qué datos salen en el
          listado de mesas. Ningún sistema es perfecto: usa una contraseña
          distinta a la de otros sitios y no compartas tu sesión.
        </p>
      </LegalSection>

      <LegalSection title="10. Cambios">
        <p>
          Si cambiamos esta política, actualizaremos la fecha del inicio de
          esta página. El uso continuado del sitio implica que aceptas la
          versión publicada.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
