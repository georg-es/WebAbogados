document.addEventListener('DOMContentLoaded', function() {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Simulación de base de datos de usuarios
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Alternar entre login y registro
    signUpButton.addEventListener('click', () => {
        container.classList.add('right-panel-active');
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove('right-panel-active');
    });

    // Manejar registro
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        // Validar que el email no exista
        if (users.some(user => user.email === email)) {
            alert('Este email ya está registrado');
            return;
        }

        // Agregar nuevo usuario
        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('Registro exitoso! Por favor inicia sesión.');
        container.classList.remove('right-panel-active');
        registerForm.reset();
    });

    // Manejar login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Buscar usuario
        const user = users.find(user => user.email === email && user.password === password);
        
        if (user) {
            alert(`Bienvenido ${user.name}!`);
            // Aquí normalmente redirigirías a la página principal
            // window.location.href = 'dashboard.html';
        } else {
            alert('Email o contraseña incorrectos');
        }
        
        loginForm.reset();
    });
});