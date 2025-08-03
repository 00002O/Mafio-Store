(() => {
    // Crear el modal viewer si no existe
    if (!document.getElementById('imageModal')) {
        const modalViewer = document.createElement('div');
        modalViewer.innerHTML = `
            <div id="imageModal" class="modal-viewer" style="display: none;">
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <div class="zoom-container">
                        <img id="zoomImage" src="" alt="Zoom view">
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalViewer);
    }

    // Agregar estilos si no existen
    if (!document.getElementById('zoom-styles')) {
        const styles = document.createElement('style');
        styles.id = 'zoom-styles';
        styles.textContent = `
            .modal-viewer {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.9);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .modal-content {
                position: relative;
                width: 90%;
                height: 90%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .zoom-container {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }
            
            #zoomImage {
                max-height: 90vh;
                max-width: 90vw;
                object-fit: contain;
                transform-origin: center;
                transition: transform 0.1s ease-out;
            }

            @media (hover: hover) {
                .zoom-container::-webkit-scrollbar {
                    display: none;
                }
            }
            
            .close-btn {
                position: absolute;
                top: 20px;
                right: 20px;
                color: white;
                font-size: 35px;
                cursor: pointer;
                z-index: 1001;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0,0,0,0.5);
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .close-btn:hover {
                background: rgba(255,255,255,0.2);
            }
        `;
        document.head.appendChild(styles);
    }

    const modal = document.getElementById('imageModal');
    const zoomImage = document.getElementById('zoomImage');
    const closeBtn = modal.querySelector('.close-btn');
    let scale = 1;
    let panning = false;
    let pointX = 0;
    let pointY = 0;
    let start = { x: 0, y: 0 };

    // Reinicializar event listeners para las imágenes de la galería
    document.querySelectorAll('.imagen-galeria').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
            modal.style.display = 'flex';
            zoomImage.src = e.target.src;
            scale = 1;
            zoomImage.style.transform = 'translate(0,0) scale(1)';
        });
    });

    function updateTransform() {
        zoomImage.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }

    zoomImage.addEventListener('mousedown', (e) => {
        e.preventDefault();
        start = { x: e.clientX - pointX, y: e.clientY - pointY };
        panning = true;
    });

    document.addEventListener('mousemove', (e) => {
        if (!panning) return;
        pointX = (e.clientX - start.x);
        pointY = (e.clientY - start.y);
        updateTransform();
    });

    document.addEventListener('mouseup', () => {
        panning = false;
    });

    zoomImage.addEventListener('wheel', (e) => {
        e.preventDefault();
        const xs = (e.clientX - pointX) / scale;
        const ys = (e.clientY - pointY) / scale;
        const delta = e.deltaY > 0 ? 0.8 : 1.2;
        scale *= delta;
        scale = Math.min(Math.max(1, scale), 4);
        
        pointX = e.clientX - xs * scale;
        pointY = e.clientY - ys * scale;
        updateTransform();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        scale = 1;
        pointX = 0;
        pointY = 0;
        updateTransform();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            scale = 1;
            pointX = 0;
            pointY = 0;
            updateTransform();
        }
    });

    // Soporte para dispositivos móviles
    let lastTouchDistance = 0;

    zoomImage.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            lastTouchDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
        }
    });

    zoomImage.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const distance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            const delta = distance / lastTouchDistance;
            lastTouchDistance = distance;
            scale *= delta;
            scale = Math.min(Math.max(1, scale), 4);
            updateTransform();
        }
    });
})();
