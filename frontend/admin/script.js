// frontend/admin/script.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado - Panel de Administración');
    
    // Verificar si el usuario es administrador
    checkAdminAccess();
    
    // Cargar datos del usuario
    loadUserData();
    
    // Configurar navegación entre secciones
    setupNavigation();
    
    // Configurar menú desplegable
    setupUserMenu();
    
    // Configurar logout
    setupLogout();
    
    // Cargar datos del dashboard
    loadDashboardData();
    
    // Configurar botón para cambiar a vista usuario
    setupSwitchToUserPanel();
    
    // SOLUCIÓN: Configurar botones de "Crear Proyecto"
    setupCreateProjectButtons();
});

// SOLUCIÓN: Configurar todos los botones de "Crear Proyecto"
function setupCreateProjectButtons() {
    console.log('Configurando botones de creación de proyectos...');
    
    // Botón en el sidebar
    const sidebarLink = document.getElementById('crear-proyecto-link');
    if (sidebarLink) {
        console.log('Configurando botón del sidebar:', sidebarLink.href);
        sidebarLink.addEventListener('click', function(e) {
            e.preventDefault();
            const adminPath = './Formulario/crear-proyecto.html';
            console.log('Navegando a:', adminPath);
            window.location.href = adminPath;
        });
    }
    
    // Botón en la sección de proyectos
    const nuevoProyectoBtn = document.getElementById('nuevo-proyecto-btn');
    if (nuevoProyectoBtn) {
        console.log('Configurando botón "Nuevo Proyecto"');
        nuevoProyectoBtn.addEventListener('click', function() {
            const adminPath = './Formulario/crear-proyecto.html';
            console.log('Navegando a:', adminPath);
            window.location.href = adminPath;
        });
    }
}

// Verificar que el usuario sea administrador
async function checkAdminAccess() {
    try {
        const response = await fetch('http://localhost:4000/auth/me', {
            credentials: 'include'
        });

        if (response.ok) {
            const userData = await response.json();
            
            if (!userData.isAdmin) {
                // No es administrador, redirigir al panel de usuario normal
                alert('⚠️ No tienes permisos de administrador. Redirigiendo al panel de usuario...');
                window.location.href = 'http://localhost:4000/usuario/usuario.html';
                return false;
            }
            
            console.log('Usuario verificado como administrador:', userData.email);
            return true;
        } else if (response.status === 401) {
            // No autenticado, redirigir al login
            window.location.href = 'http://localhost:4000/';
            return false;
        } else {
            throw new Error('Error al verificar permisos');
        }
    } catch (error) {
        console.error('Error verificando acceso de admin:', error);
        alert('Error al verificar permisos. Redirigiendo...');
        window.location.href = 'http://localhost:4000/';
        return false;
    }
}

// Cargar datos del usuario
async function loadUserData() {
    try {
        const response = await fetch('http://localhost:4000/auth/me', {
            credentials: 'include'
        });

        if (response.ok) {
            const userData = await response.json();
            
            // Mostrar información del usuario
            const userInfoElement = document.getElementById('user-info');
            const userNameElement = document.getElementById('user-name');
            
            const firstName = userData.firstName || 'Administrador';
            const lastName = userData.lastName || '';
            const email = userData.email || '';
            
            if (userInfoElement) {
                userInfoElement.innerHTML = `
                    <h3>${firstName} ${lastName}</h3>
                    <p>${email}</p>
                `;
            }
            
            if (userNameElement) {
                userNameElement.textContent = `${firstName} ${lastName}`;
            }
        }
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
    }
}

// Configurar navegación entre secciones
function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu a[data-section]');
    const contentSections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('section-title');
    
    // Títulos de las secciones
    const sectionTitles = {
        'dashboard': 'Dashboard de Administración',
        'projects': 'Gestión de Proyectos',
        'users': 'Gestión de Usuarios',
        'reports': 'Fichas Técnicas',
        'settings': 'Configuración del Sistema'
    };
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener la sección a mostrar
            const sectionId = this.getAttribute('data-section');
            
            // Actualizar título
            if (sectionTitle && sectionTitles[sectionId]) {
                sectionTitle.textContent = sectionTitles[sectionId];
            }
            
            // Actualizar menú activo
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionId}-section`) {
                    section.classList.add('active');
                    
                    // Cargar datos de la sección si es necesario
                    switch(sectionId) {
                        case 'projects':
                            loadProjectsData();
                            break;
                        case 'users':
                            loadUsersData();
                            break;
                        case 'reports':
                            loadReportsData();
                            break;
                        case 'settings':
                            loadSettingsData();
                            break;
                    }
                }
            });
        });
    });
    
    // Configurar botones de actualización
    const refreshProjectsBtn = document.getElementById('refreshProjects');
    if (refreshProjectsBtn) {
        refreshProjectsBtn.addEventListener('click', loadProjectsData);
    }
    
    const refreshUsersBtn = document.getElementById('refreshUsers');
    if (refreshUsersBtn) {
        refreshUsersBtn.addEventListener('click', loadUsersData);
    }
}

// Configurar menú desplegable
function setupUserMenu() {
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuTrigger && userDropdown) {
        userMenuTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!userMenuTrigger.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
        
        // Cerrar menú con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                userDropdown.classList.remove('active');
            }
        });
    }
}

// Configurar logout
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const confirmLogout = confirm('¿Estás seguro de que quieres cerrar sesión?');
            if (confirmLogout) {
                window.location.href = 'http://localhost:4000/auth/logout';
            }
        });
    }
}

// Configurar cambio a vista usuario
function setupSwitchToUserPanel() {
    const switchBtn = document.getElementById('switchToUserPanel');
    if (switchBtn) {
        switchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'http://localhost:4000/usuario/usuario.html';
        });
    }
}

// Cargar datos del dashboard
async function loadDashboardData() {
    try {
        // Obtener token de sesión
        const userResponse = await fetch('http://localhost:4000/auth/me', {
            credentials: 'include'
        });
        
        if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // Datos de ejemplo para el dashboard
            const dashboardData = {
                totalProjects: 24,
                activeUsers: 156,
                activeProjects: 18,
                weekActivity: 47
            };
            
            // Actualizar estadísticas
            document.getElementById('total-projects').textContent = dashboardData.totalProjects;
            document.getElementById('active-users').textContent = dashboardData.activeUsers;
            document.getElementById('active-projects').textContent = dashboardData.activeProjects;
            document.getElementById('week-activity').textContent = dashboardData.weekActivity;
            
            // Actualizar proyectos recientes
            const recentProjects = [
                { name: 'Desarrollo Plataforma VIDI', identifier: 'vidi-plataforma', status: 'Activo', created: '2024-01-15' },
                { name: 'Investigación IA', identifier: 'ia-investigacion', status: 'En progreso', created: '2024-01-10' },
                { name: 'Sistema Gestión', identifier: 'sistema-gestion', status: 'Completado', created: '2023-12-20' }
            ];
            
            const recentProjectsDiv = document.getElementById('recent-projects');
            if (recentProjectsDiv) {
                recentProjectsDiv.innerHTML = recentProjects.map(project => `
                    <div class="project-item">
                        <h4>${project.name}</h4>
                        <p><strong>ID:</strong> ${project.identifier} | <strong>Estado:</strong> ${project.status}</p>
                        <small>Creado: ${project.created}</small>
                    </div>
                `).join('');
            }
            
            // Actualizar actividad reciente
            const recentActivityDiv = document.getElementById('recent-activity');
            if (recentActivityDiv) {
                recentActivityDiv.innerHTML = `
                    <div class="activity-item">
                        <p><strong>Nuevo proyecto creado:</strong> Desarrollo Plataforma VIDI</p>
                        <small>Hace 2 días</small>
                    </div>
                    <div class="activity-item">
                        <p><strong>Usuario registrado:</strong> Juan Pérez</p>
                        <small>Hace 3 días</small>
                    </div>
                    <div class="activity-item">
                        <p><strong>Proyecto completado:</strong> Sistema Gestión</p>
                        <small>Hace 1 semana</small>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
    }
}

// Cargar datos de proyectos
async function loadProjectsData() {
    try {
        const projectsTableBody = document.getElementById('projects-table-body');
        if (projectsTableBody) {
            projectsTableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div style="text-align: center; padding: 20px;">
                            <i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i>
                            Cargando proyectos...
                        </div>
                    </td>
                </tr>
            `;
            
            // Datos de ejemplo
            setTimeout(() => {
                const exampleProjects = [
                    { name: 'Desarrollo Plataforma VIDI', identifier: 'vidi-plataforma', status: 'Activo', created: '2024-01-15', id: 1 },
                    { name: 'Investigación IA', identifier: 'ia-investigacion', status: 'En progreso', created: '2024-01-10', id: 2 },
                    { name: 'Sistema Gestión', identifier: 'sistema-gestion', status: 'Completado', created: '2023-12-20', id: 3 },
                    { name: 'App Móvil', identifier: 'app-movil', status: 'En pausa', created: '2023-12-15', id: 4 },
                    { name: 'Base de Datos', identifier: 'base-datos', status: 'Activo', created: '2023-12-10', id: 5 }
                ];
                
                projectsTableBody.innerHTML = exampleProjects.map(project => `
                    <tr>
                        <td>${project.name}</td>
                        <td>${project.identifier}</td>
                        <td>
                            <span class="status-badge status-${project.status.toLowerCase().replace(' ', '-')}">
                                ${project.status}
                            </span>
                        </td>
                        <td>${project.created}</td>
                        <td>
                            <button class="btn-action" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            <!-- SOLUCIÓN: Ruta corregida -->
                            <button class="btn-action" title="Editar" onclick="window.location.href='./Formulario/crear-proyecto.html?id=${project.id}'">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
                
                // Agregar estilos para los badges de estado
                const style = document.createElement('style');
                style.textContent = `
                    .status-badge {
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                        display: inline-block;
                    }
                    .status-activo { background: #d4edda; color: #155724; }
                    .status-en-progreso { background: #fff3cd; color: #856404; }
                    .status-completado { background: #d1ecf1; color: #0c5460; }
                    .status-en-pausa { background: #f8d7da; color: #721c24; }
                    
                    .btn-action {
                        background: none;
                        border: none;
                        color: var(--admin-primary);
                        cursor: pointer;
                        padding: 5px;
                        margin: 0 2px;
                    }
                    .btn-action:hover {
                        color: var(--admin-accent);
                    }
                `;
                document.head.appendChild(style);
                
            }, 1000);
        }
    } catch (error) {
        console.error('Error cargando proyectos:', error);
        const projectsTableBody = document.getElementById('projects-table-body');
        if (projectsTableBody) {
            projectsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="color: var(--admin-danger); text-align: center;">
                        <i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>
                        Error al cargar proyectos
                    </td>
                </tr>
            `;
        }
    }
}

// Cargar datos de usuarios
async function loadUsersData() {
    // Similar a loadProjectsData pero para usuarios
    const usersTableBody = document.getElementById('users-table-body');
    if (usersTableBody) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">
                    <i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i>
                    Cargando usuarios...
                </td>
            </tr>
        `;
        
        setTimeout(() => {
            const exampleUsers = [
                { name: 'Ana García', email: 'ana@unefa.edu.ve', login: 'agarcia', status: 'Activo', lastAccess: '2024-01-20' },
                { name: 'Carlos López', email: 'carlos@unefa.edu.ve', login: 'clopez', status: 'Activo', lastAccess: '2024-01-19' },
                { name: 'María Rodríguez', email: 'maria@unefa.edu.ve', login: 'mrodriguez', status: 'Inactivo', lastAccess: '2023-12-15' }
            ];
            
            usersTableBody.innerHTML = exampleUsers.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.login}</td>
                    <td>
                        <span class="user-status ${user.status === 'Activo' ? 'active' : 'inactive'}">
                            ${user.status}
                        </span>
                    </td>
                    <td>${user.lastAccess}</td>
                </tr>
            `).join('');
            
            // Agregar estilos para los estados de usuario
            const style = document.createElement('style');
            style.textContent = `
                .user-status {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    display: inline-block;
                }
                .user-status.active { background: #d4edda; color: #155724; }
                .user-status.inactive { background: #f8d7da; color: #721c24; }
            `;
            document.head.appendChild(style);
            
        }, 1000);
    }
}

// Cargar datos de reportes
async function loadReportsData() {
    // Inicializar gráficos con Chart.js
    setTimeout(() => {
        // Gráfico de proyectos por estado
        const projectsByStatusCtx = document.getElementById('projectsByStatusChart');
        if (projectsByStatusCtx) {
            new Chart(projectsByStatusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Activos', 'En progreso', 'Completados', 'En pausa'],
                    datasets: [{
                        data: [12, 5, 4, 3],
                        backgroundColor: [
                            '#27ae60',
                            '#f39c12',
                            '#3498db',
                            '#e74c3c'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
        
        // Gráfico de actividad por mes
        const activityByMonthCtx = document.getElementById('activityByMonthChart');
        if (activityByMonthCtx) {
            new Chart(activityByMonthCtx, {
                type: 'bar',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Actividad',
                        data: [12, 19, 15, 25, 22, 30],
                        backgroundColor: '#3498db'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }, 500);
}

// Cargar datos de configuración
async function loadSettingsData() {
    const adminListDiv = document.getElementById('admin-list');
    if (adminListDiv) {
        adminListDiv.innerHTML = `
            <div class="admin-item">
                <i class="fas fa-user-shield" style="margin-right: 10px;"></i>
                <span>Administrador Principal (admin@unefa.edu.ve)</span>
            </div>
            <div class="admin-item">
                <i class="fas fa-user-shield" style="margin-right: 10px;"></i>
                <span>Coordinador VIDI (coordinator@unefa.edu.ve)</span>
            </div>
        `;
    }
}