document.addEventListener('DOMContentLoaded', () => {
  // Elementos principales
  const form = document.getElementById('userForm');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submitBtn');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirmPassword');
  const termsCheckbox = document.getElementById('terms');

  // Estado del formulario
  let state = {
    passwordValid: false,
    passwordsMatch: false,
    formValid: false
  };

  // Inicialización
  init();

  // FUNCIONES PRINCIPALES
  function init() {
    setupEventListeners();
    setupNavigation();
    updateSubmitButton();
  }

  function setupEventListeners() {
    // Validación en tiempo real
    form.addEventListener('input', () => validateForm());

    // Contraseñas
    passwordInput.addEventListener('input', validatePassword);
    confirmInput.addEventListener('input', validatePasswordMatch);

    // Visibilidad de contraseñas
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const input = e.target.closest('.password-wrapper').querySelector('input');
        input.type = input.type === 'password' ? 'text' : 'password';
        e.target.classList.toggle('fa-eye');
        e.target.classList.toggle('fa-eye-slash');
      });
    });

    // Envío del formulario
    form.addEventListener('submit', handleSubmit);
  }

  function setupNavigation() {
    // Botones de navegación
    const actions = {
      loginOpenProject: () => window.location.href = "http://localhost:4000/login",
      backToHome: () => window.location.href = "http://localhost:4000/",
      goToLogin: () => window.location.href = "http://localhost:4000/login",
      closeSuccess: () => {
        document.getElementById('mensajeExito').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
        form.reset();
        state = { passwordValid: false, passwordsMatch: false, formValid: false };
        updateSubmitButton();
      }
    };


    Object.keys(actions).forEach(id => {
      const element = document.getElementById(id);
      if (element) element.addEventListener('click', actions[id]);
    });
  }

  // VALIDACIONES
  function validateForm() {
    const inputs = Array.from(form.querySelectorAll('input[required]'));
    const allFilled = inputs.every(input => input.value.trim());
    const termsAccepted = termsCheckbox.checked;
    const emailValid = validateEmail(document.getElementById('email').value);

    state.formValid = allFilled && termsAccepted && state.passwordValid && state.passwordsMatch && emailValid;
    updateSubmitButton();
    return state.formValid;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword() {
    const password = passwordInput.value;
    let strength = 0;

    if (password.length >= 10) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    // Actualizar UI
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strengthText');

    if (password) {
      document.getElementById('passwordStrength').classList.add('visible');
      strengthBar.style.width = strength + '%';
      strengthBar.style.backgroundColor = strength >= 75 ? '#1c8328' : strength >= 50 ? '#f39c12' : '#ff6b6b';
      strengthText.textContent = strength >= 75 ? 'Fuerte' : strength >= 50 ? 'Media' : 'Débil';
      state.passwordValid = strength >= 50;
    } else {
      document.getElementById('passwordStrength').classList.remove('visible');
      state.passwordValid = false;
    }

    validatePasswordMatch();
  }

  function validatePasswordMatch() {
    const match = passwordInput.value === confirmInput.value && passwordInput.value;
    const matchElement = document.getElementById('passwordMatch');

    if (confirmInput.value) {
      matchElement.classList.add('visible');
      matchElement.classList.toggle('match', match);
      matchElement.innerHTML = match ?
        '<i class="fas fa-check"></i> <span>Las contraseñas coinciden</span>' :
        '<i class="fas fa-times"></i> <span>Las contraseñas no coinciden</span>';
      state.passwordsMatch = match;
    } else {
      matchElement.classList.remove('visible');
      state.passwordsMatch = false;
    }
  }

  function updateSubmitButton() {
    if (state.formValid) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
      submitBtn.classList.add('pulse');
    } else {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-lock"></i> Completa el formulario';
      submitBtn.classList.remove('pulse');
    }
  }

  // MANEJO DEL ENVÍO
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      showMessage('Por favor, completa correctamente todos los campos.', 'error');
      return;
    }

    // Preparar datos
    const formData = new FormData(form);
    const userData = Object.fromEntries(formData.entries());
    userData.confirmPassword = confirmInput.value;

    // Mostrar progreso
    showProgress();
    showMessage('Creando usuario...', 'info');

    try {
    const response = await fetch("http://localhost:4000/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    // Si la conexión se corta, el código saltará directamente al catch abajo.
    const data = await response.json();

    if (response.ok && data.success) {
        // SOLO AQUÍ ES ÉXITO REAL
        hideProgress(); // Detenemos cualquier barra de carga
        showMessage('✅ ¡Usuario creado exitosamente!', 'success');
        showSuccessModal(data, userData);
        
        // El countdown solo empieza si el servidor confirmó el COMMIT
        startCountdown(data.redirect); 
    } else {
        // El servidor respondió, pero con un error (ej: usuario duplicado)
        throw new Error(data.error || "Error del servidor");
    }

} catch (error) {
    // AQUÍ ES DONDE CAERÁ EL ERR_CONNECTION_RESET
    console.error("Error detectado:", error);
    hideProgress();
    
    // Si el error es de conexión, el mensaje será diferente
    const msg = error.message === 'Failed to fetch' 
        ? "El servidor se desconectó inesperadamente. Revisa la terminal de VS Code." 
        : error.message;
        
    showMessage(`❌ ${msg}`, 'error');
    
    // IMPORTANTE: Asegúrate de que el modal de éxito NO se muestre aquí
    document.getElementById('mensajeExito').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
  }
}


  // FUNCIONES DE UI
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} visible`;
    messageDiv.style.display = 'block';

    if (type !== 'error') {
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    }
  }

  function showProgress() {
    const progress = document.getElementById('progressContainer');
    const bar = document.getElementById('progressBar');
    progress.classList.add('visible');

    let width = 0;
    const interval = setInterval(() => {
      if (width >= 100) {
        clearInterval(interval);
        setTimeout(() => progress.classList.remove('visible'), 1000);
      } else {
        width += 10;
        bar.style.width = width + '%';
      }
    }, 200);
  }

  function hideProgress() {
    document.getElementById('progressContainer').classList.remove('visible');
  }

  function showSuccessModal(apiResponse, userData) {
    const modal = document.getElementById('mensajeExito');
    const overlay = document.getElementById('overlay');

    // Actualizar contenido
    document.getElementById('successTitle').textContent = '🎉 ¡Registro Exitoso!';
    document.getElementById('successMessage').textContent = apiResponse.message;

    document.getElementById('userDetails').innerHTML = `
      <h4>Detalles de tu cuenta:</h4>
      <p><strong>Nombre:</strong> ${userData.firstName} ${userData.lastName}</p>
      <p><strong>Email:</strong> ${userData.email}</p>
      <p><strong>Usuario:</strong> ${userData.login}</p>
    `;

    // Mostrar
    modal.style.display = 'block';
    overlay.style.display = 'block';
  }

  function startCountdown() {
    let seconds = 5;
    const countdownElement = document.getElementById('countdown');

    const interval = setInterval(() => {
      seconds--;
      if (countdownElement) countdownElement.textContent = seconds;

      if (seconds <= 0) {
        clearInterval(interval);
        // CAMBIO AQUÍ: Envíalo a su dashboard, no al login
        window.location.href = "/usuario/usuario.html";
      }
    }, 1000);
  }
});