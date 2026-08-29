import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import User from '../model/Users.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (user, extra = {}) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    const isGuest = user.provider === 'guest' || Boolean(extra.isGuest);
    return jwt.sign(
        {
            id: user.id,
            nickname: user.nickname,
            isGuest,
            provider: user.provider || 'local',
        },
        process.env.JWT_SECRET,
        { expiresIn: isGuest ? '12h' : '1h' }
    );
};

const uniqueDisplayNickname = async (displayName) => {
    const base = String(displayName || 'Invitado').trim().slice(0, 20);
    let attempt = 0;
    while (attempt < 40) {
        const suffix = attempt === 0 ? '' : String(attempt);
        const candidate =
            attempt === 0
                ? base
                : `${base.slice(0, Math.max(2, 20 - suffix.length))}${suffix}`;
        const exists = await User.findOne({ where: { nickname: candidate } });
        if (!exists) return candidate;
        attempt += 1;
    }
    return `Invitado${Date.now().toString().slice(-6)}`;
};

export const loginAsGuest = async (nickname) => {
    const trimmed = String(nickname || '').trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
        const err = new Error('El nombre debe tener entre 2 y 20 caracteres');
        err.statusCode = 400;
        throw err;
    }

    const finalNickname = await uniqueDisplayNickname(trimmed);
    const guestKey = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const user = await User.create({
        email: `${guestKey}@bingo.local`,
        password: null,
        nickname: finalNickname,
        provider: 'guest',
        provider_id: guestKey,
    });

    return signToken(user, { isGuest: true });
};

const sanitizeNickname = (raw) => {
    const cleaned = String(raw || 'jugador')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .slice(0, 16);
    return cleaned.length >= 2 ? cleaned : `user${Date.now().toString().slice(-6)}`;
};

const uniqueNickname = async (baseName) => {
    let nickname = sanitizeNickname(baseName);
    let attempt = 0;
    while (attempt < 20) {
        const candidate = attempt === 0 ? nickname : `${nickname.slice(0, 14)}${attempt}`;
        const exists = await User.findOne({ where: { nickname: candidate } });
        if (!exists) return candidate;
        attempt += 1;
    }
    return `user${Date.now().toString().slice(-8)}`;
};

export const findOrCreateOAuthUser = async ({ provider, providerId, email, name }) => {
    if (!provider || !providerId) {
        throw new Error('Provider data is required');
    }

    let user = await User.findOne({
        where: { provider, provider_id: String(providerId) },
    });

    if (!user && email) {
        user = await User.findOne({ where: { email } });
        if (user) {
            await user.update({
                provider,
                provider_id: String(providerId),
            });
        }
    }

    if (!user) {
        const safeEmail =
            email ||
            `${provider}_${providerId}@bingo.oauth`;
        const nickname = await uniqueNickname(name || provider);

        try {
            user = await User.create({
                email: safeEmail,
                password: null,
                nickname,
                provider,
                provider_id: String(providerId),
            });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                user = await User.findOne({
                    where: { provider, provider_id: String(providerId) },
                });
                if (!user && email) {
                    user = await User.findOne({ where: { email } });
                }
            }
            if (!user) throw error;
        }
    }

    return signToken(user);
};

export const loginWithGoogle = async (idToken) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error('GOOGLE_CLIENT_ID is not configured');
    }
    if (!idToken) {
        throw new Error('Google token is required');
    }

    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub) {
        throw new Error('Invalid Google token');
    }

    return findOrCreateOAuthUser({
        provider: 'google',
        providerId: payload.sub,
        email: payload.email || null,
        name: payload.name || payload.given_name || 'Google',
    });
};

export const loginWithFacebook = async (accessToken) => {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
        throw new Error('Facebook app credentials are not configured');
    }
    if (!accessToken) {
        throw new Error('Facebook token is required');
    }

    const appAccessToken = `${appId}|${appSecret}`;
    const debugUrl = new URL('https://graph.facebook.com/debug_token');
    debugUrl.searchParams.set('input_token', accessToken);
    debugUrl.searchParams.set('access_token', appAccessToken);

    const debugRes = await fetch(debugUrl);
    const debugJson = await debugRes.json();
    const data = debugJson?.data;

    if (!data?.is_valid || String(data.app_id) !== String(appId)) {
        throw new Error('Invalid Facebook token');
    }

    const meUrl = new URL('https://graph.facebook.com/me');
    meUrl.searchParams.set('fields', 'id,name,email');
    meUrl.searchParams.set('access_token', accessToken);

    const meRes = await fetch(meUrl);
    const profile = await meRes.json();

    if (!profile?.id) {
        throw new Error('Could not fetch Facebook profile');
    }

    return findOrCreateOAuthUser({
        provider: 'facebook',
        providerId: profile.id,
        email: profile.email || null,
        name: profile.name || 'Facebook',
    });
};

export const login = async (email, password) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('User not found');

    if (!user.password) {
        const providerLabel =
            user.provider === 'google'
                ? 'Google'
                : user.provider === 'facebook'
                    ? 'Facebook'
                    : 'social';
        throw new Error(`Esta cuenta usa inicio de sesión con ${providerLabel}`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid credentials');

    return signToken(user);
};

export const register = async (email, password, nickname) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        const newUser = await User.create({
            email,
            password: hashedPassword,
            nickname,
            provider: 'local',
            provider_id: null,
        });

        return signToken(newUser);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors?.[0]?.path;
            const err = new Error(
                field === 'nickname'
                    ? 'Nickname already in use'
                    : 'Email already registered'
            );
            err.statusCode = 409;
            throw err;
        }
        throw error;
    }
};
