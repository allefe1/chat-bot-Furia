import { initChat } from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatBody = document.getElementById('chat-body');
    const bgCanvas = document.getElementById('bg-canvas');
    const ctx = bgCanvas.getContext('2d');
    const particles = [];
    let theme = 'dark';
    const moreInfoBtn = document.getElementById('more-info-btn');
    const moreInfoSection = document.getElementById('more-info');
    const soundBtn = document.getElementById('sound-btn');

    // Inicializa o chat
    initChat({ sendBtn, userInput, chatBody, soundBtn });

    // Ajusta o tamanho do canvas
    function resizeCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Geração de partículas
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            radius: Math.random() * 2 + 1,
            dx: (Math.random() - 0.5) * 1.5,
            dy: (Math.random() - 0.5) * 1.5
        });
    }

    function animateParticles() {
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.dx;
            p.y += p.dy;

            if (p.x < 0 || p.x > bgCanvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > bgCanvas.height) p.dy *= -1;
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Botões de tema
    document.getElementById('theme-btn').addEventListener('click', () => {
        document.body.classList.toggle('light');
        theme = document.body.classList.contains('light') ? 'light' : 'dark';
    });

    // Botão ver mais - com nova lógica para a seção separada
    moreInfoBtn.addEventListener('click', () => {
        const isExpanded = moreInfoBtn.getAttribute('aria-expanded') === 'true';
        
        // Atualiza atributos ARIA
        moreInfoBtn.setAttribute('aria-expanded', !isExpanded);
        moreInfoSection.setAttribute('aria-hidden', isExpanded);
        
        // Alterna classes para a expansão visual
        moreInfoSection.classList.toggle('expanded');
        moreInfoBtn.classList.toggle('expanded');
        
        // Atualiza o texto do botão
        const arrowSpan = moreInfoBtn.querySelector('.arrow-down');
        if (!isExpanded) {
            moreInfoBtn.textContent = 'Ocultar detalhes ';
            moreInfoBtn.appendChild(arrowSpan);
            arrowSpan.style.transform = 'rotate(180deg)';
            
            // Rola para a seção expandida após um pequeno delay
            setTimeout(() => {
                moreInfoSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 300);
        } else {
            moreInfoBtn.textContent = 'Ver mais sobre a FURIA ';
            moreInfoBtn.appendChild(arrowSpan);
            arrowSpan.style.transform = 'rotate(0deg)';
        }
    });
});