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
      alert("Bienvenido administrador");
      document.getElementById("login-modal").style.display = "none";
      // Aquí puedes redirigir o mostrar opciones de admin
    } else {
      document.getElementById("login-error").style.display = "block";
    }
  });
}
// --- FIN INICIO DE SESIÓN ADMIN ---
