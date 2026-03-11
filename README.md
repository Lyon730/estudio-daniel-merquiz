# Estudio Daniel Merquiz — Sitio Web de Barbería

Sitio web completo para la barbería **Estudio Daniel Merquiz**, con sistema de reservas online, galería administrable, catálogo de productos y panel de administración.

## 🌐 Demo en vivo

El sitio está desplegado en Netlify: [estudiodanielmerquiz.netlify.app](https://estudiodanielmerquiz.netlify.app)

---

## ✨ Funcionalidades

### Para clientes
- **Hero con video de fondo** — presentación visual impactante
- **Sección de servicios** — lista de servicios con precios
- **Reservas online** — calendario interactivo con horarios disponibles
- **Galería de trabajos** — carrusel de imágenes con los mejores cortes
- **Catálogo de productos** — carrusel de productos disponibles para compra
- **Contacto y ubicaciones** — mapas interactivos de ambos locales (El Carmen y Chillán)
- **Botón de WhatsApp** — contacto directo con el barbero

### Para el administrador
- **Panel de administración** protegido con contraseña
- **Gestión de horarios** — calendario para configurar los días y horas disponibles
- **Gestión de reservas** — visualizar y administrar citas
- **Galería administrable** — subir y eliminar fotos del carrusel
- **Gestión de productos** — agregar, editar y eliminar productos del catálogo
- **Gestión de servicios** — modificar precios y opciones de servicios

---

## 🗂️ Estructura del proyecto

```
estudio-daniel-merquiz/
├── index.html           # Página principal
├── style.css            # Estilos del sitio
├── script.js            # Lógica principal (Firebase, reservas, galería, admin)
├── config.js            # Configuración del modo de almacenamiento
├── cloudinary-config.js # Configuración e integración de Cloudinary
├── sync-helper.js       # Funciones de sincronización con Firebase
├── assets/
│   ├── Barber-shop-logo.png
│   ├── DanielMerquiz1.png
│   └── video/
│       ├── hero.mp4     # Video de fondo (reemplazar con el real)
│       └── hero.webm    # Versión WebM (opcional)
├── netlify.toml         # Configuración de Netlify
├── _redirects           # Reglas de redirección
└── *.md                 # Documentación de configuración
```

---

## ⚙️ Configuración inicial

### 1. Video de fondo (Hero)

Reemplaza los archivos de video en `assets/video/`:

- `hero.mp4` — H.264, 1080p, sin audio (o con `muted`)
- `hero.webm` — opcional, mejor calidad en navegadores compatibles
- `hero-poster.jpg` — imagen de portada 1920×1080 (se muestra si el video no carga)

**Recomendaciones para el video:**
- Duración: 20–30 segundos en bucle
- Tamaño: < 20 MB para carga rápida
- Bitrate: 6–8 Mbps (H.264)

### 2. Firebase (Base de datos y sincronización)

El sitio usa Firebase Realtime Database para sincronizar reservas e imágenes entre navegadores. La configuración ya está incluida en `script.js`. Para usar tu propio proyecto Firebase:

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Activa **Realtime Database** y **Storage**
3. Reemplaza el objeto `firebaseConfig` en `script.js` con las credenciales de tu proyecto

### 3. Cloudinary (Almacenamiento de imágenes)

Para que las imágenes de la galería sean accesibles globalmente:

1. Crea una cuenta gratuita en [cloudinary.com](https://cloudinary.com)
2. Obtén tu **Cloud Name** desde el Dashboard
3. Crea un Upload Preset llamado `estudio_galeria` (modo *Unsigned*)
4. Actualiza `cloudinary-config.js` con tu Cloud Name

Para más detalles, consulta [`CLOUDINARY_SETUP.md`](CLOUDINARY_SETUP.md).

### 4. Adobe Fonts (Tipografía)

El sitio usa Adobe Fonts para la fuente del título principal. Para configurar la tuya:

1. Crea un Web Kit en [fonts.adobe.com](https://fonts.adobe.com)
2. Reemplaza el Kit ID en la etiqueta `<link>` de `index.html`

Para más detalles, consulta [`ADOBE_FONTS_SETUP.md`](ADOBE_FONTS_SETUP.md).

### 5. Credenciales del panel de administración

Las credenciales del administrador se configuran en `config.js`:

```javascript
admin: {
  credentials: {
    username: 'admin',       // ← Cambia esto
    password: 'tu_clave'     // ← Cambia esto por una contraseña segura
  }
}
```

> ⚠️ **Importante:** Cambia las credenciales predeterminadas antes de poner el sitio en producción.
>
> **Nota de seguridad:** La autenticación del administrador se realiza íntegramente en el lado del cliente (JavaScript). Esto significa que las credenciales son visibles en el código fuente del navegador. Este sistema es adecuado para uso personal con bajo riesgo, pero **no debe usarse para proteger información verdaderamente sensible**. Para un mayor nivel de seguridad se recomienda implementar autenticación del lado del servidor o usar Firebase Authentication.

---

## 🚀 Despliegue en Netlify

El sitio está configurado para Netlify. Solo conecta el repositorio y se desplegará automáticamente en cada push a `main`.

El archivo `netlify.toml` ya contiene la configuración necesaria.

---

## 📋 Modos de almacenamiento

El modo se configura en `config.js` → `storage.mode`:

| Modo | Descripción |
|------|-------------|
| `cloudinary` | Imágenes en CDN global (recomendado para producción) |
| `firebase` | Imágenes en Firebase Storage |
| `local` | Imágenes en `localStorage` del navegador (solo para desarrollo) |
| `auto` | Detecta automáticamente el mejor modo disponible |

---

## 📍 Ubicaciones

- **Estudio El Carmen** — Calle 16 de Julio #752
- **Estudio Chillán** — Volcán Lascar #1274

---

## 📞 Contacto

- **WhatsApp:** +56 9 9677 4738
- **Instagram:** [@estudio.danielmerquiz](https://www.instagram.com/estudio.danielmerquiz)
