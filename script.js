class LinkTreeApp {
    constructor() {
        this.dropdowns = [];
        this.iconTimeouts = new WeakMap();
        this.init();
    }

    init() {
        this.cacheElements();
        this.createToastContainer();
        this.addEventListeners();
    }

    // === Cache DOM Elements ===
    cacheElements() {
        this.linkButtons = document.querySelectorAll('.link-button');
        this.copyButtons = document.querySelectorAll('.copy-btn');
        this.dropdownTriggers = document.querySelectorAll('[data-dropdown]');
        this.dropdowns = document.querySelectorAll('.dropdown-content');
        this.statusIndicators = document.querySelectorAll('.status-indicator');
    }

    // === Event Listeners ===
    addEventListeners() {
        this.linkButtons.forEach(btn => btn.addEventListener('click', this.handleLinkClick.bind(this)));
        this.copyButtons.forEach(btn => btn.addEventListener('click', this.handleCopyClick.bind(this)));
        this.statusIndicators.forEach(indicator => {
            indicator.addEventListener('mouseenter', this.showStatusBubble.bind(this));
            indicator.addEventListener('mouseleave', this.removeStatusBubble.bind(this));
            
            indicator.addEventListener('focus', this.showStatusBubble.bind(this));
            indicator.addEventListener('blur', this.removeStatusBubble.bind(this));
        });
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        document.addEventListener('keydown', this.handleKeyEvents.bind(this));
    }

    // === Link Handling ===
    handleLinkClick(e) {
        const link = e.currentTarget.getAttribute('data-link');
        if (link) window.open(link, '_blank', 'noopener,noreferrer');
    }

    // === Clipboard Copy ===
    handleCopyClick(e) {
        const button = e.currentTarget;
        const targetSelector = button.getAttribute('data-copy');
        const target = document.querySelector(targetSelector);
        const copyIcon = button.querySelector('.copy-icon');
    
        if (!target || !copyIcon) return;
    
        navigator.clipboard.writeText(target.textContent)
            .then(() => {
                this.showIconSwap(copyIcon, 'copy-icon fas fa-check');
                this.showBubble(copyIcon, 'Copied!');
            })
            .catch(err => {
                this.showIconSwap(copyIcon, 'copy-icon fas fa-xmark');
                this.showBubble(copyIcon, 'Copy failed!');
                console.error('Copy failed:', err);
            });
    }
    
    showIconSwap(icon, tempClass) {
        if (!icon) return;

        clearTimeout(this.iconTimeouts.get(icon));
        icon.className = tempClass;

        const timeout = setTimeout(() => icon.className = 'copy-icon fas fa-copy', 2000);
        this.iconTimeouts.set(icon, timeout);
    }

    // === Bubble / Tooltip ===
    showBubble(target, message, { variant = '', persistent = false } = {}) {
        if (!target) return;
    
        const bubble = document.createElement('div');
        bubble.className = `speech-bubble ${variant}`.trim();
        if (persistent) bubble.classList.add('persistent');
    
        bubble.textContent = message;
        document.body.appendChild(bubble);
    
        const rect = target.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
    
        bubble.style.left = `${rect.left + rect.width / 2}px`;
        bubble.style.top = `${rect.top + scrollY - 40}px`;
    
        if (!persistent) {
            setTimeout(() => bubble.remove(), 2000);
        } else {
            target._tooltipRef = bubble;
        }
    }
    
    hideBubble(target) {
        const bubble = target?._tooltipRef;
        if (bubble) {
            bubble.classList.add('hide');
            setTimeout(() => bubble.remove(), 200);
            delete target._tooltipRef;
        }
    }

    showStatusBubble(e) {
        const statusMap = {
            'online': 'Online',
            'idle': 'Idle',
            'dnd': 'Do Not Disturb',
            'offline': 'Offline'
        };

        const el = e.currentTarget;
        const statusClass = [...el.classList].find(cls => statusMap[cls]);
        const status = statusMap[statusClass] || 'Unknown';

        this.showBubble(el, status, { persistent: true });
    }

    removeStatusBubble(e) {
        this.hideBubble(e.currentTarget);
    }

    // === Toasts ===
    createToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        document.body.appendChild(this.toastContainer);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        this.toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => toast.classList.remove('show'), 3000);
        setTimeout(() => toast.remove(), 3500);
    }

    // === Dropdown ===
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
}

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        new LinkTreeApp();
    } catch (err) {
        console.error('Initialization failed:', err);
    }
});
