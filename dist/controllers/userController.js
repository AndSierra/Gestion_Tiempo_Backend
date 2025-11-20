"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const database_1 = __importDefault(require("../config/database"));
// Obtener todos los usuarios
const getAllUsers = (req, res) => {
    try {
        const users = database_1.default.prepare(`
      SELECT id, name, email, role, created_at 
      FROM users
    `).all();
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
};
exports.getAllUsers = getAllUsers;
// Obtener un usuario por ID
const getUserById = (req, res) => {
    try {
        const { id } = req.params;
        const user = database_1.default.prepare(`
      SELECT id, name, email, role, created_at 
      FROM users 
      WHERE id = ?
    `).get(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuario'
        });
    }
};
exports.getUserById = getUserById;
// Crear un usuario
const createUser = (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }
        if (!['admin', 'leader', 'developer'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Rol inválido'
            });
        }
        const result = database_1.default.prepare(`
      INSERT INTO users (name, email, password, role) 
      VALUES (?, ?, ?, ?)
    `).run(name, email, password, role);
        res.status(201).json({
            success: true,
            data: {
                id: result.lastInsertRowid,
                name,
                email,
                role
            },
            message: 'Usuario creado exitosamente'
        });
    }
    catch (error) {
        console.error('Error creando usuario:', error);
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario'
        });
    }
};
exports.createUser = createUser;
// Actualizar un usuario
const updateUser = (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        if (!name || !email || !role) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, email y rol son requeridos'
            });
        }
        const result = database_1.default.prepare(`
      UPDATE users 
      SET name = ?, email = ?, role = ? 
      WHERE id = ?
    `).run(name, email, role, id);
        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });
    }
    catch (error) {
        console.error('Error actualizando usuario:', error);
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario'
        });
    }
};
exports.updateUser = updateUser;
// Eliminar un usuario
const deleteUser = (req, res) => {
    try {
        const { id } = req.params;
        const result = database_1.default.prepare(`
      DELETE FROM users 
      WHERE id = ?
    `).run(id);
        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    }
    catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario'
        });
    }
};
exports.deleteUser = deleteUser;
