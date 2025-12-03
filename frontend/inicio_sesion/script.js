const form = document.getElementById('userForm');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  messageDiv.textContent = "Creando usuario...";
  messageDiv.className = "message";

  const userData = {
    login: form.login.value.trim(),
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    email: form.email.value.trim(),
    password: form.password.value.trim(),
  };

  // Validación mejorada
  if (userData.password.length < 10) {
    messageDiv.textContent = "❌ La contraseña debe tener al menos 10 caracteres";
    messageDiv.className = "message error";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    messageDiv.textContent = "❌ Por favor ingresa un email válido";
    messageDiv.className = "message error";
    return;
  }

  try {
    const response = await fetch("http://localhost:4000/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.textContent = "✅ Usuario creado correctamente.";
      messageDiv.className = "message success";
      form.reset();
      // Mostrar mensaje de éxito visual
      mostrarExito();
    } else {
      messageDiv.textContent = `⚠️ Error: ${data.error || "No se pudo crear el usuario."}`;
      messageDiv.className = "message error";
    }
  } catch (err) {
    messageDiv.textContent = "❌ Error de conexión con el servidor.";
    messageDiv.className = "message error";
  }
});

function mostrarExito() {
  const mensajeExito = document.getElementById('mensajeExito');
  mensajeExito.style.display = 'block';
  
  // Configurar botón cerrar
  const btnCerrar = mensajeExito.querySelector('.btn-cerrar');
  btnCerrar.onclick = function() {
    mensajeExito.style.display = 'none';
  };
  
  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    mensajeExito.style.display = 'none';
  }, 5000);
}

// Botón de login con OpenProject (ya está en el HTML)
// document.getElementById("loginOpenProject").addEventListener("click", () => {
//   window.location.href = "http://localhost:4000/auth/openproject";
// });