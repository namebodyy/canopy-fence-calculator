// Материалы и цены
const MATERIALS = {
    roofing: {
        'ns8-40': { name: 'Профнастил НС-8 (0,4 мм)', price: 180, unit: 'м²' },
        'ns8-45': { name: 'Профнастил НС-8 (0,45 мм)', price: 185, unit: 'м²' },
        'ns8-50': { name: 'Профнастил НС-8 (0,5 мм)', price: 190, unit: 'м²' },
        'ns10-50': { name: 'Профнастил НС-10 (0,5 мм)', price: 200, unit: 'м²' },
        'ns20-45': { name: 'Профнастил НС-20 (0,45 мм)', price: 210, unit: 'м²' },
        'ns20-50': { name: 'Профнастил НС-20 (0,5 мм)', price: 215, unit: 'м²' },
        'ns20-55': { name: 'Профнастил НС-20 (0,55 мм)', price: 220, unit: 'м²' },
        'ns21-50': { name: 'Профнастил НС-21 (0,5 мм)', price: 225, unit: 'м²' },
        'ns35-50': { name: 'Профнастил НС-35 (0,5 мм)', price: 240, unit: 'м²' },
        'steel-roll': { name: 'Рулонная сталь (0,5 мм)', price: 200, unit: 'м²' },
        'siding-board': { name: 'Металлосайдинг «Корабельная доска»', price: 350, unit: 'м²' },
        'siding-evro': { name: 'Металлосайдинг «Евробрус»', price: 340, unit: 'м²' }
    },
    posts: {
        '60x60x2': { name: 'Труба 60×60×2 мм', price: 180, unit: 'м' },
        '60x60x3': { name: 'Труба 60×60×3 мм', price: 220, unit: 'м' },
        '80x80x3': { name: 'Труба 80×80×3 мм', price: 280, unit: 'м' }
    },
    colors: {
        '#505050': 'Графит серый 7024',
        '#1a1a1a': 'Черный 9005',
        '#717171': 'Серый 7004',
        '#6b4423': 'Шоколадно-коричневый 8017',
        '#8b4513': 'Красно-коричневый 3011',
        '#003da5': 'Сигнально-синий 5005',
        '#2d5016': 'Зеленый мох 6005'
    }
};

const PRICES = {
    CANOPY_BASE: 7000,     // ₽/м²
    FENCE_BASE: 1200,      // ₽/пог.м
    DELIVERY_MIN: 3500,
    DELIVERY_MAX: 15000,
    DELIVERY_COEFF: 80,    // ₽/м²
    MOUNT_MIN: 12000,
    MOUNT_COEFF: 700       // ₽/м²
};

const TECHNICAL_LIMITS = {
    posts: {
        maxStep: 2.5,
        minProfile: '60x60x2'
    },
    trusses: {
        maxStep: 1.5,
        steps: {
            standard: 1.5,
            reinforced: 1.25,
            max: 1.0
        }
    },
    lathing: {
        maxStep: 0.5,
        steps: {
            '40': 0.4,
            '50': 0.5,
            '35': 0.35
        }
    }
};

function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(value)) + ' ₽';
}

function formatNumber(value, decimals = 2) {
    return value.toFixed(decimals).replace('.', ',');
}
