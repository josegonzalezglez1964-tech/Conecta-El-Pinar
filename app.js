// ==========================================================================
// Control de Ventanas Emergentes (Modales) - PinarConnect
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Buscar todos los botones que abren modales
    const openButtons = document.querySelectorAll('[data-open-modal]');
    
    openButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalType = button.getAttribute('data-open-modal');
            // Localiza el modal correspondiente (favorModal, mentideroModal o alertaModal)
            const targetModal = document.getElementById(`${modalType}Modal`);
            
            if (targetModal) {
                targetModal.showModal(); // Abre la ventana premium
            }
        });
    });

    // Controlar el cierre al pulsar el botón Cancelar o la equis (✕)
    const closeButtons = document.querySelectorAll('dialog.modal button[value="cancel"], dialog.modal .secondary-btn');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Evita comportamientos extraños del formulario
            const modal = button.closest('dialog.modal');
            if (modal) {
                modal.close(); // Cierra la ventana de forma limpia
            }
        });
    });
});
