// ===== CONFIGURACIÓN DE LA APLICACIÓN =====
// Este archivo contiene todas las configuraciones importantes

const APP_CONFIG = {
  // CONFIGURACIÓN DE ALMACENAMIENTO
  storage: {
    // Cambiar a 'firebase' para usar Firebase Storage
    // Cambiar a 'local' para usar localStorage
    mode: 'firebase', // 'local' | 'firebase'
    
    // Configuración de Firebase
    firebase: {
      // Configuración automática desde firebaseConfig
      enabled: true,
      
      // Configuración específica de Storage
      storageBucket: 'estudio-daniel-merquiz.appspot.com',
      storageFolder: 'galeria', // Carpeta dentro del bucket
      
      // Configuración de Database
      databasePath: 'galeria' // Ruta en Realtime Database
    },
    
    // Configuración local
    local: {
      localStorageKey: 'galeriaImagenes',
      maxImages: 50, // Límite de imágenes en localStorage
      maxSizePerImage: 5 * 1024 * 1024 // 5MB por imagen
    }
  },
  
  // CONFIGURACIÓN DE LA GALERÍA
  gallery: {
    autoplay: true,
    autoplayInterval: 5000, // 5 segundos
    showIndicators: true,
    showControls: true,
    responsive: true
  },
  
  // CONFIGURACIÓN DEL ADMIN
  admin: {
    credentials: {
      username: 'admin',
      password: '1234'
    },
    uploadLimits: {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      maxFilesAtOnce: 10
    }
  },
  
  // CONFIGURACIÓN DE DESARROLLO
  development: {
    enableDebugLogs: true,
    showStorageMode: true,
    enableTestPage: true
  }
};

// ===== FUNCIONES DE CONFIGURACIÓN =====

// Detectar modo automáticamente
function detectStorageMode() {
  // Si está configurado manualmente, respetar la configuración
  const manualMode = APP_CONFIG.storage.mode;
  
  const isLocalDev = window.location.protocol === 'file:' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  const isFirebaseAvailable = typeof firebase !== 'undefined' && 
                              window.database && 
                              window.storage;
  
  // Si está en desarrollo local (file://), forzar localStorage
  if (isLocalDev) {
    console.log('🔧 Modo local detectado - usando localStorage');
    return 'local';
  }
  
  // Si Firebase está disponible y configurado manualmente como firebase
  if (isFirebaseAvailable && manualMode === 'firebase') {
    console.log('☁️ Modo Firebase activado');
    return 'firebase';
  }
  
  // Si Firebase no está disponible pero se configuró como firebase, avisar
  if (manualMode === 'firebase' && !isFirebaseAvailable) {
    console.warn('⚠️ Firebase configurado pero no disponible - usando localStorage');
    return 'local';
  }
  
  // Fallback a la configuración manual o localStorage
  return manualMode === 'firebase' && isFirebaseAvailable ? 'firebase' : 'local';
}

// Obtener configuración actual de storage
function getStorageConfig() {
  const mode = detectStorageMode();
  
  return {
    mode: mode,
    config: APP_CONFIG.storage[mode],
    isFirebase: mode === 'firebase',
    isLocal: mode === 'local'
  };
}

// Log de configuración (para debugging)
function logCurrentConfig() {
  if (!APP_CONFIG.development.enableDebugLogs) return;
  
  const storageConfig = getStorageConfig();
  
  console.group('🔧 Configuración de la Aplicación');
  console.log('📦 Modo de almacenamiento:', storageConfig.mode);
  console.log('🌐 URL actual:', window.location.href);
  console.log('🔥 Firebase disponible:', typeof firebase !== 'undefined');
  console.log('💾 Database disponible:', !!window.database);
  console.log('☁️ Storage disponible:', !!window.storage);
  console.log('⚙️ Configuración:', storageConfig.config);
  console.groupEnd();
}

// Exportar configuración global
window.APP_CONFIG = APP_CONFIG;
window.getStorageConfig = getStorageConfig;
window.detectStorageMode = detectStorageMode;

// Log automático al cargar
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(logCurrentConfig, 1000);
});
