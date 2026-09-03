/** OpenAPI 3.0 — Bingonline REST API (prefijo /api). */
const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Bingonline API",
    version: "1.0.0",
    description: `
API REST de **Bingonline**: mesas de bingo en tiempo real (sin dinero real).

- Prefijo: \`/api\`
- Auth: JWT Bearer. La mayoría de acciones aceptan JWT **o** \`user_id\` / \`creator_id\` en el body (compatibilidad).
- Tiempo real: Socket.IO en la misma URL del servidor (\`/socket.io\`). No forma parte de REST; ver README.
- \`join_key\` de mesas privadas **nunca** se envía al cliente salvo al anfitrión.
    `.trim(),
    contact: { email: "josebenjumea2005@gmail.com" },
  },
  servers: [
    { url: "/api", description: "Este servidor" },
    { url: "http://localhost:3000/api", description: "Local" },
    {
      url: "https://bingo-backend-shwj.onrender.com/api",
      description: "Producción (Render)",
    },
  ],
  tags: [
    { name: "Auth", description: "Registro, login, invitado y Google" },
    { name: "Mesas", description: "Crear, listar, configurar e iniciar partidas" },
    { name: "Jugadores", description: "Unirse, salir y roster" },
    { name: "Cartones", description: "Generar, marcar y ver cartones" },
    { name: "Bolas", description: "Números cantados (1–75)" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Header `Authorization: Bearer <token>`. Invitado dura 12 h; cuenta local/Google 1 h.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
          code: { type: "string", example: "BAD_JOIN_KEY" },
        },
        required: ["message"],
      },
      Token: {
        type: "object",
        required: ["token"],
        properties: {
          token: {
            type: "string",
            description: "JWT. Payload: id, nickname, isGuest, provider.",
          },
          isGuest: { type: "boolean" },
        },
      },
      Game: {
        type: "object",
        properties: {
          id: { type: "integer" },
          game_name: { type: "string", maxLength: 80 },
          room_code: {
            type: "string",
            minLength: 6,
            maxLength: 6,
            description: "Código de 6 caracteres para buscar/unirse.",
          },
          game_status: {
            type: "string",
            enum: ["active", "in_progress", "completed"],
            description: "active = espera, in_progress = ronda, completed = hay ganador o cerrada.",
          },
          user_count: { type: "integer" },
          online_count: {
            type: "integer",
            description: "Conectados ahora (solo en listados).",
          },
          creator_id: { type: "integer" },
          game_mode_id: {
            type: "integer",
            minimum: 1,
            maximum: 9,
            description:
              "1 cartón completo, 2–3 diagonales, 4–8 columnas B–O, 9 patrón 5×5.",
          },
          game_time: {
            type: "integer",
            enum: [3, 4, 5, 6],
            description: "Minutos de ronda. El reloj lo marca el servidor (started_at + game_time).",
          },
          is_public: { type: "boolean" },
          has_join_key: { type: "boolean" },
          join_key: {
            type: "string",
            minLength: 4,
            maxLength: 20,
            description: "Solo si eres el anfitrión o acabas de crear/editar la mesa.",
            nullable: true,
          },
          win_pattern: {
            type: "array",
            nullable: true,
            description: "5×5 de booleanos. Solo en modo 9.",
            items: {
              type: "array",
              items: { type: "boolean" },
              minItems: 5,
              maxItems: 5,
            },
            minItems: 5,
            maxItems: 5,
          },
          created_at: { type: "string", format: "date-time", nullable: true },
          started_at: { type: "string", format: "date-time", nullable: true },
          ended_at: { type: "string", format: "date-time", nullable: true },
          winner_id: { type: "integer", nullable: true },
          winner_nickname: { type: "string", nullable: true },
        },
      },
      CreateGame: {
        type: "object",
        required: ["game_name"],
        properties: {
          game_name: { type: "string" },
          creator_id: {
            type: "integer",
            description: "Obligatorio si no hay JWT.",
          },
          game_time: { type: "integer", enum: [3, 4, 5, 6], default: 3 },
          game_mode_id: { type: "integer", minimum: 1, maximum: 9, default: 1 },
          is_public: { type: "boolean", default: true },
          join_key: {
            type: "string",
            description: "Obligatorio si is_public=false (4–20 caracteres).",
          },
          win_pattern: {
            type: "array",
            description: "Obligatorio si game_mode_id=9. Al menos una casilla true.",
            items: { type: "array", items: { type: "boolean" } },
          },
          game_status: { type: "string", enum: ["active"] },
        },
      },
      UpdateGame: {
        type: "object",
        properties: {
          creator_id: { type: "integer" },
          game_name: { type: "string" },
          game_time: { type: "integer", enum: [3, 4, 5, 6] },
          game_mode_id: { type: "integer", minimum: 1, maximum: 9 },
          is_public: { type: "boolean" },
          join_key: { type: "string" },
          win_pattern: {
            type: "array",
            items: { type: "array", items: { type: "boolean" } },
          },
        },
      },
      Winner: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nickname: { type: "string" },
        },
      },
      PlayerSeat: {
        type: "object",
        properties: {
          id: { type: "integer" },
          user_id: { type: "integer" },
          game_id: { type: "integer" },
          is_spectator: {
            type: "boolean",
            description: "true = en cola; juega desde la siguiente ronda.",
          },
          eliminated_at: {
            type: "string",
            format: "date-time",
            nullable: true,
            description: "Bingo falso en el último minuto.",
          },
          bingo_card_id: { type: "integer", nullable: true },
          presence: {
            type: "string",
            enum: ["online", "away", "disconnected"],
          },
          User: {
            type: "object",
            properties: {
              id: { type: "integer" },
              nickname: { type: "string" },
            },
          },
        },
      },
      BingoCard: {
        type: "object",
        properties: {
          id: { type: "integer" },
          user_id: { type: "integer" },
          game_id: { type: "integer" },
          numbers: {
            description:
              "Cartón 5×5. Columnas B 1–15, I 16–30, N 31–45 (centro FREE), G 46–60, O 61–75.",
          },
          marked_numbers: {
            type: "object",
            additionalProperties: { type: "boolean" },
            description: "Mapa de números marcados por el jugador.",
          },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time", nullable: true },
        },
      },
      SpectatorBoard: {
        type: "object",
        properties: {
          userId: { type: "integer" },
          nickname: { type: "string" },
          isHost: { type: "boolean" },
          numbers: {},
          marked: { type: "object" },
        },
      },
      CalledNumber: {
        type: "object",
        properties: {
          id: { type: "integer" },
          game_id: { type: "integer" },
          number_called: { type: "integer", minimum: 1, maximum: 75 },
          called_at: { type: "string", format: "date-time", nullable: true },
        },
      },
    },
    parameters: {
      GameId: {
        name: "id",
        in: "path",
        required: true,
        description: "ID numérico, o en GET /game/:id también room_code o nombre.",
        schema: { type: "string" },
      },
      GameIdOnly: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
      GameIdParam: {
        name: "game_id",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
      CardId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
      UserId: {
        name: "user_id",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
    },
    responses: {
      BadRequest: {
        description: "Petición inválida",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      Unauthorized: {
        description: "No autorizado",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      Forbidden: {
        description: "Prohibido",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      NotFound: {
        description: "No encontrado",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      ServerError: {
        description: "Error interno",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    },
  },
  security: [{ bearerAuth: [] }, {}],
  paths: {
    "/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión (correo + contraseña)",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Token" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/register": {
      post: {
        tags: ["Auth"],
        summary: "Crear cuenta local",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "nickname"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  nickname: { type: "string", minLength: 2, maxLength: 20 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Cuenta creada",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Token" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/auth/guest": {
      post: {
        tags: ["Auth"],
        summary: "Entrar como invitado",
        description: "Crea un usuario `provider=guest` sin correo real. Nickname único.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nickname"],
                properties: {
                  nickname: { type: "string", minLength: 2, maxLength: 20 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Invitado creado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Token" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          503: {
            description: "Base de datos no disponible",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/auth/google": {
      post: {
        tags: ["Auth"],
        summary: "Login con Google (GIS credential)",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["credential"],
                properties: {
                  credential: {
                    type: "string",
                    description: "JWT de Google Identity Services (mismo GOOGLE_CLIENT_ID).",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Token" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/game": {
      get: {
        tags: ["Mesas"],
        summary: "Listar mesas abiertas",
        description:
          "Públicas y privadas en `active` o `in_progress` con `user_count > 0`. Incluye `online_count`. Oculta `join_key`.",
        security: [],
        responses: {
          200: {
            description: "Lista de mesas",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Game" },
                },
              },
            },
          },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
      post: {
        tags: ["Mesas"],
        summary: "Crear mesa",
        description:
          "Genera `room_code` único, sienta al anfitrión (`user_count=1`) y emite `gameCreated`. Si es privada, exige `join_key`.",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateGame" } },
          },
        },
        responses: {
          201: {
            description: "Mesa creada (incluye join_key si aplica)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Game" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/game/search": {
      get: {
        tags: ["Mesas"],
        summary: "Buscar por nombre o código de sala",
        description: "No busca por ID numérico. Máximo 20 resultados.",
        security: [],
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string" },
            example: "K7P2QM",
          },
        ],
        responses: {
          200: {
            description: "Coincidencias",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Game" } },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/game/{id}": {
      get: {
        tags: ["Mesas"],
        summary: "Detalle de una mesa",
        description:
          "`id` puede ser el ID, el `room_code` o el nombre. El anfitrión ve `join_key` si pasa JWT o `?user_id=`.",
        security: [],
        parameters: [
          { $ref: "#/components/parameters/GameId" },
          {
            name: "user_id",
            in: "query",
            schema: { type: "integer" },
            description: "Para recibir join_key si eres el anfitrión.",
          },
        ],
        responses: {
          200: {
            description: "Mesa",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Game" } } },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/games/{id}": {
      put: {
        tags: ["Mesas"],
        summary: "Configurar mesa (solo anfitrión, solo en espera)",
        parameters: [{ $ref: "#/components/parameters/GameIdOnly" }],
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateGame" } },
          },
        },
        responses: {
          200: {
            description: "Actualizada",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Game" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/games/{id}/start": {
      post: {
        tags: ["Mesas"],
        summary: "Iniciar ronda",
        description:
          "Pasa a `in_progress`, promueve espectadores, arranca `ballCaller` (bola cada 5 s) y el cronómetro del servidor.",
        parameters: [{ $ref: "#/components/parameters/GameIdOnly" }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { creator_id: { type: "integer" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Ronda en curso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    game: { $ref: "#/components/schemas/Game" },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/games/{id}/restart": {
      post: {
        tags: ["Mesas"],
        summary: "Nueva ronda o cambiar figura",
        description:
          "Solo si `completed`. `keep_called_numbers=false` limpia bolas y marcas. `true` exige otra figura (mismos números cantados).",
        parameters: [{ $ref: "#/components/parameters/GameIdOnly" }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  creator_id: { type: "integer" },
                  game_mode_id: { type: "integer" },
                  win_pattern: {
                    type: "array",
                    items: { type: "array", items: { type: "boolean" } },
                  },
                  keep_called_numbers: { type: "boolean", default: false },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Ronda reiniciada; emite `gameRestarted`",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    gameId: { type: "integer" },
                    game: { $ref: "#/components/schemas/Game" },
                    resetNumbers: { type: "boolean" },
                    promoted: { type: "array", items: { type: "integer" } },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/games/{id}/claim-win": {
      post: {
        tags: ["Mesas"],
        summary: "Cantar bingo",
        description:
          "El servidor valida la figura contra las bolas cantadas, no contra las marcas del cliente. En el último minuto un bingo falso elimina (`eliminated_at`) y saca del sorteo.",
        parameters: [{ $ref: "#/components/parameters/GameIdOnly" }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  user_id: { type: "integer" },
                  nickname: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Ganador (o ya había uno)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    gameId: { type: "integer" },
                    winner: { $ref: "#/components/schemas/Winner" },
                    game: { $ref: "#/components/schemas/Game" },
                    alreadyFinished: { type: "boolean" },
                  },
                },
              },
            },
          },
          400: {
            description: "Bingo falso (puede incluir `eliminated: true`)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/games/{id}/finalize": {
      patch: {
        tags: ["Mesas"],
        summary: "Cerrar mesa (anfitrión)",
        parameters: [{ $ref: "#/components/parameters/GameIdOnly" }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { creator_id: { type: "integer" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Completada; para bolas y cronómetro",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    game: { $ref: "#/components/schemas/Game" },
                  },
                },
              },
            },
          },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/games/{id}/activate": {
      patch: {
        tags: ["Mesas"],
        summary: "Reactivar mesa (anfitrión)",
        description: "Vuelve a `active`, borra bolas, limpia ganador y eliminaciones.",
        parameters: [{ $ref: "#/components/parameters/GameIdOnly" }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { creator_id: { type: "integer" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "En espera de nuevo",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    game: { $ref: "#/components/schemas/Game" },
                  },
                },
              },
            },
          },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/game/{id}/players": {
      get: {
        tags: ["Jugadores"],
        summary: "Jugadores de la mesa",
        security: [],
        parameters: [{ $ref: "#/components/parameters/GameIdOnly" }],
        responses: {
          200: {
            description: "Roster con presencia",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    players: {
                      type: "array",
                      items: { $ref: "#/components/schemas/PlayerSeat" },
                    },
                  },
                },
              },
            },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/game/{game_id}/join": {
      post: {
        tags: ["Jugadores"],
        summary: "Unirse a una mesa",
        description:
          "Privada: hace falta `join_key` salvo anfitrión o ya miembro. Si la ronda va, entra como espectador (`is_spectator`).",
        parameters: [{ $ref: "#/components/parameters/GameIdParam" }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  user_id: { type: "integer" },
                  join_key: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Unido, ya estaba, o en cola",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    spectator: { type: "boolean" },
                    alreadyJoined: { type: "boolean" },
                    eliminated: { type: "boolean" },
                    game: { $ref: "#/components/schemas/Game" },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          403: {
            description: "Clave incorrecta (`code: BAD_JOIN_KEY`)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/game/{game_id}/leave": {
      post: {
        tags: ["Jugadores"],
        summary: "Salir de la mesa",
        parameters: [{ $ref: "#/components/parameters/GameIdParam" }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { user_id: { type: "integer" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Saliste; emite `playerLeft`",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    game: { $ref: "#/components/schemas/Game" },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/generate-card": {
      post: {
        tags: ["Cartones"],
        summary: "Generar cartón (uno por usuario y mesa)",
        description: "Idempotente. Quien está en cola no recibe cartón hasta la siguiente ronda.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["game_id"],
                properties: {
                  game_id: { type: "integer" },
                  user_id: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Ya existía",
            content: { "application/json": { schema: { $ref: "#/components/schemas/BingoCard" } } },
          },
          201: {
            description: "Creado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/BingoCard" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/cards/{user_id}/{game_id}": {
      get: {
        tags: ["Cartones"],
        summary: "Cartón de un jugador en una mesa",
        security: [],
        parameters: [
          { $ref: "#/components/parameters/UserId" },
          { $ref: "#/components/parameters/GameIdParam" },
        ],
        responses: {
          200: {
            description: "Lista (normalmente 0 o 1)",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/BingoCard" } },
              },
            },
          },
        },
      },
    },
    "/card/{id}": {
      get: {
        tags: ["Cartones"],
        summary: "Cartón por ID",
        security: [],
        parameters: [{ $ref: "#/components/parameters/CardId" }],
        responses: {
          200: {
            description: "Cartón",
            content: { "application/json": { schema: { $ref: "#/components/schemas/BingoCard" } } },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/game/{game_id}/cards": {
      get: {
        tags: ["Cartones"],
        summary: "Cartones de la mesa (solo espectadores)",
        description: "Quien está jugando no puede ver los cartones ajenos.",
        parameters: [
          { $ref: "#/components/parameters/GameIdParam" },
          {
            name: "user_id",
            in: "query",
            schema: { type: "integer" },
            description: "Quién mira (si no hay JWT).",
          },
        ],
        responses: {
          200: {
            description: "Tableros de quienes juegan",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    players: {
                      type: "array",
                      items: { $ref: "#/components/schemas/SpectatorBoard" },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/bingo-cards/{id}": {
      put: {
        tags: ["Cartones"],
        summary: "Regenerar cartón por ID",
        description: "Solo con la mesa en `active` (espera).",
        parameters: [{ $ref: "#/components/parameters/CardId" }],
        responses: {
          200: {
            description: "Nuevos números, marcas vacías",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    card: { $ref: "#/components/schemas/BingoCard" },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/bingo-cards/{user_id}/{game_id}": {
      put: {
        tags: ["Cartones"],
        summary: "Regenerar cartón por usuario y mesa",
        parameters: [
          { $ref: "#/components/parameters/UserId" },
          { $ref: "#/components/parameters/GameIdParam" },
        ],
        responses: {
          200: {
            description: "Regenerado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    card: { $ref: "#/components/schemas/BingoCard" },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/bingo-cards/{user_id}/{game_id}/marks": {
      patch: {
        tags: ["Cartones"],
        summary: "Guardar fichas marcadas",
        parameters: [
          { $ref: "#/components/parameters/UserId" },
          { $ref: "#/components/parameters/GameIdParam" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  marked_numbers: {
                    type: "object",
                    additionalProperties: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Marcas guardadas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    card: { $ref: "#/components/schemas/BingoCard" },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/bingo-card/{id}": {
      delete: {
        tags: ["Cartones"],
        summary: "Borrar cartón por ID",
        description: "Solo en espera.",
        parameters: [{ $ref: "#/components/parameters/CardId" }],
        responses: {
          200: {
            description: "Borrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/bingo-card/user/{user_id}/game/{game_id}": {
      delete: {
        tags: ["Cartones"],
        summary: "Borrar cartón por usuario y mesa",
        parameters: [
          { $ref: "#/components/parameters/UserId" },
          { $ref: "#/components/parameters/GameIdParam" },
        ],
        responses: {
          200: {
            description: "Borrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/called-number/{game_id}": {
      get: {
        tags: ["Bolas"],
        summary: "Historial de bolas cantadas",
        security: [],
        parameters: [{ $ref: "#/components/parameters/GameIdParam" }],
        responses: {
          200: {
            description: "Orden cronológico",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/CalledNumber" } },
              },
            },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      post: {
        tags: ["Bolas"],
        summary: "Cantar la siguiente bola",
        description:
          "Normalmente lo hace el servidor cada 5 s. Este endpoint fuerza la siguiente (1–75, sin repetir).",
        parameters: [{ $ref: "#/components/parameters/GameIdParam" }],
        responses: {
          200: {
            description: "Bola cantada; emite `numberCalled`",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/CalledNumber" } },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
          409: {
            description: "Partida ya terminada o número duplicado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
  },
};

export default openapiSpec;
