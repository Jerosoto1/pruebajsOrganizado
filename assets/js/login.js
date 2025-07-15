// Animación toggle
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// URL base del JSON Server
const baseURL = "http://localhost:3000/users";

// LOGIN FUNCIONAL
document.getElementById("login-form").addEventListener("submit", async (e) => {
e.preventDefault();
const email = document.getElementById("login-email").value.trim();
const password = document.getElementById("login-password").value;

try {
    const res = await fetch(`${baseURL}?email=${email}`);
    const users = await res.json();

    if (users.length === 0) {
    alert("Correo o contraseña incorrectos");
    return;
    }

    const usuario = users[0];
    if (usuario.password === password) {
    alert(`Bienvenido, ${usuario.nombre}`);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    window.location.href = "./views/events.html";
    } else {
    alert("Correo o contraseña incorrectos");
    }
} catch (err) {
    console.error("Error al iniciar sesión:", err);
    alert("Error del servidor");
}
});

// REGISTRO FUNCIONAL
document.getElementById("register-form").addEventListener("submit", async (e) => {
e.preventDefault();

const nombre = document.getElementById("register-name").value.trim();
const email = document.getElementById("register-email").value.trim();
const password = document.getElementById("register-password").value;
const confirm = document.getElementById("register-confirm").value;

if (password !== confirm) {
    return alert("Las contraseñas no coinciden");
}

try {
    // Verificar si ya existe ese correo
    const check = await fetch(`${baseURL}?email=${email}`);
    const existe = await check.json();

    if (existe.length > 0) {
    return alert("Este correo ya está registrado");
    }

    const nuevoUsuario = {
    nombre,
    email,
    password,
    rol: "user",
    };

    const res = await fetch(baseURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoUsuario),
    });

    if (res.ok) {
    alert("Usuario registrado correctamente. Inicia sesión.");
    loginBtn.click(); 
    } else {
    alert("Error al registrar usuario.");
    }
} catch (err) {
    console.error("Error en el registro:", err);
    alert("Error del servidor");
}
});
