const products = [
  { id: 1, name: 'Kit Chaveiro de Alarme Rosa', price: 79.9, category: 'kits', image: 'images/3617ef32-8d89-4b3a-b976-4393631a73fd-removebg-preview.png', buttonClass: 'btn-pink' },
  { id: 2, name: 'Kit Chaveiro de Alarme Lilás', price: 79.9, category: 'kits', image: 'images/5e24811a-592e-4d5b-9da9-c0c66251af8d-removebg-preview.png', buttonClass: 'btn-lilac' },
  { id: 3, name: 'Kit Chaveiro de Alarme Preto', price: 79.9, category: 'kits', image: 'images/89a9155f-86fa-416a-bd2a-d9e96837c311-removebg-preview.png', buttonClass: 'btn-black' },
  { id: 4, name: 'Kit Chaveiro de Alarme Azul', price: 79.9, category: 'kits', image: 'images/image-removebg-preview.png', buttonClass: 'btn-blue' },
  { id: 5, name: 'Kit Chaveiro de Alarme Vermelho', price: 79.9, category: 'kits', image: 'images/3298c07f-c35f-46da-b564-27736ec2d5f3-removebg-preview.png', buttonClass: 'btn-red' },
  { id: 6, name: 'Kit Chaveiro de Alarme Roxo', price: 79.9, category: 'kits', image: 'images/83cde04b-d297-4867-b043-b4a291f3b7c2-removebg-preview.png', buttonClass: 'btn-purple' }
];

const state = {
  cart: JSON.parse(localStorage.getItem('elasCart')) || {},
  favorites: JSON.parse(localStorage.getItem('elasFavorites')) || [],
  query: '',
  category: 'all'
};

const productGrid = document.getElementById('productGrid');
const cartCount = document.getElementById('cartCount');
const cartBtn = document.getElementById('cartBtn');
const favoritesBtn = document.getElementById('favoritesBtn');
const cartSidebar = document.getElementById('cartSidebar');
const favoritesSidebar = document.getElementById('favoritesSidebar');
const closeCartBtn = document.getElementById('closeCartBtn');
const closeFavoritesBtn = document.getElementById('closeFavoritesBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const favoritesItemsContainer = document.getElementById('favoritesItemsContainer');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const clearFilter = document.getElementById('clearFilter');
const newsletterForm = document.getElementById('newsletterForm');
const newsletterEmail = document.getElementById('newsletterEmail');
const newsletterFeedback = document.getElementById('newsletterFeedback');
const toast = document.getElementById('toast');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const loadingScreen = document.getElementById('loadingScreen');

function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function saveState() {
  localStorage.setItem('elasCart', JSON.stringify(state.cart));
  localStorage.setItem('elasFavorites', JSON.stringify(state.favorites));
}

function getCartTotal() {
  return Object.values(state.cart).reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
}

function updateCartCount() {
  const totalItems = Object.values(state.cart).reduce((sum, entry) => sum + entry.quantity, 0);
  cartCount.textContent = totalItems;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

function renderProducts() {
  const filtered = products.filter(product => {
    const matchesCategory = state.category === 'all' || product.category === state.category;
    const matchesQuery = product.name.toLowerCase().includes(state.query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  productGrid.innerHTML = filtered.map(product => {
    const isFavorite = state.favorites.includes(product.id);
    return `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80'" />
        <div class="product-meta">
          <h3>${product.name}</h3>
          <span>${formatPrice(product.price)}</span>
        </div>
        <div class="product-actions">
          <button class="btn ${product.buttonClass}" data-id="${product.id}" type="button">Adicionar ao carrinho</button>
          <button class="favorite-toggle ${isFavorite ? 'active' : ''}" data-fav="${product.id}" aria-label="Adicionar aos favoritos">
            <img src="icons/heart.svg" alt="Favorito" />
          </button>
        </div>
      </article>`;
  }).join('');

  document.querySelectorAll('.product-card button.btn').forEach(button => {
    button.addEventListener('click', () => addToCart(Number(button.dataset.id)));
  });

  document.querySelectorAll('.favorite-toggle').forEach(button => {
    button.addEventListener('click', () => toggleFavorite(Number(button.dataset.fav)));
  });
}

function renderCart() {
  const entries = Object.values(state.cart);

  if (!entries.length) {
    cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio. Adicione produtos e continue segura.</p>';
  } else {
    cartItemsContainer.innerHTML = entries.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>${formatPrice(item.price)} x ${item.quantity}</p>
          <div class="quantity-control">
            <button data-action="decrease" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
            <button data-action="increase" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
            <button data-action="remove" data-id="${item.id}" aria-label="Remover item">Remover</button>
          </div>
        </div>
      </div>`).join('');
  }

  cartTotal.textContent = formatPrice(getCartTotal());

  cartItemsContainer.querySelectorAll('button[data-action]').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const id = Number(button.dataset.id);
      if (action === 'increase') updateQuantity(id, 1);
      if (action === 'decrease') updateQuantity(id, -1);
      if (action === 'remove') removeFromCart(id);
    });
  });
}

function renderFavorites() {
  const favoriteItems = products.filter(product => state.favorites.includes(product.id));
  if (!favoriteItems.length) {
    favoritesItemsContainer.innerHTML = '<p>Você ainda não adicionou favoritos. Clique no coração em um produto para salvar.</p>';
    return;
  }

  favoritesItemsContainer.innerHTML = favoriteItems.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p>${formatPrice(item.price)}</p>
        <div class="quantity-control">
          <button data-action="add" data-id="${item.id}" aria-label="Adicionar ao carrinho">+</button>
          <button data-action="removeFav" data-id="${item.id}" aria-label="Remover dos favoritos">Remover</button>
        </div>
      </div>
    </div>`).join('');

  favoritesItemsContainer.querySelectorAll('button[data-action]').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const id = Number(button.dataset.id);
      if (action === 'add') {
        addToCart(id);
        showToast('Produto adicionado ao carrinho');
      }
      if (action === 'removeFav') {
        removeFavorite(id);
      }
    });
  });
}

function openFavorites() {
  favoritesSidebar.classList.add('open');
  favoritesSidebar.setAttribute('aria-hidden', 'false');
  cartSidebar.classList.remove('open');
  cartSidebar.setAttribute('aria-hidden', 'true');
  renderFavorites();
}

function closeFavorites() {
  favoritesSidebar.classList.remove('open');
  favoritesSidebar.setAttribute('aria-hidden', 'true');
}

function removeFavorite(productId) {
  const index = state.favorites.indexOf(productId);
  if (index !== -1) {
    state.favorites.splice(index, 1);
    saveState();
    renderProducts();
    renderFavorites();
    showToast('Produto removido dos favoritos');
  }
}

function finalizePurchase() {
  if (!Object.keys(state.cart).length) {
    showToast('Seu carrinho está vazio. Adicione um produto para finalizar.');
    return;
  }
  openCheckout();
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;

  if (state.cart[productId]) {
    state.cart[productId].quantity += 1;
  } else {
    state.cart[productId] = { ...product, quantity: 1 };
  }

  saveState();
  updateCartCount();
  renderCart();
  showToast(`${product.name} adicionado ao carrinho`);
}

function updateQuantity(productId, delta) {
  if (!state.cart[productId]) return;
  state.cart[productId].quantity += delta;
  if (state.cart[productId].quantity < 1) {
    delete state.cart[productId];
  }
  saveState();
  updateCartCount();
  renderCart();
}

function removeFromCart(productId) {
  delete state.cart[productId];
  saveState();
  updateCartCount();
  renderCart();
}

function toggleFavorite(productId) {
  const index = state.favorites.indexOf(productId);
  if (index === -1) {
    state.favorites.push(productId);
    showToast('Produto adicionado aos favoritos');
  } else {
    state.favorites.splice(index, 1);
    showToast('Produto removido dos favoritos');
  }
  saveState();
  renderProducts();
}

function openCart() {
  cartSidebar.classList.add('open');
  cartSidebar.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  cartSidebar.classList.remove('open');
  cartSidebar.setAttribute('aria-hidden', 'true');
}

function applyFilters() {
  state.query = searchInput.value.trim();
  state.category = categoryFilter.value;
  renderProducts();
}

searchInput.addEventListener('input', () => {
  applyFilters();
});

searchBtn.addEventListener('click', e => {
  e.preventDefault();
  applyFilters();
});

categoryFilter.addEventListener('change', applyFilters);
clearFilter.addEventListener('click', () => {
  categoryFilter.value = 'all';
  searchInput.value = '';
  state.query = '';
  state.category = 'all';
  renderProducts();
});

cartBtn.addEventListener('click', openCart);
favoritesBtn.addEventListener('click', openFavorites);
closeCartBtn.addEventListener('click', closeCart);
closeFavoritesBtn.addEventListener('click', closeFavorites);
checkoutBtn.addEventListener('click', finalizePurchase);

menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});

newsletterForm.addEventListener('submit', event => {
  event.preventDefault();
  const email = newsletterEmail.value.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!validEmail.test(email)) {
    newsletterFeedback.textContent = 'Digite um e-mail válido para receber a oferta.';
    newsletterFeedback.style.color = '#b6174b';
    return;
  }
  newsletterFeedback.textContent = 'Obrigada! Seu desconto foi reservado no e-mail informado.';
  newsletterFeedback.style.color = '#6c2751';
  newsletterEmail.value = '';
});

window.addEventListener('click', event => {
  if (!cartSidebar.contains(event.target) && !cartBtn.contains(event.target) && cartSidebar.classList.contains('open')) {
    closeCart();
  }
});

/* ========== CHECKOUT FUNCTIONALITY ========== */

const checkoutOverlay = document.getElementById('checkoutOverlay');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutBtn = document.getElementById('closeCheckout');
const successSection = document.getElementById('successSection');
const closeSuccessBtn = document.getElementById('closeSuccess');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');

const checkoutState = {
  currentStep: 1,
  shippingCost: 15.90,
  personalData: {},
  shippingData: {},
  paymentData: {}
};

const shippingCosts = {
  pac: 15.90,
  sedex: 35.90,
  express: 65.90
};

// Input Masks
function applyMask(input, mask) {
  input.addEventListener('input', function() {
    let value = this.value.replace(/\D/g, '');
    
    if (mask === 'phone') {
      value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (mask === 'cpf') {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (mask === 'cep') {
      value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
    } else if (mask === 'card') {
      value = value.replace(/(\d{4})/g, '$1 ').trim();
    } else if (mask === 'expiry') {
      value = value.replace(/(\d{2})(\d{2})/, '$1/$2');
    } else if (mask === 'cvv') {
      value = value.substring(0, 3);
    }
    
    this.value = value;
  });
}

// Initialize Masks
function initializeMasks() {
  const phoneInput = document.getElementById('phone');
  const cpfInput = document.getElementById('cpf');
  const cepInput = document.getElementById('cep');
  const cardNumberInput = document.getElementById('cardNumber');
  const cardExpiryInput = document.getElementById('cardExpiry');
  const cardCvvInput = document.getElementById('cardCvv');

  if (phoneInput) applyMask(phoneInput, 'phone');
  if (cpfInput) applyMask(cpfInput, 'cpf');
  if (cepInput) applyMask(cepInput, 'cep');
  if (cardNumberInput) applyMask(cardNumberInput, 'card');
  if (cardExpiryInput) applyMask(cardExpiryInput, 'expiry');
  if (cardCvvInput) applyMask(cardCvvInput, 'cvv');
}

function openCheckout() {
  closeCart();
  checkoutOverlay.classList.add('active');
  checkoutModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  checkoutState.currentStep = 1;
  renderCheckoutSection(1);
  initializeMasks();
  updateOrderSummary();
}

function closeCheckout() {
  checkoutOverlay.classList.remove('active');
  checkoutModal.classList.remove('active');
  document.body.style.overflow = '';
}

function renderCheckoutSection(step) {
  // Hide all sections
  document.querySelectorAll('.checkout-section').forEach(section => {
    section.classList.remove('active');
  });

  // Show current section
  const activeSection = document.querySelector(`.checkout-section[data-section="${step}"]`);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Update progress bar
  document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
    stepEl.classList.remove('active', 'completed');
    if (index + 1 === step) {
      stepEl.classList.add('active');
    } else if (index + 1 < step) {
      stepEl.classList.add('completed');
    }
  });

  checkoutState.currentStep = step;

  if (step === 4) {
    updateOrderSummary();
  }
}

function validateStep(step) {
  const fields = {
    1: ['fullName', 'email', 'phone', 'cpf'],
    2: ['cep', 'street', 'number', 'neighborhood', 'city', 'state'],
    3: []
  };

  const fieldsToValidate = fields[step] || [];
  let isValid = true;

  fieldsToValidate.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const value = field.value.trim();
    const errorMsg = field.parentElement.querySelector('.error-msg');

    if (!value) {
      field.parentElement.classList.add('error');
      if (errorMsg) errorMsg.textContent = 'Este campo é obrigatório';
      isValid = false;
    } else {
      field.parentElement.classList.remove('error');
      if (errorMsg) errorMsg.textContent = '';

      // Validações específicas
      if (fieldId === 'email' && !isValidEmail(value)) {
        field.parentElement.classList.add('error');
        if (errorMsg) errorMsg.textContent = 'E-mail inválido';
        isValid = false;
      }
      if (fieldId === 'cpf' && !isValidCPF(value)) {
        field.parentElement.classList.add('error');
        if (errorMsg) errorMsg.textContent = 'CPF inválido';
        isValid = false;
      }
      if (fieldId === 'cep' && value.replace(/\D/g, '').length !== 8) {
        field.parentElement.classList.add('error');
        if (errorMsg) errorMsg.textContent = 'CEP inválido';
        isValid = false;
      }
    }
  });

  if (step === 3) {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethod) {
      showToast('Selecione uma forma de pagamento');
      isValid = false;
    } else if (paymentMethod.value === 'credit' || paymentMethod.value === 'debit') {
      const cardFields = ['cardNumber', 'cardName', 'cardExpiry', 'cardCvv'];
      cardFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && field.style.display !== 'none') {
          const value = field.value.trim();
          if (!value) {
            field.parentElement.classList.add('error');
            isValid = false;
          }
        }
      });
    }
  }

  return isValid;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false;
  
  return true;
}

// Navigation
document.querySelectorAll('.btn-next').forEach(btn => {
  btn.addEventListener('click', () => {
    const nextStep = parseInt(btn.dataset.next);
    if (validateStep(checkoutState.currentStep)) {
      saveCheckoutData(checkoutState.currentStep);
      renderCheckoutSection(nextStep);
    }
  });
});

document.querySelectorAll('.btn-back').forEach(btn => {
  btn.addEventListener('click', () => {
    const backStep = parseInt(btn.dataset.back);
    renderCheckoutSection(backStep);
  });
});

function saveCheckoutData(step) {
  if (step === 1) {
    checkoutState.personalData = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      cpf: document.getElementById('cpf').value
    };
  } else if (step === 2) {
    checkoutState.shippingData = {
      cep: document.getElementById('cep').value,
      street: document.getElementById('street').value,
      number: document.getElementById('number').value,
      complement: document.getElementById('complement').value,
      neighborhood: document.getElementById('neighborhood').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      method: document.querySelector('input[name="shippingMethod"]:checked').value
    };
    
    const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked').value;
    checkoutState.shippingCost = shippingCosts[shippingMethod];
  } else if (step === 3) {
    checkoutState.paymentData = {
      method: document.querySelector('input[name="paymentMethod"]:checked').value
    };
  }
}

// Payment Method Toggle
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const cardFields = document.getElementById('cardFields');
    if (radio.value === 'credit' || radio.value === 'debit') {
      cardFields.style.display = 'block';
      document.getElementById('installmentsSection').style.display = radio.value === 'credit' ? 'block' : 'none';
    } else {
      cardFields.style.display = 'none';
    }
  });
});

// Shipping Method Change
document.querySelectorAll('input[name="shippingMethod"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('.shipping-option').forEach(option => {
      option.classList.remove('active');
    });
    radio.parentElement.classList.add('active');
    updateOrderSummary();
  });
});

function updateOrderSummary() {
  const subtotal = getCartTotal();
  const selectedShipping = document.querySelector('input[name="shippingMethod"]:checked');
  const shippingMethod = selectedShipping ? selectedShipping.value : 'pac';
  const shippingCost = shippingCosts[shippingMethod];
  const total = subtotal + shippingCost;

  // Update Section 4 (Confirmation)
  const cartItems = Object.values(state.cart);
  const orderItemsContainer = document.getElementById('orderItems');
  
  orderItemsContainer.innerHTML = cartItems.map(item => `
    <div class="order-item">
      <div class="order-item-info">
        <img src="${item.image}" alt="${item.name}" class="order-item-image" onerror="this.src='https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80'" />
        <div class="order-item-details">
          <h4>${item.name}</h4>
          <p>Quantidade: ${item.quantity}</p>
        </div>
      </div>
      <div class="order-item-price">${formatPrice(item.price * item.quantity)}</div>
    </div>
  `).join('');

  document.getElementById('summarySubtotal').textContent = formatPrice(subtotal);
  document.getElementById('summaryShipping').textContent = formatPrice(shippingCost);
  document.getElementById('summaryTotal').textContent = formatPrice(total);

  // Update delivery address
  if (Object.keys(checkoutState.shippingData).length > 0) {
    const addr = checkoutState.shippingData;
    document.getElementById('deliveryAddress').textContent = 
      `${addr.street}, ${addr.number}${addr.complement ? ' - ' + addr.complement : ''}\n${addr.neighborhood}, ${addr.city} - ${addr.state}\nCEP: ${addr.cep}`;
  }

  // Update shipping method display
  const methodLabels = {
    pac: 'PAC (Econômico) - 10-15 dias',
    sedex: 'Sedex (Rápido) - 3-5 dias',
    express: 'Entrega Expressa - 1-2 dias'
  };
  document.getElementById('shippingMethod').textContent = methodLabels[shippingMethod] || 'PAC (Econômico)';

  // Update payment method display
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
  if (paymentMethod) {
    const paymentLabels = {
      pix: 'PIX',
      credit: 'Cartão de Crédito',
      debit: 'Cartão de Débito',
      boleto: 'Boleto'
    };
    document.getElementById('paymentMethodDisplay').textContent = paymentLabels[paymentMethod.value] || 'PIX';
  }
}

// Confirm Order
confirmOrderBtn.addEventListener('click', async () => {
  saveCheckoutData(3);
  
  if (!validateStep(3)) return;

  // Show loading
  const originalText = confirmOrderBtn.textContent;
  confirmOrderBtn.disabled = true;
  confirmOrderBtn.textContent = 'Processando...';

  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Generate order number and dates
  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  const today = new Date();
  const deliveryDate = new Date(today.getTime() + (Math.random() * 10 + 5) * 24 * 60 * 60 * 1000);

  // Save to localStorage
  const order = {
    orderNumber,
    date: today.toLocaleDateString('pt-BR'),
    deliveryDate: deliveryDate.toLocaleDateString('pt-BR'),
    personalData: checkoutState.personalData,
    shippingData: checkoutState.shippingData,
    paymentData: checkoutState.paymentData,
    items: Object.values(state.cart),
    subtotal: getCartTotal(),
    shippingCost: checkoutState.shippingCost,
    total: getCartTotal() + checkoutState.shippingCost
  };

  const orders = JSON.parse(localStorage.getItem('elasOrders')) || [];
  orders.push(order);
  localStorage.setItem('elasOrders', JSON.stringify(orders));

  // Clear cart
  state.cart = {};
  saveState();
  updateCartCount();
  renderCart();

  // Show success section
  document.getElementById('orderNumber').textContent = `#${orderNumber.toString().padStart(6, '0')}`;
  document.getElementById('orderDate').textContent = today.toLocaleDateString('pt-BR');
  document.getElementById('deliveryDate').textContent = deliveryDate.toLocaleDateString('pt-BR');

  renderCheckoutSection(5);

  confirmOrderBtn.disabled = false;
  confirmOrderBtn.textContent = originalText;
});

// Close Checkout
closeCheckoutBtn.addEventListener('click', closeCheckout);
closeSuccessBtn.addEventListener('click', () => {
  closeCheckout();
});
checkoutOverlay.addEventListener('click', closeCheckout);

function initSite() {
  renderProducts();
  renderCart();
  updateCartCount();
  initializeMasks();
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 400);
  }, 600);
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initSite);
} else {
  initSite();
}
