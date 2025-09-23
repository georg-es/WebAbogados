// Datos de ejemplo (en una aplicación real vendrían de una API o base de datos)
let services = [
    {
        id: 1,
        name: "Kaspersky - Instalación",
        description: "Solicitud de instalación de software Kaspersky",
        fields: [
            {
                id: 1,
                name: "user_name",
                label: "Nombre completo",
                type: "text",
                required: true,
                placeholder: "Ingrese su nombre completo",
                position: 0
            },
            {
                id: 2,
                name: "user_email",
                label: "Correo electrónico",
                type: "email",
                required: true,
                placeholder: "ejemplo@correo.com",
                validation: "email",
                position: 1
            },
            {
                id: 3,
                name: "device_type",
                label: "Tipo de dispositivo",
                type: "select",
                required: true,
                options: [
                    { label: "Windows", value: "windows" },
                    { label: "macOS", value: "macos" },
                    { label: "Linux", value: "linux" },
                    { label: "Mobile", value: "mobile" }
                ],
                position: 2
            },
            {
                id: 4,
                name: "license_type",
                label: "Tipo de licencia",
                type: "select",
                required: false,
                options: [
                    { label: "Personal", value: "personal" },
                    { label: "Empresarial", value: "business" }
                ],
                conditional: {
                    field: "device_type",
                    operator: "equals",
                    value: "windows",
                    action: "show"
                },
                position: 3
            }
        ]
    },
    {
        id: 2,
        name: "Kaspersky - Licencias",
        description: "Solicitud de gestión de licencias Kaspersky",
        fields: []
    },
    {
        id: 3,
        name: "Kaspersky - Soporte Técnico",
        description: "Solicitud de soporte técnico para productos Kaspersky",
        fields: []
    }
];

// Variables globales
let currentService = null;
let currentField = null;
let isEditing = false;
let currentOptions = [];

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    initAdminFields();
});

// Función de inicialización
function initAdminFields() {
    loadServiceSelector();
    setupEventListeners();
    initModals();
}

// Cargar selector de servicios
function loadServiceSelector() {
    const select = document.getElementById('service-select');
    
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = service.name;
        select.appendChild(option);
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Selector de servicio
    document.getElementById('service-select').addEventListener('change', function() {
        const serviceId = parseInt(this.value);
        currentService = services.find(s => s.id === serviceId);
        loadServiceInfo();
        loadFieldsList();
        updateFieldPreview();
    });
    
    // Botón para crear nuevo campo
    document.getElementById('create-field-btn').addEventListener('click', function() {
        openFieldModal();
    });
    
    // Cambio de tipo de campo
    document.getElementById('field-type').addEventListener('change', function() {
        toggleOptionsContainer();
    });
    
    // Cambio de tipo de validación
    document.getElementById('field-validation').addEventListener('change', function() {
        toggleRegexContainer();
    });
    
    // Campo condicional
    document.getElementById('field-conditional').addEventListener('change', function() {
        toggleConditionalSettings();
    });
    
    // Botones de modal de campo
    document.getElementById('close-field-modal').addEventListener('click', closeFieldModal);
    document.getElementById('cancel-field').addEventListener('click', closeFieldModal);
    document.getElementById('save-field').addEventListener('click', saveField);
    
    // Tabs del formulario
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Botón para añadir opción
    document.getElementById('add-option').addEventListener('click', openOptionModal);
    
    // Modal de opciones
    document.getElementById('close-option-modal').addEventListener('click', closeOptionModal);
    document.getElementById('cancel-option').addEventListener('click', closeOptionModal);
    document.getElementById('save-option').addEventListener('click', saveOption);
    
    // Botón de actualizar vista previa
    document.getElementById('refresh-preview').addEventListener('click', updateFieldPreview);
}

// Inicializar funcionalidades de modales
function initModals() {
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Cargar información del servicio seleccionado
function loadServiceInfo() {
    const infoContainer = document.getElementById('service-info');
    
    if (currentService) {
        infoContainer.innerHTML = `
            <h4>${currentService.name}</h4>
            <p>${currentService.description}</p>
            <div class="service-stats">
                <span class="stat"><strong>${currentService.fields.length}</strong> campos personalizados</span>
                <span class="stat"><strong>${currentService.fields.filter(f => f.required).length}</strong> campos obligatorios</span>
            </div>
        `;
    } else {
        infoContainer.innerHTML = '<p>Seleccione un servicio para gestionar sus campos</p>';
    }
}

// Cargar lista de campos
function loadFieldsList() {
    const fieldsList = document.getElementById('fields-list');
    fieldsList.innerHTML = '';
    
    if (!currentService || currentService.fields.length === 0) {
        fieldsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sliders-h"></i>
                <h4>No hay campos personalizados</h4>
                <p>Utilice el botón "Nuevo Campo" para crear su primer campo</p>
            </div>
        `;
        return;
    }
    
    // Ordenar campos por posición
    const sortedFields = [...currentService.fields].sort((a, b) => a.position - b.position);
    
    sortedFields.forEach(field => {
        const fieldElement = createFieldElement(field);
        fieldsList.appendChild(fieldElement);
    });
}

// Crear elemento de campo para la lista
function createFieldElement(field) {
    const fieldEl = document.createElement('div');
    fieldEl.className = 'field-item';
    fieldEl.dataset.id = field.id;
    
    let optionsText = '';
    if (field.options && field.options.length > 0) {
        optionsText = field.options.map(opt => opt.label).join(', ');
    }
    
    fieldEl.innerHTML = `
        <div class="field-header">
            <div class="field-title">
                <h4>${field.label} ${field.required ? '<span class="required-asterisk">*</span>' : ''}</h4>
                <span class="field-type-badge">${getFieldTypeText(field.type)}</span>
            </div>
            <div class="field-actions">
                <button class="btn-icon edit-field" title="Editar campo">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete-field" title="Eliminar campo">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-icon toggle-field" title="Alternar visibilidad">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
        <div class="field-details">
            <div class="detail-item">
                <span class="detail-label">Nombre interno</span>
                <span class="detail-value">${field.name}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Tipo</span>
                <span class="detail-value">${getFieldTypeText(field.type)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Posición</span>
                <span class="detail-value">${field.position}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Requerido</span>
                <span class="detail-value">${field.required ? 'Sí' : 'No'}</span>
            </div>
            ${optionsText ? `
            <div class="detail-item">
                <span class="detail-label">Opciones</span>
                <span class="detail-value">${optionsText}</span>
            </div>
            ` : ''}
            ${field.conditional ? `
            <div class="detail-item">
                <span class="detail-label">Condicional</span>
                <span class="detail-value">Sí</span>
            </div>
            ` : ''}
        </div>
    `;
    
    // Añadir event listeners a los botones
    fieldEl.querySelector('.edit-field').addEventListener('click', () => editField(field.id));
    fieldEl.querySelector('.delete-field').addEventListener('click', () => deleteField(field.id));
    
    return fieldEl;
}

// Abrir modal para crear/editar campo
function openFieldModal(field = null) {
    const modal = document.getElementById('field-modal');
    const title = document.getElementById('field-modal-title');
    
    if (field) {
        title.textContent = 'Editar Campo';
        currentField = field;
        isEditing = true;
        populateFieldForm(field);
    } else {
        title.textContent = 'Crear Nuevo Campo';
        currentField = null;
        isEditing = false;
        document.getElementById('field-form').reset();
        document.getElementById('options-container').style.display = 'none';
        document.getElementById('conditional-settings').style.display = 'none';
    }
    
    // Reset tabs to basic
    switchTab('basic');
    
    modal.style.display = 'block';
}

// Cerrar modal de campo
function closeFieldModal() {
    document.getElementById('field-modal').style.display = 'none';
}

// Cerrar todos los modales
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Llenar formulario con datos del campo
function populateFieldForm(field) {
    document.getElementById('field-label').value = field.label;
    document.getElementById('field-type').value = field.type;
    document.getElementById('field-name').value = field.name;
    document.getElementById('field-placeholder').value = field.placeholder || '';
    document.getElementById('field-help').value = field.helpText || '';
    document.getElementById('field-required').checked = field.required || false;
    document.getElementById('field-validation').value = field.validation || '';
    document.getElementById('field-minlength').value = field.minLength || '';
    document.getElementById('field-maxlength').value = field.maxLength || '';
    document.getElementById('field-pattern').value = field.pattern || '';
    document.getElementById('field-default').value = field.defaultValue || '';
    document.getElementById('field-class').value = field.className || '';
    document.getElementById('field-style').value = field.inlineStyle || '';
    document.getElementById('field-position').value = field.position || 0;
    document.getElementById('field-hidden').checked = field.hidden || false;
    document.getElementById('field-readonly').checked = field.readonly || false;
    document.getElementById('field-conditional').checked = !!field.conditional;
    
    // Opciones para select, radio, etc.
    if (field.options && field.options.length > 0) {
        currentOptions = [...field.options];
        renderOptionsList();
        document.getElementById('options-container').style.display = 'block';
    } else {
        currentOptions = [];
        document.getElementById('options-container').style.display = 'none';
    }
    
    // Configuración condicional
    if (field.conditional) {
        document.getElementById('conditional-field').value = field.conditional.field;
        document.getElementById('conditional-operator').value = field.conditional.operator;
        document.getElementById('conditional-value').value = field.conditional.value;
        document.getElementById('conditional-action').value = field.conditional.action;
        document.getElementById('conditional-settings').style.display = 'block';
    } else {
        document.getElementById('conditional-settings').style.display = 'none';
    }
    
    toggleOptionsContainer();
    toggleRegexContainer();
}

// Cambiar pestaña
function switchTab(tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Desactivar todos los botones de pestaña
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activar pestaña seleccionada
    document.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
}

// Mostrar/ocultar contenedor de opciones según el tipo de campo
function toggleOptionsContainer() {
    const fieldType = document.getElementById('field-type').value;
    const optionsContainer = document.getElementById('options-container');
    
    if (['select', 'multiselect', 'radio'].includes(fieldType)) {
        optionsContainer.style.display = 'block';
        if (currentOptions.length === 0) {
            currentOptions = [{ label: '', value: '' }];
            renderOptionsList();
        }
    } else {
        optionsContainer.style.display = 'none';
        currentOptions = [];
    }
}

// Mostrar/ocultar contenedor de regex según el tipo de validación
function toggleRegexContainer() {
    const validationType = document.getElementById('field-validation').value;
    const regexContainer = document.getElementById('regex-container');
    
    regexContainer.style.display = validationType === 'regex' ? 'block' : 'none';
}

// Mostrar/ocultar configuración condicional
function toggleConditionalSettings() {
    const isConditional = document.getElementById('field-conditional').checked;
    document.getElementById('conditional-settings').style.display = isConditional ? 'block' : 'none';
}

// Renderizar lista de opciones
function renderOptionsList() {
    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = '';
    
    currentOptions.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option-item';
        optionEl.innerHTML = `
            <input type="text" value="${option.label}" readonly>
            <div class="option-actions">
                <button class="btn-icon edit-option" data-index="${index}" title="Editar opción">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete-option" data-index="${index}" title="Eliminar opción">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        optionsList.appendChild(optionEl);
    });
    
    // Añadir event listeners a los botones de opciones
    optionsList.querySelectorAll('.edit-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            openOptionModal(currentOptions[index], index);
        });
    });
    
    optionsList.querySelectorAll('.delete-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            deleteOption(index);
        });
    });
}

// Abrir modal para editar opción
function openOptionModal(option = null, index = null) {
    const modal = document.getElementById('option-modal');
    
    if (option) {
        document.getElementById('option-label').value = option.label;
        document.getElementById('option-value').value = option.value;
        document.getElementById('option-selected').checked = option.selected || false;
        modal.dataset.editIndex = index;
    } else {
        document.getElementById('option-label').value = '';
        document.getElementById('option-value').value = '';
        document.getElementById('option-selected').checked = false;
        delete modal.dataset.editIndex;
    }
    
    modal.style.display = 'block';
}

// Cerrar modal de opción
function closeOptionModal() {
    document.getElementById('option-modal').style.display = 'none';
}

// Guardar opción
function saveOption() {
    const label = document.getElementById('option-label').value;
    const value = document.getElementById('option-value').value || label;
    const selected = document.getElementById('option-selected').checked;
    
    if (!label) {
        alert('Por favor, ingrese una etiqueta para la opción');
        return;
    }
    
    const option = { label, value, selected };
    const modal = document.getElementById('option-modal');
    
    if (modal.dataset.editIndex !== undefined) {
        // Editar opción existente
        const index = parseInt(modal.dataset.editIndex);
        currentOptions[index] = option;
    } else {
        // Añadir nueva opción
        currentOptions.push(option);
    }
    
    renderOptionsList();
    closeOptionModal();
}

// Eliminar opción
function deleteOption(index) {
    if (confirm('¿Está seguro de que desea eliminar esta opción?')) {
        currentOptions.splice(index, 1);
        renderOptionsList();
    }
}

// Guardar campo
function saveField() {
    // Recopilar datos del formulario
    const label = document.getElementById('field-label').value;
    const type = document.getElementById('field-type').value;
    const name = document.getElementById('field-name').value;
    const required = document.getElementById('field-required').checked;
    const placeholder = document.getElementById('field-placeholder').value;
    const helpText = document.getElementById('field-help').value;
    const validation = document.getElementById('field-validation').value;
    const minLength = document.getElementById('field-minlength').value;
    const maxLength = document.getElementById('field-maxlength').value;
    const pattern = document.getElementById('field-pattern').value;
    const defaultValue = document.getElementById('field-default').value;
    const className = document.getElementById('field-class').value;
    const inlineStyle = document.getElementById('field-style').value;
    const position = parseInt(document.getElementById('field-position').value) || 0;
    const hidden = document.getElementById('field-hidden').checked;
    const readonly = document.getElementById('field-readonly').checked;
    const isConditional = document.getElementById('field-conditional').checked;
    
    // Validaciones básicas
    if (!label || !type || !name) {
        alert('Por favor, complete los campos obligatorios');
        return;
    }
    
    // Validar nombre interno (sin espacios ni caracteres especiales)
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        alert('El nombre interno solo puede contener letras, números y guiones bajos');
        return;
    }
    
    // Preparar datos del campo
    const fieldData = {
        label,
        type,
        name,
        required,
        placeholder,
        helpText,
        validation,
        minLength: minLength ? parseInt(minLength) : undefined,
        maxLength: maxLength ? parseInt(maxLength) : undefined,
        pattern,
        defaultValue,
        className,
        inlineStyle,
        position,
        hidden,
        readonly
    };
    
    // Añadir opciones si corresponde
    if (['select', 'multiselect', 'radio'].includes(type) && currentOptions.length > 0) {
        fieldData.options = currentOptions;
    }
    
    // Añadir lógica condicional si está habilitada
    if (isConditional) {
        const conditionalField = document.getElementById('conditional-field').value;
        const conditionalOperator = document.getElementById('conditional-operator').value;
        const conditionalValue = document.getElementById('conditional-value').value;
        const conditionalAction = document.getElementById('conditional-action').value;
        
        if (!conditionalField || !conditionalValue) {
            alert('Por favor, complete todos los campos de la lógica condicional');
            return;
        }
        
        fieldData.conditional = {
            field: conditionalField,
            operator: conditionalOperator,
            value: conditionalValue,
            action: conditionalAction
        };
    }
    
    if (isEditing && currentField) {
        // Actualizar campo existente
        Object.assign(currentField, fieldData);
    } else {
        // Crear nuevo campo
        fieldData.id = Date.now(); // ID temporal
        currentService.fields.push(fieldData);
    }
    
    // Actualizar vistas
    loadFieldsList();
    updateFieldPreview();
    closeFieldModal();
    
    // En una aplicación real, aquí enviaríamos los cambios al servidor
    console.log('Campo guardado:', fieldData);
}

// Editar campo existente
function editField(fieldId) {
    const field = currentService.fields.find(f => f.id === fieldId);
    if (field) {
        openFieldModal(field);
    }
}

// Eliminar campo
function deleteField(fieldId) {
    if (confirm('¿Está seguro de que desea eliminar este campo?')) {
        const index = currentService.fields.findIndex(f => f.id === fieldId);
        if (index !== -1) {
            currentService.fields.splice(index, 1);
            loadFieldsList();
            updateFieldPreview();
            
            // En una aplicación real, aquí enviaríamos los cambios al servidor
            console.log('Campo eliminado:', fieldId);
        }
    }
}

// Actualizar vista previa del formulario
function updateFieldPreview() {
    const previewContainer = document.getElementById('field-preview-content');
    
    if (!currentService || currentService.fields.length === 0) {
        previewContainer.innerHTML = '<p class="preview-placeholder">Los campos aparecerán aquí cuando se seleccione un servicio</p>';
        return;
    }
    
    // Ordenar campos por posición
    const sortedFields = [...currentService.fields].sort((a, b) => a.position - b.position);
    
    let previewHTML = '';
    
    sortedFields.forEach(field => {
        previewHTML += renderFieldPreview(field);
    });
    
    previewContainer.innerHTML = previewHTML;
}

// Renderizar vista previa de un campo
function renderFieldPreview(field) {
    let fieldHTML = '';
    const requiredClass = field.required ? 'field-required' : '';
    
    fieldHTML += `<div class="form-group ${requiredClass}">`;
    fieldHTML += `<label for="preview-${field.name}">${field.label}${field.required ? ' *' : ''}</label>`;
    
    switch (field.type) {
        case 'text':
        case 'email':
        case 'number':
            fieldHTML += `<input type="${field.type}" id="preview-${field.name}" placeholder="${field.placeholder || ''}">`;
            break;
            
        case 'textarea':
            fieldHTML += `<textarea id="preview-${field.name}" placeholder="${field.placeholder || ''}" rows="4"></textarea>`;
            break;
            
        case 'select':
            fieldHTML += `<select id="preview-${field.name}">`;
            if (field.options && field.options.length > 0) {
                field.options.forEach(option => {
                    fieldHTML += `<option value="${option.value}" ${option.selected ? 'selected' : ''}>${option.label}</option>`;
                });
            } else {
                fieldHTML += `<option value="">-- Seleccione --</option>`;
            }
            fieldHTML += `</select>`;
            break;
            
        case 'multiselect':
            fieldHTML += `<select id="preview-${field.name}" multiple>`;
            if (field.options && field.options.length > 0) {
                field.options.forEach(option => {
                    fieldHTML += `<option value="${option.value}" ${option.selected ? 'selected' : ''}>${option.label}</option>`;
                });
            }
            fieldHTML += `</select>`;
            break;
            
        case 'checkbox':
            fieldHTML += `<input type="checkbox" id="preview-${field.name}">`;
            break;
            
        case 'radio':
            if (field.options && field.options.length > 0) {
                field.options.forEach((option, index) => {
                    fieldHTML += `<div class="radio-option">`;
                    fieldHTML += `<input type="radio" id="preview-${field.name}-${index}" name="${field.name}" value="${option.value}">`;
                    fieldHTML += `<label for="preview-${field.name}-${index}">${option.label}</label>`;
                    fieldHTML += `</div>`;
                });
            }
            break;
            
        case 'date':
        case 'datetime':
            fieldHTML += `<input type="${field.type === 'datetime' ? 'datetime-local' : 'date'}" id="preview-${field.name}">`;
            break;
            
        case 'file':
            fieldHTML += `<input type="file" id="preview-${field.name}">`;
            break;
            
        case 'image':
            fieldHTML += `<input type="file" id="preview-${field.name}" accept="image/*">`;
            break;
            
        case 'color':
            fieldHTML += `<input type="color" id="preview-${field.name}">`;
            break;
            
        case 'range':
            fieldHTML += `<input type="range" id="preview-${field.name}" min="0" max="100">`;
            break;
            
        default:
            fieldHTML += `<input type="text" id="preview-${field.name}" placeholder="${field.placeholder || ''}">`;
    }
    
    if (field.helpText) {
        fieldHTML += `<div class="help-text">${field.helpText}</div>`;
    }
    
    fieldHTML += `</div>`;
    
    return fieldHTML;
}

// Función auxiliar para obtener texto del tipo de campo
function getFieldTypeText(type) {
    const typeMap = {
        'text': 'Texto',
        'textarea': 'Área de texto',
        'email': 'Email',
        'number': 'Número',
        'select': 'Selector',
        'multiselect': 'Selección múltiple',
        'checkbox': 'Casilla',
        'radio': 'Botones de opción',
        'date': 'Fecha',
        'datetime': 'Fecha y hora',
        'file': 'Archivo',
        'image': 'Imagen',
        'color': 'Color',
        'range': 'Rango'
    };
    
    return typeMap[type] || type;
}