document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const mainPage = document.getElementById('mainPage');
    const cpfPage = document.getElementById('cpfPage');
    const btnAtivar = document.getElementById('btnAtivar');
    const btnVoltar = document.getElementById('btnVoltar');
    const btnAnalisar = document.getElementById('btnAnalisar');
    const btnSimular = document.getElementById('btnSimular');

    // Elementos de formulário
    const cpfInputPage = document.getElementById('cpfInputPage');
    const termsCheck = document.getElementById('termsCheck');
    
    // Elementos de resultado da consulta
    const consultaResultado = document.getElementById('consultaResultado');
    const loadingInfo = document.getElementById('loadingInfo');
    const userInfo = document.getElementById('userInfo');
    const errorInfo = document.getElementById('errorInfo');
    const errorMessage = document.getElementById('errorMessage');
    const btnConfirmar = document.getElementById('btnConfirmar');
    const btnCorrigir = document.getElementById('btnCorrigir');
    const btnTentarNovamente = document.getElementById('btnTentarNovamente');
    
    // Campos de informação do usuário
    const nomeUsuario = document.getElementById('nomeUsuario');
    const dataNascimento = document.getElementById('dataNascimento');
    const cpfUsuario = document.getElementById('cpfUsuario');
    const sexoUsuario = document.getElementById('sexoUsuario');
    const nomeMae = document.getElementById('nomeMae');
    
    // --- Funções para manipulação de URL e UTMs ---

    /**
     * Obtém todos os parâmetros UTM e outros parâmetros de rastreamento (xcod, sck, subid) da URL atual.
     * @returns {string} Uma string de query com os parâmetros (ex: "?utm_source=google&xcod=abc") ou vazia.
     */
    function getTrackingParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        let trackingParams = [];
        
        // Inclui UTMs e outros parâmetros específicos de rastreamento
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'xcod', 'sck', 'subid'].forEach(param => {
            if (urlParams.has(param)) {
                trackingParams.push(`${encodeURIComponent(param)}=${encodeURIComponent(urlParams.get(param))}`);
            }
        });
        
        return trackingParams.length > 0 ? '?' + trackingParams.join('&') : '';
    }

    // Armazenar os parâmetros de rastreamento uma única vez na inicialização
    const currentTrackingParams = getTrackingParameters();

    /**
     * Navega para uma URL específica, anexando os parâmetros de rastreamento.
     * @param {string} baseUrl A URL base para a qual navegar.
     */
    function navigateWithTrackingParams(baseUrl) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        // Redireciona para a nova URL com os parâmetros
        window.location.href = baseUrl + (currentTrackingParams ? separator + currentTrackingParams.substring(1) : '');
    }

    // --- Fim das Funções para manipulação de URL e UTMs ---
    
    // Formatar CPF enquanto digita
    function formatCPF(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 9) {
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/^(\d{3})(\d{1,3})$/, '$1.$2');
        }
        
        input.value = value;
    }
    
    // Validar CPF
    function validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        return cpf.length === 11;
    }
    
    // Formatação de data (YYYYMMDD para DD/MM/YYYY ou deixa como está se já estiver formatada)
    function formatDate(dateString) {
        if (!dateString) return 'Não informado';
        
        // Verifica se a data já está no formato DD/MM/YYYY
        if (dateString.includes('/')) {
            return dateString;
        }
        
        // Converte do formato YYYYMMDD para DD/MM/YYYY
        if (dateString.length === 8) {
            return dateString.replace(/^(\d{4})(\d{2})(\d{2})$/, '$3/$2/$1');
        }
        
        return dateString;
    }
    
    // Consultar CPF na API
    function consultarCPF(cpf) {
        // Mostrar resultados e estado de carregamento
        consultaResultado.classList.remove('hidden');
        loadingInfo.classList.remove('hidden');
        userInfo.classList.add('hidden');
        errorInfo.classList.add('hidden');
        
        // Rolar para baixo para mostrar o carregamento
        consultaResultado.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Executar a consulta
        fetch(`https://magmadatahub.com/api.php?token=98f4c3156730c11c3361837d4193da99a00174ee8f8cc4e19e1363ef17e73efd&cpf=${cpf}`)
            .then(response => {
                if (!response.ok) throw new Error(`Erro na consulta: ${response.status}`);
                return response.json();
            })
            .then(data => {
                // Ocultar loading
                loadingInfo.classList.add('hidden');
                
                // Processar os dados
                if (data) {
                    const usuario = data;
                    
                    // Preencher os campos com os dados do usuário
                    nomeUsuario.textContent = usuario.nome || 'Não informado';
                    dataNascimento.textContent = formatDate(usuario.nascimento) || 'Não informado';
                    cpfUsuario.textContent = usuario.cpf ? usuario.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : 'Não informado';
                    sexoUsuario.textContent = usuario.sexo || 'Não informado';
                    nomeMae.textContent = usuario.nome_mae || 'Não informado';
                    
                    // Salvar dados no objeto para usar depois
                    const dadosUsuario = {
                        nome: usuario.nome,
                        dataNascimento: usuario.nascimento,
                        nomeMae: usuario.nome_mae,
                        cpf: usuario.cpf,
                        sexo: usuario.sexo,
                    };
                    
                    // Salvar no localStorage para uso posterior
                    localStorage.setItem('dadosUsuario', JSON.stringify(dadosUsuario));
                    
                    // Salvar nome e CPF separadamente para acesso fácil
                    if (usuario.nome) {
                        localStorage.setItem('nomeUsuario', usuario.nome);
                    }
                    if (usuario.cpf) {
                        localStorage.setItem('cpfUsuario', usuario.cpf);
                    }
                    
                    // Mostrar informações do usuário
                    userInfo.classList.remove('hidden');
                    
                    // Rolar para mostrar as informações
                    setTimeout(() => {
                        userInfo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                } else {
                    // Mostrar erro
                    errorMessage.textContent = 'Não foi possível obter os dados para este CPF.';
                    errorInfo.classList.remove('hidden');
                    
                    // Rolar para mostrar o erro
                    errorInfo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            })
            .catch(error => {
                // Ocultar loading e mostrar erro
                loadingInfo.classList.add('hidden');
                errorMessage.textContent = error.message || 'Ocorreu um erro ao consultar seus dados.';
                errorInfo.classList.remove('hidden');
                console.error('Erro na consulta:', error);
                
                // Rolar para mostrar o erro
                errorInfo.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
    }
    
    // Verificar se existe CPF na URL e salvar no localStorage
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('cpf')) {
        const cpfFromUrl = urlParams.get('cpf').replace(/\D/g, '');
        if (validateCPF(cpfFromUrl)) {
            localStorage.setItem('cpf', cpfFromUrl);
            console.log('CPF da URL salvo no localStorage:', cpfFromUrl);
        }
    }
    
    // Mostrar página de CPF
    function showCPFPage() {
        // Adiciona classe para fade-out da página principal
        mainPage.classList.add('fade-out');
        
        // Após a animação, esconde a página principal e mostra a página de CPF
        setTimeout(() => {
            mainPage.classList.add('hidden');
            cpfPage.classList.remove('hidden');
            
            // Trigger reflow para iniciar nova animação
            void cpfPage.offsetWidth;
            
            // Fade-in da página CPF
            cpfPage.classList.add('fade-in');
            cpfPage.classList.remove('opacity-0');
            
            // Focar no input de CPF
            cpfInputPage.focus();
        }, 400);
    }
    
    // Voltar para a página principal
    function showMainPage() {
        // Adiciona classe para fade-out da página de CPF
        cpfPage.classList.remove('fade-in');
        cpfPage.classList.add('opacity-0');
        
        // Após a animação, esconde a página de CPF e mostra a página principal
        setTimeout(() => {
            cpfPage.classList.add('hidden');
            mainPage.classList.remove('hidden');
            
            // Trigger reflow para iniciar nova animação
            void mainPage.offsetWidth;
            
            // Fade-in da página principal
            mainPage.classList.remove('fade-out');
        }, 400);
    }
    
    // Processar o formulário de CPF
    function processForm() {
        const cpf = cpfInputPage.value.replace(/\D/g, '');
        
        if (!validateCPF(cpf)) {
            alert('Por favor, digite um CPF válido (11 dígitos).');
            return;
        }
        
        if (!termsCheck.checked) {
            alert('Você precisa concordar com os Termos de Uso e Política de Privacidade para continuar.');
            return;
        }
        
        // Salvar o CPF no localStorage para uso posterior
        localStorage.setItem('cpf', cpf);
        console.log('CPF salvo no localStorage:', cpf);
        
        // Consultar CPF na API em vez de redirecionar imediatamente
        consultarCPF(cpf);
    }
    
    // Redirecionar para o chat após confirmar os dados
    function redirecionarParaChat() {
        // Verificar se temos os dados da API
        const dadosUsuarioJSON = localStorage.getItem('dadosUsuario');
        if (!dadosUsuarioJSON) {
            alert('Dados do usuário não encontrados. Por favor, tente novamente.');
            return;
        }
        
        try {
            const dadosUsuario = JSON.parse(dadosUsuarioJSON);
            if (!dadosUsuario.cpf) {
                alert('CPF não encontrado. Por favor, tente novamente.');
                return;
            }
            
            // Obter CPF formatado apenas com números
            const cpf = dadosUsuario.cpf.replace(/\D/g, '');
            
            // Obter todos os parâmetros da URL atual, incluindo os de rastreamento
            const urlAtualParams = new URLSearchParams(window.location.search);
            
            // Criar um novo objeto URLSearchParams para a nova URL
            const novaUrlParams = new URLSearchParams();
            
            // Adicionar todos os parâmetros da URL atual à nova URL
            for (const [chave, valor] of urlAtualParams.entries()) {
                novaUrlParams.append(chave, valor);
            }
            
            // Adicionar ou atualizar o parâmetro CPF
            novaUrlParams.set('cpf', cpf);
            
            // Redirecionar para a página chat.html com todos os parâmetros
            // Assumindo que 'chat.html' é a próxima página de destino após a confirmação
            window.location.href = `chat.html?${novaUrlParams.toString()}`;
            
        } catch (error) {
            console.error('Erro ao processar dados para redirecionamento:', error);
            alert('Ocorreu um erro ao processar seus dados. Por favor, tente novamente.');
        }
    }
    
    // Limpar informações e voltar para digitar CPF
    function corrigirDados() {
        consultaResultado.classList.add('hidden');
        cpfInputPage.focus();
    }
    
    // Tentar novamente após erro
    function tentarNovamente() {
        consultaResultado.classList.add('hidden');
        cpfInputPage.focus();
    }
    
    // --- Event Listeners ---

    // Redirecionar para a URL de destino com parâmetros de rastreamento
    btnAtivar.addEventListener('click', function () {
        // ALTERE A URL ABAIXO PARA A PÁGINA DE DESTINO DESEJADA
        const urlDestino = '/2'; // Substitua '/2' pela URL desejada
        navigateWithTrackingParams(urlDestino);
    });

    // Redirecionar para '/2' com parâmetros de rastreamento
    btnSimular.addEventListener('click', function() {
        navigateWithTrackingParams('/2'); // Ajuste conforme a URL final do simulador
    });
    
    // btnVoltar volta para a página principal (não redireciona, apenas mostra/esconde divs)
    btnVoltar.addEventListener('click', showMainPage);
    
    btnAnalisar.addEventListener('click', function() {
        console.log('Botão Analisar clicado');
        console.log('Valor do CPF antes do processamento:', cpfInputPage.value);
        processForm();
    });
    
    // Listeners para os botões de confirmação/correção
    if (btnConfirmar) {
        // Assume que btnConfirmar leva para chat.html (ou a próxima página do funil)
        btnConfirmar.addEventListener('click', redirecionarParaChat); 
    }
    
    if (btnCorrigir) {
        btnCorrigir.addEventListener('click', corrigirDados);
    }
    
    if (btnTentarNovamente) {
        btnTentarNovamente.addEventListener('click', tentarNovamente);
    }
    
    // Formatação de CPF enquanto digita
    cpfInputPage.addEventListener('input', function() {
        formatCPF(this);
        console.log('CPF formatado durante digitação:', this.value);
    });
    
    // Carrossel Functionality
    const carousel = document.getElementById('carousel');
    const slides = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    const stepNumbers = document.querySelectorAll('.step-number');
    const stepLines = document.querySelectorAll('.step-line');
    
    let currentSlide = 0;
    let autoSlideInterval;
    
    // Função para mostrar um slide específico
    function showSlide(index) {
        // Loop infinito
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }
        
        // Ocultar todos os slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Mostrar slide atual
        slides[index].classList.add('active');
        
        // Atualizar indicadores
        indicators.forEach((indicator, i) => {
            if (i === index) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        // Atualizar etapas
        updateSteps(index);
        
        currentSlide = index;
    }
    
    // Atualizar os passos
    function updateSteps(index) {
        stepNumbers.forEach((step, i) => {
            step.classList.remove('active', 'completed');
            
            if (i === index) {
                step.classList.add('active');
            } else if (i < index) {
                step.classList.add('completed');
            }
        });
        
        stepLines.forEach((line, i) => {
            if (i < index) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });
    }
    
    // Navegar para o próximo slide
    function nextSlide() {
        showSlide(currentSlide + 1);
        resetAutoSlide();
    }
    
    // Navegar para o slide anterior
    function prevSlide() {
        showSlide(currentSlide - 1);
        resetAutoSlide();
    }
    
    // Iniciar rotação automática
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000);
    }
    
    // Resetar rotação automática
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
    
    // Event listeners para o carrossel
    if (prevBtn && nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showSlide(index);
                resetAutoSlide();
            });
        });
        
        stepNumbers.forEach((step) => {
            step.addEventListener('click', () => {
                const stepIndex = parseInt(step.getAttribute('data-step'));
                showSlide(stepIndex);
                resetAutoSlide();
            });
        });
        
        // Touch swipe para dispositivos móveis
        let touchStartX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            
            if (diff > 50) {
                // Swipe right
                prevSlide();
            } else if (diff < -50) {
                // Swipe left
                nextSlide();
            }
        }, { passive: true });
        
        // Pausar autoplay quando mouse está sobre o carrossel
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
        
        carousel.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
        
        // Iniciar o carrossel
        showSlide(0);
        startAutoSlide();
    }
});