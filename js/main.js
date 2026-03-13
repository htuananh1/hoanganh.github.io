document.addEventListener('DOMContentLoaded', () => {
    // Load Header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('components/header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
                updateCartCount();
            })
            .catch(error => console.error('Error loading header:', error));
    }

    // Load Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('components/footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
            })
            .catch(error => console.error('Error loading footer:', error));
    }
});

// Mock cart functionality
function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        let count = localStorage.getItem('cartCount') || 3;
        cartCountEl.textContent = count;
    }
}

// Function to call when adding item to cart
function addToCart() {
    let count = parseInt(localStorage.getItem('cartCount') || 3);
    count++;
    localStorage.setItem('cartCount', count);
    updateCartCount();
    alert('Đã thêm sản phẩm vào giỏ hàng!');
}
