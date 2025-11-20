"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
// Importar rutas
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const templateRoutes_1 = __importDefault(require("./routes/templateRoutes"));
const timeEntryRoutes_1 = __importDefault(require("./routes/timeEntryRoutes"));
// Cargar variables de entorno
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middlewares
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Inicializar base de datos
try {
    (0, database_1.initializeDatabase)();
    (0, database_1.seedDatabase)();
}
catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
}
// Rutas de la API
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/clients', clientRoutes_1.default);
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/templates', templateRoutes_1.default);
app.use('/api/time-entries', timeEntryRoutes_1.default);
// Ruta de healthcheck
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'TimeTracker API está funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});
// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: 'TimeTracker API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            clients: '/api/clients',
            projects: '/api/projects',
            templates: '/api/templates',
            timeEntries: '/api/time-entries',
            health: '/api/health'
        }
    });
});
// Manejador de errores 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});
// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  ✅ TimeTracker API Server');
    console.log('═══════════════════════════════════════════');
    console.log(`  🚀 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`  📊 API disponible en: http://localhost:${PORT}/api`);
    console.log(`  🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log('═══════════════════════════════════════════');
    console.log('');
});
exports.default = app;
