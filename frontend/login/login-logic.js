document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', (e) => {
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();

        if (user === "" || pass === "") {
            e.preventDefault();
            alert("Por favor, completa todos los campos."); // Usa un alert simple por ahora
        }
    });
});