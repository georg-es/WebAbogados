// Datos de ejemplo - Módulos del sistema
const systemModules = [
    { id: 1, name: "Dashboard", description: "Panel principal de la aplicación" },
    { id: 2, name: "Gestión de Usuarios", description: "Administración de usuarios del sistema" },
    { id: 3, name: "Gestión de Roles", description: "Administración de roles y permisos" },
    { id: 4, name: "Configuración", description: "Configuración general del sistema" },
    { id: 5, name: "Reportes", description: "Generación de reportes y estadísticas" },
    { id: 6, name: "Inventario", description: "Gestión de productos y stock" },
    { id: 7, name: "Ventas", description: "Procesamiento de ventas y facturación" },
    { id: 8, name: "Clientes", description: "Administración de la base de clientes" }
];

// Datos de ejemplo - Roles del sistema
let roles = [
    { 
        id: 1, 
        name: "Administrador", 
        description: "Acceso completo a todos los módulos del sistema",
        modules: [1, 2, 3, 4, 5, 6, 7, 8] // Todos los módulos
    },
    { 
        id: 2, 
        name: "Supervisor", 
        description: "Acceso a módulos de gestión y reportes",
        modules: [1, 5, 6, 7, 8] // Dashboard, Reportes, Inventario, Ventas, Clientes
    },
    { 
        id: 3, 
        name: "Vendedor", 
        description: "Acceso limitado a módulos de ventas y clientes",
        modules: [1, 7, 8] // Dashboard, Ventas, Clientes
    },
    { 
        id: 4, 
        name: "Invitado", 
        description: "Acceso de solo lectura al dashboard",
        modules: [1] // Solo Dashboard
    }
];

// Estado de la aplicación
let currentRoleId = null;
let isEditing = false;
let roleToDelete = null;

// Elementos del DOM
const roleForm = document.getElementById('role-form');
const roleIdInput = document.getElementById('role-id');
const roleNameInput = document.getElementById('role-name');
const roleDescriptionInput = document.getElementById('role-description');
const saveRoleButton = document.getElementById('save-role-btn');
const cancelRoleButton = document.getElementById('cancel-role-btn');
const newRoleButton = document.getElementById('new-role-btn');
const rolesContainer = document.getElementById('roles-container');
const modulesContainer = document.getElementById('modules-container');
const noRoleSelected = document.getElementById('no-role-selected');
const permissionsContainer = document.getElementById('permissions-container');
const selectedRoleInfo = document.getElementById('selected-role-info');
const selectedRoleName = document.getElementById('selected-role-name');
const savePermissionsButton = document.getElementById('save-permissions-btn');
const selectAllButton = document.getElementById('select-all-btn');
const deselectAllButton = document.getElementById('deselect-all-btn');

// Elementos del modal
const confirmModal = document.getElementById('confirm-modal');
const roleToDeleteElement = document.getElementById('role-to-delete');
const confirmDeleteButton = document.getElementById('confirm-delete-btn');
const cancelDeleteButton = document.getElementById('cancel-delete-btn');
const closeModalButton = document.getElementById('close-modal');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    renderRoles();
    renderModules();
    
    // Event Listeners
    roleForm.addEventListener('submit', handleRoleSubmit);
    cancelRoleButton.addEventListener('click', cancelEdit);
    newRoleButton.addEventListener('click', newRole);
    savePermissionsButton.addEventListener('click', savePermissions);
    selectAllButton.addEventListener('click', selectAllModules);
    deselectAllButton.addEventListener('click', deselectAllModules);
    
    // Modal events
    confirmDeleteButton.addEventListener('click', confirmDelete);
    cancelDeleteButton.addEventListener('click', closeModal);
    closeModalButton.addEventListener('click', closeModal);
    
    // Cerrar modal al hacer clic fuera
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            closeModal();
        }
    });
});

// Renderizar la lista de roles
function renderRoles() {
    rolesContainer.innerHTML = '';
    
    if (roles.length === 0) {
        rolesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users-slash"></i>
                <h3>No hay roles creados</h3>
                <p>Haga clic en "Nuevo Rol" para crear el primer rol</p>
            </div>
        `;
        return;
    }
    
    roles.forEach(role => {
        const roleElement = document.createElement('div');
        roleElement.className = `role-item ${currentRoleId === role.id ? 'selected' : ''}`;
        roleElement.dataset.id = role.id;
        
        roleElement.innerHTML = `
            <div class="role-info">
                <div class="role-name">${role.name}</div>
                <div class="role-description">${role.description}</div>
            </div>
            <div class="role-actions">
                <button class="btn edit-btn">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn delete-btn">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        
        // Event listeners para los botones de editar y eliminar
        const editBtn = roleElement.querySelector('.edit-btn');
        const deleteBtn = roleElement.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editRole(role.id);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirmation(role);
        });
        
        // Seleccionar rol al hacer clic
        roleElement.addEventListener('click', () => {
            selectRole(role.id);
        });
        
        rolesContainer.appendChild(roleElement);
    });
}

// Renderizar la lista de módulos con checkboxes
function renderModules() {
    modulesContainer.innerHTML = '';
    
    systemModules.forEach(module => {
        const moduleElement = document.createElement('div');
        moduleElement.className = 'module-item';
        moduleElement.dataset.id = module.id;
        
        // Verificar si el rol actual tiene acceso a este módulo
        const currentRole = roles.find(r => r.id === currentRoleId);
        const isChecked = currentRole ? currentRole.modules.includes(module.id) : false;
        
        moduleElement.innerHTML = `
            <input type="checkbox" id="module-${module.id}" class="module-checkbox" ${isChecked ? 'checked' : ''}>
            <div class="module-info">
                <div class="module-name">${module.name}</div>
                <div class="module-description">${module.description}</div>
            </div>
        `;
        
        // Event listener para el checkbox
        const checkbox = moduleElement.querySelector('.module-checkbox');
        checkbox.addEventListener('change', function() {
            // Habilitar el botón de guardar permisos cuando hay cambios
            savePermissionsButton.classList.remove('hidden');
        });
        
        modulesContainer.appendChild(moduleElement);
    });
}

// Seleccionar un rol
function selectRole(roleId) {
    currentRoleId = roleId;
    renderRoles();
    
    const role = roles.find(r => r.id === roleId);
    if (role) {
        // Mostrar información del rol seleccionado
        selectedRoleName.textContent = role.name;
        selectedRoleInfo.classList.remove('hidden');
        
        // Ocultar mensaje de "no seleccionado" y mostrar permisos
        noRoleSelected.classList.add('hidden');
        permissionsContainer.classList.remove('hidden');
        
        // Renderizar módulos con los permisos actuales del rol
        renderModules();
        
        // Ocultar el botón de guardar permisos (hasta que haya cambios)
        savePermissionsButton.classList.add('hidden');
    }
}

// Crear un nuevo rol
function newRole() {
    resetForm();
    roleForm.scrollIntoView({ behavior: 'smooth' });
}

// Editar un rol
function editRole(roleId) {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    isEditing = true;
    
    // Llenar el formulario con los datos del rol
    roleIdInput.value = role.id;
    roleNameInput.value = role.name;
    roleDescriptionInput.value = role.description;
    
    // Actualizar interfaz
    saveRoleButton.innerHTML = '<i class="fas fa-save"></i> Actualizar Rol';
    cancelRoleButton.classList.remove('hidden');
    
    // Desplazar al formulario
    roleForm.scrollIntoView({ behavior: 'smooth' });
}

// Manejar envío del formulario (crear o editar rol)
function handleRoleSubmit(e) {
    e.preventDefault();
    
    const roleId = roleIdInput.value;
    const name = roleNameInput.value.trim();
    const description = roleDescriptionInput.value.trim();
    
    if (!name) {
        alert('El nombre del rol es obligatorio');
        return;
    }
    
    // Verificar si el nombre ya existe (excepto para el rol que estamos editando)
    const existingRole = roles.find(r => r.name.toLowerCase() === name.toLowerCase() && r.id !== parseInt(roleId));
    if (existingRole) {
        alert('Ya existe un rol con ese nombre');
        return;
    }
    
    if (isEditing && roleId) {
        // Editar rol existente
        const roleIndex = roles.findIndex(r => r.id === parseInt(roleId));
        if (roleIndex !== -1) {
            roles[roleIndex].name = name;
            roles[roleIndex].description = description;
        }
    } else {
        // Crear nuevo rol
        const newId = roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1;
        roles.push({
            id: newId,
            name,
            description,
            modules: [] // Sin módulos asignados inicialmente
        });
    }
    
    // Resetear formulario y estado
    resetForm();
    renderRoles();
    
    // Mostrar mensaje de éxito
    showNotification(isEditing ? 'Rol actualizado correctamente' : 'Rol creado correctamente', 'success');
}

// Cancelar edición
function cancelEdit() {
    resetForm();
}

// Resetear formulario
function resetForm() {
    roleForm.reset();
    roleIdInput.value = '';
    isEditing = false;
    saveRoleButton.innerHTML = '<i class="fas fa-save"></i> Guardar Rol';
    cancelRoleButton.classList.add('hidden');
}

// Mostrar confirmación de eliminación
function showDeleteConfirmation(role) {
    roleToDelete = role;
    roleToDeleteElement.textContent = role.name;
    confirmModal.classList.remove('hidden');
}

// Confirmar eliminación
function confirmDelete() {
    if (roleToDelete) {
        const roleIndex = roles.findIndex(r => r.id === roleToDelete.id);
        if (roleIndex !== -1) {
            roles.splice(roleIndex, 1);
            
            // Si el rol eliminado era el seleccionado, limpiar selección
            if (currentRoleId === roleToDelete.id) {
                currentRoleId = null;
                selectedRoleInfo.classList.add('hidden');
                noRoleSelected.classList.remove('hidden');
                permissionsContainer.classList.add('hidden');
            }
            
            renderRoles();
            showNotification('Rol eliminado correctamente', 'success');
        }
    }
    
    closeModal();
}

// Cerrar modal
function closeModal() {
    confirmModal.classList.add('hidden');
    roleToDelete = null;
}

// Guardar permisos del rol
function savePermissions() {
    if (!currentRoleId) return;
    
    const role = roles.find(r => r.id === currentRoleId);
    if (!role) return;
    
    // Obtener todos los checkboxes marcados
    const checkboxes = modulesContainer.querySelectorAll('.module-checkbox:checked');
    const selectedModules = Array.from(checkboxes).map(cb => parseInt(cb.parentElement.parentElement.dataset.id));
    
    // Actualizar los módulos del rol
    role.modules = selectedModules;
    
    // Ocultar el botón de guardar
    savePermissionsButton.classList.add('hidden');
    
    // Mostrar mensaje de éxito
    showNotification('Permisos actualizados correctamente', 'success');
}

// Seleccionar todos los módulos
function selectAllModules() {
    const checkboxes = modulesContainer.querySelectorAll('.module-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    
    // Habilitar el botón de guardar permisos
    savePermissionsButton.classList.remove('hidden');
}

// Deseleccionar todos los módulos
function deselectAllModules() {
    const checkboxes = modulesContainer.querySelectorAll('.module-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Habilitar el botón de guardar permisos
    savePermissionsButton.classList.remove('hidden');
}

// Mostrar notificación
function showNotification(message, type) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Estilos para la notificación
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.backgroundColor = type === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
    notification.style.color = 'white';
    notification.style.borderRadius = 'var(--radius)';
    notification.style.boxShadow = 'var(--shadow)';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}