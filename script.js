document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatBody = document.getElementById('chat-body');
    const bgCanvas = document.getElementById('bg-canvas');
    const ctx = bgCanvas.getContext('2d');
    const particles = [];
    let theme = 'dark';
    let soundOn = true;
    const moreInfoBtn = document.getElementById('more-info-btn');
    const moreInfoSection = document.getElementById('more-info');

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

    // Eventos
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    document.getElementById('theme-btn').addEventListener('click', () => {
        document.body.classList.toggle('light');
        theme = document.body.classList.contains('light') ? 'light' : 'dark';
    });

    document.getElementById('sound-btn').addEventListener('click', () => {
        soundOn = !soundOn;
        document.getElementById('sound-btn').innerText = soundOn ? '🔊' : '🔇';
    });

    // Controle da seção "Ver mais" (atualizado)
    moreInfoBtn.addEventListener('click', () => {
        const isExpanded = moreInfoBtn.getAttribute('aria-expanded') === 'true';
        
        // Atualiza atributos ARIA
        moreInfoBtn.setAttribute('aria-expanded', !isExpanded);
        moreInfoSection.setAttribute('aria-hidden', isExpanded);
        
        // Animações
        moreInfoSection.classList.toggle('expanded');
        moreInfoBtn.classList.toggle('expanded');
        
        // Scroll suave apenas na expansão
        if (!isExpanded) {
            setTimeout(() => {
                moreInfoSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }, 50);
        }
    });

    // Envia mensagem
    function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        userInput.value = '';

        simulateTyping().then(() => {
            const response = getBotResponse(text);
            appendMessage(response, 'bot');
            if (soundOn) playSound();
        });
    }

    function appendMessage(text, sender) {
        const msg = document.createElement('div');
        msg.classList.add('message', sender);
        msg.innerText = text;
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function simulateTyping() {
        return new Promise(resolve => {
            const typing = document.createElement('div');
            typing.classList.add('message', 'bot');
            typing.innerText = 'Digitando...';
            chatBody.appendChild(typing);
            chatBody.scrollTop = chatBody.scrollHeight;

            const delay = 800 + Math.random() * 1200;
            setTimeout(() => {
                chatBody.removeChild(typing);
                resolve();
            }, delay);
        });
    }

    function getBotResponse(input) {
        const text = input.toLowerCase();
        const responses = {
            greetings: [
                'E aí, fera! Pronto pra falar sobre a FURIA?',
                'Olá, guerreiro da FURIA! Como posso ajudar?',
                'Fala, campeão! O que manda?'
            ],
            nextGame: [
                'A FURIA joga contra a NAVI amanhã às 18h! 🔥',
                'Próximo confronto: FURIA vs G2 dia 25/04 às 20h. Vai ser épico!'
            ],
            team: [
                'Escalação atual: KSCERATO, yuurih, chelo, FalleN e arT.',
                'Hoje o lineup é: KSCERATO, yuurih, chelo, FalleN e arT. 🔥'
            ],
            history: [
                'Na última partida, vencemos a Vitality por 2-0 com destaque pro KSCERATO!',
                'Historicamente, estamos 5-1 contra a BIG. Bora manter essa média!'
            ],
            quotes: [
                '“Furia never stops!” 💥',
                '“Pain is a proof of progress.” – FalleN'
            ],
            social: [
                'Segue a gente no Twitter: https://twitter.com/furia 🎮',
                'Nosso canal na Twitch: https://twitch.tv/furia',
                'Instagram com os bastidores: https://instagram.com/furia'
            ],
            cheer: [
                '#FURIASTRONG! Vamos juntos!',
                'Sinta a FURIA correr nas veias! 🔥'
            ],
            default: [
                'Desculpa, não entendi. Manda outra!',
                'Me explica melhor isso aí?',
                'To pronto pra responder, só preciso de mais detalhes 😉'
            ]
        };

        if (/\b(oi|olá|e aí|fala)\b/.test(text)) return random(responses.greetings);
        if (/\b(próxim[oa]? jogo|quando|horário|confronto)\b/.test(text)) return random(responses.nextGame);
        if (/\b(time|lineup|escalação|line-up)\b/.test(text)) return random(responses.team);
        if (/\b(última|histórico|resultado|placar)\b/.test(text)) return random(responses.history);
        if (/\b(frase|quote|diga|fala)\b/.test(text)) return random(responses.quotes);
        if (/\b(twitch|youtube|twitter|instagram|social)\b/.test(text)) return random(responses.social);
        if (/\b(motto|grito|cheer|vibra)\b/.test(text)) return random(responses.cheer);

        return random(responses.default);
    }

    function random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function playSound() {
        const audio = new Audio('https://www.myinstants.com/media/sounds/pop-up-kaito.mp3');
        audio.play();
    }
});