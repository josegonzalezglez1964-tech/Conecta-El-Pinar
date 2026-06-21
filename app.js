// ==========================================================================
// PINARCONNECT - CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// ==========================================================================
const firebaseConfig = {
    apiKey: "AIzaSyCqvz3vJOnFsYbxsONUl48YaxGC7raRSg",
    authDomain: "pinarconnect.firebaseapp.com",
    databaseURL: "https://pinarconnect-default-rtdb.firebaseio.com",
    projectId: "pinarconnect",
    storageBucket: "pinarconnect.firebasestorage.app",
    messagingSenderId: "1071169307553",
    appId: "1:1071169307553:web:e6b17058e171fd67d941e0",
    measurementId: "G-9T7QJZP6DW"
};

firebase.initializeApp(firebaseConfig);
const baseDatos = firebase.database();
const auth = firebase.auth();

// ==========================================================================
// ACCESO VECINAL — Enlace de correo (passwordless)
// ==========================================================================

// Si el usuario llega a la web haciendo clic en el enlace que le enviamos por correo,
// completamos aquí el inicio de sesión.
if (auth.isSignInWithEmailLink(window.location.href)) {
    let emailGuardado = window.localStorage.getItem('pinarconnect_email');
    if (!emailGuardado) {
        // Si abrió el enlace en otro dispositivo/navegador, se lo pedimos de nuevo.
        emailGuardado = window.prompt('Confirma tu correo electrónico para completar el acceso:');
    }
    if (emailGuardado) {
        auth.signInWithEmailLink(emailGuardado, window.location.href)
            .then(() => {
                window.localStorage.removeItem('pinarconnect_email');
                // Limpiamos la URL para que no se quede el enlace de un solo uso visible
                window.history.replaceState({}, document.title, window.location.pathname);
            })
            .catch((error) => {
                console.error('Error al completar el acceso:', error);
                alert('El enlace no es válido o ha caducado. Pide uno nuevo desde "Iniciar sesión".');
            });
    }
}

// Evita que el texto escrito por un vecino pueda romper el HTML de la página
function escapeHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto == null ? '' : texto;
    return div.innerHTML;
}

function formatearFecha(iso) {
    try {
        return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
        return 'Hace un momento';
    }
}

// ==========================================================================
// FILTRO DE MODERACIÓN DEL MENTIDERO
// ==========================================================================
const PALABRAS_PROHIBIDAS = ["insulto1", "insulto2", "ofensa3", "mierda", "tonto", "bobo"];

function validarMensajeMentidero(texto) {
    const textoMinuscula = (texto || '').toLowerCase();
    return !PALABRAS_PROHIBIDAS.some(palabra => textoMinuscula.includes(palabra));
}

// ==========================================================================
// NOTIFICACIONES LOCALES (opcional, no se activan automáticamente)
// ==========================================================================
function solicitarPermisoNotificaciones() {
    if (!("Notification" in window)) {
        console.error("Este navegador no soporta alertas de escritorio.");
        return;
    }
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().then((permiso) => {
            if (permiso === "granted") {
                enviarNotificacionLocal("PinarConnect", "¡Perfecto! Te avisaremos aquí cuando ocurra una alerta en el municipio.");
            }
        });
    }
}

function enviarNotificacionLocal(titulo, mensaje) {
    if (Notification.permission === "granted") {
        new Notification(titulo, { body: mensaje });
    }
}

// ==========================================================================
// MOTOR PRINCIPAL DE LA APP
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. NAVEGACIÓN ENTRE VISTAS ---
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.view');
    const inlineBtns = document.querySelectorAll('[data-switch-view]');

    function switchView(viewName) {
        navTabs.forEach(tab => tab.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));

        const activeTab = document.querySelector(`.nav-tab[data-view="${viewName}"]`);
        if (activeTab) activeTab.classList.add('active');

        const targetSection = document.getElementById(`view-${viewName}`);
        if (targetSection) targetSection.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'instant' });
        const contentContainer = document.querySelector('.content');
        if (contentContainer) contentContainer.scrollTop = 0;

        const heroElement = document.querySelector('.hero');
        if (heroElement) heroElement.style.display = (viewName === 'inicio') ? '' : 'none';

        if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    navTabs.forEach(tab => tab.addEventListener('click', () => switchView(tab.getAttribute('data-view'))));
    inlineBtns.forEach(btn => btn.addEventListener('click', () => switchView(btn.getAttribute('data-switch-view'))));


    // --- 2. ACCESO VECINAL (LOGIN POR ENLACE DE CORREO) ---
    const authLoggedOut = document.getElementById('authLoggedOut');
    const authLoggedIn = document.getElementById('authLoggedIn');
    const authEmailDisplay = document.getElementById('authEmailDisplay');
    const btnAbrirLogin = document.getElementById('btnAbrirLogin');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    const loginForm = document.getElementById('loginForm');
    const loginModal = document.getElementById('loginModal');

    auth.onAuthStateChanged((user) => {
        if (user) {
            if (authLoggedOut) authLoggedOut.style.display = 'none';
            if (authLoggedIn) authLoggedIn.style.display = 'block';
            if (authEmailDisplay) authEmailDisplay.textContent = user.email;
        } else {
            if (authLoggedOut) authLoggedOut.style.display = 'block';
            if (authLoggedIn) authLoggedIn.style.display = 'none';
        }
    });

    if (btnAbrirLogin) btnAbrirLogin.addEventListener('click', () => loginModal.showModal());
    if (btnCerrarSesion) btnCerrarSesion.addEventListener('click', () => auth.signOut());

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const actionCodeSettings = {
                url: window.location.origin + window.location.pathname,
                handleCodeInApp: true
            };
            auth.sendSignInLinkToEmail(email, actionCodeSettings)
                .then(() => {
                    window.localStorage.setItem('pinarconnect_email', email);
                    loginForm.reset();
                    loginModal.close();
                    alert(`✅ Te hemos enviado un enlace a ${email}. Ábrelo desde este mismo dispositivo para entrar.`);
                })
                .catch((error) => {
                    console.error('Error al enviar el enlace de acceso:', error);
                    alert('No se pudo enviar el enlace. Comprueba el correo e inténtalo de nuevo.');
                });
        });
    }

    // Abre el modal de login en vez del modal de publicar si el vecino no ha iniciado sesión
    function requiereSesion() {
        if (!auth.currentUser) {
            if (loginModal) loginModal.showModal();
            return true;
        }
        return false;
    }


    // --- 3. CONTROL DE MODALES ---
    document.querySelectorAll('[data-open-modal]').forEach(button => {
        button.addEventListener('click', () => {
            const modalType = button.getAttribute('data-open-modal');
            if (['favor', 'mentidero', 'alerta'].includes(modalType) && requiereSesion()) return;
            const targetModal = document.getElementById(`${modalType}Modal`);
            if (targetModal) targetModal.showModal();
        });
    });

    document.querySelectorAll('dialog.modal').forEach(dialog => {
        dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    });

    document.querySelectorAll('dialog.modal button[value="cancel"], dialog.modal .secondary-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = button.closest('dialog.modal');
            if (modal) modal.close();
        });
    });


    // --- 4. MERCADILLO DE FAVORES (conectado a Firebase) ---
    const favorForm = document.getElementById('favorForm');
    const favoresList = document.getElementById('favoresList');
    const inicioFavores = document.getElementById('inicioFavores');
    const favoresCount = document.getElementById('favoresCount');
    const favorTipoSelect = document.getElementById('favorTipo');
    const favorBusquedaInput = document.getElementById('favorBusqueda');

    function crearTarjetaFavor(favor) {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'post-card';
        tarjeta.setAttribute('data-tipo', favor.tipo);
        tarjeta.setAttribute('data-buscar', `${favor.titulo} ${favor.detalle} ${favor.zona}`.toLowerCase());
        tarjeta.innerHTML = `
            <div class="post-head">
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <span class="badge ${favor.tipo}">${favor.tipo === 'ofrezco' ? 'Ofrezco ayuda' : 'Necesito ayuda'}</span>
                    <span class="badge zona">📍 ${escapeHTML(favor.zona)}</span>
                </div>
            </div>
            <h3 class="post-title">${escapeHTML(favor.titulo)}</h3>
            <p style="margin: 0; color: var(--text-main); font-size: 14px; line-height: 1.5;">${escapeHTML(favor.detalle)}</p>
            <div class="post-meta">
                <span>🏷️ ${escapeHTML(favor.tags || 'comunidad')}</span>
                <span>• ${formatearFecha(favor.fecha_creacion)}</span>
            </div>
        `;
        return tarjeta;
    }

    function renderFavores(snapshotVal) {
        if (!favoresList) return;
        favoresList.innerHTML = '';
        if (inicioFavores) inicioFavores.innerHTML = '';

        const entradas = snapshotVal ? Object.values(snapshotVal).reverse() : [];
        if (favoresCount) favoresCount.textContent = entradas.length;

        entradas.forEach(favor => {
            favoresList.appendChild(crearTarjetaFavor(favor));
            if (inicioFavores && inicioFavores.children.length < 5) {
                const mini = document.createElement('div');
                mini.style.padding = '12px';
                mini.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
                mini.innerHTML = `<strong style="color: var(--pinar-green); font-size: 14px;">[${escapeHTML(favor.zona)}]</strong> <span style="font-size: 14px; color: var(--text-main); font-weight: 500;">${escapeHTML(favor.titulo)}</span>`;
                inicioFavores.appendChild(mini);
            }
        });
        ejecutarFiltroFavores();
    }

    function ejecutarFiltroFavores() {
        const tipoSeleccionado = favorTipoSelect ? favorTipoSelect.value : 'todos';
        const textoBusqueda = favorBusquedaInput ? favorBusquedaInput.value.toLowerCase().trim() : '';
        const tarjetas = favoresList ? favoresList.querySelectorAll('.post-card') : [];

        tarjetas.forEach(tarjeta => {
            const coincideTipo = (tipoSeleccionado === 'todos' || tarjeta.getAttribute('data-tipo') === tipoSeleccionado);
            const coincideTexto = (textoBusqueda === '' || tarjeta.getAttribute('data-buscar').includes(textoBusqueda));
            tarjeta.style.display = (coincideTipo && coincideTexto) ? 'flex' : 'none';
        });
    }

    if (favorTipoSelect) favorTipoSelect.addEventListener('change', ejecutarFiltroFavores);
    if (favorBusquedaInput) favorBusquedaInput.addEventListener('input', ejecutarFiltroFavores);

    // Escucha en tiempo real los favores guardados en Firebase
    baseDatos.ref('favores').on('value', (snapshot) => renderFavores(snapshot.val()));

    if (favorForm) {
        favorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (requiereSesion()) { document.getElementById('favorModal').close(); return; }
            const nuevoFavor = {
                tipo: document.getElementById('nuevoFavorTipo').value,
                titulo: document.getElementById('nuevoFavorTitulo').value,
                zona: document.getElementById('nuevoFavorZona').value,
                tags: document.getElementById('nuevoFavorTags').value,
                detalle: document.getElementById('nuevoFavorDetalle').value,
                fecha_creacion: new Date().toISOString(),
                estado: 'ACTIVO',
                usuario_email: auth.currentUser.email
            };
            baseDatos.ref('favores').push(nuevoFavor)
                .then(() => {
                    favorForm.reset();
                    document.getElementById('favorModal').close();
                })
                .catch((error) => {
                    console.error('Error al guardar favor en Firebase:', error);
                    alert('No se pudo publicar el favor. Revisa tu conexión e inténtalo de nuevo.');
                });
        });
    }


    // --- 5. MI PERFIL (local, no requiere base de datos) ---
    const profileForm = document.getElementById('profileForm');
    const profileName = document.getElementById('profileName');
    const profileZone = document.getElementById('profileZone');
    const profileSkills = document.getElementById('profileSkills');
    const profileBio = document.getElementById('profileBio');
    const previewName = document.getElementById('previewName');
    const previewZone = document.getElementById('previewZone');
    const previewSkills = document.getElementById('previewSkills');
    const previewBio = document.getElementById('previewBio');
    const profileAvatar = document.getElementById('profileAvatar');

    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = profileName.value.trim() || 'Vecino/a de El Pinar';
            const zona = profileZone.value.trim() || 'Comunidad cercana y activa';
            const habilidades = profileSkills.value.trim() || 'Aún no has indicado qué te gusta compartir.';
            const biografia = profileBio.value.trim() || 'Aquí siempre cabe un gesto amable más.';

            if (previewName) previewName.textContent = nombre;
            if (previewZone) previewZone.textContent = `📍 ${zona}`;
            if (previewSkills) previewSkills.textContent = habilidades;
            if (previewBio) previewBio.textContent = `"${biografia}"`;
            if (profileAvatar && nombre !== 'Vecino/a de El Pinar') {
                profileAvatar.textContent = nombre.charAt(0).toUpperCase();
            }
        });
    }


    // --- 6. EL MENTIDERO DIGITAL (conectado a Firebase + moderación) ---
    const mentideroForm = document.getElementById('mentideroForm');
    const mentideroList = document.getElementById('mentideroList');
    const inicioMentidero = document.getElementById('inicioMentidero');
    const mentideroCount = document.getElementById('mentideroCount');
    const mentideroFiltro = document.getElementById('mentideroFiltro');

    function crearTarjetaMentidero(msg) {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'post-card';
        tarjeta.setAttribute('data-categoria', msg.categoria || 'mensaje');
        tarjeta.style.borderLeft = '4px solid var(--pinar-accent)';
        tarjeta.innerHTML = `
            <div class="post-head">
                <span class="badge" style="background: rgba(207,160,63,0.1); color: var(--pinar-accent);">${escapeHTML(msg.categoria || 'mensaje')}</span>
            </div>
            <h3 class="post-title" style="font-style: italic;">"${escapeHTML(msg.titulo)}"</h3>
            <p style="margin: 0; color: var(--text-main); font-size: 15px; line-height: 1.6; white-space: pre-line;">${escapeHTML(msg.contenido)}</p>
            <div class="post-meta"><span>✍️ ${escapeHTML(msg.usuario_email ? msg.usuario_email.split('@')[0] : 'Vecino/a de El Pinar')} • ${formatearFecha(msg.fecha_publicacion)}</span></div>
        `;
        return tarjeta;
    }

    function ejecutarFiltroMentidero() {
        const categoria = mentideroFiltro ? mentideroFiltro.value : 'todos';
        const tarjetas = mentideroList ? mentideroList.querySelectorAll('.post-card') : [];
        tarjetas.forEach(tarjeta => {
            const ok = (categoria === 'todos' || tarjeta.getAttribute('data-categoria') === categoria);
            tarjeta.style.display = ok ? 'flex' : 'none';
        });
    }

    function renderMentidero(snapshotVal) {
        if (!mentideroList) return;
        mentideroList.innerHTML = '';
        if (inicioMentidero) inicioMentidero.innerHTML = '';

        const entradas = snapshotVal
            ? Object.values(snapshotVal).filter(msg => msg.estado_moderacion !== 'BLOQUEADO').reverse()
            : [];
        if (mentideroCount) mentideroCount.textContent = entradas.length;

        entradas.forEach(msg => {
            mentideroList.appendChild(crearTarjetaMentidero(msg));
            if (inicioMentidero && inicioMentidero.children.length < 5) {
                const mini = document.createElement('div');
                mini.style.padding = '12px';
                mini.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
                mini.innerHTML = `<span style="font-size: 14px; color: var(--text-muted); font-style: italic;">"${escapeHTML(msg.titulo)}"</span>`;
                inicioMentidero.appendChild(mini);
            }
        });
        ejecutarFiltroMentidero();
    }

    if (mentideroFiltro) mentideroFiltro.addEventListener('change', ejecutarFiltroMentidero);

    baseDatos.ref('mentidero').on('value', (snapshot) => renderMentidero(snapshot.val()));

    if (mentideroForm) {
        mentideroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (requiereSesion()) { document.getElementById('mentideroModal').close(); return; }

            const categoria = document.getElementById('nuevoMentideroTipo').value;
            const titulo = document.getElementById('nuevoMentideroTitulo').value;
            const texto = document.getElementById('nuevoMentideroTexto').value;

            if (!validarMensajeMentidero(titulo) || !validarMensajeMentidero(texto)) {
                alert('Tu mensaje contiene términos que no cumplen con las normas de convivencia de El Pinar. Por favor, edítalo con respeto.');
                return;
            }

            const nuevoMensaje = {
                categoria,
                titulo,
                contenido: texto,
                fecha_publicacion: new Date().toISOString(),
                estado_moderacion: 'APROBADO',
                contador_reportes: 0,
                usuario_email: auth.currentUser.email
            };

            baseDatos.ref('mentidero').push(nuevoMensaje)
                .then(() => {
                    mentideroForm.reset();
                    document.getElementById('mentideroModal').close();
                })
                .catch((error) => {
                    console.error('Error al guardar en el Mentidero:', error);
                    alert('Hubo un problema al conectar con la red de El Pinar.');
                });
        });
    }


    // --- 7. ALERTAS VECINALES (conectado a Firebase) ---
    const alertaForm = document.getElementById('alertaForm');
    const alertasList = document.getElementById('alertasList');
    const alertasCount = document.getElementById('alertasCount');
    const alertaZonaSelect = document.getElementById('alertaZona');
    const alertaNivelSelect = document.getElementById('alertaNivel');

    function crearTarjetaAlerta(alerta) {
        let colorAlerta = '#d46a55';
        if (alerta.prioridad === 'alta') colorAlerta = '#e0533c';
        if (alerta.prioridad === 'informativa') colorAlerta = '#3498db';

        const tarjeta = document.createElement('article');
        tarjeta.className = 'post-card';
        tarjeta.setAttribute('data-zona', alerta.zona);
        tarjeta.setAttribute('data-nivel', alerta.prioridad);
        tarjeta.style.borderLeft = `4px solid ${colorAlerta}`;
        tarjeta.innerHTML = `
            <div class="post-head">
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <span class="badge" style="background: ${colorAlerta}22; color: ${colorAlerta};">⚠️ Prioridad ${escapeHTML(alerta.prioridad)}</span>
                    <span class="badge zona">📍 ${escapeHTML(alerta.zona)}</span>
                </div>
                <span style="font-size: 12px; font-weight: 700; color: #e0533c; white-space:nowrap;">⏳ ${escapeHTML(alerta.vigencia)}</span>
            </div>
            <h3 class="post-title">${escapeHTML(alerta.titulo)}</h3>
            <p style="margin: 0; color: var(--text-main); font-size: 14px; line-height: 1.5;">${escapeHTML(alerta.detalle)}</p>
            <div class="post-meta"><span>• ${formatearFecha(alerta.fecha_creacion)}</span></div>
        `;
        return tarjeta;
    }

    function ejecutarFiltroAlertas() {
        const zonaSel = alertaZonaSelect ? alertaZonaSelect.value : 'todas';
        const nivelSel = alertaNivelSelect ? alertaNivelSelect.value : 'todas';
        const tarjetas = alertasList ? alertasList.querySelectorAll('.post-card') : [];
        tarjetas.forEach(tarjeta => {
            const okZona = (zonaSel === 'todas' || tarjeta.getAttribute('data-zona') === zonaSel);
            const okNivel = (nivelSel === 'todas' || tarjeta.getAttribute('data-nivel') === nivelSel);
            tarjeta.style.display = (okZona && okNivel) ? 'flex' : 'none';
        });
    }

    function renderAlertas(snapshotVal) {
        if (!alertasList) return;
        alertasList.innerHTML = '';
        const entradas = snapshotVal ? Object.values(snapshotVal).reverse() : [];
        if (alertasCount) alertasCount.textContent = entradas.length;
        entradas.forEach(alerta => alertasList.appendChild(crearTarjetaAlerta(alerta)));
        ejecutarFiltroAlertas();
    }

    if (alertaZonaSelect) alertaZonaSelect.addEventListener('change', ejecutarFiltroAlertas);
    if (alertaNivelSelect) alertaNivelSelect.addEventListener('change', ejecutarFiltroAlertas);

    baseDatos.ref('alertas').on('value', (snapshot) => renderAlertas(snapshot.val()));

    if (alertaForm) {
        alertaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (requiereSesion()) { document.getElementById('alertaModal').close(); return; }
            const nuevaAlerta = {
                zona: document.getElementById('nuevaAlertaZona').value,
                prioridad: document.getElementById('nuevaAlertaNivel').value,
                titulo: document.getElementById('nuevaAlertaTitulo').value,
                vigencia: document.getElementById('nuevaAlertaVigencia').value,
                detalle: document.getElementById('nuevaAlertaDetalle').value,
                fecha_creacion: new Date().toISOString(),
                usuario_email: auth.currentUser.email
            };
            baseDatos.ref('alertas').push(nuevaAlerta)
                .then(() => {
                    alertaForm.reset();
                    document.getElementById('alertaModal').close();
                })
                .catch((error) => {
                    console.error('Error al guardar alerta en Firebase:', error);
                    alert('No se pudo publicar la alerta. Inténtalo de nuevo.');
                });
        });
    }

});
