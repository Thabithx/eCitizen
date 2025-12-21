

document.addEventListener("DOMContentLoaded", function () {
    const sidebarHtml = `
    <nav id="sidebar">
        <div class="sidebar-header">
            <h3><i class="fas fa-shield-alt"></i> eCitizen</h3>
        </div>
        <ul class="sidebar-menu">
            <li>
                <a href="dashboard.html" class="${isActive('dashboard.html')}">
                    <i class="fas fa-chart-line"></i> Dashboard
                </a>
            </li>
            <li>
                <a href="users.html" class="${isActive('users.html')}">
                    <i class="fas fa-user-friends"></i> Users
                </a>
            </li>
            <li>
                <a href="citizen_management.html" class="${isActive('citizen_management.html')}">
                    <i class="fas fa-id-card"></i> Applications
                </a>
            </li>
            <li>
                <a href="support.html" class="${isActive('support.html')}">
                    <i class="fas fa-headset"></i> Support
                </a>
            </li>
            <li style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                <a href="add_citizen.html" class="${isActive('add_citizen.html')}">
                    <i class="fas fa-user-plus"></i> Add Citizen
                </a>
            </li>
            <li>
                <a href="admin_signup.html" class="${isActive('admin_signup.html')}">
                    <i class="fas fa-user-shield"></i> Add Admin
                </a>
            </li>
            <li style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                 <a href="#" onclick="logout(event)" style="color: #e74c3c;">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </li>
        </ul>
    </nav>
    <div class="overlay" onclick="toggleSidebar()"></div>
    `;

    const body = document.body;

    // Wrap content if not already wrapped 
    if (!document.querySelector('.admin-wrapper')) {
        const content = document.body.innerHTML;
        document.body.innerHTML = `<div class="admin-wrapper"><div id="content">${content}</div></div>`;
        document.querySelector('.admin-wrapper').insertAdjacentHTML('afterbegin', sidebarHtml);
    } else {
        document.querySelector('.admin-wrapper').insertAdjacentHTML('afterbegin', sidebarHtml);
    }

    // Inject Top Navbar if header is missing 
    const contentDiv = document.getElementById('content');
    const existingHeader = document.getElementById('header');
    if (existingHeader) existingHeader.style.display = 'none'; 

    const topNavbarHtml = `
    <nav class="top-navbar">
        <div class="d-flex align-items-center">
             <i class="fas fa-bars menu-toggle" onclick="toggleSidebar()"></i>
        </div>
        <div class="user-profile">
            <div class="user-info">
                <span class="user-name" id="topBarName">Admin</span>
                <span class="user-role">Administrator</span>
            </div>
            <div class="avatar-circle">A</div>
        </div>
    </nav>
    `;

    contentDiv.insertAdjacentHTML('afterbegin', topNavbarHtml);

    // Set user name
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName) {
        document.getElementById('topBarName').textContent = user.fullName;
        document.querySelector('.avatar-circle').textContent = user.fullName.charAt(0).toUpperCase();
    }
});

function isActive(page) {
    return window.location.pathname.includes(page) ? 'active' : '';
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.querySelector('.overlay').classList.toggle('active');
}

function logout(e) {
    if (e) e.preventDefault();
    if (confirm('Logout?')) {
        localStorage.clear();
        window.location.href = '../../pages/login.html';
    }
}
