"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getAllTemplates = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllTemplates = (req, res) => {
    try {
        const templates = database_1.default.prepare('SELECT * FROM templates').all();
        res.json({ success: true, data: templates });
    }
    catch (error) {
        console.error('Error obteniendo plantillas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener plantillas' });
    }
};
exports.getAllTemplates = getAllTemplates;
const createTemplate = (req, res) => {
    try {
        const { name, description, tasks } = req.body;
        if (!name || !tasks) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y tareas son requeridos'
            });
        }
        const result = database_1.default.prepare(`
      INSERT INTO templates (name, description, tasks) 
      VALUES (?, ?, ?)
    `).run(name, description || '', tasks);
        res.status(201).json({
            success: true,
            data: { id: result.lastInsertRowid, name, description, tasks },
            message: 'Plantilla creada exitosamente'
        });
    }
    catch (error) {
        console.error('Error creando plantilla:', error);
        res.status(500).json({ success: false, message: 'Error al crear plantilla' });
    }
};
exports.createTemplate = createTemplate;
const updateTemplate = (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, tasks } = req.body;
        if (!name || !tasks) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y tareas son requeridos'
            });
        }
        const result = database_1.default.prepare(`
      UPDATE templates 
      SET name = ?, description = ?, tasks = ? 
      WHERE id = ?
    `).run(name, description || '', tasks, id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
        }
        res.json({ success: true, message: 'Plantilla actualizada exitosamente' });
    }
    catch (error) {
        console.error('Error actualizando plantilla:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar plantilla' });
    }
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = (req, res) => {
    try {
        const { id } = req.params;
        const result = database_1.default.prepare('DELETE FROM templates WHERE id = ?').run(id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
        }
        res.json({ success: true, message: 'Plantilla eliminada exitosamente' });
    }
    catch (error) {
        console.error('Error eliminando plantilla:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar plantilla' });
    }
};
exports.deleteTemplate = deleteTemplate;
