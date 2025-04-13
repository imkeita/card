class LinkTreeApp {
    constructor() {
        // this.captchaText = '';
        // this.businessEmail = 'contact@example.com';
        this.dropdowns = [];
        this.init();
    }

    // --- Initialization ---
    init() {
        this.cacheElements();
        this.addEventListeners();
        // this.generateCaptcha();
    }

    cacheElements() {
        this.linkButtons = document.querySelectorAll('.link-button');
        this.dropdownTriggers = document.querySelectorAll('[data-dropdown]');
        this.dropdowns = document.querySelectorAll('.dropdown-content');
        this.copyButtons = document.querySelectorAll('.copy-btn');
        
        this.discordAvatar = document.querySelector('.discord-avatar');
        this.catSpeechBubble = document.getElementById('catSpeechBubble');

        // this.captchaTextElement = document.getElementById('captchaText');
        // this.captchaInput = document.getElementById('captchaInput');
        // this.refreshCaptchaBtn = document.getElementById('refreshCaptcha');
        // this.verifyCaptchaBtn = document.getElementById('verifyCaptcha');

        // this.emailResult = document.getElementById('emailResult');
        // this.businessEmailElement = document.getElementById('businessEmail');
    }

    addEventListeners() {
        this.linkButtons.forEach(btn =>
            btn.addEventListener('click', this.handleLinkClick.bind(this))
        );

        this.copyButtons.forEach(btn =>
            btn.addEventListener('click', this.handleCopyClick.bind(this))
        );

        document.addEventListener('click', this.handleDocumentClick.bind(this));
        document.addEventListener('keydown', this.handleKeyEvents.bind(this));

        this.discordAvatar?.addEventListener('mouseenter', this.showCatSpeech.bind(this));
        this.discordAvatar?.addEventListener('mouseleave', () =>
            this.catSpeechBubble?.classList.remove('visible')
        );

        // this.refreshCaptchaBtn?.addEventListener('click', () => this.generateCaptcha());
        // this.verifyCaptchaBtn?.addEventListener('click', () => this.verifyCaptcha());
        // this.captchaInput?.addEventListener('keypress', (e) => {
        //     if (e.key === 'Enter') this.verifyCaptcha();
        // });
    }

    // --- Link Handling ---
    handleLinkClick(e) {
        const link = e.currentTarget.getAttribute('data-link');
        if (link) window.open(link, '_blank', 'noopener,noreferrer');
    }

    handleCopyClick(e) {
        const button = e.currentTarget;
        const targetSelector = button.getAttribute('data-copy');
        const target = document.querySelector(targetSelector);
        if (!target) return;
    
        navigator.clipboard.writeText(target.textContent)
            .then(() => this.showCopySuccess(button))
            .catch(err => console.error('Copy failed:', err));
    }

    showCopySuccess(button) {
        const icon = button.querySelector('i');
        if (!icon) return;
    
        // Show checkmark animation
        const originalClass = icon.className;
        icon.className = 'fas fa-check';
    
        // Create speech bubble
        const bubble = document.createElement('div');
        bubble.className = 'copy-bubble';
        bubble.textContent = 'Copied!';
        document.body.appendChild(bubble);
    
        // Position above the icon
        const iconRect = icon.getBoundingClientRect();
        bubble.style.left = `${iconRect.left + iconRect.width / 2}px`;
        bubble.style.top = `${iconRect.top - 30}px`; // adjust height above icon
    
        setTimeout(() => {
            icon.className = originalClass;
            bubble.remove();
        }, 2000);
    }    

    // --- CAPTCHA ---
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

    showAlert(message) {
        alert(message); // Replace with a custom toast/modal if desired
    }

    // --- Dropdowns ---
    handleDocumentClick(e) {
        const trigger = e.target.closest('[data-dropdown]');
        const actionButton = e.target.closest('[data-action]');
        const clickedInsideDropdown = e.target.closest('.dropdown-container');

        if (trigger) {
            e.preventDefault();
            this.toggleDropdown(trigger.getAttribute('data-dropdown'), trigger);
        } else if (actionButton) {
            this.handleActionButton(actionButton);
        } else if (!clickedInsideDropdown) {
            this.closeAllDropdowns();
        }
    }

    handleActionButton(button) {
        const action = button.getAttribute('data-action');
        const dropdownId = button.getAttribute('data-dropdown');
        const link = button.getAttribute('data-link');

        if (action === 'close') this.closeDropdown(dropdownId);
        if (action === 'confirm' && link) {
            window.open(link, '_blank', 'noopener,noreferrer');
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

    closeDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown?.classList.contains('show')) return;

        dropdown.classList.remove('show');
        this.resetDropdownState(dropdownId);
    }

    closeAllDropdowns(exceptId = null) {
        this.dropdowns.forEach(dropdown => {
            if (dropdown.id !== exceptId) this.closeDropdown(dropdown.id);
        });
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

    updateDropdownAccessibility(trigger, isExpanded) {
        trigger?.setAttribute('aria-expanded', isExpanded);
    }

    animateDropdown(dropdown, isOpening) {
        const chevron = dropdown.closest('.dropdown-container')?.querySelector('.dropdown-arrow');
        if (chevron) chevron.style.transform = isOpening ? 'rotate(180deg)' : 'rotate(0deg)';

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
            if (bottom > window.innerHeight) {
                dropdown.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 200);
    }

    handleKeyEvents(e) {
        if (e.key === 'Escape') this.closeAllDropdowns();
    }

    // --- Discord Avatar Interaction ---
    showCatSpeech(e) {
        const sounds = ["Meow!", "Purrr...", "Nya~", "*hiss*", "Prrrrt", "Mrow?"];
        const message = sounds[Math.floor(Math.random() * sounds.length)];
    
        const bubble = document.createElement('div');
        bubble.className = 'copy-bubble cat-bubble'; // Reuse same bubble class
        bubble.textContent = message;
        document.body.appendChild(bubble);
    
        const avatarRect = e.target.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
    
        bubble.style.left = `${avatarRect.left + avatarRect.width / 2}px`;
        bubble.style.top = `${avatarRect.top + scrollY - 40}px`; // position above avatar
    
        setTimeout(() => bubble.remove(), 2000);
    }
}

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        new LinkTreeApp();
    } catch (err) {
        console.error('Initialization failed:', err);
    }
});
