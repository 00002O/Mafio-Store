// detector de dispositivo (pc + móvil)
   // por dani




document.addEventListener('DOMContentLoaded', () => {
    const isMobile = {
        Android: () => navigator.userAgent.match(/Android/i),
        iOS: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),
        Opera: () => navigator.userAgent.match(/Opera Mini/i),
        Windows: () => navigator.userAgent.match(/IEMobile/i),
        any: function() {
            return (this.Android() || this.iOS() || this.Opera() || this.Windows());
        }
    };

    const deviceType = isMobile.any() ? 'mobile' : 'desktop';
    document.body.classList.add(deviceType);

    // Ajustes específicos para móvil
    if (deviceType === 'mobile') {
        // Ajustar tamaño de fuentes
        document.documentElement.style.setProperty('--base-font-size', '14px');
        
        // Habilitar scroll horizontal en productos
        const productosContainer = document.querySelector('.fila');
        if (productosContainer) {
            productosContainer.style.overflowX = 'auto';
            productosContainer.style.scrollSnapType = 'x mandatory';
        }

        // Ajustar galería para móvil
        const galleryImages = document.querySelectorAll('.imagen-galeria');
        galleryImages.forEach(img => {
            img.style.width = '150px';
            img.style.height = '150px';
        });

        // Optimizar formulario para móvil
        const form = document.getElementById('formulario-envio');
        if (form) {
            form.querySelectorAll('input').forEach(input => {
                input.style.fontSize = '16px'; // Prevenir zoom en iOS
            });
        }

        // Configuración del nav para móviles
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.position = 'sticky';
            nav.style.top = '0';
            nav.style.zIndex = '1000';
            nav.style.width = '100%';
            nav.style.backgroundColor = '#222';
            nav.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
            nav.style.transform = 'translateZ(0)';
            nav.style.webkitTransform = 'translateZ(0)';
            nav.style.willChange = 'transform';
            
            // Ajustar el contenedor para evitar el corte del shadow
            const navContainer = document.createElement('div');
            navContainer.style.position = 'relative';
            navContainer.style.zIndex = '1000';
            navContainer.style.paddingBottom = '1px';
            nav.parentNode.insertBefore(navContainer, nav);
            navContainer.appendChild(nav);
        }

        // Resto del código para móviles
        let isScrolling = false;
        let startX;
        let scrollLeft;

        nav.addEventListener('touchstart', (e) => {
            if (e.target.closest('.imagen-galeria')) return; // No interferir con imágenes de galería
            isScrolling = true;
            startX = e.touches[0].pageX - nav.offsetLeft;
            scrollLeft = nav.scrollLeft;
        });

        nav.addEventListener('touchmove', (e) => {
            if (!isScrolling || e.target.closest('.imagen-galeria')) return;
            e.preventDefault();
            const x = e.touches[0].pageX - nav.offsetLeft;
            const walk = (x - startX) * 2;
            nav.scrollLeft = scrollLeft - walk;
        });

        nav.addEventListener('touchend', () => {
            isScrolling = false;
        });

        // Añadir indicador visual de desplazamiento
        const addScrollIndicator = () => {
            const hasScroll = nav.scrollWidth > nav.clientWidth;
            nav.classList.toggle('has-scroll', hasScroll);
        };

        window.addEventListener('resize', addScrollIndicator);
        addScrollIndicator();

        // Optimizar galería para móvil
        const gallery = document.querySelector('.grid-gallery');
        if (gallery) {
            const images = gallery.querySelectorAll('img');
            images.forEach(img => {
                img.loading = 'lazy';
                img.style.touchAction = 'none'; // Mejorar gestos táctiles
                
                // Prevenir zoom del navegador
                img.addEventListener('touchstart', (e) => {
                    if (e.touches.length > 1) {
                        e.preventDefault();
                    }
                }, { passive: false });
            });

            // Mejorar rendimiento del scroll
            gallery.style.webkitOverflowScrolling = 'touch';
            gallery.style.willChange = 'transform';
        }

        // Ajustar el zoom para móviles
        if (typeof initializeZoom === 'function') {
            const zoomOptions = {
                maxZoom: 3,
                doubleTapDelay: 300,
                animationDuration: 200,
                dragInertia: true
            };
            
            window.addEventListener('load', () => {
                initializeZoom(zoomOptions);
            });
        }

        // Añadir control de visibilidad del nav al hacer scroll
        let lastScrollTop = 0;
        const headerHeight = document.querySelector('header').offsetHeight;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Determinar dirección del scroll
            if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
                // Scrolling down - ocultar nav
                nav.style.transform = 'translateY(-100%)';
                nav.style.transition = 'transform 0.3s ease-in-out';
            } else {
                // Scrolling up - mostrar nav
                nav.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        }, { passive: true });
    } else {
        // Ajustes específicos para desktop
        document.documentElement.style.setProperty('--base-font-size', '16px');
        
        // Mejorar hover effects solo en desktop
        const productos = document.querySelectorAll('.producto');
        productos.forEach(producto => {
            producto.addEventListener('mouseenter', () => {
                producto.style.transform = 'translateY(-10px)';
            });
            producto.addEventListener('mouseleave', () => {
                producto.style.transform = 'translateY(0)';
            });
        });

        // Ocultar scrollbars en desktop pero mantener funcionalidad
        const style = document.createElement('style');
        style.textContent = `
            .fila::-webkit-scrollbar {
                display: none;
            }
            .fila {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `;
        document.head.appendChild(style);
    }

    // Función para manejar la orientación en móviles
    window.addEventListener('orientationchange', () => {
        if (deviceType === 'mobile') {
            // Ajustar layout según la orientación
            const isLandscape = window.orientation === 90 || window.orientation === -90;
            const gridColumns = isLandscape ? '3' : '2';
            document.documentElement.style.setProperty('--grid-columns', gridColumns);
        }
    });

    // Añadir variables CSS personalizadas
    const cssVars = `
        :root {
            --base-font-size: ${deviceType === 'mobile' ? '14px' : '16px'};
            --grid-columns: ${deviceType === 'mobile' ? '2' : '4'};
            --content-width: ${deviceType === 'mobile' ? '100%' : '90%'};
            --header-height: ${deviceType === 'mobile' ? '60px' : '80px'};
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = cssVars;
    document.head.appendChild(styleSheet);

    // Función para recargar ajustes en cambio de tamaño de ventana
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newDeviceType = window.innerWidth <= 768 ? 'mobile' : 'desktop';
            if (newDeviceType !== deviceType) {
                location.reload();
            }
        }, 250);
    });

    // Menú hamburguesa
    if (deviceType === 'desktop') {
        const menuBtn = document.querySelector('.hamburger-btn');
        const menuContenido = document.querySelector('.menu-contenido');
        const modalProblema = document.getElementById('modalProblema');
        const reportarProblema = document.getElementById('reportarProblema');
        const cerrarModal = document.querySelector('.cerrar-modal');

        if (menuBtn && menuContenido) {
            menuBtn.style.display = 'block';

            // Asegurar que el botón tenga contenido inicial
            menuBtn.innerHTML = '☰';

            menuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                menuContenido.classList.toggle('activo');
                menuBtn.innerHTML = menuContenido.classList.contains('activo') ? '✕' : '☰';
            });

            // Cerrar al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!menuContenido.contains(e.target) && !menuBtn.contains(e.target)) {
                    menuContenido.classList.remove('activo');
                    menuBtn.innerHTML = '☰';
                }
            });

            if (reportarProblema && modalProblema && cerrarModal) {
                reportarProblema.addEventListener('click', (e) => {
                    e.preventDefault();
                    modalProblema.style.display = 'block';
                    menuContenido.classList.remove('activo');
                    menuBtn.innerHTML = '☰';
                });

                cerrarModal.addEventListener('click', () => {
                    modalProblema.style.display = 'none';
                });

                window.addEventListener('click', (e) => {
                    if (e.target === modalProblema) {
                        modalProblema.style.display = 'none';
                    }
                });
            }
        }
    } else {
        // Ocultar menú en móviles
        document.querySelectorAll('.menu-hamburguesa, .hamburger-btn, .menu-contenido').forEach(el => {
            if (el) el.style.display = 'none';
        });
    }

    // Funcionalidad de búsqueda
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const productos = document.querySelectorAll('.producto');

        productos.forEach(producto => {
            const titulo = producto.querySelector('h3').textContent.toLowerCase();
            const descripcion = producto.querySelector('p').textContent.toLowerCase();
            
            if (titulo.includes(searchTerm) || descripcion.includes(searchTerm)) {
                producto.style.display = '';
                producto.style.opacity = '1';
            } else {
                producto.style.opacity = '0';
                setTimeout(() => {
                    producto.style.display = 'none';
                }, 300);
            }
        });
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});
   