document.addEventListener('DOMContentLoaded', () => {
    // Notificaciones
    const notificationBtn = document.getElementById('notification-btn');
    const notificationsPanel = document.getElementById('notifications-panel');
    const markAllReadBtn = document.getElementById('mark-all-read');
    const notificationCount = document.querySelector('.notification-count');
    const notificationItems = document.querySelectorAll('.notification-item');

    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el clic se propague al documento
            notificationsPanel.style.display = notificationsPanel.style.display === 'block' ? 'none' : 'block';
        });
    }

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            notificationItems.forEach(item => {
                item.classList.remove('unread');
            });
            if (notificationCount) {
                notificationCount.textContent = '0';
            }
        });
    }

    // Cerrar panel de notificaciones al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (notificationsPanel && notificationBtn &&
            !notificationsPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
            notificationsPanel.style.display = 'none';
        }
    });

    // Pestañas de configuración
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsSections = document.querySelectorAll('.settings-section');

    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover 'active' de todas las pestañas y secciones
            settingsTabs.forEach(t => t.classList.remove('active'));
            settingsSections.forEach(s => s.classList.remove('active'));

            // Añadir 'active' a la pestaña y sección clicada
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            const targetSection = document.getElementById(tabId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Simulación de búsqueda OCR en documentos
    const documentSearchInput = document.getElementById('document-search');
    if (documentSearchInput) {
        documentSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm.includes('contrato') || searchTerm.includes('arrendamiento')) {
                    alert('Se encontraron coincidencias en 5 documentos relacionados con contratos de arrendamiento');
                } else if (searchTerm.trim() === '') {
                    alert('Por favor, ingresa un término de búsqueda.');
                } else {
                    alert(`Buscando "${searchTerm}" en el contenido de los documentos...`);
                }
            }
        });
    }

    // Integración con calendarios externos
    const googleSyncBtn = document.getElementById('google-sync-btn');
    const outlookSyncBtn = document.getElementById('outlook-sync-btn');

    if (googleSyncBtn) {
        googleSyncBtn.addEventListener('click', () => {
            alert('Iniciando proceso de sincronización con Google Calendar...');
            // En una aplicación real, esto redirigiría a la autenticación de Google
            logAuditAction("Sincronización con Google Calendar iniciada.");
        });
    }

    if (outlookSyncBtn) {
        outlookSyncBtn.addEventListener('click', () => {
            alert('Iniciando proceso de sincronización con Outlook Calendar...');
            // En una aplicación real, esto redirigiría a la autenticación de Outlook
            logAuditAction("Sincronización con Outlook Calendar iniciada.");
        });
    }

    // Simulación de registro de auditoría
    function logAuditAction(action) {
        const auditLog = document.querySelector('.audit-log');
        if (!auditLog) return; // Asegura que el elemento existe

        const now = new Date();
        const timeString = now.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        const auditItem = document.createElement('div');
        auditItem.className = 'audit-item';
        auditItem.innerHTML = `
            <div class="audit-icon"><i class="fas fa-user-edit"></i></div> <div class="audit-details">
                <div>${action}</div>
                <div class="audit-time">${timeString}</div>
            </div>
        `;

        // Añadir el nuevo elemento al principio del log
        auditLog.prepend(auditItem);

        // Limitar el número de elementos en el log para evitar un scroll infinito si se simula mucho
        const maxLogItems = 10;
        while (auditLog.children.length > maxLogItems) {
            auditLog.removeChild(auditLog.lastChild);
        }
    }

    // Ejemplo de uso para probar la auditoría (puedes descomentar para ver en acción)
    // setTimeout(() => logAuditAction("Usuario Juan Pérez subió un nuevo archivo."), 2000);
    // setTimeout(() => logAuditAction("Se generó un informe de casos activos."), 5000);
});