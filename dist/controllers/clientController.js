"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClientById = exports.getAllClients = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllClients = (req, res) => {
    try {
        const clients = database_1.default.prepare('SELECT * FROM clients').all();
        res.json({ success: true, data: clients });
    }
    catch (error) {
        console.error('Error obteniendo clientes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener clientes' });
    }
};
exports.getAllClients = getAllClients;
const getClientById = (req, res) => {
    try {
        const { id } = req.params;
        const client = database_1.default.prepare('SELECT * FROM clients WHERE id = ?').get(id);
        if (!client) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }
        res.json({ success: true, data: client });
    }
    catch (error) {
        console.error('Error obteniendo cliente:', error);
        res.status(500).json({ success: false, message: 'Error al obtener cliente' });
    }
};
exports.getClientById = getClientById;
const createClient = (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'El nombre es requerido' });
        }
        const result = database_1.default.prepare(`
      INSERT INTO clients (name, description) 
      VALUES (?, ?)
    `).run(name, description || '');
        res.status(201).json({
            success: true,
            data: { id: result.lastInsertRowid, name, description },
            message: 'Cliente creado exitosamente'
        });
    }
    catch (error) {
        console.error('Error creando cliente:', error);
        res.status(500).json({ success: false, message: 'Error al crear cliente' });
    }
};
exports.createClient = createClient;
const updateClient = (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'El nombre es requerido' });
        }
        const result = database_1.default.prepare(`
      UPDATE clients 
      SET name = ?, description = ? 
      WHERE id = ?
    `).run(name, description || '', id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }
        res.json({ success: true, message: 'Cliente actualizado exitosamente' });
    }
    catch (error) {
        console.error('Error actualizando cliente:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar cliente' });
    }
};
exports.updateClient = updateClient;
const deleteClient = (req, res) => {
    try {
        const { id } = req.params;
        const result = database_1.default.prepare('DELETE FROM clients WHERE id = ?').run(id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }
        res.json({ success: true, message: 'Cliente eliminado exitosamente' });
    }
    catch (error) {
        console.error('Error eliminando cliente:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar cliente' });
    }
};
exports.deleteClient = deleteClient;
