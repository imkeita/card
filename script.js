class LinkTreeApp {
    constructor() {
        this.dropdowns = [];
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
    }

    cacheElements() {
        this.dropdownTriggers = document.querySelectorAll('[data-dropdown]');
        this.dropdowns = document.querySelectorAll('.dropdown-content');
        this.copyButtons = document.querySelectorAll('.copy-btn');
    }

    setupEventListeners() {
        // Dropdown triggers
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-dropdown]');
            if (trigger) {
                e.preventDefault();
                const dropdownId = trigger.getAttribute('data-dropdown');
                this.toggleDropdown(dropdownId, trigger);
                return;
            }

            // Close dropdowns when clicking outside
            if (!e.target.closest('.dropdown-container')) {
                this.closeAllDropdowns();
            }
        });

        // Action buttons (confirm/cancel)
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;
            
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
        });

        // Keyboard accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });

        // Copy buttons
        this.copyButtons.forEach(button => {
            button.addEventListener('click', this.handleCopyClick.bind(this));
        });
    }

    handleCopyClick(e) {
        const button = e.currentTarget;
        const targetSelector = button.getAttribute('data-copy');
        const target = document.querySelector(targetSelector);
        
        if (!target) return;
        
        const text = target.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const icon = button.querySelector('i');
            if (!icon) return;
            
            const originalIcon = icon.className;
            icon.className = 'fas fa-check';
            
            setTimeout(() => {
                icon.className = originalIcon;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
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
    
        // Update ARIA attributes
        if (trigger) {
            const isExpanded = dropdown.classList.contains('show');
            trigger.setAttribute('aria-expanded', isExpanded);
        }
    
        // Animate chevron
        const chevron = dropdown.closest('.dropdown-container')?.querySelector('.dropdown-arrow');
        if (chevron) {
            chevron.style.transform = isOpening ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    
        // Animate dropdown items
        if (isOpening) {
            this.animateDropdownItems(dropdown);
        }
    }

    animateDropdownItems(dropdown) {
        const items = dropdown.querySelectorAll('a, button');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100 * (index + 1));
        });

        // Scroll into view if needed
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
        
        // Update ARIA attributes
        const trigger = document.querySelector(`[data-dropdown="${dropdownId}"]`);
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
        
        // Reset chevron
        const chevron = dropdown.closest('.dropdown-container')?.querySelector('.dropdown-arrow');
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
        
        // Reset item animations
        const items = dropdown.querySelectorAll('a, button');
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
    new LinkTreeApp();
});