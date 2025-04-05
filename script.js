document.addEventListener('DOMContentLoaded', function() {
    const app = {
        init() {
            this.cacheElements();
            this.bindEvents();
        },
        
        cacheElements() {
            this.dropdownTriggers = document.querySelectorAll('[data-dropdown]');
            this.actionButtons = document.querySelectorAll('[data-action]');
            this.dropdowns = document.querySelectorAll('.dropdown-content');
        },
        
        bindEvents() {
            // Use event delegation for dropdown triggers
            document.addEventListener('click', (e) => {
                const trigger = e.target.closest('[data-dropdown]');
                if (trigger) {
                    e.preventDefault();
                    const dropdownId = trigger.getAttribute('data-dropdown');
                    this.toggleDropdown(dropdownId, trigger);
                }
                
                // Close dropdowns when clicking outside
                if (!e.target.closest('.dropdown-container')) {
                    this.closeAllDropdowns();
                }
            });
            
            // Handle warning button actions
            document.addEventListener('click', (e) => {
                const button = e.target.closest('[data-action]');
                if (!button) return;
                
                const action = button.getAttribute('data-action');
                
                if (action === 'close') {
                    const dropdownId = button.getAttribute('data-dropdown');
                    this.closeDropdown(dropdownId);
                } else if (action === 'confirm') {
                    const link = button.getAttribute('data-link');
                    window.open(link, '_blank');
                    this.closeAllDropdowns();
                }
            });
            
            // Keyboard accessibility
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAllDropdowns();
                }
            });
        },
        
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
                const items = dropdown.querySelectorAll('a, button');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 100 * (index + 1));
                });
        
                // Delay a bit so the dropdown has time to animate in
                setTimeout(() => {
                    const dropdownRect = dropdown.getBoundingClientRect();
                    const bottomOverflow = dropdownRect.bottom - window.innerHeight;
        
                    if (bottomOverflow > 0) {
                        dropdown.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    }
                }, 200);
            }
        },
        
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
        },
        
        closeAllDropdowns(exceptId = null) {
            this.dropdowns.forEach(dropdown => {
                if (!exceptId || dropdown.id !== exceptId) {
                    this.closeDropdown(dropdown.id);
                }
            });
        }
    };
    
    app.init();
});