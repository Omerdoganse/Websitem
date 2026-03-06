document.addEventListener('DOMContentLoaded', () => {
    fetchPortfolioData();
    setupContactForm();
});

async function fetchPortfolioData() {
    try {
        const response = await fetch('/api/portfolio-data');
        const data = await response.json();

        // 1. Hakkımda
        const aboutText = document.getElementById('about-text');
        if (aboutText && data.about) {
            aboutText.innerHTML = data.about.replace(/\n/g, '<br>');
        }

        // 2. Yetenekler
        const skillsGrid = document.getElementById('skills-grid');
        if (skillsGrid && data.skills) {
            skillsGrid.innerHTML = data.skills.map(skill => `
                <div class="skill-badge">
                    <div class="skill-icon">
                        <i class="${skill.icon || 'fas fa-code'}"></i>
                    </div>
                    <h4>${skill.name}</h4>
                </div>
            `).join('');
        }

        // 3. Projeler
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid && data.projects) {
            projectsGrid.innerHTML = data.projects.map(project => `
                <div class="project-card">
                    <img src="${project.image_url || 'https://via.placeholder.com/400x200?text=Proje+Görseli'}" alt="${project.title}" class="project-image">
                    <div class="project-info">
                        <h3 class="project-title">${project.title}</h3>
                        <p class="project-desc">${project.description}</p>
                        <a href="${project.link}" target="_blank" class="project-link">Projeyi İncele <i class="fas fa-external-link-alt"></i></a>
                    </div>
                </div>
            `).join('');
        }

    } catch (err) {
        console.error("Veri çekme hatası:", err);
    }
}

function setupContactForm() {
    const form = document.getElementById('contact-form');
    const statusText = document.getElementById('form-status');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const submitData = Object.fromEntries(formData.entries());
        const btn = form.querySelector('.btn-submit');

        try {
            btn.textContent = 'Gönderiliyor...';
            btn.disabled = true;

            const response = await fetch('/api/mesajlar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            const result = await response.json();

            if (response.ok) {
                statusText.textContent = "Mesajınız başarıyla gönderildi!";
                statusText.style.color = "var(--accent-green)";
                form.reset();
            } else {
                statusText.textContent = "Hata: " + (result.error || "Gönderilemedi.");
                statusText.style.color = "red";
            }

        } catch (err) {
            statusText.textContent = "Bağlantı hatası.";
            statusText.style.color = "red";
        } finally {
            btn.textContent = 'Gönder';
            btn.disabled = false;

            setTimeout(() => {
                statusText.textContent = "";
            }, 5000);
        }
    });
}
