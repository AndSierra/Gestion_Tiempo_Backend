"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = void 0;
const database_1 = __importDefault(require("../config/database"));
// Login
const login = (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }
        const user = database_1.default.prepare(`
      SELECT id, name, email, role 
      FROM users 
      WHERE email = ? AND password = ?
    `).get(email, password);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        res.json({
            success: true,
            data: user,
            message: 'Login exitoso'
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
exports.login = login;
// Logout (simple, solo para consistencia de API)
const logout = (req, res) => {
    res.json({
        success: true,
        message: 'Logout exitoso'
    });
};
exports.logout = logout;
