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
  document.getElementById('mensajeExito').style.display = 'block';
}
