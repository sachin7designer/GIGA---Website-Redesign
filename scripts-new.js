/**
 * GIGA Professional Website - JavaScript Functionality
 * Enhanced with modern ES6+ features and accessibility
 */

// Utility Functions
const utils = {
    // Debounce function for performance optimization
    debounce: (func, wait) => {
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

    // Throttle function for scroll events
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Smooth scroll to element
    smoothScrollTo: (element, offset = 0) => {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    // Get header height for scroll offset
    getHeaderHeight: () => {
        const header = document.querySelector('.site-header');
        return header ? header.offsetHeight : 0;
    }
};

// Mobile Navigation Handler
class MobileNavigation {
    constructor() {
        this.toggle = document.querySelector('.mobile-menu-toggle');
        this.nav = document.querySelector('.mobile-nav');
        this.links = document.querySelectorAll('.mobile-nav-link');
        this.isOpen = false;
        
        this.init();
    }

    init() {
        if (!this.toggle || !this.nav) return;

        // Toggle button event
        this.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
        });

        // Close menu when clicking links
        this.links.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.nav.contains(e.target) && !this.toggle.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
                this.toggle.focus();
            }
        });

        // Handle window resize
        window.addEventListener('resize', utils.debounce(() => {
            if (window.innerWidth > 1024 && this.isOpen) {
                this.closeMenu();
            }
        }, 250));
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isOpen = true;
        this.nav.setAttribute('aria-hidden', 'false');
        this.toggle.setAttribute('aria-expanded', 'true');
        this.toggle.classList.add('active');
        
        // Focus first link for accessibility
        const firstLink = this.nav.querySelector('.mobile-nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.isOpen = false;
        this.nav.setAttribute('aria-hidden', 'true');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Smooth Scrolling for Navigation Links
class SmoothScrolling {
    constructor() {
        this.init();
    }

    init() {
        // Handle all navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerHeight = utils.getHeaderHeight();
                    utils.smoothScrollTo(target, headerHeight + 20);
                    
                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            });
        });
    }
}

// Lazy Loading for Images and Videos
class LazyLoading {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        this.videos = document.querySelectorAll('iframe[loading="lazy"]');
        this.init();
    }

    init() {
        // Use Intersection Observer if available
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback for older browsers
            this.loadAllMedia();
        }
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadMedia(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observe all lazy-loaded media
        [...this.images, ...this.videos].forEach(media => {
            observer.observe(media);
        });
    }

    loadMedia(element) {
        if (element.tagName === 'IMG') {
            element.src = element.dataset.src || element.src;
        } else if (element.tagName === 'IFRAME') {
            element.src = element.dataset.src || element.src;
        }
        
        element.classList.add('loaded');
    }

    loadAllMedia() {
        [...this.images, ...this.videos].forEach(media => {
            this.loadMedia(media);
        });
    }
}

// Scroll-triggered Animations
class ScrollAnimations {
    constructor() {
        this.animatedElements = document.querySelectorAll('.stat-item, .impact-story, .country-story, .voice-item');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        }
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '-10%',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.animatedElements.forEach(element => {
            element.classList.add('animate-ready');
            observer.observe(element);
        });
    }
}

// Video Modal Handler
class VideoModal {
    constructor() {
        this.videoLinks = document.querySelectorAll('[data-video-modal]');
        this.modal = null;
        this.init();
    }

    init() {
        this.videoLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const videoUrl = link.getAttribute('data-video-modal');
                this.openModal(videoUrl);
            });
        });
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-overlay">
                <div class="video-modal-content">
                    <button class="video-modal-close" aria-label="Close video">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div class="video-modal-player"></div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .video-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .video-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            }
            .video-modal-content {
                position: relative;
                width: 100%;
                max-width: 900px;
                aspect-ratio: 16/9;
            }
            .video-modal-close {
                position: absolute;
                top: -3rem;
                right: 0;
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0.5rem;
                z-index: 1001;
            }
            .video-modal-player {
                width: 100%;
                height: 100%;
            }
            .video-modal-player iframe {
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 8px;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        return modal;
    }

    openModal(videoUrl) {
        if (!this.modal) {
            this.modal = this.createModal();
        }

        const player = this.modal.querySelector('.video-modal-player');
        const closeBtn = this.modal.querySelector('.video-modal-close');

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = videoUrl + '?autoplay=1';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        player.appendChild(iframe);

        // Show modal
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Close handlers
        const closeModal = () => {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
            player.innerHTML = '';
        };

        closeBtn.addEventListener('click', closeModal);
        this.modal.querySelector('.video-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                closeModal();
            }
        });

        // Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Focus close button
        closeBtn.focus();
    }
}

// Statistics Counter Animation
class StatsCounter {
    constructor() {
        this.statNumbers = document.querySelectorAll('.stat-number');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        }
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    this.animateCounter(entry.target);
                    entry.target.classList.add('counted');
                }
            });
        }, options);

        this.statNumbers.forEach(stat => {
            observer.observe(stat);
        });
    }

    animateCounter(element) {
        const text = element.textContent;
        const number = parseFloat(text.replace(/[^\d.]/g, ''));
        const suffix = text.replace(/[\d.]/g, '');
        
        if (isNaN(number)) return;

        const duration = 2000;
        const steps = 60;
        const increment = number / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            current += increment;
            step++;
            
            if (step >= steps) {
                current = number;
                clearInterval(timer);
            }
            
            element.textContent = this.formatNumber(current) + suffix;
        }, duration / steps);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return Math.floor(num).toString();
        }
    }
}

// Form Handling (if forms are added later)
class FormHandler {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.handleSubmit(e, form);
            });
        });
    }

    handleSubmit(e, form) {
        e.preventDefault();
        
        // Basic validation
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                this.showFieldError(field, 'This field is required');
            } else {
                this.clearFieldError(field);
            }
        });

        if (isValid) {
            this.submitForm(form);
        }
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async submitForm(form) {
        const formData = new FormData(form);
        const submitButton = form.querySelector('[type="submit"]');
        
        // Show loading state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
        }

        try {
            // Simulate form submission (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showSuccessMessage(form, 'Thank you! Your message has been sent.');
            form.reset();
        } catch (error) {
            this.showErrorMessage(form, 'Sorry, there was an error. Please try again.');
        } finally {
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit';
            }
        }
    }

    showSuccessMessage(form, message) {
        this.showMessage(form, message, 'success');
    }

    showErrorMessage(form, message) {
        this.showMessage(form, message, 'error');
    }

    showMessage(form, message, type) {
        let messageElement = form.querySelector('.form-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'form-message';
            form.insertBefore(messageElement, form.firstChild);
        }
        
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
}

// Accessibility Enhancements
class AccessibilityEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupAriaLabels();
    }

    setupKeyboardNavigation() {
        // Handle keyboard navigation for custom interactive elements
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    handleTabNavigation(e) {
        // Custom tab handling if needed
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    setupFocusManagement() {
        // Ensure focus is visible
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupAriaLabels() {
        // Add missing aria labels
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                button.setAttribute('aria-label', 'Button');
            }
        });
    }
}

// Performance Monitoring
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.logPerformanceMetrics();
        });
    }

    logPerformanceMetrics() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            
            console.group('GIGA Website Performance Metrics');
            console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
            console.log('Page Load Time:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
            
            paint.forEach(entry => {
                console.log(`${entry.name}:`, entry.startTime, 'ms');
            });
            
            console.groupEnd();
        }
    }
}

// Main Application Initialization
class GIGAWebsite {
    constructor() {
        this.components = [];
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize all components
            this.components.push(new MobileNavigation());
            this.components.push(new SmoothScrolling());
            this.components.push(new LazyLoading());
            this.components.push(new ScrollAnimations());
            this.components.push(new VideoModal());
            this.components.push(new StatsCounter());
            this.components.push(new FormHandler());
            this.components.push(new AccessibilityEnhancements());
            this.components.push(new PerformanceMonitor());

            console.log('GIGA Website initialized successfully');
        } catch (error) {
            console.error('Error initializing GIGA Website:', error);
        }
    }

    // Public API for external integrations
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerHeight = utils.getHeaderHeight();
            utils.smoothScrollTo(section, headerHeight + 20);
        }
    }

    openVideoModal(videoUrl) {
        const videoModal = this.components.find(component => component instanceof VideoModal);
        if (videoModal) {
            videoModal.openModal(videoUrl);
        }
    }
}

// Initialize the application
const gigaWebsite = new GIGAWebsite();

// Export for external use
window.GIGA = gigaWebsite;

// Add CSS for animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .animate-ready {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .keyboard-navigation *:focus {
        outline: 2px solid var(--giga-primary, #4A90E2) !important;
        outline-offset: 2px !important;
    }
    
    .field-error {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    .form-message {
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
    }
    
    .form-message.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .form-message.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    input.error,
    textarea.error,
    select.error {
        border-color: #dc3545;
    }
`;

document.head.appendChild(animationStyles);

