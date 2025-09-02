# Configuración de Adobe Fonts - Fuente "Barber"

## Pasos para configurar la fuente "Barber" de Adobe Fonts:

### 1. Crear cuenta en Adobe Fonts
- Ve a [fonts.adobe.com](https://fonts.adobe.com)
- Inicia sesión con tu Adobe ID (o crea una cuenta gratuita)

### 2. Buscar la fuente "Barber"
- En el buscador, escribe "Barber"
- Selecciona la fuente "Barber" que necesitas
- Haz clic en "Add to Web Project"

### 3. Crear un Web Project
- Dale un nombre a tu proyecto (ej: "Estudio Daniel Merquiz")
- Copia el Kit ID que se genera (ej: "abc1def")

### 4. Actualizar el HTML
En `index.html`, reemplaza `YOUR_KIT_ID` con tu Kit ID real:

```html
<!-- Antes -->
<link rel="stylesheet" href="https://use.typekit.net/YOUR_KIT_ID.css">

<!-- Después (ejemplo) -->
<link rel="stylesheet" href="https://use.typekit.net/abc1def.css">
```

### 5. Verificar el nombre de la fuente
- En Adobe Fonts, verifica el nombre exacto de la fuente
- Si no es "barber", actualiza en `style.css`:

```css
.hero-overlay h1 {
  font-family: 'nombre-correcto-de-fuente', 'Great Vibes', 'Dancing Script', cursive;
  /* resto de estilos... */
}
```

## Nombres comunes de la fuente Barber:
- `'barber'`
- `'Barber'` 
- `'barber-regular'`

## Fallbacks incluidos:
Si Adobe Fonts no carga, se usará automáticamente:
1. 'Great Vibes' (Google Fonts actual)
2. 'Dancing Script' (Google Fonts)
3. cursive (fuente del sistema)

## Resolución de problemas:

### Si no ves el cambio de fuente:

1. **Verificar el Kit ID:**
   - Ve a tu proyecto en Adobe Fonts
   - Copia exactamente el Kit ID (sin espacios extra)
   - Verifica que el enlace funcione: `https://use.typekit.net/TU_KIT_ID.css`

2. **Verificar el nombre de la fuente:**
   - En Adobe Fonts, ve a tu proyecto
   - Busca el nombre exacto bajo "CSS font-family names"
   - Nombres comunes: `barber`, `Barber`, `barber-regular`

3. **Limpiar caché del navegador:**
   - Presiona `Ctrl + F5` (Windows) o `Cmd + Shift + R` (Mac)
   - O abre las herramientas de desarrollador (F12) y recarga

4. **Verificar en la consola del navegador:**
   - Abre F12 → Console
   - Busca errores relacionados con fonts
   - Verifica que aparezca el log de fuentes disponibles

5. **Probar con diferentes nombres:**
   ```css
   font-family: 'barber', 'Barber', 'barber-regular', 'barber-bold', fallbacks...
   ```

## Nota:
Adobe Fonts es gratuito con límites de uso. Para uso comercial intensivo, considera una suscripción Adobe Creative Cloud.
