document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const productosContainer = document.querySelector('.productos-container');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const productos = document.querySelectorAll('.producto');

        productos.forEach(producto => {
            const titulo = producto.querySelector('h2').textContent.toLowerCase();
            const detalles = producto.querySelector('.detalles').textContent.toLowerCase();
            
            if (titulo.includes(searchTerm) || detalles.includes(searchTerm)) {
                producto.style.display = '';
                producto.style.opacity = '1';
            } else {
                producto.style.opacity = '0';
                setTimeout(() => {
                    producto.style.display = 'none';
                }, 300);
            }
        });

        // Si no hay resultados, mostrar mensaje
        const productosVisibles = document.querySelectorAll('.producto[style="display: "]');
        const mensajeNoResultados = document.getElementById('no-results');
        
        if (productosVisibles.length === 0) {
            if (!mensajeNoResultados) {
                const mensaje = document.createElement('div');
                mensaje.id = 'no-results';
                mensaje.style.textAlign = 'center';
                mensaje.style.padding = '20px';
                mensaje.style.width = '100%';
                mensaje.innerHTML = 'No se encontraron productos que coincidan con la búsqueda.';
                productosContainer.appendChild(mensaje);
            }
        } else if (mensajeNoResultados) {
            mensajeNoResultados.remove();
        }
    }

    // Event listeners
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Reset search cuando el input esté vacío
    searchInput.addEventListener('input', () => {
        if (searchInput.value === '') {
            document.querySelectorAll('.producto').forEach(producto => {
                producto.style.display = '';
                producto.style.opacity = '1';
            });
            const mensajeNoResultados = document.getElementById('no-results');
            if (mensajeNoResultados) {
                mensajeNoResultados.remove();
            }
        }
    });
});
