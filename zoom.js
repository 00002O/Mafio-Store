
    // prototipo sin pulir
    // por dani



document.addEventListener('DOMContentLoaded', () => {
    let currentZoom = 1;
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;
    let startDistance = 0;
    let isZooming = false;
    
    // Crear modal para zoom
    const modal = document.createElement('div');
    modal.className = 'zoom-modal';
    modal.innerHTML = `
        <div class="zoom-container">
            <img id="zoomImage" src="" alt="Zoomed image">
            <button class="close-zoom">×</button>
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

    // Elementos del zoom
    const zoomImage = document.getElementById('zoomImage');
    const zoomContainer = document.querySelector('.zoom-container');
    const closeBtn = document.querySelector('.close-zoom');
    const prevBtn = document.querySelector('.prev-image');
    const nextBtn = document.querySelector('.next-image');
    let currentImageIndex = 0;
    const galleryImages = document.querySelectorAll('.imagen-galeria');

    // Estilo para el modal
    const style = document.createElement('style');
    style.textContent = `
        .zoom-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            overflow: hidden;
        }
        .zoom-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #zoomImage {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            transform-origin: center;
            transition: transform 0.1s ease-out;
        }
        .close-zoom, .prev-image, .next-image {
            position: absolute;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            padding: 15px;
            cursor: pointer;
            font-size: 20px;
            border-radius: 50%;
        }
        .close-zoom { top: 20px; right: 20px; }
        .prev-image { left: 20px; top: 50%; transform: translateY(-50%); }
        .next-image { right: 20px; top: 50%; transform: translateY(-50%); }
        .zoom-controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
        }
        .zoom-controls button {
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // Eventos para imágenes de galería
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
        resetZoom();
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

    // Navegación entre imágenes
    prevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        zoomImage.src = galleryImages[currentImageIndex].src;
        resetZoom();
    });

    nextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        zoomImage.src = galleryImages[currentImageIndex].src;
        resetZoom();
    });

    // Eventos táctiles
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

    zoomContainer.addEventListener('touchend', () => {
        isZooming = false;
    });

    // Eventos de mouse
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

    // Cerrar zoom
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') modal.style.display = 'none';
            if (e.key === 'ArrowLeft') prevBtn.click();
            if (e.key === 'ArrowRight') nextBtn.click();
        }
    });
});
