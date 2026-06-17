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
