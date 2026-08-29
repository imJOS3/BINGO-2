import {
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    loginAsGuest,
} from "../services/authServices.js";

export const RegisterUser = async (req, res) => {
    try {
        const { email, password, nickname } = req.body;

        if (!email || !password || !nickname) {
            return res.status(400).json({ message: "No se pudo crear la cuenta" });
        }

        if (typeof email !== "string" || !email.includes("@")) {
            return res.status(400).json({ message: "No se pudo crear la cuenta" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "No se pudo crear la cuenta" });
        }

        if (nickname.length < 2 || nickname.length > 20) {
            return res.status(400).json({ message: "No se pudo crear la cuenta" });
        }

        const token = await register(email.trim(), password, nickname.trim());
        res.status(201).json({ token });
    } catch (error) {
        console.error("Register error:", error.message);
        const status = error.statusCode || 400;
        res.status(status).json({
            message: "No se pudo crear la cuenta",
        });
    }
};

export const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "No se pudo iniciar sesión" });
        }

        const token = await login(email.trim(), password);
        res.status(200).json({ token });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(401).json({ message: "No se pudo iniciar sesión" });
    }
};

export const GuestAuth = async (req, res) => {
    try {
        const { nickname } = req.body;
        if (!nickname || typeof nickname !== "string") {
            return res.status(400).json({ message: "No se pudo entrar como invitado" });
        }
        const token = await loginAsGuest(nickname);
        res.status(201).json({ token, isGuest: true });
    } catch (error) {
        console.error("Guest auth error:", error.message);
        const isDbDown =
            error.name === "SequelizeHostNotFoundError" ||
            error.name === "SequelizeConnectionError" ||
            error.name === "SequelizeConnectionRefusedError" ||
            /ENOTFOUND|ECONNREFUSED|ETIMEDOUT/i.test(error.message || "");

        if (isDbDown) {
            return res.status(503).json({
                message: "No se pudo entrar ahora. Inténtalo más tarde.",
            });
        }

        const status = error.statusCode || 400;
        res.status(status).json({ message: "No se pudo entrar como invitado" });
    }
};

export const GoogleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: "No se pudo iniciar sesión" });
        }
        const token = await loginWithGoogle(credential);
        res.status(200).json({ token });
    } catch (error) {
        console.error("Google auth error:", error.message);
        res.status(400).json({ message: "No se pudo iniciar sesión" });
    }
};

export const FacebookAuth = async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            return res.status(400).json({ message: "No se pudo iniciar sesión" });
        }
        const token = await loginWithFacebook(accessToken);
        res.status(200).json({ token });
    } catch (error) {
        console.error("Facebook auth error:", error.message);
        res.status(400).json({ message: "No se pudo iniciar sesión" });
    }
};
