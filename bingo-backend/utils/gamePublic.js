const sameId = (a, b) => Number(a) === Number(b);

export const asPublic = (value) =>
    !(value === false || value === "false" || value === 0 || value === "0");

export const normalizeJoinKey = (value) => String(value ?? "").trim();

export const resolveJoinKey = (value) => {
    const key = normalizeJoinKey(value);
    if (key.length < 4 || key.length > 20) {
        const error = new Error("La clave debe tener entre 4 y 20 caracteres");
        error.statusCode = 400;
        throw error;
    }
    return key;
};

export const keysMatch = (stored, provided) =>
    normalizeJoinKey(stored) !== "" &&
    normalizeJoinKey(stored) === normalizeJoinKey(provided);

export const toClientGame = (game, { includeKey = false, viewerId = null } = {}) => {
    if (!game) return game;
    const json = typeof game.get === "function" ? game.get({ plain: true }) : { ...game };
    const isHost = viewerId != null && sameId(json.creator_id, viewerId);
    json.has_join_key = Boolean(json.join_key);
    if (!includeKey && !isHost) {
        delete json.join_key;
    }
    return json;
};
