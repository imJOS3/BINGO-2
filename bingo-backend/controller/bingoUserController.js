import { login, register } from "../services/authServices.js";

       
export const RegisterUser =  async (req, res) => {
    try {
        const { email, password, nickname } = req.body;
        const token = await register(email, password, nickname );
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await login(email, password);
        res.status(201).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}