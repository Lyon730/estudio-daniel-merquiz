// ===== CONFIGURACIÓN DE FIREBASE =====
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

// ===== VARIABLES GLOBALES =====
let fechaActual = new Date();
let horariosGuardados = {};
let reservasOcupadas = {};

// ===== FUNCIONES DE FIREBASE =====
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
    }
  } catch (error) {
    console.error('❌ Error al cargar horarios desde Firebase:', error);
  }
}

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

async function inicializarDatos() {
  console.log('🚀 Inicializando datos...');
  await cargarHorariosDesdeFirebase();
  await cargarReservasDesdeFirebase();
  console.log('✅ Datos inicializados correctamente');
}

// ===== FUNCIONES PRINCIPALES =====
function showAdminPanel() {
  document.querySelector('header').style.display = 'none';
  document.querySelector('main').style.display = 'none';
  document.querySelector('footer').style.display = 'none';
  document.querySelector('.sticky-nav').style.display = 'none';
  
  const adminPanel = document.getElementById('admin-panel');
  if (adminPanel) {
    adminPanel.style.display = 'block';
  }
  
  setTimeout(async () => {
    console.log('🔄 Inicializando panel de admin...');
    await inicializarDatos();
    console.log('📅 Inicializando calendario en panel admin...');
    inicializarCalendario();
  }, 200);
}

function logoutAdmin() {
  document.querySelector('header').style.display = 'block';
  document.querySelector('main').style.display = 'block';
  document.querySelector('footer').style.display = 'block';
  document.querySelector('.sticky-nav').style.display = 'block';
  
  const adminPanel = document.getElementById('admin-panel');
  if (adminPanel) {
    adminPanel.style.display = 'none';
  }
  
  document.getElementById("admin-user").value = '';
  document.getElementById("admin-pass").value = '';
  document.getElementById("login-error").style.display = "none";
}

function showAdminTab(tabName) {
  document.querySelectorAll('.admin-tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  document.querySelectorAll('.admin-tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }
  
  const selectedButton = document.querySelector(`[onclick="showAdminTab('${tabName}')"]`);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }
  
  if (tabName === 'horas-tab') {
    inicializarCalendario();
  }
}

function inicializarCalendario() {
  console.log('📅 Iniciando inicialización de calendario...');
  
  const calendarDays = document.getElementById('calendar-days');
  const monthYearElement = document.getElementById('current-month-year');
  
  console.log('🔍 Verificando elementos DOM:', {
    calendarDays: !!calendarDays,
    monthYearElement: !!monthYearElement
  });
  
  if (!calendarDays || !monthYearElement) {
    console.log('⏳ Elementos no disponibles, reintentando en 100ms...');
    setTimeout(() => {
      inicializarCalendario();
    }, 100);
    return;
  }
  
  console.log('✅ Elementos encontrados, mostrando calendario');
  mostrarCalendario(fechaActual.getFullYear(), fechaActual.getMonth());
}

function mostrarCalendario(año, mes) {
  console.log(`📅 Mostrando calendario para ${año}/${mes + 1}`);
  
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const monthYearElement = document.getElementById('current-month-year');
  if (monthYearElement) {
    monthYearElement.textContent = `${nombresMeses[mes]} ${año}`;
  }
  
  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  
  let diaSemanaPrimero = primerDia.getDay();
  diaSemanaPrimero = diaSemanaPrimero === 0 ? 6 : diaSemanaPrimero - 1;
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const calendarDays = document.getElementById('calendar-days');
  if (!calendarDays) return;
  
  calendarDays.innerHTML = '';
  
  for (let i = 0; i < diaSemanaPrimero; i++) {
    const diaVacio = document.createElement('div');
    diaVacio.className = 'calendar-day other-month';
    calendarDays.appendChild(diaVacio);
  }
  
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fechaDia = new Date(año, mes, dia);
    const diaElement = document.createElement('div');
    diaElement.className = 'calendar-day';
    diaElement.textContent = dia;
    
    if (fechaDia < hoy) {
      diaElement.classList.add('disabled');
    } else {
      diaElement.addEventListener('click', () => abrirModalHorarios(fechaDia));
      diaElement.classList.add('active');
    }
    
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
  
  const fechaSeleccionada = document.getElementById('fecha-seleccionada');
  if (fechaSeleccionada) {
    fechaSeleccionada.textContent = `Configurando horarios para: ${fechaStr}`;
  }
  
  window.fechaSeleccionadaActual = fecha;
  
  const claveFecha = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`;
  const horariosExistentes = horariosGuardados[claveFecha];
  
  if (horariosExistentes) {
    document.getElementById('manana-inicio').value = horariosExistentes.mañana.inicio || '';
    document.getElementById('manana-fin').value = horariosExistentes.mañana.fin || '';
    document.getElementById('tarde-inicio').value = horariosExistentes.tarde.inicio || '';
    document.getElementById('tarde-fin').value = horariosExistentes.tarde.fin || '';
  } else {
    document.getElementById('manana-inicio').value = '';
    document.getElementById('manana-fin').value = '';
    document.getElementById('tarde-inicio').value = '';
    document.getElementById('tarde-fin').value = '';
  }
  
  document.getElementById('horarios-modal').style.display = 'flex';
}

function cerrarModalHorarios() {
  console.log('🚪 Cerrando modal de horarios...');
  const modal = document.getElementById('horarios-modal');
  if (modal) {
    modal.style.display = 'none';
    console.log('✅ Modal cerrado exitosamente');
  }
}

// ===== EVENTOS PRINCIPALES =====
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📱 Página cargada, inicializando sistema completo...');
  
  // === EVENTOS DE LOGIN ===
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
  
  const closeLogin = document.getElementById("close-login");
  if (closeLogin) {
    closeLogin.addEventListener("click", () => {
      const modal = document.getElementById("login-modal");
      const error = document.getElementById("login-error");
      if (modal) modal.style.display = "none";
      if (error) error.style.display = "none";
    });
  }
  
  const adminForm = document.getElementById("admin-login-form");
  if (adminForm) {
    adminForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const user = document.getElementById("admin-user").value.trim();
      const pass = document.getElementById("admin-pass").value.trim();
      
      if (user === "admin" && pass === "1234") {
        document.getElementById("login-modal").style.display = "none";
        showAdminPanel();
      } else {
        document.getElementById("login-error").style.display = "block";
      }
    });
  }

  // === EVENTOS DEL FORMULARIO DE HORARIOS ===
  const horariosForm = document.getElementById('horarios-form');
  if (horariosForm) {
    horariosForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('📅 Formulario de horarios enviado');
      
      const fecha = window.fechaSeleccionadaActual;
      if (!fecha) {
        alert('No se ha seleccionado una fecha válida');
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
        mañana: {
          inicio: mananaInicio,
          fin: mananaFin
        },
        tarde: {
          inicio: tardeInicio,
          fin: tardeFin
        }
      };
      
      console.log('💾 Guardando horarios:', horariosGuardados[claveFecha]);
      
      // CERRAR MODAL INMEDIATAMENTE
      console.log('🚪 Cerrando modal INMEDIATAMENTE...');
      document.getElementById('horarios-modal').style.display = 'none';
      console.log('✅ Modal cerrado');
      
      try {
        console.log('☁️ Guardando en Firebase...');
        await guardarHorariosEnFirebase();
        console.log('✅ Firebase guardado exitosamente');
        
        setTimeout(() => {
          console.log('🔄 Actualizando calendario...');
          mostrarCalendario(fechaActual.getFullYear(), fechaActual.getMonth());
        }, 100);
        
        setTimeout(() => {
          alert('Horarios guardados exitosamente para ' + fecha.toLocaleDateString('es-ES'));
        }, 500);
        
      } catch (error) {
        console.error('❌ Error al guardar en Firebase:', error);
        alert('Horarios guardados localmente. Error de conexión a Firebase.');
      }
    });
    console.log('✅ Evento del formulario de horarios configurado');
  }
  
  // === INICIALIZAR DATOS ===
  await inicializarDatos();
  
  // === CONFIGURAR FECHA MÍNIMA PARA RESERVAS ===
  const fechaInput = document.getElementById('fecha-reserva');
  if (fechaInput) {
    const hoy = new Date();
    const fechaMinima = hoy.toISOString().split('T')[0];
    fechaInput.setAttribute('min', fechaMinima);
  }
  
  console.log('✅ Sistema completo inicializado correctamente');
});

// ===== OTROS EVENTOS =====

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
  
  const año = fecha.getFullYear();
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  const claveReserva = `${año}-${mes}-${dia}-${horaSeleccionada}`;
  
  reservasOcupadas[claveReserva] = {
    nombre: nombre,
    telefono: telefono,
    fecha: fechaReserva,
    hora: horaSeleccionada,
    fechaReserva: new Date().toISOString(),
    tipo: 'cliente',
    confirmada: false
  };
  
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
});

// Pausar video cuando la pestaña no está visible
document.addEventListener("visibilitychange", () => {
  const v = document.querySelector(".hero-video");
  if (!v) return;
  if (document.hidden) v.pause();
  else v.play().catch(() => {});
});

// Menú sticky
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
