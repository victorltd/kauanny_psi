// Mudança de estado do Header no Scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.padding = '0.8rem 0';
        header.style.backgroundColor = '#ffffff';
    } else {
        header.style.padding = '1.2rem 0';
        header.style.backgroundColor = 'rgba(251, 249, 244, 0.98)';
    }
});

// Garante que o texto do botão de agendamento seja carregado corretamente
document.addEventListener('DOMContentLoaded', () => {
    const navBtn = document.querySelector('.btn-small');
    if (navBtn && navBtn.innerText.trim() === "") {
        navBtn.innerText = "Agendar Consulta";
    }
});