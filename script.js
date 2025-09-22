// تعديل سعر عنصر في العربة وإظهار مقدار الخصم
function updateItemCustomPrice(index, value) {
    const raw = parseFloat(value);
    if (isNaN(raw) || raw < 0) return;
    const item = cart[index];
    if (!item) return;
    const currencySel = document.getElementById('currency');
    const currency = currencySel ? currencySel.value : 'USD';
    // حول السعر المدخل إلى USD إن كان الإدخال بالليرة
    const newPriceUSD = currency === 'USD' ? raw : (raw / (settings.exchangeRate || 1));
    const basePriceUSD = getProductPrice(item, item.selectedPriceType || currentPriceType, 'USD');
    item.customPriceUSD = newPriceUSD;
    // حساب الخصم كنسبة
    let discountText = '';
    if (newPriceUSD < basePriceUSD) {
        const diff = basePriceUSD - newPriceUSD;
        const pct = ((diff / basePriceUSD) * 100).toFixed(1);
        discountText = `خصم ${pct}%`;
    }
    const note = document.getElementById(`discountNote_${index}`);
    if (note) {
        note.textContent = discountText;
        note.style.display = discountText ? 'inline' : 'none';
    }
    // تحذير بيع تحت الكلفة
    const cost = item.costUSD || 0;
    if (cost && newPriceUSD < cost) {
        const ok = confirm(`تنبيه: السعر (${newPriceUSD.toFixed(2)}$) أقل من الكلفة (${cost}$). هل تريد المتابعة؟`);
        if (!ok) {
            item.customPriceUSD = basePriceUSD;
        }
    }
    updateCart();
}

// إظهار/إخفاء حقل تعديل السعر
function togglePriceEdit(index) {
    const wrap = document.getElementById(`editPriceWrap_${index}`);
    if (!wrap) return;
    const visible = wrap.style.display !== 'none';
    wrap.style.display = visible ? 'none' : 'flex';
    if (!visible) {
        const input = document.getElementById(`customPrice_${index}`);
        if (input) {
            input.focus();
            input.select();
        }
    }
}

// تحرير سريع عبر نافذة منبثقة (مناسب للزوم المنخفض)
function quickEditPrice(index) {
    const item = cart[index];
    if (!item) return;
    const baseUSD = item.customPriceUSD != null ? item.customPriceUSD : item.priceUSD;
    const input = prompt('أدخل سعر البيع الجديد:', baseUSD);
    if (input == null) return;
    updateItemCustomPrice(index, input);
}
// بيانات النظام
let currentUser = null;
let currentPriceType = 'retail'; // retail, wholesale, vip
let currentLanguage = 'ar'; // ar, en

// نظام الترجمة الديناميكي
const translations = {
    ar: {
        // الشريط العلوي
        'system-title': 'نظام المبيعات',
        'hide-menu': 'إخفاء القائمة',
        'show-menu': 'إظهار القائمة',
        'cash-register': 'الصندوق',
        'welcome': 'مرحباً، المدير',
        'logout': 'خروج',
        'language': 'العربية',
        
        // القائمة الجانبية
        'dashboard': 'لوحة التحكم',
        'pos': 'نقطة البيع',
        'products': 'المنتجات',
        'sales': 'المبيعات',
        'customers': 'العملاء',
        'suppliers': 'الموردين',
        'reports': 'التقارير',
        'settings': 'الإعدادات',
        
        // نقطة البيع
        'currency': 'العملة',
        'price-type': 'نوع السعر',
        'retail': 'مفرق',
        'wholesale': 'جملة',
        'vip': 'زبون مميز',
        'exchange-rate': 'سعر الصرف',
        'search-product': 'ابحث عن منتج بالاسم أو الباركود...',
        'cart': 'العربة',
        'subtotal': 'المجموع الفرعي',
        'final-total': 'المجموع النهائي',
        'payment-method': 'طريقة الدفع',
        'cash-payment': 'دفع كامل (نقدي)',
        'partial-payment': 'دفع جزئي (دين)',
        'process-payment': 'إتمام الدفع',
        'clear-cart': 'مسح العربة',
        
        // نظام البيع بالدين
        'credit-sale': 'بيع بالدين',
        'credit-sale-desc': 'البيع كاملاً على الحساب',
        'choose-customer-label': 'اختر العميل:',
        'customer-credit': 'دين العميل',
        'credit-limit': 'الحد الائتماني',
        'remaining-credit': 'الائتمان المتبقي',
        'credit-available': 'ائتمان متاح',
        'credit-exceeded': 'تجاوز الحد الائتماني',
        'confirm-credit-sale': 'هل أنت متأكد من البيع بالدين؟',
        'credit-sale-success': 'تم البيع بالدين بنجاح',
        
        // صفحة المبيعات
        'sales-management': 'إدارة المبيعات',
        'invoice-number': 'رقم الفاتورة',
        'date': 'التاريخ',
        'customer': 'العميل',
        'amount': 'المبلغ',
        'payment-method': 'طريقة الدفع',
        'status': 'الحالة',
        'actions': 'الإجراءات',
        'discounts': 'الخصومات',
        'completed': 'مكتملة',
        'returned': 'مرجعة',
        'partial': 'مرجعة جزئياً',
        'cash': 'نقدي',
        'card': 'بطاقة',
        'regular-customer': 'عميل عادي',
        'view': 'عرض',
        'print': 'طباعة',
        'refund': 'استرجاع',
        'edit': 'تعديل',
        'delete': 'حذف',
        'log': 'السجل',
        'pay-debt': 'تسديد دين',
        'all-sales': 'جميع المبيعات',
        'completed-only': 'مكتملة فقط',
        'returned-only': 'مرجعة فقط',
        'partial-only': 'مرجعة جزئياً',
        'filter': 'تصفية',
        'reset': 'إعادة تعيين',
        'search-sales': 'ابحث داخل المبيعات...',
        'from-date': 'من تاريخ',
        'to-date': 'إلى تاريخ',
        
        // صفحة التقارير
        'reports': 'التقارير',
        'sales-report': 'تقرير المبيعات',
        'inventory-report': 'تقرير المخزون',
        'customers-report': 'تقرير العملاء',
        'financial-report': 'التقرير المالي',
        'sales-report-desc': 'تقرير شامل عن المبيعات والإيرادات',
        'inventory-report-desc': 'حالة المخزون والمنتجات',
        'customers-report-desc': 'إحصائيات العملاء ومشترياتهم',
        'financial-report-desc': 'الأرباح والخسائر والتدفق النقدي',
        'view-report': 'عرض التقرير',
        
        // Mixed cash payment
        'complete-remainder': 'إكمال بالليرة',
        'will-complete-lbp': 'سيُكمل المتبقي بالليرة عند إتمام الدفع',
        'no-remainder': 'لا يوجد متبقي لإكماله',
        
        // Empty cart
        'cart-empty': '🛒 العربة فارغة',
        'click-to-add': 'انقر على المنتجات لإضافتها',
        
        // الرسائل
        'success': 'نجح',
        'error': 'خطأ',
        'menu-hidden': 'تم إخفاء القائمة',
        'menu-shown': 'تم إظهار القائمة',
        'language-changed': 'تم تغيير اللغة',
        'confirm-logout': 'هل أنت متأكد من تسجيل الخروج؟',
        'logout-success': 'تم تسجيل الخروج بنجاح',

        // شاشة الدخول
        'login-title': 'نظام إدارة المبيعات',
        'login-subtitle': 'Professional Sales System',
        'username': 'اسم المستخدم',
        'password': 'كلمة المرور',
        'login': 'تسجيل الدخول',
        'demo-data': 'بيانات التجربة:',

        // الفواتير
        'invoices-management': 'إدارة الفواتير',
        'filter-date': 'فلترة',

        // التقارير - الفترات
        'today': 'اليوم',
        'yesterday': 'أمس',
        'this-week': 'هذا الأسبوع',
        'last-7-days': 'آخر 7 أيام',
        'this-month': 'هذا الشهر',
        'last-30-days': 'آخر 30 يوم',
        'this-year': 'هذه السنة',
        'custom': 'مخصص',
        'apply': 'تطبيق',
        'sales-history': 'سجل المبيعات',
        // رسائل إضافية
        'pay-debt-success': 'تم تسجيل التسديد بنجاح',
        // نافذة تسديد دين
        'pay-debt-title': 'تسديد دين العميل',
        'pay-debt-customer': 'العميل',
        'pay-debt-current': 'الدين الحالي',
        'pay-debt-amount': 'المبلغ المدفوع',
        'pay-debt-currency': 'عملة الدفع',
        'confirm-pay-debt': 'تأكيد التسديد',
        'cancel-generic': 'إلغاء',
        'currency-usd': 'دولار ($)',
        'currency-lbp': 'ليرة (ل.ل)',
        'debt-word': 'دين',
        // تأكيدات
        'confirm-delete-customer': 'هل أنت متأكد من حذف هذا العميل؟',
        // رسائل نجاح إضافية
        'customer-deleted': 'تم حذف العميل'
    },
    en: {
        // Header
        'system-title': 'Sales System',
        'hide-menu': 'Hide Menu',
        'show-menu': 'Show Menu',
        'cash-register': 'Cash Register',
        'welcome': 'Welcome, Manager',
        'logout': 'Logout',
        'language': 'English',
        
        // Sidebar
        'dashboard': 'Dashboard',
        'pos': 'Point of Sale',
        'products': 'Products',
        'sales': 'Sales',
        'customers': 'Customers',
        'suppliers': 'Suppliers',
        'reports': 'Reports',
        'settings': 'Settings',
        
        // Point of Sale
        'currency': 'Currency',
        'price-type': 'Price Type',
        'retail': 'Retail',
        'wholesale': 'Wholesale',
        'vip': 'VIP Customer',
        'exchange-rate': 'Exchange Rate',
        'search-product': 'Search product by name or barcode...',
        'cart': 'Cart',
        'subtotal': 'Subtotal',
        'final-total': 'Final Total',
        'payment-method': 'Payment Method',
        'cash-payment': 'Full Payment (Cash)',
        'partial-payment': 'Partial Payment (Credit)',
        'process-payment': 'Process Payment',
        'clear-cart': 'Clear Cart',
        
        // Credit Sales System
        'credit-sale': 'Credit Sale',
        'credit-sale-desc': 'Full on account sale',
        'choose-customer-label': 'Select Customer:',
        'customer-credit': 'Customer Credit',
        'credit-limit': 'Credit Limit',
        'remaining-credit': 'Remaining Credit',
        'credit-available': 'Credit Available',
        'credit-exceeded': 'Credit Limit Exceeded',
        'confirm-credit-sale': 'Are you sure about the credit sale?',
        'credit-sale-success': 'Credit sale completed successfully',
        
        // Sales Page
        'sales-management': 'Sales Management',
        'invoice-number': 'Invoice #',
        'date': 'Date',
        'customer': 'Customer',
        'amount': 'Amount',
        'payment-method': 'Payment Method',
        'status': 'Status',
        'actions': 'Actions',
        'discounts': 'Discounts',
        'completed': 'Completed',
        'returned': 'Returned',
        'partial': 'Partially Returned',
        'cash': 'Cash',
        'card': 'Card',
        'regular-customer': 'Regular Customer',
        'view': 'View',
        'print': 'Print',
        'refund': 'Refund',
        'edit': 'Edit',
        'delete': 'Delete',
        'log': 'Log',
        'pay-debt': 'Pay Debt',
        'all-sales': 'All Sales',
        'completed-only': 'Completed Only',
        'returned-only': 'Returned Only',
        'partial-only': 'Partially Returned Only',
        'filter': 'Filter',
        'reset': 'Reset',
        'search-sales': 'Search in sales...',
        'from-date': 'From Date',
        'to-date': 'To Date',
        
        // Reports Page
        'reports': 'Reports',
        'sales-report': 'Sales Report',
        'inventory-report': 'Inventory Report',
        'customers-report': 'Customers Report',
        'financial-report': 'Financial Report',
        'sales-report-desc': 'Comprehensive report on sales and revenues',
        'inventory-report-desc': 'Inventory and product status',
        'customers-report-desc': 'Customer statistics and their purchases',
        'financial-report-desc': 'Profits, losses, and cash flow',
        'view-report': 'View Report',
        
        // Mixed cash payment
        'complete-remainder': 'Complete in LBP',
        'will-complete-lbp': 'Remainder will be completed in LBP at checkout',
        'no-remainder': 'No remainder to complete',
        
        // Empty cart
        'cart-empty': '🛒 Cart is empty',
        'click-to-add': 'Click products to add',
        
        // Messages
        'success': 'Success',
        'error': 'Error',
        'menu-hidden': 'Menu hidden',
        'menu-shown': 'Menu shown',
        'language-changed': 'Language changed',
        'confirm-logout': 'Are you sure you want to logout?',
        'logout-success': 'Logged out successfully',

        // Login screen
        'login-title': 'Sales Management System',
        'login-subtitle': 'Professional Sales System',
        'username': 'Username',
        'password': 'Password',
        'login': 'Login',
        'demo-data': 'Demo credentials:',

        // Invoices
        'invoices-management': 'Invoices Management',
        'filter-date': 'Filter',

        // Reports presets
        'today': 'Today',
        'yesterday': 'Yesterday',
        'this-week': 'This Week',
        'last-7-days': 'Last 7 Days',
        'this-month': 'This Month',
        'last-30-days': 'Last 30 Days',
        'this-year': 'This Year',
        'custom': 'Custom',
        'apply': 'Apply',
        'sales-history': 'Sales History',
        // Extra messages
        'pay-debt-success': 'Payment recorded successfully',
        // Pay Debt modal
        'pay-debt-title': 'Pay Customer Debt',
        'pay-debt-customer': 'Customer',
        'pay-debt-current': 'Current Debt',
        'pay-debt-amount': 'Paid Amount',
        'pay-debt-currency': 'Pay Currency',
        'confirm-pay-debt': 'Confirm Payment',
        'cancel-generic': 'Cancel',
        'currency-usd': 'US Dollar ($)',
        'currency-lbp': 'Lebanese Pound (LBP)',
        'debt-word': 'Debt',
        // Confirmations
        'confirm-delete-customer': 'Are you sure you want to delete this customer?',
        // Success messages
        'customer-deleted': 'Customer deleted'
    }
};

// دالة الحصول على النص المترجم
function getText(key) {
    return translations[currentLanguage][key] || key;
}

// دالة تغيير اللغة
function changeLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // حفظ اللغة المختارة
    try { localStorage.setItem('appLanguage', lang); } catch(e) {}

    // استدعاء مترجم الواجهة الآخر إن وجد (لتغطية عناصر إضافية)
    if (typeof window.translateUI === 'function') {
        try { window.translateUI(lang); } catch(e) {}
    }

    // تطبيق الترجمات المعتمدة على getText
    try { applyTranslations(); } catch(e) {}
    try { translateCustomerActionButtons(); } catch(e) {}
    try { translateEditCustomerModal(); } catch(e) {}
    try { translateProductActionButtons(); } catch(e) {}
    try { translateInlineEditPriceButtons(); } catch(e) {}

    // مزامنة اختيار الواجهة
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = lang;
    }

    // إشعار
    showMessage(getText('language-changed'), 'success');
}

// دالة تطبيق الترجمات على جميع العناصر
function applyTranslations() {
    // ترجمة النصوص في الشريط العلوي
    translateElements();
    
    // ترجمة القائمة الجانبية
    translateNavigation();
    
    // ترجمة نقطة البيع
    translatePOS();
    
    // ترجمة صفحة المبيعات
    translateSales();
    
    // ترجمة صفحة التقارير
    translateReports();
    
    // ترجمة فلاتر التقارير
    translateReportPresets();

    // ترجمة صفحة الفواتير
    translateInvoices();

    // ترجمة الرسائل
    translateMessages();
}

// دالة ترجمة العناصر العامة
function translateElements() {
    // ترجمة عنوان النظام
    const systemTitle = document.querySelector('.logo-small span');
    if (systemTitle) {
        systemTitle.textContent = getText('system-title');
    }
    
    // ترجمة زر التحكم في القائمة
    const navToggleBtn = document.getElementById('navToggleBtn');
    if (navToggleBtn) {
        const span = navToggleBtn.querySelector('span');
        if (span) {
            const isCollapsed = document.querySelector('.sidebar').classList.contains('collapsed');
            span.textContent = isCollapsed ? getText('show-menu') : getText('hide-menu');
        }
    }
    
    // ترجمة الصندوق
    const cashRegister = document.querySelector('.cash-indicator span');
    if (cashRegister) {
        cashRegister.textContent = getText('cash-register');
    }
    
    // ترجمة اسم المستخدم
    const currentUser = document.getElementById('currentUser');
    if (currentUser) {
        currentUser.textContent = getText('welcome');
    }
    
    // ترجمة زر الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> ${getText('logout')}`;
    }

    // شاشة تسجيل الدخول
    const loginTitle = document.querySelector('#loginScreen .logo h1');
    if (loginTitle) loginTitle.textContent = getText('login-title');
    const loginSubtitle = document.querySelector('#loginScreen .logo p');
    if (loginSubtitle) loginSubtitle.textContent = getText('login-subtitle');
    const usernameLbl = document.querySelector('label[for="username"]');
    if (usernameLbl) usernameLbl.textContent = getText('username');
    const passwordLbl = document.querySelector('label[for="password"]');
    if (passwordLbl) passwordLbl.textContent = getText('password');
    const loginBtn = document.querySelector('#loginForm .login-btn');
    if (loginBtn) { const icon = loginBtn.querySelector('i'); loginBtn.textContent = getText('login'); if (icon) loginBtn.prepend(icon); }
    const demoInfoH4 = document.querySelector('#loginScreen .demo-info h4');
    if (demoInfoH4) demoInfoH4.textContent = getText('demo-data');
}

// دالة ترجمة القائمة الجانبية
function translateNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const translations_map = {
        'dashboard': 'dashboard',
        'pos': 'pos',
        'products': 'products',
        'sales': 'sales',
        'customers': 'customers',
        'suppliers': 'suppliers',
        'reports': 'reports',
        'settings': 'settings'
    };
    
    navItems.forEach(item => {
        const screen = item.getAttribute('data-screen');
        const span = item.querySelector('span');
        if (span && translations_map[screen]) {
            span.textContent = getText(translations_map[screen]);
        }
    });
}

// دالة ترجمة نقطة البيع
function translatePOS() {
    // ترجمة عناصر نقطة البيع
    const posElements = {
        'currency': document.querySelector('label[for="currency"]'),
        'priceType': document.querySelector('label[for="priceType"]'),
        'exchangeRate': document.getElementById('exchangeRate'),
        'productSearch': document.getElementById('productSearch'),
        'cart': document.querySelector('.cart-section h3'),
        'subtotal': document.querySelector('#subtotal').previousElementSibling,
        'finalTotal': document.querySelector('#finalTotal').previousElementSibling,
        'paymentMethod': document.querySelector('label[for="paymentMethod"]'),
        'processPayment': document.getElementById('processPayment'),
        'clearCart': document.getElementById('clearCart')
    };
    
    if (posElements.currency) posElements.currency.textContent = getText('currency');
    if (posElements.priceType) posElements.priceType.textContent = getText('price-type');
    if (posElements.exchangeRate) posElements.exchangeRate.textContent = `${getText('exchange-rate')}: 89,500 ل.ل`;
    if (posElements.productSearch) posElements.productSearch.placeholder = getText('search-product');
    if (posElements.cart) posElements.cart.innerHTML = `<i class="fas fa-shopping-cart"></i> ${getText('cart')}`;
    if (posElements.subtotal) posElements.subtotal.textContent = getText('subtotal');
    if (posElements.finalTotal) posElements.finalTotal.textContent = getText('final-total');
    if (posElements.paymentMethod) posElements.paymentMethod.textContent = getText('payment-method');
    if (posElements.processPayment) posElements.processPayment.innerHTML = `<i class="fas fa-credit-card"></i> ${getText('process-payment')}`;
    if (posElements.clearCart) posElements.clearCart.innerHTML = `<i class="fas fa-trash"></i> ${getText('clear-cart')}`;
    
    // ترجمة خيارات طريقة الدفع
    const paymentMethodSelect = document.getElementById('paymentMethod');
    if (paymentMethodSelect) {
        const options = paymentMethodSelect.querySelectorAll('option');
        if (options[0]) options[0].textContent = getText('cash-payment');
        if (options[1]) options[1].textContent = getText('credit-sale');
        if (options[2]) options[2].textContent = getText('partial-payment');
    }
    
    // ترجمة عناصر البيع بالدين
    const creditSaleSection = document.querySelector('#creditSaleSection .credit-feature-highlight h3');
    if (creditSaleSection) creditSaleSection.textContent = getText('credit-sale');
    
    const creditSaleDesc = document.querySelector('#creditSaleSection .credit-feature-highlight p');
    if (creditSaleDesc) creditSaleDesc.textContent = getText('credit-sale-desc');
    
    const creditCustomerLabel = document.querySelector('#creditSaleSection label');
    if (creditCustomerLabel) creditCustomerLabel.textContent = getText('choose-customer-label');
    
}

// دالة ترجمة صفحة المبيعات
function translateSales() {
    // ترجمة عنوان صفحة المبيعات
    const salesHeader = document.querySelector('#sales .page-header h2');
    if (salesHeader) {
        salesHeader.innerHTML = `<i class="fas fa-receipt"></i> ${getText('sales-management')}`;
    }
    
    // ترجمة أزرار الفلترة
    const filterBtn = document.getElementById('filterSales');
    if (filterBtn) filterBtn.textContent = getText('filter');
    
    const resetBtn = document.getElementById('resetFilter');
    if (resetBtn) resetBtn.textContent = getText('reset');

    // ترجمة حقل البحث داخل المبيعات
    const salesSearch = document.getElementById('salesSearch');
    if (salesSearch) salesSearch.placeholder = getText('search-sales');
    
    // ترجمة خيارات الفلترة
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        const options = statusFilter.querySelectorAll('option');
        if (options[0]) options[0].textContent = getText('all-sales');
        if (options[1]) options[1].textContent = getText('completed-only');
        if (options[2]) options[2].textContent = getText('returned-only');
        if (options[3]) options[3].textContent = getText('partial-only');
    }
    
    // ترجمة رؤوس الجدول (ثمانية أعمدة بما فيها الخصومات)
    const salesTheadHeaders = document.querySelectorAll('#sales thead th');
    if (salesTheadHeaders && salesTheadHeaders.length >= 8) {
        salesTheadHeaders[0].textContent = getText('invoice-number');
        salesTheadHeaders[1].textContent = getText('date');
        salesTheadHeaders[2].textContent = getText('customer');
        salesTheadHeaders[3].textContent = getText('amount');
        salesTheadHeaders[4].textContent = getText('payment-method');
        salesTheadHeaders[5].textContent = getText('discounts');
        salesTheadHeaders[6].textContent = getText('status');
        salesTheadHeaders[7].textContent = getText('actions');
    }
    
    // ترجمة بيانات الجدول
    translateSalesTableData();
}

// دالة ترجمة بيانات جدول المبيعات
function translateSalesTableData() {
    const salesRows = document.querySelectorAll('#salesTable tr');
    salesRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
            // ترجمة طريقة الدفع داخل الجدول (نقدي/بطاقة/دفع جزئي/بيع بالدين)
            if (cells[4]) {
                const rawPay = (cells[4].textContent || '').trim();
                if (rawPay === 'نقدي' || rawPay.toLowerCase() === 'cash') {
                    cells[4].textContent = getText('cash');
                } else if (rawPay === 'بطاقة' || rawPay.toLowerCase() === 'card') {
                    cells[4].textContent = getText('card');
                } else if (rawPay.includes('دفع جزئي') || /partial/i.test(rawPay)) {
                    cells[4].textContent = getText('partial-payment');
                } else if (rawPay.includes('بيع بالدين') || /credit sale/i.test(rawPay) || /credit/i.test(rawPay)) {
                    cells[4].textContent = getText('credit-sale');
                }
            }
            
            // ترجمة الحالة (العمود السابع، مع شارة حالة داخلية)
            const statusCell = cells[6] || cells[5];
            if (statusCell) {
                const badge = statusCell.querySelector('.status-badge') || statusCell;
                const statusText = (badge.textContent || '').trim();
                if (statusText === 'مكتملة' || statusText === 'Completed') {
                    badge.textContent = getText('completed');
                } else if (statusText === 'مرجعة' || statusText === 'مرجعة كاملة' || statusText === 'Returned') {
                    badge.textContent = getText('returned');
                } else if (statusText === 'مرجعة جزئياً' || statusText === 'Partially Returned') {
                    badge.textContent = getText('partial');
                }
            }
            
            // ترجمة اسم العميل
            if (cells[2]) {
                const customerText = cells[2].textContent;
                if (customerText === 'عميل عادي') cells[2].textContent = getText('regular-customer');
            }
            
            // ترجمة أزرار الإجراءات (حسب الصنف/الأيقونة وليس النص)
            if (cells[7] || cells[6]) {
                const actionsCell = cells[7] || cells[6];
                const actionBtns = actionsCell.querySelectorAll('button');
                actionBtns.forEach(btn => {
                    const icon = btn.querySelector('i');
                    if (btn.classList.contains('return-btn')) {
                        btn.innerHTML = `<i class="fas fa-undo"></i> ${getText('refund')}`;
                    } else if (btn.classList.contains('view-btn')) {
                        btn.innerHTML = `<i class="fas fa-eye"></i> ${getText('view')}`;
                    } else if (icon && icon.classList.contains('fa-print')) {
                        btn.innerHTML = `<i class="fas fa-print"></i> ${getText('print')}`;
                    } else if (btn.disabled) {
                        // زر معطل لبيعة مُرجعة
                        btn.innerHTML = `<i class="fas fa-check"></i> ${getText('returned')}`;
                    }
                });
            }
        }
    });
}

// ترجمة أزرار جدول العملاء (تعديل/حذف/السجل/تسديد دين)
function translateCustomerActionButtons() {
    try {
        const rows = document.querySelectorAll('#customersTable tr');
        rows.forEach(row => {
            const actionsCell = row.querySelector('td:last-child');
            if (!actionsCell) return;
            const editBtn = actionsCell.querySelector('.edit-btn');
            if (editBtn) editBtn.innerHTML = `<i class="fas fa-edit"></i> ${getText('edit')}`;
            const deleteBtn = actionsCell.querySelector('.delete-btn');
            if (deleteBtn) deleteBtn.innerHTML = `<i class="fas fa-trash"></i> ${getText('delete')}`;
            const logBtn = actionsCell.querySelector('.customer-log-btn');
            if (logBtn) logBtn.innerHTML = `<i class="fas fa-list"></i> ${getText('log')}`;
            const payBtn = actionsCell.querySelector('.pay-debt-btn');
            if (payBtn) payBtn.innerHTML = `<i class="fas fa-dollar-sign"></i> ${getText('pay-debt')}`;
        });
    } catch(_) {}
}
// دالة ترجمة صفحة التقارير
function translateReports() {
    // ترجمة عنوان صفحة التقارير
    const reportsHeader = document.querySelector('#reports .page-header h2');
    if (reportsHeader) {
        reportsHeader.innerHTML = `<i class="fas fa-chart-bar"></i> ${getText('reports')}`;
    }
    
    // ترجمة بطاقات التقارير
    const reportCards = document.querySelectorAll('#reports .report-card');
    const reportTitles = [
        'sales-report',
        'inventory-report', 
        'customers-report',
        'financial-report'
    ];
    
    const reportDescriptions = [
        'sales-report-desc',
        'inventory-report-desc',
        'customers-report-desc', 
        'financial-report-desc'
    ];
    
    reportCards.forEach((card, index) => {
        const title = card.querySelector('h3');
        const description = card.querySelector('p');
        const button = card.querySelector('.report-btn');
        
        if (title && reportTitles[index]) {
            title.innerHTML = `<i class="fas fa-chart-line"></i> ${getText(reportTitles[index])}`;
        }
        
        if (description && reportDescriptions[index]) {
            description.textContent = getText(reportDescriptions[index]);
        }
        
        if (button) {
            button.textContent = getText('view-report');
        }
    });
}

// ترجمة زر تعديل السعر داخل بطاقة المنتج
function translateInlineEditPriceButtons() {
    const isEn = (document.documentElement.lang || 'ar') === 'en';
    const buttons = document.querySelectorAll('.edit-price-btn');
    buttons.forEach(btn => {
        btn.title = isEn ? 'Edit Price' : 'تعديل السعر';
        btn.innerHTML = `<i class="fas fa-edit"></i> ${isEn ? 'Edit Price' : 'تعديل السعر'}`;
    });
}
// ترجمة واجهة نافذة استرجاع المبيعة
function translateReturnModalUI() {
    const lang = document.documentElement.lang || 'ar';
    const t = lang === 'en' ? {
        title: 'Return Sale',
        sale_details: 'Sale Details',
        invoice_no: 'Invoice #',
        customer: 'Customer',
        total: 'Total',
        pay_method: 'Payment Method',
        options: 'Return Options',
        type_label: 'Return Type:',
        type_full: 'Full Return',
        type_partial: 'Partial Return',
        reason_label: 'Return Reason:',
        reason_defective: 'Defective',
        reason_wrong: 'Wrong Item',
        reason_change: 'Customer Changed Mind',
        reason_size: 'Size Issue',
        reason_other: 'Other',
        notes: 'Additional Notes',
        summary: 'Return Summary',
        refunded_amount: 'Refunded Amount:',
        refund_method: 'Refund Method:',
        confirm: 'Confirm Return',
        cancel: 'Cancel'
    } : {
        title: 'استرجاع المبيعة',
        sale_details: 'تفاصيل المبيعة',
        invoice_no: 'رقم الفاتورة',
        customer: 'العميل',
        total: 'المبلغ الإجمالي',
        pay_method: 'طريقة الدفع',
        options: 'خيارات الاسترجاع',
        type_label: 'نوع الاسترجاع:',
        type_full: 'استرجاع كامل',
        type_partial: 'استرجاع جزئي',
        reason_label: 'سبب الاسترجاع:',
        reason_defective: 'منتج معيب',
        reason_wrong: 'منتج خاطئ',
        reason_change: 'تغيير رأي العميل',
        reason_size: 'مشكلة في الحجم',
        reason_other: 'أخرى',
        notes: 'ملاحظات إضافية',
        summary: 'ملخص الاسترجاع',
        refunded_amount: 'المبلغ المسترجع:',
        refund_method: 'طريقة الإرجاع:',
        confirm: 'تأكيد الاسترجاع',
        cancel: 'إلغاء'
    };

    const modal = document.getElementById('returnSaleModal');
    if (!modal) return;
    const header = modal.querySelector('.modal-header h3');
    if (header) header.innerHTML = (lang === 'en' ? '<i class="fas fa-undo"></i> ' : '<i class="fas fa-undo"></i> ') + t.title;

    const detailsTitle = modal.querySelector('.return-info .sale-details h4');
    if (detailsTitle) detailsTitle.textContent = t.sale_details;
    const detailsLabels = modal.querySelectorAll('.sale-details .detail-row span:first-child');
    if (detailsLabels && detailsLabels.length >= 4) {
        detailsLabels[0].textContent = t.invoice_no + ':';
        detailsLabels[1].textContent = t.customer + ':';
        detailsLabels[2].textContent = t.total + ':';
        detailsLabels[3].textContent = t.pay_method + ':';
    }

    const optionsTitle = modal.querySelector('.return-options h4');
    if (optionsTitle) optionsTitle.textContent = t.options;
    const typeLabel = modal.querySelector('#returnType')?.closest('.form-group')?.querySelector('label');
    if (typeLabel) typeLabel.textContent = t.type_label;
    const returnType = document.getElementById('returnType');
    if (returnType && returnType.options.length >= 2) {
        returnType.options[0].textContent = t.type_full;
        returnType.options[1].textContent = t.type_partial;
    }
    const reasonLabel = modal.querySelector('#returnReason')?.closest('.form-group')?.querySelector('label');
    if (reasonLabel) reasonLabel.textContent = t.reason_label;
    const reasonSel = document.getElementById('returnReason');
    if (reasonSel && reasonSel.options.length >= 5) {
        reasonSel.options[0].textContent = t.reason_defective;
        reasonSel.options[1].textContent = t.reason_wrong;
        reasonSel.options[2].textContent = t.reason_change;
        reasonSel.options[3].textContent = t.reason_size;
        reasonSel.options[4].textContent = t.reason_other;
    }
    const notesLabel = modal.querySelector('#returnNotes')?.closest('.form-group')?.querySelector('label');
    if (notesLabel) notesLabel.textContent = t.notes;

    const summaryTitle = modal.querySelector('.return-summary h4');
    if (summaryTitle) summaryTitle.textContent = t.summary;
    const summaryLabels = modal.querySelectorAll('.return-summary .summary-row span:first-child');
    if (summaryLabels && summaryLabels.length >= 2) {
        summaryLabels[0].textContent = t.refunded_amount;
        summaryLabels[1].textContent = t.refund_method;
    }

    // أزرار التذييل
    const footerBtns = modal.querySelectorAll('.modal-actions button');
    if (footerBtns && footerBtns.length >= 2) {
        const confirmBtn = footerBtns[0];
        const cancelBtn = footerBtns[1];
        const confirmIcon = confirmBtn.querySelector('i');
        const cancelIcon = cancelBtn.querySelector('i');
        confirmBtn.textContent = t.confirm;
        cancelBtn.textContent = t.cancel;
        if (confirmIcon) confirmBtn.prepend(confirmIcon);
        if (cancelIcon) cancelBtn.prepend(cancelIcon);
    }
}

// ترجمة إعدادات التقارير: الفترات والأزرار
function translateReportPresets() {
    const preset = document.getElementById('reportPreset');
    if (preset && preset.options.length >= 8) {
        preset.options[0].textContent = getText('today');
        preset.options[1].textContent = getText('yesterday');
        preset.options[2].textContent = getText('this-week');
        preset.options[3].textContent = getText('last-7-days');
        preset.options[4].textContent = getText('this-month');
        preset.options[5].textContent = getText('last-30-days');
        preset.options[6].textContent = getText('this-year');
        preset.options[7].textContent = getText('custom');
    }
    const applyBtn = document.getElementById('applyReportFilter');
    if (applyBtn) applyBtn.textContent = getText('apply');
    const openHist = document.getElementById('openSalesHistory');
    if (openHist) { const icon = openHist.querySelector('i'); openHist.textContent = getText('sales-history'); if (icon) openHist.prepend(icon); }
}

// دالة ترجمة الرسائل
function translateMessages() {
    // تحديث دالة showMessage لتستخدم الترجمات
    window.originalShowMessage = showMessage;
    window.showMessage = function(message, type = 'success') {
        const translatedMessage = translations[currentLanguage][message] || message;
        window.originalShowMessage(translatedMessage, type);
    };
}

// تحميل البيانات من localStorage أو استخدام البيانات الافتراضية
let products = loadFromStorage('products', [
    {
        id: 1,
        name: 'كوكاكولا',
        category: 'مشروبات',
        costUSD: 0.60,
        prices: {
            retail: { USD: 1.00, LBP: 89500 },      // مفرق
            wholesale: { USD: 0.85, LBP: 76000 },  // جملة
            vip: { USD: 0.90, LBP: 80500 }         // زبون مميز
        },
        // للتوافق مع الكود القديم
        priceUSD: 1.00,
        priceLBP: 89500,
        stock: 100,
        minStock: 10,
        barcode: '1234567890123',
        supplier: 'شركة المشروبات العالمية'
    },
    {
        id: 2,
        name: 'خبز عربي',
        category: 'مخبوزات',
        costUSD: 0.30,
        prices: {
            retail: { USD: 0.50, LBP: 45000 },      // مفرق
            wholesale: { USD: 0.40, LBP: 36000 },  // جملة
            vip: { USD: 0.45, LBP: 40500 }         // زبون مميز
        },
        // للتوافق مع الكود القديم
        priceUSD: 0.50,
        priceLBP: 45000,
        stock: 50,
        minStock: 5,
        barcode: '2345678901234',
        supplier: 'مخبز الأمل'
    },
    {
        id: 3,
        name: 'شيبس',
        category: 'وجبات خفيفة',
        costUSD: 0.40,
        prices: {
            retail: { USD: 0.75, LBP: 67000 },      // مفرق
            wholesale: { USD: 0.65, LBP: 58000 },  // جملة
            vip: { USD: 0.70, LBP: 62500 }         // زبون مميز
        },
        // للتوافق مع الكود القديم
        priceUSD: 0.75,
        priceLBP: 67000,
        stock: 80,
        minStock: 15,
        barcode: '3456789012345',
        supplier: 'مصنع الوجبات'
    },
    {
        id: 4,
        name: 'ماء',
        category: 'مشروبات',
        costUSD: 0.10,
        prices: {
            retail: { USD: 0.25, LBP: 22000 },      // مفرق
            wholesale: { USD: 0.20, LBP: 18000 },  // جملة
            vip: { USD: 0.22, LBP: 20000 }         // زبون مميز
        },
        // للتوافق مع الكود القديم
        priceUSD: 0.25,
        priceLBP: 22000,
        stock: 200,
        minStock: 20,
        barcode: '4567890123456',
        supplier: 'شركة المياه النقية'
    }
]);
let customers = loadFromStorage('customers', [
    {
        id: 1,
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '71123456',
        address: 'الأشرفية، بيروت',
        totalPurchases: 250.00,
        loyaltyPoints: 125,
        dateJoined: '2024-01-01',
        creditBalance: 0.00, // الدين المستحق
        currentDebt: 0.00, // الدين الحالي
        creditLimit: 1000.00, // الحد الأقصى للدين
        creditHistory: [] // تاريخ المعاملات الآجلة
    },
    {
        id: 2,
        name: 'فاطمة علي',
        email: 'fatima@example.com',
        phone: '70987654',
        address: 'الحمرا، بيروت',
        totalPurchases: 180.00,
        loyaltyPoints: 90,
        dateJoined: '2024-01-10',
        creditBalance: 25.00, // لديها دين
        currentDebt: 25.00, // الدين الحالي
        creditLimit: 500.00,
        creditHistory: [
            {
                date: '2024-01-15',
                type: 'purchase',
                amount: 25.00,
                description: 'مشتريات متنوعة'
            }
        ]
    },
    {
        id: 3,
        name: 'محمد السعيد',
        email: 'mohamed@example.com',
        phone: '0555123456',
        address: 'حماة، سوريا',
        totalPurchases: 0.00,
        loyaltyPoints: 0,
        dateJoined: '2024-01-01',
        creditBalance: 0.00,
        currentDebt: 0.00,
        creditLimit: 2000.00,
        creditHistory: []
    },
    {
        id: 4,
        name: 'سارة أحمد',
        email: 'sara@example.com',
        phone: '0999888777',
        address: 'اللاذقية، سوريا',
        totalPurchases: 400.00,
        loyaltyPoints: 200,
        dateJoined: '2024-01-10',
        creditBalance: 300.00,
        currentDebt: 300.00,
        creditLimit: 800.00,
        creditHistory: [
            {
                date: '2024-01-15',
                type: 'purchase',
                amount: 300.00,
                description: 'مشتريات متنوعة'
            }
        ]
    }
]);

let sales = loadFromStorage('sales', [
    {
        id: 1,
        invoiceNumber: 'INV-001',
        date: '2024-01-15',
        customer: 'أحمد محمد',
        customerId: 1,
        amount: 15.50,
        paymentMethod: 'نقدي',
        items: [
            {id: 1, name: 'كوكاكولا', quantity: 2, price: 1.00},
            {id: 3, name: 'شيبس', quantity: 1, price: 0.75}
        ]
    },
    {
        id: 2,
        invoiceNumber: 'INV-002',
        date: '2024-01-15',
        customer: 'عميل عادي',
        customerId: null,
        amount: 8.25,
        paymentMethod: 'بطاقة',
        items: [
            {id: 2, name: 'خبز عربي', quantity: 3, price: 0.50},
            {id: 4, name: 'ماء', quantity: 2, price: 0.25}
        ]
    }
]);

let suppliers = loadFromStorage('suppliers', [
    {
        id: 1,
        name: 'شركة المشروبات العالمية',
        email: 'info@beverages.com',
        phone: '01-345678',
        address: 'الدورة، بيروت',
        contactPerson: 'خالد أحمد'
    },
    {
        id: 2,
        name: 'مخبز الأمل',
        email: 'bakery@hope.com',
        phone: '03-456789',
        address: 'طرابلس، لبنان',
        contactPerson: 'محمد حسن'
    }
]);

let cart = [];
let lastCartFocusIndex = null; // لتتبع آخر عنصر تم تعديل كميته
let settings = loadFromStorage('settings', {
    exchangeRate: 89500,
    taxRate: 0, // إزالة الضريبة
    storeName: 'متجري الإلكتروني',
    storeAddress: 'بيروت، لبنان',
    storePhone: '01-234567',
    autoBackup: true,
    lowStockAlert: true,
    lowStockThreshold: 10, // حد تحذير المخزون
    printAfterSale: true
});

// إدارة الصندوق والنقدية
let cashDrawer = loadFromStorage('cashDrawer', {
    cashUSD: 100.00,  // النقدية بالدولار
    cashLBP: 500000,  // النقدية بالليرة
    lastUpdate: new Date().toISOString(),
    transactions: []  // سجل المعاملات النقدية
});

// وظائف إدارة البيانات المحلية
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
        return false;
    }
}

// ترجمة صفحة الفواتير
function translateInvoices() {
    const invHeader = document.querySelector('#invoices .page-header h2');
    if (invHeader) invHeader.textContent = getText('invoices-management');
    const filterBtn = document.querySelector('#invoices .filter-btn');
    if (filterBtn) filterBtn.textContent = getText('filter-date');
    const head = document.querySelectorAll('#invoices thead th');
    if (head && head.length >= 7) {
        head[0].textContent = getText('invoice-number');
        head[1].textContent = getText('date');
        head[2].textContent = getText('customer');
        head[3].textContent = getText('amount');
        head[4].textContent = getText('payment-method');
        head[5].textContent = getText('status');
        head[6].textContent = getText('actions');
    }
}

function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        return defaultValue;
    }
}

// دالة للحصول على السعر حسب النوع والعملة
function getProductPrice(product, priceType = currentPriceType, currency = 'USD') {
    // إذا كان المنتج يحتوي على أسعار متعددة
    if (product.prices && product.prices[priceType]) {
        return currency === 'USD' ? product.prices[priceType].USD : product.prices[priceType].LBP;
    }
    
    // العودة للسعر القديم للتوافق
    return currency === 'USD' ? product.priceUSD : product.priceLBP;
}
// دالة للحصول على نص نوع السعر
function getPriceTypeLabel(priceType) {
    const isEn = (document.documentElement.lang || 'ar') === 'en';
    const labelsAr = { retail: '🏪 مفرق', wholesale: '📦 جملة', vip: '⭐ مميز' };
    const labelsEn = { retail: '🏪 Retail', wholesale: '📦 Wholesale', vip: '⭐ VIP' };
    const map = isEn ? labelsEn : labelsAr;
    return map[priceType] || (isEn ? 'Retail' : 'مفرق');
}

function clearStorage() {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        localStorage.clear();
        location.reload();
    }
}

function exportData() {
    const data = {
        products: products,
        customers: customers,
        sales: sales,
        suppliers: suppliers,
        settings: settings,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `sales-system-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showMessage('تم تصدير البيانات بنجاح');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('هل تريد استيراد هذه البيانات؟ سيتم استبدال البيانات الحالية.')) {
                if (data.products) products = data.products;
                if (data.customers) customers = data.customers;
                if (data.sales) sales = data.sales;
                if (data.suppliers) suppliers = data.suppliers;
                if (data.settings) settings = data.settings;
                
                saveAllData();
                location.reload();
            }
        } catch (error) {
            showMessage('خطأ في قراءة الملف. تأكد من صحة تنسيق الملف.', 'error');
        }
    };
    reader.readAsText(file);
}

function saveAllData() {
    saveToStorage('products', products);
    saveToStorage('customers', customers);
    saveToStorage('sales', sales);
    saveToStorage('suppliers', suppliers);
    saveToStorage('settings', settings);
    saveToStorage('cashDrawer', cashDrawer);
}

// وظائف إدارة الصندوق والنقدية
function calculateOptimalChange(totalDue, amountPaid, paymentCurrency, preferredChangeCurrency = null) {
    const changeNeeded = amountPaid - totalDue;
    
    if (changeNeeded <= 0) {
        return { change: 0, currency: paymentCurrency, canGiveChange: true, breakdown: null };
    }
    
    // إذا لم يحدد العميل عملة الباقي، نحاول إعطاؤه بنفس عملة الدفع
    if (!preferredChangeCurrency) {
        preferredChangeCurrency = paymentCurrency;
    }
    
    // التحقق من توفر النقدية
    const availableCash = {
        USD: cashDrawer.cashUSD,
        LBP: cashDrawer.cashLBP
    };
    
    // حساب الباقي بالعملة المفضلة
    let changeAmount = changeNeeded;
    let changeCurrency = preferredChangeCurrency;
    
    // إذا كانت العملة مختلفة، نحتاج للتحويل
    if (paymentCurrency !== preferredChangeCurrency) {
        if (paymentCurrency === 'USD' && preferredChangeCurrency === 'LBP') {
            changeAmount = changeNeeded * settings.exchangeRate;
        } else if (paymentCurrency === 'LBP' && preferredChangeCurrency === 'USD') {
            changeAmount = changeNeeded / settings.exchangeRate;
        }
    }
    
    // التحقق من توفر النقدية المطلوبة
    const canGiveChange = availableCash[changeCurrency] >= changeAmount;
    
    // إذا لم تتوفر النقدية بالعملة المطلوبة، نجرب العملة الأخرى
    if (!canGiveChange) {
        const alternateCurrency = changeCurrency === 'USD' ? 'LBP' : 'USD';
        let alternateAmount;
        
        if (changeCurrency === 'USD') {
            alternateAmount = changeAmount * settings.exchangeRate;
        } else {
            alternateAmount = changeAmount / settings.exchangeRate;
        }
        
        if (availableCash[alternateCurrency] >= alternateAmount) {
            return {
                change: alternateAmount,
                currency: alternateCurrency,
                canGiveChange: true,
                breakdown: null,
                note: `تم إعطاء الباقي بعملة ${alternateCurrency === 'USD' ? 'الدولار' : 'الليرة'} لعدم توفر النقدية بالعملة المطلوبة`
            };
        }
    }
    
    // إذا لم تكف النقدية، نحاول التوزيع بين العملتين
    if (!canGiveChange && changeNeeded > 0) {
        const breakdown = calculateMixedCurrencyChange(changeNeeded, paymentCurrency);
        return {
            change: changeNeeded,
            currency: paymentCurrency,
            canGiveChange: breakdown.possible,
            breakdown: breakdown,
            note: breakdown.possible ? 'سيتم إعطاء الباقي بعملات مختلطة' : 'لا توجد نقدية كافية لإعطاء الباقي'
        };
    }
    
    return {
        change: changeAmount,
        currency: changeCurrency,
        canGiveChange: canGiveChange,
        breakdown: null
    };
}

function calculateMixedCurrencyChange(changeNeeded, originalCurrency) {
    let remainingChange = changeNeeded;
    const breakdown = { USD: 0, LBP: 0, possible: false };
    
    // إذا كان الدفع بالدولار، نعطي أولاً من الدولار ثم الليرة
    if (originalCurrency === 'USD') {
        const usdAvailable = Math.min(cashDrawer.cashUSD, remainingChange);
        breakdown.USD = usdAvailable;
        remainingChange -= usdAvailable;
        
        if (remainingChange > 0) {
            const lbpNeeded = remainingChange * settings.exchangeRate;
            if (cashDrawer.cashLBP >= lbpNeeded) {
                breakdown.LBP = lbpNeeded;
                remainingChange = 0;
            }
        }
    } else {
        // إذا كان الدفع بالليرة، نعطي أولاً من الليرة ثم الدولار
        const lbpAvailable = Math.min(cashDrawer.cashLBP, remainingChange);
        breakdown.LBP = lbpAvailable;
        remainingChange -= lbpAvailable;
        
        if (remainingChange > 0) {
            const usdNeeded = remainingChange / settings.exchangeRate;
            if (cashDrawer.cashUSD >= usdNeeded) {
                breakdown.USD = usdNeeded;
                remainingChange = 0;
            }
        }
    }
    
    breakdown.possible = remainingChange <= 0.01; // نسامح فلوس قليلة جداً
    return breakdown;
}

function updateCashDrawer(amountReceived, currency, changeGiven, changeCurrency) {
    // إضافة المبلغ المستلم
    if (currency === 'USD') {
        cashDrawer.cashUSD += amountReceived;
    } else {
        cashDrawer.cashLBP += amountReceived;
    }
    
    // خصم الباقي المُعطى
    if (changeGiven > 0) {
        if (changeCurrency === 'USD') {
            cashDrawer.cashUSD -= changeGiven;
        } else {
            cashDrawer.cashLBP -= changeGiven;
        }
    }
    
    // تسجيل المعاملة
    cashDrawer.transactions.push({
        timestamp: new Date().toISOString(),
        type: 'sale',
        amountReceived: amountReceived,
        receivedCurrency: currency,
        changeGiven: changeGiven,
        changeCurrency: changeCurrency,
        balanceAfter: {
            USD: cashDrawer.cashUSD,
            LBP: cashDrawer.cashLBP
        }
    });
    
    cashDrawer.lastUpdate = new Date().toISOString();
    saveToStorage('cashDrawer', cashDrawer);
}

// النسخ الاحتياطي التلقائي
function autoBackup() {
    if (settings.autoBackup) {
        saveAllData();
        console.log('تم حفظ النسخة الاحتياطية التلقائية');
    }
}

// تشغيل النسخ الاحتياطي كل 5 دقائق
setInterval(autoBackup, 5 * 60 * 1000);

// وظائف المساعدة
function formatCurrency(amount, currency = 'USD') {
    if (currency === 'USD') {
        return `$${amount.toFixed(2)}`;
    } else {
        return `${amount.toLocaleString()} ل.ل`;
    }
}

function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    
    if (fromCurrency === 'USD' && toCurrency === 'LBP') {
        return amount * settings.exchangeRate;
    } else if (fromCurrency === 'LBP' && toCurrency === 'USD') {
        return amount / settings.exchangeRate;
    }
    return amount;
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i> ${message}`;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin123') {
        currentUser = {
            name: 'المدير',
            role: 'admin'
        };
        
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');
        
        loadDashboard();
        updateCashDrawerDisplay();
        
        // رسالة ترحيب محسنة
        showNotification(`🎉 أهلاً وسهلاً ${currentUser.name}!
✨ تم تسجيل الدخول بنجاح
🛍️ نظام إدارة المبيعات جاهز للاستخدام`, 'success', 4000);
    } else {
        showMessage('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    }
});

// تسجيل الخروج
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm(getText('confirm-logout'))) {
    currentUser = null;
    document.getElementById('mainScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
        showMessage(getText('logout-success'));
    }
});

// التنقل بين الصفحات
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        const targetScreen = this.getAttribute('data-screen');
        
        // إزالة الكلاس النشط من جميع عناصر القائمة
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        
        // إظهار الصفحة المطلوبة
        document.getElementById(targetScreen).classList.add('active');
        
        // تحميل بيانات الصفحة
        switch(targetScreen) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'pos':
                loadPOS();
                break;
            case 'products':
                loadProducts();
                // لا حاجة لإدارة قفل تمرير
                break;
            case 'sales':
                loadSales();
                // لا حاجة لإدارة قفل تمرير
            // تطبيق الترجمات على صفحة المبيعات
            setTimeout(() => {
                translateSales();
            }, 100);
                break;
            case 'customers':
                loadCustomers();
                // لا حاجة لإدارة قفل تمرير
                break;
            case 'suppliers':
                loadSuppliers();
                // لا حاجة لإدارة قفل تمرير
                break;
            case 'settings':
                loadSettings();
                // لا حاجة لإدارة قفل تمرير
                break;
        }
    });
});

// تحميل لوحة التحكم
function loadDashboard() {
    const todayRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const todaySales = sales.length;
    const totalProducts = products.length;
    const totalCustomers = customers.length;
    
    document.getElementById('todayRevenue').textContent = formatCurrency(todayRevenue);
    document.getElementById('todaySales').textContent = todaySales;
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalCustomers').textContent = totalCustomers;
    
    // تحديث الشريط العلوي والصندوق
    updateCashDrawerDisplay();
    
    // تحديث إضافي للتأكد من عرض القيم الصحيحة
    setTimeout(() => {
        updateCashDrawerDisplay();
    }, 500);
    // لا حاجة لإدارة قفل تمرير
}

// تحميل نقطة البيع
function loadPOS() {
    displayProducts(''); // إخفاء المنتجات افتراضياً
    updateCart();
    updateCashDrawerDisplay();
    // إلغاء قفل التمرير: سنعتمد على سلوك العربة الافتراضي فقط
    
    // ربط event listener لتغيير نوع السعر
    const priceTypeSelect = document.getElementById('priceType');
    if (priceTypeSelect) {
        priceTypeSelect.addEventListener('change', function() {
            currentPriceType = this.value;
            displayProducts();
            updateCart();
        });
    }
    
    // ربط event listener لتغيير العملة
    const currencySelect = document.getElementById('currency');
    if (currencySelect) {
        currencySelect.addEventListener('change', function() {
            updateCart();
            updateCashDrawerDisplay();
        });
    }
    
    // ربط event listener للبحث
    const searchInput = document.getElementById('productSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            displayProducts(searchTerm);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                displayProducts(searchTerm);
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = document.getElementById('productSearch').value.trim();
            displayProducts(searchTerm);
        });
    }
    
    // ربط event listeners للدفع
    setupPaymentHandlers();
    
    // ربط event listener لمسح العربة
    const clearCartBtn = document.getElementById('clearCart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (confirm('هل أنت متأكد من مسح العربة؟')) {
                cart = [];
                updateCart();
                showMessage('تم مسح العربة', 'success');
            }
        });
    }
    
    // ربط event listener لتغيير طريقة الدفع (موحد لكافة الأنماط: نقدي/جزئي/دين)
    const paymentMethodSelect = document.getElementById('paymentMethod');
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', function() {
            const cashSection = document.getElementById('cashPaymentSection');
            const partialSection = document.getElementById('partialPaymentSection');
            const creditSection = document.getElementById('creditSaleSection');
            if (cashSection) cashSection.style.display = 'none';
            if (partialSection) partialSection.style.display = 'none';
            if (creditSection) creditSection.style.display = 'none';
            if (this.value === 'cash') {
                if (cashSection) cashSection.style.display = 'block';
            } else if (this.value === 'partial') {
                if (partialSection) partialSection.style.display = 'block';
            } else if (this.value === 'credit') {
                if (creditSection) creditSection.style.display = 'block';
                // تأكد من تعبئة قائمة العملاء وتحديث معلومات الائتمان
                setTimeout(() => {
                    if (typeof updateCustomerSelectForCredit === 'function') {
                        updateCustomerSelectForCredit();
                    }
                }, 50);
            }
        });
    }
    
    // تحديث عرض العملاء في الدفع الجزئي
    updateCustomerSelect();
    
    // تحديث سعر الصرف
    updateExchangeRateDisplay();
}
function setupCashPaymentInterface() {
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const cashPaymentSection = document.getElementById('cashPaymentSection');
    const calculateChangeBtn = document.getElementById('calculateChange');
    
    // تحقق من وجود الزر قبل إضافة الحدث
    if (calculateChangeBtn) {
    calculateChangeBtn.addEventListener('click', function() {
        calculateAndDisplayChange();
    });
    }
    
    // تحديث المبلغ المطلوب تلقائياً
    const amountPaidInput = document.getElementById('amountPaid');
    if (amountPaidInput) {
        amountPaidInput.addEventListener('input', function() {
        if (this.value && this.value > 0) {
            calculateAndDisplayChange();
        } else {
                const changeDetails = document.getElementById('changeDetails');
                if (changeDetails) {
                    changeDetails.style.display = 'none';
                }
        }
    });
    }
    
    // تحديث عند تغيير العملة
    const paymentCurrencySelect = document.getElementById('paymentCurrency');
    if (paymentCurrencySelect) {
        paymentCurrencySelect.addEventListener('change', function() {
            const amountPaid = document.getElementById('amountPaid');
            if (amountPaid && amountPaid.value) {
            calculateAndDisplayChange();
        }
    });
    }
    
    const changeCurrencySelect = document.getElementById('changeCurrency');
    if (changeCurrencySelect) {
        changeCurrencySelect.addEventListener('change', function() {
            const amountPaid = document.getElementById('amountPaid');
            if (amountPaid && amountPaid.value) {
            calculateAndDisplayChange();
        }
    });
    }
    

}

function updateCashDrawerDisplay() {
    try {
    // تحديث الشريط العلوي
        const headerUSD = document.getElementById('headerDrawerUSD');
        const headerLBP = document.getElementById('headerDrawerLBP');
        
        if (headerUSD) {
            headerUSD.textContent = formatCurrency(cashDrawer.cashUSD || 0, 'USD');
        }
        
        if (headerLBP) {
            headerLBP.textContent = formatCurrency(cashDrawer.cashLBP || 0, 'LBP');
        }
        
        // تحديث الإعدادات إذا كانت مفتوحة
        const currentUSD = document.getElementById('currentUSD');
        const currentLBP = document.getElementById('currentLBP');
        
        if (currentUSD) {
            currentUSD.textContent = formatCurrency(cashDrawer.cashUSD || 0, 'USD');
        }
        
        if (currentLBP) {
            currentLBP.textContent = formatCurrency(cashDrawer.cashLBP || 0, 'LBP');
        }
        
        console.log('تم تحديث عرض الصندوق:', {
            USD: cashDrawer.cashUSD,
            LBP: cashDrawer.cashLBP
        });
        
    } catch (error) {
        console.error('خطأ في تحديث عرض الصندوق:', error);
    }
}

function calculateAndDisplayChange() {
    try {
        const finalTotalElement = document.getElementById('finalTotal');
        const currencyElement = document.getElementById('currency');
        const amountPaidElement = document.getElementById('amountPaid');
        const paymentCurrencyElement = document.getElementById('paymentCurrency');
        const changeCurrencyElement = document.getElementById('changeCurrency');
        const changeDetailsElement = document.getElementById('changeDetails');

        // التحقق من وجود العناصر المطلوبة
        if (!finalTotalElement || !currencyElement || !amountPaidElement || !paymentCurrencyElement || !changeDetailsElement) {
            console.warn('بعض عناصر حساب الباقي غير موجودة');
            return;
        }

        const finalTotalText = finalTotalElement.textContent;
        const currency = currencyElement.value;
        
        // استخراج المبلغ الإجمالي بدقة أكبر
        let totalDue = 0;
    if (currency === 'USD') {
            totalDue = parseFloat(finalTotalText.replace(/[$,]/g, '')) || 0;
    } else {
            const cleanText = finalTotalText.replace(/[ل.,\s]/g, '');
            totalDue = parseFloat(cleanText) || 0;
            // تحويل من ليرة إلى دولار للحساب
            totalDue = totalDue / settings.exchangeRate;
        }
        
        const amountPaid = parseFloat(amountPaidElement.value) || 0;
        const paymentCurrency = paymentCurrencyElement.value;
        const preferredChangeCurrency = changeCurrencyElement ? changeCurrencyElement.value || null : null;
    
    if (amountPaid === 0) {
            changeDetailsElement.style.display = 'none';
        return;
    }
    
        // تحويل المبلغ الإجمالي لعملة الدفع
    let totalInPaymentCurrency = totalDue;
    
    if (currency === 'USD' && paymentCurrency === 'LBP') {
        totalInPaymentCurrency = totalDue * settings.exchangeRate;
        } else if (currency === 'LBP' && paymentCurrency === 'USD') {
        totalInPaymentCurrency = totalDue / settings.exchangeRate;
        } else if (currency === 'LBP' && paymentCurrency === 'LBP') {
        totalInPaymentCurrency = totalDue * settings.exchangeRate;
    }
        
        // تقريب الأرقام لتجنب مشاكل الفاصلة العائمة
        totalInPaymentCurrency = Math.round(totalInPaymentCurrency * 100) / 100;
    
    const changeResult = calculateOptimalChange(totalInPaymentCurrency, amountPaid, paymentCurrency, preferredChangeCurrency);
    displayChangeDetails(changeResult, totalInPaymentCurrency, amountPaid, paymentCurrency);
        
    } catch (error) {
        console.error('خطأ في حساب الباقي:', error);
        const changeDetailsElement = document.getElementById('changeDetails');
        if (changeDetailsElement) {
            changeDetailsElement.innerHTML = '<div class="error-message">خطأ في حساب الباقي. يرجى المحاولة مرة أخرى.</div>';
            changeDetailsElement.style.display = 'block';
        }
    }
}

function displayChangeDetails(changeResult, totalDue, amountPaid, paymentCurrency) {
    const changeDetailsDiv = document.getElementById('changeDetails');
    
    let html = `
        <div class="change-summary">
            <h4><i class="fas fa-receipt"></i> تفاصيل المعاملة</h4>
            <div class="transaction-row">
                <span>المبلغ المطلوب:</span>
                <span>${formatCurrency(totalDue, paymentCurrency)}</span>
            </div>
            <div class="transaction-row">
                <span>المبلغ المدفوع:</span>
                <span>${formatCurrency(amountPaid, paymentCurrency)}</span>
            </div>
    `;
    
    if (amountPaid < totalDue) {
        const shortage = totalDue - amountPaid;
        html += `
            <div class="transaction-row error">
                <span>المبلغ ناقص:</span>
                <span>${formatCurrency(shortage, paymentCurrency)}</span>
            </div>
        `;
    } else if (amountPaid > totalDue) {
        if (changeResult.canGiveChange) {
            if (changeResult.breakdown) {
                html += `
                    <div class="transaction-row success">
                        <span>الباقي - عملات مختلطة:</span>
                        <div class="mixed-change">
                `;
                if (changeResult.breakdown.USD > 0) {
                    html += `<span>${formatCurrency(changeResult.breakdown.USD, 'USD')}</span>`;
                }
                if (changeResult.breakdown.LBP > 0) {
                    html += `<span>${formatCurrency(changeResult.breakdown.LBP, 'LBP')}</span>`;
                }
                html += `</div></div>`;
            } else {
                html += `
                    <div class="transaction-row success">
                        <span>الباقي:</span>
                        <span>${formatCurrency(changeResult.change, changeResult.currency)}</span>
                    </div>
                `;
            }
            
            if (changeResult.note) {
                html += `<div class="change-note">${changeResult.note}</div>`;
            }
        } else {
            html += `
                <div class="transaction-row error">
                    <span>تحذير:</span>
                    <span>لا توجد نقدية كافية لإعطاء الباقي</span>
                </div>
            `;
        }
    } else {
        html += `
            <div class="transaction-row success">
                <span>المبلغ مضبوط!</span>
                <span><i class="fas fa-check-circle"></i></span>
            </div>
        `;
    }
    
    html += '</div>';
    
    changeDetailsDiv.innerHTML = html;
    changeDetailsDiv.style.display = 'block';
}
function displayProducts(searchTerm = '') {
    console.log('displayProducts تم استدعاؤها بمصطلح البحث:', searchTerm); // للتشخيص
    
    const container = document.getElementById('productsGrid');
    const currency = document.getElementById('currency').value;
    
    if (!container) {
        console.log('لم يتم العثور على productsGrid container');
        return;
    }
    
    container.innerHTML = '';
    
    // إذا لم يكن هناك مصطلح بحث، نعرض كل المنتجات لتسريع العمل
    if (!searchTerm || searchTerm.trim() === '') {
        searchTerm = '';
    }
    
    const filteredProducts = products.filter(product => 
        searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode || '').includes(searchTerm)
    );
    
    console.log('عدد المنتجات المفلترة:', filteredProducts.length); // للتشخيص
    console.log('المنتجات المفلترة:', filteredProducts); // للتشخيص
    
    // إذا لم توجد نتائج
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-products-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>لم يتم العثور على منتجات</h3>
                <p>جرب البحث بكلمات مختلفة أو تحقق من الباركود</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const price = getProductPrice(product, currentPriceType, currency);
        const priceFormatted = formatCurrency(price, currency);
        
        // إنشاء عرض الأسعار المختلفة
        let priceDisplay = `<div class="price main-price">${priceFormatted}</div>`;
        
        // إضافة الأسعار الأخرى إذا كانت متوفرة
        if (product.prices) {
            const isEn = (document.documentElement.lang || 'ar') === 'en';
            const priceTypes = isEn ? { retail: 'Retail', wholesale: 'Wholesale', vip: 'VIP' } : { retail: 'مفرق', wholesale: 'جملة', vip: 'مميز' };
            
            let otherPrices = '';
            Object.keys(product.prices).forEach(type => {
                if (type !== currentPriceType) {
                    const otherPrice = getProductPrice(product, type, currency);
                    const otherPriceFormatted = formatCurrency(otherPrice, currency);
                    otherPrices += `<small class="other-price">${priceTypes[type]}: ${otherPriceFormatted}</small>`;
                }
            });
            
            if (otherPrices) {
                priceDisplay += `<div class="other-prices">${otherPrices}</div>`;
            }
        }
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card clickable';
        productCard.dataset.id = String(product.id);
        productCard.innerHTML = `
            <h4>${product.name}</h4>
            ${priceDisplay}
            <div class="stock">${(document.documentElement.lang||'ar')==='en' ? 'In stock' : 'متوفر'}: ${product.stock}</div>
            <div class="price-type-indicator">${getPriceTypeLabel(currentPriceType)}</div>
            <div class="add-to-cart-hint">
                <i class="fas fa-plus-circle"></i>
                <span>انقر للإضافة</span>
            </div>
        `;
        
        // إضافة event listener مباشر
        productCard.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('تم النقر على المنتج:', product.name); // للتأكد من أن النقر يعمل
            addToCart(product);
            showMessage(`تم إضافة ${product.name} إلى العربة`, 'success');
        };
        
        // إضافة تأثير hover
        productCard.onmouseenter = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        };
        
        productCard.onmouseleave = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        };
        
        container.appendChild(productCard);
    });
    
    // إضافة event delegation كطريقة بديلة
    container.addEventListener('click', function(e) {
        const productCard = e.target.closest('.product-card');
        if (productCard) {
            const productId = parseInt(productCard.dataset.id);
            const product = products.find(p => p.id === productId);
            if (product) {
                console.log('تم النقر على المنتج عبر delegation:', product.name);
                addToCart(product);
                showMessage(`تم إضافة ${product.name} إلى العربة`, 'success');
            }
        }
    });
}

function addToCart(product) {
    console.log('محاولة إضافة المنتج:', product.name); // للتشخيص
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
            console.log('تم زيادة الكمية للمنتج الموجود:', product.name);
        } else {
            showMessage('الكمية المطلوبة غير متوفرة', 'error');
            return;
        }
    } else {
        cart.push({
            ...product,
            quantity: 1,
            selectedPriceType: currentPriceType,  // حفظ نوع السعر المختار
            customPriceUSD: undefined
        });
        console.log('تم إضافة منتج جديد للعربة:', product.name);
    }
    
    // تحديث العربة والحسابات
    // إذا كان موجودًا، احتفظ بالمؤشر للتمركز بعد التحديث
    if (existingItem) {
        lastCartFocusIndex = cart.findIndex(it => it.id === product.id);
    } else {
        lastCartFocusIndex = cart.length; // العنصر الجديد في النهاية
    }
    updateCart();
    // إبراز العربة والتمرير إليها لضمان ظهورها مهما كان الزوم
    setTimeout(() => {
        const cartWrap = document.getElementById('cartSection') || document.getElementById('cartItems');
        if (cartWrap) {
            // إلغاء أي تمرير تلقائي عند الإضافة حتى لا ترتفع القوائم
            try {
                cartWrap.classList.add('cart-flash');
                setTimeout(() => cartWrap.classList.remove('cart-flash'), 800);
            } catch(e) {}
        }
    }, 50);
    
    // تحديث فوري للحسابات إذا كانت موجودة
    setTimeout(() => {
        // تحديث حساب الباقي للدفع النقدي
        const amountPaid = document.getElementById('amountPaid');
        if (amountPaid && amountPaid.value && amountPaid.value > 0) {
            calculateAndDisplayChange();
        }
        
        // تحديث حساب الدين للدفع الجزئي
        const paymentMethod = document.getElementById('paymentMethod');
        if (paymentMethod && paymentMethod.value === 'partial') {
            const partialAmount = document.getElementById('partialAmount');
            const customerSelect = document.getElementById('customerSelect');
            if (partialAmount && partialAmount.value && customerSelect && customerSelect.value) {
                calculateAndDisplayCredit();
            }
        }
    }, 50);
}

function updateCart() {
    // حفظ موضع التمرير أو الفهرس للتمركز بعد إعادة الرسم
    const container = document.getElementById('cartItems');
    const previousScrollTop = container ? container.scrollTop : 0;
    console.log('تحديث العربة، عدد العناصر:', cart.length); // للتشخيص
    
    // تمت تهيئة container أعلاه
    const horizontalContainer = document.getElementById('cartItemsHorizontalPos');
    const currency = document.getElementById('currency').value;
    
    if (!container) {
        console.log('لم يتم العثور على container للعربة');
        return;
    }
    
    container.innerHTML = '';
    
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-state">${getText('cart-empty')}<br><small>${getText('click-to-add')}</small></div>`;
        if (horizontalContainer) {
            horizontalContainer.innerHTML = '<div class="cart-empty-horizontal-pos">🛒 العربة فارغة - انقر على المنتجات لإضافتها</div>';
        }
        document.getElementById('subtotal').textContent = formatCurrency(0, currency);
        document.getElementById('finalTotal').textContent = formatCurrency(0, currency);
        
        // تحديث الملخص الأفقي
        updateHorizontalCartSummary(0, 0);
        
        // إخفاء تفاصيل الباقي عندما تكون العربة فارغة
        const changeDetails = document.getElementById('changeDetails');
        if (changeDetails) {
            changeDetails.style.display = 'none';
        }
        return;
    }
    
    let subtotal = 0;
    let totalItems = 0;
    
    // تحديث العربة العمودية
    cart.forEach((item, index) => {
        // استخدام السعر المحفوظ مع المنتج في السلة
        const priceType = item.selectedPriceType || currentPriceType;
        const baseUSD = getProductPrice(item, priceType, 'USD');
        // إذا كان هناك سعر مخصص، طبّقه على العملتين
        let price;
        if (typeof item.customPriceUSD === 'number') {
            price = currency === 'USD' ? item.customPriceUSD : Math.round(item.customPriceUSD * (settings.exchangeRate || 1));
        } else {
            price = getProductPrice(item, priceType, currency);
        }
        const total = price * item.quantity;
        subtotal += total;
        totalItems += item.quantity;
        
        const priceTypeLabel = getPriceTypeLabel(priceType);
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        // حساب نسبة الخصم للعرض
        let discountPct = 0;
        if (typeof item.customPriceUSD === 'number' && item.customPriceUSD < baseUSD) {
            discountPct = +(((baseUSD - item.customPriceUSD) / baseUSD) * 100).toFixed(1);
        }
        cartItem.innerHTML = `
            <div class="item-info">
                <span class="item-name">${item.name}</span>
                <span class="item-price">${formatCurrency(price, currency)} <small class="price-type-tag">${priceTypeLabel}</small>
                    <button type="button" title="سعر سريع" onclick="quickEditPrice(${index})" style="margin-inline-start:6px;padding:2px 6px;font-size:11px;border:1px solid #d1d5db;border-radius:6px;background:#fff;cursor:pointer;">✎</button>
                </span>
                <div class="inline-edit-price" style="margin-top:6px;display:flex;align-items:center;gap:8px;">
                    <button type="button" class="edit-price-btn" onclick="togglePriceEdit(${index})" title="${(document.documentElement.lang||'ar')==='en' ? 'Edit Price' : 'تعديل السعر'}" style="padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;background:#f8fafc;cursor:pointer;">
                        <i class="fas fa-edit"></i> ${(document.documentElement.lang||'ar')==='en' ? 'Edit Price' : 'تعديل السعر'}
                    </button>
                    <div class="edit-price-field" id="editPriceWrap_${index}" style="display:flex;align-items:center;gap:6px;">
                        <input type="number" step="0.01" value="${price}" min="0" id="customPrice_${index}" style="width:110px;padding:6px 8px;border:2px solid #a7f3d0;border-radius:8px;background:#ecfeff;font-weight:700;" placeholder="سعر جديد" oninput="updateItemCustomPrice(${index}, this.value)" onkeydown="if(event.key==='Enter'){updateItemCustomPrice(${index}, this.value)}">
                        <span style="font-size:12px;color:#64748b;">${currency}</span>
                    </div>
                    <small class="discount-note" id="discountNote_${index}" style="color:#16a34a;font-weight:700;${discountPct>0 ? '' : 'display:none;'}">${discountPct>0 ? `خصم ${discountPct}%` : ''}</small>
                </div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="changeQuantity(${index}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="changeQuantity(${index}, 1)">+</button>
            </div>
            <div class="item-total">${formatCurrency(total, currency)}</div>
            <button class="remove-btn" onclick="removeFromCart(${index})">×</button>
        `;
        
        container.appendChild(cartItem);
    });
    
    // تحديث العربة الأفقية
    updateHorizontalCart(cart, currency);
    
    // تحديث الملخص الأفقي
    updateHorizontalCartSummary(totalItems, subtotal);
    
    // بدون ضريبة - المجموع النهائي = المجموع الفرعي
    const finalTotal = subtotal;
    
    document.getElementById('subtotal').textContent = formatCurrency(subtotal, currency);
    document.getElementById('finalTotal').textContent = formatCurrency(finalTotal, currency);
    
    // حساب الباقي تلقائياً إذا كان هناك مبلغ مدفوع
    const amountPaidField = document.getElementById('amountPaid');
    if (amountPaidField && amountPaidField.value && amountPaidField.value > 0) {
        // تأخير صغير لضمان تحديث DOM
        setTimeout(() => {
        calculateAndDisplayChange();
        }, 50);
    } else if (cart.length === 0) {
        // إخفاء تفاصيل الباقي عندما تكون العربة فارغة
        const changeDetails = document.getElementById('changeDetails');
        if (changeDetails) {
            changeDetails.style.display = 'none';
        }
    }
    
    // تحديث حسابات الدفع الجزئي إذا كانت مفعلة
    const paymentMethod = document.getElementById('paymentMethod');
    if (paymentMethod && paymentMethod.value === 'partial') {
        const partialAmount = document.getElementById('partialAmount');
        const customerSelect = document.getElementById('customerSelect');
        if (partialAmount && partialAmount.value && customerSelect && customerSelect.value) {
            setTimeout(() => {
                calculateAndDisplayCredit();
            }, 50);
        }
    }
    // استعادة موضع التمرير أو التمركز على العنصر الذي تم تعديله
    if (container) {
        if (typeof lastCartFocusIndex === 'number' && lastCartFocusIndex !== null) {
            const items = Array.from(container.querySelectorAll('.cart-item'));
            const clampedIndex = Math.max(0, Math.min(items.length - 1, lastCartFocusIndex));
            const target = items[clampedIndex];
            // لا تقوم بالتمرير التلقائي؛ فقط حافظ على موضع التمرير السابق
        } else {
            container.scrollTop = previousScrollTop;
        }
    }
}

function changeQuantity(index, change) {
    const item = cart[index];
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(index);
        return;
    }
    
    if (newQuantity > item.stock) {
        showMessage('الكمية المطلوبة غير متوفرة', 'error');
        return;
    }
    
    cart[index].quantity = newQuantity;
    lastCartFocusIndex = index;
    
    // تحديث العربة والحسابات
    updateCart();
    
    // تحديث فوري للحسابات إذا كانت موجودة
    setTimeout(() => {
        // تحديث حساب الباقي للدفع النقدي
        const amountPaid = document.getElementById('amountPaid');
        if (amountPaid && amountPaid.value && amountPaid.value > 0) {
            calculateAndDisplayChange();
        }
        
        // تحديث حساب الدين للدفع الجزئي
        const paymentMethod = document.getElementById('paymentMethod');
        if (paymentMethod && paymentMethod.value === 'partial') {
            const partialAmount = document.getElementById('partialAmount');
            const customerSelect = document.getElementById('customerSelect');
            if (partialAmount && partialAmount.value && customerSelect && customerSelect.value) {
                calculateAndDisplayCredit();
            }
        }
    }, 50);
}

function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    updateCart();
    showMessage(`تم حذف ${removedItem.name} من العربة`);
}

// مسح العربة (مفيد لإعادة الاستخدام عند إتمام البيع أو الإلغاء)
function clearCart() {
    cart = [];
    updateCart();
}
// معالجة الدفع
document.getElementById('processPayment').addEventListener('click', function() {
    if (cart.length === 0) {
        showMessage('العربة فارغة', 'error');
        return;
    }
    
    const currency = document.getElementById('currency').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    // للدفع الجزئي، نحتاج للتحقق من العميل والمبلغ
    if (paymentMethod === 'partial') {
        const customerId = parseInt(document.getElementById('customerSelect').value);
        const paidAmount = parseFloat(document.getElementById('partialAmount').value) || 0;
        const partialCurrency = document.getElementById('partialCurrency').value;
        
        if (!customerId) {
            showMessage('يرجى اختيار عميل للدفع الجزئي', 'error');
            return;
        }
        
        if (paidAmount <= 0) {
            showMessage('يرجى إدخال مبلغ مدفوع صحيح', 'error');
            return;
        }
        
        const customer = customers.find(c => c.id === customerId);
        if (!customer) {
            showMessage('العميل غير موجود', 'error');
            return;
        }
        
        // حساب الفاتورة والدين
        const finalTotalText = document.getElementById('finalTotal').textContent;
        let totalDue;
        if (currency === 'USD') {
            totalDue = parseFloat(finalTotalText.replace('$', '').replace(',', ''));
        } else {
            totalDue = parseFloat(finalTotalText.replace(' ل.ل', '').replace(/,/g, '')) / settings.exchangeRate;
        }
        
        let paidInUSD = paidAmount;
        if (partialCurrency === 'LBP') {
            paidInUSD = paidAmount / settings.exchangeRate;
        }
        
        const remainingDebt = totalDue - paidInUSD;
        const newTotalDebt = customer.creditBalance + remainingDebt;
        
        // التحقق من الحد الائتماني
        if (newTotalDebt > customer.creditLimit) {
            const excess = newTotalDebt - customer.creditLimit;
            if (!confirm(`سيتجاوز الدين الحد المسموح بمقدار ${formatCurrency(excess)}. هل تريد المتابعة؟`)) {
                return;
            }
        }
        
        // تحديث الصندوق بالمبلغ المدفوع
        if (partialCurrency === 'USD') {
            cashDrawer.cashUSD += paidAmount;
        } else {
            cashDrawer.cashLBP += paidAmount;
        }
        
        // حفظ الصندوق وتحديث العرض
        cashDrawer.lastUpdate = new Date().toISOString();
        saveToStorage('cashDrawer', cashDrawer);
        updateCashDrawerDisplay();
        
        // إضافة الدين للعميل
        const success = addCreditToCustomer(customerId, remainingDebt, `فاتورة رقم INV-${(sales.length + 1).toString().padStart(3, '0')}`);
        
        if (!success) {
            showMessage('خطأ في إضافة الدين للعميل', 'error');
            return;
        }
        
        console.log(`تم إضافة دين ${remainingDebt}$ للعميل ${customer.name}. الدين الجديد: ${customer.creditBalance}$`);
        
    } else if (paymentMethod === 'credit') {
        processCreditSale();
    } else if (paymentMethod === 'cash') {
        const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
        if (amountPaid === 0) {
            showMessage('يرجى إدخال المبلغ المدفوع', 'error');
            return;
        }
        
        const finalTotalText = document.getElementById('finalTotal').textContent;
        let totalDue;
        if (currency === 'USD') {
            totalDue = parseFloat(finalTotalText.replace('$', '').replace(',', ''));
        } else {
            totalDue = parseFloat(finalTotalText.replace(' ل.ل', '').replace(/,/g, ''));
        }
        
        const paymentCurrency = document.getElementById('paymentCurrency').value;
        const preferredChangeCurrency = document.getElementById('changeCurrency').value || null;
        
        // تحويل المبلغ الإجمالي لعملة الدفع
        let totalInPaymentCurrency = totalDue;
        if (currency !== paymentCurrency) {
            if (currency === 'USD' && paymentCurrency === 'LBP') {
                totalInPaymentCurrency = totalDue * settings.exchangeRate;
            } else if (currency === 'LBP' && paymentCurrency === 'USD') {
                totalInPaymentCurrency = totalDue / settings.exchangeRate;
            }
        }
        
        if (amountPaid < totalInPaymentCurrency) {
            const completeRemainderEnabled = window.__completeRemainderLBP__ === true;
            if (!completeRemainderEnabled) {
                showMessage(`المبلغ المدفوع أقل من المطلوب. الناقص: ${formatCurrency(totalInPaymentCurrency - amountPaid, paymentCurrency)}`, 'error');
                return;
            }
        }
        
        // حساب الباقي (مع أخذ الإكمال بالليرة بعين الاعتبار)
        const completeRemainderEnabled = window.__completeRemainderLBP__ === true;
        let mixedLBPRemainder = 0;
        if (completeRemainderEnabled && amountPaid < totalInPaymentCurrency) {
            const remainingInPaymentCurrency = totalInPaymentCurrency - amountPaid;
            mixedLBPRemainder = paymentCurrency === 'LBP' ? remainingInPaymentCurrency : Math.round(remainingInPaymentCurrency * (settings.exchangeRate || 1));
        }
        const changeResult = completeRemainderEnabled && mixedLBPRemainder > 0
            ? { canGiveChange: true, change: 0, currency: paymentCurrency }
            : calculateOptimalChange(totalInPaymentCurrency, amountPaid, paymentCurrency, preferredChangeCurrency);
        
        if (!changeResult.canGiveChange && changeResult.change > 0) {
            if (!confirm('لا توجد نقدية كافية لإعطاء الباقي. هل تريد المتابعة؟')) {
                return;
            }
        }
        
        // تحديث الصندوق - إضافة المبلغ المستلم
        if (paymentCurrency === 'USD') { cashDrawer.cashUSD += amountPaid; } else { cashDrawer.cashLBP += amountPaid; }
        if (mixedLBPRemainder > 0) { cashDrawer.cashLBP += mixedLBPRemainder; }
        
        // خصم الباقي المُعطى
        if (mixedLBPRemainder === 0 && changeResult.breakdown) {
            // عملات مختلطة
            if (changeResult.breakdown.USD > 0) {
                cashDrawer.cashUSD -= changeResult.breakdown.USD;
            }
            if (changeResult.breakdown.LBP > 0) {
                cashDrawer.cashLBP -= changeResult.breakdown.LBP;
            }
        } else if (mixedLBPRemainder === 0 && changeResult.change > 0) {
            if (changeResult.currency === 'USD') {
                cashDrawer.cashUSD -= changeResult.change;
            } else {
                cashDrawer.cashLBP -= changeResult.change;
            }
        }
        
        // تسجيل المعاملة
        cashDrawer.transactions.push({
            timestamp: new Date().toISOString(),
            type: 'sale',
            amountReceived: amountPaid,
            receivedCurrency: paymentCurrency,
            changeGiven: changeResult.breakdown ? 
                (changeResult.breakdown.USD + changeResult.breakdown.LBP / settings.exchangeRate) : 
                changeResult.change,
            changeCurrency: changeResult.currency,
            details: mixedLBPRemainder > 0 ? `دفعة مختلطة: ${amountPaid} ${paymentCurrency} + ${mixedLBPRemainder.toLocaleString()} ل.ل` : undefined,
            balanceAfter: {
                USD: cashDrawer.cashUSD,
                LBP: cashDrawer.cashLBP
            }
        });
        
        cashDrawer.lastUpdate = new Date().toISOString();
        saveToStorage('cashDrawer', cashDrawer);
        
        // تحديث عرض الصندوق فوراً
        updateCashDrawerDisplay();
    }
    
    let total = 0;
    const saleItems = [];
    
    cart.forEach(item => {
        // اعتماد السعر المخصص إن وجد (USD) ثم تحويله عند الحاجة
        let baseUSD = item.customPriceUSD != null ? item.customPriceUSD : item.priceUSD;
        const price = currency === 'USD' ? baseUSD : Math.round(baseUSD * settings.exchangeRate);
        total += price * item.quantity;
        
        // حساب الخصم إن وُجد
        const originalUSD = item.priceUSD;
        const discountUSD = Math.max(0, originalUSD - baseUSD);
        const discountPct = originalUSD > 0 ? +(discountUSD / originalUSD * 100).toFixed(1) : 0;
        saleItems.push({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: price,
            originalPriceUSD: originalUSD,
            finalPriceUSD: baseUSD,
            discountUSD: discountUSD,
            discountPct: discountPct
        });
        
        // تحديث المخزون
        const product = products.find(p => p.id === item.id);
        if (product) {
            product.stock -= item.quantity;
        }
    });
    
    // بدون ضريبة - المجموع النهائي = المجموع الفرعي
    const finalTotal = total;
    
    // إنشاء فاتورة جديدة
    let customerName = 'عميل عادي';
    let customerId = null;
    
    // إذا كان دفع جزئي، الحصول على معلومات العميل
    if (paymentMethod === 'partial') {
        customerId = parseInt(document.getElementById('customerSelect').value);
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            customerName = customer.name;
        }
    }
    
    const newSale = {
        id: sales.length + 1,
        invoiceNumber: `INV-${(sales.length + 1).toString().padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        customer: customerName,
        customerId: customerId,
        amount: currency === 'USD' ? finalTotal : convertCurrency(finalTotal, 'LBP', 'USD'),
        paymentMethod: getPaymentMethodText(paymentMethod),
        items: saleItems
    };
    
    // إضافة تفاصيل الدفع للفاتورة
    if (paymentMethod === 'cash') {
        const amountPaid = parseFloat(document.getElementById('amountPaid').value);
        const paymentCurrency = document.getElementById('paymentCurrency').value;
        
        newSale.cashDetails = {
            amountPaid: amountPaid,
            paymentCurrency: paymentCurrency,
            change: amountPaid - (currency === paymentCurrency ? finalTotal : 
                   (currency === 'USD' && paymentCurrency === 'LBP' ? finalTotal * settings.exchangeRate :
                    finalTotal / settings.exchangeRate))
        };
    } else if (paymentMethod === 'partial') {
        const customerId = parseInt(document.getElementById('customerSelect').value);
        const paidAmount = parseFloat(document.getElementById('partialAmount').value);
        const partialCurrency = document.getElementById('partialCurrency').value;
        const customer = customers.find(c => c.id === customerId);
        
        newSale.partialDetails = {
            customerId: customerId,
            customerName: customer.name,
            amountPaid: paidAmount,
            paymentCurrency: partialCurrency,
            debtAmount: finalTotal - (partialCurrency === currency ? paidAmount : 
                       (partialCurrency === 'USD' && currency === 'LBP' ? paidAmount * settings.exchangeRate :
                        paidAmount / settings.exchangeRate))
        };
    }
    
    sales.push(newSale);
    saveAllData();
    // حفظ سجل المبيعات العام
    const salesLogs = loadFromStorage('salesLogs', []);
    salesLogs.push({
        timestamp: new Date().toLocaleString(),
        invoiceNumber: newSale.invoiceNumber,
        amount: newSale.amount,
        currency,
        method: newSale.paymentMethod,
        customer: newSale.customer || '-',
        user: currentUser || 'المستخدم'
    });
    saveToStorage('salesLogs', salesLogs);
    
    // إفراغ العربة وتنظيف الواجهة
    cart = [];
    updateCart();
    displayProducts();
    
    // تحديث الصندوق فوراً وحفظ البيانات
    saveToStorage('cashDrawer', cashDrawer);
    updateCashDrawerDisplay();
    
    // تحديث إضافي بعد ثانية للتأكد
    setTimeout(() => {
        updateCashDrawerDisplay();
    }, 1000);
    
    // إعادة تعيين واجهة الدفع بالكامل
    // تنظيف جميع الحقول
    const amountPaidField = document.getElementById('amountPaid');
    const partialAmountField = document.getElementById('partialAmount');
    const customerSelectField = document.getElementById('customerSelect');
    const changeDetailsDiv = document.getElementById('changeDetails');
    const creditDetailsDiv = document.getElementById('creditDetails');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const partialPaymentSection = document.getElementById('partialPaymentSection');
    const cashPaymentSection = document.getElementById('cashPaymentSection');
    
    // إعادة تعيين القيم
    if (amountPaidField) amountPaidField.value = '';
    if (partialAmountField) partialAmountField.value = '';
    if (customerSelectField) customerSelectField.value = '';
    if (changeDetailsDiv) {
        changeDetailsDiv.innerHTML = '';
        changeDetailsDiv.style.display = 'none';
    }
    if (creditDetailsDiv) {
        creditDetailsDiv.innerHTML = '';
        creditDetailsDiv.style.display = 'none';
    }
    
    // إعادة تعيين طريقة الدفع للنقدي
    if (paymentMethodSelect) {
        paymentMethodSelect.value = 'cash';
    }
    
    // إظهار قسم الدفع النقدي وإخفاء الجزئي
    if (cashPaymentSection) cashPaymentSection.style.display = 'block';
    if (partialPaymentSection) partialPaymentSection.style.display = 'none';
    
    // تحديث قوائم العملاء
    updateCustomerSelect();
    if (document.getElementById('customers').classList.contains('active')) {
        loadCustomers();
    }
    
    // إظهار إشعار النجاح مفصل
    if (paymentMethod === 'partial') {
        const customer = customers.find(c => c.id === customerId);
        const paidAmount = parseFloat(document.getElementById('partialAmount').value) || 0;
        const partialCurrency = document.getElementById('partialCurrency').value;
        const debtAmount = finalTotal - (partialCurrency === currency ? paidAmount : 
                       (partialCurrency === 'USD' && currency === 'LBP' ? paidAmount * settings.exchangeRate :
                        paidAmount / settings.exchangeRate));
        
        showNotification(`✅ تمت العملية بنجاح!
📄 فاتورة رقم: ${newSale.invoiceNumber}
👤 العميل: ${customer?.name || 'غير محدد'}
💵 مدفوع: ${formatCurrency(paidAmount, partialCurrency)}
💰 دين جديد: ${formatCurrency(debtAmount)}
📊 إجمالي الدين: ${formatCurrency(customer?.creditBalance || 0)}`, 'success', 6000);
    } else {
        showNotification(`✅ تمت المعاملة بنجاح!
📄 رقم الفاتورة: ${newSale.invoiceNumber}
💰 المبلغ: ${formatCurrency(finalTotal, currency)}`, 'success', 4000);
    }
    
    // طباعة تلقائية إذا كانت مفعلة
    if (settings.printAfterSale) {
        setTimeout(() => {
            showInvoice(newSale);
        }, 1000);
    }
});

function getPaymentMethodText(method) {
    const methods = {
        'cash': 'نقدي',
        'partial': 'دفع جزئي (دين)'
    };
    return methods[method] || method;
}
// وظائف نظام الدين والدفع الجزئي
function setupPartialPaymentInterface() {
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const cashPaymentSection = document.getElementById('cashPaymentSection');
    const partialPaymentSection = document.getElementById('partialPaymentSection');
    const creditSaleSection = document.getElementById('creditSaleSection');
    
    // تحقق من وجود العناصر
    if (!paymentMethodSelect) {
        console.error('عنصر paymentMethod غير موجود');
        return;
    }
    if (!cashPaymentSection) {
        console.error('عنصر cashPaymentSection غير موجود');
        return;
    }
    if (!partialPaymentSection) {
        console.error('عنصر partialPaymentSection غير موجود');
        return;
    }
    if (!creditSaleSection) {
        console.error('عنصر creditSaleSection غير موجود');
        return;
    }
    
    // إعداد تبديل أقسام الدفع
    paymentMethodSelect.addEventListener('change', function() {
        // إخفاء جميع الأقسام أولاً
        if (cashPaymentSection) cashPaymentSection.style.display = 'none';
        if (partialPaymentSection) partialPaymentSection.style.display = 'none';
        if (creditSaleSection) creditSaleSection.style.display = 'none';
        
        if (this.value === 'cash') {
            if (cashPaymentSection) cashPaymentSection.style.display = 'block';
        } else if (this.value === 'partial') {
            if (partialPaymentSection) partialPaymentSection.style.display = 'block';
            updateCustomerSelect();
        } else if (this.value === 'credit') {
            if (creditSaleSection) {
                creditSaleSection.style.display = 'block';
                // تحديث قائمة العملاء للبيع بالدين
                setTimeout(() => {
                    updateCustomerSelectForCredit();
                }, 100);
            }
        }
    });
    
    // تطبيق الحالة الابتدائية بحسب القيمة الحالية
    try { paymentMethodSelect.dispatchEvent(new Event('change')); } catch(e) {}
    
    // حساب الدين
    const calculateCreditBtn = document.getElementById('calculateCredit');
    if (calculateCreditBtn) {
        calculateCreditBtn.addEventListener('click', function() {
            calculateAndDisplayCredit();
        });
    }
    
    // تحديث عند تغيير المبلغ أو العميل
    const partialAmountInput = document.getElementById('partialAmount');
    if (partialAmountInput) {
        partialAmountInput.addEventListener('input', function() {
            const customerSelect = document.getElementById('customerSelect');
            if (this.value && customerSelect && customerSelect.value) {
                calculateAndDisplayCredit();
            }
        });
    }
    
    // تحديث تلقائي للمبلغ المدفوع عند تغيير العملة
    const paymentCurrencySelect = document.getElementById('paymentCurrency');
    if (paymentCurrencySelect) {
        paymentCurrencySelect.addEventListener('change', function() {
            const amountField = document.getElementById('amountPaid');
            if (amountField && amountField.value) {
                setTimeout(() => calculateAndDisplayChange(), 100);
            }
        });
    }
    
    // تحديث تلقائي للباقي عند تغيير عملة الباقي
    const changeCurrencySelect = document.getElementById('changeCurrency');
    if (changeCurrencySelect) {
        changeCurrencySelect.addEventListener('change', function() {
            const amountField = document.getElementById('amountPaid');
            if (amountField && amountField.value) {
                setTimeout(() => calculateAndDisplayChange(), 100);
            }
        });
    }
    
    const customerSelectDropdown = document.getElementById('customerSelect');
    if (customerSelectDropdown) {
        customerSelectDropdown.addEventListener('change', function() {
            const partialAmount = document.getElementById('partialAmount');
            if (partialAmount && partialAmount.value && this.value) {
                calculateAndDisplayCredit();
            }
        });
    }
    
    // إعداد مستمعات الأحداث للبيع بالدين
    const creditCustomerSelect = document.getElementById('creditCustomerSelect');
    if (creditCustomerSelect) {
        creditCustomerSelect.addEventListener('change', function() {
            const customerId = parseInt(this.value);
            if (customerId) {
                updateCreditInfo(customerId);
            }
        });
    }
}

function updateCustomerSelect() {
    const select = document.getElementById('customerSelect');
    if (!select) {
        console.error('عنصر customerSelect غير موجود');
        return;
    }
    
    select.innerHTML = '<option value="">اختر عميل...</option>';
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = `${customer.name} - دين حالي: ${formatCurrency(customer.creditBalance || 0)}`;
        select.appendChild(option);
    });
    
    console.log(`تم تحديث قائمة العملاء: ${customers.length} عميل`);
}

function calculateAndDisplayCredit() {
    const customerId = parseInt(document.getElementById('customerSelect').value);
    const paidAmount = parseFloat(document.getElementById('partialAmount').value) || 0;
    const currency = document.getElementById('partialCurrency').value;
    
    if (!customerId || paidAmount <= 0) {
        document.getElementById('creditDetails').style.display = 'none';
        return;
    }
    
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    // حساب المبلغ الإجمالي للفاتورة
    const finalTotalText = document.getElementById('finalTotal').textContent;
    const cartCurrency = document.getElementById('currency').value;
    
    let totalDue;
    if (cartCurrency === 'USD') {
        totalDue = parseFloat(finalTotalText.replace('$', '').replace(',', ''));
    } else {
        totalDue = parseFloat(finalTotalText.replace(' ل.ل', '').replace(/,/g, '')) / settings.exchangeRate;
    }
    
    // تحويل المبلغ المدفوع إلى دولار للحساب
    let paidInUSD = paidAmount;
    if (currency === 'LBP') {
        paidInUSD = paidAmount / settings.exchangeRate;
    }
    
    const remainingDebt = totalDue - paidInUSD;
    const newTotalDebt = customer.creditBalance + remainingDebt;
    
    // التحقق من الحد الأقصى للدين
    const creditExceeded = newTotalDebt > customer.creditLimit;
    
    displayCreditDetails(customer, totalDue, paidInUSD, remainingDebt, newTotalDebt, creditExceeded, currency);
}

function displayCreditDetails(customer, totalDue, paidAmount, remainingDebt, newTotalDebt, creditExceeded, currency) {
    const creditDetailsDiv = document.getElementById('creditDetails');
    
    let html = `
        <div class="credit-summary">
            <h4><i class="fas fa-user-check"></i> تفاصيل حساب ${customer.name}</h4>
            <div class="credit-row">
                <span>إجمالي الفاتورة:</span>
                <span>${formatCurrency(totalDue)}</span>
            </div>
            <div class="credit-row">
                <span>المبلغ المدفوع:</span>
                <span>${formatCurrency(paidAmount, currency)}</span>
            </div>
            <div class="credit-row">
                <span>المبلغ المتبقي (دين جديد):</span>
                <span>${formatCurrency(remainingDebt)}</span>
            </div>
            <div class="credit-row">
                <span>الدين السابق:</span>
                <span>${formatCurrency(customer.creditBalance)}</span>
            </div>
            <div class="credit-row ${creditExceeded ? 'error' : 'success'}">
                <span>إجمالي الدين بعد المعاملة:</span>
                <span>${formatCurrency(newTotalDebt)}</span>
            </div>
            <div class="credit-row">
                <span>الحد الأقصى المسموح:</span>
                <span>${formatCurrency(customer.creditLimit)}</span>
            </div>
    `;
    
    if (creditExceeded) {
        const excess = newTotalDebt - customer.creditLimit;
        html += `
            <div class="credit-warning">
                <i class="fas fa-exclamation-triangle"></i>
                تحذير: الدين سيتجاوز الحد المسموح بمقدار ${formatCurrency(excess)}
            </div>
        `;
    } else {
        const available = customer.creditLimit - newTotalDebt;
        html += `
            <div class="credit-note">
                <i class="fas fa-info-circle"></i>
                سيتبقى ${formatCurrency(available)} من الحد الائتماني
            </div>
        `;
    }
    
    html += '</div>';
    
    creditDetailsDiv.innerHTML = html;
    creditDetailsDiv.style.display = 'block';
}

function addCreditToCustomer(customerId, amount, description) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
        console.error(`العميل غير موجود: ${customerId}`);
        return false;
    }
    
    const oldBalance = customer.creditBalance || 0;
    customer.creditBalance = (customer.creditBalance || 0) + amount;
    
    if (!customer.creditHistory) {
        customer.creditHistory = [];
    }
    
    customer.creditHistory.push({
        date: new Date().toISOString().split('T')[0],
        type: 'purchase',
        amount: amount,
        description: description
    });
    
    console.log(`تحديث دين العميل ${customer.name}:`, {
        oldBalance: oldBalance,
        addedAmount: amount,
        newBalance: customer.creditBalance,
        creditLimit: customer.creditLimit
    });
    
    saveToStorage('customers', customers);
    return true;
}
function viewCreditHistory(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const modal = document.getElementById('reportModal');
    const modalTitle = modal.querySelector('.modal-header h2');
    const modalBody = modal.querySelector('.modal-body');
    
    modalTitle.innerHTML = `<i class="fas fa-history"></i> تاريخ ديون ${customer.name}`;
    
    let html = `
        <div class="credit-history">
            <div class="credit-summary-card">
                <h3>ملخص الحساب</h3>
                <div class="summary-row">
                    <span>الدين الحالي:</span>
                    <span class="amount ${customer.creditBalance > 0 ? 'debt' : 'clear'}">
                        ${formatCurrency(customer.creditBalance)}
                    </span>
                </div>
                <div class="summary-row">
                    <span>الحد الائتماني:</span>
                    <span class="amount">${formatCurrency(customer.creditLimit)}</span>
                </div>
                <div class="summary-row">
                    <span>المتاح:</span>
                    <span class="amount">${formatCurrency(customer.creditLimit - customer.creditBalance)}</span>
                </div>
            </div>
            
            <h3>تاريخ المعاملات</h3>
            <div class="credit-history-table">
    `;
    
    const langCH = document.documentElement.lang || 'ar';
    const tCH = langCH === 'en'
        ? { title: 'Transactions History', date: 'Date', type: 'Type', amount: 'Amount', desc: 'Description', purchase: 'Purchase', pay: 'Payment', empty: 'No history' }
        : { title: 'تاريخ المعاملات', date: 'التاريخ', type: 'النوع', amount: 'المبلغ', desc: 'الوصف', purchase: 'شراء', pay: 'دفع', empty: 'لا يوجد تاريخ معاملات' };
    if (customer.creditHistory && customer.creditHistory.length > 0) {
        html += `
            <table>
                <thead>
                    <tr>
                        <th>${tCH.date}</th>
                        <th>${tCH.type}</th>
                        <th>${tCH.amount}</th>
                        <th>${tCH.desc}</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        customer.creditHistory.forEach(record => {
            const typeIcon = record.type === 'purchase' ? 'fas fa-shopping-cart' : 'fas fa-money-bill';
            const typeText = record.type === 'purchase' ? tCH.purchase : tCH.pay;
            html += `
                <tr>
                    <td>${record.date}</td>
                    <td><i class="${typeIcon}"></i> ${typeText}</td>
                    <td class="amount">${formatCurrency(record.amount)}</td>
                    <td>${record.description}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    } else {
        html += `<p class="no-data">${tCH.empty}</p>`;
    }
    
    html += `
            </div>
        </div>
    `;
    
    modalBody.innerHTML = html;
    modal.style.display = 'block';
}

// عرض سجل المعاملات (دخول/خروج) للعميل
function openCustomerTransactions(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    const logs = loadFromStorage('customerLogs', {});
    const key = String(customerId);
    const list = Array.isArray(logs[key]) ? logs[key] : [];
    const lang = document.documentElement.lang || 'ar';
    const tHead = lang === 'en'
        ? { title: 'Customer Log', datetime: 'Date & Time', type: 'Type', user: 'User', notes: 'Notes', empty: 'No logs' }
        : { title: 'سجل العميل', datetime: 'التاريخ والوقت', type: 'النوع', user: 'المستخدم', notes: 'ملاحظات', empty: 'لا يوجد سجلات' };
    let html = `
        <div class="report-stats">
            <div class="stat-item">
                <h4>${tHead.title}</h4>
                <p class="stat-value">${customer.name}</p>
            </div>
        </div>
        <table class="report-table">
            <thead>
                <tr>
                    <th>${tHead.datetime}</th>
                    <th>${tHead.type}</th>
                    <th>${tHead.user}</th>
                    <th>${tHead.notes}</th>
                </tr>
            </thead>
            <tbody>
                ${list.length ? list.map(r => `
                    <tr>
                        <td>${r.timestamp || '-'}</td>
                        <td>${r.action || '-'}</td>
                        <td>${r.user || '-'}</td>
                        <td>${r.note || '-'}</td>
                    </tr>
                `).join('') : `<tr><td colspan="4">${tHead.empty}</td></tr>`}
            </tbody>
        </table>
    `;
    const reportContent = document.getElementById('reportContent');
    const reportTitle = document.getElementById('reportTitle');
    if (reportTitle) reportTitle.textContent = tHead.title;
    if (reportContent) reportContent.innerHTML = html;
    showModal('reportModal');
}

function openPayDebt(customerId) {
    const select = document.getElementById('payDebtCustomer');
    const current = document.getElementById('payDebtCurrent');
    if (!select || !current) return;
    // تعريب واجهة النافذة
    try { translatePayDebtModalUI(); } catch(e) {}
    // تعبئة العملاء
    select.innerHTML = '';
    customers.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name} - دين: ${formatCurrency(c.creditBalance || 0)}`;
        select.appendChild(opt);
    });
    select.value = String(customerId || '');
    const cust = customers.find(c => c.id === (customerId || parseInt(select.value)));
    current.value = formatCurrency(cust?.creditBalance || 0);
    showModal('payDebtModal');
}

document.getElementById('payDebtCustomer')?.addEventListener('change', function(){
    const c = customers.find(x => x.id === parseInt(this.value));
    const current = document.getElementById('payDebtCurrent');
    if (current) current.value = formatCurrency(c?.creditBalance || 0);
});

document.getElementById('confirmPayDebt')?.addEventListener('click', function(){
    const select = document.getElementById('payDebtCustomer');
    const amountInput = document.getElementById('payDebtAmount');
    const currencySel = document.getElementById('payDebtCurrency');
    const customer = customers.find(c => c.id === parseInt(select.value));
    if (!customer) { showMessage('يرجى اختيار عميل', 'error'); return; }
    const amount = parseFloat(amountInput.value) || 0;
    if (amount <= 0) { showMessage('أدخل مبلغاً صحيحاً', 'error'); return; }
    // تحويل إلى USD إذا الدفع بالليرة
    const amountUSD = currencySel.value === 'USD' ? amount : (amount / (settings.exchangeRate || 1));
    const before = customer.creditBalance || customer.currentDebt || 0;
    const pay = Math.min(amountUSD, before);
    customer.currentDebt = Math.max(before - pay, 0);
    customer.creditBalance = customer.currentDebt;
    saveToStorage('customers', customers);

    // تحديث الصندوق بإضافة المبلغ المدفوع
    if (currencySel.value === 'USD') { cashDrawer.cashUSD += amount; } else { cashDrawer.cashLBP += amount; }
    cashDrawer.lastUpdate = new Date().toISOString();
    saveToStorage('cashDrawer', cashDrawer);
    updateCashDrawerDisplay();

    // سجل العميل
    const clog = loadFromStorage('customerLogs', {});
    const key = String(customer.id);
    if (!Array.isArray(clog[key])) clog[key] = [];
    const logEntry = { timestamp: new Date().toLocaleString(), action: 'تسديد', user: (currentUser || 'المستخدم'), note: `تسديد ${amount} ${currencySel.value}` };
    clog[key].push(logEntry);
    saveToStorage('customerLogs', clog);
    console.log('Saved customerLogs entry:', key, logEntry);

    // سجل المبيعات (دفعة على حساب)
    const salesLogs = loadFromStorage('salesLogs', []);
    salesLogs.push({ timestamp: new Date().toLocaleString(), invoiceNumber: '-', amount: amountUSD, currency: 'USD', method: 'payment', customer: customer.name, user: (currentUser || 'المستخدم') });
    saveToStorage('salesLogs', salesLogs);

    showNotification(getText('pay-debt-success'), 'success', 2500);
    hideModal('payDebtModal');
    loadCustomers();
});

// ترجمة نافذة تسديد دين العميل
function translatePayDebtModalUI() {
    const lang = document.documentElement.lang || 'ar';
    const modal = document.getElementById('payDebtModal');
    if (!modal) return;
    const t = (key) => ( (typeof getText === 'function') ? getText(key) : key );
    const header = modal.querySelector('.modal-header h3');
    if (header) header.textContent = t('pay-debt-title');
    const groups = modal.querySelectorAll('.report-body .form-group');
    if (groups && groups.length >= 4) {
        groups[0].querySelector('label').textContent = t('pay-debt-customer');
        groups[1].querySelector('label').textContent = t('pay-debt-current');
        groups[2].querySelector('label').textContent = t('pay-debt-amount');
        groups[3].querySelector('label').textContent = t('pay-debt-currency');
    }
    const currencySel = document.getElementById('payDebtCurrency');
    if (currencySel && currencySel.options.length >= 2) {
        currencySel.options[0].textContent = t('currency-usd');
        currencySel.options[1].textContent = t('currency-lbp');
    }
    const actions = modal.querySelectorAll('.modal-actions button');
    if (actions && actions.length >= 2) {
        const confirmBtn = modal.querySelector('#confirmPayDebt');
        const cancelBtn = actions[1];
        if (confirmBtn) {
            const icon = confirmBtn.querySelector('i');
            confirmBtn.textContent = t('confirm-pay-debt');
            if (icon) confirmBtn.prepend(icon);
        }
        if (cancelBtn) {
            const icon = cancelBtn.querySelector('i');
            cancelBtn.textContent = t('cancel-generic');
            if (icon) cancelBtn.prepend(icon);
        }
    }
}

// مسح العربة
document.getElementById('clearCart').addEventListener('click', function() {
    cart = [];
    updateCart();
    showMessage('تم مسح العربة');
});

// وظائف صفحة الفواتير
function loadInvoices() {
    const invoicesTable = document.getElementById('invoicesTable');
    
    invoicesTable.innerHTML = sales.map(sale => {
        let status = 'نشطة';
        let statusClass = 'active';
        
        if (sale.cancelled) {
            status = 'ملغاة';
            statusClass = 'cancelled';
        } else if (sale.returned) {
            status = 'مرجعة';
            statusClass = 'returned';
        }
        
        return `
        <tr class="${sale.cancelled ? 'cancelled-row' : ''}">
            <td>${sale.invoiceNumber}</td>
            <td>${sale.date}</td>
            <td>${sale.customer}</td>
            <td>${formatCurrency(sale.amount)}</td>
            <td>${sale.paymentMethod}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>
                <button class="action-btn view-btn" onclick="viewInvoice('${sale.invoiceNumber}')">عرض</button>
                ${!sale.cancelled && !sale.returned ? `
                <button class="action-btn return-btn" onclick="returnInvoice('${sale.invoiceNumber}')">إرجاع</button>
                ` : ''}
            </td>
        </tr>
        `;
    }).join('');
}

function returnInvoice(invoiceNumber) {
    const sale = sales.find(s => s.invoiceNumber === invoiceNumber);
    if (!sale) {
        showNotification('❌ الفاتورة غير موجودة', 'error');
        return;
    }
    
    if (sale.returned) {
        showNotification('❌ الفاتورة مرجعة مسبقاً', 'error');
        return;
    }
    
    if (sale.cancelled) {
        showNotification('❌ لا يمكن إرجاع فاتورة ملغاة', 'error');
        return;
    }
    
    // طلب كلمة المرور لإرجاع الفاتورة
    const password = prompt('🔒 أدخل كلمة المرور لإرجاع الفاتورة:');
    if (password !== '00') {
        showNotification('❌ كلمة المرور خاطئة! لا يمكن إرجاع الفاتورة.', 'error', 3000);
        return;
    }
    
    if (!confirm(`هل أنت متأكد من إرجاع الفاتورة ${invoiceNumber}؟\nسيتم رد المصاري للعميل وإرجاع المنتجات للمخزون.`)) {
        return;
    }
    
    // إرجاع الفاتورة
    sale.returned = true;
    sale.returnedDate = new Date().toISOString().split('T')[0];
    
    // إرجاع المنتجات للمخزون
    sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.stock += item.quantity;
        }
    });
    
    // إرجاع المبالغ المدفوعة للصندوق (عكس العملية)
    if (sale.cashDetails) {
        const currency = sale.cashDetails.paymentCurrency;
        const amount = sale.cashDetails.amountPaid;
        
        // إرجاع المبلغ للصندوق (إضافة وليس طرح!)
        if (currency === 'USD') {
            cashDrawer.cashUSD += amount;
        } else {
            cashDrawer.cashLBP += amount;
        }
        
        // إضافة معاملة إيداع للصندوق
        cashDrawer.transactions.push({
            date: new Date().toISOString(),
            type: 'deposit',
            amountUSD: currency === 'USD' ? amount : 0,
            amountLBP: currency === 'LBP' ? amount : 0,
            description: `إرجاع مبلغ فاتورة ملغاة ${invoiceNumber}`
        });
    }
    
    // إذا كان دفع جزئي، تقليل الدين من العميل
    if (sale.partialDetails) {
        const customer = customers.find(c => c.id === sale.customerId);
        if (customer) {
            const debtAmount = sale.partialDetails.debtAmount;
            customer.creditBalance = Math.max(0, customer.creditBalance - debtAmount);
            
            // إضافة سجل في تاريخ العميل
            if (!customer.creditHistory) customer.creditHistory = [];
            customer.creditHistory.push({
                date: new Date().toISOString().split('T')[0],
                type: 'cancellation',
                amount: -debtAmount,
                description: `إلغاء فاتورة ${invoiceNumber}`
            });
            
            // إرجاع المبلغ المدفوع للصندوق
            const currency = sale.partialDetails.paymentCurrency;
            const paidAmount = sale.partialDetails.amountPaid;
            
            // إرجاع المبلغ المدفوع للصندوق (إضافة وليس طرح!)
            if (currency === 'USD') {
                cashDrawer.cashUSD += paidAmount;
            } else {
                cashDrawer.cashLBP += paidAmount;
            }
            
            cashDrawer.transactions.push({
                date: new Date().toISOString(),
                type: 'deposit',
                amountUSD: currency === 'USD' ? paidAmount : 0,
                amountLBP: currency === 'LBP' ? paidAmount : 0,
                description: `إرجاع مبلغ مدفوع - فاتورة ملغاة ${invoiceNumber}`
            });
        }
    }
    
    // حفظ البيانات
    saveAllData();
    
    // تحديث الواجهات
    loadInvoices();
    updateCashDrawerDisplay();
    displayProducts();
    
    if (document.getElementById('customers').classList.contains('active')) {
        loadCustomers();
    }
    
    // إظهار إشعار مفصل
    let message = `✅ تم إرجاع الفاتورة ${invoiceNumber} بنجاح!

📦 المنتجات أُرجعت للمخزون`;
    
    if (sale.cashDetails) {
        const currency = sale.cashDetails.paymentCurrency;
        const amount = sale.cashDetails.amountPaid;
        message += `
💰 ${formatCurrency(amount, currency)} أُرجع للصندوق`;
    }
    
    if (sale.partialDetails) {
        const customer = customers.find(c => c.id === sale.customerId);
        const debtAmount = sale.partialDetails.debtAmount;
        const paidAmount = sale.partialDetails.amountPaid;
        const currency = sale.partialDetails.paymentCurrency;
        message += `
👤 ${customer?.name}: تم تقليل الدين ${formatCurrency(debtAmount)}
💰 ${formatCurrency(paidAmount, currency)} أُرجع للصندوق`;
    }
    
    showNotification(message, 'success', 6000);
}

function viewInvoice(invoiceNumber) {
    const sale = sales.find(s => s.invoiceNumber === invoiceNumber);
    if (sale) {
        showInvoice(sale);
    }
}

function filterInvoices() {
    const fromDate = document.getElementById('invoicesFromDate').value;
    const toDate = document.getElementById('invoicesToDate').value;
    
    let filteredSales = sales;
    
    if (fromDate) {
        filteredSales = filteredSales.filter(sale => sale.date >= fromDate);
    }
    
    if (toDate) {
        filteredSales = filteredSales.filter(sale => sale.date <= toDate);
    }
    
    displayFilteredInvoices(filteredSales);
}

function displayFilteredInvoices(filteredSales) {
    const invoicesTable = document.getElementById('invoicesTable');
    
    invoicesTable.innerHTML = filteredSales.map(sale => {
        const status = sale.cancelled ? 'ملغاة' : 'نشطة';
        const statusClass = sale.cancelled ? 'cancelled' : 'active';
        
        return `
        <tr class="${sale.cancelled ? 'cancelled-row' : ''}">
            <td>${sale.invoiceNumber}</td>
            <td>${sale.date}</td>
            <td>${sale.customer}</td>
            <td>${formatCurrency(sale.amount)}</td>
            <td>${sale.paymentMethod}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>
                <button class="action-btn view-btn" onclick="viewInvoice('${sale.invoiceNumber}')">عرض</button>
                ${!sale.cancelled && !sale.returned ? `
                <button class="action-btn return-btn" onclick="returnInvoice('${sale.invoiceNumber}')">إرجاع</button>
                ` : ''}
            </td>
        </tr>
        `;
    }).join('');
}

// تحميل المنتجات
function loadProducts() {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        const isLowStock = product.stock <= product.minStock;
        
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.barcode || 'غير محدد'}</td>
            <td>${product.supplier || 'غير محدد'}</td>
            <td>${formatCurrency(product.priceUSD)}</td>
            <td>${formatCurrency(product.costUSD || 0)}</td>
            <td>${formatCurrency(product.priceLBP, 'LBP')}</td>
            <td ${isLowStock ? 'style="color: red; font-weight: bold;"' : ''}>${product.stock}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${product.id})"><i class=\"fas fa-edit\"></i> ${getText('edit')}</button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})"><i class=\"fas fa-trash\"></i> ${getText('delete')}</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function filterProductsTable(term) {
    const rows = document.querySelectorAll('#productsTable tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// إضافة منتج جديد
document.getElementById('addProductBtn').addEventListener('click', function() {
    showModal('addProductModal');
    // تأكد من تشغيل الحساب التلقائي عند فتح النموذج
    setTimeout(() => {
        setupPriceCalculations();
        console.log('تم إعداد الحساب التلقائي للأسعار');
    }, 300);
});

// تم نقل معالج النموذج إلى الأسفل مع الحساب التلقائي

function editProduct(id) {
    const lang = document.documentElement.lang || 'ar';
    const product = products.find(p => p.id === id);
    if (!product) {
        showMessage(lang === 'en' ? 'Product not found' : 'المنتج غير موجود', 'error');
        return;
    }
    
    // طلب كلمة المرور لتعديل المنتج
    const password = prompt(lang === 'en' ? '🔒 Enter security code to edit product (12345):' : '🔒 أدخل رمز الأمان لتعديل المنتج (12345):');
    if (password !== '12345') {
        showNotification(lang === 'en' ? '❌ Incorrect code! Cannot edit product.' : '❌ كلمة المرور خاطئة! لا يمكن تعديل المنتج.', 'error', 3000);
        return;
    }
    
    // ملء النموذج ببيانات المنتج الحالية
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductPriceUSD').value = product.priceUSD;
    document.getElementById('editProductPriceLBP').value = product.priceLBP;
    document.getElementById('editProductCostUSD').value = product.costUSD || 0;
    document.getElementById('editProductQuantity').value = product.stock;
    document.getElementById('editProductBarcode').value = product.barcode || '';
    
    // تحديث قائمة الموردين
    updateSuppliersDropdown('editProductSupplier');
    document.getElementById('editProductSupplier').value = product.supplier || '';
    
    // تخزين معرف المنتج الذي يتم تعديله
    document.getElementById('editProductForm').dataset.editId = id;
    
    showModal('editProductModal');
}

// معالج تعديل المنتج
document.getElementById('editProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editId = parseInt(this.dataset.editId);
    const productIndex = products.findIndex(p => p.id === editId);
    
    if (productIndex === -1) {
        const lang = document.documentElement.lang || 'ar';
        showMessage(lang === 'en' ? 'Error finding product' : 'خطأ في العثور على المنتج', 'error');
        return;
    }
    
    // تحديث بيانات المنتج
    products[productIndex] = {
        ...products[productIndex],
        name: document.getElementById('editProductName').value,
        category: document.getElementById('editProductCategory').value,
        priceUSD: parseFloat(document.getElementById('editProductPriceUSD').value),
        priceLBP: parseFloat(document.getElementById('editProductPriceLBP').value),
        costUSD: parseFloat(document.getElementById('editProductCostUSD').value) || 0,
        stock: parseInt(document.getElementById('editProductQuantity').value),
        barcode: document.getElementById('editProductBarcode').value,
        supplier: document.getElementById('editProductSupplier').value
    };
    
    saveToStorage('products', products);
    loadProducts();
    hideModal('editProductModal');
    const langDone = document.documentElement.lang || 'ar';
    showMessage(langDone === 'en' ? 'Product updated successfully' : 'تم تحديث المنتج بنجاح');
});

function updateSuppliersDropdown(selectId) {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    
    select.innerHTML = `<option value="">${(document.documentElement.lang||'ar')==='en' ? 'Select supplier' : 'اختر المورد'}</option>`;
    
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.name;
        option.textContent = supplier.name;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}
function deleteProduct(id) {
    const lang = document.documentElement.lang || 'ar';
    const password = prompt(lang === 'en' ? '🔒 Enter security code to delete product (12345):' : '🔒 أدخل رمز الأمان لحذف المنتج (12345):');
    if (password !== '12345') {
        showNotification(lang === 'en' ? '❌ Invalid code! Cannot delete product.' : '❌ رمز غير صحيح! لا يمكن حذف المنتج.', 'error', 3000);
        return;
    }
    if (confirm(lang === 'en' ? 'Are you sure you want to delete this product?' : 'هل أنت متأكد من حذف هذا المنتج؟')) {
        products = products.filter(p => p.id !== id);
        saveToStorage('products', products);
        loadProducts();
        showMessage(lang === 'en' ? 'Product deleted' : 'تم حذف المنتج');
    }
}

// تحميل المبيعات
function loadSales() {
    const tbody = document.getElementById('salesTable');
    tbody.innerHTML = '';
    
    sales.forEach(sale => {
        // تحديد حالة المبيعة
        let statusClass = 'status-completed';
        let statusText = 'مكتملة';
        
        if (sale.returned) {
            if (sale.returnType === 'full') {
                statusClass = 'status-returned';
                statusText = 'مرجعة كاملة';
            } else if (sale.returnType === 'partial') {
                statusClass = 'status-partial-return';
                statusText = 'مرجعة جزئياً';
            }
        }
        
        const row = document.createElement('tr');
        // إنشاء نص الخصومات المرتبة
        let discountSummary = '';
        if (sale.items && sale.items.length) {
            const discounted = sale.items.filter(i => (i.originalPriceUSD != null && i.finalPriceUSD != null && i.finalPriceUSD < i.originalPriceUSD));
            if (discounted.length) {
                discountSummary = discounted.map(i => `${i.name}: ${i.discountPct}%`).join('، ');
            } else {
                discountSummary = '—';
            }
        }
        row.innerHTML = `
            <td>${sale.invoiceNumber}</td>
            <td>${sale.date}</td>
            <td>${sale.customer}</td>
            <td>${formatCurrency(sale.amount)}</td>
            <td>${sale.paymentMethod}</td>
            <td>${discountSummary}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-btn view-btn" onclick="viewSale(${sale.id})">
                    <i class="fas fa-eye"></i> عرض
                </button>
                <button class="action-btn" onclick="printSale(${sale.id})">
                    <i class="fas fa-print"></i> طباعة
                </button>
                ${!sale.returned ? 
                    `<button class="action-btn return-btn" onclick="initiateSaleReturn(${sale.id})">
                        <i class="fas fa-undo"></i> استرجاع
                    </button>` : 
                    `<button class="action-btn" disabled>
                        <i class="fas fa-check"></i> مرجعة
                    </button>`
                }
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function filterSalesTable(term) {
    const rows = document.querySelectorAll('#salesTable tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

function viewSale(id) {
    const sale = sales.find(s => s.id === id);
    if (sale) {
        showInvoice(sale);
    }
}

function printSale(id) {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;
    showInvoice(sale);
    // defer to ensure modal content rendered
    setTimeout(() => {
        const btn = document.getElementById('printInvoiceBtn');
        if (btn) btn.click();
    }, 50);
}
function showInvoice(sale) {
    const invoiceContent = document.getElementById('invoiceContent');
    const lang = document.documentElement.lang || 'ar';
    const t = lang === 'en' ? {
        invoice: 'Invoice',
        invoice_no: 'Invoice #',
        date: 'Date',
        customer: 'Customer',
        payment_method: 'Payment',
        item: 'Item',
        qty: 'Qty',
        price: 'Price',
        total: 'Total',
        subtotal: 'Subtotal',
        tax: 'Tax',
        grand_total: 'Grand Total',
        cash_details: 'Cash Details',
        paid: 'Paid',
        change: 'Change',
        none: 'None',
        phone: 'Phone'
    } : {
        invoice: 'فاتورة',
        invoice_no: 'فاتورة رقم',
        date: 'التاريخ',
        customer: 'العميل',
        payment_method: 'طريقة الدفع',
        item: 'المنتج',
        qty: 'الكمية',
        price: 'السعر',
        total: 'المجموع',
        subtotal: 'المجموع الفرعي',
        tax: 'الضريبة',
        grand_total: 'المجموع النهائي',
        cash_details: 'تفاصيل الدفع النقدي',
        paid: 'المبلغ المدفوع',
        change: 'الباقي',
        none: 'لا يوجد',
        phone: 'هاتف'
    };

    // بدون ضريبة - المجموع الفرعي = المجموع النهائي
    const subtotal = sale.amount;
    const tax = 0;
    
    const exRate = settings.exchangeRate || 1;
    const invoiceHTML = `
        <div class="invoice-header">
            <div class="store-info">
                <h2>${settings.storeName || ''}</h2>
                <p>${settings.storeAddress || ''}</p>
                <p>${t.phone}: ${settings.storePhone || ''}</p>
            </div>
            <div class="invoice-info">
                <h3>${t.invoice}: ${sale.invoiceNumber}</h3>
                <p>${t.date}: ${sale.date}</p>
                <p>${t.customer}: ${sale.customer || '-'}</p>
                <p>${t.payment_method}: ${sale.paymentMethod}</p>
            </div>
        </div>
        
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>${t.item}</th>
                    <th>${t.qty}</th>
                    <th>${t.price}</th>
                    <th>${t.total}</th>
                </tr>
            </thead>
            <tbody>
                ${sale.items ? sale.items.map(item => {
                    // تحديد عملة سعر العنصر في لحظة البيع بمقارنة السعر النهائي بالدولار وسعر الصرف
                    const isUSD = Math.abs((item.finalPriceUSD || 0) - (item.price || 0)) < 0.5;
                    const itemCurrency = isUSD ? 'USD' : 'LBP';
                    const originalPrice = itemCurrency === 'USD' ? (item.originalPriceUSD || item.price) : Math.round((item.originalPriceUSD || 0) * exRate);
                    const finalPrice    = itemCurrency === 'USD' ? (item.finalPriceUSD    || item.price) : Math.round((item.finalPriceUSD    || 0) * exRate);
                    const hasDiscount   = typeof item.discountPct === 'number' && item.discountPct > 0 && finalPrice < originalPrice;
                    const nameCell = hasDiscount
                        ? `${item.name}<br><small style="color:#16a34a;font-weight:700">-${item.discountPct}% → ${formatCurrency(finalPrice, itemCurrency)}</small>`
                        : `${item.name}`;
                    const priceCell = formatCurrency(originalPrice, itemCurrency); // عرض السعر الأساسي فقط
                    const totalCell = formatCurrency(finalPrice * (item.quantity || 1), itemCurrency); // مجموع بعد الخصم
                    return `
                        <tr>
                            <td>${nameCell}</td>
                            <td>${item.quantity}</td>
                            <td>${priceCell}</td>
                            <td>${totalCell}</td>
                        </tr>
                    `;
                }).join('') : ''}
            </tbody>
        </table>
        
        <div class="invoice-summary">
            <div class="summary-row">
                <span>${t.subtotal}:</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-row total">
                <span>${t.grand_total}:</span>
                <span>${formatCurrency(sale.amount)}</span>
            </div>
        </div>
        
        ${sale.cashDetails ? `
            <div class="invoice-cash-details">
                <h5><i class="fas fa-money-bill-wave"></i> ${t.cash_details}</h5>
                <div class="cash-detail-row">
                    <span>${t.paid}:</span>
                    <span>${formatCurrency(sale.cashDetails.amountPaid, sale.cashDetails.paymentCurrency)}</span>
                </div>
                <div class="cash-detail-row">
                    <span>${t.change}:</span>
                    <span>${sale.cashDetails.change > 0 ? formatCurrency(sale.cashDetails.change, sale.cashDetails.paymentCurrency) : t.none}</span>
                </div>
            </div>
        ` : ''}
    `;
    
    invoiceContent.innerHTML = invoiceHTML;
    showModal('invoiceModal');
}

// طباعة الفاتورة
document.getElementById('printInvoiceBtn').addEventListener('click', function() {
    const invoiceContent = document.getElementById('invoiceContent').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="${document.documentElement.dir || 'rtl'}">
        <head>
            <meta charset="UTF-8">
            <title>${settings.storeName || 'Invoice'}</title>
            <style>
                @page { size: 80mm auto; margin: 0; }
                :root { --primary: #111827; --muted: #6b7280; --border: #e5e7eb; }
                body { font-family: 'Cairo', 'Segoe UI', Arial, sans-serif; direction: inherit; margin: 0; color: #111827; }
                .invoice-wrapper { width: 80mm; margin: 0 auto; padding: 6mm 4mm; }
                .invoice-header { display: block; margin-bottom: 4mm; padding-bottom: 3mm; border-bottom: 1px dashed var(--border); }
                .store-info { text-align: center; }
                .store-info h2 { margin: 0 0 1mm 0; color: var(--primary); font-size: 14px; }
                .store-info p { margin: 0; color: var(--muted); font-size: 11px; }
                .invoice-info { margin-top: 3mm; font-size: 11px; }
                .invoice-info h3 { margin: 0 0 1mm 0; color: var(--primary); font-size: 12px; }
                .invoice-info p { margin: 0.5mm 0; color: #444; }
                .invoice-table { width: 100%; border-collapse: collapse; margin: 3mm 0 1mm; font-size: 11px; }
                .invoice-table thead { display: none; }
                .invoice-table td { padding: 2mm 0; border-bottom: 1px dotted var(--border); }
                .invoice-table td:nth-child(1) { width: 46%; text-align: ${document.documentElement.dir === 'rtl' ? 'right' : 'left'}; }
                .invoice-table td:nth-child(2) { width: 18%; text-align: center; }
                .invoice-table td:nth-child(3) { width: 18%; text-align: ${document.documentElement.dir === 'rtl' ? 'left' : 'right'}; }
                .invoice-table td:nth-child(4) { width: 18%; text-align: ${document.documentElement.dir === 'rtl' ? 'left' : 'right'}; }
                .invoice-summary { margin-top: 2mm; font-size: 11px; }
                .summary-row { display: flex; justify-content: space-between; margin: 1mm 0; }
                .summary-row.total { font-weight: 700; border-top: 1px dashed var(--border); padding-top: 2mm; font-size: 12px; }
                .footer-note { margin-top: 3mm; text-align: center; color: var(--muted); font-size: 10px; }
                @media print { body { margin: 0; } .invoice-wrapper { padding: 6mm 4mm; } }
            </style>
        </head>
        <body>
            <div class="invoice-wrapper">${invoiceContent}<div class="footer-note">${settings.storeName || ''} - Thank you for your business</div></div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
});

// تم استبدال دالة حذف المبيعات بنظام الاسترجاع الاحترافي

// إحصائيات المرتجعات
function getReturnStatistics() {
    const totalSales = sales.length;
    const returnedSales = sales.filter(s => s.returned).length;
    const fullReturns = sales.filter(s => s.returned && s.returnType === 'full').length;
    const partialReturns = sales.filter(s => s.returned && s.returnType === 'partial').length;
    
    const totalReturnAmount = sales
        .filter(s => s.returned)
        .reduce((sum, sale) => sum + (sale.returnAmount || 0), 0);
    
    return {
        totalSales,
        returnedSales,
        fullReturns,
        partialReturns,
        totalReturnAmount,
        returnRate: totalSales > 0 ? ((returnedSales / totalSales) * 100).toFixed(2) : 0
    };
}

// تحميل العملاء
function loadCustomers() {
    const tbody = document.getElementById('customersTable');
    tbody.innerHTML = '';
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        const creditStatus = customer.creditBalance > 0 ? 'debt' : 'clear';
        const creditPercent = Math.min(((customer.creditBalance || 0) / (customer.creditLimit || 1)) * 100, 100);
        
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.address || 'غير محدد'}</td>
            <td>${formatCurrency(customer.totalPurchases)}</td>
            <td>${customer.loyaltyPoints}</td>
            <td class="credit-${creditStatus}">
                ${formatCurrency(customer.creditBalance || 0)}
                ${customer.creditBalance > 0 ? `<small>(${creditPercent.toFixed(0)}%)</small>` : ''}
            </td>
            <td>${formatCurrency(customer.creditLimit || 0)}</td>
            <td>${customer.dateJoined || 'غير محدد'}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editCustomer(${customer.id})"><i class="fas fa-edit"></i> <span data-i18n="edit">${getText('edit')}</span></button>
                <button class="action-btn delete-btn" onclick="deleteCustomer(${customer.id})"><i class="fas fa-trash"></i> <span data-i18n="delete">${getText('delete')}</span></button>
                <button class="action-btn customer-log-btn" style="background:#6f42c1;color:#fff" onclick="openCustomerTransactions(${customer.id})"><i class="fas fa-list"></i> <span data-i18n="log">${getText('log')}</span></button>
                ${customer.creditBalance > 0 ? `<button class="action-btn pay-debt-btn" style="background:#2dce89;color:#fff" onclick="openPayDebt(${customer.id})"><i class=\"fas fa-dollar-sign\"></i> <span data-i18n=\"pay-debt\">${getText('pay-debt')}</span></button>` : ''}
            </td>
        `;
        
        tbody.appendChild(row);
    });
    // بعد البناء، ترجم الأزرار وفق اللغة الحالية
    try { translateCustomerActionButtons(); } catch(e) {}
}

// إضافة عميل جديد
document.getElementById('addCustomerBtn').addEventListener('click', function() {
    showModal('addCustomerModal');
});

document.getElementById('addCustomerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newCustomer = {
        id: Math.max(...customers.map(c => c.id), 0) + 1,
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value,
        totalPurchases: 0,
        loyaltyPoints: 0,
        creditBalance: 0,
        creditLimit: parseFloat(document.getElementById('customerCreditLimit').value) || 500,
        creditHistory: [],
        dateJoined: new Date().toISOString().split('T')[0]
    };
    
    customers.push(newCustomer);
    saveToStorage('customers', customers);
    loadCustomers();
    hideModal('addCustomerModal');
    this.reset();
    
    showMessage('تم إضافة العميل بنجاح');
});

function editCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) {
        showMessage('العميل غير موجود', 'error');
        return;
    }
    
    // ملء النموذج ببيانات العميل الحالية
    document.getElementById('editCustomerName').value = customer.name;
    document.getElementById('editCustomerEmail').value = customer.email;
    document.getElementById('editCustomerPhone').value = customer.phone;
    document.getElementById('editCustomerAddress').value = customer.address || '';
    document.getElementById('editCustomerCreditLimit').value = customer.creditLimit || 500;
    
    // تخزين معرف العميل الذي يتم تعديله
    document.getElementById('editCustomerForm').dataset.editId = id;
    
    showModal('editCustomerModal');
    try { translateEditCustomerModal(); } catch(e) {}
}

// معالج تعديل العميل
document.getElementById('editCustomerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editId = parseInt(this.dataset.editId);
    const customerIndex = customers.findIndex(c => c.id === editId);
    
    if (customerIndex === -1) {
        showMessage('خطأ في العثور على العميل', 'error');
        return;
    }
    
    // تحديث بيانات العميل
    customers[customerIndex] = {
        ...customers[customerIndex],
        name: document.getElementById('editCustomerName').value,
        email: document.getElementById('editCustomerEmail').value,
        phone: document.getElementById('editCustomerPhone').value,
        address: document.getElementById('editCustomerAddress').value,
        creditLimit: parseFloat(document.getElementById('editCustomerCreditLimit').value) || 500
    };
    
    saveToStorage('customers', customers);
    loadCustomers();
    hideModal('editCustomerModal');
    showMessage('تم تحديث العميل بنجاح');
});

function deleteCustomer(id) {
    if (confirm(getText('confirm-delete-customer'))) {
        customers = customers.filter(c => c.id !== id);
        saveToStorage('customers', customers);
        loadCustomers();
        showMessage(getText('customer-deleted'));
    }
}

// ترجمة نافذة تعديل عميل
function translateEditCustomerModal() {
    const lang = document.documentElement.lang || 'ar';
    const t = lang === 'en' ? {
        title: 'Edit Customer',
        name: 'Customer Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        credit_limit: 'Credit Limit (USD)',
        save: 'Save Changes',
        cancel: 'Cancel'
    } : {
        title: 'تعديل العميل',
        name: 'اسم العميل',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        address: 'العنوان',
        credit_limit: 'الحد الائتماني (دولار)',
        save: 'حفظ التعديلات',
        cancel: 'إلغاء'
    };
    const modal = document.getElementById('editCustomerModal');
    if (!modal) return;
    const header = modal.querySelector('.modal-header h3');
    if (header) header.textContent = t.title;
    const groups = modal.querySelectorAll('.form-group');
    if (groups && groups.length >= 5) {
        groups[0].querySelector('label').textContent = t.name;
        groups[1].querySelector('label').textContent = t.email;
        groups[2].querySelector('label').textContent = t.phone;
        groups[3].querySelector('label').textContent = t.address;
        groups[4].querySelector('label').textContent = t.credit_limit;
    }
    const actions = modal.querySelectorAll('.modal-actions button');
    if (actions && actions.length >= 2) {
        actions[0].textContent = t.save;
        actions[1].textContent = t.cancel;
    }
}

// تحميل الموردين
function loadSuppliers() {
    const tbody = document.getElementById('suppliersTable');
    tbody.innerHTML = '';
    
    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.name}</td>
            <td>${supplier.email}</td>
            <td>${supplier.phone}</td>
            <td>${supplier.address}</td>
            <td>${supplier.contactPerson}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editSupplier(${supplier.id})">تعديل</button>
                <button class="action-btn delete-btn" onclick="deleteSupplier(${supplier.id})">حذف</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function filterSuppliersTable(term) {
    const rows = document.querySelectorAll('#suppliersTable tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// إضافة مورد جديد
document.getElementById('addSupplierBtn').addEventListener('click', function() {
    showModal('addSupplierModal');
});

document.getElementById('addSupplierForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newSupplier = {
        id: Math.max(...suppliers.map(s => s.id), 0) + 1,
        name: document.getElementById('supplierName').value,
        email: document.getElementById('supplierEmail').value,
        phone: document.getElementById('supplierPhone').value,
        address: document.getElementById('supplierAddress').value,
        contactPerson: document.getElementById('supplierContact').value
    };
    
    suppliers.push(newSupplier);
    saveToStorage('suppliers', suppliers);
    loadSuppliers();
    updateSuppliersDropdown('productSupplier');
    updateSuppliersDropdown('editProductSupplier');
    hideModal('addSupplierModal');
    this.reset();
    
    showMessage('تم إضافة المورد بنجاح');
});

function editSupplier(id) {
    showMessage('ميزة تعديل الموردين قيد التطوير', 'error');
}

function deleteSupplier(id) {
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
        suppliers = suppliers.filter(s => s.id !== id);
        saveToStorage('suppliers', suppliers);
        loadSuppliers();
        updateSuppliersDropdown('productSupplier');
        updateSuppliersDropdown('editProductSupplier');
        showMessage('تم حذف المورد');
    }
}

// تحميل الإعدادات
function loadSettings() {
    document.getElementById('storeName').value = settings.storeName;
    document.getElementById('storeAddress').value = settings.storeAddress;
    document.getElementById('storePhone').value = settings.storePhone;
    document.getElementById('exchangeRateInput').value = settings.exchangeRate;
    // تم إزالة إعدادات الضريبة
    document.getElementById('lowStockThreshold').value = settings.lowStockThreshold || 10;
    document.getElementById('lowStockAlertCheckbox').checked = settings.lowStockAlert !== false;
    
    // إظهار/إخفاء مجموعة حد التحذير
    toggleStockThresholdGroup();
    
    // تحديث عرض الصندوق الحالي
    updateCashDrawerSettings();
}

function toggleStockThresholdGroup() {
    const checkbox = document.getElementById('lowStockAlertCheckbox');
    const group = document.getElementById('stockThresholdGroup');
    if (group) {
        group.style.display = checkbox && checkbox.checked ? 'block' : 'none';
    }
}

function updateCashDrawerSettings() {
    document.getElementById('currentUSD').textContent = formatCurrency(cashDrawer.cashUSD, 'USD');
    document.getElementById('currentLBP').textContent = formatCurrency(cashDrawer.cashLBP, 'LBP');
    document.getElementById('editCashUSD').value = cashDrawer.cashUSD;
    document.getElementById('editCashLBP').value = cashDrawer.cashLBP;
}

// تحديث سعر الصرف
document.getElementById('updateExchangeRate').addEventListener('click', function() {
    const newRate = parseFloat(document.getElementById('exchangeRateInput').value);
    if (newRate > 0) {
        settings.exchangeRate = newRate;
        document.getElementById('exchangeRate').textContent = `سعر الصرف: ${newRate.toLocaleString()} ل.ل`;
        showMessage('تم تحديث سعر الصرف بنجاح');
    } else {
        showMessage('يرجى إدخال سعر صرف صحيح', 'error');
    }
});

// تم إزالة إعدادات الضريبة

// إدارة النوافذ المنبثقة
function showModal(modalId) {
    document.getElementById('overlay').classList.add('active');
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById('overlay').classList.remove('active');
    document.getElementById(modalId).classList.remove('active');
}

// إغلاق النوافذ المنبثقة
document.getElementById('overlay').addEventListener('click', function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    this.classList.remove('active');
});

document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
            hideModal(modal.id);
        }
    });
});

// تحديث أسعار المنتجات عند تغيير العملة
function updateProductPrices() {
    displayProducts();
}

// إعداد التواريخ الافتراضية
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    const df = document.getElementById('dateFrom');
    const dt = document.getElementById('dateTo');
    if (df) df.value = today;
    if (dt) dt.value = today;
});

// تمت إزالة معالج قديم لتصفية المبيعات كان يعيد تحميل كل المبيعات

// تقارير
document.querySelectorAll('.report-btn').forEach((btn, index) => {
    btn.addEventListener('click', function() {
        switch(index) {
            case 0: // تقرير المبيعات
                showSalesReport();
                break;
            case 1: // تقرير المخزون
                showInventoryReport();
                break;
            case 2: // تقرير العملاء
                showCustomersReport();
                break;
            case 3: // التقرير المالي
                showFinancialReport();
                break;
        }
    });
});

// فلترة التقارير حسب الفترات الجاهزة أو تاريخ مخصص
document.getElementById('applyReportFilter')?.addEventListener('click', () => {
    const preset = document.getElementById('reportPreset').value;
    const fromInp = document.getElementById('reportFromDate');
    const toInp = document.getElementById('reportToDate');
    const { from, to } = getRangeByPreset(preset, fromInp.value, toInp ? toInp.value : '');
    window.currentReportRange = { from, to };
    // إعادة فتح آخر تقرير تم عرضه إن وجد
    const title = document.getElementById('reportTitle')?.textContent || '';
    if (title.includes('المبيعات') || title.toLowerCase().includes('sales')) return showSalesReport();
    if (title.includes('المالي') || title.toLowerCase().includes('financial')) return showFinancialReport();
    if (title.includes('المخزون') || title.toLowerCase().includes('inventory')) return showInventoryReport();
    if (title.includes('العملاء') || title.toLowerCase().includes('customers')) return showCustomersReport();
});

document.getElementById('openSalesHistory')?.addEventListener('click', openSalesHistory);
document.getElementById('openCashMove')?.addEventListener('click', () => showModal('cashMoveModal'));

document.getElementById('confirmCashMove')?.addEventListener('click', () => {
    const type = document.getElementById('cashMoveType').value;
    const amount = parseFloat(document.getElementById('cashMoveAmount').value) || 0;
    const currency = document.getElementById('cashMoveCurrency').value;
    const note = document.getElementById('cashMoveNote').value || '';
    if (amount <= 0) { showMessage('أدخل مبلغاً صحيحاً', 'error'); return; }
    // تنفيذ الحركة
    if (type === 'expense' || type === 'transfer') {
        if (currency === 'USD') {
            if (cashDrawer.cashUSD < amount) { showMessage('لا يوجد رصيد دولار كافٍ', 'error'); return; }
            cashDrawer.cashUSD -= amount;
        } else {
            if (cashDrawer.cashLBP < amount) { showMessage('لا يوجد رصيد ليرة كافٍ', 'error'); return; }
            cashDrawer.cashLBP -= amount;
        }
    } else if (type === 'deposit') {
        if (currency === 'USD') cashDrawer.cashUSD += amount; else cashDrawer.cashLBP += amount;
    }
    // سجل الحركة
    cashDrawer.transactions = cashDrawer.transactions || [];
    cashDrawer.transactions.push({
        timestamp: new Date().toISOString(),
        type,
        amount,
        currency,
        note,
        balanceAfter: { USD: cashDrawer.cashUSD, LBP: cashDrawer.cashLBP }
    });
    cashDrawer.lastUpdate = new Date().toISOString();
    saveToStorage('cashDrawer', cashDrawer);
    updateCashDrawerDisplay();

    // إضافة أيضاً لسجل المبيعات العام كمرجع يومي
    const salesLogs = loadFromStorage('salesLogs', []);
    salesLogs.push({ timestamp: new Date().toLocaleString(), invoiceNumber: '-', amount: (currency==='USD'?amount:amount/(settings.exchangeRate||1)), currency: 'USD', method: `cash-${type}`, customer: '-', user: currentUser || 'المستخدم', note });
    saveToStorage('salesLogs', salesLogs);
    
    showNotification('تم تسجيل حركة الصندوق', 'success', 2500);
    hideModal('cashMoveModal');
});

// تطبيق تلقائي عند تغيير القائمة الجاهزة
document.getElementById('reportPreset')?.addEventListener('change', (e) => {
    const preset = e.target.value;
    const fromInp = document.getElementById('reportFromDate');
    const toInp = document.getElementById('reportToDate');
    if (preset !== 'custom') {
        const { from, to } = getRangeByPreset(preset);
        fromInp.value = toDateInputValue(from);
        if (toInp) {
            toInp.value = toDateInputValue(to);
            toInp.disabled = true;
        }
        fromInp.disabled = true;
        window.currentReportRange = { from, to };
        rerenderCurrentReport();
    } else {
        fromInp.disabled = false; if (toInp) toInp.disabled = false;
    }
});

// تطبيق تلقائي عند إدخال تاريخين في وضع "مخصص"
['reportFromDate','reportToDate'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
        const presetSel = document.getElementById('reportPreset');
        if (!presetSel || presetSel.value !== 'custom') return;
        const fromVal = document.getElementById('reportFromDate').value;
        const toVal = document.getElementById('reportToDate').value;
        if (fromVal && toVal) {
            const { from, to } = getRangeByPreset('custom', fromVal, toVal);
            window.currentReportRange = { from, to };
            rerenderCurrentReport();
        }
    });
});

function getRangeByPreset(preset, customFrom, customTo) {
    const now = new Date();
    let from = new Date();
    let to = new Date();
    switch (preset) {
        case 'today':
            from.setHours(0,0,0,0); to.setHours(23,59,59,999); break;
        case 'yesterday':
            from.setDate(now.getDate()-1); from.setHours(0,0,0,0);
            to = new Date(from); to.setHours(23,59,59,999); break;
        case 'this_week': {
            const day = now.getDay(); // 0 Sun
            const diff = (day + 6) % 7; // جعل الاثنين بداية الأسبوع إن رغبت لاحقاً
            from.setDate(now.getDate() - diff); from.setHours(0,0,0,0);
            to.setHours(23,59,59,999); break;
        }
        case 'last_7':
            from.setDate(now.getDate()-6); from.setHours(0,0,0,0);
            to.setHours(23,59,59,999); break;
        case 'this_month':
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999); break;
        case 'last_30':
            from.setDate(now.getDate()-29); from.setHours(0,0,0,0);
            to.setHours(23,59,59,999); break;
        case 'this_year':
            from = new Date(now.getFullYear(), 0, 1);
            to = new Date(now.getFullYear(), 11, 31, 23,59,59,999); break;
        case 'custom':
        default:
            from = customFrom ? new Date(customFrom) : new Date(now.getFullYear(), now.getMonth(), 1);
            to = customTo ? new Date(customTo) : now;
    }
    return { from, to };
}

function toDateInputValue(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
}

function rerenderCurrentReport() {
    const title = document.getElementById('reportTitle')?.textContent || '';
    if (title.includes('المبيعات') || title.toLowerCase().includes('sales')) return showSalesReport();
    if (title.includes('المالي') || title.toLowerCase().includes('financial')) return showFinancialReport();
    if (title.includes('المخزون') || title.toLowerCase().includes('inventory')) return showInventoryReport();
    if (title.includes('العملاء') || title.toLowerCase().includes('customers')) return showCustomersReport();
}
function showSalesReport() {
    const reportContent = document.getElementById('reportContent');
    const reportTitle = document.getElementById('reportTitle');
    const isEn = (document.documentElement.lang || 'ar') === 'en';
    reportTitle.textContent = isEn ? 'Sales Report' : 'تقرير المبيعات';
    const range = window.currentReportRange || getRangeByPreset('this_month');
    const filtered = sales.filter(s => new Date(s.date) >= range.from && new Date(s.date) <= range.to);
    const totalSales = filtered.reduce((sum, sale) => sum + sale.amount, 0);
    const totalTransactions = filtered.length;
    const averageTransaction = totalSales / (totalTransactions || 1);
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = filtered.filter(sale => sale.date === todayStr);
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.amount, 0);
    
    const reportHTML = `
        <div class="report-stats">
            <div class="stat-item">
                <h4>${isEn ? 'Total Sales' : 'إجمالي المبيعات'}</h4>
                <p class="stat-value">${formatCurrency(totalSales)}</p>
            </div>
            <div class="stat-item">
                <h4>${isEn ? 'Transactions' : 'عدد المعاملات'}</h4>
                <p class="stat-value">${totalTransactions}</p>
            </div>
            <div class="stat-item">
                <h4>${isEn ? 'Average Transaction' : 'متوسط المعاملة'}</h4>
                <p class="stat-value">${formatCurrency(averageTransaction)}</p>
            </div>
            <div class="stat-item">
                <h4>${isEn ? 'Today Sales' : 'مبيعات اليوم'}</h4>
                <p class="stat-value">${formatCurrency(todayRevenue)}</p>
            </div>
        </div>
        
        <h4>${isEn ? 'Invoices in selected range:' : 'الفواتير ضمن الفترة المحددة:'}</h4>
        <table class="report-table">
            <thead>
                <tr>
                    <th>${isEn ? 'Invoice #' : 'رقم الفاتورة'}</th>
                    <th>${isEn ? 'Date' : 'التاريخ'}</th>
                    <th>${isEn ? 'Customer' : 'العميل'}</th>
                    <th>${isEn ? 'Amount' : 'المبلغ'}</th>
                    <th>${isEn ? 'Payment Method' : 'طريقة الدفع'}</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(sale => `
                    <tr>
                        <td>${sale.invoiceNumber}</td>
                        <td>${sale.date}</td>
                        <td>${sale.customer}</td>
                        <td>${formatCurrency(sale.amount)}</td>
                        <td>${sale.paymentMethod}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    reportContent.innerHTML = reportHTML;
    showModal('reportModal');
}
// عرض سجل المبيعات العام
function openSalesHistory() {
    const logs = loadFromStorage('salesLogs', []);
    let html = `
        <div class="report-stats">
            <div class="stat-item"><h4>سجل المبيعات</h4><p class="stat-value">${logs.length} عملية</p></div>
        </div>
        <table class="report-table">
            <thead>
                <tr>
                    <th>التاريخ والوقت</th>
                    <th>رقم الفاتورة</th>
                    <th>العميل</th>
                    <th>الطريقة</th>
                    <th>المبلغ</th>
                    <th>المستخدم</th>
                </tr>
            </thead>
            <tbody>
                ${logs.length ? logs.map(l => `
                    <tr>
                        <td>${l.timestamp}</td>
                        <td>${l.invoiceNumber}</td>
                        <td>${l.customer || '-'}</td>
                        <td>${l.method}</td>
                        <td>${formatCurrency(l.amount, l.currency)}</td>
                        <td>${l.user}</td>
                    </tr>
                `).join('') : '<tr><td colspan="6">لا يوجد سجلات</td></tr>'}
            </tbody>
        </table>
    `;
    const reportContent = document.getElementById('reportContent');
    const reportTitle = document.getElementById('reportTitle');
    if (reportTitle) reportTitle.textContent = 'سجل المبيعات';
    if (reportContent) reportContent.innerHTML = html;
    showModal('reportModal');
}

function showInventoryReport() {
    const reportContent = document.getElementById('reportContent');
    const reportTitle = document.getElementById('reportTitle');
    
    const isEn = (document.documentElement.lang || 'ar') === 'en';
    reportTitle.textContent = isEn ? 'Inventory Report' : 'تقرير المخزون';
    
    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, product) => sum + (product.stock * product.priceUSD), 0);
    const lowStockProducts = products.filter(product => product.stock <= product.minStock);
    
    const reportHTML = `
        <div class="report-stats">
            <div class="stat-item">
                <h4>${isEn ? 'Total Products' : 'إجمالي المنتجات'}</h4>
                <p class="stat-value">${totalProducts}</p>
            </div>
            <div class="stat-item">
                <h4>${isEn ? 'Stock Value' : 'قيمة المخزون'}</h4>
                <p class="stat-value">${formatCurrency(totalStockValue)}</p>
            </div>
            <div class="stat-item">
                <h4>${isEn ? 'Low Stock Products' : 'منتجات منخفضة المخزون'}</h4>
                <p class="stat-value">${lowStockProducts.length}</p>
            </div>
        </div>
        
        <h4>${isEn ? 'Low-stock products:' : 'المنتجات منخفضة المخزون:'}</h4>
        <table class="report-table">
            <thead>
                <tr>
                    <th>${isEn ? 'Product' : 'اسم المنتج'}</th>
                    <th>${isEn ? 'Current Stock' : 'المخزون الحالي'}</th>
                    <th>${isEn ? 'Min Threshold' : 'الحد الأدنى'}</th>
                    <th>${isEn ? 'Status' : 'الحالة'}</th>
                </tr>
            </thead>
            <tbody>
                ${lowStockProducts.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td style="color: red; font-weight: bold;">${product.stock}</td>
                        <td>${product.minStock}</td>
                        <td><span class="status-badge low-stock">مخزون منخفض</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h4>${isEn ? 'All products:' : 'جميع المنتجات:'}</h4>
        <table class="report-table">
            <thead>
                <tr>
                    <th>${isEn ? 'Product' : 'اسم المنتج'}</th>
                    <th>${isEn ? 'Category' : 'التصنيف'}</th>
                    <th>${isEn ? 'Stock' : 'المخزون'}</th>
                    <th>${isEn ? 'Price' : 'السعر'}</th>
                    <th>${isEn ? 'Total Value' : 'القيمة الإجمالية'}</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td ${product.stock <= product.minStock ? 'style="color: red; font-weight: bold;"' : ''}>${product.stock}</td>
                        <td>${formatCurrency(product.priceUSD)}</td>
                        <td>${formatCurrency(product.stock * product.priceUSD)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    reportContent.innerHTML = reportHTML;
    showModal('reportModal');
}

function showCustomersReport() {
    const reportContent = document.getElementById('reportContent');
    const reportTitle = document.getElementById('reportTitle');
    const isEn = (document.documentElement.lang || 'ar') === 'en';
    reportTitle.textContent = isEn ? 'Customers Report' : 'تقرير العملاء';
    
    const totalCustomers = customers.length;
    const totalCustomerPurchases = customers.reduce((sum, customer) => sum + customer.totalPurchases, 0);
    const averagePurchase = totalCustomerPurchases / totalCustomers || 0;
    const topCustomer = customers.reduce((prev, current) => 
        (prev.totalPurchases > current.totalPurchases) ? prev : current, customers[0]);
    
    const reportHTML = `
        <div class="report-stats">
            <div class="stat-item">
                <h4>${isEn ? 'Total Customers' : 'إجمالي العملاء'}</h4>
                <p class="stat-value">${totalCustomers}</p>
            </div>
            <div class="stat-item">
                <h4>${isEn ? 'Total Customer Purchases' : 'إجمالي مشتريات العملاء'}</h4>
                <p class="stat-value">${formatCurrency(totalCustomerPurchases)}</p>
            </div>
            <div class="stat-item">
                <h4>${isEn ? 'Average Purchases' : 'متوسط المشتريات'}</h4>
                <p class="stat-value">${formatCurrency(averagePurchase)}</p>
            </div>
            <div class="stat-item">
                <h4>${isEn ? 'Top Customer' : 'أفضل عميل'}</h4>
                <p class="stat-value">${topCustomer ? topCustomer.name : (isEn ? 'N/A' : 'لا يوجد')}</p>
            </div>
        </div>
        
        <table class="report-table">
            <thead>
                <tr>
                    <th>${isEn ? 'Customer Name' : 'اسم العميل'}</th>
                    <th>${isEn ? 'Email' : 'البريد الإلكتروني'}</th>
                    <th>${isEn ? 'Phone' : 'الهاتف'}</th>
                    <th>${isEn ? 'Total Purchases' : 'إجمالي المشتريات'}</th>
                    <th>${isEn ? 'Loyalty Points' : 'نقاط الولاء'}</th>
                    <th>${isEn ? 'Join Date' : 'تاريخ الانضمام'}</th>
                </tr>
            </thead>
            <tbody>
                ${customers.sort((a, b) => b.totalPurchases - a.totalPurchases).map(customer => `
                    <tr>
                        <td>${customer.name}</td>
                        <td>${customer.email}</td>
                        <td>${customer.phone}</td>
                        <td>${formatCurrency(customer.totalPurchases)}</td>
                        <td>${customer.loyaltyPoints}</td>
                        <td>${customer.dateJoined || 'غير محدد'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    reportContent.innerHTML = reportHTML;
    showModal('reportModal');
}

function showFinancialReport() {
    const reportContent = document.getElementById('reportContent');
    const reportTitle = document.getElementById('reportTitle');
    
    const isEn = (document.documentElement.lang || 'ar') === 'en';
    reportTitle.textContent = isEn ? 'Financial Report' : 'التقرير المالي';
    const range = window.currentReportRange || getRangeByPreset('this_month');
    const filtered = sales.filter(s => new Date(s.date) >= range.from && new Date(s.date) <= range.to);
    const totalRevenue = filtered.reduce((sum, sale) => sum + sale.amount, 0);
    const totalTax = totalRevenue * 0.11;
    const netRevenue = totalRevenue - totalTax;
    const totalStockValue = products.reduce((sum, product) => sum + (product.stock * product.priceUSD), 0);
    
    // حساب المبيعات حسب طريقة الدفع
    const paymentMethods = {};
    filtered.forEach(sale => {
        paymentMethods[sale.paymentMethod] = (paymentMethods[sale.paymentMethod] || 0) + sale.amount;
    });
    
    const reportHTML = `
        <div class="report-stats">
            <div class="stat-item">
                <h4>${isEn ? 'Total Revenue' : 'إجمالي الإيرادات'}</h4>
                <p class="stat-value">${formatCurrency(totalRevenue)}</p>
            </div>
            <div class="stat-item">
                <h4>${isEn ? 'Total Taxes' : 'إجمالي الضرائب'}</h4>
                <p class="stat-value">${formatCurrency(totalTax)}</p>
            </div>
            <div class="stat-item">
                <h4>${isEn ? 'Net Revenue' : 'صافي الإيرادات'}</h4>
                <p class="stat-value">${formatCurrency(netRevenue)}</p>
            </div>
            <div class="stat-item">
                <h4>${isEn ? 'Stock Value' : 'قيمة المخزون'}</h4>
                <p class="stat-value">${formatCurrency(totalStockValue)}</p>
            </div>
        </div>
        
        <h4>${isEn ? 'Sales by Payment Method:' : 'المبيعات حسب طريقة الدفع:'}</h4>
        <table class="report-table">
            <thead>
                <tr>
                    <th>${isEn ? 'Payment Method' : 'طريقة الدفع'}</th>
                    <th>${isEn ? 'Amount' : 'المبلغ'}</th>
                    <th>${isEn ? 'Share' : 'النسبة'}</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(paymentMethods).map(([method, amount]) => `
                    <tr>
                        <td>${method}</td>
                        <td>${formatCurrency(amount)}</td>
                        <td>${((amount / totalRevenue) * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h4>${isEn ? 'Monthly Sales:' : 'المبيعات الشهرية:'}</h4>
        <div class="monthly-sales">
            <p>${isEn ? 'This feature is under development - charts coming soon' : 'هذه الميزة قيد التطوير - ستتضمن رسوماً بيانية تفاعلية'}</p>
        </div>
    `;
    
    reportContent.innerHTML = reportHTML;
    showModal('reportModal');
}

// إعداد أحداث النسخ الاحتياطي والاستيراد
document.getElementById('exportDataBtn').addEventListener('click', exportData);
document.getElementById('importFile').addEventListener('change', importData);
document.getElementById('clearDataBtn').addEventListener('click', clearStorage);

// إعداد إعدادات النسخ الاحتياطي التلقائي
document.getElementById('autoBackupCheckbox').addEventListener('change', function() {
    settings.autoBackup = this.checked;
    saveToStorage('settings', settings);
    showMessage(this.checked ? 'تم تفعيل النسخ الاحتياطي التلقائي' : 'تم إلغاء النسخ الاحتياطي التلقائي');
});

// تصفية المبيعات بالتاريخ
document.getElementById('filterSales').addEventListener('click', function() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo')?.value || '';
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filteredSales = [...sales];
    
    // فلترة حسب التاريخ
    if (dateFrom) {
        filteredSales = filteredSales.filter(sale => {
            const saleDate = new Date(sale.date);
            const fromDate = new Date(dateFrom);
            if (dateTo) {
                const toDate = new Date(dateTo);
                return saleDate >= fromDate && saleDate <= toDate;
            }
            return saleDate >= fromDate;
        });
    }
    
    // فلترة حسب الحالة
    if (statusFilter !== 'all') {
        filteredSales = filteredSales.filter(sale => {
            switch(statusFilter) {
                case 'completed':
                    return !sale.returned;
                case 'returned':
                    return sale.returned && sale.returnType === 'full';
                case 'partial':
                    return sale.returned && sale.returnType === 'partial';
                default:
                    return true;
            }
        });
    }
    
    displayFilteredSales(filteredSales);
    
    // إظهار إحصائيات الفلترة
    const statusText = {
        'all': 'جميع المبيعات',
        'completed': 'المبيعات المكتملة',
        'returned': 'المبيعات المرجعة كاملة',
        'partial': 'المبيعات المرجعة جزئياً'
    };
    
    showMessage(`تم العثور على ${filteredSales.length} من ${statusText[statusFilter]} ${dateFrom && dateTo ? 'في الفترة المحددة' : ''}`);
});

// زر إعادة تعيين الفلترة
document.addEventListener('DOMContentLoaded', function() {
    const resetFilterBtn = document.getElementById('resetFilter');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', function() {
            const df = document.getElementById('dateFrom');
            const dt = document.getElementById('dateTo');
            if (df) df.value = '';
            if (dt) dt.value = '';
            document.getElementById('statusFilter').value = 'all';
            loadSales();
            showMessage('تم إعادة تعيين الفلترة');
        });
    }
});

function filterSalesByDate(dateFrom, dateTo) {
    const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        
        return saleDate >= fromDate && saleDate <= toDate;
    });
    
    displayFilteredSales(filteredSales);
    showMessage(`تم العثور على ${filteredSales.length} معاملة في الفترة المحددة`);
}

function displayFilteredSales(filteredSales) {
    const tbody = document.getElementById('salesTable');
    tbody.innerHTML = '';
    
    filteredSales.forEach(sale => {
        // تحديد حالة المبيعة
        let statusClass = 'status-completed';
        let statusText = 'مكتملة';
        
        if (sale.returned) {
            if (sale.returnType === 'full') {
                statusClass = 'status-returned';
                statusText = 'مرجعة كاملة';
            } else if (sale.returnType === 'partial') {
                statusClass = 'status-partial-return';
                statusText = 'مرجعة جزئياً';
            }
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.invoiceNumber}</td>
            <td>${sale.date}</td>
            <td>${sale.customer}</td>
            <td>${formatCurrency(sale.amount)}</td>
            <td>${sale.paymentMethod}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-btn view-btn" onclick="viewSale(${sale.id})">
                    <i class="fas fa-eye"></i> عرض
                </button>
                ${!sale.returned ? 
                    `<button class="action-btn return-btn" onclick="initiateSaleReturn(${sale.id})">
                        <i class="fas fa-undo"></i> استرجاع
                    </button>` : 
                    `<button class="action-btn" disabled>
                        <i class="fas fa-check"></i> مرجعة
                    </button>`
                }
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// دعم البحث بالباركود
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    searchByBarcode(searchTerm);
                }
            }
        });
    }
});

function searchByBarcode(barcode) {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
        // إضافة المنتج تلقائياً إلى العربة
        addToCart(product);
        document.getElementById('productSearch').value = '';
        showMessage(`تم إضافة ${product.name} إلى العربة بالباركود`, 'success');
        // إخفاء المنتجات بعد الإضافة
        displayProducts('');
    } else {
        // البحث بالاسم أو التصنيف
        displayProducts(barcode.toLowerCase());
    }
}

// تحديث قوائم الموردين عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateFrom').value = today;
    document.getElementById('dateTo').value = today;
    
    // تعبئة حقول معلومات المتجر بالقيم الحالية
    const sn = document.getElementById('storeName');
    const sa = document.getElementById('storeAddress');
    const sp = document.getElementById('storePhone');
    if (sn) sn.value = settings.storeName || '';
    if (sa) sa.value = settings.storeAddress || '';
    if (sp) sp.value = settings.storePhone || '';

    const saveStoreBtn = document.getElementById('saveStoreInfo');
    if (saveStoreBtn) {
        saveStoreBtn.addEventListener('click', function() {
            const nameVal = (document.getElementById('storeName')?.value || '').trim();
            const addrVal = (document.getElementById('storeAddress')?.value || '').trim();
            const phoneVal = (document.getElementById('storePhone')?.value || '').trim();
            settings.storeName = nameVal;
            settings.storeAddress = addrVal;
            settings.storePhone = phoneVal;
            saveToStorage('settings', settings);
            // تحديث فوري للهيدر والفاتورة المقبلة
            const headerUser = document.getElementById('currentUser'); // placeholder, keep unchanged
            showNotification('✅ تم حفظ معلومات المتجر', 'success', 2500);
        });
    }
    
    // تحديث قوائم الموردين
    updateSuppliersDropdown('productSupplier');
    updateSuppliersDropdown('editProductSupplier');
    
    // تحديث حالة النسخ الاحتياطي التلقائي
    document.getElementById('autoBackupCheckbox').checked = settings.autoBackup;

    // إعداد event listener للمنتجات
    setupProductClickHandlers();

    // بحث سريع داخل الجداول/القوائم
    const productsSearch = document.getElementById('productsSearch');
    if (productsSearch) {
        productsSearch.addEventListener('input', function() {
            const term = this.value.trim().toLowerCase();
            filterProductsTable(term);
        });
    }
    const salesSearch = document.getElementById('salesSearch');
    if (salesSearch) {
        salesSearch.addEventListener('input', function() {
            const term = this.value.trim().toLowerCase();
            filterSalesTable(term);
        });
    }
    const suppliersSearch = document.getElementById('suppliersSearch');
    if (suppliersSearch) {
        suppliersSearch.addEventListener('input', function() {
            const term = this.value.trim().toLowerCase();
            filterSuppliersTable(term);
        });
    }

console.log('نظام إدارة المبيعات جاهز للاستخدام!');
});

// تحديث العربة الأفقية
function updateHorizontalCart(cartItems, currency) {
    const horizontalContainer = document.getElementById('cartItemsHorizontalPos');
    if (!horizontalContainer) return;
    
    horizontalContainer.innerHTML = '';
    
    cartItems.forEach((item, index) => {
        const priceType = item.selectedPriceType || currentPriceType;
        const price = getProductPrice(item, priceType, currency);
        const total = price * item.quantity;
        
        const cartItemHorizontal = document.createElement('div');
        cartItemHorizontal.className = 'cart-item-horizontal-pos';
        cartItemHorizontal.innerHTML = `
            <div class="cart-item-info-pos">
                <div class="cart-item-name-pos">${item.name}</div>
                <div class="cart-item-price-pos">${formatCurrency(price, currency)} × ${item.quantity}</div>
            </div>
            <div class="cart-item-controls-pos">
                <div class="quantity-controls-horizontal-pos">
                    <button class="quantity-btn-horizontal-pos" onclick="changeQuantity(${index}, -1)">-</button>
                    <span class="quantity-horizontal-pos">${item.quantity}</span>
                    <button class="quantity-btn-horizontal-pos" onclick="changeQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-btn-horizontal-pos" onclick="removeFromCart(${index})">×</button>
            </div>
        `;
        
        horizontalContainer.appendChild(cartItemHorizontal);
    });
}

// تحديث ملخص العربة الأفقية
function updateHorizontalCartSummary(totalItems, totalAmount) {
    const totalItemsElement = document.getElementById('totalItemsPos');
    const totalAmountElement = document.getElementById('totalAmountPos');
    
    if (totalItemsElement) {
        totalItemsElement.textContent = totalItems;
    }
    
    if (totalAmountElement) {
        const currency = document.getElementById('currency').value;
        totalAmountElement.textContent = formatCurrency(totalAmount, currency);
    }
}


// عرض المنتجات في التصميم الجديد
function displayProductsNew() {
    const container = document.getElementById('productsArea');
    if (!container) return;
    
    container.innerHTML = '';
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes('') ||
        product.category.toLowerCase().includes('')
    );
    
    filteredProducts.forEach(product => {
        const price = getProductPrice(product, currentPriceType, 'USD');
        const priceFormatted = formatCurrency(price, 'USD');
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card-new';
        productCard.innerHTML = `
            <div class="product-info">
                <h4>${product.name}</h4>
                <div class="product-price">${priceFormatted}</div>
                <div class="product-stock">متوفر: ${product.stock}</div>
            </div>
        `;
        
        productCard.addEventListener('click', function() {
            addToCart(product);
            showMessage(`تم إضافة ${product.name} إلى العربة`, 'success');
        });
        
        container.appendChild(productCard);
    });
}

// تحديث العربة في التصميم الجديد
function updateCartNew() {
    const totalDisplay = document.getElementById('totalDisplay');
    if (!totalDisplay) return;
    
    let total = 0;
    let totalItems = 0;
    
    cart.forEach(item => {
        const priceType = item.selectedPriceType || currentPriceType;
        const price = getProductPrice(item, priceType, 'USD');
        total += price * item.quantity;
        totalItems += item.quantity;
    });
    
    totalDisplay.textContent = formatCurrency(total, 'USD');
}

// إعداد event listeners للمنتجات
function setupProductClickHandlers() {
    // لا نحتاج event delegation لأننا نستخدم event listeners مباشرة في displayProducts
}
// إضافة معالج للحساب التلقائي للأسعار
function setupPriceCalculations() {
    const exchangeRate = settings.exchangeRate;
    
    // عرض سعر الصرف الحالي
    const exchangeRateDisplay = document.getElementById('currentExchangeRate');
    if (exchangeRateDisplay) {
        exchangeRateDisplay.textContent = exchangeRate.toLocaleString();
    }
    
    // دالة لحساب وعرض السعر بالليرة
    function calculateAndDisplayLBP(usdInput, lbpDisplay) {
        if (!usdInput || !lbpDisplay) return;
        const usdPrice = parseFloat(usdInput.value) || 0;
        const lbpPrice = Math.round(usdPrice * exchangeRate);
        lbpDisplay.textContent = lbpPrice > 0 ? lbpPrice.toLocaleString() : '--';
    }
    
    // ربط المدخلات بالحساب التلقائي مع تأخير للتأكد من وجود العناصر
    setTimeout(() => {
        const retailUSDInput = document.getElementById('productRetailUSD');
        const wholesaleUSDInput = document.getElementById('productWholesaleUSD');
        const vipUSDInput = document.getElementById('productVipUSD');
        
        const retailLBPDisplay = document.getElementById('retailLBPDisplay');
        const wholesaleLBPDisplay = document.getElementById('wholesaleLBPDisplay');
        const vipLBPDisplay = document.getElementById('vipLBPDisplay');
        
        if (retailUSDInput && retailLBPDisplay) {
            // إزالة المستمع القديم إن وجد
            retailUSDInput.removeEventListener('input', retailUSDInput._handler);
            retailUSDInput._handler = () => calculateAndDisplayLBP(retailUSDInput, retailLBPDisplay);
            retailUSDInput.addEventListener('input', retailUSDInput._handler);
        }
        
        if (wholesaleUSDInput && wholesaleLBPDisplay) {
            wholesaleUSDInput.removeEventListener('input', wholesaleUSDInput._handler);
            wholesaleUSDInput._handler = () => calculateAndDisplayLBP(wholesaleUSDInput, wholesaleLBPDisplay);
            wholesaleUSDInput.addEventListener('input', wholesaleUSDInput._handler);
        }
        
        if (vipUSDInput && vipLBPDisplay) {
            vipUSDInput.removeEventListener('input', vipUSDInput._handler);
            vipUSDInput._handler = () => calculateAndDisplayLBP(vipUSDInput, vipLBPDisplay);
            vipUSDInput.addEventListener('input', vipUSDInput._handler);
        }
    }, 200);
}

// استدعاء الدالة عند تحميل الصفحة وإعداد معالج النموذج
document.addEventListener('DOMContentLoaded', function() {
    setupPriceCalculations();
    
    // إعداد معالج حفظ المنتج
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
    e.preventDefault();
            console.log('تم الضغط على زر الحفظ');
            
            // التحقق من وجود الحقول
            const retailUSDInput = document.getElementById('productRetailUSD');
            const wholesaleUSDInput = document.getElementById('productWholesaleUSD');
            const vipUSDInput = document.getElementById('productVipUSD');
            
            if (!retailUSDInput || !wholesaleUSDInput || !vipUSDInput) {
                showMessage('خطأ: لا يمكن العثور على حقول الأسعار', 'error');
                return;
            }
            
            const retailUSD = parseFloat(retailUSDInput.value);
            const wholesaleUSD = parseFloat(wholesaleUSDInput.value);
            const vipUSD = parseFloat(vipUSDInput.value);
            
            console.log('الأسعار المدخلة:', { retailUSD, wholesaleUSD, vipUSD });
            
            // التحقق من صحة الأسعار
            if (isNaN(retailUSD) || isNaN(wholesaleUSD) || isNaN(vipUSD)) {
                showMessage('يرجى إدخال أسعار صحيحة لجميع الأنواع', 'error');
                return;
            }
            
            if (wholesaleUSD >= retailUSD) {
                showMessage('سعر الجملة يجب أن يكون أقل من سعر المفرق', 'error');
                return;
            }
            
            if (vipUSD < wholesaleUSD || vipUSD >= retailUSD) {
                showMessage('سعر الزبون المميز يجب أن يكون بين سعر الجملة وسعر المفرق', 'error');
                return;
            }
            
            const exchangeRate = settings.exchangeRate;
            console.log('سعر الصرف:', exchangeRate);
    
    const newProduct = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
                prices: {
                    retail: {
                        USD: retailUSD,
                        LBP: Math.round(retailUSD * exchangeRate)
                    },
                    wholesale: {
                        USD: wholesaleUSD,
                        LBP: Math.round(wholesaleUSD * exchangeRate)
                    },
                    vip: {
                        USD: vipUSD,
                        LBP: Math.round(vipUSD * exchangeRate)
                    }
                },
                // للتوافق مع الكود القديم - استخدام سعر المفرق
                priceUSD: retailUSD,
                priceLBP: Math.round(retailUSD * exchangeRate),
        costUSD: parseFloat(document.getElementById('productCostUSD').value) || 0,
        stock: parseInt(document.getElementById('productQuantity').value),
        barcode: document.getElementById('productBarcode').value,
        supplier: document.getElementById('productSupplier').value,
        minStock: 5
    };
            
            console.log('المنتج الجديد:', newProduct);
    
    products.push(newProduct);
    saveToStorage('products', products);
    loadProducts();
    hideModal('addProductModal');
    this.reset();
    
            // مسح شاشات العرض
            const retailDisplay = document.getElementById('retailLBPDisplay');
            const wholesaleDisplay = document.getElementById('wholesaleLBPDisplay');
            const vipDisplay = document.getElementById('vipLBPDisplay');
            
            if (retailDisplay) retailDisplay.textContent = '--';
            if (wholesaleDisplay) wholesaleDisplay.textContent = '--';
            if (vipDisplay) vipDisplay.textContent = '--';
            
            showMessage('تم إضافة المنتج بنجاح! تم حساب الأسعار بالليرة تلقائياً 🎉');
            console.log('تم حفظ المنتج بنجاح');
        });
    }
});

// نظام استرجاع المبيعات
let currentSaleForReturn = null;

function initiateSaleReturn(saleId) {
    currentSaleForReturn = sales.find(s => s.id === saleId);
    if (!currentSaleForReturn) {
        showMessage('لم يتم العثور على المبيعة', 'error');
        return;
    }
    
    if (currentSaleForReturn.returned) {
        showMessage('هذه المبيعة مرجعة مسبقاً', 'error');
        return;
    }
    
    // ملء بيانات المبيعة
    document.getElementById('returnInvoiceNumber').textContent = currentSaleForReturn.invoiceNumber;
    document.getElementById('returnCustomerName').textContent = currentSaleForReturn.customer;
    document.getElementById('returnTotalAmount').textContent = formatCurrency(currentSaleForReturn.amount);
    
    // عرض طريقة الدفع مع التفاصيل
    let paymentMethodText = currentSaleForReturn.paymentMethod;
    if (currentSaleForReturn.cashDetails) {
        const currency = currentSaleForReturn.cashDetails.paymentCurrency;
        const paid = currentSaleForReturn.cashDetails.amountPaid;
        if (currency === 'USD') {
            paymentMethodText += ` ($${paid.toFixed(2)})`;
        } else {
            paymentMethodText += ` (${paid.toLocaleString()} ل.ل)`;
        }
    } else if (currentSaleForReturn.partialDetails) {
        const currency = currentSaleForReturn.partialDetails.paymentCurrency;
        const paid = currentSaleForReturn.partialDetails.amountPaid;
        if (currency === 'USD') {
            paymentMethodText += ` - مدفوع: $${paid.toFixed(2)}`;
        } else {
            paymentMethodText += ` - مدفوع: ${paid.toLocaleString()} ل.ل`;
        }
    }
    document.getElementById('returnPaymentMethod').textContent = paymentMethodText;
    
    // إعادة تعيين النموذج
    document.getElementById('returnType').value = 'full';
    document.getElementById('partialReturnAmount').value = '';
    document.getElementById('returnReason').value = 'defective';
    document.getElementById('returnNotes').value = '';
    document.getElementById('partialAmountGroup').style.display = 'none';
    
    // تحديث ملخص الاسترجاع
    updateReturnSummary();
    
    // عرض النافذة
    showModal('returnSaleModal');
    try { translateReturnModalUI(); } catch(e) {}
}
function updateReturnSummary() {
    if (!currentSaleForReturn) return;
    
    const returnType = document.getElementById('returnType').value;
    const partialAmount = parseFloat(document.getElementById('partialReturnAmount').value) || 0;
    
    let refundDisplayText = '';
    let refundMethodText = '';
    
    if (currentSaleForReturn.cashDetails) {
        // مبيعة نقدية
        const originalCurrency = currentSaleForReturn.cashDetails.paymentCurrency;
        const originalPaid = currentSaleForReturn.cashDetails.amountPaid;
        
        if (returnType === 'full') {
            if (originalCurrency === 'USD') {
                refundDisplayText = `$${originalPaid.toFixed(2)}`;
            } else {
                refundDisplayText = `${originalPaid.toLocaleString()} ل.ل`;
            }
        } else if (returnType === 'partial') {
            const refundRatio = partialAmount / currentSaleForReturn.amount;
            const refundInOriginalCurrency = originalPaid * refundRatio;
            
            if (originalCurrency === 'USD') {
                refundDisplayText = `$${refundInOriginalCurrency.toFixed(2)}`;
            } else {
                refundDisplayText = `${refundInOriginalCurrency.toLocaleString()} ل.ل`;
            }
        }
        refundMethodText = (document.documentElement.lang === 'en') ? 'Cash' : 'نقدي';
        
    } else if (currentSaleForReturn.partialDetails) {
        // مبيعة جزئية
        const originalCurrency = currentSaleForReturn.partialDetails.paymentCurrency;
        const originalPaid = currentSaleForReturn.partialDetails.amountPaid;
        
        if (returnType === 'full') {
            if (originalCurrency === 'USD') {
                refundDisplayText = `$${originalPaid.toFixed(2)}`;
            } else {
                refundDisplayText = `${originalPaid.toLocaleString()} ل.ل`;
            }
        } else if (returnType === 'partial') {
            const refundRatio = partialAmount / currentSaleForReturn.amount;
            const refundInOriginalCurrency = Math.min(originalPaid * refundRatio, originalPaid);
            
            if (originalCurrency === 'USD') {
                refundDisplayText = `$${refundInOriginalCurrency.toFixed(2)}`;
            } else {
                refundDisplayText = `${refundInOriginalCurrency.toLocaleString()} ل.ل`;
            }
        }
        refundMethodText = 'نقدي (من المبلغ المدفوع)';
        
    } else {
        // مبيعة قديمة - افتراض
        let refundAmount = 0;
        if (returnType === 'full') {
            refundAmount = currentSaleForReturn.amount;
        } else if (returnType === 'partial') {
            refundAmount = Math.min(partialAmount, currentSaleForReturn.amount);
        }
        
        if (currentSaleForReturn.amount < 50) {
            refundDisplayText = `$${refundAmount.toFixed(2)}`;
        } else {
            refundDisplayText = `${(refundAmount * settings.exchangeRate).toLocaleString()} ل.ل`;
        }
        refundMethodText = 'نقدي';
    }
    
    document.getElementById('refundAmount').textContent = refundDisplayText;
    document.getElementById('refundMethod').textContent = refundMethodText;
}

function processReturn() {
    if (!currentSaleForReturn) {
        showMessage('خطأ في البيانات', 'error');
        return;
    }
    
    console.log('🔍 بدء عملية الاسترجاع للمبيعة:', currentSaleForReturn);
    
    const returnTypeEl = document.getElementById('returnType');
    const partialAmountEl = document.getElementById('partialReturnAmount');
    const returnReasonEl = document.getElementById('returnReason');
    const returnNotesEl = document.getElementById('returnNotes');
    
    if (!returnTypeEl || !returnReasonEl || !returnNotesEl) {
        console.error('❌ عناصر النموذج غير موجودة');
        showMessage('خطأ في واجهة الاسترجاع', 'error');
        return;
    }
    
    const returnType = returnTypeEl.value;
    const partialAmount = parseFloat(partialAmountEl ? partialAmountEl.value : '0') || 0;
    const returnReason = returnReasonEl.value;
    const returnNotes = returnNotesEl.value;
    
    console.log('📋 بيانات الاسترجاع:', { returnType, partialAmount, returnReason });
    
    // التحقق من صحة البيانات
    if (returnType === 'partial' && (partialAmount <= 0 || partialAmount > currentSaleForReturn.amount)) {
        showMessage('مبلغ الاسترجاع الجزئي غير صحيح', 'error');
        return;
    }
    
    // حساب مبلغ الاسترجاع
    let refundAmount = returnType === 'full' ? currentSaleForReturn.amount : partialAmount;
    
    // تحديث بيانات المبيعة
    currentSaleForReturn.returned = true;
    currentSaleForReturn.returnType = returnType;
    currentSaleForReturn.returnAmount = refundAmount;
    currentSaleForReturn.returnDate = new Date().toISOString().split('T')[0];
    currentSaleForReturn.returnReason = returnReason;
    currentSaleForReturn.returnNotes = returnNotes;
    
    // إرجاع المنتجات للمخزون
    if (currentSaleForReturn.items) {
        currentSaleForReturn.items.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                const returnQuantity = returnType === 'full' ? item.quantity : 
                    Math.floor((item.quantity * partialAmount) / currentSaleForReturn.amount);
                product.stock += returnQuantity;
            }
        });
    }
    
    // تحديث الصندوق - إرجاع المال
    if (currentSaleForReturn.paymentMethod === 'نقدي' || currentSaleForReturn.paymentMethod === 'دفع جزئي (دين)') {
        console.log('🔄 بدء تحديث الصندوق للاسترجاع - طريقة الدفع:', currentSaleForReturn.paymentMethod);
        
        // التأكد من تحميل الصندوق من التخزين
        cashDrawer = loadFromStorage('cashDrawer', {
            cashUSD: 100.00,
            cashLBP: 500000,
            lastUpdate: new Date().toISOString(),
            transactions: []
        });
        
        console.log('🏦 بيانات الصندوق المحملة:', cashDrawer);
        let refundDetails = [];
        
        if (currentSaleForReturn.cashDetails) {
            // مبيعة نقدية
            const originalCurrency = currentSaleForReturn.cashDetails.paymentCurrency;
            const originalPaid = currentSaleForReturn.cashDetails.amountPaid;
            
            console.log('💰 تفاصيل المبيعة النقدية:', { originalCurrency, originalPaid, returnType });
            console.log('💳 الصندوق قبل الاسترجاع:', { USD: cashDrawer.cashUSD, LBP: cashDrawer.cashLBP });
            
            if (returnType === 'full') {
                // استرجاع كامل - نرجع نفس المبلغ والعملة المدفوعة
                if (originalCurrency === 'USD') {
                    cashDrawer.cashUSD -= originalPaid;
                    refundDetails.push(`$${originalPaid.toFixed(2)}`);
                    console.log('💵 تم خصم من الدولار:', originalPaid);
                } else {
                    cashDrawer.cashLBP -= originalPaid;
                    refundDetails.push(`${originalPaid.toLocaleString()} ل.ل`);
                    console.log('💴 تم خصم من الليرة:', originalPaid);
                }
            } else {
                // استرجاع جزئي - نحسب النسبة
                const refundRatio = partialAmount / currentSaleForReturn.amount;
                const refundInOriginalCurrency = originalPaid * refundRatio;
                
                if (originalCurrency === 'USD') {
                    cashDrawer.cashUSD -= refundInOriginalCurrency;
                    refundDetails.push(`$${refundInOriginalCurrency.toFixed(2)}`);
                } else {
                    cashDrawer.cashLBP -= refundInOriginalCurrency;
                    refundDetails.push(`${refundInOriginalCurrency.toLocaleString()} ل.ل`);
                }
            }
        } else if (currentSaleForReturn.partialDetails) {
            // مبيعة جزئية - نرجع فقط المبلغ المدفوع
            const originalCurrency = currentSaleForReturn.partialDetails.paymentCurrency;
            const originalPaid = currentSaleForReturn.partialDetails.amountPaid;
            
            if (returnType === 'full') {
                if (originalCurrency === 'USD') {
                    cashDrawer.cashUSD -= originalPaid;
                    refundDetails.push(`$${originalPaid.toFixed(2)}`);
                } else {
                    cashDrawer.cashLBP -= originalPaid;
                    refundDetails.push(`${originalPaid.toLocaleString()} ل.ل`);
                }
            } else {
                // استرجاع جزئي للمبيعة الجزئية
                const refundRatio = partialAmount / currentSaleForReturn.amount;
                const refundInOriginalCurrency = Math.min(originalPaid * refundRatio, originalPaid);
                
                if (originalCurrency === 'USD') {
                    cashDrawer.cashUSD -= refundInOriginalCurrency;
                    refundDetails.push(`$${refundInOriginalCurrency.toFixed(2)}`);
                } else {
                    cashDrawer.cashLBP -= refundInOriginalCurrency;
                    refundDetails.push(`${refundInOriginalCurrency.toLocaleString()} ل.ل`);
                }
            }
        } else {
            // مبيعة قديمة بدون تفاصيل - افتراض بالدولار
            if (currentSaleForReturn.amount < 50) { // افتراض مبالغ صغيرة بالدولار
                cashDrawer.cashUSD -= refundAmount;
                refundDetails.push(`$${refundAmount.toFixed(2)}`);
            } else {
                // تحويل للليرة
                const refundLBP = refundAmount * settings.exchangeRate;
                cashDrawer.cashLBP -= refundLBP;
                refundDetails.push(`${refundLBP.toLocaleString()} ل.ل`);
            }
        }
        
        // إضافة سجل معاملة
        cashDrawer.transactions.push({
            timestamp: new Date().toISOString(),
            type: 'refund',
            amount: refundAmount,
            description: `استرجاع ${returnType === 'full' ? 'كامل' : 'جزئي'} للفاتورة ${currentSaleForReturn.invoiceNumber} - المبلغ المرجع: ${refundDetails.join(' + ')}`,
            balanceAfter: {
                USD: cashDrawer.cashUSD,
                LBP: cashDrawer.cashLBP
            }
        });
        
        cashDrawer.lastUpdate = new Date().toISOString();
        console.log('💳 الصندوق بعد الاسترجاع:', { USD: cashDrawer.cashUSD, LBP: cashDrawer.cashLBP });
        saveToStorage('cashDrawer', cashDrawer);
        updateCashDrawerDisplay();
        console.log('✅ تم حفظ الصندوق وتحديث العرض');
    } else {
        console.log('❌ لم يتم تحديث الصندوق - طريقة الدفع:', currentSaleForReturn.paymentMethod);
    }
    
    // حفظ البيانات المحدثة
    saveToStorage('sales', sales);
    saveToStorage('products', products);
    
    // تحديث الواجهات
    loadSales();
    displayProducts();
    
    // إخفاء النافذة
    hideModal('returnSaleModal');
    
    // إظهار رسالة نجاح مع تفاصيل المبلغ المرجع
    const refundText = refundDetails.length > 0 ? refundDetails.join(' + ') : formatCurrency(refundAmount);
    showMessage(`✅ تم استرجاع المبيعة بنجاح! تم رد ${refundText} للعميل`, 'success');
    
    currentSaleForReturn = null;
}

// ربط الأحداث للنافذة
document.addEventListener('DOMContentLoaded', function() {
    // ربط تغيير نوع الاسترجاع
    const returnTypeSelect = document.getElementById('returnType');
    if (returnTypeSelect) {
        returnTypeSelect.addEventListener('change', function() {
            const partialGroup = document.getElementById('partialAmountGroup');
            if (this.value === 'partial') {
                partialGroup.style.display = 'block';
            } else {
                partialGroup.style.display = 'none';
            }
            updateReturnSummary();
        });
    }
    
    // ربط تحديث المبلغ الجزئي
    const partialAmountInput = document.getElementById('partialReturnAmount');
    if (partialAmountInput) {
        partialAmountInput.addEventListener('input', updateReturnSummary);
    }
});

// تحسين نظام الإشعارات
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار تلقائياً
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// فحص المخزون المنخفض وإرسال إشعارات
function checkLowStock() {
    if (!settings.lowStockAlert) return;
    
    const threshold = settings.lowStockThreshold || 10;
    const lowStockProducts = products.filter(product => 
        product && 
        product.name && 
        typeof product.stock === 'number' && 
        product.stock <= threshold
    );
    
    if (lowStockProducts.length > 0) {
        const productNames = lowStockProducts
            .map(p => `${p.name} (${p.stock})`)
            .filter(name => name && !name.includes('null'))
            .join('\n');
            
        if (productNames.trim()) {
            showNotification(`⚠️ تحذير مخزون منخفض (حد: ${threshold}):\n${productNames}`, 'warning', 8000);
        }
    }
}

// فحص المخزون كل 10 ثوانٍ
setInterval(checkLowStock, 10000);

// تحديث حد تحذير المخزون
document.addEventListener('DOMContentLoaded', function() {
    const thresholdInput = document.getElementById('lowStockThreshold');
    if (thresholdInput) {
        thresholdInput.addEventListener('change', function() {
            const newThreshold = parseInt(this.value);
            if (newThreshold > 0) {
                settings.lowStockThreshold = newThreshold;
                saveToStorage('settings', settings);
                showNotification('✅ تم تحديث حد تحذير المخزون', 'success', 3000);
            }
        });
    }
    
    // تفعيل/إلغاء تحذيرات المخزون
    const alertCheckbox = document.getElementById('lowStockAlertCheckbox');
    if (alertCheckbox) {
        alertCheckbox.addEventListener('change', function() {
            settings.lowStockAlert = this.checked;
            saveToStorage('settings', settings);
            toggleStockThresholdGroup();
            
            if (this.checked) {
                showNotification('✅ تم تفعيل تحذيرات المخزون', 'success', 3000);
            } else {
                showNotification('🔕 تم إلغاء تحذيرات المخزون', 'info', 3000);
            }
        });
    }
    
    // تحديث الصندوق
    const updateCashBtn = document.getElementById('updateCashDrawer');
    if (updateCashBtn) {
        updateCashBtn.addEventListener('click', function() {
            // طلب كلمة المرور
            const password = prompt('🔒 أدخل كلمة المرور لتعديل الصندوق:');
            if (password !== '00') {
                showNotification('❌ كلمة المرور خاطئة! لا يمكن تعديل الصندوق.', 'error', 3000);
                return;
            }
            
            const newUSD = parseFloat(document.getElementById('editCashUSD').value) || 0;
            const newLBP = parseFloat(document.getElementById('editCashLBP').value) || 0;
            
            if (!confirm(`هل أنت متأكد من تحديث الصندوق؟\nالرصيد الجديد: ${formatCurrency(newUSD, 'USD')} + ${formatCurrency(newLBP, 'LBP')}`)) {
                return;
            }
            
            // حساب الفرق وإضافة معاملة
            const diffUSD = newUSD - cashDrawer.cashUSD;
            const diffLBP = newLBP - cashDrawer.cashLBP;
            
            // تحديث الصندوق
            cashDrawer.cashUSD = newUSD;
            cashDrawer.cashLBP = newLBP;
            cashDrawer.lastUpdate = new Date().toISOString();
            
            // إضافة معاملة توضيحية
            if (diffUSD !== 0 || diffLBP !== 0) {
                cashDrawer.transactions.push({
                    date: new Date().toISOString(),
                    type: 'adjustment',
                    amountUSD: diffUSD,
                    amountLBP: diffLBP,
                    description: 'تعديل يدوي للصندوق من الإعدادات'
                });
            }
            
            // حفظ وتحديث
            saveToStorage('cashDrawer', cashDrawer);
            updateCashDrawerDisplay();
            updateCashDrawerSettings();
            
            showNotification(`✅ تم تحديث الصندوق بنجاح!
💵 دولار: ${formatCurrency(newUSD, 'USD')}
💰 ليرة: ${formatCurrency(newLBP, 'LBP')}`, 'success', 5000);
        });
    }
});

// زر القائمة للجوال
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');

if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
    
    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}
// تحسين الحسابات التلقائية
function ensureCalculationsWork() {
    // التأكد من عمل الحسابات التلقائية
    const currencySelect = document.getElementById('currency');
    const amountPaidInput = document.getElementById('amountPaid');
    const paymentCurrencySelect = document.getElementById('paymentCurrency');
    const changeCurrencySelect = document.getElementById('changeCurrency');
    
    // إضافة مستمعات إضافية للتأكد
    if (currencySelect) {
        currencySelect.addEventListener('change', function() {
            // تحديث فوري للعربة
            setTimeout(() => {
                updateCart();
                const amountPaid = document.getElementById('amountPaid');
                if (amountPaid && amountPaid.value && amountPaid.value > 0) {
                    calculateAndDisplayChange();
                }
            }, 100);
        });
    }
    
    // تحسين الاستجابة للتغييرات
    document.addEventListener('change', function(e) {
        if (e.target.id === 'amountPaid' || 
            e.target.id === 'paymentCurrency' || 
            e.target.id === 'changeCurrency') {
            
            const amountPaid = document.getElementById('amountPaid');
            if (amountPaid && amountPaid.value && amountPaid.value > 0) {
                setTimeout(() => {
                    calculateAndDisplayChange();
                }, 50);
            }
        }
    });
    
    // إعادة حساب كل شيء عند تحميل نقطة البيع
    const posPage = document.getElementById('pos');
    if (posPage && posPage.classList.contains('active')) {
        setTimeout(() => {
            updateCart();
            const amountPaid = document.getElementById('amountPaid');
            if (amountPaid && amountPaid.value && amountPaid.value > 0) {
                calculateAndDisplayChange();
            }
        }, 200);
    }
}
// تشغيل التحسينات
setTimeout(ensureCalculationsWork, 1000);

console.log('نظام إدارة المبيعات المتطور جاهز للاستخدام!');

// ===================== i18n: Dynamic Language Switching (AR/EN) =====================
(function setupI18n() {
    const translations = {
        ar: {
            app_title: 'نظام إدارة المبيعات',
            app_subtitle: 'Professional Sales System',
            logout: 'خروج',
            cash_drawer_label: 'الصندوق:',
            brand_compact: 'نظام المبيعات',
            // sidebar
            nav_dashboard: 'لوحة التحكم',
            nav_pos: 'نقطة البيع',
            nav_products: 'المنتجات',
            nav_sales: 'المبيعات',
            nav_invoices: 'الفواتير',
            nav_customers: 'العملاء',
            nav_reports: 'التقارير',
            nav_suppliers: 'الموردين',
            nav_settings: 'الإعدادات',
            // dashboard
            dashboard_title: 'لوحة التحكم',
            dashboard_subtitle: 'نظرة عامة على أداء المتجر',
            today_revenue: 'إيرادات اليوم',
            today_sales: 'مبيعات اليوم',
            total_products: 'إجمالي المنتجات',
            total_customers: 'إجمالي العملاء',
            weekly_sales: 'مبيعات الأسبوع',
            stock_alerts: 'تنبيهات المخزون',
            // POS
            pos_title: 'نقطة البيع',
            currency_label: 'العملة:',
            price_type_label: 'نوع السعر:',
            exchange_rate_prefix: 'سعر الصرف:',
            search_placeholder: 'ابحث عن منتج بالاسم أو الباركود...',
            cart_title: 'العربة',
            subtotal: 'المجموع الفرعي:',
            tax_11: 'الضريبة:',
            total_final: 'المجموع النهائي:',
            payment_method: 'طريقة الدفع:',
            payment_cash: 'دفع كامل (نقدي)',
            payment_partial: 'دفع جزئي (دين)',
            cash_pay_smart: 'دفع نقدي ذكي',
            cash_pay_desc: 'حساب الباقي تلقائياً بعملات مختلفة',
            pay_currency: 'عملة الدفع:',
            amount_paid: 'المبلغ المدفوع:',
            change_currency: 'عملة الباقي:',
            change_auto: 'تلقائي',
            calc_change: 'حساب الباقي',
            partial_title: 'دفع جزئي (دين)',
            partial_desc: 'ادفع جزء والباقي على الحساب',
            choose_customer: 'اختر العميل:',
            choose_customer_placeholder: 'اختر عميل...',
            partial_amount: 'مبلغ مدفوع:',
            partial_currency: 'عملة الدفع:',
            calc_debt: 'حساب الدين',
            process_payment: 'إتمام الدفع',
            clear_cart: 'مسح العربة',
            // Sales
            sales_manage: 'إدارة المبيعات',
            filter_all: 'جميع المبيعات',
            filter_completed: 'مكتملة فقط',
            filter_returned: 'مرجعة فقط',
            filter_partial: 'مرجعة جزئياً',
            filter_btn: 'تصفية',
            reset_btn: 'إعادة تعيين',
            // Products
            products_manage: 'إدارة المنتجات',
            add_product: 'إضافة منتج',
            th_product_name: 'اسم المنتج',
            th_category: 'التصنيف',
            th_barcode: 'الباركود',
            th_supplier: 'المورد',
            th_price_usd: 'السعر (USD)',
            th_price_lbp: 'السعر (LBP)',
            th_stock: 'المخزون',
            th_actions: 'الإجراءات',
            // Customers
            customers_manage: 'إدارة العملاء',
            add_customer: 'إضافة عميل',
            th_name: 'الاسم',
            th_email: 'البريد الإلكتروني',
            th_phone: 'الهاتف',
            th_address: 'العنوان',
            th_total_purchases: 'إجمالي المشتريات',
            th_loyalty_points: 'نقاط الولاء',
            th_current_debt: 'الدين الحالي',
            th_credit_limit: 'الحد الائتماني',
            th_join_date: 'تاريخ الانضمام',
            // Suppliers
            suppliers_manage: 'إدارة الموردين',
            add_supplier: 'إضافة مورد',
            th_supplier_name: 'اسم المورد',
            th_contact_person: 'الشخص المسؤول',
            // Search placeholders
            products_search_placeholder: 'ابحث داخل المنتجات...',
            suppliers_search_placeholder: 'ابحث داخل الموردين...',
            // Reports
            reports_title: 'التقارير',
            sales_report_card: 'تقرير المبيعات',
            inventory_report_card: 'تقرير المخزون',
            customers_report_card: 'تقرير العملاء',
            financial_report_card: 'التقرير المالي',
            view_report: 'عرض التقرير',
            // Settings
            settings_title: 'الإعدادات',
            store_info: 'معلومات المتجر',
            store_name: 'اسم المتجر',
            store_address: 'عنوان المتجر',
            store_phone: 'هاتف المتجر',
            currency_settings: 'إعدادات العملة',
            base_currency: 'العملة الأساسية',
            exchange_rate_label: 'سعر صرف الليرة اللبنانية',
            save_exchange_rate: 'حفظ سعر الصرف',
            // تم إزالة إعدادات الضريبة
            data_mgmt: 'إدارة البيانات',
            export_data: 'تصدير البيانات',
            import_data: 'استيراد البيانات',
            clear_all_data: 'مسح جميع البيانات',
            auto_backup_label: 'تفعيل النسخ الاحتياطي التلقائي',
            low_stock_alert_label: 'تفعيل تحذيرات المخزون المنخفض',
            low_stock_threshold: 'حد تحذير المخزون المنخفض:',
            threshold_help: 'سيظهر تحذير عندما تصل الكمية لهذا الحد أو أقل',
            cash_mgmt: 'إدارة الصندوق',
            current_balance: 'الرصيد الحالي:',
            edit_balance: 'تعديل الرصيد:',
            usd_label: 'الدولار الأمريكي ($):',
            lbp_label: 'الليرة اللبنانية (ل.ل):',
            update_cash: 'تحديث الصندوق',
        },
        en: {
            app_title: 'Sales Management System',
            app_subtitle: 'Professional Sales System',
            logout: 'Logout',
            cash_drawer_label: 'Cash Drawer:',
            brand_compact: 'Sales System',
            // sidebar
            nav_dashboard: 'Dashboard',
            nav_pos: 'POS',
            nav_products: 'Products',
            nav_sales: 'Sales',
            nav_invoices: 'Invoices',
            nav_customers: 'Customers',
            nav_reports: 'Reports',
            nav_suppliers: 'Suppliers',
            nav_settings: 'Settings',
            // dashboard
            dashboard_title: 'Dashboard',
            dashboard_subtitle: 'Store performance overview',
            today_revenue: 'Today Revenue',
            today_sales: 'Today Sales',
            total_products: 'Total Products',
            total_customers: 'Total Customers',
            weekly_sales: 'Weekly Sales',
            stock_alerts: 'Stock Alerts',
            // POS
            pos_title: 'Point of Sale',
            currency_label: 'Currency:',
            price_type_label: 'Price Type:',
            exchange_rate_prefix: 'Exchange Rate:',
            search_placeholder: 'Search by name or barcode...',
            cart_title: 'Cart',
            subtotal: 'Subtotal:',
            tax_11: 'Tax:',
            total_final: 'Total:',
            payment_method: 'Payment Method:',
            payment_cash: 'Full payment (Cash)',
            payment_partial: 'Partial payment (Credit)',
            cash_pay_smart: 'Smart Cash Payment',
            cash_pay_desc: 'Auto change across currencies',
            pay_currency: 'Pay Currency:',
            amount_paid: 'Amount Paid:',
            change_currency: 'Change Currency:',
            change_auto: 'Auto',
            calc_change: 'Calculate Change',
            partial_title: 'Partial (Credit)',
            partial_desc: 'Pay part, rest on account',
            choose_customer: 'Select Customer:',
            choose_customer_placeholder: 'Choose customer...',
            partial_amount: 'Paid Amount:',
            partial_currency: 'Pay Currency:',
            calc_debt: 'Calculate Credit',
            process_payment: 'Process Payment',
            clear_cart: 'Clear Cart',
            // Sales
            sales_manage: 'Sales Management',
            filter_all: 'All sales',
            filter_completed: 'Completed only',
            filter_returned: 'Returned only',
            filter_partial: 'Partially returned',
            filter_btn: 'Filter',
            reset_btn: 'Reset',
            // Products
            products_manage: 'Products Management',
            add_product: 'Add Product',
            th_product_name: 'Product Name',
            th_category: 'Category',
            th_barcode: 'Barcode',
            th_supplier: 'Supplier',
            th_price_usd: 'Price (USD)',
            th_price_lbp: 'Price (LBP)',
            th_stock: 'Stock',
            th_actions: 'Actions',
            // Customers
            customers_manage: 'Customers Management',
            add_customer: 'Add Customer',
            th_name: 'Name',
            th_email: 'Email',
            th_phone: 'Phone',
            th_address: 'Address',
            th_total_purchases: 'Total Purchases',
            th_loyalty_points: 'Loyalty Points',
            th_current_debt: 'Current Debt',
            th_credit_limit: 'Credit Limit',
            th_join_date: 'Join Date',
            // Suppliers
            suppliers_manage: 'Suppliers Management',
            add_supplier: 'Add Supplier',
            th_supplier_name: 'Supplier Name',
            th_contact_person: 'Contact Person',
            // Search placeholders
            products_search_placeholder: 'Search in products...',
            suppliers_search_placeholder: 'Search in suppliers...',
            // Reports
            reports_title: 'Reports',
            sales_report_card: 'Sales Report',
            inventory_report_card: 'Inventory Report',
            customers_report_card: 'Customers Report',
            financial_report_card: 'Financial Report',
            view_report: 'View Report',
            // Settings
            settings_title: 'Settings',
            store_info: 'Store Info',
            store_name: 'Store Name',
            store_address: 'Store Address',
            store_phone: 'Store Phone',
            currency_settings: 'Currency Settings',
            base_currency: 'Base Currency',
            exchange_rate_label: 'LBP Exchange Rate',
            save_exchange_rate: 'Save Exchange Rate',
            // تم إزالة إعدادات الضريبة
            data_mgmt: 'Data Management',
            export_data: 'Export Data',
            import_data: 'Import Data',
            clear_all_data: 'Clear All Data',
            auto_backup_label: 'Enable Auto Backup',
            low_stock_alert_label: 'Enable Low Stock Alerts',
            low_stock_threshold: 'Low stock threshold:',
            threshold_help: 'An alert appears when quantity reaches this threshold',
            cash_mgmt: 'Cash Drawer Management',
            current_balance: 'Current Balance:',
            edit_balance: 'Edit Balance:',
            usd_label: 'US Dollar ($):',
            lbp_label: 'Lebanese Pound (LBP):',
            update_cash: 'Update Drawer',
        }
    };

    function translateUI(lang) {
        const t = translations[lang] || translations.ar;
        const html = document.documentElement;
        html.lang = lang;
        html.dir = lang === 'ar' ? 'rtl' : 'ltr';

        // Header
        const brand = document.querySelector('.logo-small span');
        if (brand) brand.textContent = t.brand_compact;
        const cashLabel = document.querySelector('.cash-indicator span');
        if (cashLabel) cashLabel.textContent = t.cash_drawer_label;
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.lastChild && (logoutBtn.lastChild.textContent = ' ' + t.logout);

        // Language select UI reflect
        const langSelect = document.getElementById('languageSelect');
        if (langSelect && langSelect.value !== lang) langSelect.value = lang;

        // Sidebar
        const sideItems = [
            { sel: '.nav-item[data-screen="dashboard"] span', key: 'nav_dashboard' },
            { sel: '.nav-item[data-screen="pos"] span', key: 'nav_pos' },
            { sel: '.nav-item[data-screen="products"] span', key: 'nav_products' },
            { sel: '.nav-item[data-screen="sales"] span', key: 'nav_sales' },
            { sel: '.nav-item[onclick="showPage(\'invoices\')"] span', key: 'nav_invoices' },
            { sel: '.nav-item[data-screen="customers"] span', key: 'nav_customers' },
            { sel: '.nav-item[data-screen="reports"] span', key: 'nav_reports' },
            { sel: '.nav-item[data-screen="suppliers"] span', key: 'nav_suppliers' },
            { sel: '.nav-item[data-screen="settings"] span', key: 'nav_settings' },
        ];
        sideItems.forEach(it => {
            const el = document.querySelector(it.sel);
            if (el) el.textContent = t[it.key];
        });

        // Dashboard
        const dashHeader = document.querySelector('#dashboard .page-header h2');
        if (dashHeader) dashHeader.textContent = t.dashboard_title;
        const dashSub = document.querySelector('#dashboard .page-header p');
        if (dashSub) dashSub.textContent = t.dashboard_subtitle;
        const statLabels = document.querySelectorAll('#dashboard .stat-card .stat-content p');
        if (statLabels && statLabels.length >= 4) {
            statLabels[0].textContent = t.today_revenue;
            statLabels[1].textContent = t.today_sales;
            statLabels[2].textContent = t.total_products;
            statLabels[3].textContent = t.total_customers;
        }
        const weeklyTitle = document.querySelector('.dashboard-card h3 i.fa-chart-line')?.parentElement;
        if (weeklyTitle) weeklyTitle.childNodes[weeklyTitle.childNodes.length - 1].nodeValue = ' ' + t.weekly_sales;
        const stockAlertsTitle = document.querySelectorAll('.dashboard-card h3')[1];
        if (stockAlertsTitle && stockAlertsTitle.querySelector('i.fa-exclamation-triangle')) {
            stockAlertsTitle.childNodes[stockAlertsTitle.childNodes.length - 1].nodeValue = ' ' + t.stock_alerts;
        }

        // POS Header
        const posHeader = document.querySelector('#pos .page-header h2');
        if (posHeader) posHeader.textContent = t.pos_title;
        const currencyLabel = document.querySelector('#pos .currency-selector label:nth-of-type(1)');
        if (currencyLabel) currencyLabel.textContent = t.currency_label;
    const priceTypeLabel = document.querySelector('#pos .currency-selector label:nth-of-type(2)');
        if (priceTypeLabel) priceTypeLabel.textContent = t.price_type_label;
        const exchangeSpan = document.getElementById('exchangeRate');
        if (exchangeSpan) {
            const num = exchangeSpan.textContent.replace(/[^0-9,]/g, '').trim();
            exchangeSpan.textContent = `${t.exchange_rate_prefix} ${num} ل.ل`;
        }
        const searchInput = document.getElementById('productSearch');
        if (searchInput) searchInput.placeholder = t.search_placeholder;
        const cartTitle = document.querySelector('.cart-section h3');
        if (cartTitle) {
            const icon = cartTitle.querySelector('i');
            cartTitle.textContent = t.cart_title;
            if (icon) cartTitle.prepend(icon);
        }
        const totals = document.querySelectorAll('.cart-total .total-line span:first-child');
        if (totals && totals.length >= 3) {
            totals[0].textContent = t.subtotal;
            totals[1].textContent = t.tax_11;
            totals[2].textContent = t.total_final;
        }
    const pmLabel = document.querySelector('.payment-section > label');
    if (pmLabel) pmLabel.textContent = t.payment_method;
    const pmSelect = document.getElementById('paymentMethod');
    if (pmSelect && pmSelect.options.length >= 3) {
        pmSelect.options[0].textContent = t.payment_cash;
        pmSelect.options[1].textContent = t.credit_sale || (lang==='en' ? 'Credit Sale' : 'بيع بالدين');
        pmSelect.options[2].textContent = t.payment_partial;
    }
        const cashTitle = document.querySelector('#cashPaymentSection .cash-feature-highlight h3');
        if (cashTitle) cashTitle.textContent = t.cash_pay_smart;
        const cashDesc = document.querySelector('#cashPaymentSection .cash-feature-highlight p');
        if (cashDesc) cashDesc.textContent = t.cash_pay_desc;
        const payCurLabel = document.querySelector('#cashPaymentSection .payment-input .input-group:nth-of-type(1) label');
        if (payCurLabel) payCurLabel.textContent = t.pay_currency;
        const amtPaidLabel = document.querySelector('#cashPaymentSection .payment-input .input-group:nth-of-type(2) label');
        if (amtPaidLabel) amtPaidLabel.textContent = t.amount_paid;
        const changeCurLabel = document.querySelector('#cashPaymentSection .payment-input .input-group:nth-of-type(3) label');
        if (changeCurLabel) changeCurLabel.textContent = t.change_currency;
    const changeCurSelect = document.getElementById('changeCurrency');
    if (changeCurSelect && changeCurSelect.options.length >= 3) {
        changeCurSelect.options[0].textContent = t.change_auto;
        changeCurSelect.options[1].textContent = t['currency-usd'] || (lang==='en' ? 'US Dollar ($)' : 'دولار ($)');
        changeCurSelect.options[2].textContent = t['currency-lbp'] || (lang==='en' ? 'Lebanese Pound (LBP)' : 'ليرة (ل.ل)');
    }
        const calcBtn = document.getElementById('calculateChange');
        if (calcBtn) calcBtn.textContent = t.calc_change;
        const partialTitle = document.querySelector('#partialPaymentSection .credit-feature-highlight h3');
        if (partialTitle) partialTitle.textContent = t.partial_title;
        const partialDesc = document.querySelector('#partialPaymentSection .credit-feature-highlight p');
        if (partialDesc) partialDesc.textContent = t.partial_desc;
        const chooseCustLabel = document.querySelector('#partialPaymentSection .partial-payment-input .input-group:nth-of-type(1) label');
        if (chooseCustLabel) chooseCustLabel.textContent = t.choose_customer;
        const customerSelect = document.getElementById('customerSelect');
        if (customerSelect && customerSelect.options.length > 0) customerSelect.options[0].textContent = t.choose_customer_placeholder;
        const partialAmtLabel = document.querySelector('#partialPaymentSection .partial-payment-input .input-group:nth-of-type(2) label');
        if (partialAmtLabel) partialAmtLabel.textContent = t.partial_amount;
        const partialCurLabel = document.querySelector('#partialPaymentSection .partial-payment-input .input-group:nth-of-type(3) label');
        if (partialCurLabel) partialCurLabel.textContent = t.partial_currency;
        const calcDebtBtn = document.getElementById('calculateCredit');
        if (calcDebtBtn) calcDebtBtn.textContent = t.calc_debt;
        const processBtn = document.getElementById('processPayment');
        if (processBtn) {
            const icon = processBtn.querySelector('i');
            processBtn.textContent = t.process_payment;
            if (icon) processBtn.prepend(icon);
        }
        const clearBtn = document.getElementById('clearCart');
        if (clearBtn) {
            const icon = clearBtn.querySelector('i');
            clearBtn.textContent = t.clear_cart;
            if (icon) clearBtn.prepend(icon);
        }

        // Sales header controls
        const salesHeader = document.querySelector('#sales .page-header h2');
        if (salesHeader) {
            const icon = salesHeader.querySelector('i');
            salesHeader.textContent = ' ' + t.sales_manage;
            if (icon) salesHeader.prepend(icon);
        }
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter && statusFilter.options.length >= 4) {
            statusFilter.options[0].textContent = t.filter_all;
            statusFilter.options[1].textContent = t.filter_completed;
            statusFilter.options[2].textContent = t.filter_returned;
            statusFilter.options[3].textContent = t.filter_partial;
        }
        const filterBtn = document.getElementById('filterSales');
        if (filterBtn) filterBtn.textContent = t.filter_btn;
        const resetBtn = document.getElementById('resetFilter');
        if (resetBtn) resetBtn.textContent = t.reset_btn;

        // Products page
        const prodHeader = document.querySelector('#products .page-header h2');
        if (prodHeader) prodHeader.textContent = t.products_manage;
        const addProdBtn = document.getElementById('addProductBtn');
        if (addProdBtn) { const icon = addProdBtn.querySelector('i'); addProdBtn.textContent = t.add_product; if (icon) addProdBtn.prepend(icon); }
        const productsHead = document.querySelectorAll('#products thead th');
        if (productsHead && productsHead.length >= 9) {
            productsHead[0].textContent = t.th_product_name;
            productsHead[1].textContent = t.th_category;
            productsHead[2].textContent = t.th_barcode;
            productsHead[3].textContent = t.th_supplier;
            productsHead[4].textContent = t.th_price_usd;
            productsHead[5].textContent = t.th_cost_usd ? t.th_cost_usd : (lang === 'ar' ? 'التكلفة (USD)' : 'Cost (USD)');
            productsHead[6].textContent = t.th_price_lbp;
            productsHead[7].textContent = t.th_stock;
            productsHead[8].textContent = t.th_actions;
        }
        // Products page search input
        const productsSearchInput = document.getElementById('productsSearch');
        if (productsSearchInput) productsSearchInput.placeholder = t.products_search_placeholder;

        // Sales table head
        const salesHead = document.querySelectorAll('#sales thead th');
        if (salesHead && salesHead.length >= 7) {
            salesHead[0].textContent = lang === 'ar' ? 'رقم الفاتورة' : 'Invoice #';
            salesHead[1].textContent = lang === 'ar' ? 'التاريخ' : 'Date';
            salesHead[2].textContent = lang === 'ar' ? 'العميل' : 'Customer';
            salesHead[3].textContent = lang === 'ar' ? 'المبلغ' : 'Amount';
            salesHead[4].textContent = lang === 'ar' ? 'طريقة الدفع' : 'Payment Method';
            salesHead[5].textContent = lang === 'ar' ? 'الحالة' : 'Status';
            salesHead[6].textContent = lang === 'ar' ? 'الإجراءات' : 'Actions';
        }

        // Customers page
        const custHeader = document.querySelector('#customers .page-header h2');
        if (custHeader) {
            const icon = custHeader.querySelector('i');
            custHeader.textContent = ' ' + (lang === 'ar' ? 'إدارة العملاء' : 'Customers Management');
            if (icon) custHeader.prepend(icon);
        }
        const addCustBtn = document.getElementById('addCustomerBtn');
        if (addCustBtn) { const icon = addCustBtn.querySelector('i'); addCustBtn.textContent = t.add_customer; if (icon) addCustBtn.prepend(icon); }
        const customersHead = document.querySelectorAll('#customers thead th');
        if (customersHead && customersHead.length >= 10) {
            const labels = lang === 'ar' ? [t.th_name,t.th_email,t.th_phone,t.th_address,t.th_total_purchases,t.th_loyalty_points,t.th_current_debt,t.th_credit_limit,t.th_join_date,t.th_actions]
                                         : [t.th_name,t.th_email,t.th_phone,t.th_address,t.th_total_purchases,t.th_loyalty_points,t.th_current_debt,t.th_credit_limit,t.th_join_date,t.th_actions];
            customersHead.forEach((th, i) => th.textContent = labels[i]);
        }

        // Suppliers page
        const supHeader = document.querySelector('#suppliers .page-header h2');
        if (supHeader) { const icon = supHeader.querySelector('i'); supHeader.textContent = ' ' + (lang === 'ar' ? t.suppliers_manage : t.suppliers_manage); if (icon) supHeader.prepend(icon); }
        const addSupBtn = document.getElementById('addSupplierBtn');
        if (addSupBtn) { const icon = addSupBtn.querySelector('i'); addSupBtn.textContent = t.add_supplier; if (icon) addSupBtn.prepend(icon); }
        const suppliersSearchInput = document.getElementById('suppliersSearch');
        if (suppliersSearchInput) suppliersSearchInput.placeholder = t.suppliers_search_placeholder;
        const suppliersHead = document.querySelectorAll('#suppliers thead th');
        if (suppliersHead && suppliersHead.length >= 6) {
            suppliersHead[0].textContent = t.th_supplier_name;
            suppliersHead[1].textContent = t.th_email;
            suppliersHead[2].textContent = t.th_phone;
            suppliersHead[3].textContent = t.th_address;
            suppliersHead[4].textContent = t.th_contact_person;
            suppliersHead[5].textContent = t.th_actions;
        }

        // Reports page cards and title
        const reportsHeader = document.querySelector('#reports .page-header h2');
        if (reportsHeader) { const icon = reportsHeader.querySelector('i'); reportsHeader.textContent = ' ' + t.reports_title; if (icon) reportsHeader.prepend(icon); }
        const reportCards = document.querySelectorAll('#reports .report-card');
        if (reportCards && reportCards.length >= 4) {
            const titles = [t.sales_report_card, t.inventory_report_card, t.customers_report_card, t.financial_report_card];
            reportCards.forEach((card, i) => {
                const h3 = card.querySelector('h3');
                if (h3) { const icon = h3.querySelector('i'); h3.textContent = ' ' + titles[i]; if (icon) h3.prepend(icon); }
                const btn = card.querySelector('.report-btn');
                if (btn) btn.textContent = t.view_report;
            });
        }

        // Settings sections
        const settingsHeader = document.querySelector('#settings .page-header h2');
        if (settingsHeader) { const icon = settingsHeader.querySelector('i'); settingsHeader.textContent = ' ' + t.settings_title; if (icon) settingsHeader.prepend(icon); }
        const sections = document.querySelectorAll('#settings .settings-section');
        if (sections && sections.length >= 4) {
            const sectionTitles = [t.store_info, t.currency_settings, t.data_mgmt, t.cash_mgmt];
            sections.forEach((sec, i) => {
                const h3 = sec.querySelector('h3');
                if (h3) { const icon = h3.querySelector('i'); h3.textContent = ' ' + sectionTitles[i]; if (icon) h3.prepend(icon); }
            });
        }
        // Store info labels
        const storeLabels = document.querySelectorAll('#settings .settings-section:nth-of-type(1) .form-group label');
        if (storeLabels && storeLabels.length >= 3) {
            storeLabels[0].textContent = t.store_name;
            storeLabels[1].textContent = t.store_address;
            storeLabels[2].textContent = t.store_phone;
        }
        // Currency settings
        const curLabels = document.querySelectorAll('#settings .settings-section:nth-of-type(2) .form-group label');
        if (curLabels && curLabels.length >= 2) {
            curLabels[0].textContent = t.base_currency;
            curLabels[1].textContent = t.exchange_rate_label;
        }
        const saveExBtn = document.getElementById('updateExchangeRate');
        if (saveExBtn) { const icon = saveExBtn.querySelector('i'); saveExBtn.textContent = t.save_exchange_rate; if (icon) saveExBtn.prepend(icon); }
        // تم إزالة إعدادات الضريبة
        // Data management
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) { const icon = exportBtn.querySelector('i'); exportBtn.textContent = t.export_data; if (icon) exportBtn.prepend(icon); }
        const importLabel = document.querySelector('#settings .import-section label');
        if (importLabel) { const icon = importLabel.querySelector('i'); importLabel.textContent = t.import_data; if (icon) importLabel.prepend(icon); }
        const clearBtn2 = document.getElementById('clearDataBtn');
        if (clearBtn2) { const icon = clearBtn2.querySelector('i'); clearBtn2.textContent = t.clear_all_data; if (icon) clearBtn2.prepend(icon); }
        const autoBackup = document.querySelector('#settings #autoBackupCheckbox')?.parentElement;
        if (autoBackup) autoBackup.lastChild.nodeType === Node.TEXT_NODE ? autoBackup.lastChild.textContent = ' ' + t.auto_backup_label : autoBackup.append(' ' + t.auto_backup_label);
        const lowStock = document.querySelector('#settings #lowStockAlertCheckbox')?.parentElement;
        if (lowStock) lowStock.lastChild.nodeType === Node.TEXT_NODE ? lowStock.lastChild.textContent = ' ' + t.low_stock_alert_label : lowStock.append(' ' + t.low_stock_alert_label);
        const thrLabel = document.querySelector('#stockThresholdGroup label');
        if (thrLabel) thrLabel.textContent = t.low_stock_threshold;
        const thrSmall = document.querySelector('#stockThresholdGroup small');
        if (thrSmall) thrSmall.textContent = t.threshold_help;
        // Cash drawer labels
        const cashSecLabels = document.querySelectorAll('#settings .settings-section:nth-of-type(5) .form-group label');
        // Not all are direct; we set known ones below
        const currentBalanceH4 = document.querySelector('#settings .current-balance h4');
        if (currentBalanceH4) currentBalanceH4.textContent = t.current_balance;
        const editBalanceH4 = document.querySelector('#settings .edit-balance h4');
        if (editBalanceH4) editBalanceH4.textContent = t.edit_balance;
        const usdLbl = document.querySelector('#editCashUSD')?.closest('.form-group')?.querySelector('label');
        if (usdLbl) usdLbl.textContent = t.usd_label;
        const lbpLbl = document.querySelector('#editCashLBP')?.closest('.form-group')?.querySelector('label');
        if (lbpLbl) lbpLbl.textContent = t.lbp_label;
        const updateCashBtn = document.getElementById('updateCashDrawer');
        if (updateCashBtn) { const icon = updateCashBtn.querySelector('i'); updateCashBtn.textContent = t.update_cash; if (icon) updateCashBtn.prepend(icon); }
    }

    function setLanguage(lang) {
        // توحيد حالة اللغة مع النظام العام
        try { localStorage.setItem('appLanguage', lang); } catch(e) {}
        if (typeof window.changeLanguage === 'function') {
            // هذا سيستدعي translateUI و applyTranslations أيضاً
            try { window.changeLanguage(lang); return; } catch(e) {}
        }
        // احتياطي
        translateUI(lang);
    }

    document.addEventListener('DOMContentLoaded', function() {
        const saved = (function(){ try { return localStorage.getItem('appLanguage'); } catch(e) { return null; } })() || 'ar';
        // تحميل أولي موحد
        if (typeof window.changeLanguage === 'function') {
            try { window.changeLanguage(saved); } catch(e) { translateUI(saved); }
        } else {
            translateUI(saved);
        }
        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = saved;
            // تفادي مستمع مزدوج: نستخدم changeLanguage واحد فقط
            langSelect.addEventListener('change', function(){
                if (typeof window.changeLanguage === 'function') {
                    window.changeLanguage(this.value);
                } else {
                    setLanguage(this.value);
                }
            });
        }
    });
    // تعريض الدوال عالمياً لندمج مع النظام الموجود
    window.translateUI = translateUI;
    window.setLanguage = setLanguage;
})();
// تحسينات الموبايل
function setupMobileOptimizations() {
    // منع التكبير على iOS
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    // تحسين القائمة الجانبية للموبايل
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            if (overlay) {
                overlay.classList.toggle('active');
            }
        });
    }
    
    // إغلاق القائمة عند النقر على overlay
    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
    
    // إغلاق القائمة عند النقر على عنصر قائمة
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                if (overlay) {
                    overlay.classList.remove('active');
                }
            }
        });
    });
    
    // تحسين اللمس للمنتجات
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', function(e) {
            this.style.transform = 'scale(1)';
        });
    });
    
    // تحسين اللمس لأزرار العربة
    const cartButtons = document.querySelectorAll('.quantity-btn-horizontal-pos, .remove-btn-horizontal-pos');
    cartButtons.forEach(button => {
        button.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.9)';
        });
        
        button.addEventListener('touchend', function(e) {
            this.style.transform = 'scale(1)';
        });
    });
    
    // تحسين النوافذ المنبثقة للموبايل
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
    });
    
    // تحسين التمرير في العربة
    const cartContainer = document.querySelector('.cart-items-horizontal-pos');
    if (cartContainer) {
        cartContainer.addEventListener('touchstart', function(e) {
            this.style.overflowY = 'auto';
        });
    }
    
    // تحسين البحث للموبايل
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            // لا تمرير تلقائي على الموبايل لتجنب رفع الصفحة
        });
    }
    
    // تحسين الأزرار الكبيرة للموبايل
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        if (window.innerWidth <= 768) {
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
        }
    });
    
    // تحديث عند تغيير حجم الشاشة
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
            if (overlay) {
                overlay.classList.remove('active');
            }
        }
    });
}

// استدعاء تحسينات الموبايل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setupMobileOptimizations();
    setupNavigationToggle();
    setupLanguageToggle();
    
    // إعداد واجهة الدفع
    setupPartialPaymentInterface();
    
    // تحميل اللغة المحفوظة وتطبيق الترجمات مرة واحدة
    const savedLang = (function(){ try { return localStorage.getItem('appLanguage'); } catch(e) { return null; } })() || currentLanguage || 'ar';
    if (typeof window.changeLanguage === 'function') {
        try { window.changeLanguage(savedLang); } catch(e) { try { window.translateUI && window.translateUI(savedLang); } catch(_) {} }
    } else {
        try { window.translateUI && window.translateUI(savedLang); } catch(_) {}
        try { applyTranslations(); } catch(_) {}
    }
    
    // تحديث قوائم العملاء
    setTimeout(() => {
        updateCustomerSelectForCredit();
    }, 500);
    
    // التأكد من عمل زر التحكم بعد تحميل الصفحة
    setTimeout(() => {
        ensureToggleButtonWorks();
    }, 1000);
    
    // زر إكمال الباقي بالليرة
    const completeBtn = document.getElementById('completeRemainderLBP');
    if (completeBtn) completeBtn.innerHTML = `<i class="fas fa-exchange-alt"></i> ${getText('complete-remainder')}`;
    if (completeBtn) {
        completeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const currency = document.getElementById('currency').value;
            const paymentCurrency = document.getElementById('paymentCurrency').value;
            const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
            const finalTotalText = document.getElementById('finalTotal').textContent;
            let totalDueUSD;
            if (currency === 'USD') {
                totalDueUSD = parseFloat(finalTotalText.replace(/[^0-9.-]+/g, '')) || 0;
            } else {
                const rawLBP = parseFloat(finalTotalText.replace(/[^0-9.-]+/g, '')) || 0;
                totalDueUSD = rawLBP / (settings.exchangeRate || 1);
            }
            const paidUSD = paymentCurrency === 'USD' ? amountPaid : (amountPaid / (settings.exchangeRate || 1));
            const remainingUSD = Math.max(0, totalDueUSD - paidUSD);
            const remainderLBP = Math.round(remainingUSD * (settings.exchangeRate || 1));
            const disp = document.getElementById('remainderLBPDisplay');
            if (disp) {
                if (remainderLBP > 0) {
                    disp.style.display = 'inline-flex';
                    disp.textContent = `${remainderLBP.toLocaleString()} ل.ل`;
                } else {
                    disp.style.display = 'none';
                    disp.textContent = '';
                }
            }
            window.__completeRemainderLBP__ = remainderLBP > 0;
            showMessage(remainderLBP > 0 ? getText('will-complete-lbp') : getText('no-remainder'), remainderLBP > 0 ? 'success' : 'error');
        });
    }
});

// إعداد تبديل اللغة
function setupLanguageToggle() {
    const languageSelect = document.getElementById('languageSelect');
    
    if (languageSelect) {
        // تعيين اللغة الافتراضية فقط (تفادي مستمع مزدوج، تمت معالجته في i18n IIFE)
        languageSelect.value = currentLanguage;
        console.log('تم إعداد تبديل اللغة');
    }
}

// إعداد زر إظهار/إخفاء القائمة
function setupNavigationToggle() {
    const navToggleBtn = document.getElementById('navToggleBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (!navToggleBtn || !navMenu) {
        console.error('عناصر التحكم في القائمة غير موجودة');
        return;
    }
    
    console.log('تم العثور على زر التحكم:', navToggleBtn);
    
    // إضافة مستمع الحدث للنقر على الزر
    navToggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('تم النقر على زر التحكم');
        toggleNavigationMenu();
    });
    
    // تحديد الحالة الافتراضية (مفتوحة)
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.add('expanded');
    navMenu.classList.add('expanded');
    mainContent.classList.remove('sidebar-hidden');
    
    updateToggleButtonText(false);
    
    console.log('تم إعداد زر التحكم بنجاح');
}

// تبديل حالة القائمة (إظهار/إخفاء)
function toggleNavigationMenu() {
    const sidebar = document.querySelector('.sidebar');
    
    console.log('حالة القائمة الجانبية:', sidebar.classList.contains('collapsed'));
    
    if (sidebar.classList.contains('collapsed')) {
        // إظهار القائمة
        console.log('إظهار القائمة');
        showNavigationMenu();
    } else {
        // إخفاء القائمة
        console.log('إخفاء القائمة');
        hideNavigationMenu();
    }
}

// إظهار القائمة
function showNavigationMenu() {
    const navToggleBtn = document.getElementById('navToggleBtn');
    const navMenu = document.getElementById('navMenu');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // إظهار القائمة الجانبية
    sidebar.classList.remove('collapsed');
    sidebar.classList.add('expanded');
    
    // إظهار عناصر القائمة
    navMenu.classList.remove('collapsed');
    navMenu.classList.add('expanded');
    
    // تحديث الزر
    navToggleBtn.classList.remove('collapsed');
    
    // تعديل المحتوى الرئيسي
    mainContent.classList.remove('sidebar-hidden');
    
    updateToggleButtonText(false);
    
    // إظهار رسالة تأكيد
    showMessage(getText('menu-shown'), 'success');
}
// إخفاء القائمة
function hideNavigationMenu() {
    const navToggleBtn = document.getElementById('navToggleBtn');
    const navMenu = document.getElementById('navMenu');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // إخفاء القائمة الجانبية
    sidebar.classList.remove('expanded');
    sidebar.classList.add('collapsed');
    
    // إخفاء عناصر القائمة
    navMenu.classList.remove('expanded');
    navMenu.classList.add('collapsed');
    
    // تحديث الزر
    navToggleBtn.classList.add('collapsed');
    
    // تعديل المحتوى الرئيسي ليملأ المساحة
    mainContent.classList.add('sidebar-hidden');
    
    updateToggleButtonText(true);
    
    // إظهار رسالة تأكيد
    showMessage(getText('menu-hidden'), 'success');
}

// تحديث نص الزر
function updateToggleButtonText(isCollapsed) {
    const navToggleBtn = document.getElementById('navToggleBtn');
    const spanElement = navToggleBtn.querySelector('span');
    const eyeIcon = navToggleBtn.querySelector('i:first-child');
    
    if (isCollapsed) {
        spanElement.textContent = getText('show-menu');
        eyeIcon.className = 'fas fa-eye';
    } else {
        spanElement.textContent = getText('hide-menu');
        eyeIcon.className = 'fas fa-eye-slash';
    }
}

// إضافة وظيفة للتأكد من أن الزر يعمل دائماً
function ensureToggleButtonWorks() {
    const navToggleBtn = document.getElementById('navToggleBtn');
    const sidebar = document.querySelector('.sidebar');
    
    if (navToggleBtn && sidebar) {
        // إضافة مستمع الحدث مرة أخرى للتأكد
        navToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('تم النقر على الزر من ensureToggleButtonWorks');
            toggleNavigationMenu();
        });
        
        // إضافة مستمع الحدث للضغط على المفتاح Enter
        navToggleBtn.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                toggleNavigationMenu();
            }
        });
        
        console.log('تم التأكد من عمل زر التحكم في القائمة');
    } else {
        console.error('لم يتم العثور على عناصر التحكم');
    }
}

// جعل الوظيفة متاحة عالمياً
window.toggleNavigationMenu = toggleNavigationMenu;

// دالة لترجمة الصفحة الحالية
function translateCurrentPage() {
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        const pageId = activePage.id;
        if (pageId === 'sales') {
            translateSales();
        } else if (pageId === 'reports') {
            translateReports();
        }
    }
}

// استدعاء ترجمة الصفحة الحالية كل ثانية
setInterval(translateCurrentPage, 1000);

// ===== نظام البيع بالدين والأقساط =====

// إعداد واجهة البيع بالدين
function setupCreditSaleInterface() {
    const creditCustomerSelect = document.getElementById('creditCustomerSelect');
    if (!creditCustomerSelect) return;
    
    // تحديث قائمة العملاء للبيع بالدين
    updateCustomerSelectForCredit();
    
    // إضافة مستمع الحدث لاختيار العميل
    creditCustomerSelect.addEventListener('change', function() {
        const customerId = parseInt(this.value);
        if (customerId) {
            updateCreditInfo(customerId);
        }
    });
}

// إعداد واجهة البيع على أقساط
function setupInstallmentSaleInterface() {
    const installmentCustomerSelect = document.getElementById('installmentCustomerSelect');
    const calculateInstallmentBtn = document.getElementById('calculateInstallment');
    
    if (!installmentCustomerSelect) return;
    
    // تحديث قائمة العملاء للبيع على أقساط
    updateCustomerSelectForInstallment();
    
    // إضافة مستمع الحدث لحساب الأقساط
    if (calculateInstallmentBtn) {
        calculateInstallmentBtn.addEventListener('click', calculateInstallments);
    }
}

// تحديث قائمة العملاء للبيع بالدين
function updateCustomerSelectForCredit() {
    const creditCustomerSelect = document.getElementById('creditCustomerSelect');
    if (!creditCustomerSelect) {
        return;
    }
    
    // مسح الخيارات الموجودة
    creditCustomerSelect.innerHTML = '<option value="">اختر عميل...</option>';
    
    // إضافة العملاء
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        const remainingCredit = customer.creditLimit - (customer.currentDebt || 0);
        option.textContent = `${customer.name} (حد: ${customer.creditLimit}$ - متاح: ${remainingCredit}$)`;
        creditCustomerSelect.appendChild(option);
    });
}


// تحديث معلومات الائتمان
function updateCreditInfo(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
        return;
    }
    
    const creditLimitDisplay = document.getElementById('creditLimitDisplay');
    const currentDebtDisplay = document.getElementById('currentDebtDisplay');
    const remainingCreditDisplay = document.getElementById('remainingCreditDisplay');
    
    if (creditLimitDisplay) creditLimitDisplay.textContent = `${customer.creditLimit}$`;
    if (currentDebtDisplay) currentDebtDisplay.textContent = `${customer.currentDebt || 0}$`;
    
    const remainingCredit = customer.creditLimit - (customer.currentDebt || 0);
    if (remainingCreditDisplay) remainingCreditDisplay.textContent = `${remainingCredit}$`;
    
    // تغيير لون النص حسب الائتمان المتاح
    if (remainingCreditDisplay) {
        if (remainingCredit > 0) {
            remainingCreditDisplay.style.color = '#10b981';
        } else {
            remainingCreditDisplay.style.color = '#ef4444';
        }
    }
}




// معالجة البيع بالدين
function processCreditSale() {
    try {
        const customerId = document.getElementById('creditCustomerSelect')?.value || '';
        const currency = (document.getElementById('currency')?.value) || 'USD';
        const finalText = (document.getElementById('finalTotal')?.textContent || '').trim();
        let finalTotal = 0;
        if (currency === 'USD') {
            finalTotal = parseFloat(finalText.replace(/[^0-9.-]+/g, '')) || 0;
        } else {
            const rawLBP = parseFloat(finalText.replace(/[^0-9.-]+/g, '')) || 0;
            finalTotal = (rawLBP / (settings.exchangeRate || 1));
        }
        if (!customerId) {
            showMessage('يرجى اختيار عميل', 'error');
            return;
        }
        const customer = customers.find(c => c.id === parseInt(customerId));
        if (!customer) {
            showMessage('العميل غير موجود', 'error');
            return;
        }
        const existingDebt = (customer.currentDebt != null ? customer.currentDebt : (customer.creditBalance || 0));
        const remainingCredit = (customer.creditLimit || 0) - existingDebt;
        if (finalTotal > remainingCredit + 1e-6) {
            showMessage(getText('credit-exceeded'), 'error');
            return;
        }
        if (finalTotal <= 0) {
            showMessage('إجمالي الفاتورة غير صحيح', 'error');
            return;
        }
        if (confirm(getText('confirm-credit-sale'))) {
            customer.currentDebt = existingDebt + finalTotal;
            customer.creditBalance = customer.currentDebt;
            if (!Array.isArray(customer.creditHistory)) customer.creditHistory = [];
            customer.creditHistory.push({ timestamp: new Date().toISOString(), type: 'creditSale', amount: finalTotal, description: 'بيع بالدين كامل', balanceAfter: customer.creditBalance });
            saveToStorage('customers', customers);
            const newInvoice = createCreditSaleInvoice(customer, finalTotal);
            saveToStorage('sales', sales);
            try { updateCreditInfo(customer.id); } catch(e) {}
            try { updateCustomerSelectForCredit(); } catch(e) {}
            const logs = loadFromStorage('customerLogs', {});
            const key = String(customer.id);
            if (!Array.isArray(logs[key])) logs[key] = [];
            const logEntry = { timestamp: new Date().toLocaleString(), action: 'دين', user: (currentUser || 'المستخدم'), note: `فاتورة ${newInvoice.invoiceNumber} بقيمة ${finalTotal.toFixed(2)}$` };
            logs[key].push(logEntry);
            saveToStorage('customerLogs', logs);
            console.log('Saved customerLogs entry:', key, logEntry);
            clearCart();
            updateCart();
            lastCartFocusIndex = null;
            try { loadCustomers(); } catch(e) {}
            try {
                const currencyNow = (document.getElementById('currency')?.value) || 'USD';
                const subtotalEl = document.getElementById('subtotal');
                const finalEl = document.getElementById('finalTotal');
                if (subtotalEl) subtotalEl.textContent = formatCurrency(0, currencyNow);
                if (finalEl) finalEl.textContent = formatCurrency(0, currencyNow);
                const horiz = document.getElementById('cartItemsHorizontalPos');
                if (horiz) horiz.innerHTML = '<div class="cart-empty-horizontal-pos">🛒 العربة فارغة - انقر على المنتجات لإضافتها</div>';
            } catch(e) {}
            try { openCustomerTransactions(customer.id); } catch(e) {}
            showNotification(getText('credit-sale-success'), 'success', 3000);
            const pm = document.getElementById('paymentMethod');
            if (pm) {
                pm.value = 'cash';
                try { pm.dispatchEvent(new Event('change')); } catch(e) {}
            }
            const creditSectionEl = document.getElementById('creditSaleSection');
            if (creditSectionEl) creditSectionEl.style.display = 'none';
            const cashSectionEl = document.getElementById('cashPaymentSection');
            if (cashSectionEl) cashSectionEl.style.display = 'block';
            if (settings.printAfterSale && newInvoice) {
                setTimeout(() => {
                    showInvoice(newInvoice);
                }, 500);
            }
        }
    } catch (err) {
        console.error('processCreditSale error:', err);
        showMessage('حدث خطأ أثناء البيع بالدين: ' + (err?.message || err), 'error');
    }
}


// منشئ معرف فاتورة فريد
function generateInvoiceId() {
    const prefix = 'INV-';
    const time = Date.now().toString(36);
    const rand = Math.floor(Math.random() * 1e9).toString(36);
    return prefix + time + '-' + rand;
}

// إنشاء فاتورة البيع بالدين
function createCreditSaleInvoice(customer, amount) {
    const invoice = {
        id: generateInvoiceId(),
        invoiceNumber: `CR-${(sales.length + 1).toString().padStart(3, '0')}`,
        customerId: customer.id,
        customerName: customer.name,
        amount: amount,
        paymentMethod: 'credit',
        status: 'completed',
        date: new Date().toISOString(),
        items: [...cart]
    };
    
    sales.push(invoice);
    saveToStorage('sales', sales);
    // سجل المبيعات: البيع بالدين
    const salesLogs = loadFromStorage('salesLogs', []);
    salesLogs.push({
        timestamp: new Date().toLocaleString(),
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        currency: 'USD',
        method: 'credit',
        customer: invoice.customerName || '-',
        user: currentUser || 'المستخدم'
    });
    saveToStorage('salesLogs', salesLogs);
    return invoice;
}