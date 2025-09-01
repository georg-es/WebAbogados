// Archivo: styles_VE.js
// Script para manejar las ventanas emergentes

document.addEventListener('DOMContentLoaded', function() {
    // Código de inicialización para las ventanas emergentes
    const aboutItems = document.querySelectorAll('.about-item');
    const popupOverlay = document.getElementById('popup-overlay');
    const popupContent = document.getElementById('popup-content');
    const popupBody = document.querySelector('.popup-body');
    const popupClose = document.querySelector('.popup-close');
    
    // Añadir evento de clic a cada elemento about-item
    aboutItems.forEach(item => {
        item.addEventListener('click', function() {
            // Obtener contenido del hidden-content
            const hiddenContent = this.querySelector('.hidden-content').innerHTML;
            
            // Insertar contenido en el popup
            popupBody.innerHTML = hiddenContent;
            
            // Mostrar popup y overlay
            popupOverlay.style.display = 'block';
            popupContent.style.display = 'block';
            
            // Añadir clase para evitar scroll en el body
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Cerrar popup al hacer clic en el botón de cerrar
    if (popupClose) {
        popupClose.addEventListener('click', closePopup);
    }
    
    // Cerrar popup al hacer clic en el overlay
    if (popupOverlay) {
        popupOverlay.addEventListener('click', closePopup);
    }
    
    // Función para cerrar popup
    function closePopup() {
        popupOverlay.style.display = 'none';
        popupContent.style.display = 'none';
        
        // Restaurar scroll en el body
        document.body.style.overflow = 'auto';
    }
});