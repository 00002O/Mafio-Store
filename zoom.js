let initializeZoom;

document.addEventListener('DOMContentLoaded', () => {
    initializeZoom = function() {
        const gallery = document.querySelector('.grid-gallery');
        if (!gallery) return;

        const images = gallery.querySelectorAll('.imagen-galeria');
        if (!images.length) return;

        // State management
        const state = {
            currentZoom: 1,
            currentX: 0,
            currentY: 0,
            startX: 0,
            startY: 0,
            startDistance: 0,
            isZooming: false,
            currentIndex: 0,
            isTransitioning: false,
            lastClickTime: 0,
            isMobile: false,
            lastTouchDistance: 0,
            lastTouchX: 0,
            lastTouchY: 0,
            initialTouchX: 0,
            initialTouchY: 0,
            isDoubleTapPending: false,
            lastTapTime: 0
        };

        // Detect mobile device
        state.isMobile = Boolean(
            navigator.userAgent.match(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i)
        );

        // Create modal structure
        const modal = document.createElement('div');
        modal.className = 'zoom-modal';
        modal.innerHTML = `
            <div class="zoom-container">
                <div class="image-wrapper">
                    <img id="zoomImage" src="" alt="Zoomed image">
                </div>
                <button class="close-zoom" aria-label="Close">X</button>
                <button class="nav-btn prev-image" aria-label="Previous">❮</button>
                <button class="nav-btn next-image" aria-label="Next">❯</button>
                <div class="zoom-controls">
                    <button class="zoom-in">+</button>
                    <button class="zoom-out">−</button>
                    <button class="zoom-reset">Reset</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Get DOM elements
        const elements = {
            modal,
            container: modal.querySelector('.zoom-container'),
            image: modal.querySelector('#zoomImage'),
            wrapper: modal.querySelector('.image-wrapper'),
            closeBtn: modal.querySelector('.close-zoom'),
            prevBtn: modal.querySelector('.prev-image'),
            nextBtn: modal.querySelector('.next-image'),
            controls: modal.querySelector('.zoom-controls'),
            gallery: [...images]
        };

        // Utility functions
        const debounce = (fn, delay) => {
            let timeoutId;
            return (...args) => {
                if (timeoutId) clearTimeout(timeoutId);
                timeoutId = setTimeout(() => fn(...args), delay);
            };
        };

        const updateTransform = () => {
            if (state.currentZoom <= 1) {
                state.currentX = 0;
                state.currentY = 0;
            } else {
                const maxX = (state.currentZoom - 1) * elements.image.width / 2;
                const maxY = (state.currentZoom - 1) * elements.image.height / 2;
                state.currentX = Math.max(Math.min(state.currentX, maxX), -maxX);
                state.currentY = Math.max(Math.min(state.currentY, maxY), -maxY);
            }

            elements.image.style.transform = `translate(${state.currentX}px, ${state.currentY}px) scale(${state.currentZoom})`;
        };

        const resetZoom = () => {
            state.currentZoom = 1;
            state.currentX = 0;
            state.currentY = 0;
            updateTransform();
        };

        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        };

        // Image navigation
        const changeImage = async (direction) => {
            if (state.isTransitioning) return;
            
            const now = Date.now();
            if (now - state.lastClickTime < 300) return; // Prevent rapid clicks
            state.lastClickTime = now;

            const newIndex = direction === 'next' 
                ? (state.currentIndex + 1) % elements.gallery.length
                : (state.currentIndex - 1 + elements.gallery.length) % elements.gallery.length;

            try {
                state.isTransitioning = true;
                elements.image.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                elements.image.style.opacity = '0';
                elements.image.style.transform = `translate(${direction === 'next' ? '-30%' : '30%'}, 0) scale(0.95)`;

                await loadImage(elements.gallery[newIndex].src);
                
                setTimeout(() => {
                    elements.image.src = elements.gallery[newIndex].src;
                    elements.image.style.transform = 'translate(0, 0) scale(1)';
                    elements.image.style.opacity = '1';
                    state.currentIndex = newIndex;
                    resetZoom();
                    state.isTransitioning = false;
                }, 300);
            } catch (error) {
                console.error('Failed to load image:', error);
                state.isTransitioning = false;
            }
        };

        // Event handlers
        const openZoom = (index) => {
            state.currentIndex = index;
            elements.image.src = elements.gallery[index].src;
            elements.modal.style.display = 'block';
            document.body.classList.add('modal-open');
            resetZoom();
        };

        const closeZoom = () => {
            elements.modal.classList.add('closing');
            elements.modal.addEventListener('animationend', () => {
                elements.modal.style.display = 'none';
                elements.modal.classList.remove('closing');
                document.body.classList.remove('modal-open');
                resetZoom();
            }, { once: true });
        };

        // Event listeners
        elements.gallery.forEach((img, index) => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                openZoom(index);
            });
        });

        elements.prevBtn.addEventListener('click', () => changeImage('prev'));
        elements.nextBtn.addEventListener('click', () => changeImage('next'));
        elements.closeBtn.addEventListener('click', closeZoom);
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) closeZoom();
        });

        // Zoom controls
        elements.controls.addEventListener('click', (e) => {
            if (e.target.classList.contains('zoom-in')) {
                state.currentZoom = Math.min(state.currentZoom + 0.2, 4);
                updateTransform();
            } else if (e.target.classList.contains('zoom-out')) {
                state.currentZoom = Math.max(state.currentZoom - 0.2, 1);
                updateTransform();
            } else if (e.target.classList.contains('zoom-reset')) {
                resetZoom();
            }
        });

        // Touch handlers
        elements.container.addEventListener('touchstart', (e) => {
            const touches = e.touches;
            
            if (touches.length === 2) {
                state.isZooming = true;
                state.lastTouchDistance = Math.hypot(
                    touches[0].clientX - touches[1].clientX,
                    touches[0].clientY - touches[1].clientY
                );
            } else if (touches.length === 1) {
                handleDoubleTap(e);
                state.initialTouchX = touches[0].clientX - state.currentX;
                state.initialTouchY = touches[0].clientY - state.currentY;
            }
        }, { passive: false });

        elements.container.addEventListener('touchmove', (e) => {
            const touches = e.touches;
            
            if (state.isZooming && touches.length === 2) {
                e.preventDefault();
                const distance = Math.hypot(
                    touches[0].clientX - touches[1].clientX,
                    touches[0].clientY - touches[1].clientY
                );
                
                const scale = distance / state.lastTouchDistance;
                state.currentZoom = Math.min(Math.max(1, state.currentZoom * scale), 4);
                state.lastTouchDistance = distance;
                
                // Calcular el punto medio del zoom
                const midX = (touches[0].clientX + touches[1].clientX) / 2;
                const midY = (touches[0].clientY + touches[1].clientY) / 2;
                
                state.currentX = midX - elements.image.width / 2;
                state.currentY = midY - elements.image.height / 2;
                
                requestAnimationFrame(() => updateTransform());
            } else if (touches.length === 1 && state.currentZoom > 1) {
                const touch = touches[0];
                state.currentX = touch.clientX - state.initialTouchX;
                state.currentY = touch.clientY - state.initialTouchY;
                requestAnimationFrame(() => updateTransform());
            }
        }, { passive: false });

        elements.container.addEventListener('touchend', () => {
            state.isZooming = false;
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (elements.modal.style.display === 'block') {
                if (e.key === 'Escape') closeZoom();
                if (e.key === 'ArrowLeft') changeImage('prev');
                if (e.key === 'ArrowRight') changeImage('next');
            }
        });

        // Mouse wheel zoom
        elements.container.addEventListener('wheel', debounce((e) => {
            e.preventDefault();
            const delta = e.deltaY * -0.003;
            state.currentZoom = Math.min(Math.max(1, state.currentZoom * (1 + delta)), 4);
            updateTransform();
        }, 16));
    };

    // Initialize if gallery exists
    if (document.querySelector('.grid-gallery')) {
        initializeZoom();
    }
});