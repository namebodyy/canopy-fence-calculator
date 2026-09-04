let canopyScene = null;
let fenceScene = null;
let currentMode = 'canopy';

// Инициализация сцен при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initializeThreeScenes();
    initializeEventListeners();
    updateCalculator();
});

function initializeThreeScenes() {
    const canvasContainer = document.getElementById('canvas-container');
    const fenceCanvasContainer = document.getElementById('fence-canvas-container');
    
    if (canvasContainer) {
        canopyScene = new ThreeScene(
            document.getElementById('three-canvas'),
            'canopy'
        );
        canopyScene.init();
        canopyScene.animate();
    }
    
    if (fenceCanvasContainer) {
        fenceScene = new ThreeScene(
            document.getElementById('fence-three-canvas'),
            'fence'
        );
        fenceScene.init();
        fenceScene.animate();
    }
}

function initializeEventListeners() {
    // Связка range и number inputs для на��еса
    bindRangeInputs('cwR', 'cw');
    bindRangeInputs('clR', 'cl');
    bindRangeInputs('chR', 'ch');
    
    // Связка range и number inputs для забора
    bindRangeInputs('flR', 'fl');
    bindRangeInputs('fhR', 'fh');
    
    // Tab switching
    document.querySelectorAll('.tabs button').forEach(btn => {
        btn.addEventListener('click', function() {
            switchMode(this.dataset.mode);
        });
    });
    
    // Canopy controls
    document.querySelectorAll('#canopyType button').forEach(btn => {
        btn.addEventListener('click', function() {
            updateSegment('canopyType', this);
            updateCalculator();
        });
    });
    
    document.querySelectorAll('#config button').forEach(btn => {
        btn.addEventListener('click', function() {
            updateSegment('config', this);
            updateCalculator();
        });
    });
    
    document.querySelectorAll('#lattice button').forEach(btn => {
        btn.addEventListener('click', function() {
            updateSegment('lattice', this);
            updateCalculator();
        });
    });
    
    // Selects
    ['post', 'roof', 'color', 'delivery', 'mount', 
     'fMaterial', 'fPost', 'fColor', 'fDelivery', 'fMount'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener('change', updateCalculator);
        }
    });
    
    // Number/Range inputs
    ['cw', 'cwR', 'cl', 'clR', 'ch', 'chR',
     'fl', 'flR', 'fh', 'fhR'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener('input', updateCalculator);
        }
    });
    
    // 3D Controls - Canopy
    document.getElementById('btn-3d')?.addEventListener('click', () => {
        canopyScene?.resetView('3d');
    });
    document.getElementById('btn-top')?.addEventListener('click', () => {
        canopyScene?.resetView('top');
    });
    document.getElementById('btn-front')?.addEventListener('click', () => {
        canopyScene?.resetView('front');
    });
    document.getElementById('btn-side')?.addEventListener('click', () => {
        canopyScene?.resetView('side');
    });
    document.getElementById('btn-iso')?.addEventListener('click', () => {
        canopyScene?.resetView('iso');
    });
    document.getElementById('btn-reset')?.addEventListener('click', () => {
        canopyScene?.resetView('3d');
    });
    
    // 3D Controls - Fence
    document.getElementById('fbtn-3d')?.addEventListener('click', () => {
        fenceScene?.resetView('3d');
    });
    document.getElementById('fbtn-top')?.addEventListener('click', () => {
        fenceScene?.resetView('top');
    });
    document.getElementById('fbtn-front')?.addEventListener('click', () => {
        fenceScene?.resetView('front');
    });
    document.getElementById('fbtn-side')?.addEventListener('click', () => {
        fenceScene?.resetView('side');
    });
    document.getElementById('fbtn-iso')?.addEventListener('click', () => {
        fenceScene?.resetView('iso');
    });
    document.getElementById('fbtn-reset')?.addEventListener('click', () => {
        fenceScene?.resetView('3d');
    });
}

function bindRangeInputs(rangeId, numberId) {
    const rangeInput = document.getElementById(rangeId);
    const numberInput = document.getElementById(numberId);
    
    if (!rangeInput || !numberInput) return;
    
    rangeInput.addEventListener('input', function() {
        numberInput.value = this.value;
        updateCalculator();
    });
    
    numberInput.addEventListener('input', function() {
        rangeInput.value = this.value;
        updateCalculator();
    });
}

function updateSegment(segmentId, button) {
    const container = document.getElementById(segmentId);
    if (!container) return;
    
    container.querySelectorAll('button').forEach(b => {
        b.classList.remove('active');
    });
    button.classList.add('active');
}

function switchMode(mode) {
    currentMode = mode;
    
    // Update tabs
    document.querySelectorAll('.tabs button').forEach(b => {
        b.classList.toggle('active', b.dataset.mode === mode);
    });
    
    // Update calculators
    document.getElementById('canopy').classList.toggle('hidden', mode !== 'canopy');
    document.getElementById('fence').classList.toggle('hidden', mode !== 'fence');
    
    // Update heading
    const heading = document.querySelector('h1');
    if (heading) {
        heading.textContent = mode === 'canopy' 
            ? 'Калькулятор расчета навеса из профильной трубы'
            : 'Калькулятор расчета забора';
    }
    
    updateCalculator();
}

function getCanopyState() {
    return {
        type: document.querySelector('#canopyType button.active')?.dataset.value || 'arch',
        length: parseFloat(document.getElementById('cw')?.value || 6),
        width: parseFloat(document.getElementById('cl')?.value || 5),
        height: parseFloat(document.getElementById('ch')?.value || 2.5),
        config: document.querySelector('#config button.active')?.dataset.value || 'standard',
        lattice: document.querySelector('#lattice button.active')?.dataset.value || '40',
        post: document.getElementById('post')?.value || '60x60x3',
        roof: document.getElementById('roof')?.value || 'ns20-50',
        color: document.getElementById('color')?.value || '#505050',
        delivery: document.getElementById('delivery')?.checked || false,
        mount: document.getElementById('mount')?.checked || false
    };
}

function getFenceState() {
    return {
        material: document.getElementById('fMaterial')?.value || 'ns20-50',
        length: parseFloat(document.getElementById('fl')?.value || 20),
        height: parseFloat(document.getElementById('fh')?.value || 1.8),
        post: document.getElementById('fPost')?.value || '60x60x3',
        color: document.getElementById('fColor')?.value || '#505050',
        delivery: document.getElementById('fDelivery')?.checked || false,
        mount: document.getElementById('fMount')?.checked || false
    };
}

function updateCalculator() {
    if (currentMode === 'canopy') {
        updateCanopyCalculator();
    } else {
        updateFenceCalculator();
    }
}

function updateCanopyCalculator() {
    const state = getCanopyState();
    
    // Update calculator state
    calculator.state = {
        mode: 'canopy',
        ...state
    };
    
    const calc = calculator.calculate();
    
    // Update prices
    document.getElementById('areaOut').textContent = formatNumber(calc.area) + ' м²';
    document.getElementById('baseOut').textContent = formatCurrency(calc.basePrice);
    document.getElementById('deliveryOut').textContent = formatCurrency(calc.deliveryPrice);
    document.getElementById('mountOut').textContent = formatCurrency(calc.mountPrice);
    document.getElementById('totalOut').textContent = formatCurrency(calc.total);
    
    // Update formula
    const formula = document.getElementById('formula') || {};
    formula.textContent = `${state.length} × ${state.width} × 7 000 = ${formatCurrency(calc.basePrice)}`;
    
    // Update post hint
    const postHint = document.getElementById('postHint');
    if (postHint) {
        const step = TECHNICAL_LIMITS.posts.maxStep;
        postHint.textContent = `Шаг стоек ${step} м. Количество столбов: ${calc.posts} шт.`;
    }
    
    // Update quality message
    const quality = document.getElementById('quality');
    if (quality) {
        const configText = {
            'standard': 'Стандартная конфигурация: шаг ферм до 1,5 м.',
            'reinforced': 'Усиленная конфигурация: шаг ферм 1,25 м.',
            'max': 'Максимальная конфигурация: шаг ферм 1 м.'
        };
        quality.textContent = configText[state.config] || '';
        quality.className = 'ok';
    }
    
    // Update specification table
    const spec = calculator.getSpecification();
    const specTableBody = document.getElementById('canopySpec');
    if (specTableBody) {
        specTableBody.innerHTML = spec.map((row, i) => `
            <tr>
                <td>${row.num}</td>
                <td>${row.name}</td>
                <td>${row.qty}</td>
                <td>${row.unit}</td>
            </tr>
        `).join('');
    }
    
    // Update 3D scene
    if (canopyScene) {
        canopyScene.updateCanopy(state);
    }
}

function updateFenceCalculator() {
    const state = getFenceState();
    
    // Update calculator state
    calculator.state = {
        mode: 'fence',
        fenceDelivery: state.delivery,
        fenceMount: state.mount,
        length: state.length,
        fenceMaterial: state.material,
        fencePost: state.post,
        fenceColor: state.color
    };
    
    const calc = calculator.calculateFence();
    
    // Update prices
    document.getElementById('fLengthOut').textContent = formatNumber(calc.length) + ' пог. м';
    document.getElementById('fBaseOut').textContent = formatCurrency(calc.basePrice);
    document.getElementById('fDeliveryOut').textContent = formatCurrency(calc.deliveryPrice);
    document.getElementById('fMountOut').textContent = formatCurrency(calc.mountPrice);
    document.getElementById('fTotalOut').textContent = formatCurrency(calc.total);
    
    // Update quality message
    const quality = document.getElementById('fQuality');
    if (quality) {
        quality.textContent = `Столбов: ${calc.posts} шт. при шаге не более 2,5 м. Поперечин: ${calc.crossbars} ряд.`;
        quality.className = 'ok';
    }
    
    // Update specification table
    const spec = calculator.getFenceSpecification();
    const specTableBody = document.getElementById('fenceSpec');
    if (specTableBody) {
        specTableBody.innerHTML = spec.map((row, i) => `
            <tr>
                <td>${row.num}</td>
                <td>${row.name}</td>
                <td>${row.qty}</td>
                <td>${row.unit}</td>
            </tr>
        `).join('');
    }
    
    // Update 3D scene
    if (fenceScene) {
        fenceScene.updateFence(state);
    }
}
