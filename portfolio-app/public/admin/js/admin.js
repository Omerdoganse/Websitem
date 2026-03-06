const API_URL = '/api';
const AUTH_URL = '/auth';

document.addEventListener('DOMContentLoaded', () => {
    const isLoginPage = window.location.pathname.includes('login.html');
    const token = localStorage.getItem('adminToken');

    if (!isLoginPage && !token) {
        window.location.href = '/admin/login.html';
        return;
    }

    if (isLoginPage) {
        if (token) {
            window.location.href = '/admin/index.html';
            return;
        }
        setupLoginForm();
    } else {
        setupAdminDashboard();
    }
});

// --- Login Logic ---
function setupLoginForm() {
    const form = document.getElementById('login-form');
    const errorMsg = document.getElementById('error-msg');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const btn = form.querySelector('button');

        try {
            btn.textContent = 'Giriş Yapılıyor...';
            btn.disabled = true;

            const res = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('adminToken', data.token);
                window.location.href = '/admin/index.html';
            } else {
                errorMsg.textContent = data.error || 'Giriş başarısız.';
            }
        } catch (err) {
            errorMsg.textContent = 'Sunucuya bağlanılamadı.';
        } finally {
            btn.textContent = 'Giriş Yap';
            btn.disabled = false;
        }
    });
}

// --- Dashboard Logic ---
function setupAdminDashboard() {
    setupTabs();
    setupLogout();
    loadAllData();

    // Event Listeners for Forms
    document.getElementById('save-about-btn')?.addEventListener('click', saveAbout);
    document.getElementById('add-skill-form')?.addEventListener('submit', addSkill);
    document.getElementById('add-project-form')?.addEventListener('submit', addProject);
}

function setupTabs() {
    const navItems = document.querySelectorAll('.nav-menu li[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            item.classList.add('active');
            const tabId = item.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function setupLogout() {
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
    });
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('adminToken');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
        throw new Error('Unauthorized');
    }

    return response;
}

async function loadAllData() {
    loadAbout();
    loadSkills();
    loadProjects();
    loadMessages();
}

// -- Hakkımda --
async function loadAbout() {
    try {
        const res = await fetchWithAuth(`${API_URL}/hakkimda`);
        const data = await res.json();
        const input = document.getElementById('about-content-input');
        if (input && data) {
            input.value = data.content || '';
        }
    } catch (err) { console.error('About load error', err); }
}

async function saveAbout() {
    const content = document.getElementById('about-content-input').value;
    const btn = document.getElementById('save-about-btn');
    try {
        btn.textContent = 'Kaydediliyor...';
        await fetchWithAuth(`${API_URL}/hakkimda`, {
            method: 'PUT',
            body: JSON.stringify({ content })
        });
        alert('Hakkımda başarıyla güncellendi.');
    } catch (err) {
        alert('Hata oluştu');
    } finally {
        btn.textContent = 'Kaydet';
    }
}

// -- Yetenekler --
async function loadSkills() {
    try {
        const res = await fetchWithAuth(`${API_URL}/yetenekler`);
        const data = await res.json();
        const tbody = document.getElementById('skills-tbody');
        if (!tbody) return;

        tbody.innerHTML = data.map(skill => `
            <tr>
                <td><i class="${skill.icon}"></i></td>
                <td>${skill.name}</td>
                <td><button class="btn btn-danger" onclick="deleteSkill(${skill.id})">Sil</button></td>
            </tr>
        `).join('');
    } catch (err) { console.error('Skills load error', err); }
}

async function addSkill(e) {
    e.preventDefault();
    const name = document.getElementById('skill-name').value;
    const icon = document.getElementById('skill-icon').value;
    const btn = e.target.querySelector('button');

    try {
        btn.disabled = true;
        await fetchWithAuth(`${API_URL}/yetenekler`, {
            method: 'POST',
            body: JSON.stringify({ name, icon })
        });
        e.target.reset();
        loadSkills();
    } catch (err) { alert('Hata oluştu'); }
    finally { btn.disabled = false; }
}

window.deleteSkill = async function (id) {
    if (!confirm('Emin misiniz?')) return;
    try {
        await fetchWithAuth(`${API_URL}/yetenekler/${id}`, { method: 'DELETE' });
        loadSkills();
    } catch (err) { alert('Hata oluştu'); }
}

// -- Projeler --
async function loadProjects() {
    try {
        const res = await fetchWithAuth(`${API_URL}/projeler`);
        const data = await res.json();
        const tbody = document.getElementById('projects-tbody');
        if (!tbody) return;

        tbody.innerHTML = data.map(project => `
            <tr>
                <td>${project.title}</td>
                <td><a href="${project.link}" target="_blank">Link</a></td>
                <td><button class="btn btn-danger" onclick="deleteProject(${project.id})">Sil</button></td>
            </tr>
        `).join('');
    } catch (err) { console.error('Projects load error', err); }
}

async function addProject(e) {
    e.preventDefault();
    const title = document.getElementById('project-title').value;
    const image_url = document.getElementById('project-image').value;
    const link = document.getElementById('project-link').value;
    const description = document.getElementById('project-desc').value;
    const btn = e.target.querySelector('button');

    try {
        btn.disabled = true;
        await fetchWithAuth(`${API_URL}/projeler`, {
            method: 'POST',
            body: JSON.stringify({ title, description, image_url, link })
        });
        e.target.reset();
        loadProjects();
    } catch (err) { alert('Hata oluştu'); }
    finally { btn.disabled = false; }
}

window.deleteProject = async function (id) {
    if (!confirm('Emin misiniz?')) return;
    try {
        await fetchWithAuth(`${API_URL}/projeler/${id}`, { method: 'DELETE' });
        loadProjects();
    } catch (err) { alert('Hata oluştu'); }
}

// -- Mesajlar --
async function loadMessages() {
    try {
        const res = await fetchWithAuth(`${API_URL}/mesajlar`);
        const data = await res.json();
        const tbody = document.getElementById('messages-tbody');
        if (!tbody) return;

        tbody.innerHTML = data.map(msg => `
            <tr>
                <td>${new Date(msg.created_at).toLocaleString('tr-TR')}</td>
                <td>${msg.name}</td>
                <td>${msg.email}</td>
                <td>${msg.message.substring(0, 50)}...</td>
                <td><button class="btn btn-danger" onclick="deleteMessage(${msg.id})">Sil</button></td>
            </tr>
        `).join('');
    } catch (err) { console.error('Messages load error', err); }
}

window.deleteMessage = async function (id) {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    try {
        await fetchWithAuth(`${API_URL}/mesajlar/${id}`, { method: 'DELETE' });
        loadMessages();
    } catch (err) { alert('Hata oluştu'); }
}
