document.addEventListener('DOMContentLoaded', function() {
    // Verificar rol de usuario
    const userRole = localStorage.getItem('rolUsuario');
    const adminContent = document.getElementById('admin-content');
    const accessDenied = document.getElementById('access-denied');
    
    if (userRole === 'admin' || userRole === 'abogado') {
        adminContent.classList.remove('hidden');
        initFormBuilder();
    } else {
        accessDenied.classList.remove('hidden');
    }
});

function initFormBuilder() {
    // Elementos del DOM
    const fieldTypeSelect = document.getElementById('field-type');
    const optionsContainer = document.getElementById('options-container');
    const addFieldForm = document.getElementById('add-field-form');
    const fieldsList = document.getElementById('fields-list');
    const formPreview = document.getElementById('form-preview');
    const saveFormBtn = document.getElementById('save-form');
    const resetFormBtn = document.getElementById('reset-form');
    
    // Cargar formulario existente
    let formFields = JSON.parse(localStorage.getItem('formulario_solicitud')) || [];
    
    // Mostrar campos existentes al cargar
    updateFieldsList();
    updateFormPreview();
    
    // Mostrar/ocultar opciones para dropdown
    fieldTypeSelect.addEventListener('change', function() {
        if (this.value === 'dropdown') {
            optionsContainer.classList.remove('hidden');
        } else {
            optionsContainer.classList.add('hidden');
        }
    });
    
    // Agregar nuevo campo
    addFieldForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fieldLabel = document.getElementById('field-label').value;
        const fieldType = fieldTypeSelect.value;
        const isRequired = document.getElementById('field-required').checked;
        const fieldOptions = document.getElementById('field-options').value;
        
        const newField = {
            etiqueta: fieldLabel,
            tipo: fieldType,
            obligatorio: isRequired
        };
        
        if (fieldType === 'dropdown' && fieldOptions) {
            newField.opciones = fieldOptions.split(',').map(opt => opt.trim());
        }
        
        formFields.push(newField);
        updateFieldsList();
        updateFormPreview();
        addFieldForm.reset();
        optionsContainer.classList.add('hidden');
    });
    
    // Guardar formulario
    saveFormBtn.addEventListener('click', function() {
        localStorage.setItem('formulario_solicitud', JSON.stringify(formFields));
        alert('Formulario guardado correctamente');
    });
    
    // Eliminar formulario
    resetFormBtn.addEventListener('click', function() {
        if (confirm('¿Está seguro que desea eliminar todo el formulario? Esta acción no se puede deshacer.')) {
            formFields = [];
            localStorage.removeItem('formulario_solicitud');
            updateFieldsList();
            updateFormPreview();
        }
    });
    
    // Actualizar lista de campos
    function updateFieldsList() {
        fieldsList.innerHTML = '';
        
        if (formFields.length === 0) {
            fieldsList.innerHTML = '<p>No hay campos creados todavía.</p>';
            return;
        }
        
        formFields.forEach((field, index) => {
            const fieldItem = document.createElement('div');
            fieldItem.className = 'field-item';
            
            const fieldInfo = document.createElement('div');
            fieldInfo.className = 'field-info';
            
            const typeSpan = document.createElement('span');
            typeSpan.className = 'field-type';
            typeSpan.textContent = `[${getTypeName(field.tipo)}]`;
            
            const labelSpan = document.createElement('span');
            labelSpan.textContent = field.etiqueta;
            
            if (field.obligatorio) {
                const requiredSpan = document.createElement('span');
                requiredSpan.className = 'field-required';
                requiredSpan.textContent = ' (Obligatorio)';
                labelSpan.appendChild(requiredSpan);
            }
            
            fieldInfo.appendChild(typeSpan);
            fieldInfo.appendChild(labelSpan);
            
            if (field.tipo === 'dropdown' && field.opciones) {
                const optionsText = document.createElement('div');
                optionsText.className = 'field-options-text';
                optionsText.textContent = `Opciones: ${field.opciones.join(', ')}`;
                optionsText.style.fontSize = '0.8em';
                optionsText.style.color = '#666';
                optionsText.style.marginTop = '5px';
                fieldInfo.appendChild(optionsText);
            }
            
            const fieldActions = document.createElement('div');
            fieldActions.className = 'field-actions';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.addEventListener('click', () => {
                formFields.splice(index, 1);
                updateFieldsList();
                updateFormPreview();
            });
            
            fieldActions.appendChild(deleteBtn);
            fieldItem.appendChild(fieldInfo);
            fieldItem.appendChild(fieldActions);
            fieldsList.appendChild(fieldItem);
        });
    }
    
    // Actualizar vista previa del formulario
    function updateFormPreview() {
        formPreview.innerHTML = '';
        
        if (formFields.length === 0) {
            formPreview.innerHTML = '<p>No hay campos para mostrar en la vista previa.</p>';
            return;
        }
        
        formFields.forEach(field => {
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'preview-field';
            
            const label = document.createElement('label');
            label.textContent = field.etiqueta;
            if (field.obligatorio) {
                const requiredStar = document.createElement('span');
                requiredStar.className = 'required-star';
                requiredStar.textContent = ' *';
                label.appendChild(requiredStar);
            }
            
            fieldContainer.appendChild(label);
            
            let input;
            switch (field.tipo) {
                case 'text':
                    input = document.createElement('input');
                    input.type = 'text';
                    break;
                case 'textarea':
                    input = document.createElement('textarea');
                    input.rows = 3;
                    break;
                case 'date':
                    input = document.createElement('input');
                    input.type = 'date';
                    break;
                case 'number':
                    input = document.createElement('input');
                    input.type = 'number';
                    break;
                case 'dropdown':
                    input = document.createElement('select');
                    if (field.opciones) {
                        field.opciones.forEach(option => {
                            const optionElement = document.createElement('option');
                            optionElement.value = option;
                            optionElement.textContent = option;
                            input.appendChild(optionElement);
                        });
                    }
                    break;
                case 'file':
                    input = document.createElement('input');
                    input.type = 'file';
                    break;
                default:
                    input = document.createElement('input');
                    input.type = 'text';
            }
            
            if (field.obligatorio) {
                input.required = true;
            }
            
            input.className = 'preview-input';
            fieldContainer.appendChild(input);
            formPreview.appendChild(fieldContainer);
        });
    }
    
    // Obtener nombre legible del tipo de campo
    function getTypeName(type) {
        const typeNames = {
            'text': 'Texto corto',
            'textarea': 'Párrafo',
            'date': 'Fecha',
            'number': 'Número',
            'dropdown': 'Lista desplegable',
            'file': 'Archivo'
        };
        
        return typeNames[type] || type;
    }
}