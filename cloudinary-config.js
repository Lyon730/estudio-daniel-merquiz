// ===== CONFIGURACIÓN DE CLOUDINARY =====

const CLOUDINARY_CONFIG = {
  cloudName: 'dtwdfq2ht', // ← Reemplaza con tu Cloud Name de Cloudinary
  uploadPreset: 'estudio_galeria', // Crearemos este preset
  folder: '', // Deshabilitado temporalmente para testing
  
  // Configuraciones de upload
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  
  // Transformaciones automáticas
  transformations: {
    thumbnail: 'c_fill,w_300,h_200,q_auto',
    gallery: 'c_limit,w_1200,h_800,q_auto',
    admin: 'c_limit,w_400,h_300,q_auto'
  }
};

// ===== FUNCIONES DE CLOUDINARY =====

// Función para subir imagen a Cloudinary
async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    
    // Solo agregar folder si está configurado y el preset lo permite
    if (CLOUDINARY_CONFIG.folder && CLOUDINARY_CONFIG.folder.trim()) {
      formData.append('folder', CLOUDINARY_CONFIG.folder);
    }
    
    // Log para debugging
    console.log('📤 Iniciando subida a Cloudinary:', {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
      folder: CLOUDINARY_CONFIG.folder,
      fileName: file.name,
      fileSize: file.size
    });
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`);
    
    xhr.onload = function() {
      console.log('📥 Respuesta de Cloudinary:', {
        status: xhr.status,
        statusText: xhr.statusText,
        responseText: xhr.responseText.substring(0, 200) + '...'
      });
      
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          id: response.public_id,
          url: response.secure_url,
          thumbnail: response.secure_url.replace('/upload/', `/upload/${CLOUDINARY_CONFIG.transformations.thumbnail}/`),
          gallery: response.secure_url.replace('/upload/', `/upload/${CLOUDINARY_CONFIG.transformations.gallery}/`),
          width: response.width,
          height: response.height,
          format: response.format,
          bytes: response.bytes,
          created_at: response.created_at
        });
      } else {
        let errorDetail = 'Error desconocido';
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          errorDetail = errorResponse.error?.message || errorResponse.message || xhr.responseText;
        } catch (e) {
          errorDetail = xhr.responseText || xhr.statusText;
        }
        reject(new Error(`Error ${xhr.status}: ${errorDetail}`));
      }
    };
    
    xhr.onerror = function() {
      console.error('❌ Error de red al subir a Cloudinary');
      reject(new Error('Network error uploading to Cloudinary'));
    };
    
    xhr.send(formData);
  });
}

// Función para eliminar imagen de Cloudinary
async function deleteFromCloudinary(publicId) {
  // Nota: Eliminación requiere autenticación del servidor
  // Por ahora, solo eliminaremos de la lista local
  console.log('Eliminando imagen:', publicId);
  return true;
}

// Función para obtener URL optimizada
function getOptimizedUrl(originalUrl, transformation = 'gallery') {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }
  
  const transform = CLOUDINARY_CONFIG.transformations[transformation];
  return originalUrl.replace('/upload/', `/upload/${transform}/`);
}

// Verificar configuración
function isCloudinaryConfigured() {
  return CLOUDINARY_CONFIG.cloudName !== 'TU_CLOUD_NAME_AQUI' && 
         CLOUDINARY_CONFIG.cloudName !== '' &&
         CLOUDINARY_CONFIG.uploadPreset !== '';
}

// Función para obtener todas las imágenes de la galería desde Cloudinary
async function getAllCloudinaryImages() {
  try {
    console.log('🌤️ Sincronizando con Cloudinary...');
    
    // Para Cloudinary sin API key, usamos localStorage como fuente de verdad
    // y solo agregamos las imágenes que se suban directamente
    
    // Cargar imágenes guardadas localmente que son de Cloudinary
    const stored = localStorage.getItem('galeriaImagenes');
    if (stored) {
      const allImages = JSON.parse(stored);
      const cloudinaryImages = allImages.filter(img => img.tipo === 'cloudinary');
      console.log('✅ Encontradas', cloudinaryImages.length, 'imágenes de Cloudinary en cache');
      return cloudinaryImages;
    }
    
    console.log('ℹ️ No hay imágenes de Cloudinary en cache local');
    return [];

  } catch (error) {
    console.error('❌ Error obteniendo imágenes de Cloudinary:', error);
    return []; // Retornar array vacío en caso de error
  }
}

// Función para validar la configuración de Cloudinary
function validateCloudinaryConfig() {
  const required = ['cloudName', 'uploadPreset'];
  const missing = required.filter(key => 
    !CLOUDINARY_CONFIG[key] || 
    CLOUDINARY_CONFIG[key] === 'TU_CLOUD_NAME_AQUI' || 
    CLOUDINARY_CONFIG[key] === ''
  );
  
  if (missing.length > 0) {
    console.warn('⚠️ Configuración de Cloudinary incompleta. Faltan:', missing.join(', '));
    return false;
  }
  
  console.log('✅ Configuración de Cloudinary válida');
  return true;
}

// Función para probar la configuración de Cloudinary
async function testCloudinaryConfig() {
  try {
    if (!validateCloudinaryConfig()) {
      return { 
        success: false, 
        error: 'Configuración incompleta',
        details: 'Cloud Name o Upload Preset faltantes'
      };
    }

    // Crear un blob pequeño para probar la subida
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#007bff';
    ctx.fillRect(0, 0, 10, 10);

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        try {
          const formData = new FormData();
          formData.append('file', blob, 'test.png');
          formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
          
          // Solo agregar folder si está configurado
          if (CLOUDINARY_CONFIG.folder && CLOUDINARY_CONFIG.folder.trim()) {
            formData.append('folder', CLOUDINARY_CONFIG.folder);
          }

          console.log('🧪 Test de subida con configuración:', {
            cloudName: CLOUDINARY_CONFIG.cloudName,
            uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
            folder: CLOUDINARY_CONFIG.folder || 'sin carpeta'
          });

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            {
              method: 'POST',
              body: formData
            }
          );

          const responseText = await response.text();
          console.log('🔍 Respuesta completa:', {
            status: response.status,
            statusText: response.statusText,
            response: responseText
          });

          if (response.ok) {
            const result = JSON.parse(responseText);
            resolve({
              success: true,
              message: 'Configuración de Cloudinary correcta',
              url: result.secure_url,
              publicId: result.public_id
            });
          } else {
            let errorDetail = responseText;
            try {
              const errorJson = JSON.parse(responseText);
              errorDetail = errorJson.error?.message || errorJson.message || responseText;
            } catch (e) {
              // Keep original response text
            }
            
            resolve({
              success: false,
              error: `Error ${response.status}`,
              details: errorDetail,
              status: response.status
            });
          }
        } catch (error) {
          resolve({
            success: false,
            error: 'Error de conexión',
            details: error.message
          });
        }
      }, 'image/png');
    });

  } catch (error) {
    return {
      success: false,
      error: 'Error general',
      details: error.message
    };
  }
}

// Exportar configuración
window.CLOUDINARY_CONFIG = CLOUDINARY_CONFIG;
window.uploadToCloudinary = uploadToCloudinary;
window.deleteFromCloudinary = deleteFromCloudinary;
window.getOptimizedUrl = getOptimizedUrl;
window.isCloudinaryConfigured = isCloudinaryConfigured;
window.getAllCloudinaryImages = getAllCloudinaryImages;
window.validateCloudinaryConfig = validateCloudinaryConfig;
window.testCloudinaryConfig = testCloudinaryConfig;
