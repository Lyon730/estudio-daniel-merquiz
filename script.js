// Confirmación de reserva y armado de mensaje para WhatsApp
document.getElementById("form-reserva").addEventListener("submit", function (e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const fecha = document.getElementById("fecha").value;

  const fechaFmt = fecha ? new Date(fecha).toLocaleString() : "";
  const mensaje = `Hola, soy ${nombre}. Quiero reservar para el ${fechaFmt}. Mi teléfono: ${telefono}.`;
  const wa = document.getElementById("wa-btn");
  const base = wa.getAttribute("href").split("?")[0];
  wa.setAttribute("href", base + `?text=${encodeURIComponent(mensaje)}`);

  alert("Reserva preparada. Presiona el botón verde para enviar por WhatsApp.");
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
}

// ===== SISTEMA DE CALENDARIO PARA HORARIOS =====
let fechaActual = new Date();
let horariosGuardados = {}; // Almacenará los horarios por fecha

function inicializarCalendario() {
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
  document.getElementById('horarios-form').addEventListener('submit', function(e) {
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
// --- FIN INICIO DE SESIÓN ADMIN ---
