document.addEventListener('DOMContentLoaded', () => {
    // --- Navegación de la Sidebar y Contenido ---
    const navLinks = document.querySelectorAll('.admin-menu a');
    const contentSections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('section-title');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevenir el comportamiento predeterminado del enlace

            // Remover la clase 'active' de todos los enlaces y secciones
            navLinks.forEach(item => item.parentElement.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));

            // Añadir la clase 'active' al enlace clickeado y su sección correspondiente
            link.parentElement.classList.add('active');
            const targetId = link.getAttribute('href').substring(1); // Obtener el ID sin '#'
            document.getElementById(targetId).classList.add('active');

            // Actualizar el título de la sección principal
            sectionTitle.textContent = link.textContent.trim();

            // Si es la sección de estadísticas, inicializar los gráficos
            if (targetId === 'estadisticas') {
                initializeCharts();
            }
        });
    });

    // --- Gestión de Modales (General) ---
    const modals = document.querySelectorAll('.modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');

    function openModal(modalElement) {
        modalElement.style.display = 'flex'; // Usar flex para centrar
    }

    function closeModal(modalElement) {
        modalElement.style.display = 'none';
    }

    closeModalButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Encuentra el modal más cercano al botón clickeado
            const modalToClose = event.target.closest('.modal');
            if (modalToClose) {
                closeModal(modalToClose);
            }
        });
    });

    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    // --- Gestión de Usuarios (Modal de Agregar Usuario) ---
    const addUserBtn = document.getElementById('add-user-btn');
    const addUserModal = document.getElementById('add-user-modal');
    const addUserForm = document.getElementById('add-user-form');

    addUserBtn.addEventListener('click', () => {
        addUserForm.reset(); // Limpiar formulario al abrir
        openModal(addUserModal);
    });

    addUserForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const userName = document.getElementById('user-name').value;
        const userEmail = document.getElementById('user-email').value;
        const userRole = document.getElementById('user-role').value;
        const userPassword = document.getElementById('user-password').value;

        // Aquí iría la lógica para enviar los datos a un backend
        console.log('Nuevo usuario:', { userName, userEmail, userRole, userPassword });
        alert(`Usuario ${userName} agregado con rol ${userRole}. (Simulado)`);

        closeModal(addUserModal);
        // Opcional: Recargar o actualizar la tabla de usuarios
    });

    // --- Gestión de Solicitudes (Modal de Detalle de Solicitud) ---
    const requestDetailModal = document.getElementById('request-detail-modal');
    const viewRequestButtons = document.querySelectorAll('.requests-table .btn-view');

    // Datos de ejemplo de solicitudes (para el modal de detalle)
    const requestsData = {
        '1425': {
            id: '1425',
            client: 'Juan Pérez',
            type: 'Divorcio',
            date: '15/06/2023',
            assignedTo: 'María Gómez',
            status: 'En progreso',
            description: 'El cliente solicita asesoramiento para proceso de divorcio de mutuo acuerdo. Hay dos hijos menores involucrados y se requiere negociación de pensión alimenticia.',
            documents: [
                { name: 'Acta_matrimonio.pdf', icon: 'fas fa-file-pdf' },
                { name: 'Acuerdo_preliminar.docx', icon: 'fas fa-file-word' }
            ]
        },
        '1424': {
            id: '1424',
            client: 'Ana López',
            type: 'Contrato',
            date: '14/06/2023',
            assignedTo: 'No asignado',
            status: 'Pendiente',
            description: 'Revisión y redacción de contrato de arrendamiento para local comercial. Incluye cláusulas de renovación y mantenimiento.',
            documents: [
                { name: 'Propuesta_arriendo.pdf', icon: 'fas fa-file-pdf' }
            ]
        },
        '1423': {
            id: '1423',
            client: 'Roberto Sánchez',
            type: 'Accidente',
            date: '13/06/2023',
            assignedTo: 'Carlos Ruiz',
            status: 'Completada',
            description: 'Representación legal por accidente de tráfico. Negociación con aseguradora y seguimiento de daños.',
            documents: []
        }
    };

    viewRequestButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const requestId = event.currentTarget.dataset.requestId;
            const request = requestsData[requestId];

            if (request) {
                document.getElementById('request-detail-id').textContent = `#${request.id}`;
                document.getElementById('detail-client').textContent = request.client;
                document.getElementById('detail-type').textContent = request.type;
                document.getElementById('detail-date').textContent = request.date;
                document.getElementById('detail-assigned-to').textContent = request.assignedTo;
                document.getElementById('detail-description').textContent = request.description;

                const detailStatusSpan = document.getElementById('detail-status');
                detailStatusSpan.innerHTML = `<span class="badge badge-${request.status.toLowerCase().replace(' ', '-')}">${request.status}</span>`;

                const documentsList = document.getElementById('detail-documents');
                documentsList.innerHTML = ''; // Limpiar documentos previos
                if (request.documents && request.documents.length > 0) {
                    request.documents.forEach(doc => {
                        const docItem = document.createElement('div');
                        docItem.classList.add('document-item');
                        docItem.innerHTML = `
                            <i class="${doc.icon}"></i>
                            <span>${doc.name}</span>
                            <button class="btn-icon btn-download"><i class="fas fa-download"></i></button>
                        `;
                        documentsList.appendChild(docItem);
                    });
                } else {
                    documentsList.innerHTML = '<p>No hay documentos adjuntos.</p>';
                }

                openModal(requestDetailModal);
            } else {
                alert('Solicitud no encontrada.');
            }
        });
    });

    // Manejar el botón de "Cambiar Estado" en el modal de detalle de solicitud (simulado)
    const changeRequestStatusBtn = document.getElementById('change-request-status-btn');
    if (changeRequestStatusBtn) {
        changeRequestStatusBtn.addEventListener('click', () => {
            alert('Funcionalidad de "Cambiar Estado" simulada. Implementar lógica de backend.');
            // Aquí iría un nuevo modal o un dropdown para seleccionar el nuevo estado
        });
    }

    // Manejar el botón de "Reasignar" en el modal de detalle de solicitud (simulado)
    const reassignRequestBtn = document.getElementById('reassign-request-btn');
    if (reassignRequestBtn) {
        reassignRequestBtn.addEventListener('click', () => {
            alert('Funcionalidad de "Reasignar" simulada. Implementar lógica de reasignación.');
            // Aquí se abriría un modal para seleccionar un nuevo abogado
        });
    }

    // --- Asignaciones de Casos ---
    const assignButtons = document.querySelectorAll('.assign-btn');
    const reassignButtons = document.querySelectorAll('.reassign-btn'); // Aunque en el HTML están definidos con data-request-id

    assignButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const card = event.target.closest('.request-card');
            const requestId = card.dataset.requestId;
            const lawyerSelect = card.querySelector('.lawyer-select');
            const selectedLawyer = lawyerSelect.value;

            if (selectedLawyer) {
                alert(`Solicitud ${requestId} asignada a ${selectedLawyer}. (Simulado)`);
                // Aquí iría la lógica para mover la tarjeta de 'sin asignar' a 'asignado' y actualizar el backend
                const assignedRequestsList = document.getElementById('assigned-requests-list');
                const requestInfo = card.querySelector('.request-info');
                requestInfo.innerHTML = `
                    <h5>#${requestId} - ${requestInfo.querySelector('h5').textContent.split(' - ')[1]}</h5>
                    <p>Cliente: ${requestInfo.querySelector('p:first-of-type').textContent.split(': ')[1]}</p>
                    <p>Asignado a: ${selectedLawyer}</p>
                `;
                card.querySelector('.request-actions').innerHTML = `
                    <button class="btn btn-sm btn-secondary reassign-btn" data-request-id="${requestId}">Reasignar</button>
                `;
                assignedRequestsList.appendChild(card);
                attachAssignmentButtonListeners(); // Re-adjuntar listeners para el botón de reasignar
            } else {
                alert('Por favor, selecciona un abogado para asignar.');
            }
        });
    });

    function attachAssignmentButtonListeners() {
        // Debes volver a seleccionar los botones porque el DOM ha cambiado
        document.querySelectorAll('.reassign-btn').forEach(button => {
            button.onclick = (event) => { // Usar onclick para evitar múltiples listeners
                const requestId = event.currentTarget.dataset.requestId;
                alert(`Reasignar solicitud ${requestId}. (Simulado)`);
                // Lógica para reasignar (volver a mostrar un select de abogados o abrir un modal)
            };
        });
    }
    attachAssignmentButtonListeners(); // Adjuntar al cargar la página

    // --- Pestañas de Configuración ---
    const configTabs = document.querySelectorAll('.config-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.config-tabs .tab-content');

    configTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover 'active' de todos los botones y contenidos
            configTabs.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Añadir 'active' al botón y contenido clickeado
            tab.classList.add('active');
            const targetTab = tab.dataset.tab;
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });

    // --- Gráficos de Estadísticas (Chart.js) ---
    let requestsByStatusChart;
    let requestsByTypeChart;
    let lawyerProductivityChart;

    function initializeCharts() {
        // Datos de ejemplo para los gráficos
        const statusData = {
            labels: ['Pendientes', 'En Progreso', 'Completadas', 'Canceladas'],
            datasets: [{
                data: [23, 32, 87, 5], // Ejemplo de datos
                backgroundColor: ['#dc3545', '#ffc107', '#28a745', '#6c757d'],
            }]
        };

        const typeData = {
            labels: ['Divorcio', 'Contrato', 'Accidente', 'Inmobiliario', 'Laboral'],
            datasets: [{
                data: [40, 30, 25, 20, 15], // Ejemplo de datos
                backgroundColor: ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#6f42c1'],
            }]
        };

        const productivityData = {
            labels: ['María Gómez', 'Carlos Ruiz', 'Laura M. (Asist.)'],
            datasets: [{
                label: 'Casos Completados',
                data: [35, 28, 12],
                backgroundColor: '#007bff',
            }, {
                label: 'Casos En Progreso',
                data: [10, 15, 5],
                backgroundColor: '#ffc107',
            }]
        };

        // Configuración de opciones base para los gráficos
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed;
                            }
                            return label;
                        }
                    }
                }
            }
        };

        // Destruir gráficos existentes antes de crear nuevos
        if (requestsByStatusChart) requestsByStatusChart.destroy();
        if (requestsByTypeChart) requestsByTypeChart.destroy();
        if (lawyerProductivityChart) lawyerProductivityChart.destroy();

        // Crear gráficos
        const ctxStatus = document.getElementById('requests-by-status-chart');
        if (ctxStatus) {
            requestsByStatusChart = new Chart(ctxStatus, {
                type: 'doughnut',
                data: statusData,
                options: {
                    ...chartOptions,
                    plugins: {
                        legend: { position: 'right' },
                        tooltip: chartOptions.plugins.tooltip
                    }
                }
            });
        }

        const ctxType = document.getElementById('requests-by-type-chart');
        if (ctxType) {
            requestsByTypeChart = new Chart(ctxType, {
                type: 'bar',
                data: typeData,
                options: {
                    ...chartOptions,
                    indexAxis: 'y', // Barras horizontales
                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        const ctxProductivity = document.getElementById('lawyer-productivity-chart');
        if (ctxProductivity) {
            lawyerProductivityChart = new Chart(ctxProductivity, {
                type: 'bar',
                data: productivityData,
                options: {
                    ...chartOptions,
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // Inicializar los gráficos cuando la sección de estadísticas esté activa al cargar la página
    // O cuando se navegue a ella. El manejador de eventos de navegación ya lo hace.
    if (document.getElementById('estadisticas').classList.contains('active')) {
        initializeCharts();
    }

    // --- Simulación de Carga de Logo (Configuración) ---
    const systemLogoInput = document.getElementById('system-logo');
    const currentLogoImg = document.getElementById('current-logo');

    if (systemLogoInput && currentLogoImg) {
        systemLogoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    currentLogoImg.src = e.target.result;
                    alert('Logo actualizado en la vista. Guarda la configuración para persistir.');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Simular guardado de configuración
    const systemSettingsForm = document.querySelector('.system-settings-form');
    if (systemSettingsForm) {
        systemSettingsForm.addEventListener('submit', (event) => {
            event.preventDefault();
            alert('Configuración guardada exitosamente. (Simulado)');
            console.log('Configuración guardada:', {
                systemName: document.getElementById('system-name').value,
                sessionTimeout: document.getElementById('session-timeout').value
            });
        });
    }
});