import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../model/Users.js';

export const login = async (email, password) => {
    const user = await User.findOne({
        where: { email: email }
    });
    if (!user) throw new Error("User not found");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    // Incluir id y nickname en el token
    const token = jwt.sign(
        { id: user.id, nickname: user.nickname }, // Agregar nickname aquí
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    return token;
};

export const register = async (email, password, nickname) => {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = await User.create({
        email,
        password: hashedPassword,
        nickname
    });

    // Incluir id y nickname en el token
    const token = jwt.sign(
        { id: newUser.id, nickname: newUser.nickname }, // Agregar nickname aquí
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    return token;
};
