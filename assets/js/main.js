/* ============================================
   KAUANY ARAUJO - PSICÓLOGA
   Main JavaScript
   
   SUMÁRIO:
   1. Configurações e Constantes
   2. Utilitários
   3. Menu Mobile
   4. Header Scroll
   5. Smooth Scroll
   6. Active Nav Link
   7. FAQ Accordion
   8. Animações On-Scroll
   9. Ano Dinâmico no Footer
   10. Analytics Tracking
   11. Inicialização
   ============================================ */

'use strict';

/* ============================================
   1. CONFIGURAÇÕES E CONSTANTES
   ============================================ */
const CONFIG = {
    // Seletores
    selectors: {
        header: '.header',
        mobileBtn: '.header__mobile-btn',
        nav: '.header__nav',
        navLinks: '.header__nav-link',
        navList: '.header__nav-list',
        faqTriggers: '.faq-item__trigger',
        faqItems: '.faq-item',
        animateElements: '.animate-on-scroll',
        yearElement: '#current-year',
        whatsappLinks: 'a[href*="wa.me"]',
        ctaButtons: '.btn--primary, .btn--cta'
    },
    
    // Classes CSS
    classes: {
        headerScrolled: 'header--scrolled',
        menuOpen: 'is-open',
        bodyMenuOpen: 'menu-open',
        navLinkActive: 'active',
        visible: 'is-visible'
    },
    
    // Valores
    values: {
        headerScrollThreshold: 50,
        scrollOffset: 100,
        animationThreshold: 0.15
    }
};

/* ============================================
   2. UTILITÁRIOS
   ============================================ */
const Utils = {
    /**
     * Seleciona um elemento do DOM
     */
    $(selector, context = document) {
        return context.querySelector(selector);
    },
    
    /**
     * Seleciona múltiplos elementos do DOM
     */
    
$$
(selector, context = document) {
        return [...context.querySelectorAll(selector)];
    },
    
    /**
     * Adiciona evento com suporte a delegação
     */
    on(element, event, handler, options = false) {
        if (element) {
            element.addEventListener(event, handler, options);
        }
    },
    
    /**
     * Debounce para otimização de performance
     */
    debounce(func, wait = 10) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle para otimização de performance
     */
    throttle(func, limit = 100) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Verifica se é dispositivo móvel
     */
    isMobile() {
        return window.innerWidth <= 768;
    },
    
    /**
     * Verifica preferência de movimento reduzido
     */
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
};

/* ============================================
   3. MENU MOBILE
   ============================================ */
const MobileMenu = {
    isOpen: false,
    button: null,
    nav: null,
    focusableElements: [],
    firstFocusable: null,
    lastFocusable: null,
    
    init() {
        this.button = Utils.$(CONFIG.selectors.mobileBtn);
        this.nav = Utils.$(CONFIG.selectors.nav);
        
        if (!this.button || !this.nav) return;
        
        this.bindEvents();
    },
    
    bindEvents() {
        const self = this;
        // Toggle do menu
        Utils.on(this.button, 'click', () => this.toggle());
        
        // Fechar ao clicar em link
        Utils.
$$
(CONFIG.selectors.navLinks).forEach(link => {
            Utils.on(link, 'click', () => this.close());
        });
        
        // Fechar ao clicar no botão de agendar
        const ctaNav = Utils.$('.btn--nav');
        if (ctaNav) {
            Utils.on(ctaNav, 'click', () => this.close());
        }
        
        // Fechar ao clicar fora
        Utils.on(document, 'click', (e) => {
            if (this.isOpen && !this.nav.contains(e.target) && !this.button.contains(e.target)) {
                this.close();
            }
        });

        // Swipe para fechar menu mobile (captura em todo o documento para garantir resposta mesmo fora do menu)
        let touchStartX = null;
        let touchEndX = null;
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) touchStartX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) touchEndX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (!self.isOpen) {
                touchStartX = null;
                touchEndX = null;
                return;
            }

            if (touchStartX !== null && touchEndX !== null) {
                // swipe right -> fechar
                if (touchEndX - touchStartX > 60) {
                    self.close();
                }
                // swipe left -> opcional (mantém aberto)
            }

            touchStartX = null;
            touchEndX = null;
        });
        
        // Fechar com ESC
        Utils.on(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
                this.button.focus();
            }
        });
        
        // Trap focus dentro do menu
        Utils.on(this.nav, 'keydown', (e) => this.handleTabKey(e));
        
        // Fechar ao redimensionar para desktop
        Utils.on(window, 'resize', Utils.debounce(() => {
            if (!Utils.isMobile() && this.isOpen) {
                this.close();
            }
        }, 150));
    },
    
    toggle() {
        this.isOpen ? this.close() : this.open();
    },
    
    open() {
        this.isOpen = true;
        this.button.setAttribute('aria-expanded', 'true');
        this.button.setAttribute('aria-label', 'Fechar menu de navegação');
        this.nav.classList.add(CONFIG.classes.menuOpen);
        document.body.classList.add(CONFIG.classes.bodyMenuOpen);
        
        // Setup trap focus
        this.setupFocusTrap();
        
        // Focus no primeiro link
        setTimeout(() => {
            if (this.firstFocusable) {
                this.firstFocusable.focus();
            }
        }, 100);
    },
    
    close() {
        this.isOpen = false;
        this.button.setAttribute('aria-expanded', 'false');
        this.button.setAttribute('aria-label', 'Abrir menu de navegação');
        this.nav.classList.remove(CONFIG.classes.menuOpen);
        document.body.classList.remove(CONFIG.classes.bodyMenuOpen);
    },
    
    setupFocusTrap() {
        this.focusableElements = Utils.
$$
('a, button', this.nav).filter(el => {
            return el.offsetParent !== null; // Verifica se é visível
        });
        
        if (this.focusableElements.length > 0) {
            this.firstFocusable = this.focusableElements[0];
            this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
        }
    },
    
    handleTabKey(e) {
        if (e.key !== 'Tab' || !this.isOpen) return;
        
        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === this.firstFocusable) {
                e.preventDefault();
                this.lastFocusable.focus();
            }
        } else {
            // Tab
            if (document.activeElement === this.lastFocusable) {
                e.preventDefault();
                this.firstFocusable.focus();
            }
        }
    }
};

/* ============================================
   4. HEADER SCROLL
   ============================================ */
const HeaderScroll = {
    header: null,
    lastScrollY: 0,
    
    init() {
        this.header = Utils.$(CONFIG.selectors.header);
        if (!this.header) return;
        
        this.bindEvents();
        this.handleScroll(); // Verifica estado inicial
    },
    
    bindEvents() {
        Utils.on(window, 'scroll', Utils.throttle(() => this.handleScroll(), 50), { passive: true });
    },
    
    handleScroll() {
        const scrollY = window.scrollY;
        
        if (scrollY > CONFIG.values.headerScrollThreshold) {
            this.header.classList.add(CONFIG.classes.headerScrolled);
        } else {
            this.header.classList.remove(CONFIG.classes.headerScrolled);
        }
        
        this.lastScrollY = scrollY;
    }
};

/* ============================================
   5. SMOOTH SCROLL
   ============================================ */
const SmoothScroll = {
    init() {
        // Só aplica se o navegador não suportar scroll-behavior nativo
        // ou se preferir maior controle
        this.bindEvents();
    },
    
    bindEvents() {
        Utils.on(document, 'click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = Utils.$(targetId);
            if (!targetElement) return;
            
            e.preventDefault();
            this.scrollTo(targetElement);
        });
    },
    
    scrollTo(element) {
        const headerHeight = Utils.$(CONFIG.selectors.header)?.offsetHeight || 0;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerHeight - 20;
        
        // Usa scroll-behavior nativo se disponível e sem preferência de movimento reduzido
        if (!Utils.prefersReducedMotion()) {
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo(0, offsetPosition);
        }
        
        // Foca no elemento para acessibilidade
        element.setAttribute('tabindex', '-1');
        element.focus({ preventScroll: true });
    }
};

/* ============================================
   6. ACTIVE NAV LINK
   ============================================ */
const ActiveNavLink = {
    sections: [],
    navLinks: [],
    
    init() {
        this.navLinks = Utils.
$$
(CONFIG.selectors.navLinks);
        if (this.navLinks.length === 0) return;
        
        // Pega todas as seções que têm links correspondentes
        this.sections = this.navLinks
            .map(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    return Utils.$(href);
                }
                return null;
            })
            .filter(Boolean);
        
        this.bindEvents();
    },
    
    bindEvents() {
        Utils.on(window, 'scroll', Utils.throttle(() => this.handleScroll(), 100), { passive: true });
    },
    
    handleScroll() {
        const scrollY = window.scrollY;
        const headerHeight = Utils.$(CONFIG.selectors.header)?.offsetHeight || 0;
        
        let currentSection = '';
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                currentSection = section.getAttribute('id');
            }
        });
        
        this.navLinks.forEach(link => {
            link.classList.remove(CONFIG.classes.navLinkActive);
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add(CONFIG.classes.navLinkActive);
            }
        });
    }
};

/* ============================================
   7. FAQ ACCORDION
   ============================================ */
const FAQAccordion = {
    triggers: [],
    
    init() {
        this.triggers = Utils.
$$
(CONFIG.selectors.faqTriggers);
        if (this.triggers.length === 0) return;
        
        this.bindEvents();
    },
    
    bindEvents() {
        this.triggers.forEach(trigger => {
            Utils.on(trigger, 'click', () => this.toggle(trigger));
            
            // Suporte a teclado
            Utils.on(trigger, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle(trigger);
                }
            });
        });
    },
    
    toggle(trigger) {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        const contentId = trigger.getAttribute('aria-controls');
        const content = Utils.$(`#${contentId}`);
        
        if (!content) return;
        
        // Fecha todos os outros (comportamento accordion)
        this.closeAll(trigger);
        
        // Toggle do item clicado
        if (isExpanded) {
            this.close(trigger, content);
        } else {
            this.open(trigger, content);
        }
    },
    
    open(trigger, content) {
        trigger.setAttribute('aria-expanded', 'true');
        content.hidden = false;
        
        // Animação suave
        if (!Utils.prefersReducedMotion()) {
            content.style.maxHeight = '0';
            content.style.overflow = 'hidden';
            content.style.transition = 'max-height 0.3s ease';
            
            // Força reflow
            content.offsetHeight;
            
            content.style.maxHeight = content.scrollHeight + 'px';
            
            // Remove estilos inline após animação
            setTimeout(() => {
                content.style.maxHeight = '';
                content.style.overflow = '';
                content.style.transition = '';
            }, 300);
        }
    },
    
    close(trigger, content) {
        trigger.setAttribute('aria-expanded', 'false');
        
        if (!Utils.prefersReducedMotion()) {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.overflow = 'hidden';
            content.style.transition = 'max-height 0.3s ease';
            
            // Força reflow
            content.offsetHeight;
            
            content.style.maxHeight = '0';
            
            setTimeout(() => {
                content.hidden = true;
                content.style.maxHeight = '';
                content.style.overflow = '';
                content.style.transition = '';
            }, 300);
        } else {
            content.hidden = true;
        }
    },
    
    closeAll(exceptTrigger = null) {
        this.triggers.forEach(trigger => {
            if (trigger === exceptTrigger) return;
            
            const contentId = trigger.getAttribute('aria-controls');
            const content = Utils.$(`#${contentId}`);
            
            if (content && trigger.getAttribute('aria-expanded') === 'true') {
                this.close(trigger, content);
            }
        });
    }
};

/* ============================================
   8. ANIMAÇÕES ON-SCROLL
   ============================================ */
const ScrollAnimations = {
    observer: null,
    
    init() {
        // Verifica se IntersectionObserver é suportado
        if (!('IntersectionObserver' in window)) {
            // Fallback: mostra todos os elementos
            this.showAll();
            return;
        }
        
        // Respeita preferência de movimento reduzido
        if (Utils.prefersReducedMotion()) {
            this.showAll();
            return;
        }
        
        this.setupObserver();
        this.observeElements();
    },
    
    setupObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: CONFIG.values.animationThreshold
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(CONFIG.classes.visible);
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    },
    
    observeElements() {
        // Adiciona classe para elementos animáveis
        const sections = Utils.
$$
('section');
        sections.forEach(section => {
            // Anima section headers
            const header = Utils.$('.section-header', section);
            if (header) {
                header.classList.add('animate-on-scroll');
                this.observer.observe(header);
            }
            
            // Anima cards
            const cards = Utils.
$$
('.card, .formacao-card, .mito-card, .diferencial, .step, .faq-item', section);
            cards.forEach((card, index) => {
                card.classList.add('animate-on-scroll');
                card.style.transitionDelay = `${index * 100}ms`;
                this.observer.observe(card);
            });
        });
        
        // Anima hero content
        const heroContent = Utils.$('.hero__content');
        if (heroContent) {
            heroContent.classList.add('animate-on-scroll');
            this.observer.observe(heroContent);
        }
        
        const heroImage = Utils.$('.hero__image');
        if (heroImage) {
            heroImage.classList.add('animate-on-scroll');
            heroImage.style.transitionDelay = '200ms';
            this.observer.observe(heroImage);
        }
    },
    
    showAll() {
        Utils.
$$
('.animate-on-scroll').forEach(el => {
            el.classList.add(CONFIG.classes.visible);
        });
    }
};

/* ============================================
   9. ANO DINÂMICO NO FOOTER
   ============================================ */
const DynamicYear = {
    init() {
        const yearElement = Utils.$(CONFIG.selectors.yearElement);
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
};

/* ============================================
   10. ANALYTICS TRACKING
   ============================================ */
const Analytics = {
    init() {
        this.trackWhatsAppClicks();
        this.trackCTAClicks();
        this.trackSocialClicks();
    },
    
    /**
     * Envia evento para o Google Analytics (se disponível)
     */
    track(eventName, eventParams = {}) {
        // Google Analytics 4
        if (typeof gtag === 'function') {
            gtag('event', eventName, eventParams);
        }
        
        // Google Analytics Universal (legacy)
        if (typeof ga === 'function') {
            ga('send', 'event', eventParams.event_category || 'Engagement', eventName, eventParams.event_label);
        }
        
        // Console log para debug (remover em produção)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('📊 Analytics Event:', eventName, eventParams);
        }
    },
    
    trackWhatsAppClicks() {
        Utils.
$$
(CONFIG.selectors.whatsappLinks).forEach(link => {
            Utils.on(link, 'click', () => {
                this.track('whatsapp_click', {
                    event_category: 'Contact',
                    event_label: link.closest('section')?.id || 'unknown',
                    value: 1
                });
            });
        });
    },
    
    trackCTAClicks() {
        Utils.
$$
(CONFIG.selectors.ctaButtons).forEach(button => {
            Utils.on(button, 'click', () => {
                const section = button.closest('section');
                const buttonText = button.textContent.trim();
                
                this.track('cta_click', {
                    event_category: 'CTA',
                    event_label: `${section?.id || 'header'} - ${buttonText}`,
                    value: 1
                });
            });
        });
    },
    
    trackSocialClicks() {
        const instagramLinks = Utils.$$('a[href*="instagram.com"]');
        instagramLinks.forEach(link => {
            Utils.on(link, 'click', () => {
                this.track('social_click', {
                    event_category: 'Social',
                    event_label: 'Instagram',
                    value: 1
                });
            });
        });
    }
};

/* ============================================
   11. INICIALIZAÇÃO
   ============================================ */
const App = {
    init() {
        // Aguarda DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bootstrap());
        } else {
            this.bootstrap();
        }
    },
    
    bootstrap() {
        // Inicializa todos os módulos
        MobileMenu.init();
        HeaderScroll.init();
        SmoothScroll.init();
        ActiveNavLink.init();
        FAQAccordion.init();
        ScrollAnimations.init();
        DynamicYear.init();
        Analytics.init();
        
        // Log de inicialização (remover em produção)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('✅ Site Kauany Araujo - Todos os módulos inicializados');
        }
    }
};

// Inicia a aplicação
App.init();

/* ============================================
   EXPORTAÇÕES (caso use módulos ES6)
   ============================================ */
// export { App, MobileMenu, FAQAccordion, Analytics };