# 🌤️ Configuración de Cloudinary

## Pasos para configurar Cloudinary:

### 1. Crear cuenta en Cloudinary
- Ve a [cloudinary.com](https://cloudinary.com)
- Regístrate gratuitamente
- Confirma tu email

### 2. Obtener configuración
En tu Dashboard de Cloudinary encontrarás:
- **Cloud Name**: (ej: `dtwdfq2ht`)
- **API Key**: (número largo)//336997674145327
- **API Secret**: (para uso avanzado)//xEZshCZIPFo0shbsk55M9gxYIG4

### 3. Crear Upload Preset
1. Ve a **Settings** → **Upload**
2. Scroll hasta **Upload presets**
3. Crea un nuevo preset:
   - **Preset name**: `estudio_galeria`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `estudio-daniel-merquiz/galeria`
   - **Resource type**: `Image`
   - Guarda el preset

### 4. Actualizar configuración
Edita el archivo `cloudinary-config.js` y actualiza:

```javascript
const CLOUDINARY_CONFIG = {
  cloudName: 'TU_CLOUD_NAME_AQUI', // ← Reemplaza esto
  uploadPreset: 'estudio_galeria',  // ← Ya configurado
  // ... resto de la configuración
};
```

### 5. Verificar funcionamiento
- Abre la página web
- Ve al panel de administración
- Intenta subir una imagen
- Debe aparecer el mensaje "✅ Imagen subida a Cloudinary"

## ✅ Ventajas de Cloudinary:
- ✅ **Global**: Accesible desde cualquier dispositivo
- ✅ **Rápido**: CDN mundial optimizado
- ✅ **Automático**: Optimización de imágenes
- ✅ **Escalable**: Hasta 25GB gratis
- ✅ **Sin CORS**: No hay problemas de permisos

## 🔧 Configuración actual:
- **Modo**: Cloudinary
- **Fallback**: localStorage si falla
- **Límite**: 5MB por imagen
- **Formatos**: JPG, PNG, WebP
- **Transformaciones**: Automáticas para thumbnail y galería

## 📱 Después de configurar:
Las imágenes se subirán automáticamente a Cloudinary y serán accesibles desde:
- Tu computadora
- Otros dispositivos
- Clientes que visiten tu sitio web
- Panel de administración desde cualquier lugar

¿Necesitas ayuda? ¡Avísame cuando tengas tu Cloud Name!
