// === FUNCIONES DE SINCRONIZACIÓN MANUAL ===

// Función para forzar sincronización de imágenes actuales con Firebase
async function forzarSincronizacionFirebase() {
  try {
    console.log('🔄 Forzando sincronización con Firebase Database...');
    
    if (!database) {
      throw new Error('Firebase Database no disponible');
    }
    
    // Obtener imágenes actuales del array global
    const imagenesActuales = [...galeriaImagenes];
    console.log('📋 Sincronizando', imagenesActuales.length, 'imágenes');
    
    // Guardar en Firebase Database
    const galeryData = {};
    imagenesActuales.forEach((img, index) => {
      galeryData[`img_${index}`] = img;
    });
    
    await database.ref('galeria').set(galeryData);
    console.log('✅ Sincronización forzada completa');
    
    // Actualizar localStorage también
    localStorage.setItem('galeriaImagenes', JSON.stringify(imagenesActuales));
    console.log('✅ Cache local actualizado');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en sincronización forzada:', error);
    return false;
  }
}

// Exportar función global
window.forzarSincronizacionFirebase = forzarSincronizacionFirebase;
