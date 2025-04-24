// js/chat.js

export function initChat({ sendBtn, userInput, chatBody, soundBtn }) {
    let soundOn = true;
    let conversationHistory = [];
    let typingTimeout = null;
    let isTyping = false;
    
    // Inicializar elementos obrigatórios
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    soundBtn.addEventListener('click', () => {
        soundOn = !soundOn;
        soundBtn.innerText = soundOn ? '🔊' : '🔇';
        // Salvar preferência no localStorage
        localStorage.setItem('furiaChat_soundOn', soundOn);
    });
    
    // Carregar configurações salvas
    function loadSavedSettings() {
        const savedSound = localStorage.getItem('furiaChat_soundOn');
        if (savedSound !== null) {
            soundOn = savedSound === 'true';
            soundBtn.innerText = soundOn ? '🔊' : '🔇';
        }
        
        // Carregar histórico de conversa (limitado a 20 mensagens)
        const savedHistory = localStorage.getItem('furiaChat_history');
        if (savedHistory) {
            try {
                const parsedHistory = JSON.parse(savedHistory);
                if (Array.isArray(parsedHistory)) {
                    conversationHistory = parsedHistory.slice(-20);
                    // Restaurar mensagens na tela
                    conversationHistory.forEach(msg => {
                        appendMessage(msg.text, msg.sender, false);
                    });
                    chatBody.scrollTop = chatBody.scrollHeight;
                }
            } catch (e) {
                console.error('Erro ao carregar histórico:', e);
                localStorage.removeItem('furiaChat_history');
            }
        }
        
        // Mostrar mensagem de boas-vindas se não houver histórico
        if (conversationHistory.length === 0) {
            setTimeout(() => {
                appendMessage('Olá! Sou o bot oficial da FURIA. Como posso ajudar você hoje? 🔥', 'bot');
            }, 500);
        }
    }
    
    // Carregar configurações no início
    loadSavedSettings();

    function sendMessage() {
        const text = userInput.value.trim();
        if (!text || isTyping) return;

        appendMessage(text, 'user');
        saveToHistory(text, 'user');
        userInput.value = '';

        // Habilitar análise de sentimento para respostas personalizadas
        const sentiment = analyzeSentiment(text);
        
        isTyping = true;
        simulateTyping().then(() => {
            isTyping = false;
            const response = getBotResponse(text, sentiment);
            appendMessage(response, 'bot');
            saveToHistory(response, 'bot');
            if (soundOn) playSound();
        });
    }

    function appendMessage(text, sender, animate = true) {
        const msg = document.createElement('div');
        msg.classList.add('message', sender);
        
        // Simplificado: sem ícone e sem timestamp
        msg.innerText = text;
        
        // Formatação de links (mantida para funcionalidade)
        msg.innerHTML = formatMessage(text);
        
        // Animação de entrada
        if (animate) {
            msg.style.opacity = '0';
            msg.style.transform = 'translateY(10px)';
        }
        
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Aplicar animação
        if (animate) {
            setTimeout(() => {
                msg.style.transition = 'all 0.3s ease';
                msg.style.opacity = '1';
                msg.style.transform = 'translateY(0)';
            }, 10);
        }
    }

    function formatMessage(text) {
        // Converter URLs em links clicáveis
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`);
        
        // Processar formatação básica (negrito, itálico)
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return text;
    }

    function simulateTyping() {
        return new Promise(resolve => {
            const typing = document.createElement('div');
            typing.classList.add('message', 'bot');
            typing.innerText = 'Digitando...';
            chatBody.appendChild(typing);
            chatBody.scrollTop = chatBody.scrollHeight;

            // Calcular tempo de digitação baseado no tamanho da resposta
            const responseLength = getEstimatedResponseLength();
            const delay = Math.min(3000, 600 + (responseLength * 20));
            
            typingTimeout = setTimeout(() => {
                chatBody.removeChild(typing);
                resolve();
            }, delay);
        });
    }
    
    function getEstimatedResponseLength() {
        // Simular o comprimento esperado da resposta
        return Math.floor(Math.random() * 100) + 50;
    }

    function getBotResponse(input, sentiment) {
        const text = input.toLowerCase();
        const responses = {
            greetings: [
                'E aí, fera! Pronto pra falar sobre a FURIA? 🔥',
                'Olá, guerreiro da FURIA! Como posso ajudar? 🎮',
                'Fala, campeão! O que manda? Estou aqui para ajudar com tudo sobre a FURIA!'
            ],
            nextGame: [
                'A FURIA joga contra a NAVI amanhã às 18h! 🔥 Vai ser um show de Counter-Strike!',
                'Próximo confronto: FURIA vs G2 dia 25/04 às 20h. Vai ser épico! Você vai assistir?',
                'Temos FURIA vs Liquid neste final de semana! Sábado, 15h, ao vivo na Twitch e Youtube!'
            ],
            team: [
                'Nossa escalação atual no CS: KSCERATO, yuurih, chelo, FalleN e arT. Um verdadeiro dream team! 💪',
                'Hoje o lineup é: KSCERATO, yuurih, chelo, FalleN e arT. 🔥 Qual é seu jogador favorito?',
                'Nossa line principal: KSCERATO, yuurih, chelo, FalleN e arT. Temos também equipes de LoL, Valorant e Free Fire!'
            ],
            history: [
                'Na última partida, vencemos a Vitality por 2-0 com destaque pro KSCERATO! Foi uma performance absurda com 30+ frags no segundo mapa.',
                'Historicamente, estamos 5-1 contra a BIG. Bora manter essa média! Nossa equipe tem evoluído muito nas táticas.',
                'Último campeonato: Top 4 no Major! KSCERATO foi eleito o 3º melhor jogador do evento. Estamos crescendo a cada dia!'
            ],
            quotes: [
                '"Furia never stops!" 💥 - Este é nosso lema todos os dias.',
                '"Pain is a proof of progress." – FalleN, nosso capitão lendário.',
                '"Não é sobre ganhar, é sobre nunca desistir." – arT, quando perguntado sobre a essência da FURIA.'
            ],
            social: [
                'Segue a gente no Twitter: https://twitter.com/furia 🎮 Postamos updates diários!',
                'Nosso canal na Twitch: https://twitch.tv/furia - Streams quase todos os dias com nossos jogadores!',
                'Instagram com os bastidores: https://instagram.com/furia - Conteúdo exclusivo e momentos especiais da equipe.'
            ],
            cheer: [
                '#FURIASTRONG! Vamos juntos! A torcida é nossa força. 💪',
                'Sinta a FURIA correr nas veias! 🔥 O rugido que ecoa pelo mundo.',
                'VAMOS FURIA! 🐯 Somos a maior organização da América Latina por um motivo!'
            ],
            valorant: [
                'Nossa equipe de Valorant está detonando! Últimos resultados: 3 vitórias consecutivas no VCT Americas!',
                'No Valorant, somos atuais campeões do VCT Americas Challengers. Próximo desafio: Masters Reykjavík!',
                'Quick (capitão), nozwerR, qck, Mazin e dgzin formam nossa line de Valorant. Verdadeiros monstros!'
            ],
            lol: [
                'No League of Legends, estamos em 3º lugar no CBLOL atual. Acreditamos que podemos chegar à final!',
                'Nossa equipe de LoL: Robo, Croc, Tinowns, Neo e RedBert. Eles estão com fome de vitória!',
                'Último split do CBLOL: Top 4! Estamos melhorando a cada temporada no cenário de League of Legends.'
            ],
            store: [
                'Nossa loja oficial: https://loja.furia.gg/ - Use o cupom "CHATBOT10" para 10% de desconto!',
                'Acabou de sair nossa coleção 2025! Camisetas, moletons e muito mais em https://loja.furia.gg/',
                'Quer representar a FURIA? Nova jersey disponível na loja: https://loja.furia.gg/jersey - Design exclusivo!'
            ],
            schedule: [
                'Esta semana temos: CS vs NAVI (terça, 18h), Valorant vs Loud (quarta, 19h), LoL vs Pain (sábado, 14h).',
                'Agenda completa em https://furia.gg/calendar - Não perca nenhum jogo!',
                'Próximas partidas: CS (terça e quinta), Valorant (quarta), LoL (sábado e domingo). Confira horários no site!'
            ],
            results: [
                'Resultados recentes: CS (vitória vs Vitality 2-0), Valorant (vitória vs NiP 2-1), LoL (derrota vs Loud 1-2).',
                'Último final de semana: 4 vitórias em 5 jogos! O rugido da FURIA está mais forte do que nunca!',
                'Ganhamos 3 das últimas 4 partidas de CS! A equipe está em ótima fase após mudanças táticas.'
            ],
            coaches: [
                'Nossos treinadores: guerri (CS), ddx (Valorant) e Maestro (LoL). Verdadeiros estrategistas!',
                'O staff técnico da FURIA é um dos melhores do mundo. Guerri está há mais de 5 anos liderando a evolução da equipe.',
                'Além dos head coaches, temos analistas, psicólogos e preparadores físicos. Estrutura completa!'
            ],
            help: [
                'Posso te ajudar com: próximos jogos, line-ups, resultados recentes, loja oficial, redes sociais, história da FURIA, e muito mais! Sobre o que quer saber?',
                'Estou aqui para responder sobre nossos times, jogadores, história, próximos jogos, loja e muito mais! O que quer descobrir sobre a FURIA?',
                'Como posso ajudar? Posso falar sobre escalações, partidas, bastidores, loja, redes sociais... É só pedir!'
            ],
            events: [
                'Próximo evento presencial: FURIA Fan Day em São Paulo (15/05) - Encontre seus jogadores favoritos!',
                'Em junho teremos bootcamp aberto ao público em nossa Gaming House. Inscrições pelo site em breve!',
                'FURIA Convention acontecerá em julho! Três dias de competições, meet & greet e muito mais!'
            ],
            international: [
                'Sim! A FURIA tem fãs em mais de 50 países! Nossa maior base fora do Brasil é nos EUA e Portugal.',
                'Nossa Gaming House principal fica no Brasil, mas temos instalações nos EUA para bootcamps internacionais.',
                'A FURIA é uma organização global! Competimos em torneios na América, Europa e Ásia regularmente.'
            ],
            positive: [
                'É por isso que fazemos tudo isso! Saber que temos fãs incríveis como você nos motiva todos os dias! 💯',
                'Sua energia positiva é o que nos move! Obrigado por fazer parte da família FURIA! ❤️',
                'Esse é o espírito! Juntos somos mais fortes. A FURIA é feita por cada um de vocês! 🔥'
            ],
            negative: [
                'Entendo sua frustração. Sempre buscamos melhorar! Poderia nos dizer mais sobre como podemos evoluir?',
                'Dias difíceis fazem parte, mas estamos sempre trabalhando para superar. Agradecemos sua sinceridade e apoio contínuo!',
                'Valorizamos seu feedback, mesmo nos momentos difíceis. É assim que crescemos juntos como uma comunidade!'
            ],
            default: [
                'Desculpa, não entendi. Manda outra pergunta! Posso falar sobre times, jogos, loja e mais.',
                'Me explica melhor isso aí? Quero te ajudar, mas preciso entender melhor sua pergunta.',
                'Tô pronto pra responder, só preciso de mais detalhes 😉 Pode reformular?'
            ]
        };

        // Verificar múltiplas categorias para responder de forma mais contextual
        let possibleResponses = [];
        
        if (/\b(oi|olá|e aí|fala|eae|salve|hey|hi)\b/.test(text)) 
            possibleResponses = [...possibleResponses, ...responses.greetings];
        
        if (/\b(próxim[oa]? jogo|quando|horário|confronto|joga|partida)\b/.test(text)) 
            possibleResponses = [...possibleResponses, ...responses.nextGame];
        
        if (/\b(time|lineup|escalação|line-up|jogador|elenco|formação|quem joga)\b/.test(text)) 
            possibleResponses = [...possibleResponses, ...responses.team];
        
        if (/\b(última|histórico|resultado|placar|como foi|ganharam|perderam)\b/.test(text)) 
            possibleResponses = [...possibleResponses, ...responses.history];
        
        if (/\b(frase|quote|diga|fala|slogan|mantra)\b/.test(text)) 
            possibleResponses = [...possibleResponses, ...responses.quotes];
        
        if (/\b(twitch|youtube|twitter|instagram|social|rede|seguir)\b/.test(text)) 
            possibleResponses = [...possibleResponses, ...responses.social];
        
        if (/\b(motto|grito|cheer|vibra|torcer|torcida)\b/.test(text)) 
            possibleResponses = [...possibleResponses, ...responses.cheer];
            
        if (/\b(valorant|val|vava)\b/.test(text))
            possibleResponses = [...possibleResponses, ...responses.valorant];
            
        if (/\b(lol|league|legends)\b/.test(text))
            possibleResponses = [...possibleResponses, ...responses.lol];
            
        if (/\b(loja|comprar|merchandise|camisa|jersey|produtos)\b/.test(text))
            possibleResponses = [...possibleResponses, ...responses.store];
            
        if (/\b(agenda|calendário|quando|schedule|programação)\b/.test(text))
            possibleResponses = [...possibleResponses, ...responses.schedule];
            
        if (/\b(resultado|ganhou|perdeu|placar|score|recente)\b/.test(text))
            possibleResponses = [...possibleResponses, ...responses.results];
            
        if (/\b(técnico|coach|treinador|comissão|staff)\b/.test(text))
            possibleResponses = [...possibleResponses, ...responses.coaches];
            
        if (/\b(ajuda|help|o que|pode|consegue|informação|falar sobre)\b/.test(text))
            possibleResponses = [...possibleResponses, ...responses.help];
            
        if (/\b(evento|presencial|conhecer|encontro|encontrar|meet|convention)\b/.test(text))
            possibleResponses = [...possibleResponses, ...responses.events];
            
        if (/\b(internacional|fora|exterior|brasil|país|países|global)\b/.test(text))
            possibleResponses = [...possibleResponses, ...responses.international];
            
        // Adicionar respostas baseadas em sentimento
        if (sentiment > 0.5) 
            possibleResponses = [...possibleResponses, ...responses.positive];
        else if (sentiment < -0.5)
            possibleResponses = [...possibleResponses, ...responses.negative];
        
        // Se nenhuma categoria específica foi identificada, use respostas padrão
        if (possibleResponses.length === 0) {
            possibleResponses = responses.default;
        }

        // Contexto de conversa - verificar mensagens anteriores para manter coerência
        if (conversationHistory.length >= 2) {
            const lastQuestion = conversationHistory[conversationHistory.length - 2].text.toLowerCase();
            const lastResponse = conversationHistory[conversationHistory.length - 1].text;
            
            // Se a pergunta atual for um follow-up da anterior
            if (/\b(sim|não|quem|qual|quando|onde|como|por que|e|mas)\b/.test(text) && text.length < 15) {
                if (/próxim[oa]? jogo/.test(lastQuestion)) {
                    return "Além desse jogo, também temos partidas importantes nas próximas semanas! Quer que eu te mostre o calendário completo?";
                }
                if (/time|lineup/.test(lastQuestion)) {
                    return "Nossa line-up tem sido muito consistente nos últimos meses. O FalleN trouxe muita experiência para o time desde que chegou. Quer saber mais sobre algum jogador específico?";
                }
            }
        }

        return random(possibleResponses);
    }
    
    function analyzeSentiment(text) {
        // Análise de sentimento básica
        const positiveWords = ['bom', 'ótimo', 'excelente', 'legal', 'incrível', 'top', 'melhor', 'amei', 'gosto', 'parabéns', 'vamo', 'vamos', 'vitória', 'ganhar'];
        const negativeWords = ['ruim', 'péssimo', 'horrível', 'fraco', 'pior', 'triste', 'decepção', 'perder', 'perdeu', 'chato', 'difícil', 'fácil', 'reclama'];
        
        let score = 0;
        const words = text.toLowerCase().split(/\s+/);
        
        for (const word of words) {
            if (positiveWords.some(pw => word.includes(pw))) score += 0.2;
            if (negativeWords.some(nw => word.includes(nw))) score -= 0.2;
        }
        
        // Ajustar com base em pontuação
        if (text.includes('!')) score += 0.1;
        if (text.includes('?')) score -= 0.05;
        if (text.includes('😡') || text.includes('👎')) score -= 0.3;
        if (text.includes('😍') || text.includes('👍') || text.includes('❤️')) score += 0.3;
        
        return Math.max(-1, Math.min(1, score)); // Limitar entre -1 e 1
    }

    function random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function playSound() {
        const sounds = [
            'https://www.myinstants.com/media/sounds/pop-up-kaito.mp3',
            '/sounds/notificaçao.mp3',
            '/sounds/notificaçao.mp3'
        ];
        const audio = new Audio(random(sounds));
        audio.volume = 0.5; // Volume moderado
        audio.play().catch(e => console.log('Erro ao reproduzir som:', e));
    }
    
    function saveToHistory(text, sender) {
        conversationHistory.push({ text, sender, timestamp: Date.now() });
        // Limitar histórico a 50 mensagens
        if (conversationHistory.length > 50) {
            conversationHistory = conversationHistory.slice(-50);
        }
        // Salvar no localStorage
        try {
            localStorage.setItem('furiaChat_history', JSON.stringify(conversationHistory));
        } catch (e) {
            console.error('Erro ao salvar histórico:', e);
        }
    }
}