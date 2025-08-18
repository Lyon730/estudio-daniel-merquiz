// ===== CONFIGURACIÓN DE LA APLICACIÓN =====
// Este archivo contiene todas las configuraciones importantes

const APP_CONFIG = {
  // CONFIGURACIÓN DE ALMACENAMIENTO
  storage: {
    // Cambiar a 'cloudinary' para usar Cloudinary
    // Cambiar a 'local' para usar localStorage
    // Cambiar a 'firebase' para usar Firebase Storage
    mode: 'cloudinary', // 'local' | 'firebase' | 'cloudinary' | 'auto'
    
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
    },
    
    // Configuración de Cloudinary
    cloudinary: {
      enabled: true,
      folder: 'estudio-daniel-merquiz/galeria',
      uploadPreset: 'estudio_galeria',
      maxImages: 100,
      transformations: {
        thumbnail: 'c_fill,w_300,h_200,q_auto',
        gallery: 'c_limit,w_1200,h_800,q_auto'
      }
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
  
  // Modo manual específico
  if (manualMode === 'local') {
    console.log('🔧 Modo local forzado por configuración');
    return 'local';
  }
  
  if (manualMode === 'firebase') {
    console.log('☁️ Modo Firebase forzado por configuración');
    return 'firebase';
  }
  
  if (manualMode === 'cloudinary') {
    console.log('🌤️ Modo Cloudinary forzado por configuración');
    return 'cloudinary';
  }
  
  // Verificar disponibilidad
  const isCloudinaryAvailable = typeof uploadToCloudinary !== 'undefined' && isCloudinaryConfigured();
  const isFirebaseAvailable = typeof firebase !== 'undefined' && window.database && window.storage;
  
  // Modo automático
  if (manualMode === 'auto') {
    // Preferir Cloudinary si está disponible
    if (isCloudinaryAvailable) {
      console.log('�️ Cloudinary disponible - usando Cloudinary');
      return 'cloudinary';
    }
    
    // Fallback a Firebase si está disponible
    if (isFirebaseAvailable) {
      console.log('☁️ Firebase disponible - usando Firebase Storage');
      return 'firebase';
    }
    
    // Último fallback a localStorage
    console.log('� Fallback a localStorage');
    return 'local';
  }
  
  // Fallback por defecto
  console.log('💾 Fallback a localStorage');
  return 'local';
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
