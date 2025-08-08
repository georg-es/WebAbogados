// Datos de ejemplo
const usersData = [
    {
        id: 1,
        fullName: "María González",
        email: "maria.gonzalez@example.com",
        role: "admin",
        status: "active",
        lastAccess: "2023-06-28 14:30",
        password: "Admin123!"
    },
    {
        id: 2,
        fullName: "Carlos Mendoza",
        email: "carlos.mendoza@example.com",
        role: "abogado",
        status: "active",
        lastAccess: "2023-06-27 09:15",
        password: "Abogado123!"
    },
    {
        id: 3,
        fullName: "Ana López",
        email: "ana.lopez@example.com",
        role: "contabilidad",
        status: "active",
        lastAccess: "2023-06-26 16:45",
        password: "Conta123!"
    },
    {
        id: 4,
        fullName: "Jorge Pérez",
        email: "jorge.perez@example.com",
        role: "asistente",
        status: "inactive",
        lastAccess: "2023-05-15 11:20",
        password: "Asistente123!"
    },
    {
        id: 5,
        fullName: "Laura Ramírez",
        email: "laura.ramirez@example.com",
        role: "cliente",
        status: "active",
        lastAccess: "2023-06-28 10:05",
        password: "Cliente123!"
    }
];

// Variables globales
let currentAction = 'add';
let currentUserId = null;
let users = [...usersData];

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar usuarios
    loadUsers();
    
    // Configurar eventos
    setupEvents();
    
    // Configurar validaciones
    setupValidations();
});

// Cargar usuarios en la tabla
function loadUsers(filteredUsers = null) {
    const usersToDisplay = filteredUsers || users;
    const tableBody = document.querySelector('#users-table tbody');
    tableBody.innerHTML = '';
    
    if (usersToDisplay.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-results">No se encontraron usuarios</td>
            </tr>
        `;
        return;
    }
    
    usersToDisplay.forEach(user => {
        const row = document.createElement('tr');
        
        // Obtener nombre del rol
        const roleName = getRoleName(user.role);
        const roleClass = `role-${user.role}`;
        
        // Formatear fecha de último acceso
        const lastAccess = formatDate(user.lastAccess);
        
        row.innerHTML = `
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${roleClass}">${roleName}</span></td>
            <td><span class="status-badge status-${user.status}">${user.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
            <td>${lastAccess}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" data-id="${user.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn toggle" data-id="${user.id}" data-status="${user.status}" title="${user.status === 'active' ? 'Desactivar' : 'Activar'}">
                        <i class="fas ${user.status === 'active' ? 'fa-user-slash' : 'fa-user-check'}"></i>
                    </button>
                    <button class="action-btn delete" data-id="${user.id}" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Agregar eventos a los botones de acción
    addActionEvents();
}

// Configurar eventos
function setupEvents() {
    // Botón para agregar usuario
    document.getElementById('add-user-btn').addEventListener('click', function() {
        currentAction = 'add';
        document.getElementById('modal-title').textContent = 'Agregar Nuevo Usuario';
        document.getElementById('user-form').reset();
        document.getElementById('user-id').value = '';
        openModal('user-modal');
    });
    
    // Botón para generar contraseña
    document.getElementById('generate-password').addEventListener('click', generatePassword);
    
    // Eventos de los modales
    document.querySelector('.close-modal').addEventListener('click', function() {
        closeModal('user-modal');
    });
    
    document.getElementById('cancel-btn').addEventListener('click', function() {
        closeModal('user-modal');
    });
    
    document.getElementById('confirm-cancel').addEventListener('click', function() {
        closeModal('confirm-modal');
    });
    
    // Búsqueda de usuarios
    document.getElementById('user-search').addEventListener('input', function(e) {
        filterUsers();
    });
    
    // Filtros
    document.getElementById('role-filter').addEventListener('change', filterUsers);
    document.getElementById('status-filter').addEventListener('change', filterUsers);
    
    // Validación de contraseña en tiempo real
    document.getElementById('password').addEventListener('input', checkPasswordStrength);
}

// Configurar validaciones
function setupValidations() {
    const form = document.getElementById('user-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar formulario
        if (validateForm()) {
            if (currentAction === 'add') {
                addUser();
            } else {
                updateUser();
            }
        }
    });
}

// Agregar eventos a los botones de acción
function addActionEvents() {
    // Botones de editar
    document.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            editUser(userId);
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            confirmDelete(userId);
        });
    });
    
    // Botones de activar/desactivar
    document.querySelectorAll('.action-btn.toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            const currentStatus = this.getAttribute('data-status');
            toggleUserStatus(userId, currentStatus);
        });
    });
}

// Filtrar usuarios
function filterUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let filtered = users;
    
    // Filtrar por búsqueda
    if (searchTerm) {
        filtered = filtered.filter(user => 
            user.fullName.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtrar por rol
    if (roleFilter) {
        filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Filtrar por estado
    if (statusFilter) {
        filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    loadUsers(filtered);
}

// Abrir modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

// Cerrar modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Validar formulario
function validateForm() {
    let isValid = true;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validar email único (solo para agregar nuevo)
    if (currentAction === 'add') {
        const emailExists = users.some(user => user.email === email);
        
        if (emailExists) {
            document.getElementById('email-error').textContent = 'Este correo electrónico ya está registrado';
            document.getElementById('email-error').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('email-error').style.display = 'none';
        }
    }
    
    // Validar contraseñas coinciden
    if (password !== confirmPassword) {
        document.getElementById('password-error').textContent = 'Las contraseñas no coinciden';
        document.getElementById('password-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('password-error').style.display = 'none';
    }
    
    // Validar campos requeridos
    const requiredFields = ['full-name', 'email', 'role', 'password', 'confirm-password'];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        
        if (!field.value) {
            field.style.borderColor = 'var(--danger-color)';
            isValid = false;
        } else {
            field.style.borderColor = 'var(--border-color)';
        }
    });
    
    return isValid;
}

// Generar contraseña aleatoria
function generatePassword() {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    
    document.getElementById('password').value = password;
    document.getElementById('confirm-password').value = password;
    checkPasswordStrength();
}

// Verificar fortaleza de contraseña
function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    // Resetear barras
    strengthBars.forEach(bar => {
        bar.style.backgroundColor = '#ddd';
    });
    
    if (!password) {
        strengthText.textContent = 'Seguridad: -';
        return;
    }
    
    // Calcular fortaleza (simplificado)
    let strength = 0;
    
    // Longitud mínima
    if (password.length >= 8) strength++;
    
    // Contiene números
    if (/\d/.test(password)) strength++;
    
    // Contiene mayúsculas y minúsculas
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    
    // Contiene caracteres especiales
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    // Actualizar UI
    for (let i = 0; i < strength; i++) {
        if (i === 0) strengthBars[i].style.backgroundColor = '#e74c3c'; // Rojo
        else if (i === 1) strengthBars[i].style.backgroundColor = '#f39c12'; // Naranja
        else if (i === 2) strengthBars[i].style.backgroundColor = '#3498db'; // Azul
        else if (i === 3) strengthBars[i].style.backgroundColor = '#2ecc71'; // Verde
    }
    
    // Actualizar texto
    if (strength === 0) strengthText.textContent = 'Seguridad: Muy débil';
    else if (strength === 1) strengthText.textContent = 'Seguridad: Débil';
    else if (strength === 2) strengthText.textContent = 'Seguridad: Moderada';
    else if (strength === 3) strengthText.textContent = 'Seguridad: Fuerte';
    else if (strength === 4) strengthText.textContent = 'Seguridad: Muy fuerte';
}

// Agregar nuevo usuario
function addUser() {
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        fullName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        status: 'active',
        lastAccess: new Date().toISOString(),
        password: document.getElementById('password').value
    };
    
    users.push(newUser);
    loadUsers();
    closeModal('user-modal');
    showToast('Usuario agregado correctamente', 'success');
}

// Editar usuario
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    
    if (user) {
        currentAction = 'edit';
        currentUserId = userId;
        
        document.getElementById('modal-title').textContent = 'Editar Usuario';
        document.getElementById('user-id').value = user.id;
        document.getElementById('full-name').value = user.fullName;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
        document.getElementById('password').value = user.password;
        document.getElementById('confirm-password').value = user.password;
        
        checkPasswordStrength();
        openModal('user-modal');
    }
}

// Actualizar usuario
function updateUser() {
    const userIndex = users.findIndex(u => u.id === currentUserId);
    
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            fullName: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value,
            password: document.getElementById('password').value
        };
        
        loadUsers();
        closeModal('user-modal');
        showToast('Usuario actualizado correctamente', 'success');
    }
}

// Confirmar eliminación
function confirmDelete(userId) {
    currentUserId = userId;
    const user = users.find(u => u.id === userId);
    
    document.getElementById('confirm-title').textContent = '¿Eliminar usuario?';
    document.getElementById('confirm-message').textContent = `Estás a punto de eliminar permanentemente al usuario ${user.fullName}. Esta acción no se puede deshacer.`;
    document.getElementById('confirm-action').textContent = 'Eliminar';
    document.getElementById('confirm-action').className = 'btn btn-danger';
    document.getElementById('confirm-action').onclick = deleteUser;
    
    openModal('confirm-modal');
}

// Eliminar usuario
function deleteUser() {
    users = users.filter(u => u.id !== currentUserId);
    loadUsers();
    closeModal('confirm-modal');
    showToast('Usuario eliminado correctamente', 'success');
}

// Activar/Desactivar usuario
function toggleUserStatus(userId, currentStatus) {
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].status = currentStatus === 'active' ? 'inactive' : 'active';
        loadUsers();
        
        const action = currentStatus === 'active' ? 'desactivado' : 'activado';
        showToast(`Usuario ${action} correctamente`, 'success');
    }
}

// Mostrar notificación toast
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Obtener nombre del rol
function getRoleName(roleKey) {
    const roles = {
        'admin': 'Administrador',
        'abogado': 'Abogado',
        'cliente': 'Cliente',
        'contabilidad': 'Contabilidad',
        'asistente': 'Asistente Legal'
    };
    
    return roles[roleKey] || roleKey;
}

// Formatear fecha
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}