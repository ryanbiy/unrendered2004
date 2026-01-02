// Product Data Archive
const products = [
    {
        id: 1,
        name: "unrendered2004 face tee",
        price: "$30.00",
        img: "https://static.wixstatic.com/media/c4e071_f88d1bb1260047d3a7f789e1d1609358~mv2.png"
    },
    {
        id: 2,
        name: "unrendered2004 skull tee",
        price: "$30.00",
        img: "https://static.wixstatic.com/media/c4e071_3ffe40d6c8fb4af2b875fa8312e7a7cc~mv2.png"
    },
    {
        id: 3,
        name: "unrendered2004 limited tee",
        price: "$35.00",
        img: "https://static.wixstatic.com/media/c4e071_edb6858f66af43dcad7c7863f0d506fa~mv2.png"
    },
    {
        id: 4,
        name: "unrendered2004 drop tee",
        price: "$30.00",
        img: "https://static.wixstatic.com/media/c4e071_86f7108026fe416e8bd793b1ce63dc1b~mv2.png"
    },
    {
        id: 5,
        name: "2002 face crew neck",
        price: "$50.00",
        img: "https://static.wixstatic.com/media/c4e071_3046e403eaa842f59909e56b93224ee6~mv2.png"
    },
    {
        id: 6,
        name: "2002 Gas Mask Tee",
        price: "$30.00",
        img: "https://static.wixstatic.com/media/c4e071_b0fc628298b548e0a9fd492ece7cb3cf~mv2.png"
    }
];

let cartContent = [];

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartPanel = document.getElementById('cartPanel');
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const closeLogin = document.getElementById('closeLogin');
const cartCount = document.querySelector('.cart-badge');
const cartItems = document.getElementById('cartItems');
const cartPanelCount = document.getElementById('cartPanelCount');

// Initialize Website
function init() {
    renderProducts();
    setupEventListeners();
    updateCartUI();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Render Product Cards
function renderProducts() {
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${product.img}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price}</p>
                <button class="btn-add" onclick="addToCart(${product.id})">Add to Bag</button>
            </div>
        </div>
    `).join('');
}

// Event Listeners setup
function setupEventListeners() {
    // Cart Toggle
    cartBtn.addEventListener('click', () => cartPanel.classList.add('active'));
    closeCart.addEventListener('click', () => cartPanel.classList.remove('active'));

    // Login Toggle
    loginBtn.addEventListener('click', () => loginModal.classList.add('active'));
    closeLogin.addEventListener('click', () => loginModal.classList.remove('active'));

    // Close on background click
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.classList.remove('active');
        if (e.target === cartPanel) cartPanel.classList.remove('active');
    });
}

// Add to Cart Logic
window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    cartContent.push(product);
    updateCartUI();

    // Open cart as feedback
    cartPanel.classList.add('active');
};

function updateCartUI() {
    const totalItems = cartContent.length;
    cartCount.innerText = totalItems;
    cartCount.setAttribute('data-count', totalItems);
    if (cartPanelCount) cartPanelCount.innerText = totalItems;

    if (cartContent.length === 0) {
        cartItems.innerHTML = `<p style="color: #666; text-align: center; margin-top: 50px;">Your bag is currently empty.</p>`;
    } else {
        cartItems.innerHTML = cartContent.map((item, index) => `
            <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center;">
                <img src="${item.img}" style="width: 60px; height: 80px; object-fit: cover; border: 1px solid #333;">
                <div style="flex-grow: 1;">
                    <div style="font-size: 0.8rem; font-weight: 700;">${item.name}</div>
                    <div style="font-size: 0.8rem; color: #aaa;">${item.price}</div>
                </div>
                <div style="cursor: pointer; color: #ff0000;" onclick="removeFromCart(${index})">✕</div>
            </div>
        `).join('');
    }
}

window.removeFromCart = (index) => {
    cartContent.splice(index, 1);
    updateCartUI();
};

init();
