class LinkTreeApp {
    constructor() {
        this.middleMouseDownBtn = null;
        this.dropdowns = [];
        this.tooltip = null;
        this.iconTimeouts = new WeakMap();
        this.init();
    }

    init() {
        this.cacheElements();
        this.createToastContainer();
        this.createTooltip();
        this.addEventListeners();
    }

    // === Cache DOM Elements ===
    cacheElements() {
        this.container = document.body;
        this.dropdowns = document.querySelectorAll('.dropdown-content');
        this.statusIndicators = document.querySelectorAll('.status-indicator');
    }

    // === Event Listeners ===
    addEventListeners() {    
        this.container?.addEventListener('click', (e) => {
            const linkBtn = e.target.closest('.link-button');
            const copyBtn = e.target.closest('.copy-btn');
            const dropdownTrigger = e.target.closest('[data-dropdown]');
            const actionButton = e.target.closest('[data-action]');
            const insideDropdown = e.target.closest('.dropdown-container');

            if (linkBtn) {
                this.handleLinkClick({ currentTarget: linkBtn, ...e });
            }

            if (copyBtn) {
                this.handleCopyClick({ currentTarget: copyBtn, ...e });
            }

            if (dropdownTrigger) {
                e.preventDefault();
                this.toggleDropdown(dropdownTrigger.getAttribute('data-dropdown'), dropdownTrigger);
            } else if (actionButton) {
                this.handleActionButton(actionButton);
            } else if (!insideDropdown) {
                this.closeAllDropdowns();
            }
        });
    
        this.container?.addEventListener('mousedown', this.handleMiddleClick.bind(this));
        this.container?.addEventListener('mouseup', this.handleMiddleClick.bind(this));

        this.statusIndicators.forEach(indicator => {
            indicator.addEventListener('mouseenter', this.showStatusBubble.bind(this));
            indicator.addEventListener('mouseleave', this.removeStatusBubble.bind(this));
        });

        document.addEventListener('keydown', this.handleKeyEvents.bind(this));
    }

    // === Link Handling ===
    handleLinkClick(e) {
        const link = e.currentTarget.getAttribute('data-link');
        if (link) window.open(link, '_blank', 'noopener,noreferrer');
    }

    handleMiddleClick(e) {
        const linkBtn = e.target.closest('.link-button');
        if (!linkBtn) return;
    
        if (e.type === 'mousedown' && e.button === 1) {
            this.middleMouseDown = linkBtn;
            e.preventDefault();
        }
    
        if (e.type === 'mouseup' && e.button === 1 && this.middleMouseDown === linkBtn) {
            this.middleMouseDown = null;
            const link = linkBtn.getAttribute('data-link');
            if (link) window.open(link, '_blank', 'noopener,noreferrer');
        }
    }

    // === Clipboard Copy ===
    handleCopyClick(e) {
        const button = e.currentTarget;
        const targetSelector = button.getAttribute('data-copy');
        const target = document.querySelector(targetSelector);
        const copyIcon = button.querySelector('.copy-icon');
    
        if (!target || !copyIcon) return;
        
        if (!navigator.clipboard) {
            this.showBubble(copyIcon, 'Clipboard unsupported!');
            return;
        }
        
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
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'speech-bubble';
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.pointerEvents = 'none';
        this.tooltip.style.display = 'none';
        document.body.appendChild(this.tooltip);
    }
    
    showBubble(target, message, { variant = '', persistent = false } = {}) {
        if (!target || !this.tooltip) return;
    
        this.tooltip.textContent = message;
        this.tooltip.className = `speech-bubble ${variant}`.trim();
        if (persistent) this.tooltip.classList.add('persistent');
        this.tooltip.style.display = 'block';
    
        const rect = target.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
    
        this.tooltip.style.left = `${rect.left + rect.width / 2}px`;
        this.tooltip.style.top = `${rect.top + scrollY - 40}px`;
    
        if (!persistent) {
            clearTimeout(this.tooltip._hideTimeout);
            this.tooltip._hideTimeout = setTimeout(() => this.hideBubble(), 2000);
        } else {
            target._tooltipRef = true;
        }
    }
    
    hideBubble(target = null) {
        if (!this.tooltip) return;
    
        this.tooltip.classList.add('hide');
        setTimeout(() => {
            this.tooltip.style.display = 'none';
            this.tooltip.classList.remove('hide');
        }, 200);
    
        if (target && target._tooltipRef) {
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
    }

    updateDropdownAccessibility(trigger, isExpanded) {
        trigger?.setAttribute('aria-expanded', isExpanded);
    }

    animateDropdown(dropdown, isOpening) {
        const chevron = dropdown.closest('.dropdown-container')?.querySelector('.dropdown-arrow');
        if (chevron) chevron.style.transform = isOpening ? 'rotate(180deg)' : 'rotate(0deg)';
    
        if (isOpening) {
            this.ensureDropdownVisibility(dropdown);
        }
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
