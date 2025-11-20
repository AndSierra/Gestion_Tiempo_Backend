"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
const dbPath = process.env.DB_PATH || path_1.default.join(__dirname, '../../../database/timetracker.db');
console.log('🗑️  Eliminando base de datos...');
if (fs_1.default.existsSync(dbPath)) {
    fs_1.default.unlinkSync(dbPath);
    console.log('✅ Base de datos eliminada');
}
else {
    console.log('ℹ️  No existe base de datos para eliminar');
}
console.log('🔄 Reinicializando base de datos...');
// Importar y ejecutar la inicialización
Promise.resolve().then(() => __importStar(require('../config/database'))).then(({ initializeDatabase, seedDatabase }) => {
    initializeDatabase();
    seedDatabase();
    console.log('✅ Base de datos reseteada exitosamente');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Error reseteando base de datos:', error);
    process.exit(1);
});
