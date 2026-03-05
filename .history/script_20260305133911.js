// ===== CONFIGURACIÓN DE FIREBASE =====
// IMPORTANTE: Configuración de Firebase para tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyCqix70kqE3MPh_lwz0uolGECT1MerteUU",
  authDomain: "estudio-daniel-merquiz.firebaseapp.com",
  databaseURL: "https://estudio-daniel-merquiz-default-rtdb.firebaseio.com",
  projectId: "estudio-daniel-merquiz",
  storageBucket: "estudio-daniel-merquiz.appspot.com", // Corregido el dominio
  messagingSenderId: "876381250367",
  appId: "1:876381250367:web:90c685ecce6312b362a98a",
  measurementId: "G-LP5VVC2WS7"
};

// Inicializar Firebase
let database, storage;
try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    storage = firebase.storage();
    console.log('🔥 Firebase inicializado correctamente');
    console.log('📊 Firebase config:', {
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      authDomain: firebaseConfig.authDomain
    });
    
    // Test de conectividad
    database.ref('.info/connected').on('value', (snapshot) => {
      if (snapshot.val() === true) {
        console.log('✅ Conectado a Firebase Database');
      } else {
        console.warn('⚠️ Desconectado de Firebase Database');
      }
    });
    
    // Hacer disponible globalmente
    window.database = database;
    window.storage = storage;
    
  } else {
    console.warn('⚠️ Firebase SDK no está disponible, usando modo local');
    database = null;
    storage = null;
  }
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error);
  console.log('🔧 Detalles del error:', {
    message: error.message,
    stack: error.stack,
    config: firebaseConfig
  });
  console.log('🔧 Cambiando a modo local automáticamente');
  database = null;
  storage = null;
}

// Confirmación de reserva y armado de mensaje para WhatsApp
document.getElementById("form-reserva").addEventListener("submit", async function (e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const fechaReserva = document.getElementById("fecha-reserva").value;
  const horaSeleccionada = document.getElementById("hora-seleccionada").value;

  if (!horaSeleccionada) {
    alert("Por favor selecciona una hora disponible.");
    return;
  }

  const fecha = new Date(fechaReserva + 'T00:00:00');
  const fechaFmt = fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Crear clave para la reserva
  const año = fecha.getFullYear();
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  const claveReserva = `${año}-${mes}-${dia}-${horaSeleccionada}`;
  
  // Marcar la hora como ocupada con información del cliente
  reservasOcupadas[claveReserva] = {
    nombre: nombre,
    telefono: telefono,
    fecha: fechaReserva,
    hora: horaSeleccionada,
    fechaReserva: new Date().toISOString(),
    tipo: 'cliente',
    confirmada: false // Se confirmará cuando envíe por WhatsApp
  };
  
  // Guardar en Firebase
  try {
    await guardarReservasEnFirebase();
    console.log('✅ Reserva guardada en Firebase');
  } catch (error) {
    console.error('❌ Error al guardar reserva:', error);
  }
  
  const mensaje = `Hola, soy ${nombre}. Quiero reservar para el ${fechaFmt} a las ${horaSeleccionada}. Mi teléfono: ${telefono}.`;
  const wa = document.getElementById("wa-btn");
  const base = wa.getAttribute("href").split("?")[0];
  wa.setAttribute("href", base + `?text=${encodeURIComponent(mensaje)}`);

  alert("Reserva guardada exitosamente. Presiona el botón verde para confirmar por WhatsApp.");
  
  // Actualizar la vista de horas disponibles
  mostrarHorasDisponibles();
});

// Pausar video cuando la pestaña no está visible
document.addEventListener("visibilitychange", () => {
  const v = document.querySelector(".hero-video");
  if (!v) return;
  if (document.hidden) v.pause();
  else v.play().catch(() => {});
});

// Menú sticky - aparece cuando se hace scroll
window.addEventListener('scroll', () => {
  const stickyNav = document.getElementById('sticky-nav');
  const hero = document.querySelector('.hero');
  
  if (!stickyNav || !hero) return;
  
  const heroHeight = hero.offsetHeight;
  const scrollY = window.scrollY;
  
  if (scrollY > heroHeight - 100) {
    stickyNav.classList.add('show');
  } else {
    stickyNav.classList.remove('show');
  }
});

// Scroll suave para los enlaces del menú
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop = target.offsetTop - (document.querySelector('.sticky-nav.show') ? 80 : 0);
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// --- INICIO DE SESIÓN ADMIN ---

// Función para mostrar el panel de administración
function showAdminPanel() {
  // Ocultar el contenido principal
  document.querySelector('header').style.display = 'none';
  document.querySelector('main').style.display = 'none';
  document.querySelector('footer').style.display = 'none';
  document.querySelector('.sticky-nav').style.display = 'none';
  const adminPanel = document.getElementById('admin-panel');
  if (adminPanel) {
    adminPanel.style.display = 'block';
  }
  const raf = () => new Promise(r => requestAnimationFrame(r));
  (async () => {
    // Esperar a que el panel se pinte (2 frames)
    await raf();
    await raf();
    // Verificar estado Firebase automáticamente
    diagnosticarFirebase();
    // Render inmediato del calendario (no bloquear por Firebase)
    console.log('🗓️ Render inmediato calendario (antes de datos)');
    inicializarCalendario();
    // Cargar datos en paralelo y luego refrescar
    inicializarDatos()
      .then(() => {
        console.log('✅ Datos listos (async), refrescando calendario');
        mostrarCalendario(fechaActual.getFullYear(), fechaActual.getMonth());
        // Si reservas tab activo tras carga, refrescar
        const reservasTab = document.getElementById('reservas-tab');
        if (reservasTab && reservasTab.style.display !== 'none') {
          mostrarReservasDisponibles();
        }
      })
      .catch(err => console.error('❌ Error inicializarDatos async:', err));
    // Fallback: si no se generó ningún día, reintentar
    setTimeout(() => {
      if (!document.querySelector('#calendar-days .calendar-day')) {
        console.log('♻️ Re-render calendario (fallback)');
        mostrarCalendario(fechaActual.getFullYear(), fechaActual.getMonth());
      }
    }, 300);
  })();
}

// ===== DIAGNÓSTICO FIREBASE =====
function actualizarEstadoFirebase(ok, mensaje) {
  const dot = document.getElementById('fb-status-dot');
  const txt = document.getElementById('fb-status-text');
  if (!dot || !txt) return;
  dot.className = 'fb-dot ' + (ok === null ? 'fb-dot-checking' : ok ? 'fb-dot-ok' : 'fb-dot-err');
  txt.textContent = mensaje;
}

async function diagnosticarFirebase() {
  const resultDiv = document.getElementById('fb-diag-result');
  if (!resultDiv) return;
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = '<p>⏳ Ejecutando diagnóstico...</p>';
  actualizarEstadoFirebase(null, 'Diagnosticando...');

  const lines = [];

  // 1. SDK cargado
  if (typeof firebase === 'undefined') {
    lines.push('❌ <strong>Firebase SDK no cargado.</strong> Verifica que los scripts de Firebase estén en el &lt;head&gt;.');
    resultDiv.innerHTML = lines.join('<br>');
    actualizarEstadoFirebase(false, 'Firebase SDK no disponible');
    return;
  }
  lines.push('✅ Firebase SDK cargado correctamente.');

  // 2. Base de datos inicializada
  if (!database) {
    lines.push('❌ <strong>database es null.</strong> La llamada a firebase.initializeApp() falló. Revisa la consola del navegador por errores al cargar.');
    resultDiv.innerHTML = lines.join('<br>');
    actualizarEstadoFirebase(false, 'Database no inicializado');
    return;
  }
  lines.push('✅ database inicializado.');

  // 3. Test de conexión (nodo .info/connected)
  try {
    const connSnap = await database.ref('.info/connected').once('value');
    const connected = connSnap.val();
    if (connected) {
      lines.push('✅ Conexión activa con Firebase Realtime Database.');
    } else {
      lines.push('⚠️ Firebase inicializado pero <strong>sin conexión activa</strong> en este momento (posible problema de red o la DB está pausada).');
    }
  } catch (e) {
    lines.push('❌ Error leyendo .info/connected: ' + e.message);
  }

  // 4. Test de LECTURA
  try {
    await database.ref('_diag_test').once('value');
    lines.push('✅ Lectura permitida.');
  } catch (e) {
    lines.push('❌ <strong>Lectura bloqueada.</strong> Código: <code>' + e.code + '</code> — ' + e.message);
  }

  // 5. Test de ESCRITURA
  const currentUser = firebase.auth ? firebase.auth().currentUser : null;
  try {
    await database.ref('_diag_test').set({ ts: Date.now() });
    lines.push('✅ Escritura permitida.');
    // Limpiar el nodo de prueba
    await database.ref('_diag_test').remove();
  } catch (e) {
    if (e.code === 'PERMISSION_DENIED' && !currentUser) {
      lines.push('✅ <strong>Escritura restringida a usuarios autenticados</strong> (seguridad activa y correcta ✔️).');
      lines.push('<small style="color:#8fc98f;">Las reglas requieren autenticación para escribir. Esto es correcto.</small>');
    } else if (e.code === 'PERMISSION_DENIED' && currentUser) {
      lines.push('❌ <strong>Escritura bloqueada</strong> a pesar de estar autenticado. Código: <code>' + e.code + '</code>');
      lines.push('🔧 Verifica que las reglas de Realtime Database sean:');
      lines.push('<pre style="background:#1c1c1c;padding:10px;border-radius:6px;margin-top:6px;font-size:0.82rem;overflow:auto;">{\n  "rules": {\n    ".read": true,\n    ".write": "auth != null"\n  }\n}</pre>');
    } else {
      lines.push('❌ <strong>Escritura bloqueada.</strong> Código: <code>' + e.code + '</code> — ' + e.message);
    }
  }

  const allOk = !lines.some(l => l.startsWith('❌'));
  actualizarEstadoFirebase(allOk, allOk ? 'Firebase conectado y operativo ✅' : 'Hay problemas con Firebase — revisa el diagnóstico');
  resultDiv.innerHTML = lines.join('<br>');
}

// Función para cerrar sesión de admin
function logoutAdmin() {
  // Cerrar sesión en Firebase Auth
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().signOut().catch(err => console.error('Error al cerrar sesión:', err));
  }
  // Mostrar el contenido principal
  document.querySelector('header').style.display = 'block';
  document.querySelector('main').style.display = 'block';
  document.querySelector('footer').style.display = 'block';
  document.querySelector('.sticky-nav').style.display = 'block';
  // Ocultar el panel de administración
  const adminPanel = document.getElementById('admin-panel');
  if (adminPanel) {
    adminPanel.style.display = 'none';
  }
  // Limpiar formulario de login
  document.getElementById("admin-user").value = '';
  document.getElementById("admin-pass").value = '';
  document.getElementById("login-error").style.display = "none";
  // NUEVO: limpiar formulario de reservas de la vista cliente
  const nombreInput = document.getElementById('nombre');
  const telefonoInput = document.getElementById('telefono');
  const fechaReservaInput = document.getElementById('fecha-reserva');
  const horaSelInput = document.getElementById('hora-seleccionada');
  const gridHoras = document.getElementById('horas-disponibles-grid');
  const contHoras = document.getElementById('horas-disponibles-container');
  const btnReservar = document.getElementById('btn-reservar');
  if (nombreInput) nombreInput.value = '';
  if (telefonoInput) telefonoInput.value = '';
  if (fechaReservaInput) fechaReservaInput.value = '';
  if (horaSelInput) horaSelInput.value = '';
  if (gridHoras) gridHoras.innerHTML = '';
  if (contHoras) contHoras.style.display = 'none';
  if (btnReservar) btnReservar.disabled = true;
}

// Función para cambiar pestañas en el panel de admin
function showAdminTab(tabName) {
  // Ocultar todas las pestañas
  document.querySelectorAll('.admin-tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Remover clase activa de todos los botones
  document.querySelectorAll('.admin-tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Mostrar la pestaña seleccionada
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }
  
  // Activar el botón correspondiente
  const selectedButton = document.querySelector(`[onclick="showAdminTab('${tabName}')"]`);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }
  
  // Si se selecciona la pestaña de horas, inicializar el calendario
  if (tabName === 'horas-tab') {
    inicializarCalendario();
  }
  
  // Si se selecciona la pestaña de reservas, mostrar las reservas disponibles
  if (tabName === 'reservas-tab') {
    if (!datosListos) {
      const cont = document.getElementById('dias-disponibles');
      if (cont) {
        cont.innerHTML = '<div class="no-horarios"><p>⏳ Cargando datos...</p></div>';
      }
    } else {
      mostrarReservasDisponibles();
    }
  }
  
  // Si se selecciona la pestaña de galería, mostrar imágenes
  if (tabName === 'galeria-tab') {
    if (!datosListos) {
      const grid = document.getElementById('admin-images-grid');
      if (grid) {
        grid.innerHTML = '<div class="no-images"><p>⏳ Cargando datos...</p></div>';
      }
    } else {
      mostrarImagenesAdmin();
    }
  }
  
  // Si se selecciona la pestaña de servicios, renderizar
  if (tabName === 'servicios-tab') {
    renderServiciosAdmin();
  }
}

// === VARIABLES GLOBALES (declaradas temprano para evitar TDZ) ===
let fechaActual = new Date();
let horariosGuardados = {}; // horarios por fecha
let reservasOcupadas = {}; // reservas por slot
let datosListos = false; // nuevo flag
let galeriaImagenes = []; // Array para almacenar imágenes de la galería
let productosDisponibles = []; // Array para almacenar productos de la barbería
let editingProductId = null;
let serviciosData = []; // Datos de los servicios (cargados dinámicamente)

// ===== FUNCIONES DE PRODUCTOS =====

// Inicializar productos
function initProductos() {
  // Cargar productos desde localStorage o Firebase
  loadProductos();
  
  // Configurar listeners del carrusel
  setupProductosCarouselListeners();
  
  // Event listeners para formulario de productos
  const productoForm = document.getElementById('producto-form');
  const productoImagenInput = document.getElementById('producto-imagen-input');
  const productoUploadArea = document.getElementById('producto-upload-area');
  
  if (productoForm) {
    productoForm.addEventListener('submit', handleProductoSubmit);
  }
  
  if (productoImagenInput) {
    productoImagenInput.addEventListener('change', handleProductoImageSelect);
  }
  
  if (productoUploadArea) {
    productoUploadArea.addEventListener('click', () => productoImagenInput.click());
    
    // Drag and drop para imágenes de productos
    productoUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      productoUploadArea.classList.add('drag-over');
    });
    
    productoUploadArea.addEventListener('dragleave', () => {
      productoUploadArea.classList.remove('drag-over');
    });
    
    productoUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      productoUploadArea.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        productoImagenInput.files = files;
        handleProductoImageSelect();
      }
    });
  }
}

// Manejar selección de imagen del producto
function handleProductoImageSelect() {
  const input = document.getElementById('producto-imagen-input');
  const preview = document.getElementById('imagen-preview');
  const previewImg = document.getElementById('preview-img');
  
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Validar tamaño (2MB máximo)
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 2MB permitido.');
      input.value = '';
      return;
    }
    
    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = function(e) {
      previewImg.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

// Remover vista previa de imagen
function removeImagePreview() {
  const input = document.getElementById('producto-imagen-input');
  const preview = document.getElementById('imagen-preview');
  
  input.value = '';
  preview.style.display = 'none';
}

// Manejar envío del formulario de producto
async function handleProductoSubmit(e) {
  e.preventDefault();
  
  const nombre = document.getElementById('producto-nombre').value.trim();
  const precio = parseFloat(document.getElementById('producto-precio').value);
  const descripcion = document.getElementById('producto-descripcion').value.trim();
  const imagenInput = document.getElementById('producto-imagen-input');
  
  if (!nombre || !precio || !descripcion) {
    alert('Por favor completa todos los campos obligatorios.');
    return;
  }
  
  try {
    let imagenUrl = null;
    
    // Si hay imagen, subirla
    if (imagenInput.files && imagenInput.files[0]) {
      imagenUrl = await uploadProductoImage(imagenInput.files[0]);
    }
    
    const producto = {
      id: editingProductId || Date.now().toString(),
      nombre,
      precio,
      descripcion,
      imagen: imagenUrl,
      fechaCreacion: editingProductId ? 
        productosDisponibles.find(p => p.id === editingProductId)?.fechaCreacion : 
        new Date().toISOString()
    };
    
    if (editingProductId) {
      // Editar producto existente
      const index = productosDisponibles.findIndex(p => p.id === editingProductId);
      productosDisponibles[index] = producto;
    } else {
      // Agregar nuevo producto
      productosDisponibles.push(producto);
    }
    
    // Guardar en localStorage y Firebase
    await saveProductos();
    
    // Actualizar UI
    updateProductosUI();
    updateProductosSection();
    
    // Limpiar formulario
    resetProductoForm();
    
    alert(editingProductId ? 'Producto actualizado exitosamente' : 'Producto agregado exitosamente');
    
  } catch (error) {
    console.error('Error al guardar producto:', error);
    alert('Error al guardar el producto. Por favor intenta de nuevo.');
  }
}

// Subir imagen de producto
async function uploadProductoImage(file) {
  // Si Cloudinary está disponible, usarlo
  if (typeof cloudinary !== 'undefined' && cloudinary.config) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'productos_preset'); // Preset específico para productos
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.warn('Error con Cloudinary, usando almacenamiento local:', error);
    }
  }
  
  // Fallback a localStorage
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// ===== SERVICIOS =====
const DEFAULT_SERVICIOS = [
  {
    id: 'nino',
    titulo: 'Corte Niño',
    icono: '👦',
    grupos: [
      {
        id: 'nino-clasico',
        nombre: 'Clásico',
        opciones: [
          { id: 'nino-clasico-1', nombre: 'Clásico', precio: 6000 }
        ]
      },
      {
        id: 'nino-degradado',
        nombre: 'Degradado',
        opciones: [
          { id: 'nino-degradado-1', nombre: 'Degradado', precio: 7000 }
        ]
      }
    ]
  },
  {
    id: 'adolescente',
    titulo: 'Corte Adolescente',
    icono: '🧑',
    grupos: [
      {
        id: 'adol-clasico',
        nombre: 'Clásico',
        opciones: [
          { id: 'adol-clasico-1', nombre: 'Clásico', precio: 6000 },
          { id: 'adol-clasico-2', nombre: 'Clásico + Cejas', precio: 7000 }
        ]
      },
      {
        id: 'adol-degradado',
        nombre: 'Degradado',
        opciones: [
          { id: 'adol-degradado-1', nombre: 'Degradado', precio: 7000 },
          { id: 'adol-degradado-2', nombre: 'Degradado + Cejas', precio: 8000 }
        ]
      }
    ]
  },
  {
    id: 'adulto',
    titulo: 'Corte Adulto',
    icono: '👨',
    grupos: [
      {
        id: 'adulto-clasico',
        nombre: 'Clásico',
        opciones: [
          { id: 'adulto-clasico-1', nombre: 'Clásico', precio: 6000 },
          { id: 'adulto-clasico-2', nombre: 'Clásico + Cejas', precio: 7000 },
          { id: 'adulto-clasico-3', nombre: 'Clásico + Barba', precio: 8000 },
          { id: 'adulto-clasico-4', nombre: 'Clásico + Barba y Ceja', precio: 9000 }
        ]
      },
      {
        id: 'adulto-degradado',
        nombre: 'Degradado',
        opciones: [
          { id: 'adulto-degradado-1', nombre: 'Degradado', precio: 7000 },
          { id: 'adulto-degradado-2', nombre: 'Degradado + Cejas', precio: 8000 },
          { id: 'adulto-degradado-3', nombre: 'Degradado + Barba', precio: 9000 },
          { id: 'adulto-degradado-4', nombre: 'Degradado + Barba y Ceja', precio: 10000 }
        ]
      }
    ]
  }
];

function loadServicios() {
  try {
    const stored = localStorage.getItem('serviciosData');
    if (stored) {
      serviciosData = JSON.parse(stored);
    } else {
      serviciosData = JSON.parse(JSON.stringify(DEFAULT_SERVICIOS));
    }
    if (database) {
      database.ref('servicios_json').on('value', (snapshot) => {
        const raw = snapshot.val();
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            // Validar que sea un array
            if (Array.isArray(parsed) && parsed.length > 0) {
              serviciosData = parsed;
              localStorage.setItem('serviciosData', JSON.stringify(serviciosData));
              renderServiciosPublic();
              // Solo renderizar admin si el panel está visible
              const tab = document.getElementById('servicios-tab');
              if (tab && tab.style.display !== 'none') renderServiciosAdmin();
            }
          } catch (parseErr) {
            console.error('Error parseando servicios de Firebase:', parseErr);
          }
        }
      });
    }
  } catch (e) {
    console.error('Error cargando servicios:', e);
    serviciosData = JSON.parse(JSON.stringify(DEFAULT_SERVICIOS));
  }
  renderServiciosPublic();
}

async function saveServicios() {
  // Guardar como string JSON para evitar que Firebase convierta arrays a objetos
  const jsonStr = JSON.stringify(serviciosData);
  localStorage.setItem('serviciosData', jsonStr);
  if (database) {
    try {
      await database.ref('servicios_json').set(jsonStr);
    } catch (e) {
      console.warn('Error guardando servicios en Firebase:', e);
      throw e; // Re-lanzar para que guardarCambiosServicios muestre el error
    }
  }
}

function renderServiciosPublic() {
  const grid = document.getElementById('servicios-grid');
  if (!grid) return;
  grid.innerHTML = '';
  serviciosData.forEach(servicio => {
    const card = document.createElement('div');
    card.className = 'servicio-card';
    const gruposHTML = servicio.grupos.map(grupo => {
      const opcionesHTML = grupo.opciones.map(op => `
        <div class="servicio-opcion servicio-opcion-clickable"
             onclick="seleccionarServicioYReservar('${op.nombre.replace(/'/g,"\\'")}')">
          <span class="servicio-opcion-nombre">${op.nombre}</span>
          <span class="servicio-opcion-precio">${formatearPrecio(op.precio)}</span>
          <span class="servicio-opcion-reservar-hint">Reservar →</span>
        </div>
      `).join('');
      return `
        <div class="servicio-grupo">
          <div class="servicio-grupo-titulo">${grupo.nombre}</div>
          ${opcionesHTML}
        </div>
      `;
    }).join('');
    card.innerHTML = `
      <div class="servicio-card-header">
        <span class="servicio-card-icono">${servicio.icono}</span>
        <h3>${servicio.titulo}</h3>
      </div>
      <div class="servicio-card-body">
        ${gruposHTML}
      </div>
    `;
    grid.appendChild(card);
  });
}

// ===== LÓGICA: SELECCIONAR SERVICIO Y ABRIR RESERVAS =====
function tieneDisponibilidad() {
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  for (const claveFecha of Object.keys(horariosGuardados)) {
    const [a, m, d] = claveFecha.split('-').map(Number);
    const fecha = new Date(a, m - 1, d);
    if (fecha < hoy) continue;
    const horarios = horariosGuardados[claveFecha];
    // Revisar turno mañana
    if (horarios.mañana && horarios.mañana.inicio && horarios.mañana.fin) {
      const slots = generarSlotsParaCliente(horarios.mañana, claveFecha);
      if (slots.some(s => !s.ocupado)) return true;
    }
    // Revisar turno tarde
    if (horarios.tarde && horarios.tarde.inicio && horarios.tarde.fin) {
      const slots = generarSlotsParaCliente(horarios.tarde, claveFecha);
      if (slots.some(s => !s.ocupado)) return true;
    }
  }
  return false;
}

function seleccionarServicioYReservar(nombreServicio) {
  if (!tieneDisponibilidad()) {
    // Mostrar modal de sin disponibilidad
    const modal = document.getElementById('no-disponibilidad-modal');
    const txt = document.getElementById('no-disp-servicio');
    if (txt) txt.textContent = '✂️ ' + nombreServicio;
    if (modal) modal.style.display = 'flex';
    return;
  }
  // Mostrar badge del servicio en el formulario de reservas
  const badge = document.getElementById('servicio-seleccionado-badge');
  const badgeTxt = document.getElementById('servicio-badge-texto');
  if (badge && badgeTxt) {
    badgeTxt.textContent = '✂️ ' + nombreServicio;
    badge.style.display = 'flex';
  }
  // Actualizar mensaje de WhatsApp con el servicio
  const waBtn = document.getElementById('wa-btn');
  if (waBtn) {
    waBtn.setAttribute('href', `https://wa.me/56996774738?text=${encodeURIComponent('Hola, quiero reservar un ' + nombreServicio)}`);
  }
  // Scroll suave a la sección de reservas
  const reservasSection = document.getElementById('reservas');
  if (reservasSection) {
    const offset = reservasSection.offsetTop - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}

function limpiarServicioSeleccionado() {
  const badge = document.getElementById('servicio-seleccionado-badge');
  if (badge) badge.style.display = 'none';
  const waBtn = document.getElementById('wa-btn');
  if (waBtn) waBtn.setAttribute('href', 'https://wa.me/56996774738');
}

function renderServiciosAdmin() {
  const cont = document.getElementById('servicios-admin-container');
  if (!cont) return;
  cont.innerHTML = '';

  // Botón guardar + mensaje de feedback al inicio
  const saveBar = document.createElement('div');
  saveBar.className = 'sa-save-bar';
  saveBar.innerHTML = `
    <span class="sa-save-hint">✏️ Edita los precios y presiona <strong>Guardar</strong> para aplicar los cambios en todos los dispositivos.</span>
    <button class="sa-btn-guardar" onclick="guardarCambiosServicios()">💾 Guardar Cambios</button>
  `;
  cont.appendChild(saveBar);

  const feedback = document.createElement('div');
  feedback.id = 'sa-feedback';
  feedback.className = 'sa-feedback';
  feedback.style.display = 'none';
  cont.appendChild(feedback);

  serviciosData.forEach((servicio, sIdx) => {
    const sDiv = document.createElement('div');
    sDiv.className = 'servicios-admin-card';
    const headerDiv = document.createElement('div');
    headerDiv.className = 'servicios-admin-card-header';
    headerDiv.innerHTML = `<span>${servicio.icono}</span><h3>${servicio.titulo}</h3>`;
    sDiv.appendChild(headerDiv);
    servicio.grupos.forEach((grupo, gIdx) => {
      const gDiv = document.createElement('div');
      gDiv.className = 'servicios-admin-grupo';
      const opcionesHTML = grupo.opciones.map((op, oIdx) => `
        <div class="servicios-admin-opcion">
          <span class="sa-opcion-nombre">${op.nombre}</span>
          <input type="number" class="sa-precio-input"
            data-sidx="${sIdx}" data-gidx="${gIdx}" data-oidx="${oIdx}"
            value="${op.precio}" min="0" step="100"
            oninput="updateServicioPrecio(${sIdx}, ${gIdx}, ${oIdx}, this.value)" />
          <button class="sa-btn-del" onclick="deleteServicioOpcion(${sIdx}, ${gIdx}, ${oIdx})">✕</button>
        </div>
      `).join('');
      gDiv.innerHTML = `
        <div class="servicios-admin-grupo-titulo">${grupo.nombre}</div>
        ${opcionesHTML}
        <div class="sa-add-opcion">
          <input type="text" id="sa-new-nombre-${sIdx}-${gIdx}" placeholder="Nombre de la opción" class="sa-input-text" />
          <input type="number" id="sa-new-precio-${sIdx}-${gIdx}" placeholder="Precio" min="0" step="100" class="sa-input-precio" />
          <button class="sa-btn-add" onclick="addServicioOpcion(${sIdx}, ${gIdx})">+ Agregar</button>
        </div>
      `;
      sDiv.appendChild(gDiv);
    });
    cont.appendChild(sDiv);
  });
}

function updateServicioPrecio(sIdx, gIdx, oIdx, valor) {
  // Solo actualiza en memoria; el botón Guardar sincroniza con Firebase
  serviciosData[sIdx].grupos[gIdx].opciones[oIdx].precio = parseInt(valor, 10) || 0;
  renderServiciosPublic();
}

async function guardarCambiosServicios() {
  const btn = document.querySelector('.sa-btn-guardar');
  const feedback = document.getElementById('sa-feedback');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Guardando...'; }
  try {
    await saveServicios();
    renderServiciosPublic();
    if (feedback) {
      feedback.textContent = '✅ Cambios guardados correctamente. Ya se ven en todos los dispositivos.';
      feedback.className = 'sa-feedback sa-feedback-ok';
      feedback.style.display = 'block';
      setTimeout(() => { feedback.style.display = 'none'; }, 4000);
    }
  } catch (e) {
    if (feedback) {
      feedback.textContent = '❌ Error al guardar en la nube. Verifica la conexión e intenta de nuevo.';
      feedback.className = 'sa-feedback sa-feedback-err';
      feedback.style.display = 'block';
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '💾 Guardar Cambios'; }
  }
}

function deleteServicioOpcion(sIdx, gIdx, oIdx) {
  if (serviciosData[sIdx].grupos[gIdx].opciones.length <= 1) {
    alert('Debe haber al menos una opción en el grupo.');
    return;
  }
  serviciosData[sIdx].grupos[gIdx].opciones.splice(oIdx, 1);
  saveServicios();
  renderServiciosPublic();
  renderServiciosAdmin();
}

function addServicioOpcion(sIdx, gIdx) {
  const nombreInput = document.getElementById(`sa-new-nombre-${sIdx}-${gIdx}`);
  const precioInput = document.getElementById(`sa-new-precio-${sIdx}-${gIdx}`);
  const nombre = nombreInput.value.trim();
  const precio = parseInt(precioInput.value, 10);
  if (!nombre || isNaN(precio) || precio < 0) {
    alert('Ingresa un nombre y un precio válido.');
    return;
  }
  const nuevoId = `custom-${sIdx}-${gIdx}-${Date.now()}`;
  serviciosData[sIdx].grupos[gIdx].opciones.push({ id: nuevoId, nombre, precio });
  saveServicios();
  renderServiciosPublic();
  renderServiciosAdmin();
}

// Cargar productos
function loadProductos() {
  try {
    // Intentar cargar desde localStorage
    const productosLocal = localStorage.getItem('productosDisponibles');
    if (productosLocal) {
      productosDisponibles = JSON.parse(productosLocal);
    }
    
    // Si Firebase está disponible, cargar desde ahí
    if (database) {
      database.ref('productos').on('value', (snapshot) => {
        const productosFirebase = snapshot.val();
        if (productosFirebase) {
          productosDisponibles = Object.values(productosFirebase);
          localStorage.setItem('productosDisponibles', JSON.stringify(productosDisponibles));
          updateProductosUI();
          updateProductosSection();
        }
      });
    }
    
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

// Guardar productos
async function saveProductos() {
  // Guardar en localStorage
  localStorage.setItem('productosDisponibles', JSON.stringify(productosDisponibles));
  
  // Guardar en Firebase si está disponible
  if (database) {
    const productosObj = {};
    productosDisponibles.forEach(producto => {
      productosObj[producto.id] = producto;
    });
    
    try {
      await database.ref('productos').set(productosObj);
    } catch (error) {
      console.warn('Error guardando en Firebase:', error);
    }
  }
}

// Actualizar UI del panel de administración
function updateProductosUI() {
  const grid = document.getElementById('productos-admin-grid');
  const stats = document.getElementById('productos-stats');
  
  if (!grid || !stats) return;
  
  // Actualizar estadísticas
  stats.innerHTML = `<span class="productos-count">${productosDisponibles.length} productos</span>`;
  
  // Limpiar grid
  grid.innerHTML = '';
  
  if (productosDisponibles.length === 0) {
    grid.innerHTML = `
      <div class="no-productos-admin">
        <p>📦 No hay productos registrados aún</p>
        <p>Agrega algunos productos para comenzar</p>
      </div>
    `;
    return;
  }
  
  // Renderizar productos
  productosDisponibles.forEach(producto => {
    const card = document.createElement('div');
    card.className = 'producto-admin-card';
    const precioFormateado = formatearPrecio(producto.precio);
    card.innerHTML = `
      ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-admin-imagen">` : '<div class="producto-admin-imagen" style="display:flex;align-items:center;justify-content:center;color:#666;font-size:2rem;">📦</div>'}
      <div class="producto-admin-info">
        <div class="producto-admin-nombre">${producto.nombre}</div>
        <div class="producto-admin-descripcion">${producto.descripcion}</div>
        <div class="producto-admin-precio">${precioFormateado}</div>
        <div class="producto-admin-actions">
          <button class="btn-edit" onclick="editProducto('${producto.id}')">Editar</button>
          <button class="btn-delete" onclick="deleteProducto('${producto.id}')">Eliminar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  
  // Actualizar controles del carrusel
  setTimeout(updateProductosCarouselControls, 100);
}

// Actualizar sección pública de productos
function updateProductosSection() {
  const grid = document.getElementById('productos-grid');
  if (!grid) return;
  
  // Limpiar grid
  grid.innerHTML = '';
  
  if (productosDisponibles.length === 0) {
    grid.innerHTML = `
      <div class="no-productos">
        <div class="no-productos-icon">📦</div>
        <h3>Próximamente nuevos productos</h3>
        <p>Estamos preparando una selección especial para ti</p>
      </div>
    `;
    return;
  }
  
  // Mostrar productos (máximo 6 inicialmente)
  const productosParaMostrar = productosDisponibles.slice(0, 6);
  
  productosParaMostrar.forEach(producto => {
    const card = document.createElement('div');
    card.className = 'producto-card';
    const precioFormateado = formatearPrecio(producto.precio);
    card.innerHTML = `
      ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">` : '<div class="producto-imagen" style="display:flex;align-items:center;justify-content:center;color:#666;font-size:3rem;">📦</div>'}
      <div class="producto-info">
        <h3 class="producto-nombre">${producto.nombre}</h3>
        <p class="producto-descripcion">${producto.descripcion}</p>
        <div class="producto-precio">${precioFormateado}</div>
      </div>
    `;
    grid.appendChild(card);
  });
  
  // Mostrar botón "Ver más" si hay más productos
  const verMasContainer = document.querySelector('.ver-mas-container');
  if (verMasContainer) {
    if (productosDisponibles.length > 6) {
      verMasContainer.style.display = 'block';
    } else {
      verMasContainer.style.display = 'none';
    }
  }
  
  // Actualizar controles del carrusel
  setTimeout(updateProductosCarouselControls, 100);
}

// Editar producto
function editProducto(id) {
  const producto = productosDisponibles.find(p => p.id === id);
  if (!producto) return;
  
  // Llenar formulario con datos del producto
  document.getElementById('producto-nombre').value = producto.nombre;
  document.getElementById('producto-precio').value = producto.precio;
  document.getElementById('producto-descripcion').value = producto.descripcion;
  
  // Si tiene imagen, mostrar vista previa
  if (producto.imagen) {
    const preview = document.getElementById('imagen-preview');
    const previewImg = document.getElementById('preview-img');
    previewImg.src = producto.imagen;
    preview.style.display = 'block';
  }
  
  // Cambiar modo a edición
  editingProductId = id;
  document.querySelector('.btn-primary').textContent = 'Actualizar Producto';
  document.getElementById('cancel-edit').style.display = 'inline-block';
  
  // Cambiar a pestaña de productos
  showAdminTab('productos-tab');
  
  // Scroll al formulario
  document.getElementById('producto-form').scrollIntoView({ behavior: 'smooth' });
}

// Cancelar edición
function cancelEdit() {
  resetProductoForm();
}

// Eliminar producto
function deleteProducto(id) {
  const producto = productosDisponibles.find(p => p.id === id);
  if (!producto) return;
  
  if (confirm(`¿Estás seguro de que quieres eliminar "${producto.nombre}"?`)) {
    productosDisponibles = productosDisponibles.filter(p => p.id !== id);
    saveProductos();
    updateProductosUI();
    updateProductosSection();
  }
}

// Resetear formulario de producto
function resetProductoForm() {
  document.getElementById('producto-form').reset();
  removeImagePreview();
  editingProductId = null;
  document.querySelector('.btn-primary').textContent = 'Agregar Producto';
  document.getElementById('cancel-edit').style.display = 'none';
}

// Mostrar más productos
function verMasProductos() {
  const grid = document.getElementById('productos-grid');
  if (!grid) return;
  
  // Limpiar y mostrar todos los productos
  grid.innerHTML = '';
  
  productosDisponibles.forEach(producto => {
    const card = document.createElement('div');
    card.className = 'producto-card';
    const precioFormateado = formatearPrecio(producto.precio);
    card.innerHTML = `
      ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">` : '<div class="producto-imagen" style="display:flex;align-items:center;justify-content:center;color:#666;font-size:3rem;">📦</div>'}
      <div class="producto-info">
        <h3 class="producto-nombre">${producto.nombre}</h3>
        <p class="producto-descripcion">${producto.descripcion}</p>
        <div class="producto-precio">${precioFormateado}</div>
      </div>
    `;
    grid.appendChild(card);
  });
  
  // Ocultar botón "Ver más"
  const verMasContainer = document.querySelector('.ver-mas-container');
  if (verMasContainer) {
    verMasContainer.style.display = 'none';
  }
  
  // Actualizar controles del carrusel
  setTimeout(updateProductosCarouselControls, 100);
}

// Formatear precio en pesos chilenos
function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);
}

// ===== CARRUSEL DE PRODUCTOS MÓVIL =====

let productosScrollPosition = 0;

function moveProductosCarousel(direction) {
  const grid = document.getElementById('productos-grid');
  const cardWidth = 280 + 16; // Ancho de card + gap
  const maxScroll = grid.scrollWidth - grid.clientWidth;
  
  productosScrollPosition += direction * cardWidth;
  
  // Limitar el scroll
  if (productosScrollPosition < 0) {
    productosScrollPosition = 0;
  } else if (productosScrollPosition > maxScroll) {
    productosScrollPosition = maxScroll;
  }
  
  grid.scrollTo({
    left: productosScrollPosition,
    behavior: 'smooth'
  });
  
  // Actualizar visibilidad de flechas
  updateProductosCarouselControls();
}

function updateProductosCarouselControls() {
  if (window.innerWidth > 768) return; // Solo en móvil
  
  const grid = document.getElementById('productos-grid');
  const prevBtn = document.getElementById('productos-prev');
  const nextBtn = document.getElementById('productos-next');
  
  if (!grid || !prevBtn || !nextBtn) return;
  
  const maxScroll = grid.scrollWidth - grid.clientWidth;
  
  // Mostrar/ocultar flecha anterior
  if (grid.scrollLeft <= 0) {
    prevBtn.classList.add('hidden');
  } else {
    prevBtn.classList.remove('hidden');
  }
  
  // Mostrar/ocultar flecha siguiente
  if (grid.scrollLeft >= maxScroll) {
    nextBtn.classList.add('hidden');
  } else {
    nextBtn.classList.remove('hidden');
  }
}

// Escuchar el scroll para actualizar las flechas
function setupProductosCarouselListeners() {
  const grid = document.getElementById('productos-grid');
  if (grid) {
    grid.addEventListener('scroll', () => {
      productosScrollPosition = grid.scrollLeft;
      updateProductosCarouselControls();
    });
    
    // Actualizar al cargar y redimensionar
    window.addEventListener('resize', updateProductosCarouselControls);
  }
}
let currentSlide = 0; // Índice actual del carrusel
console.log('[INIT] Variables globales declaradas.');

// ===== FUNCIONES FIREBASE (añadidas) =====
async function cargarHorariosDesdeFirebase() {
  if (!database) return;
  try {
    const snap = await database.ref('horarios').once('value');
    const data = snap.val();
    if (data) {
      horariosGuardados = data;
      console.log('✅ (load) Horarios:', Object.keys(horariosGuardados));
    } else {
      console.log('ℹ️ (load) No hay horarios en Firebase');
    }
  } catch (err) {
    console.error('❌ cargarHorariosDesdeFirebase:', err);
  }
}
async function guardarHorariosEnFirebase() {
  if (!database) { console.warn('⚠️ Firebase no inicializado'); return false; }
  try {
    await database.ref('horarios').set(horariosGuardados);
    console.log('✅ (save) Horarios escritos');
    return true;
  } catch (err) {
    console.error('❌ guardarHorariosEnFirebase:', err);
    return false;
  }
}
async function cargarReservasDesdeFirebase() {
  if (!database) return;
  try {
    const snap = await database.ref('reservas').once('value');
    const data = snap.val();
    if (data) {
      reservasOcupadas = data;
      console.log('✅ (load) Reservas:', Object.keys(reservasOcupadas).length);
    }
  } catch (err) {
    console.error('❌ cargarReservasDesdeFirebase:', err);
  }
}
async function guardarReservasEnFirebase() {
  if (!database) { console.warn('⚠️ Firebase no inicializado'); return false; }
  try {
    await database.ref('reservas').set(reservasOcupadas);
    console.log('✅ (save) Reservas escritas');
    return true;
  } catch (err) {
    console.error('❌ guardarReservasEnFirebase:', err);
    return false;
  }
}
async function limpiarDatosAntiguos() {
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  let changed = false;
  for (const key of Object.keys(horariosGuardados)) {
    const [a, m, d] = key.split('-').map(Number);
    if (new Date(a, m-1, d) < hoy) { delete horariosGuardados[key]; changed = true; }
  }
  for (const key of Object.keys(reservasOcupadas)) {
    const parts = key.split('-');
    const [a, m, d] = parts.slice(0,3).map(Number);
    if (new Date(a, m-1, d) < hoy) { delete reservasOcupadas[key]; changed = true; }
  }
  if (changed) {
    console.log('🧹 Datos antiguos limpiados');
    await guardarHorariosEnFirebase();
    await guardarReservasEnFirebase();
  }
}
async function inicializarDatos() {
  console.log('🚀 inicializarDatos()');
  
  // Cargar datos con manejo de errores robusto
  try {
    await cargarHorariosDesdeFirebase();
  } catch (error) {
    console.error('⚠️ Error cargando horarios:', error);
  }
  
  try {
    await cargarReservasDesdeFirebase();
  } catch (error) {
    console.error('⚠️ Error cargando reservas:', error);
  }
  
  try {
    await cargarImagenesGaleria();
  } catch (error) {
    console.error('⚠️ Error cargando galería:', error);
    // Fallback a localStorage en caso de error
    try {
      const stored = localStorage.getItem('galeriaImagenes');
      if (stored) {
        galeriaImagenes = JSON.parse(stored);
        console.log('✅ Fallback: imágenes desde localStorage:', galeriaImagenes.length);
      } else {
        galeriaImagenes = [];
      }
    } catch (localError) {
      console.error('❌ Error en fallback localStorage:', localError);
      galeriaImagenes = [];
    }
  }
  
  try {
    await limpiarDatosAntiguos();
  } catch (error) {
    console.error('⚠️ Error limpiando datos antiguos:', error);
  }
  
  datosListos = true; // marcar listo
  console.log('✅ Datos listos');
  
  // Si el tab de reservas está visible en este momento, refrescar
  const reservasTab = document.getElementById('reservas-tab');
  if (reservasTab && reservasTab.style.display !== 'none') {
    mostrarReservasDisponibles();
  }
  // Si el tab de galería está visible, refrescar
  const galeriaTab = document.getElementById('galeria-tab');
  if (galeriaTab && galeriaTab.style.display !== 'none') {
    mostrarImagenesAdmin();
  }
  // Actualizar galería del cliente
  actualizarGaleriaCliente();
}

// ===== SISTEMA DE CALENDARIO PARA HORARIOS =====
function inicializarCalendario() {
  // Verificar que los elementos del DOM estén disponibles
  const calendarDays = document.getElementById('calendar-days');
  const monthYearElement = document.getElementById('current-month-year');
  
  if (!calendarDays || !monthYearElement) {
    // Si los elementos no están disponibles, intentar de nuevo después de un breve delay
    setTimeout(() => {
      inicializarCalendario();
    }, 50);
    return;
  }
  
  mostrarCalendario(fechaActual.getFullYear(), fechaActual.getMonth());
}

function mostrarCalendario(año, mes) {
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Actualizar el título del mes y año
  const monthYearElement = document.getElementById('current-month-year');
  if (monthYearElement) {
    monthYearElement.textContent = `${nombresMeses[mes]} ${año}`;
  }
  
  // Obtener el primer día del mes y cuántos días tiene
  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  
  // Ajustar para que la semana comience en Lunes (0=Lunes, 6=Domingo)
  let diaSemanaPrimero = primerDia.getDay(); // 0 = Domingo en JavaScript
  diaSemanaPrimero = diaSemanaPrimero === 0 ? 6 : diaSemanaPrimero - 1; // Convertir para que Lunes = 0
  
  // Obtener fecha actual para comparación
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  // Limpiar el contenedor de días
  const calendarDays = document.getElementById('calendar-days');
  if (!calendarDays) return;
  
  calendarDays.innerHTML = '';
  
  // Agregar días vacíos al inicio si es necesario
  for (let i = 0; i < diaSemanaPrimero; i++) {
    const diaVacio = document.createElement('div');
    diaVacio.className = 'calendar-day other-month';
    calendarDays.appendChild(diaVacio);
  }
  
  // Agregar todos los días del mes
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fechaDia = new Date(año, mes, dia);
    const diaElement = document.createElement('div');
    diaElement.className = 'calendar-day';
    diaElement.textContent = dia;
    const claveDate = `${año}-${mes + 1}-${dia}`; // clave sin padding
    diaElement.dataset.date = claveDate; // guardar clave para selección directa
    
    // Verificar si es una fecha pasada
    if (fechaDia < hoy) {
      diaElement.classList.add('disabled');
    } else {
      // Hacer clic solo en días habilitados
      diaElement.addEventListener('click', () => abrirModalHorarios(fechaDia));
      diaElement.classList.add('active');
    }
    
    // Verificar si ya tiene horarios guardados
    if (horariosGuardados[claveDate]) {
      diaElement.classList.add('has-schedule');
    }
    
    calendarDays.appendChild(diaElement);
  }
}

function cambiarMes(direccion) {
  const nuevaFecha = new Date(fechaActual);
  nuevaFecha.setMonth(fechaActual.getMonth() + direccion);
  
  // No permitir ir a meses anteriores al actual
  const hoy = new Date();
  if (nuevaFecha.getFullYear() < hoy.getFullYear() || 
      (nuevaFecha.getFullYear() === hoy.getFullYear() && nuevaFecha.getMonth() < hoy.getMonth())) {
    return;
  }
  
  fechaActual = nuevaFecha;
  mostrarCalendario(fechaActual.getFullYear(), fechaActual.getMonth());
}

function abrirModalHorarios(fecha) {
  const fechaStr = fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Mostrar la fecha seleccionada en el modal
  const fechaSeleccionada = document.getElementById('fecha-seleccionada');
  if (fechaSeleccionada) {
    fechaSeleccionada.textContent = `Configurando horarios para: ${fechaStr}`;
  }
  
  // Guardar la fecha seleccionada para usar al guardar
  window.fechaSeleccionadaActual = fecha;
  
  // Cargar horarios existentes si los hay
  const claveFecha = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`;
  const horariosExistentes = horariosGuardados[claveFecha];
  
  // Mostrar/ocultar botón eliminar según si el día ya tiene horarios
  const btnEliminar = document.getElementById('btn-eliminar-dia');
  if (btnEliminar) btnEliminar.style.display = horariosExistentes ? 'inline-block' : 'none';
  
  if (horariosExistentes) {
    document.getElementById('manana-inicio').value = horariosExistentes.mañana.inicio || '';
    document.getElementById('manana-fin').value = horariosExistentes.mañana.fin || '';
    document.getElementById('tarde-inicio').value = horariosExistentes.tarde.inicio || '';
    document.getElementById('tarde-fin').value = horariosExistentes.tarde.fin || '';
  } else {
    // Limpiar los campos
    document.getElementById('manana-inicio').value = '';
    document.getElementById('manana-fin').value = '';
    document.getElementById('tarde-inicio').value = '';
    document.getElementById('tarde-fin').value = '';
  }
  
  // Mostrar el modal
  document.getElementById('horarios-modal').style.display = 'flex';
}

function cerrarModalHorarios() {
  document.getElementById('horarios-modal').style.display = 'none';
}

async function eliminarDiaHorarios() {
  const fecha = window.fechaSeleccionadaActual;
  if (!fecha) return;
  const claveFecha = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`;
  const fechaStr = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  if (!confirm(`¿Eliminar todos los horarios del ${fechaStr}?\nTambién se eliminarán las reservas de ese día.`)) return;
  // Eliminar horarios
  delete horariosGuardados[claveFecha];
  // Eliminar reservas del día
  for (const key of Object.keys(reservasOcupadas)) {
    if (key.startsWith(claveFecha + '-')) delete reservasOcupadas[key];
  }
  // Guardar en Firebase
  const okH = await guardarHorariosEnFirebase();
  await guardarReservasEnFirebase();
  cerrarModalHorarios();
  mostrarCalendario(fechaActual.getFullYear(), fechaActual.getMonth());
  alert(okH ? `✅ Día ${fechaStr} eliminado correctamente.` : `⚠️ Eliminado localmente. (No se pudo sincronizar con Firebase ahora)`);
}

// Manejar el envío del formulario de horarios
if (document.getElementById('horarios-form')) {
  document.getElementById('horarios-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('📝 Enviando formulario de horarios...');
    const fecha = window.fechaSeleccionadaActual;
    if (!fecha) {
      console.warn('⚠️ No hay fecha seleccionada');
      return;
    }
    const mananaInicio = document.getElementById('manana-inicio').value;
    const mananaFin = document.getElementById('manana-fin').value;
    const tardeInicio = document.getElementById('tarde-inicio').value;
    const tardeFin = document.getElementById('tarde-fin').value;
    const tieneManana = mananaInicio && mananaFin;
    const tieneTarde = tardeInicio && tardeFin;
    if (!tieneManana && !tieneTarde) {
      alert('Debe configurar al menos un turno completo (mañana o tarde)');
      return;
    }
    const claveFecha = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`;
    horariosGuardados[claveFecha] = {
      mañana: { inicio: mananaInicio, fin: mananaFin },
      tarde: { inicio: tardeInicio, fin: tardeFin }
    };
    console.log('🗃️ Horarios preparados para guardar:', claveFecha, horariosGuardados[claveFecha]);
    // Cerrar modal inmediatamente para mejor UX
    cerrarModalHorarios();
    let guardadoOk = false;
    try {
      guardadoOk = await guardarHorariosEnFirebase();
      if (guardadoOk) {
        await cargarHorariosDesdeFirebase();
        console.log('🔄 Relectura tras guardado completada.');
      }
    } catch (err) {
      console.error('❌ Excepción al guardar en Firebase:', err);
    } finally {
      mostrarCalendario(fechaActual.getFullYear(), fechaActual.getMonth());
      markSpecificDate(claveFecha); // asegurar marca
    }
    alert(guardadoOk ? ('Horarios guardados exitosamente para ' + fecha.toLocaleDateString('es-ES')) : 'Horarios guardados localmente. (No se pudo guardar en Firebase ahora)');
  });
}

// Cerrar modal al hacer clic en la X
if (document.getElementById('close-horarios')) {
  document.getElementById('close-horarios').addEventListener('click', cerrarModalHorarios);
}

// Función para marcar un día específico en el calendario
function markSpecificDate(claveFecha) {
  const cell = document.querySelector(`#calendar-days .calendar-day[data-date='${claveFecha}']`);
  if (cell) {
    cell.classList.add('has-schedule');
    console.log('✅ Día marcado manualmente:', claveFecha);
  } else {
    console.warn('⚠️ No se encontró la celda para marcar:', claveFecha);
  }
}

// ===== SISTEMA DE GESTIÓN DE RESERVAS =====

// Función para mostrar todas las reservas disponibles
function mostrarReservasDisponibles() {
  const container = document.getElementById('dias-disponibles');
  if (!container) return;
  
  // Verificar si hay horarios configurados
  if (Object.keys(horariosGuardados).length === 0) {
    container.innerHTML = `
      <div class="no-horarios">
        <p>📅 No hay horarios configurados aún.</p>
        <p>Ve a la pestaña "Gestionar Horas de Atención" para configurar los horarios de trabajo.</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  const fechasOrdenadas = Object.keys(horariosGuardados).sort();
  
  fechasOrdenadas.forEach(claveFecha => {
    const horarios = horariosGuardados[claveFecha];
    const [año, mes, dia] = claveFecha.split('-').map(Number);
    const fecha = new Date(año, mes - 1, dia);
    
    // Solo mostrar fechas futuras o actual
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fecha >= hoy) {
      html += generarDiaReservas(fecha, horarios, claveFecha);
    }
  });
  
  if (html === '') {
    html = `
      <div class="no-horarios">
        <p>📅 No hay horarios disponibles para fechas futuras.</p>
        <p>Configura horarios para fechas próximas en "Gestionar Horas de Atención".</p>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// Función para generar los slots de un día específico
function generarDiaReservas(fecha, horarios, claveFecha) {
  const fechaStr = fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const turnoMañana = generarSlotsHorarios(horarios.mañana, claveFecha, 'mañana');
  const turnoTarde = generarSlotsHorarios(horarios.tarde, claveFecha, 'tarde');
  
  const totalSlots = turnoMañana.slots.length + turnoTarde.slots.length;
  const slotsOcupados = turnoMañana.ocupados + turnoTarde.ocupados;
  const slotsDisponibles = totalSlots - slotsOcupados;
  
  return `
    <div class="dia-disponible">
      <div class="dia-header">
        <div class="dia-fecha">${fechaStr}</div>
        <div class="dia-estado">${slotsDisponibles} citas disponibles</div>
      </div>
      
      <div class="turnos-container">
        ${turnoMañana.html}
        ${turnoTarde.html}
      </div>
    </div>
  `;
}

// Función para generar slots de horarios cada 30 minutos
function generarSlotsHorarios(turno, claveFecha, tipoTurno) {
  if (!turno.inicio || !turno.fin) {
    return {
      html: `
        <div class="turno-seccion">
          <div class="turno-titulo">
            ${tipoTurno === 'mañana' ? '🌅 Turno Mañana' : '🌆 Turno Tarde'}
          </div>
          <div class="no-turnos">Sin horarios configurados</div>
        </div>
      `,
      slots: [],
      ocupados: 0
    };
  }
  
  const slots = [];
  const inicio = convertirHoraAMinutos(turno.inicio);
  const fin = convertirHoraAMinutos(turno.fin);
  
  for (let minutos = inicio; minutos < fin; minutos += 30) {
    const horaStr = convertirMinutosAHora(minutos);
    const claveSlot = `${claveFecha}-${horaStr}`;
    const ocupado = reservasOcupadas[claveSlot] || false;
    
    slots.push({
      hora: horaStr,
      ocupado: ocupado,
      clave: claveSlot
    });
  }
  
  const ocupados = slots.filter(slot => slot.ocupado).length;
  
  const slotsHtml = slots.map(slot => {
    if (slot.ocupado) {
      const nombre = slot.ocupado.nombre ? slot.ocupado.nombre : (slot.ocupado.tipo === 'admin' ? 'Admin' : '');
      const telefono = slot.ocupado.telefono ? slot.ocupado.telefono : '';
      return `<div class="horario-slot ocupado">${slot.hora}<br><small>Ocupado${nombre ? ' ('+nombre+')' : ''}${telefono ? '<br>'+telefono : ''}</small><br><button type=\"button\" class=\"liberar-btn\" onclick=\"liberarCita('${slot.clave}')\" style=\"margin-top:4px;font-size:10px;padding:2px 6px;background:#dc3545;color:#fff;border:none;border-radius:4px;cursor:pointer;\">Liberar</button></div>`;
    } else {
      return `<div class=\"horario-slot\" onclick=\"reservarCita('${slot.clave}', '${slot.hora}')\">${slot.hora}</div>`;
    }
  }).join('');
  
  return {
    html: `
      <div class="turno-seccion">
        <div class="turno-titulo">
          ${tipoTurno === 'mañana' ? '🌅 Turno Mañana' : '🌆 Turno Tarde'}
          <small>(${slots.length - ocupados}/${slots.length} disponibles)</small>
        </div>
        <div class="horarios-grid">
          ${slotsHtml}
        </div>
      </div>
    `,
    slots: slots,
    ocupados: ocupados
  };
}

// Función para convertir hora (HH:MM) a minutos
function convertirHoraAMinutos(hora) {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

// Función para convertir minutos a hora (HH:MM)
function convertirMinutosAHora(minutos) {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Función para reservar una cita (desde el panel admin)
async function reservarCita(claveSlot, hora) {
  const confirmacion = confirm(`¿Confirmar reserva para las ${hora}?`);
  if (confirmacion) {
    // Marcar como ocupado
    reservasOcupadas[claveSlot] = {
      fecha: new Date().toISOString(),
      hora: hora,
      tipo: 'admin',
      confirmada: true
    };
    await guardarReservasEnFirebase();
    mostrarReservasDisponibles();
    alert(`Cita reservada exitosamente para las ${hora}`);
  }
}

// Nueva función: liberar una cita ocupada
async function liberarCita(claveSlot) {
  if (!reservasOcupadas[claveSlot]) return;
  const hora = claveSlot.split('-').slice(-1)[0];
  const confirmar = confirm(`¿Liberar la hora ${hora}?`);
  if (!confirmar) return;
  delete reservasOcupadas[claveSlot];
  await guardarReservasEnFirebase();
  mostrarReservasDisponibles();
  alert(`Hora ${hora} liberada`);
}

// Función para filtrar reservas por fecha
function filtrarReservasPorFecha() {
  const fechaFiltro = document.getElementById('fecha-filtro').value;
  if (!fechaFiltro) {
    mostrarTodasLasReservas();
    return;
  }
  
  const container = document.getElementById('dias-disponibles');
  if (!container) return;
  
  const fecha = new Date(fechaFiltro + 'T00:00:00');
  const año = fecha.getFullYear();
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  const claveFecha = `${año}-${mes}-${dia}`;
  
  const horarios = horariosGuardados[claveFecha];
  
  if (!horarios) {
    container.innerHTML = `
      <div class="no-horarios">
        <p>📅 No hay horarios configurados para esta fecha.</p>
        <p>Selecciona otra fecha o configura horarios en "Gestionar Horas de Atención".</p>
      </div>
    `;
    return;
  }
  
  const html = generarDiaReservas(fecha, horarios, claveFecha);
  container.innerHTML = html;
}

// Función para mostrar todas las reservas
function mostrarTodasLasReservas() {
  document.getElementById('fecha-filtro').value = '';
  mostrarReservasDisponibles();
}

// ===== FUNCIONES PARA RESERVAS EN PANTALLA PRINCIPAL =====

// Función para mostrar horas disponibles cuando se selecciona una fecha en la pantalla principal
function mostrarHorasDisponibles() {
  const fechaInput = document.getElementById('fecha-reserva');
  const container = document.getElementById('horas-disponibles-container');
  const gridContainer = document.getElementById('horas-disponibles-grid');
  const btnReservar = document.getElementById('btn-reservar');
  const horaSeleccionadaInput = document.getElementById('hora-seleccionada');
  
  if (!fechaInput.value) {
    container.style.display = 'none';
    btnReservar.disabled = true;
    return;
  }
  
  const fechaSeleccionada = new Date(fechaInput.value + 'T00:00:00');
  const año = fechaSeleccionada.getFullYear();
  const mes = fechaSeleccionada.getMonth() + 1;
  const dia = fechaSeleccionada.getDate();
  const claveFecha = `${año}-${mes}-${dia}`;
  
  // Verificar si hay horarios configurados para esta fecha
  const horarios = horariosGuardados[claveFecha];
  
  if (!horarios) {
    container.style.display = 'block';
    gridContainer.innerHTML = `
      <div class="no-horas-disponibles">
        <p>📅 No hay horarios disponibles para esta fecha.</p>
        <p>Por favor selecciona otra fecha o contacta al barbero directamente.</p>
      </div>
    `;
    btnReservar.disabled = true;
    horaSeleccionadaInput.value = '';
    return;
  }
  
  // Generar las horas disponibles
  let horasHTML = '';
  
  // Turno mañana
  if (horarios.mañana.inicio && horarios.mañana.fin) {
    const slotsMañana = generarSlotsParaCliente(horarios.mañana, claveFecha);
    if (slotsMañana.length > 0) {
      horasHTML += `
        <div class="turno-section-cliente">
          <div class="turno-titulo-cliente">🌅 Turno Mañana</div>
          <div class="horas-grid">
            ${slotsMañana.map(slot => `
              <div class="hora-slot ${slot.ocupado ? 'ocupado' : ''}" 
                   onclick="${slot.ocupado ? '' : `seleccionarHora('${slot.hora}')`}">
                ${slot.hora}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }
  
  // Turno tarde
  if (horarios.tarde.inicio && horarios.tarde.fin) {
    const slotsTarde = generarSlotsParaCliente(horarios.tarde, claveFecha);
    if (slotsTarde.length > 0) {
      horasHTML += `
        <div class="turno-section-cliente">
          <div class="turno-titulo-cliente">🌆 Turno Tarde</div>
          <div class="horas-grid">
            ${slotsTarde.map(slot => `
              <div class="hora-slot ${slot.ocupado ? 'ocupado' : ''}" 
                   onclick="${slot.ocupado ? '' : `seleccionarHora('${slot.hora}')`}">
                ${slot.hora}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }
  
  if (!horasHTML) {
    horasHTML = `
      <div class="no-horas-disponibles">
        <p>😔 No hay citas disponibles para esta fecha.</p>
        <p>Todas las horas están ocupadas. Prueba con otra fecha.</p>
      </div>
    `;
  }
  
  gridContainer.innerHTML = horasHTML;
  container.style.display = 'block';
  
  // Limpiar selección anterior
  horaSeleccionadaInput.value = '';
  btnReservar.disabled = true;
}

// Función para generar slots de horario para clientes
function generarSlotsParaCliente(turno, claveFecha) {
  const slots = [];
  const inicio = convertirHoraAMinutos(turno.inicio);
  const fin = convertirHoraAMinutos(turno.fin);
  
  for (let minutos = inicio; minutos < fin; minutos += 30) {
    const horaStr = convertirMinutosAHora(minutos);
    const claveSlot = `${claveFecha}-${horaStr}`;
    const ocupado = reservasOcupadas[claveSlot] || false;
    
    slots.push({
      hora: horaStr,
      ocupado: ocupado
    });
  }
  
  return slots;
}

// Función para seleccionar una hora específica
function seleccionarHora(hora) {
  // Remover selección anterior
  document.querySelectorAll('.hora-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  
  // Seleccionar la nueva hora
  const slotSeleccionado = Array.from(document.querySelectorAll('.hora-slot'))
    .find(slot => slot.textContent.trim() === hora);
  
  if (slotSeleccionado) {
    slotSeleccionado.classList.add('selected');
    document.getElementById('hora-seleccionada').value = hora;
    document.getElementById('btn-reservar').disabled = false;
  }
}

// Validar que no se puedan seleccionar fechas pasadas e inicializar todo
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📱 Página cargada, inicializando sistema completo...');
  
  // === CONFIGURAR EVENTOS DE LOGIN ===
  // Mostrar modal al hacer clic en el logo
  const loginLogo = document.getElementById("login-logo");
  if (loginLogo) {
    loginLogo.addEventListener("click", () => {
      console.log('🔐 Logo clickeado, abriendo modal de login');
      const modal = document.getElementById("login-modal");
      if (modal) {
        modal.style.display = "flex";
      }
    });
    console.log('✅ Evento de login logo configurado');
  } else {
    console.error('❌ No se encontró el elemento login-logo');
  }
  
  // Cerrar modal
  const closeLogin = document.getElementById("close-login");
  if (closeLogin) {
    closeLogin.addEventListener("click", () => {
      const modal = document.getElementById("login-modal");
      const error = document.getElementById("login-error");
      if (modal) modal.style.display = "none";
      if (error) error.style.display = "none";
    });
  }
  
  // Validar usuario administrador con Firebase Auth
  const adminForm = document.getElementById("admin-login-form");
  if (adminForm) {
    adminForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const email = document.getElementById("admin-user").value.trim();
      const pass = document.getElementById("admin-pass").value.trim();
      const errorDiv = document.getElementById("login-error");
      const submitBtn = adminForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        await firebase.auth().signInWithEmailAndPassword(email, pass);
        document.getElementById("login-modal").style.display = "none";
        errorDiv.style.display = "none";
        showAdminPanel();
      } catch (err) {
        console.error('Error de autenticación:', err.code);
        errorDiv.textContent = 'Email o contraseña incorrectos';
        errorDiv.style.display = "block";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
  
  // === INICIALIZAR DATOS Y CONFIGURACIÓN ===
  // Cargar datos desde Firebase
  await inicializarDatos();
  
  // Inicializar productos
  initProductos();
  
  // Inicializar servicios
  loadServicios();
  
  // Configurar fecha mínima para reservas
  const fechaInput = document.getElementById('fecha-reserva');
  if (fechaInput) {
    const hoy = new Date();
    const fechaMinima = hoy.toISOString().split('T')[0];
    fechaInput.setAttribute('min', fechaMinima);
  }
  
  console.log('✅ Sistema completo inicializado correctamente');
});
// --- FIN INICIO DE SESIÓN ADMIN ---

// ===== SISTEMA DE GALERÍA =====

// === FUNCIONES FIREBASE PARA GALERÍA ===
async function cargarImagenesGaleriaDesdeFirebase() {
  // Usar configuración desde config.js
  const storageConfig = getStorageConfig ? getStorageConfig() : { mode: 'local' };
  const useFirebaseMode = storageConfig.mode === 'firebase';
  
  if (useFirebaseMode && database) {
    // Modo Firebase: cargar desde Firebase Database
    try {
      const snap = await database.ref('galeria').once('value');
      const data = snap.val();
      if (data) {
        galeriaImagenes = Object.values(data);
        console.log('✅ (load) Imágenes desde Firebase:', galeriaImagenes.length);
      } else {
        console.log('ℹ️ (load) No hay imágenes en Firebase');
        galeriaImagenes = [];
      }
    } catch (err) {
      console.error('❌ cargarImagenesGaleriaDesdeFirebase:', err);
      // Fallback a localStorage si Firebase falla
      try {
        const stored = localStorage.getItem('galeriaImagenes');
        if (stored) {
          galeriaImagenes = JSON.parse(stored);
          console.log('✅ (fallback) Imágenes desde localStorage:', galeriaImagenes.length);
        } else {
          galeriaImagenes = [];
        }
      } catch (localErr) {
        console.error('❌ Error en fallback localStorage:', localErr);
        galeriaImagenes = [];
      }
    }
  } else {
    // Modo local: cargar desde localStorage
    try {
      const stored = localStorage.getItem('galeriaImagenes');
      if (stored) {
        galeriaImagenes = JSON.parse(stored);
        console.log('✅ (load) Imágenes desde localStorage:', galeriaImagenes.length);
      } else {
        console.log('ℹ️ (load) No hay imágenes en localStorage');
        galeriaImagenes = [];
      }
    } catch (err) {
      console.error('❌ Error cargando desde localStorage:', err);
      galeriaImagenes = [];
    }
  }
}

async function guardarImagenesGaleriaEnFirebase() {
  if (!database) { 
    console.warn('⚠️ Firebase no inicializado'); 
    return false; 
  }
  try {
    const galeriaObj = {};
    galeriaImagenes.forEach((img, index) => {
      galeriaObj[`img_${index}`] = img;
    });
    await database.ref('galeria').set(galeriaObj);
    console.log('✅ (save) Imágenes galería escritas');
    return true;
  } catch (err) {
    console.error('❌ guardarImagenesGaleriaEnFirebase:', err);
    return false;
  }
}

// Función universal para cargar imágenes desde cualquier proveedor
async function cargarImagenesGaleria() {
  try {
    // Obtener configuración de almacenamiento
    const storageConfig = getStorageConfig ? getStorageConfig() : { mode: 'local' };
    
    console.log('📁 Cargando imágenes en modo:', storageConfig.mode);
    
    if (storageConfig.mode === 'cloudinary') {
      // Cargar imágenes desde Cloudinary y localStorage
      await cargarImagenesCloudinary();
    } else if (storageConfig.mode === 'firebase' && database) {
      // Intentar cargar desde Firebase Database
      try {
        await cargarImagenesGaleriaDesdeFirebase();
      } catch (error) {
        console.error('Error cargando desde Firebase:', error);
        // Fallback a localStorage
        cargarImagenesDesdeLocalStorage();
      }
    } else {
      // Cargar desde localStorage
      cargarImagenesDesdeLocalStorage();
    }
    
    console.log('✅ Galería cargada:', galeriaImagenes.length, 'imágenes');
    
  } catch (error) {
    console.error('Error cargando galería:', error);
    // Fallback a localStorage siempre
    cargarImagenesDesdeLocalStorage();
  }
}

// Función para cargar imágenes desde Cloudinary
async function cargarImagenesCloudinary() {
  try {
    console.log('🌤️ Cargando imágenes desde Cloudinary...');
    
    // Primero intentar cargar desde Firebase Database (global)
    if (database) {
      try {
        console.log('🔥 Intentando cargar desde Firebase Database...');
        const snap = await database.ref('galeria').once('value');
        const data = snap.val();
        if (data) {
          const firebaseImages = Object.values(data);
          console.log('✅ Cargadas', firebaseImages.length, 'imágenes desde Firebase Database');
          galeriaImagenes = firebaseImages;
          // Actualizar localStorage como caché
          localStorage.setItem('galeriaImagenes', JSON.stringify(galeriaImagenes));
          return;
        }
      } catch (firebaseError) {
        console.warn('⚠️ Error cargando desde Firebase Database:', firebaseError);
      }
    }
    
    // Fallback: cargar desde localStorage
    cargarImagenesDesdeLocalStorage();
    
  } catch (error) {
    console.error('❌ Error cargando desde Cloudinary:', error);
    // Usar localStorage como fallback final
    cargarImagenesDesdeLocalStorage();
  }
}

// Función para cargar solo desde localStorage
function cargarImagenesDesdeLocalStorage() {
  try {
    const stored = localStorage.getItem('galeriaImagenes');
    if (stored) {
      galeriaImagenes = JSON.parse(stored);
      console.log('✅ Imágenes desde localStorage:', galeriaImagenes.length);
    } else {
      console.log('ℹ️ No hay imágenes en localStorage');
      galeriaImagenes = [];
    }
  } catch (err) {
    console.error('❌ Error cargando desde localStorage:', err);
    galeriaImagenes = [];
  }
}

// === FUNCIONES PARA ADMINISTRADOR ===
function configurarEventosGaleria() {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  
  if (!uploadArea || !fileInput) return;
  
  // Evento click en área de carga
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  // Evento change en input de archivo
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      subirArchivos(files);
    }
  });
  
  // Eventos drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      subirArchivos(files);
    }
  });
}

async function subirArchivos(files) {
  const progressBar = document.getElementById('upload-progress');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  
  progressBar.style.display = 'block';
  progressFill.style.width = '0%';
  progressText.textContent = 'Preparando subida...';
  
  const nuevasImagenes = [];
  let completados = 0;
  
  try {
    // Usar configuración desde config.js
    const storageConfig = getStorageConfig ? getStorageConfig() : { mode: 'local' };
    let useCloudinaryMode = storageConfig.mode === 'cloudinary';
    let useFirebaseMode = storageConfig.mode === 'firebase';
    
    console.log('📦 Modo de almacenamiento configurado:', storageConfig.mode);
    
    // Intentar Cloudinary primero si está configurado
    if (useCloudinaryMode && typeof uploadToCloudinary !== 'undefined') {
      try {
        console.log('🌤️ Intentando Cloudinary...');
        await subirArchivosCloudinary(files, progressFill, progressText, nuevasImagenes, completados);
        console.log('✅ Cloudinary exitoso');
      } catch (cloudinaryError) {
        console.error('❌ Error en Cloudinary:', cloudinaryError);
        
        // Fallback a localStorage si Cloudinary falla
        console.log('🔄 Fallback a localStorage por error de Cloudinary');
        progressText.textContent = 'Usando almacenamiento local...';
        useCloudinaryMode = false;
        await subirArchivosLocal(files, progressFill, progressText, nuevasImagenes, completados);
      }
    }
    // Intentar Firebase si está configurado
    else if (useFirebaseMode && storage && database) {
      try {
        console.log('☁️ Intentando Firebase Storage...');
        await subirArchivosFirebase(files, progressFill, progressText, nuevasImagenes, completados);
        console.log('✅ Firebase Storage exitoso');
      } catch (firebaseError) {
        console.error('❌ Error en Firebase Storage:', firebaseError);
        
        // Si hay error de CORS o red, usar localStorage como fallback
        if (firebaseError.message.includes('CORS') || 
            firebaseError.message.includes('Access to XMLHttpRequest') ||
            firebaseError.message.includes('net::ERR_FAILED')) {
          console.log('🔄 Fallback a localStorage por error de CORS/red');
          progressText.textContent = 'Usando almacenamiento local...';
          useFirebaseMode = false;
          await subirArchivosLocal(files, progressFill, progressText, nuevasImagenes, completados);
        } else {
          throw firebaseError;
        }
      }
    } else {
      // Modo local: usar URLs de archivos locales
      console.log('💾 Usando almacenamiento local');
      await subirArchivosLocal(files, progressFill, progressText, nuevasImagenes, completados);
    }
    
    // Agregar imágenes al array global
    galeriaImagenes.push(...nuevasImagenes);
    
    // Guardar según el modo utilizado
    if (useCloudinaryMode) {
      // Cloudinary + Firebase Database para acceso global
      try {
        if (database) {
          await guardarImagenesGaleriaEnFirebase();
          console.log('✅ Guardado en Firebase Database (global)');
        }
        // También guardar en localStorage como caché
        localStorage.setItem('galeriaImagenes', JSON.stringify(galeriaImagenes));
        console.log('✅ Referencias guardadas localmente (caché)');
      } catch (dbError) {
        console.error('⚠️ Error guardando en Firebase Database, usando solo localStorage');
        localStorage.setItem('galeriaImagenes', JSON.stringify(galeriaImagenes));
      }
    } else if (useFirebaseMode && database) {
      try {
        await guardarImagenesGaleriaEnFirebase();
        console.log('✅ Guardado en Firebase Database');
      } catch (dbError) {
        console.error('⚠️ Error guardando en Firebase Database, usando localStorage');
        localStorage.setItem('galeriaImagenes', JSON.stringify(galeriaImagenes));
      }
    } else {
      localStorage.setItem('galeriaImagenes', JSON.stringify(galeriaImagenes));
      console.log('✅ Guardado en localStorage');
    }
    
    progressText.textContent = `✅ ${nuevasImagenes.length} imagen(es) subida(s)`;
    
    // Actualizar vistas
    mostrarImagenesAdmin();
    actualizarGaleriaCliente();
    
    // Limpiar input
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
    
    setTimeout(() => {
      progressBar.style.display = 'none';
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error en subida:', error);
    progressText.textContent = '❌ Error en la subida - usando modo local';
    
    // Último fallback: intentar localStorage
    try {
      console.log('🔄 Último fallback a localStorage');
      await subirArchivosLocal(files, progressFill, progressText, [], 0);
      progressText.textContent = '✅ Imágenes guardadas localmente';
    } catch (fallbackError) {
      console.error('❌ Fallback también falló:', fallbackError);
      alert('Error al subir las imágenes. Por favor, intenta con imágenes más pequeñas.');
    }
    
    setTimeout(() => {
      progressBar.style.display = 'none';
    }, 3000);
  }
}

// Función para subir archivos a Cloudinary
async function subirArchivosCloudinary(files, progressFill, progressText, nuevasImagenes, completados) {
  for (const file of files) {
    // Validar archivo
    if (!file.type.startsWith('image/')) {
      console.warn(`⚠️ Archivo ignorado (no es imagen): ${file.name}`);
      completados++;
      continue;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert(`❌ ${file.name} es muy grande (máx. 5MB)`);
      completados++;
      continue;
    }
    
    try {
      progressText.textContent = `Subiendo ${file.name} a Cloudinary...`;
      
      // Subir a Cloudinary
      const cloudinaryResponse = await uploadToCloudinary(file);
      
      // Crear objeto de imagen
      const nuevaImagen = {
        id: cloudinaryResponse.id,
        nombre: file.name,
        url: cloudinaryResponse.url,
        thumbnail: cloudinaryResponse.thumbnail,
        gallery: cloudinaryResponse.gallery,
        tamaño: file.size,
        tipo: 'cloudinary',
        fechaSubida: new Date().toISOString(),
        cloudinary: {
          publicId: cloudinaryResponse.id,
          format: cloudinaryResponse.format,
          width: cloudinaryResponse.width,
          height: cloudinaryResponse.height,
          bytes: cloudinaryResponse.bytes
        }
      };
      
      nuevasImagenes.push(nuevaImagen);
      completados++;
      
      // Actualizar progreso
      const progreso = (completados / files.length) * 100;
      progressFill.style.width = progreso + '%';
      
      console.log('✅ Imagen subida a Cloudinary:', cloudinaryResponse.id);
      
    } catch (error) {
      console.error('❌ Error subiendo a Cloudinary:', file.name, error);
      completados++;
      
      // Continuar con el siguiente archivo si hay error
      const progreso = (completados / files.length) * 100;
      progressFill.style.width = progreso + '%';
    }
  }
}

// Función para subir archivos en modo desarrollo local
async function subirArchivosLocal(files, progressFill, progressText, nuevasImagenes, completados) {
  for (const file of files) {
    // Validar archivo
    if (!file.type.startsWith('image/')) {
      console.warn(`⚠️ Archivo ignorado (no es imagen): ${file.name}`);
      completados++;
      continue;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert(`❌ ${file.name} es muy grande (máx. 5MB)`);
      completados++;
      continue;
    }
    
    progressText.textContent = `Procesando ${file.name}...`;
    
    // Crear URL de objeto para mostrar la imagen
    const imageUrl = URL.createObjectURL(file);
    
    // Generar ID único
    const timestamp = Date.now();
    const id = `img_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    
    const nuevaImagen = {
      id: id,
      nombre: file.name,
      nombreArchivo: file.name,
      url: imageUrl,
      fechaSubida: new Date().toISOString(),
      tamaño: file.size,
      tipo: 'local' // Marcar como imagen local
    };
    
    nuevasImagenes.push(nuevaImagen);
    completados++;
    
    const progressTotal = (completados / files.length) * 100;
    progressFill.style.width = `${progressTotal}%`;
    
    // Simular un pequeño delay para mostrar el progreso
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// Función para subir archivos a Firebase Storage
async function subirArchivosFirebase(files, progressFill, progressText, nuevasImagenes, completados) {
  for (const file of files) {
    // Validar archivo
    if (!file.type.startsWith('image/')) {
      console.warn(`⚠️ Archivo ignorado (no es imagen): ${file.name}`);
      completados++;
      continue;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert(`❌ ${file.name} es muy grande (máx. 5MB)`);
      completados++;
      continue;
    }
    
    // Generar nombre único
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const nombreArchivo = `galeria_${timestamp}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
    
    // Subir a Firebase Storage
    progressText.textContent = `Subiendo ${file.name}...`;
    
    const storageRef = storage.ref(`galeria/${nombreArchivo}`);
    
    const uploadTask = storageRef.put(file);
    
    await new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          const progressTotal = ((completados + (progress/100)) / files.length) * 100;
          progressFill.style.width = `${progressTotal}%`;
        },
        (error) => {
          console.error('❌ Error subida:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
            
            const nuevaImagen = {
              id: `img_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
              nombre: file.name,
              nombreArchivo: nombreArchivo,
              url: downloadURL,
              fechaSubida: new Date().toISOString(),
              tamaño: file.size,
              tipo: 'firebase'
            };
            
            nuevasImagenes.push(nuevaImagen);
            completados++;
            
            const progressTotal = (completados / files.length) * 100;
            progressFill.style.width = `${progressTotal}%`;
            
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }
}

function mostrarImagenesAdmin() {
  const grid = document.getElementById('admin-images-grid');
  const stats = document.getElementById('gallery-stats');
  const devInfo = document.getElementById('dev-info');
  
  if (!grid || !stats) return;
  
  // Detectar modo actual
  const storageConfig = getStorageConfig ? getStorageConfig() : { mode: 'local' };
  const isLocalMode = storageConfig.mode === 'local';
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  // Mostrar/ocultar mensaje informativo
  if (devInfo) {
    if (isLocalMode || isGitHubPages) {
      devInfo.style.display = 'block';
      
      // Mensaje específico para GitHub Pages
      if (isGitHubPages) {
        devInfo.innerHTML = `
          <div class="info-message">
            <span class="info-icon">ℹ️</span>
            <div class="info-content">
              <strong>Modo Local (GitHub Pages):</strong> Las imágenes se almacenan localmente en tu navegador para evitar errores de CORS. 
              Las imágenes persisten mientras no limpies el caché del navegador.
              <br><small>Para almacenamiento permanente en la nube, necesitas configurar Firebase en un servidor propio.</small>
            </div>
          </div>
        `;
      } else {
        devInfo.innerHTML = `
          <div class="info-message">
            <span class="info-icon">ℹ️</span>
            <div class="info-content">
              <strong>Modo Local:</strong> Las imágenes se almacenan localmente en tu navegador. 
              Para almacenamiento permanente en la nube, configura Firebase Storage en tu servidor.
              <br><small>Las imágenes persisten mientras no limpies el caché del navegador.</small>
            </div>
          </div>
        `;
      }
    } else {
      devInfo.style.display = 'none';
    }
  }
  
  // Actualizar estadísticas
  const imageCount = galeriaImagenes.length;
  const modeText = isLocalMode ? (isGitHubPages ? ' (GitHub Pages - Local)' : ' (Modo Local)') : ' (Firebase)';
  stats.innerHTML = `<span class="image-count">${imageCount} imagen${imageCount !== 1 ? 'es' : ''}${modeText}</span>`;
  
  if (imageCount === 0) {
    grid.innerHTML = `
      <div class="no-images">
        <p>📷 No hay imágenes en la galería aún</p>
        <p>Sube algunas fotos para comenzar</p>
        ${isLocalMode ? '<p><small>Las imágenes se almacenarán en tu navegador</small></p>' : ''}
      </div>
    `;
    return;
  }
  
  // Mostrar imágenes
  const imagenesHTML = galeriaImagenes.map(img => `
    <div class="image-item" data-id="${img.id}">
      <img src="${img.url}" alt="${img.nombre}" loading="lazy">
      <div class="image-actions">
        <button class="action-btn delete-btn" onclick="eliminarImagen('${img.id}')" title="Eliminar">
          🗑️
        </button>
      </div>
      <div class="image-info">
        <p class="image-name">${img.nombre}</p>
        <p class="image-size">${formatearTamaño(img.tamaño)} ${img.tipo === 'local' ? '(Local)' : ''}</p>
      </div>
    </div>
  `).join('');
  
  grid.innerHTML = imagenesHTML;
}

async function eliminarImagen(imageId) {
  const imagen = galeriaImagenes.find(img => img.id === imageId);
  if (!imagen) return;
  
  const confirmar = confirm(`¿Eliminar "${imagen.nombre}"?`);
  if (!confirmar) return;
  
  try {
    // Eliminar según el tipo de imagen
    if (imagen.tipo === 'firebase' && storage) {
      const storageRef = storage.ref(`galeria/${imagen.nombreArchivo}`);
      await storageRef.delete();
      console.log('✅ Imagen eliminada de Firebase Storage');
    } else if (imagen.tipo === 'cloudinary' && typeof deleteFromCloudinary !== 'undefined') {
      // Intentar eliminar de Cloudinary (requiere configuración adicional)
      try {
        await deleteFromCloudinary(imagen.cloudinary?.publicId || imagen.id);
        console.log('✅ Imagen eliminada de Cloudinary');
      } catch (cloudinaryError) {
        console.warn('⚠️ No se pudo eliminar de Cloudinary:', cloudinaryError);
        // Continuar con la eliminación local
      }
    } else if (imagen.tipo === 'local' && imagen.url) {
      // Si es una imagen local, revocar la URL del objeto
      URL.revokeObjectURL(imagen.url);
      console.log('✅ URL de objeto revocada');
    }
    
    // Eliminar del array local
    const index = galeriaImagenes.findIndex(img => img.id === imageId);
    if (index > -1) {
      galeriaImagenes.splice(index, 1);
    }
    
    // Guardar cambios según configuración
    const storageConfig = getStorageConfig ? getStorageConfig() : { mode: 'local' };
    
    try {
      if ((storageConfig.mode === 'firebase' || storageConfig.mode === 'cloudinary') && database) {
        // En modo Firebase o Cloudinary, usar Firebase Database para sincronización
        await guardarImagenesGaleriaEnFirebase();
        console.log('✅ Eliminación sincronizada en Firebase Database (global)');
      }
      // Siempre actualizar localStorage como caché
      localStorage.setItem('galeriaImagenes', JSON.stringify(galeriaImagenes));
      console.log('✅ Cambios guardados en localStorage (caché)');
    } catch (dbError) {
      console.error('⚠️ Error sincronizando eliminación, usando solo localStorage');
      localStorage.setItem('galeriaImagenes', JSON.stringify(galeriaImagenes));
    }
    
    // Actualizar vistas
    mostrarImagenesAdmin();
    actualizarGaleriaCliente();
    
    console.log('✅ Imagen eliminada completamente');
    
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error);
    alert('Error al eliminar la imagen: ' + error.message);
  }
}

function formatearTamaño(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// === FUNCIONES PARA CLIENTE (CARRUSEL) ===
function actualizarGaleriaCliente() {
  const noImages = document.getElementById('no-gallery-images');
  const carouselWrapper = document.getElementById('carousel-wrapper');
  
  if (!noImages || !carouselWrapper) return;
  
  if (galeriaImagenes.length === 0) {
    noImages.style.display = 'block';
    carouselWrapper.style.display = 'none';
    return;
  }
  
  noImages.style.display = 'none';
  carouselWrapper.style.display = 'block';
  
  generarCarrusel();
}

function generarCarrusel() {
  const track = document.getElementById('carousel-track');
  const indicators = document.getElementById('carousel-indicators');
  
  if (!track || !indicators || galeriaImagenes.length === 0) return;
  
  // Generar slides
  const slidesHTML = galeriaImagenes.map((img, index) => `
    <div class="carousel-slide" data-index="${index}">
      <img src="${img.url}" alt="${img.nombre}" loading="lazy">
    </div>
  `).join('');
  
  track.innerHTML = slidesHTML;
  
  // Generar indicadores
  const indicatorsHTML = galeriaImagenes.map((_, index) => `
    <div class="carousel-indicator ${index === 0 ? 'active' : ''}" 
         onclick="goToSlide(${index})"></div>
  `).join('');
  
  indicators.innerHTML = indicatorsHTML;
  
  // Resetear posición
  currentSlide = 0;
  updateCarouselPosition();
  
  // Auto-play del carrusel
  iniciarAutoPlay();
}

function moveCarousel(direction) {
  const totalSlides = galeriaImagenes.length;
  if (totalSlides === 0) return;
  
  currentSlide += direction;
  
  if (currentSlide >= totalSlides) {
    currentSlide = 0;
  } else if (currentSlide < 0) {
    currentSlide = totalSlides - 1;
  }
  
  updateCarouselPosition();
  updateIndicators();
  
  // Reiniciar auto-play
  clearInterval(window.carouselInterval);
  iniciarAutoPlay();
}

function goToSlide(index) {
  if (index < 0 || index >= galeriaImagenes.length) return;
  
  currentSlide = index;
  updateCarouselPosition();
  updateIndicators();
  
  // Reiniciar auto-play
  clearInterval(window.carouselInterval);
  iniciarAutoPlay();
}

function updateCarouselPosition() {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  
  const translateX = -currentSlide * 100;
  track.style.transform = `translateX(${translateX}%)`;
}

function updateIndicators() {
  const indicators = document.querySelectorAll('.carousel-indicator');
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentSlide);
  });
}

function iniciarAutoPlay() {
  if (galeriaImagenes.length <= 1) return;
  
  clearInterval(window.carouselInterval);
  
  window.carouselInterval = setInterval(() => {
    moveCarousel(1);
  }, 5000); // Cambiar cada 5 segundos
}

// === INICIALIZACIÓN DE EVENTOS ===
document.addEventListener('DOMContentLoaded', function() {
  // Configurar eventos de galería cuando el DOM esté listo
  setTimeout(() => {
    configurarEventosGaleria();
  }, 100);
  
  // Pausar auto-play cuando la pestaña no está visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(window.carouselInterval);
    } else if (galeriaImagenes.length > 1) {
      iniciarAutoPlay();
    }
  });
});
