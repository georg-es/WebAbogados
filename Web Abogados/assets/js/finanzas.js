// app.js - Versión modificada
document.addEventListener('DOMContentLoaded', function() {
    // Datos de los módulos actualizados con los de tu captura
    const predefinedModules = [
        
        { 
            id: 'gestion_ingresos', 
            name: 'Gestión de Ingresos', 
            description: 'Administración y control de los ingresos de la organización.', 
            icon: 'trending-up', 
            type: 'financial',
            target: 'gestion_ingresos.html'
        },
        { 
            id: 'gestion_egresos', 
            name: 'Gestión de Egresos', 
            description: 'Control y seguimiento de los egresos y gastos.', 
            icon: 'trending-down', 
            type: 'financial',
            target: 'gestion_egresos.html'
        },
        { 
            id: 'fact_elec', 
            name: 'Facturación Electrónica', 
            description: 'Emisión y gestión de facturas electrónicas.', 
            icon: 'file-text', 
            type: 'sales',
            target: 'Fact_Elec.html'
        },
        { 
            id: 'cxc', 
            name: 'Cuentas por Cobrar', 
            description: 'Administración de cuentas por cobrar y cartera.', 
            icon: 'credit-card', 
            type: 'sales',
            target: 'CXC.html'
        },
        
        { 
            id: 'cxp', 
            name: 'Cuentas por Pagar', 
            description: 'Administración de cuentas por pagar.', 
            icon: 'credit-card', 
            type: 'sales',
            target: 'cxp.html'
        }
    ];

    // Elementos del DOM
    const mainContent = document.getElementById('main-content');
    let currentView = 'dashboard';

    // Inicializar la aplicación
    function init() {
        renderDashboard();
        setupEventListeners();
    }

    // Renderizar el dashboard
    function renderDashboard(searchQuery = '') {
        const filteredModules = predefinedModules.filter(module =>
            module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            module.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Agrupar módulos por categoría
        const financialModules = filteredModules.filter(m => m.type === 'financial');
        const salesModules = filteredModules.filter(m => m.type === 'sales');
        const inventoryModules = filteredModules.filter(m => m.type === 'inventory');
        const adminModules = filteredModules.filter(m => m.type === 'administration');

        mainContent.innerHTML = `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h2>Panel de Administración Financiera</h2>
                    <p>Gestiona todos los aspectos de tu organización desde un solo lugar</p>
                </div>

                <div class="search-container">
                    <i data-lucide="search"></i>
                    <input type="text" id="search-input" class="search-input" placeholder="Buscar módulo..." value="${searchQuery}">
                </div>

                <div class="dashboard-sections">
                    ${financialModules.length > 0 ? `
                    <div class="section-container">
                        <h3 class="section-title">Gestión Financiera</h3>
                        <p class="section-description">Módulos para administrar las finanzas de la organización.</p>
                        <div class="modules-grid">
                            ${financialModules.map(module => renderModuleCard(module)).join('')}
                        </div>
                    </div>` : ''}

                    ${salesModules.length > 0 ? `
                    <div class="section-container">
                        <h3 class="section-title">Ventas y Comercio</h3>
                        <p class="section-description">Módulos para gestión comercial y facturación.</p>
                        <div class="modules-grid">
                            ${salesModules.map(module => renderModuleCard(module)).join('')}
                        </div>
                    </div>` : ''}

                    ${inventoryModules.length > 0 ? `
                    <div class="section-container">
                        <h3 class="section-title">Inventario</h3>
                        <p class="section-description">Módulos para gestión de inventario y productos.</p>
                        <div class="modules-grid">
                            ${inventoryModules.map(module => renderModuleCard(module)).join('')}
                        </div>
                    </div>` : ''}

                    ${adminModules.length > 0 ? `
                    <div class="section-container">
                        <h3 class="section-title">Administración</h3>
                        <p class="section-description">Módulos administrativos y de configuración.</p>
                        <div class="modules-grid">
                            ${adminModules.map(module => renderModuleCard(module)).join('')}
                        </div>
                    </div>` : ''}

                    ${filteredModules.length === 0 ? `
                    <div class="no-results-container">
                        <p class="no-results">No se encontraron módulos que coincidan con la búsqueda.</p>
                    </div>` : ''}
                </div>
            </div>
        `;

        // Actualizar iconos de Lucide
        lucide.createIcons();
        currentView = 'dashboard';
    }

    // Renderizar tarjeta de módulo
    function renderModuleCard(module) {
        return `
            <div class="module-card" data-module-id="${module.id}">
                <div class="module-card-header">
                    <div class="module-icon">
                        <i data-lucide="${module.icon}"></i>
                    </div>
                    <h4 class="module-title">${module.name}</h4>
                </div>
                <p class="module-description">${module.description}</p>
            </div>
        `;
    }

    // Navegar a la página del módulo
    function navigateToModule(moduleId) {
        const module = predefinedModules.find(m => m.id === moduleId);
        if (!module) return;

        // Redirigir a la página correspondiente
        window.location.href = module.target;
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Delegación de eventos para las tarjetas de módulo
        mainContent.addEventListener('click', function(e) {
            const moduleCard = e.target.closest('.module-card');
            if (moduleCard) {
                const moduleId = moduleCard.dataset.moduleId;
                navigateToModule(moduleId);
            }
        });

        // Event listener para la búsqueda
        document.addEventListener('input', function(e) {
            if (e.target && e.target.id === 'search-input') {
                renderDashboard(e.target.value);
            }
        });
    }

    // Iniciar la aplicación
    init();
});
document.addEventListener("DOMContentLoaded", function () {
  const ctx = document.getElementById("graficoFinanzas").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Enero", "Febrero", "Marzo", "Abril"],
      datasets: [
        {
          label: "Ingresos",
          data: [4000, 3000, 5000, 4500],
          backgroundColor: "rgba(75, 192, 192, 0.7)"
        },
        {
          label: "Egresos",
          data: [2000, 2500, 3000, 2800],
          backgroundColor: "rgba(255, 99, 132, 0.7)"
        }
      ]
    }
  });
});
