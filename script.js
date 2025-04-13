class LinkTreeApp {
    constructor() {
        this.dropdowns = [];
        this.init();
    }

    // === Initialization ===
    init() {
        this.cacheElements();
        this.addEventListeners();
    }

    cacheElements() {
        this.linkButtons = document.querySelectorAll('.link-button');
        this.copyButtons = document.querySelectorAll('.copy-btn');
        this.dropdownTriggers = document.querySelectorAll('[data-dropdown]');
        this.dropdowns = document.querySelectorAll('.dropdown-content');
        this.discordAvatar = document.querySelector('.discord-avatar');
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
    }

    // === Link Handling ===
    handleLinkClick(e) {
        const link = e.currentTarget.getAttribute('data-link');
        if (link) window.open(link, '_blank', 'noopener,noreferrer');
    }

    // === Copy to Clipboard ===
    handleCopyClick(e) {
        const button = e.currentTarget;
        const targetSelector = button.getAttribute('data-copy');
        const target = document.querySelector(targetSelector);
        if (!target) return;

        navigator.clipboard.writeText(target.textContent)
            .then(() => {
                this.showIconSwap(button.querySelector('i'), 'fas fa-check');
                this.showSpeechBubble(button.querySelector('i'), 'Copied!');
            })
            .catch(err => console.error('Copy failed:', err));
    }

    showIconSwap(icon, tempClass) {
        if (!icon) return;
        const originalClass = icon.className;
        icon.className = tempClass;
        setTimeout(() => {
            icon.className = originalClass;
        }, 2000);
    }

    // === Speech Bubble ===
    showSpeechBubble(target, message, variant = '') {
        if (!target) return;

        const bubble = document.createElement('div');
        bubble.className = `copy-bubble ${variant}`.trim();
        bubble.textContent = message;
        document.body.appendChild(bubble);

        const rect = target.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;

        bubble.style.left = `${rect.left + rect.width / 2}px`;
        bubble.style.top = `${rect.top + scrollY - 40}px`;

        setTimeout(() => bubble.remove(), 2000);
    }

    // === Dropdown Handling ===
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

    // === Discord Avatar Speech Bubble ===
    showCatSpeech(e) {
        const sounds = ["Meow!", "Purrr...", "Nya~", "*hiss*", "Prrrrt", "Mrow?"];
        const message = sounds[Math.floor(Math.random() * sounds.length)];
        this.showSpeechBubble(e.target, message, 'cat-bubble');
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
