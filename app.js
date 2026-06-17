// ==========================================================================
// Control General de Interactividad - PinarConnect
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Sincronización y Navegación del Menú Lateral ---
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.view');
    const inlineBtns = document.querySelectorAll('[data-switch-view]');

    // Función unificada para cambiar de pantalla
    function switchView(viewName) {
        // Quitar la clase activa de todos los botones del menú y secciones
        navTabs.forEach(tab => tab.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));

        // Activar el botón correspondiente del menú lateral
        const activeTab = document.querySelector(`.nav-tab[data-view="${viewName}"]`);
        if (activeTab) activeTab.classList.add('active');

        // Activar la sección de contenido correcta
        const targetSection = document.getElementById(`view-${viewName}`);
        if (targetSection) targetSection.classList.add('active');
        
        // Desplazar la pantalla hacia arriba al cambiar de vista
        const contentContainer = document.querySelector('.content');
        if (contentContainer) contentContainer.scrollTop = 0;
    }

    // Escuchar clics en el menú lateral principal
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const viewName = tab.getAttribute('data-view');
            switchView(viewName);
        });
    });

    // Escuchar clics en los botones "Entrar" o "Ver todo" de las tarjetas de inicio
    inlineBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewName = btn.getAttribute('data-switch-view');
            switchView(viewName);
        });
    });


    // --- 2. Control de Ventanas Emergentes (Modales) ---
    const openButtons = document.querySelectorAll('[data-open-modal]');
    
    openButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalType = button.getAttribute('data-open-modal');
            const targetModal = document.getElementById(`${modalType}Modal`);
            if (targetModal) {
                targetModal.showModal();
            }
        });
    });

    // Controlar el cierre al pulsar el botón Cancelar o la equis (✕)
    const closeButtons = document.querySelectorAll('dialog.modal button[value="cancel"], dialog.modal .secondary-btn');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = button.closest('dialog.modal');
            if (modal) {
                modal.close();
            }
        });
    });
});
    // --- 3. Motor de Publicación del Mercadillo de Favores ---
    const favorForm = document.getElementById('favorForm');
    const favoresList = document.getElementById('favoresList');
    const inicioFavores = document.getElementById('inicioFavores');
    const favoresCount = document.getElementById('favoresCount');
    let contadorFavores = 0;

    if (favorForm) {
        favorForm.addEventListener('submit', (e) => {
            // Impedimos que la página se recargue por defecto al enviar
            e.preventDefault();

            // Recogemos los datos que has escrito en la ventana emergente
            const tipo = document.getElementById('nuevoFavorTipo').value;
            const titulo = document.getElementById('nuevoFavorTitulo').value;
            const zona = document.getElementById('nuevoFavorZona').value;
            const tags = document.getElementById('nuevoFavorTags').value;
            const detalle = document.getElementById('nuevoFavorDetalle').value;

            // Creamos la estructura HTML de la tarjeta Premium
            const nuevaTarjeta = document.createElement('article');
            nuevaTarjeta.className = 'post-card';
            nuevaTarjeta.innerHTML = `
                <div class="post-head">
                    <div>
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

            // 1. Añadir la tarjeta completa a la pestaña grande del Mercadillo
            if (favoresList) {
                favoresList.insertBefore(nuevaTarjeta, favoresList.firstChild);
            }

            // 2. Crear una versión compacta para el panel de "Favores recientes" de la pantalla de inicio
            if (inicioFavores) {
                const tarjetaMini = document.createElement('div');
                tarjetaMini.style.padding = '12px';
                tarjetaMini.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
                tarjetaMini.innerHTML = `
                    <strong style="color: var(--pinar-green); font-size: 14px;">[${zona}]</strong> 
                    <span style="font-size: 14px; color: var(--text-main); font-weight: 500;">${titulo}</span>
                `;
                inicioFavores.insertBefore(tarjetaMini, inicioFavores.firstChild);
            }

            // 3. Actualizar el marcador del menú izquierdo "Resumen del día"
            contadorFavores++;
            if (favoresCount) {
                favoresCount.textContent = contadorFavores;
            }

            // Limpiar el formulario para la próxima vez y cerrar el modal
            favorForm.reset();
            const modal = document.getElementById('favorModal');
            if (modal) modal.close();
        });
    }
    // --- 4. Motor de Publicación de El Mentidero Digital ---
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

            // Tarjeta grande del Mentidero con diseño tipo tablón/historia
            const nuevaTarjeta = document.createElement('article');
            nuevaTarjeta.className = 'post-card';
            nuevaTarjeta.style.borderLeft = '4px solid var(--pinar-accent)'; // Toque oro viejo
            nuevaTarjeta.innerHTML = `
                <div class="post-head">
                    <span class="badge" style="background: rgba(207,160,63,0.1); color: var(--pinar-accent);">${categoria}</span>
                </div>
                <h3 class="post-title" style="font-style: italic;">"${titulo}"</h3>
                <p style="margin: 0; color: var(--text-main); font-size: 15px; line-height: 1.6; white-space: pre-line;">${texto}</p>
                <div class="post-meta">
                    <span>✍️ Vecino/a de El Pinar • Hace un momento</span>
                </div>
            `;

            if (mentideroList) {
                mentideroList.insertBefore(nuevaTarjeta, mentideroList.firstChild);
            }

            // Versión compacta para la pantalla de Inicio
            if (inicioMentidero) {
                const tarjetaMini = document.createElement('div');
                tarjetaMini.style.padding = '12px';
                tarjetaMini.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
                tarjetaMini.innerHTML = `
                    <span style="font-size: 14px; color: var(--text-muted); font-style: italic;">"${titulo}"</span>
                `;
                inicioMentidero.insertBefore(tarjetaMini, inicioMentidero.firstChild);
            }

            contadorMentidero++;
            if (mentideroCount) mentideroCount.textContent = contadorMentidero;

            mentideroForm.reset();
            const modal = document.getElementById('mentideroModal');
            if (modal) modal.close();
        });
    }

    // --- 5. Motor de Publicación de Alertas Vecinales ---
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

            // Definición de colores según la gravedad de la alerta
            let colorAlerta = '#d46a55'; // Coral por defecto
            if (prioridad === 'alta') colorAlerta = '#e0533c';
            if (prioridad === 'informativa') colorAlerta = '#3498db';

            const nuevaTarjeta = document.createElement('article');
            nuevaTarjeta.className = 'post-card';
            nuevaTarjeta.style.borderLeft = `4px solid ${colorAlerta}`;
            nuevaTarjeta.innerHTML = `
                <div class="post-head">
                    <div>
                        <span class="badge" style="background: ${colorAlerta}22; color: ${colorAlerta};">⚠️ Prioridad ${prioridad}</span>
                        <span class="badge zona">📍 ${zona}</span>
                    </div>
                    <span style="font-size: 12px; font-weight: 700; color: #e0533c;">⏳ ${vigencia}</span>
                </div>
                <h3 class="post-title">${titulo}</h3>
                <p style="margin: 0; color: var(--text-main); font-size: 14px; line-height: 1.5;">${detalle}</p>
                <div class="post-meta">
                    <span>• Publicado ahora mismo</span>
                </div>
            `;

            if (alertasList) {
                alertasList.insertBefore(nuevaTarjeta, alertasList.firstChild);
            }

            contadorAlertas++;
            if (alertasCount) alertasCount.textContent = contadorAlertas;

            alertaForm.reset();
            const modal = document.getElementById('alertaModal');
            if (modal) modal.close();
        });
    }
