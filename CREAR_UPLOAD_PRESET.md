# 🎯 SOLUCIÓN INMEDIATA: Crear Upload Preset

## ❌ Problema Actual:
El error 401 (Unauthorized) indica que el **upload preset** `estudio_galeria` **NO EXISTE** en tu cuenta de Cloudinary.

## ✅ Solución (5 minutos):

### 1. 🚪 Entrar a tu cuenta Cloudinary
- Ve a [cloudinary.com](https://cloudinary.com)
- Inicia sesión con tu cuenta

### 2. ⚙️ Ir a configuración de Upload
- En el dashboard, haz clic en el **engranaje** (⚙️) arriba a la derecha
- Selecciona **Upload** del menú lateral

### 3. 📝 Crear el Upload Preset
- Busca la sección **"Upload presets"** (scroll hacia abajo)
- Haz clic en **"Add upload preset"**
- Configura EXACTAMENTE así:

```
Preset name: estudio_galeria
Signing Mode: Unsigned ← ¡IMPORTANTE!
Folder: estudio-daniel-merquiz/galeria
Resource type: Image
Use filename: Yes
Unique filename: No
Overwrite: Yes
```

### 4. 💾 Guardar
- Haz clic en **"Save"**
- Verifica que aparezca `estudio_galeria` en la lista de presets

## 🧪 Verificar funcionamiento:
1. Abre `test-cloudinary.html` en tu navegador
2. Haz clic en **"Verificar Configuración"**
3. Debería mostrar: ✅ Conexión exitosa con Cloudinary!

## 🔧 Tu configuración actual:
```javascript
cloudName: 'dtwdfq2ht' ✅ (correcto)
uploadPreset: 'estudio_galeria' ❌ (no existe aún)
```

## ⚡ Después de crear el preset:
- El panel de administración funcionará inmediatamente
- Las imágenes se subirán automáticamente a Cloudinary
- Serán accesibles desde cualquier dispositivo globalmente

## 📸 Screenshot de referencia:
El upload preset se verá así en tu dashboard:
```
estudio_galeria (unsigned)
├── Folder: estudio-daniel-merquiz/galeria
├── Mode: Unsigned
└── Status: Active
```

## 🆘 Si sigues teniendo problemas:
1. Verifica que el preset esté en modo **"Unsigned"**
2. Verifica que el nombre sea exactamente `estudio_galeria`
3. Prueba con `test-cloudinary.html` antes de usar la aplicación principal

**¡Una vez creado el preset, todo funcionará inmediatamente!** 🚀
