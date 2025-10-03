// Datos de ejemplo
let groups = [
    { id: 1, name: "Administradores", description: "Grupo con permisos de administración", users: [1, 2] },
    { id: 2, name: "Usuarios", description: "Grupo de usuarios estándar", users: [3, 4, 5] },
    { id: 3, name: "Invitados", description: "Grupo con permisos limitados", users: [] }
];

let users = [
    { id: 1, name: "Ana García", email: "ana@empresa.com" },
    { id: 2, name: "Carlos López", email: "carlos@empresa.com" },
    { id: 3, name: "María Rodríguez", email: "maria@empresa.com" },
    { id: 4, name: "José Martínez", email: "jose@empresa.com" },
    { id: 5, name: "Laura Fernández", email: "laura@empresa.com" },
    { id: 6, name: "Miguel Sánchez", email: "miguel@empresa.com" },
    { id: 7, name: "Elena Gómez", email: "elena@empresa.com" }
];

// Estado de la aplicación
let currentGroupId = null;
let isEditing = false;

// Elementos del DOM
const groupForm = document.getElementById('group-form');
const groupIdInput = document.getElementById('group-id');
const groupNameInput = document.getElementById('group-name');
const groupDescriptionInput = document.getElementById('group-description');
const saveButton = document.getElementById('save-btn');
const cancelButton = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const groupsContainer = document.getElementById('groups-container');
const availableUsersContainer = document.getElementById('available-users');
const groupUsersContainer = document.getElementById('group-users');
const addUsersButton = document.getElementById('add-users');
const removeUsersButton = document.getElementById('remove-users');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    renderGroups();
    renderAvailableUsers();
    
    // Event Listeners
    groupForm.addEventListener('submit', handleGroupSubmit);
    cancelButton.addEventListener('click', cancelEdit);
    addUsersButton.addEventListener('click', addUsersToGroup);
    removeUsersButton.addEventListener('click', removeUsersFromGroup);
});

// Renderizar la lista de grupos
function renderGroups() {
    groupsContainer.innerHTML = '';
    
    if (groups.length === 0) {
        groupsContainer.innerHTML = '<div class="empty-message">No hay grupos creados</div>';
        return;
    }
    
    groups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.className = `group-item ${currentGroupId === group.id ? 'selected' : ''}`;
        groupElement.dataset.id = group.id;
        
        groupElement.innerHTML = `
            <div class="group-info">
                <div class="group-name">${group.name}</div>
                <div class="group-description">${group.description}</div>
            </div>
            <div class="group-actions">
                <button class="edit-btn">Editar</button>
                <button class="delete-btn">Eliminar</button>
            </div>
        `;
        
        // Event listeners para los botones de editar y eliminar
        const editBtn = groupElement.querySelector('.edit-btn');
        const deleteBtn = groupElement.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editGroup(group.id);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteGroup(group.id);
        });
        
        // Seleccionar grupo al hacer clic
        groupElement.addEventListener('click', () => {
            selectGroup(group.id);
        });
        
        groupsContainer.appendChild(groupElement);
    });
}

// Renderizar usuarios disponibles
function renderAvailableUsers() {
    availableUsersContainer.innerHTML = '';
    
    if (users.length === 0) {
        availableUsersContainer.innerHTML = '<div class="empty-message">No hay usuarios disponibles</div>';
        return;
    }
    
    // Obtener usuarios que no están en el grupo actual
    const currentGroup = groups.find(g => g.id === currentGroupId);
    const usersInGroup = currentGroup ? currentGroup.users : [];
    
    const availableUsers = users.filter(user => !usersInGroup.includes(user.id));
    
    if (availableUsers.length === 0) {
        availableUsersContainer.innerHTML = '<div class="empty-message">No hay usuarios disponibles</div>';
        return;
    }
    
    availableUsers.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.dataset.id = user.id;
        
        userElement.innerHTML = `
            <input type="checkbox" id="user-${user.id}" class="user-checkbox">
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-email">${user.email}</div>
            </div>
        `;
        
        availableUsersContainer.appendChild(userElement);
    });
    
    // Habilitar/deshabilitar botones según la selección
    updateButtonStates();
}

// Renderizar usuarios en el grupo seleccionado
function renderGroupUsers() {
    groupUsersContainer.innerHTML = '';
    
    if (!currentGroupId) {
        groupUsersContainer.innerHTML = '<div class="empty-message">Selecciona un grupo para ver sus usuarios</div>';
        return;
    }
    
    const currentGroup = groups.find(g => g.id === currentGroupId);
    
    if (!currentGroup || currentGroup.users.length === 0) {
        groupUsersContainer.innerHTML = '<div class="empty-message">No hay usuarios en este grupo</div>';
        return;
    }
    
    currentGroup.users.forEach(userId => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.dataset.id = user.id;
        
        userElement.innerHTML = `
            <input type="checkbox" id="group-user-${user.id}" class="user-checkbox">
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-email">${user.email}</div>
            </div>
        `;
        
        groupUsersContainer.appendChild(userElement);
    });
    
    // Habilitar/deshabilitar botones según la selección
    updateButtonStates();
}

// Seleccionar un grupo
function selectGroup(groupId) {
    currentGroupId = groupId;
    renderGroups();
    renderAvailableUsers();
    renderGroupUsers();
    
    // Actualizar estado de los botones
    updateButtonStates();
}

// Manejar envío del formulario (crear o editar grupo)
function handleGroupSubmit(e) {
    e.preventDefault();
    
    const groupId = groupIdInput.value;
    const name = groupNameInput.value.trim();
    const description = groupDescriptionInput.value.trim();
    
    if (!name) {
        alert('El nombre del grupo es obligatorio');
        return;
    }
    
    if (isEditing && groupId) {
        // Editar grupo existente
        const groupIndex = groups.findIndex(g => g.id === parseInt(groupId));
        if (groupIndex !== -1) {
            groups[groupIndex].name = name;
            groups[groupIndex].description = description;
        }
    } else {
        // Crear nuevo grupo
        const newId = groups.length > 0 ? Math.max(...groups.map(g => g.id)) + 1 : 1;
        groups.push({
            id: newId,
            name,
            description,
            users: []
        });
    }
    
    // Resetear formulario y estado
    resetForm();
    renderGroups();
    
    // Si estamos editando, mantener seleccionado el grupo editado
    if (isEditing && groupId) {
        selectGroup(parseInt(groupId));
    }
}

// Editar un grupo
function editGroup(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    isEditing = true;
    currentGroupId = groupId;
    
    // Llenar el formulario con los datos del grupo
    groupIdInput.value = group.id;
    groupNameInput.value = group.name;
    groupDescriptionInput.value = group.description;
    
    // Actualizar interfaz
    formTitle.textContent = 'Editar Grupo';
    saveButton.textContent = 'Actualizar Grupo';
    cancelButton.classList.remove('hidden');
    
    // Renderizar grupos para actualizar la selección
    renderGroups();
    renderAvailableUsers();
    renderGroupUsers();
}

// Eliminar un grupo
function deleteGroup(groupId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
        return;
    }
    
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex !== -1) {
        groups.splice(groupIndex, 1);
        
        // Si el grupo eliminado era el seleccionado, limpiar selección
        if (currentGroupId === groupId) {
            currentGroupId = null;
            resetForm();
        }
        
        renderGroups();
        renderAvailableUsers();
        renderGroupUsers();
    }
}

// Cancelar edición
function cancelEdit() {
    resetForm();
    renderGroups();
}

// Resetear formulario
function resetForm() {
    groupForm.reset();
    groupIdInput.value = '';
    isEditing = false;
    formTitle.textContent = 'Crear Nuevo Grupo';
    saveButton.textContent = 'Crear Grupo';
    cancelButton.classList.add('hidden');
}

// Agregar usuarios al grupo
function addUsersToGroup() {
    if (!currentGroupId) return;
    
    const selectedUsers = getSelectedUsers(availableUsersContainer);
    if (selectedUsers.length === 0) return;
    
    const group = groups.find(g => g.id === currentGroupId);
    if (!group) return;
    
    // Agregar usuarios al grupo
    selectedUsers.forEach(userId => {
        if (!group.users.includes(userId)) {
            group.users.push(userId);
        }
    });
    
    // Actualizar la interfaz
    renderAvailableUsers();
    renderGroupUsers();
}

// Quitar usuarios del grupo
function removeUsersFromGroup() {
    if (!currentGroupId) return;
    
    const selectedUsers = getSelectedUsers(groupUsersContainer);
    if (selectedUsers.length === 0) return;
    
    const group = groups.find(g => g.id === currentGroupId);
    if (!group) return;
    
    // Quitar usuarios del grupo
    group.users = group.users.filter(userId => !selectedUsers.includes(userId));
    
    // Actualizar la interfaz
    renderAvailableUsers();
    renderGroupUsers();
}

// Obtener usuarios seleccionados en un contenedor
function getSelectedUsers(container) {
    const checkboxes = container.querySelectorAll('.user-checkbox:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.parentElement.dataset.id));
}

// Actualizar estado de los botones según la selección
function updateButtonStates() {
    const hasAvailableUsersSelected = availableUsersContainer.querySelectorAll('.user-checkbox:checked').length > 0;
    const hasGroupUsersSelected = groupUsersContainer.querySelectorAll('.user-checkbox:checked').length > 0;
    
    addUsersButton.disabled = !hasAvailableUsersSelected || !currentGroupId;
    removeUsersButton.disabled = !hasGroupUsersSelected || !currentGroupId;
}

// Event listeners para checkboxes de usuarios (delegación de eventos)
availableUsersContainer.addEventListener('change', updateButtonStates);
groupUsersContainer.addEventListener('change', updateButtonStates);