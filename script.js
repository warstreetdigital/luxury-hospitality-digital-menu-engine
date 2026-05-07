document.addEventListener('DOMContentLoaded', () => {
    // Brand State
    let currentBrand = null;
    let cart = [];

    // Selectors
    const shutter = document.querySelector('.shutter');
    const brandTitleDisplay = document.getElementById('brand-title-display');
    const brandTaglineDisplay = document.getElementById('brand-tagline-display');
    const heroBgContainer = document.getElementById('hero-bg-container');
    const menuContainer = document.getElementById('menu-container');
    const dynamicNav = document.getElementById('dynamic-nav');
    const outroContainer = document.getElementById('outro-container');
    const audioToggle = document.getElementById('audio-toggle');
    const loungeAudio = document.getElementById('lounge-audio');
    const cartToggle = document.getElementById('cart-toggle');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartClose = document.getElementById('cart-close');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountTotal = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const whatsappOrderBtn = document.getElementById('whatsapp-order');
    const tableNumberInput = document.getElementById('table-number');
    const navBar = document.querySelector('.nav-bar');
    const enterBtn = document.getElementById('enter-btn');

    // Brand Loader
    const loadBrand = async () => {
        const params = new URLSearchParams(window.location.search);
        const brandId = params.get('brand') || 'saints';
        
        try {
            const response = await fetch(`./brands/${brandId}.json`);
            if (!response.ok) throw new Error('Brand not found');
            currentBrand = await response.json();
            applyBranding(currentBrand);
        } catch (error) {
            console.error('Error loading brand:', error);
            // Fallback to Saints if brand logic fails
            if (brandId !== 'saints') window.location.href = '?brand=saints';
        }
    };

    const applyBranding = (brand) => {
        // Document Title
        document.title = `${brand.name} | Luxury Hospitality`;

        // CSS Variables
        const root = document.documentElement;
        root.style.setProperty('--color-gold', brand.theme.gold);
        root.style.setProperty('--color-gold-muted', brand.theme.goldMuted);
        root.style.setProperty('--color-charcoal', brand.theme.charcoal);
        root.style.setProperty('--color-ivory', brand.theme.ivory);

        // Hero and Branding
        if (brandTitleDisplay) brandTitleDisplay.textContent = brand.name;
        if (brandTaglineDisplay) brandTaglineDisplay.textContent = brand.tagline;
        if (brand.hero.image && heroBgContainer) {
            heroBgContainer.style.backgroundImage = `url('${brand.hero.image}')`;
        }
        
        const logoShort = document.getElementById('brand-logo-short');
        if (logoShort) logoShort.textContent = brand.name.split(' ').map(n => n[0]).join('');

        // Audio
        if (brand.audio && loungeAudio) {
            loungeAudio.innerHTML = `<source src="${brand.audio}" type="audio/mpeg">`;
            loungeAudio.load();
        }

        renderNav(brand);
        renderMenu(brand);
        renderOutro(brand);
        
        // Update anchor for CTA button
        if (enterBtn && brand.categories.length > 0) {
            enterBtn.setAttribute('href', `#${brand.categories[0].id}`);
        }

        // Initial Shutter Removal
        setTimeout(() => {
            if (shutter) shutter.classList.add('opened'); // Using 'opened' based on CSS
        }, 800);

        // Start Ambient Audio on user interaction (first click)
        const startAudioOnce = () => {
            if (loungeAudio.paused) {
                loungeAudio.play().then(() => {
                    audioToggle.classList.remove('muted');
                    document.removeEventListener('click', startAudioOnce);
                }).catch(e => console.log('Audio wait for interaction'));
            }
        };
        document.addEventListener('click', startAudioOnce);
    };

    const renderNav = (brand) => {
        if (dynamicNav) {
            dynamicNav.innerHTML = brand.categories.map(cat => `
                <li><a href="#${cat.id}">${cat.name.split(' ')[0]}</a></li>
            `).join('');
        }
    };

    const renderMenu = (brand) => {
        if (menuContainer) {
            menuContainer.innerHTML = brand.categories.map(cat => `
                <section id="${cat.id}" class="menu-section">
                    <div class="section-bg" ${cat.image ? `style="background-image: url('${cat.image}');"` : ''}></div>
                    <div class="section-content">
                        <h2 class="section-title">${cat.name}</h2>
                        <p class="section-tagline">${cat.tagline}</p>
                        <div class="menu-grid">
                            ${cat.items.map(item => `
                                <div class="menu-card" data-name="${item.name}" data-price="${item.price}">
                                    <div class="card-info">
                                        <h3>${item.name}</h3>
                                        ${item.description ? `<p>${item.description}</p>` : ''}
                                    </div>
                                    <div class="card-footer">
                                        <span class="card-price">$${item.price.toFixed(2)}</span>
                                        <button class="add-to-cart">Add to Cart</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>
            `).join('');
            
            observeSections();
        }
    };

    const renderOutro = (brand) => {
        if (outroContainer) {
            outroContainer.innerHTML = `
                <div class="outro-content">
                    <h2 class="outro-title">Every guest deserves another night.</h2>
                    <div class="outro-branding">
                        <span class="outro-logo">${brand.name}</span>
                        <p class="outro-subtitle">${brand.tagline}</p>
                    </div>
                </div>
            `;
        }
    };

    // Scroll Logic
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (navBar) {
            if (scrollTop > 100) {
                navBar.classList.add('scrolled');
            } else {
                navBar.classList.remove('scrolled');
            }

            if (scrollTop > lastScrollTop && scrollTop > 500 && !cartDrawer.classList.contains('active')) {
                navBar.classList.add('hidden');
            } else {
                navBar.classList.remove('hidden');
            }
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    // Audio Control
    if (audioToggle) {
        audioToggle.addEventListener('click', () => {
            if (loungeAudio.paused) {
                loungeAudio.play();
                audioToggle.classList.remove('muted');
            } else {
                loungeAudio.pause();
                audioToggle.classList.add('muted');
            }
        });
    }

    // Cart Logic
    const updateCartUI = () => {
        const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
        if (cartCountTotal) cartCountTotal.textContent = totalItems;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your selection is empty.</p>';
            cartTotalPrice.textContent = '$0.00';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>$${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                    <div class="item-controls">
                        <div class="qty-control">
                            <button class="qty-btn minus" data-name="${item.name}">-</button>
                            <span class="item-qty">${item.qty}</span>
                            <button class="qty-btn plus" data-name="${item.name}">+</button>
                        </div>
                        <button class="remove-item" data-name="${item.name}">Remove</button>
                    </div>
                </div>
            `).join('');
            
            const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
            cartTotalPrice.textContent = `$${total.toFixed(2)}`;
        }
    };

    const addToCart = (name, price) => {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.qty++;
        } else {
            cart.push({ name, price: parseFloat(price), qty: 1 });
        }
        updateCartUI();
    };

    const changeQty = (name, delta) => {
        const item = cart.find(item => item.name === name);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                cart = cart.filter(i => i.name !== name);
            }
        }
        updateCartUI();
    };

    const removeFromCart = (name) => {
        cart = cart.filter(item => item.name !== name);
        updateCartUI();
    };

    const toggleCart = () => {
        cartDrawer.classList.toggle('active');
    };

    // Centralized Event Delegation for Cart
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart');
        if (btn) {
            const card = btn.closest('.menu-card');
            if (card) {
                addToCart(card.dataset.name, card.dataset.price);
                btn.textContent = 'Added!';
                btn.classList.add('added');
                setTimeout(() => {
                    btn.textContent = 'Add to Cart';
                    btn.classList.remove('added');
                }, 1000);
            }
        }
    });

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.qty-btn, .remove-item');
            if (btn) {
                const name = btn.dataset.name || btn.getAttribute('data-name');
                if (btn.classList.contains('plus')) changeQty(name, 1);
                else if (btn.classList.contains('minus')) changeQty(name, -1);
                else if (btn.classList.contains('remove-item')) removeFromCart(name);
            }
        });
    }

    if (cartToggle) cartToggle.addEventListener('click', toggleCart);
    if (cartClose) cartClose.addEventListener('click', toggleCart);

    // WhatsApp logic
    const generateWhatsAppOrder = () => {
        if (cart.length === 0) return;
        const tableNumber = tableNumberInput ? tableNumberInput.value.trim() : '';
        if (!tableNumber) {
            alert('Please provide your table number.');
            if (tableNumberInput) tableNumberInput.focus();
            return;
        }

        let message = `*⚜️ ${currentBrand.name.toUpperCase()} ORDER ⚜️*%0A%0A`;
        message += `*Table Number:* ${tableNumber}%0A%0A`;
        message += `*ITEMS:*%0A`;
        cart.forEach(item => {
            message += `✨ ${item.qty}x ${item.name} — $${(item.price * item.qty).toFixed(2)}%0A`;
        });
        const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        message += `%0A*TOTAL: $${total.toFixed(2)}*%0A%0A`;
        message += `_Sent via Digital Room Service_`;

        const whatsappUrl = `https://wa.me/${currentBrand.whatsapp}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    if (whatsappOrderBtn) whatsappOrderBtn.addEventListener('click', generateWhatsAppOrder);

    // Intersection Observer for animations
    const observeSections = () => {
        const sections = document.querySelectorAll('.menu-section');
        const observerOptions = { threshold: 0.1 };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    const cards = entry.target.querySelectorAll('.menu-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => card.classList.add('revealed'), index * 100);
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    };

    // FAB Trigger
    const fabTrigger = document.getElementById('fab-trigger');
    const fabMenu = document.getElementById('fab-menu');
    if (fabTrigger) {
        fabTrigger.addEventListener('click', () => {
            fabTrigger.classList.toggle('active');
            fabMenu.classList.toggle('active');
        });
    }

    // Initialize
    loadBrand();
});
