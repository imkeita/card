class LinkTreeApp {
    constructor() {
        this.captchaText = '';
        this.businessEmail = 'contact@example.com';
        this.dropdowns = [];
        this.init();
    }

    init() {
        this.cacheElements();
        this.addEventListeners();
        this.generateCaptcha();
    }

    cacheElements() {
        this.linkButtons = document.querySelectorAll('.link-button');
        this.dropdownTriggers = document.querySelectorAll('[data-dropdown]');
        this.dropdowns = document.querySelectorAll('.dropdown-content');
        this.copyButtons = document.querySelectorAll('.copy-btn');
        this.captchaTextElement = document.getElementById('captchaText');
        this.captchaInput = document.getElementById('captchaInput');
        this.refreshCaptchaBtn = document.getElementById('refreshCaptcha');
        this.verifyCaptchaBtn = document.getElementById('verifyCaptcha');
        this.emailResult = document.getElementById('emailResult');
        this.businessEmailElement = document.getElementById('businessEmail');
    }

    addEventListeners() {
        this.linkButtons.forEach(btn => 
            btn.addEventListener('click', this.handleLinkClick.bind(this))
        );

        document.addEventListener('click', this.handleDocumentClick.bind(this));
        document.addEventListener('keydown', this.handleKeyEvents.bind(this));

        this.refreshCaptchaBtn?.addEventListener('click', () => this.generateCaptcha());
        this.verifyCaptchaBtn?.addEventListener('click', () => this.verifyCaptcha());

        this.captchaInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.verifyCaptcha();
        });

        this.copyButtons.forEach(btn =>
            btn.addEventListener('click', this.handleCopyClick.bind(this))
        );
    }

    handleLinkClick(e) {
        const button = e.currentTarget;
        const link = button.getAttribute('data-link');
        window.open(link, '_blank', 'noopener, noreferrer');
    }

    handleDocumentClick(e) {
        const trigger = e.target.closest('[data-dropdown]');
        if (trigger) {
            e.preventDefault();
            this.toggleDropdown(trigger.getAttribute('data-dropdown'), trigger);
            return;
        }

        const actionButton = e.target.closest('[data-action]');
        if (actionButton) {
            this.handleActionButton(actionButton);
            return;
        }

        if (!e.target.closest('.dropdown-container')) {
            this.closeAllDropdowns();
        }
    }

    handleKeyEvents(e) {
        if (e.key === 'Escape') this.closeAllDropdowns();
    }

    handleActionButton(button) {
        const action = button.getAttribute('data-action');
        const dropdownId = button.getAttribute('data-dropdown');
        if (action === 'close') this.closeDropdown(dropdownId);
        if (action === 'confirm') {
            const link = button.getAttribute('data-link');
            window.open(link, '_blank', 'noopener, noreferrer');
            this.closeAllDropdowns();
        }
    }

    toggleDropdown(dropdownId, trigger) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const isOpening = !dropdown.classList.contains('show');
        if (isOpening) this.closeAllDropdowns(dropdownId);

        dropdown.classList.toggle('show', isOpening);
        this.updateDropdownAccessibility(trigger, isOpening);
        this.animateDropdown(dropdown, isOpening);
    }

    updateDropdownAccessibility(trigger, isExpanded) {
        trigger?.setAttribute('aria-expanded', isExpanded);
    }

    animateDropdown(dropdown, isOpening) {
        const chevron = dropdown.closest('.dropdown-container')?.querySelector('.dropdown-arrow');
        if (chevron) {
            chevron.style.transform = isOpening ? 'rotate(180deg)' : 'rotate(0deg)';
        }

        if (isOpening) {
            this.animateDropdownItems(dropdown);
            this.ensureDropdownVisibility(dropdown);
        }
    }

    animateDropdownItems(dropdown) {
        const items = dropdown.querySelectorAll('a, button');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100 * (index + 1));
        });
    }

    ensureDropdownVisibility(dropdown) {
        setTimeout(() => {
            const { bottom } = dropdown.getBoundingClientRect();
            const overflow = bottom - window.innerHeight;
            if (overflow > 0) {
                dropdown.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 200);
    }

    handleCopyClick(e) {
        const button = e.currentTarget;
        const target = document.querySelector(button.getAttribute('data-copy'));
        if (!target) return;
        
        navigator.clipboard.writeText(target.textContent)
            .then(() => this.showCopySuccess(button))
            .catch(err => console.error('Copy failed:', err));
    }

    showCopySuccess(button) {
        const icon = button.querySelector('i');
        if (!icon) return;

        const original = icon.className;
        icon.className = 'fas fa-check';

        setTimeout(() => {
            icon.className = original;
        }, 2000);
    }

    generateCaptcha() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.captchaText = Array.from({ length: 6 }, () =>
            chars.charAt(Math.floor(Math.random() * chars.length))
        ).join('');

        this.captchaTextElement.textContent = this.captchaText;
        this.captchaInput.value = '';
        this.emailResult.style.display = 'none';
    }

    verifyCaptcha() {
        const input = this.captchaInput.value.trim();

        if (!input) return this.showAlert('Please enter the CAPTCHA text');
        if (input === this.captchaText) return this.showEmailResult();

        this.showAlert('CAPTCHA verification failed. Please try again.');
        this.generateCaptcha();
    }

    showEmailResult() {
        this.businessEmailElement.textContent = this.businessEmail;
        this.emailResult.style.display = 'block';

        setTimeout(() => {
            this.emailResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    showAlert(msg) {
        alert(msg); // Swap with a custom modal/toast if needed
    }

    closeDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown?.classList.contains('show')) return;

        dropdown.classList.remove('show');
        this.resetDropdownState(dropdownId);
    }

    resetDropdownState(dropdownId) {
        const trigger = document.querySelector(`[data-dropdown="${dropdownId}"]`);
        const dropdown = document.getElementById(dropdownId);
        const chevron = dropdown?.closest('.dropdown-container')?.querySelector('.dropdown-arrow');

        trigger?.setAttribute('aria-expanded', 'false');
        if (chevron) chevron.style.transform = 'rotate(0deg)';

        dropdown?.querySelectorAll('a, button').forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-10px)';
        });
    }

    closeAllDropdowns(exceptId = null) {
        this.dropdowns.forEach(dropdown => {
            if (dropdown.id !== exceptId) this.closeDropdown(dropdown.id);
        });
    }
}

// Initialize after DOM load
document.addEventListener('DOMContentLoaded', () => {
    try {
        new LinkTreeApp();
    } catch (err) {
        console.error('Initialization failed:', err);
    }
});
