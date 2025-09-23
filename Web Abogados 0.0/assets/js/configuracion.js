document.addEventListener('DOMContentLoaded', function() {
    // Datos de los módulos de configuración
    const configModules = [
        // Configuración básica
        { 
            id: 'config_datos_empresa', 
            name: 'Datos de la Empresa', 
            description: 'Configuración de información básica de la empresa.', 
            icon: 'building-2', 
            category: 'basic',
            target: 'config_datos_empresa.html'
        },
        { 
            id: 'config_param_sist', 
            name: 'Parámetros del Sistema', 
            description: 'Configuración de parámetros generales del sistema.', 
            icon: 'sliders', 
            category: 'basic',
            target: 'config_param_sist.html'
        },
        
        // Usuarios y seguridad
        { 
            id: 'config_usu', 
            name: 'Usuarios y Permisos', 
            description: 'Gestión de usuarios, roles y permisos del sistema.', 
            icon: 'users', 
            category: 'security',
            target: 'config_usu.html'
        },
        
        // Notificaciones
        { 
            id: 'config_notific', 
            name: 'Configuración de Notificaciones', 
            description: 'Personalización de notificaciones y alertas del sistema.', 
            icon: 'bell', 
            category: 'notifications',
            target: 'config_notific.html'
        },
        
        // Integración
        { 
            id: 'integracion', 
            name: 'Integración con Otros Sistemas', 
            description: 'Configuración de integraciones con sistemas externos.', 
            icon: 'plug-2', 
            category: 'integration',
            target: 'integracion.html'
        },
        { 
            id: 'chatboot', 
            name: 'Integración con chatboot', 
            description: 'Configuración de integraciones con chatboot.', 
            icon: 'plug-2', 
            category: 'integration',
            target: 'chatboot.html'
        },

        // Servicios
        { 
            id: 'servicios', 
            name: 'Catálogo de Servicios', 
            description: 'Gestión de servicios y APIs del sistema.', 
            icon: 'server', 
            category: 'services',
            target: 'cat_servicios.html'
        },
        
        // Etiquetas
        { 
            id: 'etiquetas', 
            name: 'Configuración de Etiquetas', 
            description: 'Personalización de etiquetas y nomenclaturas.', 
            icon: 'tag', 
            category: 'labels',
            target: 'etiquetas.html'
        }
    ];

    // Elementos del DOM
    const mainContent = document.getElementById('main-content');

    // Inicializar la aplicación
    function init() {
        renderConfigDashboard();
        setupEventListeners();
    }

    // Renderizar el dashboard de configuración
    function renderConfigDashboard(searchQuery = '') {
        const filteredModules = searchQuery ? 
            configModules.filter(module =>
                module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                module.description.toLowerCase().includes(searchQuery.toLowerCase())
            ) : 
            configModules;

        // Agrupar módulos por categoría
        const basicConfig = filteredModules.filter(m => m.category === 'basic');
        const securityConfig = filteredModules.filter(m => m.category === 'security');
        const notificationConfig = filteredModules.filter(m => m.category === 'notifications');
        const integrationConfig = filteredModules.filter(m => m.category === 'integration');
        const servicesConfig = filteredModules.filter(m => m.category === 'services');
        const labelsConfig = filteredModules.filter(m => m.category === 'labels');

        mainContent.innerHTML = `
            <div class="config-dashboard">
                <div class="dashboard-header">
                    <h1>Configuración del Sistema</h1>
                    <p>Administra todas las configuraciones del sistema desde un solo lugar</p>
                </div>

                <div class="search-container">
                    <i data-lucide="search"></i>
                    <input type="text" id="search-input" class="search-input" placeholder="Buscar configuración..." value="${searchQuery}">
                </div>

                ${basicConfig.length > 0 ? `
                <div class="config-section">
                    <h2>Configuración Básica</h2>
                    <div class="config-grid">
                        ${basicConfig.map(module => renderConfigCard(module)).join('')}
                    </div>
                </div>` : ''}

                ${securityConfig.length > 0 ? `
                <div class="config-section">
                    <h2>Usuarios y Seguridad</h2>
                    <div class="config-grid">
                        ${securityConfig.map(module => renderConfigCard(module)).join('')}
                    </div>
                </div>` : ''}

                ${notificationConfig.length > 0 ? `
                <div class="config-section">
                    <h2>Notificaciones</h2>
                    <div class="config-grid">
                        ${notificationConfig.map(module => renderConfigCard(module)).join('')}
                    </div>
                </div>` : ''}

                ${integrationConfig.length > 0 ? `
                <div class="config-section">
                    <h2>Integraciones</h2>
                    <div class="config-grid">
                        ${integrationConfig.map(module => renderConfigCard(module)).join('')}
                    </div>
                </div>` : ''}

                ${servicesConfig.length > 0 ? `
                <div class="config-section">
                    <h2>Servicios</h2>
                    <div class="config-grid">
                        ${servicesConfig.map(module => renderConfigCard(module)).join('')}
                    </div>
                </div>` : ''}

                ${labelsConfig.length > 0 ? `
                <div class="config-section">
                    <h2>Etiquetas y Nomenclatura</h2>
                    <div class="config-grid">
                        ${labelsConfig.map(module => renderConfigCard(module)).join('')}
                    </div>
                </div>` : ''}

                ${filteredModules.length === 0 ? `
                <div class="no-results">
                    <p>No se encontraron configuraciones que coincidan con la búsqueda.</p>
                </div>` : ''}
            </div>
        `;

        // Actualizar iconos de Lucide
        lucide.createIcons();
    }

    // Renderizar tarjeta de configuración
    function renderConfigCard(module) {
        return `
            <div class="config-card" data-module-id="${module.id}">
                <i data-lucide="${module.icon}"></i>
                <h3>${module.name}</h3>
                <p>${module.description}</p>
            </div>
        `;
    }

    // Navegar a la configuración seleccionada
    function navigateToConfig(moduleId) {
        const module = configModules.find(m => m.id === moduleId);
        if (module && module.target) {
            window.location.href = module.target;
        }
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Delegación de eventos para las tarjetas de configuración
        mainContent.addEventListener('click', function(e) {
            const configCard = e.target.closest('.config-card');
            if (configCard) {
                const moduleId = configCard.dataset.moduleId;
                navigateToConfig(moduleId);
            }
        });

        // Event listener para la búsqueda
        document.addEventListener('input', function(e) {
            if (e.target && e.target.id === 'search-input') {
                renderConfigDashboard(e.target.value);
            }
        });
    }

    // Iniciar la aplicación
    init();
});