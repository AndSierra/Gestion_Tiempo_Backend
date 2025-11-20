"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.seedDatabase = seedDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ruta a la base de datos
const dbPath = process.env.DB_PATH || path_1.default.join(__dirname, '../database/timetracker.db');
// Asegurar que el directorio existe
const dbDir = path_1.default.dirname(dbPath);
if (!fs_1.default.existsSync(dbDir)) {
    fs_1.default.mkdirSync(dbDir, { recursive: true });
}
// Crear conexión a la base de datos
const db = new better_sqlite3_1.default(dbPath, { verbose: console.log });
// Habilitar foreign keys
db.pragma('foreign_keys = ON');
console.log('🗄️ Base de datos usada:', dbPath);
// Crear las tablas si no existen
function initializeDatabase() {
    console.log('🔧 Inicializando base de datos...');
    // Tabla de usuarios
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'leader', 'developer')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // Tabla de clientes
    db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // Tabla de proyectos
    db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      client_id INTEGER NOT NULL,
      leader_id INTEGER NOT NULL,
      tasks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
    // Tabla de plantillas
    db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      tasks TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // Tabla de registros de tiempo
    db.exec(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      task_name TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      hours REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);
    // Tabla de asignación de desarrolladores a proyectos
    db.exec(`
    CREATE TABLE IF NOT EXISTS project_developers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      developer_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(project_id, developer_id)
    );
  `);
    // Crear índices para mejorar el rendimiento
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
    CREATE INDEX IF NOT EXISTS idx_projects_leader ON projects(leader_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
    CREATE INDEX IF NOT EXISTS idx_project_developers_project ON project_developers(project_id);
    CREATE INDEX IF NOT EXISTS idx_project_developers_developer ON project_developers(developer_id);
  `);
    console.log('✅ Base de datos inicializada correctamente');
}
// Función para insertar datos iniciales
function seedDatabase() {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCount.count > 0) {
        console.log('ℹ️ La base de datos ya tiene datos, saltando seed...');
        return;
    }
    console.log('🌱 Insertando datos iniciales...');
    // ==================== USUARIOS ====================
    const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role) 
    VALUES (?, ?, ?, ?)
  `);
    const adminId = insertUser.run('Admin User', 'admin@timetracker.com', 'admin123', 'admin').lastInsertRowid;
    const leaderId = insertUser.run('Jimena Espinosa', 'jimena@timetracker.com', 'leader123', 'leader').lastInsertRowid;
    const devId = insertUser.run('Harry Cadena', 'harry@timetracker.com', 'dev123', 'developer').lastInsertRowid;
    console.log(`✓ Usuarios creados: Admin (${adminId}), Líder (${leaderId}), Desarrollador (${devId})`);
    // ==================== CLIENTES ====================
    const insertClient = db.prepare(`
    INSERT INTO clients (name, description) 
    VALUES (?, ?)
  `);
    const client1 = insertClient.run('Tech Solutions Inc.', 'Empresa de soluciones tecnológicas').lastInsertRowid;
    const client2 = insertClient.run('Digital Marketing Co.', 'Agencia de marketing digital').lastInsertRowid;
    const client3 = insertClient.run('Finance Corp', 'Servicios financieros corporativos').lastInsertRowid;
    console.log(`✓ Clientes creados: ${client1}, ${client2}, ${client3}`);
    // ==================== PROYECTOS ====================
    const insertProject = db.prepare(`
    INSERT INTO projects (name, client_id, leader_id, tasks) 
    VALUES (?, ?, ?, ?)
  `);
    // Proyectos asignados a Jimena (líder)
    const p1 = insertProject.run('Desarrollo Web Portal', client1, leaderId, 'Frontend,Backend,Testing,Documentación').lastInsertRowid;
    const p2 = insertProject.run('Campaña Digital Q1', client2, leaderId, 'Diseño,Contenido,Análisis,Reportes').lastInsertRowid;
    const p3 = insertProject.run('App Mobile Banking', client3, leaderId, 'UI/UX,Desarrollo,Testing,Deployment').lastInsertRowid;
    const p4 = insertProject.run('Sistema Analítica Finanzas', client3, leaderId, 'Backend,Integraciones,Testing,Optimización').lastInsertRowid;
    const p5 = insertProject.run('Plataforma eCommerce', client1, leaderId, 'UI/UX,Frontend,Backend,Testing,Reportes').lastInsertRowid;
    const p6 = insertProject.run('Portal Soporte Clientes', client1, leaderId, 'Chatbot,Backend,Base de datos,Testing').lastInsertRowid;
    const p7 = insertProject.run('Dashboards Marketing', client2, leaderId, 'Diseño,Contenido,Visualización,Análisis').lastInsertRowid;
    console.log(`✓ Proyectos creados: 7 proyectos asignados a Jimena (líder)`);
    // ==================== ASIGNAR DESARROLLADORES ====================
    const assignDev = db.prepare(`
    INSERT INTO project_developers (project_id, developer_id) 
    VALUES (?, ?)
  `);
    // Asignar Harry a todos los proyectos
    const projects = [p1, p2, p3, p4, p5, p6, p7];
    projects.forEach(projectId => {
        assignDev.run(projectId, devId);
    });
    console.log(`✓ Harry asignado a ${projects.length} proyectos`);
    // ==================== PLANTILLAS ====================
    const insertTemplate = db.prepare(`
    INSERT INTO templates (name, description, tasks) 
    VALUES (?, ?, ?)
  `);
    insertTemplate.run('Proyecto Web Standard', 'Plantilla para proyectos web típicos', 'Frontend,Backend,Testing,Documentación,Deployment');
    insertTemplate.run('Campaña Marketing', 'Plantilla para campañas de marketing', 'Investigación,Diseño,Contenido,Análisis,Reportes');
    insertTemplate.run('Desarrollo Mobile', 'Plantilla para apps móviles', 'UI/UX,Desarrollo iOS,Desarrollo Android,Testing,Publicación');
    insertTemplate.run('Análisis Financiero Avanzado', 'Plantilla para sistemas de análisis financiero y optimización de procesos', 'Backend,Integraciones,Optimización,Testing,Documentación');
    insertTemplate.run('eCommerce Completo', 'Plantilla para plataformas de comercio electrónico con frontend y backend integrados', 'UI/UX,Frontend,Backend,Pasarelas de Pago,Testing,Reportes');
    insertTemplate.run('Portal de Atención al Cliente', 'Plantilla para portales con chatbot y administración de casos de soporte', 'Chatbot,Backend,Base de datos,Integraciones,Testing');
    insertTemplate.run('Marketing Insights', 'Plantilla para dashboards de análisis de campañas de marketing', 'Diseño,Visualización,Extracción de Datos,Análisis,Reportes');
    console.log('✓ 7 plantillas creadas');
    // ==================== REGISTROS DE TIEMPO ====================
    const insertTimeEntry = db.prepare(`
    INSERT INTO time_entries (user_id, project_id, task_name, date, start_time, end_time, hours, description) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
    const today = new Date();
    let entriesCreated = 0;
    // Crear entradas de tiempo para los últimos 15 días
    for (let i = 0; i < 15; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        // Solo crear entradas para días laborables (lunes a viernes)
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6)
            continue; // Saltar fines de semana
        const hours = Math.floor(Math.random() * 5) + 4; // 4-8 horas
        const startHour = 9 + Math.floor(Math.random() * 2); // 9-10 AM
        const endHour = startHour + hours;
        // Entrada para proyecto 1 (Frontend)
        insertTimeEntry.run(devId, p1, 'Frontend', dateStr, `${startHour}:00`, `${endHour}:00`, hours, 'Desarrollo de componentes React');
        // Entrada para proyecto 2 (Diseño)
        insertTimeEntry.run(devId, p2, 'Diseño', dateStr, `${startHour}:00`, `${endHour}:00`, hours, 'Diseño de interfaces');
        entriesCreated += 2;
    }
    console.log(`✓ ${entriesCreated} registros de tiempo creados`);
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  ✅ Datos iniciales insertados correctamente');
    console.log('═══════════════════════════════════════════');
    console.log('  Usuarios de prueba:');
    console.log('  📧 admin@timetracker.com / admin123 (Admin)');
    console.log('  📧 jimena@timetracker.com / leader123 (Líder)');
    console.log('  📧 harry@timetracker.com / dev123 (Desarrollador)');
    console.log('═══════════════════════════════════════════');
    console.log('');
}
exports.default = db;
