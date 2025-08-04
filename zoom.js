        // zoom funcionando, solo para pc



document.addEventListener('DOMContentLoaded', () => {
    let currentZoom = 1;
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;
    let startDistance = 0;
    let isZooming = false;
    let currentImageIndex = 0;
    let isAnimating = false;

    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'zoom-modal';
    modal.innerHTML = `
        <div class="zoom-container">
            <img id="zoomImage" src="" alt="Zoomed image">
            <button class="close-zoom">x</button>
            <button class="prev-image">❮</button>
            <button class="next-image">❯</button>
            <div class="zoom-controls">
                <button class="zoom-in">+</button>
                <button class="zoom-out">-</button>
                <button class="zoom-reset">Reset</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Elementos
    const zoomImage = document.getElementById('zoomImage');
    const zoomContainer = document.querySelector('.zoom-container');
    const closeBtn = document.querySelector('.close-zoom');
    const prevBtn = document.querySelector('.prev-image');
    const nextBtn = document.querySelector('.next-image');
    const zoomInBtn = document.querySelector('.zoom-in');
    const zoomOutBtn = document.querySelector('.zoom-out');
    const zoomResetBtn = document.querySelector('.zoom-reset');
    const galleryImages = document.querySelectorAll('.imagen-galeria');

    const style = document.createElement('style');
    style.textContent = `
      body.modal-open {
        overflow: hidden;
      }

      .zoom-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        z-index: 10000;
        animation: fadeIn 0.3s ease-out forwards;
        backdrop-filter: blur(8px);
      }

      .zoom-modal.closing {
        animation: fadeOutScale 0.3s forwards;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fadeOutScale {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.8);
        }
      }

      .zoom-container {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        padding: 1rem;
      }

      #zoomImage {
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        transform-origin: center;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: grab;
        position: relative;
        z-index: 1;
        border-radius: 6px;
        box-shadow: 0 8px 24px rgb(0 0 0 / 0.3);
      }

      #zoomImage:active {
        cursor: grabbing;
      }

      .slide-temp {
        position: absolute;
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        opacity: 0;
        border-radius: 2px;
        box-shadow: 0 6px 24px rgb(0 0 0 / 0.2);
      }

      /* Botones */
      .close-zoom,
      .prev-image,
      .next-image {
        position: absolute;
        background: rgba(255 255 255 / 0.12);
        color: #fff;
        border: none;
        width: 38px;
        height: 38px;
        cursor: pointer;
        font-size: 22px;
        line-height: 1;
        text-align: center;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 5;
        box-shadow: 0 2px 6px rgb(0 0 0 / 0.25);
        transition: background-color 0.3s ease, transform 0.15s ease;
        user-select: none;
        backdrop-filter: blur(6px);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
          Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      }

      .close-zoom:hover,
      .prev-image:hover,
      .next-image:hover {
        background: rgba(255 255 255 / 0.25);
        transform: scale(1.1);
      }

      .close-zoom {
        top: 16px;
        right: 16px;
      }

      .prev-image {
        left: 16px;
        top: 50%;
      }

      .next-image {
        right: 16px;
        top: 50%;
      }

      .zoom-controls {
        position: absolute;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 12px;
        z-index: 5;
      }

      .zoom-controls button {
        background: rgba(255 255 255 / 0.15);
        color: #fff;
        border: none;
        padding: 6px 14px;
        border-radius: 9999px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s ease;
        user-select: none;
      }

      .zoom-controls button:hover {
        background: rgba(255 255 255 / 0.35);
      }
    `;
    document.head.appendChild(style);

    // Abrir modal
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', (e) => {
            e.preventDefault();
            openZoom(img.src, index);
        });
    });

    function openZoom(src, index) {
        currentImageIndex = index;
        zoomImage.src = src;
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        resetZoom();
    }

    function closeZoom() {
        modal.classList.add('closing');
        modal.addEventListener('animationend', () => {
            modal.style.display = 'none';
            modal.classList.remove('closing');
            document.body.classList.remove('modal-open');
        }, { once: true });
    }

    function resetZoom() {
        currentZoom = 1;
        currentX = 0;
        currentY = 0;
        updateTransform();
    }

    function updateTransform() {
        zoomImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;
    }

    // --- TRANSICIÓN SLIDE + FADE --- 
    function slideToImage(newIndex, direction) {
        if (isAnimating) return;
        isAnimating = true;

        const newImg = document.createElement('img');
        newImg.src = galleryImages[newIndex].src;
        newImg.className = 'slide-temp';
        newImg.style.transform = `translate(-50%, -50%) translateX(${direction === 'next' ? '100%' : '-100%'})`;
        newImg.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease-in-out';
        zoomContainer.appendChild(newImg);

        newImg.offsetHeight; // Forzar reflow

        requestAnimationFrame(() => {
            newImg.style.opacity = '1';
            newImg.style.transform = 'translate(-50%, -50%) translateX(0)';
            zoomImage.style.opacity = '0';
            zoomImage.style.transform = `translateX(${direction === 'next' ? '-30%' : '30%'}) scale(0.95)`;
            zoomImage.style.transition = 'transform 0.45s ease-in-out, opacity 0.3s ease-in-out';
        });

        newImg.addEventListener('transitionend', () => {
            zoomImage.src = newImg.src;
            zoomImage.style.opacity = '1';
            zoomImage.style.transform = 'translateX(0) scale(1)';
            zoomImage.style.transition = 'none';
            newImg.remove();
            isAnimating = false;
            resetZoom();
        }, { once: true });
    }

    // Navegación
    prevBtn.addEventListener('click', () => {
        const newIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        currentImageIndex = newIndex;
        slideToImage(newIndex, 'prev');
    });
    nextBtn.addEventListener('click', () => {
        const newIndex = (currentImageIndex + 1) % galleryImages.length;
        currentImageIndex = newIndex;
        slideToImage(newIndex, 'next');
    });

    // Controles zoom
    zoomInBtn.addEventListener('click', () => { currentZoom = Math.min(currentZoom + 0.2, 4); updateTransform(); });
    zoomOutBtn.addEventListener('click', () => { currentZoom = Math.max(currentZoom - 0.2, 1); updateTransform(); });
    zoomResetBtn.addEventListener('click', resetZoom);

    // Cerrar modal
    closeBtn.addEventListener('click', closeZoom);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeZoom(); });

    // Teclado
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') closeZoom();
            if (e.key === 'ArrowLeft') prevBtn.click();
            if (e.key === 'ArrowRight') nextBtn.click();
        }
    });

    // Zoom táctil
    zoomContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            isZooming = true;
            startDistance = getDistance(e.touches[0], e.touches[1]);
        } else if (e.touches.length === 1) {
            startX = e.touches[0].clientX - currentX;
            startY = e.touches[0].clientY - currentY;
        }
    }, { passive: false });

    zoomContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isZooming && e.touches.length === 2) {
            const distance = getDistance(e.touches[0], e.touches[1]);
            const newZoom = (currentZoom * distance) / startDistance;
            currentZoom = Math.min(Math.max(1, newZoom), 4);
            updateTransform();
        } else if (e.touches.length === 1 && currentZoom > 1) {
            currentX = e.touches[0].clientX - startX;
            currentY = e.touches[0].clientY - startY;
            updateTransform();
        }
    }, { passive: false });

    zoomContainer.addEventListener('touchend', () => { isZooming = false; });

    // Zoom con rueda
    zoomContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newZoom = currentZoom * (1 + delta);
        currentZoom = Math.min(Math.max(1, newZoom), 4);
        updateTransform();
    });

    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
});
