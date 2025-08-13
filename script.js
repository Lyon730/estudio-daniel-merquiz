// ===== CONFIGURACIÓN DE FIREBASE =====
// IMPORTANTE: Configuración de Firebase para tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyCqix70kqE3MPh_lwz0uolGECT1MerteUU",
  authDomain: "estudio-daniel-merquiz.firebaseapp.com",
  databaseURL: "https://estudio-daniel-merquiz-default-rtdb.firebaseio.com", // <-- añadida (faltaba)
  projectId: "estudio-daniel-merquiz",
  storageBucket: "estudio-daniel-merquiz.firebasestorage.app",
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
  } else {
    console.warn('⚠️ Firebase no está disponible, usando modo local');
    database = null;
    storage = null;
  }
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error);
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

// Función para cerrar sesión de admin
function logoutAdmin() {
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
}

// === VARIABLES GLOBALES (declaradas temprano para evitar TDZ) ===
let fechaActual = new Date();
let horariosGuardados = {}; // horarios por fecha
let reservasOcupadas = {}; // reservas por slot
let datosListos = false; // nuevo flag
let galeriaImagenes = []; // Array para almacenar imágenes de la galería
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
  await cargarHorariosDesdeFirebase();
  await cargarReservasDesdeFirebase();
  await cargarImagenesGaleriaDesdeFirebase();
  await limpiarDatosAntiguos();
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
  
  // Validar usuario administrador
  const adminForm = document.getElementById("admin-login-form");
  if (adminForm) {
    adminForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const user = document.getElementById("admin-user").value.trim();
      const pass = document.getElementById("admin-pass").value.trim();
      // Usuario y contraseña de ejemplo
      if (user === "admin" && pass === "1234") {
        document.getElementById("login-modal").style.display = "none";
        showAdminPanel();
      } else {
        document.getElementById("login-error").style.display = "block";
      }
    });
  }
  
  // === INICIALIZAR DATOS Y CONFIGURACIÓN ===
  // Cargar datos desde Firebase
  await inicializarDatos();
  
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
  if (!database) return;
  try {
    const snap = await database.ref('galeria').once('value');
    const data = snap.val();
    if (data) {
      galeriaImagenes = Object.values(data);
      console.log('✅ (load) Imágenes galería:', galeriaImagenes.length);
    } else {
      console.log('ℹ️ (load) No hay imágenes en la galería');
      galeriaImagenes = [];
    }
  } catch (err) {
    console.error('❌ cargarImagenesGaleriaDesdeFirebase:', err);
    galeriaImagenes = [];
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
  
  if (!storage) {
    alert('❌ Sistema de almacenamiento no disponible. Verifica la conexión.');
    return;
  }
  
  progressBar.style.display = 'block';
  progressFill.style.width = '0%';
  progressText.textContent = 'Preparando subida...';
  
  const nuevasImagenes = [];
  let completados = 0;
  
  try {
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
                tamaño: file.size
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
    
    // Agregar imágenes al array global
    galeriaImagenes.push(...nuevasImagenes);
    
    // Guardar en Firebase Database
    await guardarImagenesGaleriaEnFirebase();
    
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
    progressText.textContent = '❌ Error en la subida';
    alert('Error al subir las imágenes. Inténtalo de nuevo.');
    
    setTimeout(() => {
      progressBar.style.display = 'none';
    }, 3000);
  }
}

function mostrarImagenesAdmin() {
  const grid = document.getElementById('admin-images-grid');
  const stats = document.getElementById('gallery-stats');
  
  if (!grid || !stats) return;
  
  // Actualizar estadísticas
  const imageCount = galeriaImagenes.length;
  stats.innerHTML = `<span class="image-count">${imageCount} imagen${imageCount !== 1 ? 'es' : ''}</span>`;
  
  if (imageCount === 0) {
    grid.innerHTML = `
      <div class="no-images">
        <p>📷 No hay imágenes en la galería aún</p>
        <p>Sube algunas fotos para comenzar</p>
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
        <p class="image-size">${formatearTamaño(img.tamaño)}</p>
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
    // Eliminar de Firebase Storage
    if (storage) {
      const storageRef = storage.ref(`galeria/${imagen.nombreArchivo}`);
      await storageRef.delete();
      console.log('✅ Imagen eliminada de Storage');
    }
    
    // Eliminar del array local
    const index = galeriaImagenes.findIndex(img => img.id === imageId);
    if (index > -1) {
      galeriaImagenes.splice(index, 1);
    }
    
    // Actualizar Firebase Database
    await guardarImagenesGaleriaEnFirebase();
    
    // Actualizar vistas
    mostrarImagenesAdmin();
    actualizarGaleriaCliente();
    
    console.log('✅ Imagen eliminada completamente');
    
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error);
    alert('Error al eliminar la imagen. Inténtalo de nuevo.');
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
