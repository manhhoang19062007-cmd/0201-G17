/* =========================
   DU LIEU GIO HANG
========================= */

let cart = [];

/* =========================
   TIM KIEM SAN PHAM
========================= */

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const productGrid = document.getElementById('product-grid');
const productCards = document.querySelectorAll('.product-card');
const noResult = document.getElementById('no-result');
const searchResultMsg = document.getElementById('search-result-msg');

// Xu ly submit form tim kiem
searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    filterProducts();
});

// Tim kiem theo thoi gian thuc (khi go phim)
searchInput.addEventListener('input', function () {
    filterProducts();
});

function filterProducts() {
    const keyword = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    productCards.forEach(function (card) {
        const name = card.getAttribute('data-name').toLowerCase();
        const desc = card.querySelector('p') ? card.querySelector('p').textContent.toLowerCase() : '';

        if (name.includes(keyword) || desc.includes(keyword)) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    // Hien thi thong bao ket qua
    if (keyword === '') {
        noResult.style.display = 'none';
        searchResultMsg.textContent = '';
    } else if (visibleCount === 0) {
        noResult.style.display = 'block';
        searchResultMsg.textContent = 'Không tìm thấy kết quả cho "' + keyword + '"';
    } else {
        noResult.style.display = 'none';
        searchResultMsg.textContent = 'Tìm thấy ' + visibleCount + ' sản phẩm cho "' + keyword + '"';
    }

    // Reset danh muc ve "Tat ca"
    document.querySelectorAll('.category-menu a').forEach(function (a) {
        a.classList.remove('active');
    });
    document.querySelector('.category-menu a[data-category="all"]').classList.add('active');
}


/* =========================
   LOC THEO DANH MUC
========================= */

const categoryLinks = document.querySelectorAll('.category-menu a');

categoryLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        // Xoa tu khoa tim kiem khi chon danh muc
        searchInput.value = '';
        searchResultMsg.textContent = '';
        noResult.style.display = 'none';

        // Doi trang thai active
        categoryLinks.forEach(function (a) {
            a.classList.remove('active');
        });
        this.classList.add('active');

        const category = this.getAttribute('data-category');

        productCards.forEach(function (card) {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });

        // Cuon xuong phan san pham
        document.getElementById('san-pham').scrollIntoView({ behavior: 'smooth' });
    });
});


/* =========================
   GIO HANG - TOGGLE MO/DONG
========================= */

const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');

function toggleCart() {
    cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('open');
}


/* =========================
   GIO HANG - THEM SAN PHAM
========================= */

function addToCart(name, price, image) {
    // Kiem tra san pham da co trong gio chua
    const existingItem = cart.find(function (item) {
        return item.name === name;
    });

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    updateCart();
    showToast('Đã thêm "' + name + '" vào giỏ hàng!');
}


/* =========================
   GIO HANG - CAP NHAT GIAO DIEN
========================= */

function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartEmpty = document.getElementById('cart-empty');

    // Tinh tong so luong
    let totalQty = 0;
    let totalPrice = 0;

    cart.forEach(function (item) {
        totalQty += item.quantity;
        totalPrice += item.price * item.quantity;
    });

    // Cap nhat so luong tren icon
    cartCount.textContent = totalQty;

    // Cap nhat tong tien
    cartTotalPrice.textContent = formatPrice(totalPrice);

    // Xoa noi dung cu (giu lai cart-empty)
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'cart-empty';
        emptyMsg.id = 'cart-empty';
        emptyMsg.textContent = 'Giỏ hàng trống.';
        cartItemsContainer.appendChild(emptyMsg);
        return;
    }

    // Tao HTML cho tung san pham
    cart.forEach(function (item, index) {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';

        cartItemDiv.innerHTML =
            '<img src="' + item.image + '" alt="' + item.name + '">' +
            '<div class="cart-item-info">' +
                '<h4>' + item.name + '</h4>' +
                '<span class="cart-item-price">' + formatPrice(item.price * item.quantity) + '</span>' +
            '</div>' +
            '<div class="cart-item-qty">' +
                '<button onclick="changeQty(' + index + ', -1)">−</button>' +
                '<span>' + item.quantity + '</span>' +
                '<button onclick="changeQty(' + index + ', 1)">+</button>' +
            '</div>' +
            '<button class="cart-item-remove" onclick="removeItem(' + index + ')" title="Xóa">🗑️</button>';

        cartItemsContainer.appendChild(cartItemDiv);
    });

    // Luu vao localStorage
    saveCart();
}


/* =========================
   GIO HANG - TANG/GIAM SO LUONG
========================= */

function changeQty(index, delta) {
    cart[index].quantity += delta;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCart();
}


/* =========================
   GIO HANG - XOA 1 MON
========================= */

function removeItem(index) {
    const name = cart[index].name;
    cart.splice(index, 1);
    updateCart();
    showToast('Đã xóa "' + name + '" khỏi giỏ hàng.');
}


/* =========================
   GIO HANG - XOA TAT CA
========================= */

function clearCart() {
    if (cart.length === 0) return;

    if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
        cart = [];
        updateCart();
        showToast('Đã xóa tất cả sản phẩm trong giỏ hàng.');
    }
}


/* =========================
   GIO HANG - DAT HANG
========================= */

function checkout() {
    if (cart.length === 0) {
        showToast('Giỏ hàng trống! Hãy thêm sản phẩm trước.');
        return;
    }

    // Tinh tong tien
    let total = 0;
    let orderSummary = 'Đơn hàng của bạn:\n\n';

    cart.forEach(function (item) {
        total += item.price * item.quantity;
        orderSummary += '• ' + item.name + ' x' + item.quantity + ' = ' + formatPrice(item.price * item.quantity) + '\n';
    });

    orderSummary += '\nTổng cộng: ' + formatPrice(total);
    orderSummary += '\n\nCảm ơn bạn đã đặt hàng tại KFC Việt Nam! 🍗';

    alert(orderSummary);

    // Xoa gio hang sau khi dat
    cart = [];
    updateCart();
    toggleCart();
    showToast('Đặt hàng thành công! Cảm ơn bạn! 🎉');
}


/* =========================
   TOAST THONG BAO
========================= */

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(function () {
        toast.classList.remove('show');
    }, 2500);
}


/* =========================
   DINH DANG GIA TIEN
========================= */

function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}


/* =========================
   LUU & TAI GIO HANG TU LOCALSTORAGE
========================= */

function saveCart() {
    localStorage.setItem('kfc_cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('kfc_cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCart();
    }
}

// Tai gio hang khi mo trang
loadCart();
