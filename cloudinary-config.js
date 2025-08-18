// ===== CONFIGURACIÓN DE CLOUDINARY =====

const CLOUDINARY_CONFIG = {
  cloudName: 'dtwdfq2ht', // ← Reemplaza con tu Cloud Name de Cloudinary
  uploadPreset: 'estudio_galeria', // Crearemos este preset
  folder: 'estudio-daniel-merquiz/galeria',
  
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
    formData.append('folder', CLOUDINARY_CONFIG.folder);
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`);
    
    xhr.onload = function() {
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
        reject(new Error('Error uploading to Cloudinary: ' + xhr.statusText));
      }
    };
    
    xhr.onerror = function() {
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
  return CLOUDINARY_CONFIG.cloudName !== 'dtwdfq2ht' && 
         CLOUDINARY_CONFIG.uploadPreset !== '';
}

// Función para obtener todas las imágenes de la galería desde Cloudinary
async function getAllCloudinaryImages() {
  try {
    if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
      throw new Error('Configuración de Cloudinary incompleta');
    }

    // Usar la API de recursos de Cloudinary para obtener todas las imágenes
    // Nota: Esta es una alternativa usando el widget o puede usar la API Admin
    const response = await fetch(
      `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/${CLOUDINARY_CONFIG.folder.replace('/', '_')}.json`
    );

    if (!response.ok) {
      // Si no existe la lista, crear una vacía
      console.log('ℹ️ No existe lista de imágenes en Cloudinary aún');
      return [];
    }

    const data = await response.json();
    
    // Convertir la respuesta a nuestro formato
    const images = (data.resources || []).map(resource => ({
      id: resource.public_id,
      nombre: resource.public_id.split('/').pop(),
      url: resource.secure_url || `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${resource.public_id}`,
      thumbnail: getOptimizedUrl(`https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${resource.public_id}`, 'thumbnail'),
      gallery: getOptimizedUrl(`https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${resource.public_id}`, 'gallery'),
      tamaño: resource.bytes || 0,
      tipo: 'cloudinary',
      fechaSubida: resource.created_at || new Date().toISOString(),
      cloudinary: {
        publicId: resource.public_id,
        format: resource.format || 'jpg',
        width: resource.width || 800,
        height: resource.height || 600,
        bytes: resource.bytes || 0
      }
    }));

    console.log('✅ Obtenidas', images.length, 'imágenes de Cloudinary');
    return images;

  } catch (error) {
    console.error('❌ Error obteniendo imágenes de Cloudinary:', error);
    return []; // Retornar array vacío en caso de error
  }
}

// Función para validar la configuración de Cloudinary
function validateCloudinaryConfig() {
  const required = ['cloudName', 'uploadPreset'];
  const missing = required.filter(key => !CLOUDINARY_CONFIG[key] || CLOUDINARY_CONFIG[key] === 'dtwdfq2ht' || CLOUDINARY_CONFIG[key] === '');
  
  if (missing.length > 0) {
    console.warn('⚠️ Configuración de Cloudinary incompleta. Faltan:', missing.join(', '));
    return false;
  }
  
  console.log('✅ Configuración de Cloudinary válida');
  return true;
}

// Exportar configuración
window.CLOUDINARY_CONFIG = CLOUDINARY_CONFIG;
window.uploadToCloudinary = uploadToCloudinary;
window.deleteFromCloudinary = deleteFromCloudinary;
window.getOptimizedUrl = getOptimizedUrl;
window.isCloudinaryConfigured = isCloudinaryConfigured;
window.getAllCloudinaryImages = getAllCloudinaryImages;
window.validateCloudinaryConfig = validateCloudinaryConfig;
