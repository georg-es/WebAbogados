document.addEventListener('DOMContentLoaded', () => {
    // 1. Simulación de los datos del catálogo (esto vendría de una base de datos)
    const services = [
        {
            id: 'contract-drafting',
            category: 'contracts-negotiations',
            title: 'Redacción de Contrato',
            description: 'Solicite la redacción de un contrato laboral, comercial o civil.',
            icon: 'fa-solid fa-file-contract',
            formFields: [
                { name: 'contract-type', label: 'Tipo de Contrato', type: 'select', options: ['Laboral', 'Comercial', 'Civil'], required: true },
                { name: 'parties-names', label: 'Nombre de las partes', type: 'text', required: true },
                { name: 'start-date', label: 'Fecha de inicio', type: 'date', required: false },
                { name: 'attachments', label: 'Archivos adjuntos', type: 'file', required: false }
            ]
        },
        {
            id: 'legal-advice',
            category: 'legal-consulting',
            title: 'Asesoría Jurídica',
            description: 'Reciba orientación profesional en cualquier tema legal.',
            icon: 'fa-solid fa-comments',
            formFields: [
                { name: 'topic', label: 'Tema de la consulta', type: 'text', required: true },
                { name: 'description', label: 'Descripción detallada', type: 'textarea', required: true }
            ]
        },
        {
            id: 'litigation-representation',
            category: 'litigation',
            title: 'Representación en Litigios',
            description: 'Obtenga representación legal en juicios y procedimientos judiciales.',
            icon: 'fa-solid fa-gavel',
            formFields: [
                { name: 'case-type', label: 'Tipo de caso', type: 'text', required: true },
                { name: 'case-details', label: 'Detalles del caso', type: 'textarea', required: true }
            ]
        },
        {
            id: 'document-review',
            category: 'legal-documentation',
            title: 'Revisión de Documentos',
            description: 'Análisis y validación de la legalidad de sus documentos.',
            icon: 'fa-solid fa-folder-open',
            formFields: [
                { name: 'document-name', label: 'Nombre del documento', type: 'text', required: true },
                { name: 'attachments', label: 'Adjuntar documento', type: 'file', required: true }
            ]
        },
        {
            id: 'privacy-policy',
            category: 'legal-documentation',
            title: 'Política de Privacidad',
            description: 'Redacción de políticas de privacidad para sitios web y apps.',
            icon: 'fa-solid fa-shield-alt',
            formFields: [
                { name: 'website-url', label: 'URL del sitio web', type: 'text', required: true },
                { name: 'business-description', label: 'Descripción del negocio', type: 'textarea', required: true }
            ]
        }
    ];

    const servicesList = document.getElementById('services-list');
    const searchInput = document.getElementById('search-input');
    const categoryList = document.getElementById('category-list');
    const modal = document.getElementById('request-modal');
    const modalTitle = document.getElementById('modal-title');
    const serviceForm = document.getElementById('service-form');
    const closeButton = document.querySelector('.close-button');

    // 2. Función para renderizar las tarjetas de servicio
    const renderServices = (filterCategory = 'all', searchTerm = '') => {
        servicesList.innerHTML = '';
        const lowerCaseSearch = searchTerm.toLowerCase();
        
        const filteredServices = services.filter(service => {
            const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
            const matchesSearch = service.title.toLowerCase().includes(lowerCaseSearch) || service.description.toLowerCase().includes(lowerCaseSearch);
            return matchesCategory && matchesSearch;
        });

        if (filteredServices.length === 0) {
            servicesList.innerHTML = '<p class="no-results">No se encontraron servicios que coincidan con su búsqueda.</p>';
        }

        filteredServices.forEach(service => {
            const card = document.createElement('div');
            card.classList.add('service-card');
            card.dataset.serviceId = service.id;
            card.innerHTML = `
                <i class="${service.icon}"></i>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
            `;
            servicesList.appendChild(card);
        });
    };

    // 3. Manejadores de eventos
    // Carga inicial de servicios
    renderServices();

    // Filtro por categorías
    categoryList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const category = e.target.dataset.category;
            document.querySelectorAll('.category-list li').forEach(li => li.classList.remove('active'));
            e.target.classList.add('active');
            renderServices(category, searchInput.value);
        }
    });

    // Búsqueda en tiempo real
    searchInput.addEventListener('input', (e) => {
        const activeCategory = document.querySelector('.category-list li.active').dataset.category;
        renderServices(activeCategory, e.target.value);
    });

    // Abrir el modal con el formulario dinámico
    servicesList.addEventListener('click', (e) => {
        const card = e.target.closest('.service-card');
        if (card) {
            const serviceId = card.dataset.serviceId;
            const selectedService = services.find(s => s.id === serviceId);

            if (selectedService) {
                modalTitle.textContent = selectedService.title;
                serviceForm.innerHTML = '';
                
                selectedService.formFields.forEach(field => {
                    const formGroup = document.createElement('div');
                    formGroup.classList.add('form-group');

                    const label = document.createElement('label');
                    label.textContent = field.label;
                    label.setAttribute('for', field.name);
                    
                    let input;
                    switch (field.type) {
                        case 'select':
                            input = document.createElement('select');
                            field.options.forEach(optionText => {
                                const option = document.createElement('option');
                                option.value = optionText;
                                option.textContent = optionText;
                                input.appendChild(option);
                            });
                            break;
                        case 'textarea':
                            input = document.createElement('textarea');
                            break;
                        default:
                            input = document.createElement('input');
                            input.type = field.type;
                    }
                    input.id = field.name;
                    if (field.required) {
                        input.required = true;
                    }

                    formGroup.appendChild(label);
                    formGroup.appendChild(input);
                    serviceForm.appendChild(formGroup);
                });

                modal.style.display = 'flex';
            }
        }
    });

    // Cerrar el modal
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cerrar el modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Simular el envío del formulario
    document.getElementById('submit-request-btn').addEventListener('click', () => {
        if (serviceForm.checkValidity()) {
            alert('¡Solicitud enviada con éxito!');
            modal.style.display = 'none';
            // Aquí se enviaría la data a un backend
        } else {
            alert('Por favor, complete todos los campos obligatorios.');
        }
    });
});