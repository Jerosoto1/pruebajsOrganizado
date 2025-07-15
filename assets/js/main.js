
import axios from 'axios';
const roleShow = document.getElementById('roleView')
roleShow.textContent = localStorage.getItem('role')

function isAuth() {
  const result = localStorage.getItem("Auth") || null;
  const resultBool = result === "true";
  return resultBool;
}
const urlAPi = 'http://localhost:3001/events'
const routes = {
    '/': './index.html',
    '/enrollments': './views/enrollments.html',
    '/events': './views/events.html',
    '/addEvent': './views/addEvent.html',
    '/login': './views/login.html',
    '/register': './views/register.html'
}

document.body.addEventListener('click', (e) => {
    if (e.target.matches('[data-link]')) {
        e.preventDefault()
        navigate(e.target.getAttribute('href'))
    }
})

if(!isAuth()) {
    navigate('/login')
    }

async function navigate(pathname) {
    const route = routes[pathname]
    const res = await fetch(route);
    const data = await res.text();
    document.getElementById('view').innerHTML = data
    
    history.pushState({}, "", pathname);

    if( pathname === "/login") {
        setupLoginForm()
    }

     if (pathname === "/addEvent") {
        addEventByForm();
    }

    if (pathname === "/register") {
        register()
    }

    if (pathname === "/events") {
        getEvents()
    }

    if (pathname === "/events" && !isAuth()) {
        pathname === "/login"
    }
}

window.addEventListener('popstate', (e) => {
    e.preventDefault()
    navigate(location.pathname)
})

// Get students

async function getEvents(url = urlAPi) {
    const tbody = document.getElementById('tbody')
    const user =localStorage.getItem('role') === 'admin';

    try {
        const res = await axios.get(url)
        const events = res.data
        if(user) {
            tbody.innerHTML = events.map(event => `
            
            <tr>
                <td>${event.name}</td>
                <td>${event.email}</td>
                <td>${event.number}</td>
                <td>${event.date}</td>
                <td>
                <button data-id="${event.id}" id="" class="edit-btn">Editar</button>
                <button data-id="${event.id}" id="" class="delete-btn">Eliminar</button>
                </td>
            </tr>


            `)
            deleteEvent()
            updateUser()
        } else {
            tbody.innerHTML = events.map(event => `
            
            <tr>
                <td>${event.name}</td>
                <td>${event.email}</td>
                <td>${event.number}</td>
                <td>${event.date}</td>
                <td>
                <button data-id="${event.id}" id="" class="reserve-btn">Reservar</button>
                </td>
            </tr>
            `)
            reserveEvent()
        }
    } catch (error){
        console.log(error)
    }
}

// Add student by form


function addEventByForm(url = urlAPi) {
    const form = document.getElementById('form');

    if(!form) {
        console.log('Form not found');
    } {
        form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const name = document.getElementById('name')?.value || ''
        const email = document.getElementById('email')?.value || ''
        const number = document.getElementById('number')?.value || ''
        const date = document.getElementById('date')?.value || ''

        const dataUser = {name, email, number, date}
            const res = await axios.post(url, dataUser)
            console.log(res.data)
            console.log('Evento agregado!')
            navigate('/events')
    })
    }
}

// Delete Events 

function deleteEvent(url = urlAPi) {

    const user =localStorage.getItem('role') === 'admin'
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async(e) => {
            if (!user) {
                alert('No tienes permisos bro')
            } else {
            const id = e.target.dataset.id
            const remove = await axios.delete(`${url}/${id}`)
            console.log('Evento eliminado')
            console.log(remove.data)
            navigate('/events')
            }
        })
    })
}

// reserve event
const reserveEndpoint = 'http://localhost:3001/reserve';
function reserveEvent(url = reserveEndpoint) {
  document.querySelectorAll('.reserve-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const user = getEvents();
      const eventId = e.target.dataset.id;
      try {
        // Trae los datos del evento completo desde la API
        const res = await axios.get();
        const event = res.data;

        // Crea el objeto reserva
        const reserve = {
          userEmail: user.email,
          eventId: event.id,
          eventName: event.name,
          description: event.description,
          capacity: event.capacity,
          date: event.date
        };

        // Guarda la reserva en el backend
        const response = await axios.post(`http://localhost:3001/reserve`, reserve);
        console.log('Reserva realizada', response.data);
        alert('Evento reservado con éxito 🙌');
        navigate('/dashboard');

      } catch (err) {
        console.error('Error reservando evento:', err);
        alert('Hubo un error al reservar');
      }
    });
  });
}

// Update events

function updateUser(url = urlAPi) {
    const user =localStorage.getItem('role') === 'admin'
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', async(e) => {
            if(!user) {
                alert('No tienes permisos bro')
            } else {
                const name = prompt('Insert new name: ')
                const email = prompt('Insert new email: ')
                const number = prompt('Insert new number: ')
                const date = prompt('Insert new date: ')
                const id = e.target.dataset.id
                const update = await axios.put(`${url}/${id}`, {name, email, number, date})
                console.log('Evento actualizado')
                console.log(update.data)
                navigate('/events')
            }
        })
    })
}

function setupLoginForm() {
  const form = document.getElementById("login-spa");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;

    const users = await getUsers();

    // Buscar usuario que coincida
    const foundUser = users.find(
      (u) => u.email === email && String(u.password) === pass
    );

    if (foundUser) {
      localStorage.setItem("Auth", "true");
      localStorage.setItem("role", foundUser.role);
      navigate("/events");
    } else {
      alert("usuario o contraseña son incorrectos");
    }
  });
}

const buttonCloseSession = document.getElementById("close-sesion");
buttonCloseSession.addEventListener("click", () => {
  localStorage.setItem("Auth", "false");
  localStorage.removeItem("role");
    navigate("/login")

});

const urlUsers = 'http://localhost:3001/users'

function register(url = urlUsers) {
    document.getElementById('form').addEventListener('submit', async (e) => {
        e.preventDefault()
        const email = document.getElementById('email')?.value || '';
        const password = document.getElementById('password')?.value || '';
        const confirmPassword = document.getElementById('confirmPassword')?.value || '';
        const role = "visitor"
        const dataUser = { email, password, role }

        if (password === confirmPassword) {
            const response = await axios.post(url, dataUser)
            console.log(response.data)
            navigate("/login")
        }
    })
}

export async function getUsers() {
  const res = await fetch("http://localhost:3001/users");
  const data = await res.json();
  return data;
}