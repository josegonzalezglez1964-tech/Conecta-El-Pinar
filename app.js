// ==========================================================================
// PinarConnect - MOTOR SCRIPT (CORREGIDO Y MEJORADO)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SINCRONIZACIÓN Y NAVEGACIÓN DEL MENÚ LATERAL ---
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

        // Scroll al inicio en móvil y escritorio
        window.scrollTo({ top: 0, behavior: 'instant' });
        const contentContainer = document.querySelector('.content');
        if (contentContainer) contentContainer.scrollTop = 0;

        // Muestra/oculta el hero según la sección activa
        const heroElement = document.querySelector('.hero');
        if (heroElement) {
            heroElement.style.display = (viewName === 'inicio') ? '' : 'none';
        }

        // En móvil, hace scroll para centrar el botón activo del menú
        if (activeTab) {
            activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchView(tab.getAttribute('data-view'));
        });
    });

    inlineBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchView(btn.getAttribute('data-switch-view'));
        });
    });


    // --- 2. CONTROL DE VENTANAS EMERGENTES (MODALES) ---
    const openButtons = document.querySelectorAll('[data-open-modal]');

    openButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalType = button.getAttribute('data-open-modal');
            const targetModal = document.getElementById(`${modalType}Modal`);
            if (targetModal) targetModal.showModal();
        });
    });

    // Cerrar modales al hacer clic en el backdrop
    document.querySelectorAll('dialog.modal').forEach(dialog => {
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.close();
        });
    });

    const closeButtons = document.querySelectorAll('dialog.modal button[value="cancel"], dialog.modal .secondary-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = button.closest('dialog.modal');
            if (modal) modal.close();
        });
    });


    // --- 3. MOTOR DE PUBLICACIÓN - MERCADILLO DE FAVORES ---
    const favorForm = document.getElementById('favorForm');
    const favoresList = document.getElementById('favoresList');
    const inicioFavores = document.getElementById('inicioFavores');
    const favoresCount = document.getElementById('favoresCount');
    let contadorFavores = 0;

    if (favorForm) {
        favorForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const tipo = document.getElementById('nuevoFavorTipo').value;
            const titulo = document.getElementById('nuevoFavorTitulo').value;
            const zona = document.getElementById('nuevoFavorZona').value;
            const tags = document.getElementById('nuevoFavorTags').value;
            const detalle = document.getElementById('nuevoFavorDetalle').value;

            const nuevaTarjeta = document.createElement('article');
            nuevaTarjeta.className = 'post-card';
            nuevaTarjeta.setAttribute('data-tipo', tipo);
            nuevaTarjeta.setAttribute('data-buscar', `${titulo} ${detalle} ${zona}`.toLowerCase());

            nuevaTarjeta.innerHTML = `
                <div class="post-head">
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <span class="badge ${tipo}">${tipo === 'ofrezco' ? 'Ofrezco ayuda' : 'Necesito ayuda'}</span>
                        <span class="badge zona">📍 ${zona}</span>
                    </div>
                </div>
                <h3 class="post-title">${titulo}</h3>
                <p style="margin: 0; color: var(--text-main); font-size: 14px; line-height: 1.5;">${detalle}</p>
                <div class="post-meta">
                    <span>🏷️ ${tags ? tags : 'comunidad'}</span>
                    <span>• Hace un momento</span>
                </div>
            `;

            if (favoresList) favoresList.insertBefore(nuevaTarjeta, favoresList.firstChild);

            if (inicioFavores) {
                const tarjetaMini = document.createElement('div');
                tarjetaMini.style.padding = '12px';
                tarjetaMini.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
                tarjetaMini.innerHTML = `<strong style="color: var(--pinar-green); font-size: 14px;">[${zona}]</strong> <span style="font-size: 14px; color: var(--text-main); font-weight: 500;">${titulo}</span>`;
                inicioFavores.insertBefore(tarjetaMini, inicioFavores.firstChild);
            }

            contadorFavores++;
            if (favoresCount) favoresCount.textContent = contadorFavores;

            favorForm.reset();
            document.getElementById('favorModal').close();
            ejecutarFiltroFavores();
        });
    }


    // --- 4. SISTEMA DE FILTRADO REAL (MERCADILLO DE FAVORES) ---
    const favorTipoSelect = document.getElementById('favorTipo');
    const favorBusquedaInput = document.getElementById('favorBusqueda');

    function ejecutarFiltroFavores() {
        const tipoSeleccionado = favorTipoSelect ? favorTipoSelect.value : 'todos';
        const textoBusqueda = favorBusquedaInput ? favorBusquedaInput.value.toLowerCase().trim() : '';
        const tarjetas = favoresList ? favoresList.querySelectorAll('.post-card') : [];

        tarjetas.forEach(tarjeta => {
            const tipoTarjeta = tarjeta.getAttribute('data-tipo');
            const contenidoBusqueda = tarjeta.getAttribute('data-buscar');

            const coincideTipo = (tipoSeleccionado === 'todos' || tipoTarjeta === tipoSeleccionado);
            const coincideTexto = (textoBusqueda === '' || contenidoBusqueda.includes(textoBusqueda));

            tarjeta.style.display = (coincideTipo && coincideTexto) ? 'flex' : 'none';
        });
    }

    if (favorTipoSelect) favorTipoSelect.addEventListener('change', ejecutarFiltroFavores);
    if (favorBusquedaInput) favorBusquedaInput.addEventListener('input', ejecutarFiltroFavores);


    // --- 5. MOTOR DE EDICIÓN Y VISTA PREVIA - MI PERFIL ---
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

            if (profileAvatar && nombre && nombre !== 'Vecino/a de El Pinar') {
                profileAvatar.textContent = nombre.charAt(0).toUpperCase();
            }
        });
    }


    // --- 6. MOTOR DEL MENTIDERO DIGITAL ---
    const mentideroForm = document.getElementById('mentideroForm');
    const mentideroList = document.getElementById('mentideroList');
    const inicioMentidero = document.getElementById('inicioMentidero');
    const mentideroCount = document.getElementById('mentideroCount');
    let contadorMentidero = 0;

    if (mentideroForm) {
        mentideroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const categoria = document.getElementById('nuevoMentideroTipo').value;
            const titulo = document.getElementById('nuevoMentideroTitulo').value;
            const texto = document.getElementById('nuevoMentideroTexto').value;

            const nuevaTarjeta = document.createElement('article');
            nuevaTarjeta.className = 'post-card';
            nuevaTarjeta.style.borderLeft = '4px solid var(--pinar-accent)';
            nuevaTarjeta.innerHTML = `
                <div class="post-head">
                    <span class="badge" style="background: rgba(207,160,63,0.1); color: var(--pinar-accent);">${categoria}</span>
                </div>
                <h3 class="post-title" style="font-style: italic;">"${titulo}"</h3>
                <p style="margin: 0; color: var(--text-main); font-size: 15px; line-height: 1.6; white-space: pre-line;">${texto}</p>
                <div class="post-meta"><span>✍️ Vecino/a de El Pinar • Hace un momento</span></div>
            `;
            if (mentideroList) mentideroList.insertBefore(nuevaTarjeta, mentideroList.firstChild);

            if (inicioMentidero) {
                const tarjetaMini = document.createElement('div');
                tarjetaMini.style.padding = '12px';
                tarjetaMini.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
                tarjetaMini.innerHTML = `<span style="font-size: 14px; color: var(--text-muted); font-style: italic;">"${titulo}"</span>`;
                inicioMentidero.insertBefore(tarjetaMini, inicioMentidero.firstChild);
            }

            contadorMentidero++;
            if (mentideroCount) mentideroCount.textContent = contadorMentidero;
            mentideroForm.reset();
            document.getElementById('mentideroModal').close();
        });
    }


    // --- 7. MOTOR DE ALERTAS VECINALES ---
    const alertaForm = document.getElementById('alertaForm');
    const alertasList = document.getElementById('alertasList');
    const alertasCount = document.getElementById('alertasCount');
    let contadorAlertas = 0;

    if (alertaForm) {
        alertaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const zona = document.getElementById('nuevaAlertaZona').value;
            const prioridad = document.getElementById('nuevaAlertaNivel').value;
            const titulo = document.getElementById('nuevaAlertaTitulo').value;
            const vigencia = document.getElementById('nuevaAlertaVigencia').value;
            const detalle = document.getElementById('nuevaAlertaDetalle').value;

            let colorAlerta = '#d46a55';
            if (prioridad === 'alta') colorAlerta = '#e0533c';
            if (prioridad === 'informativa') colorAlerta = '#3498db';

            const nuevaTarjeta = document.createElement('article');
            nuevaTarjeta.className = 'post-card';
            nuevaTarjeta.style.borderLeft = `4px solid ${colorAlerta}`;
            nuevaTarjeta.innerHTML = `
                <div class="post-head">
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <span class="badge" style="background: ${colorAlerta}22; color: ${colorAlerta};">⚠️ Prioridad ${prioridad}</span>
                        <span class="badge zona">📍 ${zona}</span>
                    </div>
                    <span style="font-size: 12px; font-weight: 700; color: #e0533c; white-space:nowrap;">⏳ ${vigencia}</span>
                </div>
                <h3 class="post-title">${titulo}</h3>
                <p style="margin: 0; color: var(--text-main); font-size: 14px; line-height: 1.5;">${detalle}</p>
                <div class="post-meta"><span>• Publicado ahora mismo</span></div>
            `;
            if (alertasList) alertasList.insertBefore(nuevaTarjeta, alertasList.firstChild);
            contadorAlertas++;
            if (alertasCount) alertasCount.textContent = contadorAlertas;
            alertaForm.reset();
            document.getElementById('alertaModal').close();
        });
    }

});
// 1. Lista negra de palabras no permitidas en la comunidad (puedes ampliarla)
const PALABRAS_PROHIBIDAS = [
    "insulto1",
    "insulto2",
    "ofensa3",
    "mierda",
    "tonto",
    "bobo"
];

/**
 * Función que revisa si el texto de un vecino cumple las normas
 * @param {string} texto - El mensaje que el vecino intenta publicar
 * @returns {boolean} - true si es válido, false si contiene palabras prohibidas
 */
function validarMensajeMentidero(texto) {
    // Convertimos todo a minúsculas para evitar saltarse el filtro usando Mayúsculas
    const textoMinuscula = texto.toLowerCase();

    // Comprobamos si alguna palabra de la lista negra está en el texto
    for (let palabra of PALABRAS_PROHIBIDAS) {
        if (textoMinuscula.includes(palabra)) {
            return false; // ¡Alerta! Contiene una palabra prohibida
        }
    }

    return true; // El mensaje está limpio y es apto para publicar
}

// 2. Ejemplo de cómo usarlo cuando el vecino pulsa "Enviar"
function alEnviarMensaje() {
    // Simulamos que capturamos lo que escribió el vecino en el input del Mentidero
    const mensajeVecino = "Hola vecinos, este pueblo es una mierda de sitio.";

    if (validarMensajeMentidero(mensajeVecino)) {
        console.log("✅ Mensaje aprobado. Guardando en la tabla 'mentidero'...");
        // Aquí iría el código para meterlo en la base de datos
    } else {
        console.warn("❌ Publicación bloqueada por el filtro de moderación.");
        // Mostramos una alerta bonita en la pantalla del vecino
        alert("Tu mensaje contiene términos que no cumplen con las normas de convivencia de El Pinar. Por favor, edítalo con respeto.");
    }
}
/**
 * 1. Solicita permiso al vecino para enviarle alertas a su pantalla
 */
function solicitarPermisoNotificaciones() {
    // Comprobamos si el navegador del vecino soporta notificaciones
    if (!("Notification" in window)) {
        console.error("Este navegador no soporta alertas de escritorio.");
        return;
    }

    // Si no ha denegado el permiso antes, se lo pedimos ahora
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permiso) {
            if (permiso === "granted") {
                console.log("✅ ¡Vecino autorizó las notificaciones!");
                // Enviamos una alerta de bienvenida
                enviarNotificacionLocal(
                    "PinarConnect",
                    "¡Perfecto! Te avisaremos aquí cuando ocurra una alerta en el municipio."
                );
            }
        });
    }
}

/**
 * 2. Lanza la notificación visual en el dispositivo del vecino
 * @param {string} titulo - El encabezado de la alerta (ej: "Tráfico")
 * @param {string} mensaje - El texto detallado del aviso
 */
function enviarNotificacionLocal(titulo, mensaje) {
    // Solo la enviamos si el vecino aceptó previamente
    if (Notification.permission === "granted") {
        new Notification(titulo, {
            body: mensaje,
            icon: "https://unsplash.com" // Icono genérico (puedes cambiarlo por el logo de tu app)
        });
    }
}

/**
 * 3. Simulación: Entrada de una alerta vecinal real
 * Esta función se activará cuando tú, como administrador, lances un aviso urgente
 */
function simularAlertaAdministrador(zonaAfectada, tipoIncidencia, detalle) {
    console.log(`⚠️ Procesando alerta para la zona: ${zonaAfectada}`);

    const tituloAlerta = `⚠️ ALERTA: ${tipoIncidencia} (${zonaAfectada})`;

    // Lanzamos la notificación al dispositivo
    enviarNotificacionLocal(tituloAlerta, detalle);
}


// --- LÍNEAS DE PRUEBA (Para ver cómo funciona) ---
// Activa esto para pedir el permiso automáticamente cuando se cargue la web:
// solicitarPermisoNotificaciones();

// Ejemplo de cómo se ejecutaría cuando lances una alerta:
// simularAlertaAdministrador("La Restinga", "Carretera Cortada", "Desprendimiento de rocas en los accesos. Circule con precaución.");
