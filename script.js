class LinkTreeApp {
    constructor() {
        this.captchaText = '';
        this.businessEmail = 'contact@example.com';
        this.dropdowns = [];
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.generateCaptcha();
    }

    cacheElements() {
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

    setupEventListeners() {
        // Use event delegation for better performance
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        document.addEventListener('keydown', this.handleKeyEvents.bind(this));
        
        // Specific event listeners
        if (this.refreshCaptchaBtn) {
            this.refreshCaptchaBtn.addEventListener('click', () => this.generateCaptcha());
        }
        
        if (this.verifyCaptchaBtn) {
            this.verifyCaptchaBtn.addEventListener('click', () => this.verifyCaptcha());
        }
        
        if (this.captchaInput) {
            this.captchaInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.verifyCaptcha();
            });
        }
        
        // Copy buttons
        this.copyButtons.forEach(button => {
            button.addEventListener('click', this.handleCopyClick.bind(this));
        });
    }

    handleDocumentClick(e) {
        const trigger = e.target.closest('[data-dropdown]');
        if (trigger) {
            e.preventDefault();
            const dropdownId = trigger.getAttribute('data-dropdown');
            this.toggleDropdown(dropdownId, trigger);
            return;
        }

        // Handle action buttons
        const actionButton = e.target.closest('[data-action]');
        if (actionButton) {
            this.handleActionButton(actionButton);
            return;
        }

        // Close dropdowns when clicking outside
        if (!e.target.closest('.dropdown-container')) {
            this.closeAllDropdowns();
        }
    }

    handleKeyEvents(e) {
        if (e.key === 'Escape') {
            this.closeAllDropdowns();
        }
    }

    handleActionButton(button) {
        const action = button.getAttribute('data-action');
        const dropdownId = button.getAttribute('data-dropdown');
        
        switch (action) {
            case 'close':
                this.closeDropdown(dropdownId);
                break;
            case 'confirm':
                const link = button.getAttribute('data-link');
                window.open(link, '_blank');
                this.closeAllDropdowns();
                break;
        }
    }

    handleCopyClick(e) {
        const button = e.currentTarget;
        const targetSelector = button.getAttribute('data-copy');
        const target = document.querySelector(targetSelector);
        
        if (!target) return;
        
        const text = target.textContent;
        navigator.clipboard.writeText(text)
            .then(() => this.showCopySuccess(button))
            .catch(err => console.error('Failed to copy text: ', err));
    }

    showCopySuccess(button) {
        const icon = button.querySelector('i');
        if (!icon) return;
        
        const originalIcon = icon.className;
        icon.className = 'fas fa-check';
        
        setTimeout(() => {
            icon.className = originalIcon;
        }, 2000);
    }

    toggleDropdown(dropdownId, trigger) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;
    
        const isOpening = !dropdown.classList.contains('show');
    
        // Close other dropdowns first
        if (isOpening) {
            this.closeAllDropdowns(dropdownId);
        }
    
        // Toggle the dropdown
        dropdown.classList.toggle('show', isOpening);
        this.updateDropdownAccessibility(trigger, isOpening);
        this.animateDropdown(dropdown, isOpening);
    }

    updateDropdownAccessibility(trigger, isExpanded) {
        if (trigger) {
            trigger.setAttribute('aria-expanded', isExpanded);
        }
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

    generateCaptcha() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let captcha = '';
        
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        this.captchaText = captcha;
        this.captchaTextElement.textContent = captcha;
        this.captchaInput.value = '';
        this.emailResult.style.display = 'none';
    }

    verifyCaptcha() {
        const userInput = this.captchaInput.value.trim();
        
        if (!userInput) {
            this.showAlert('Please enter the CAPTCHA text');
            return;
        }
        
        if (userInput === this.captchaText) {
            this.showEmailResult();
        } else {
            this.handleCaptchaFailure();
        }
    }

    showEmailResult() {
        this.businessEmailElement.textContent = this.businessEmail;
        this.emailResult.style.display = 'block';
        
        setTimeout(() => {
            this.emailResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    handleCaptchaFailure() {
        this.showAlert('CAPTCHA verification failed. Please try again.');
        this.generateCaptcha();
    }

    showAlert(message) {
        // Could be replaced with a more sophisticated notification system
        alert(message);
    }

    animateDropdownItems(dropdown) {
        const items = dropdown.querySelectorAll('a, button');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100 * (index + 1));
        });
    }

    ensureDropdownVisibility(dropdown) {
        setTimeout(() => {
            const dropdownRect = dropdown.getBoundingClientRect();
            const bottomOverflow = dropdownRect.bottom - window.innerHeight;

            if (bottomOverflow > 0) {
                dropdown.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 200);
    }

    closeDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown || !dropdown.classList.contains('show')) return;
        
        dropdown.classList.remove('show');
        this.resetDropdownState(dropdownId);
    }

    resetDropdownState(dropdownId) {
        const trigger = document.querySelector(`[data-dropdown="${dropdownId}"]`);
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
        
        const chevron = document.querySelector(`#${dropdownId}`).closest('.dropdown-container')?.querySelector('.dropdown-arrow');
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
        
        const items = document.querySelectorAll(`#${dropdownId} a, #${dropdownId} button`);
        items.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-10px)';
        });
    }

    closeAllDropdowns(exceptId = null) {
        this.dropdowns.forEach(dropdown => {
            if (!exceptId || dropdown.id !== exceptId) {
                this.closeDropdown(dropdown.id);
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new LinkTreeApp();
    } catch (error) {
        console.error('Failed to initialize LinkTreeApp:', error);
        // Fallback UI or error message could be shown here
    }
});