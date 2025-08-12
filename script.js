// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// ===== CONFIGURACIÓN DE FIREBASE =====
// IMPORTANTE: Reemplaza esta configuración con la tuya desde Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCqix70kqE3MPh_lwz0uolGECT1MerteUU",
  authDomain: "estudio-daniel-merquiz.firebaseapp.com",
  databaseURL: "https://estudio-daniel-merquiz-default-rtdb.firebaseio.com",
  projectId: "estudio-daniel-merquiz",
  storageBucket: "estudio-daniel-merquiz.firebasestorage.app",
  messagingSenderId: "876381250367",
  appId: "1:876381250367:web:90c685ecce6312b362a98a",
  measurementId: "G-LP5VVC2WS7"
};

// Inicializar Firebase
let database;
try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log('🔥 Firebase inicializado correctamente');
  } else {
    console.warn('⚠️ Firebase no está disponible, usando modo local');
    database = null;
  }
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error);
  database = null;
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
// Mostrar modal al hacer clic en el logo
if (document.getElementById("login-logo")) {
  document.getElementById("login-logo").addEventListener("click", () => {
    document.getElementById("login-modal").style.display = "flex";
  });
}
// Cerrar modal
if (document.getElementById("close-login")) {
  document.getElementById("close-login").addEventListener("click", () => {
    document.getElementById("login-modal").style.display = "none";
    document.getElementById("login-error").style.display = "none";
  });
}
// Validar usuario administrador
if (document.getElementById("admin-login-form")) {
  document.getElementById("admin-login-form").addEventListener("submit", function(e) {
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

// Función para mostrar el panel de administración
function showAdminPanel() {
  // Ocultar el contenido principal
  document.querySelector('header').style.display = 'none';
  document.querySelector('main').style.display = 'none';
  document.querySelector('footer').style.display = 'none';
  document.querySelector('.sticky-nav').style.display = 'none';
  
  // Mostrar el panel de administración
  const adminPanel = document.getElementById('admin-panel');
  if (adminPanel) {
    adminPanel.style.display = 'block';
  }
  
  // Inicializar datos y calendario después de que el panel sea visible
  setTimeout(async () => {
    await inicializarDatos();
    inicializarCalendario();
  }, 100);
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
    mostrarReservasDisponibles();
  }
}

// ===== SISTEMA DE CALENDARIO PARA HORARIOS =====
let fechaActual = new Date();
let horariosGuardados = {}; // Almacenará los horarios por fecha
let reservasOcupadas = {}; // Almacenará las reservas ocupadas por fecha y hora

// ===== FUNCIONES DE FIREBASE =====

// Función para cargar horarios desde Firebase
async function cargarHorariosDesdeFirebase() {
  if (!database) {
    console.log('Firebase no disponible, usando datos locales');
    return;
  }
  
  try {
    const snapshot = await database.ref('horarios').once('value');
    const horarios = snapshot.val();
    
    if (horarios) {
      horariosGuardados = horarios;
      console.log('✅ Horarios cargados desde Firebase:', horarios);
      
      // Actualizar el calendario si está visible
      if (document.getElementById('calendar-days')) {
        mostrarCalendario(fechaActual.getFullYear(), fechaActual.getMonth());
      }
    }
  } catch (error) {
    console.error('❌ Error al cargar horarios desde Firebase:', error);
  }
}

// Función para guardar horarios en Firebase
async function guardarHorariosEnFirebase() {
  if (!database) {
    console.log('Firebase no disponible, guardando solo localmente');
    return;
  }
  
  try {
    await database.ref('horarios').set(horariosGuardados);
    console.log('✅ Horarios guardados en Firebase');
  } catch (error) {
    console.error('❌ Error al guardar horarios en Firebase:', error);
  }
}

// Función para cargar reservas desde Firebase
async function cargarReservasDesdeFirebase() {
  if (!database) {
    console.log('Firebase no disponible, usando datos locales');
    return;
  }
  
  try {
    const snapshot = await database.ref('reservas').once('value');
    const reservas = snapshot.val();
    
    if (reservas) {
      reservasOcupadas = reservas;
      console.log('✅ Reservas cargadas desde Firebase:', reservas);
    }
  } catch (error) {
    console.error('❌ Error al cargar reservas desde Firebase:', error);
  }
}

// Función para guardar reservas en Firebase
async function guardarReservasEnFirebase() {
  if (!database) {
    console.log('Firebase no disponible, guardando solo localmente');
    return;
  }
  
  try {
    await database.ref('reservas').set(reservasOcupadas);
    console.log('✅ Reservas guardadas en Firebase');
  } catch (error) {
    console.error('❌ Error al guardar reservas en Firebase:', error);
  }
}

// Función para limpiar datos antiguos automáticamente
async function limpiarDatosAntiguos() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  let huboLimpieza = false;
  
  // Limpiar horarios de fechas pasadas
  Object.keys(horariosGuardados).forEach(claveFecha => {
    const [año, mes, dia] = claveFecha.split('-').map(Number);
    const fecha = new Date(año, mes - 1, dia);
    
    if (fecha < hoy) {
      delete horariosGuardados[claveFecha];
      huboLimpieza = true;
    }
  });
  
  // Limpiar reservas de fechas pasadas
  Object.keys(reservasOcupadas).forEach(claveReserva => {
    const fechaParte = claveReserva.split('-').slice(0, 3).join('-');
    const [año, mes, dia] = fechaParte.split('-').map(Number);
    const fecha = new Date(año, mes - 1, dia);
    
    if (fecha < hoy) {
      delete reservasOcupadas[claveReserva];
      huboLimpieza = true;
    }
  });
  
  // Guardar los datos limpios si hubo cambios
  if (huboLimpieza) {
    console.log('🧹 Limpiando datos antiguos...');
    await guardarHorariosEnFirebase();
    await guardarReservasEnFirebase();
  }
}

// Función para inicializar datos al cargar la página
async function inicializarDatos() {
  console.log('🚀 Inicializando datos...');
  
  // Cargar datos desde Firebase
  await cargarHorariosDesdeFirebase();
  await cargarReservasDesdeFirebase();
  
  // Limpiar datos antiguos
  await limpiarDatosAntiguos();
  
  console.log('✅ Datos inicializados correctamente');
}

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
    
    // Verificar si es una fecha pasada
    if (fechaDia < hoy) {
      diaElement.classList.add('disabled');
    } else {
      // Hacer clic solo en días habilitados
      diaElement.addEventListener('click', () => abrirModalHorarios(fechaDia));
      diaElement.classList.add('active');
    }
    
    // Verificar si ya tiene horarios guardados
    const claveDate = `${año}-${mes + 1}-${dia}`;
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
    
    const fecha = window.fechaSeleccionadaActual;
    if (!fecha) return;
    
    // Obtener los valores del formulario
    const mananaInicio = document.getElementById('manana-inicio').value;
    const mananaFin = document.getElementById('manana-fin').value;
    const tardeInicio = document.getElementById('tarde-inicio').value;
    const tardeFin = document.getElementById('tarde-fin').value;
    
    // Validar que al menos un turno esté completo
    const tieneManana = mananaInicio && mananaFin;
    const tieneTarde = tardeInicio && tardeFin;
    
    if (!tieneManana && !tieneTarde) {
      alert('Debe configurar al menos un turno completo (mañana o tarde)');
      return;
    }
    
    // Guardar los horarios
    const claveFecha = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`;
    horariosGuardados[claveFecha] = {
      mañana: {
        inicio: mananaInicio,
        fin: mananaFin
      },
      tarde: {
        inicio: tardeInicio,
        fin: tardeFin
      }
    };
    
    // Guardar en Firebase
    await guardarHorariosEnFirebase();
    
    // Actualizar el calendario para mostrar que tiene horarios
    mostrarCalendario(fechaActual.getFullYear(), fechaActual.getMonth());
    
    // Cerrar el modal
    cerrarModalHorarios();
    
    // Mostrar confirmación
    alert('Horarios guardados exitosamente para ' + fecha.toLocaleDateString('es-ES'));
  });
}

// Cerrar modal al hacer clic en la X
if (document.getElementById('close-horarios')) {
  document.getElementById('close-horarios').addEventListener('click', cerrarModalHorarios);
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
  
  const slotsHtml = slots.map(slot => `
    <div class="horario-slot ${slot.ocupado ? 'ocupado' : ''}" 
         onclick="${slot.ocupado ? '' : `reservarCita('${slot.clave}', '${slot.hora}')`}">
      ${slot.hora}
      ${slot.ocupado ? '<br><small>Ocupado</small>' : ''}
    </div>
  `).join('');
  
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
    
    // Guardar en Firebase
    await guardarReservasEnFirebase();
    
    // Actualizar la vista
    mostrarReservasDisponibles();
    
    alert(`Cita reservada exitosamente para las ${hora}`);
  }
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

// Validar que no se puedan seleccionar fechas pasadas
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📱 Página cargada, inicializando...');
  
  // Cargar datos desde Firebase
  await inicializarDatos();
  
  const fechaInput = document.getElementById('fecha-reserva');
  if (fechaInput) {
    // Establecer fecha mínima como hoy
    const hoy = new Date();
    const fechaMinima = hoy.toISOString().split('T')[0];
    fechaInput.setAttribute('min', fechaMinima);
  }
  
  console.log('✅ Inicialización completa');
});
// --- FIN INICIO DE SESIÓN ADMIN ---
