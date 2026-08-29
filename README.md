# BINGO-2

Bingo en tiempo real para jugar en mesa: crear o unirse a una sala, marcar el cartón y cantar bingo. El proyecto tiene dos apps:

| Carpeta | Qué es |
| --- | --- |
| `bingo-frontend` | Cliente (Preact + Vite + Tailwind + Socket.IO) |
| `bingo-backend` | API REST + WebSockets (Express + Sequelize + MySQL) |

## Qué hay ahora

### Cuentas
- Registro e inicio de sesión con correo y contraseña
- Invitado (guest)
- Google y Facebook (OAuth); hay que poner las claves en `.env`
- JWT en el cliente (`authStore`)

### Salas
- Crear mesa: nombre, código de 6 caracteres, pública o privada, tiempo de ronda, figura ganadora
- Buscar por código o listar mesas públicas
- Sala de espera (`/game/:id`): jugadores, chat, menú del anfitrión
- Editar mesa mientras está en espera
- Cola de espectadores si la ronda ya empezó; entran en la siguiente

### Partida (`/playing/:id`)
- Cartón 5×5 (B-I-N-G-O) a pantalla completa; el centro es FREE
- Las casillas se marcan cuando el número ya salió
- Victoria automática al completar la figura (`bingoWin.js`)
- HUD: nombre de mesa, código, modo, cronómetro, bolas `n/75`
- Tolva de cristal a la derecha: bola actual grande y historial apilado (solo bolas enteras, sin recortes)
- Al **reiniciar de cero** se limpian bolas, marcas del cartón y el tubo
- **Continuar**: mismas bolas, otra figura
- Paneles laterales (como el chat): jugadores, tablero 1–75 y estadísticas, chat
- Toasts de mesa (entrada, salida, bingo)
- El anfitrión puede pasar de ronda o cerrar

### Figuras (modos 1–9)
Cartón completo, diagonales, columnas B/I/N/G/O y patrón personalizado.

### Tiempo real (Socket.IO)
Eventos: `numberCalled`, `gameStarted`, `gameRestarted`, `gameWon`, `gameClosed`, `gameCreated`, `gameUpdated`, `playerJoined`, `playerLeft`, `spectatorsPromoted`, `chatMessage`, `chatHistory`, presencia.

Las bolas salen solas cada **5 segundos** (`services/ballCaller.js`) mientras la ronda está `in_progress`.

### Extra
- Chat por sala (últimos 100 mensajes en memoria)
- Presencia (online / ausente)
- Estadísticas de casino y tablero de 75
- Términos y privacidad en `bingo-frontend/src/pages/` (páginas sueltas)
- Estilo mesa de casino: felt verde, ámbar, bolas 3D

## Rutas del cliente

| Ruta | Pantalla |
| --- | --- |
| `/` | Inicio (entrar, jugar, buscar) |
| `/login` | Login / registro |
| `/games` | Mis mesas / crear |
| `/game` | Buscar mesas |
| `/game/:id` | Espera |
| `/playing/:id` | Partida |

`/playing/` oculta la barra y bloquea el scroll de página para que no se duplique el cartón.

## API (prefijo `/api`)

**Público:** `POST /login`, `/register`, `/auth/guest`, `/auth/google`, `/auth/facebook`

**Mesas:** `GET /game`, `/game/search`, `/game/:id`, `POST /game`, `PUT /games/:id`, `POST .../start`, `.../restart`, `.../claim-win`, `PATCH .../finalize`, `.../activate`

**Jugadores:** `GET /game/:id/players`, `POST .../join`, `.../leave`

**Cartones:** `POST /generate-card`, `GET /cards/:user_id/:game_id`, marcas con `PATCH .../marks`

**Bolas:** `GET|POST /called-number/:game_id`

**Stats:** `GET /stats`

## Base de datos

MySQL (local o Aiven). Tablas: `users`, `game_modes`, `games`, `bingo_cards`, `user_games`, `called_numbers`.

Esquema en `bingo-backend/database/schema.sql`. Al arrancar el backend hace seed de modos y puede limpiar duplicados.

Estados de una mesa: `active` (espera) → `in_progress` → `completed`.

## Cómo correrlo

Hace falta **Node.js** y **MySQL**.

### 1. Backend

```bash
cd bingo-backend
cp .env.example .env
# Completa DB_*, JWT_SECRET y, si usas OAuth, las claves
npm install
npm run dev
```

Queda en `http://localhost:3000`.

Opcional: `npm run db:sync` (`database/sync.js`). `DB_SYNC_ALTER=true` solo si hay que alterar tablas.

### 2. Frontend

```bash
cd bingo-frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

Vite en el puerto **5173**. CORS del backend admite `localhost:5173` y `https://www.bingonline.fun`.

## Variables de entorno

No subas archivos `.env`. Usa `.env.example`.

**Backend:** `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_SSL`, `JWT_SECRET`, `PORT`, `DB_SYNC_ALTER`, `GOOGLE_CLIENT_ID`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`

**Frontend:** `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_FACEBOOK_APP_ID`

## Estructura (lo más usado)

```
bingo-backend/
  controller/     juegos, usuarios, cartones, bolas, stats
  services/       ballCaller, presence, playerRoster, auth
  model/          Sequelize
  database/       schema, seed, migraciones
  socket.js       instancia de Socket.IO
bingo-frontend/
  src/routes/     páginas
  src/components/game/  mesa, cartón, HUD, chat, modales
  store/          Zustand (auth, game, bolas, chat, presencia)
  src/utils/      bingoWin, bingoStats, bingoUtils
```

## Notas para el push

- Este README describe el estado **actual** de la mesa en vivo, OAuth, rondas, cola y UI de partida.
- Los `.env` no van al remoto (están en `.gitignore`).
- `node_modules` y `dist` tampoco.
- Tras clonar: copiar `.env.example`, `npm install` en backend y frontend, y levantar MySQL.
