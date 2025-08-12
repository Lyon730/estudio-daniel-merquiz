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
}
// --- FIN INICIO DE SESIÓN ADMIN ---
