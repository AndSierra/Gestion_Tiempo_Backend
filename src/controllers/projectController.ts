import { Request, Response } from 'express';
import db from '../config/database';

export const getAllProjects = (req: Request, res: Response) => {
  try {
    const projects = db.prepare(`
      SELECT p.*, c.name as clientName, u.name as leaderName
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.leader_id = u.id
    `).all();

    // Para cada proyecto, obtener los desarrolladores asignados
    const getDevs = db.prepare(`
      SELECT u.id, u.name, u.email
      FROM project_developers pd
      JOIN users u ON pd.developer_id = u.id
      WHERE pd.project_id = ?
    `);

    const projectsWithDevs = projects.map((project: any) => ({
      ...project,
      developers: getDevs.all(project.id)
    }));

    res.json({ success: true, data: projectsWithDevs });
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener proyectos' });
  }
};

export const getProjectsByLeader = (req: Request, res: Response) => {
  try {
    const { leaderId } = req.params;

    const projects = db.prepare(`
      SELECT p.*, c.name as clientName, u.name as leaderName
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.leader_id = u.id
      WHERE p.leader_id = ?
    `).all(leaderId);

    // Para cada proyecto, obtener los desarrolladores asignados
    const getDevs = db.prepare(`
      SELECT u.id, u.name, u.email, u.role
      FROM project_developers pd
      JOIN users u ON pd.developer_id = u.id
      WHERE pd.project_id = ?
    `);

    const projectsWithDevs = projects.map((project: any) => ({
      ...project,
      developers: getDevs.all(project.id)
    }));

    res.json({ success: true, data: projectsWithDevs });
  } catch (error) {
    console.error('Error obteniendo proyectos del líder:', error);
    res.status(500).json({ success: false, message: 'Error al obtener proyectos' });
  }
};

export const createProject = (req: Request, res: Response) => {
  try {
    const { name, clientId, leaderId, tasks, developerIds } = req.body;

    if (!name || !clientId || !leaderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, cliente y líder son requeridos' 
      });
    }

    // Iniciar transacción
    const insertProject = db.prepare(`
      INSERT INTO projects (name, client_id, leader_id, tasks) 
      VALUES (?, ?, ?, ?)
    `);
    
    const insertDeveloper = db.prepare(`
      INSERT INTO project_developers (project_id, developer_id) 
      VALUES (?, ?)
    `);

    const transaction = db.transaction((projectData: any, devIds: number[]) => {
      const result = insertProject.run(
        projectData.name, 
        projectData.clientId, 
        projectData.leaderId, 
        projectData.tasks || ''
      );
      
      const projectId = result.lastInsertRowid;
      
      // Asignar desarrolladores si se proporcionaron
      if (devIds && Array.isArray(devIds) && devIds.length > 0) {
        for (const devId of devIds) {
          insertDeveloper.run(projectId, devId);
        }
      }
      
      return projectId;
    });

    const projectId = transaction({ name, clientId, leaderId, tasks }, developerIds || []);

    res.status(201).json({ 
      success: true, 
      data: { id: projectId, name, clientId, leaderId, tasks, developerIds },
      message: 'Proyecto creado exitosamente' 
    });
  } catch (error) {
    console.error('Error creando proyecto:', error);
    res.status(500).json({ success: false, message: 'Error al crear proyecto' });
  }
};

export const updateProject = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, clientId, leaderId, tasks, developerIds } = req.body;

    if (!name || !clientId || !leaderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, cliente y líder son requeridos' 
      });
    }

    const updateProjectQuery = db.prepare(`
      UPDATE projects 
      SET name = ?, client_id = ?, leader_id = ?, tasks = ? 
      WHERE id = ?
    `);
    
    const deleteDevelopers = db.prepare(`
      DELETE FROM project_developers WHERE project_id = ?
    `);
    
    const insertDeveloper = db.prepare(`
      INSERT INTO project_developers (project_id, developer_id) 
      VALUES (?, ?)
    `);

    const transaction = db.transaction((projectId: number, projectData: any, devIds: number[]) => {
      const result = updateProjectQuery.run(
        projectData.name, 
        projectData.clientId, 
        projectData.leaderId, 
        projectData.tasks || '', 
        projectId
      );
      
      if (result.changes === 0) {
        throw new Error('Proyecto no encontrado');
      }
      
      // Eliminar asignaciones existentes
      deleteDevelopers.run(projectId);
      
      // Asignar nuevos desarrolladores
      if (devIds && Array.isArray(devIds) && devIds.length > 0) {
        for (const devId of devIds) {
          insertDeveloper.run(projectId, devId);
        }
      }
    });

    transaction(parseInt(id), { name, clientId, leaderId, tasks }, developerIds || []);

    res.json({ success: true, message: 'Proyecto actualizado exitosamente' });
  } catch (error: any) {
    console.error('Error actualizando proyecto:', error);
    if (error.message === 'Proyecto no encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar proyecto' });
  }
};

export const deleteProject = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    res.json({ success: true, message: 'Proyecto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar proyecto' });
  }
};