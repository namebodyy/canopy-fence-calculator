// Калькулятор расчетов
class CanopyCalculator {
    constructor() {
        this.state = {
            mode: 'canopy',
            type: 'arch',
            length: 6,
            width: 5,
            height: 2.5,
            config: 'standard',
            lattice: '40',
            post: '60x60x3',
            roof: 'ns20-50',
            color: '#505050',
            delivery: true,
            mount: true
        };
    }

    calculate() {
        const { length, width, height, config, lattice, post } = this.state;
        
        // Площадь навеса
        const area = length * width;
        
        // Базовая стоимость
        const basePrice = area * PRICES.CANOPY_BASE;
        
        // Расчет элементов конструкции
        const postStep = TECHNICAL_LIMITS.posts.maxStep;
        const postsPerSide = Math.ceil(length / postStep) + 1;
        const posts = postsPerSide * 2;
        
        const trussStep = TECHNICAL_LIMITS.trusses.steps[config];
        const trusses = Math.ceil(length / trussStep) + 1;
        
        const lathingStep = TECHNICAL_LIMITS.lathing.steps[lattice];
        const lathingRows = Math.max(1, Math.ceil(length / lathingStep));
        
        // Площадь кровли с коэффициентом в зависимости от типа
        let roofCoeff = 1.03;
        if (this.state.type === 'arch') roofCoeff = 1.08;
        else if (this.state.type === 'gable') roofCoeff = 1.05;
        else if (this.state.type === 'semi') roofCoeff = 1.06;
        
        const roofArea = area * roofCoeff;
        
        // Доставка
        let deliveryPrice = 0;
        if (this.state.delivery) {
            deliveryPrice = Math.max(
                PRICES.DELIVERY_MIN,
                Math.min(
                    PRICES.DELIVERY_MAX,
                    3000 + area * PRICES.DELIVERY_COEFF
                )
            );
        }
        
        // Монтаж
        let mountPrice = 0;
        if (this.state.mount) {
            mountPrice = Math.max(PRICES.MOUNT_MIN, area * PRICES.MOUNT_COEFF);
        }
        
        const total = basePrice + deliveryPrice + mountPrice;
        
        return {
            area,
            basePrice,
            deliveryPrice,
            mountPrice,
            total,
            posts,
            trusses,
            lathingRows,
            roofArea,
            roofCoeff
        };
    }

    calculateFence() {
        const { length: fenceLength } = this.state;
        
        const basePrice = fenceLength * PRICES.FENCE_BASE;
        
        const postStep = 2.5;
        const posts = Math.ceil(fenceLength / postStep) + 1;
        const crossbars = Math.ceil(fenceLength / 2.5);
        
        let deliveryPrice = 0;
        if (this.state.fenceDelivery) {
            deliveryPrice = Math.max(
                3000,
                Math.min(12000, 2500 + fenceLength * 60)
            );
        }
        
        let mountPrice = 0;
        if (this.state.fenceMount) {
            mountPrice = Math.max(8000, fenceLength * 450);
        }
        
        const total = basePrice + deliveryPrice + mountPrice;
        
        return {
            length: fenceLength,
            basePrice,
            deliveryPrice,
            mountPrice,
            total,
            posts,
            crossbars
        };
    }

    getSpecification() {
        const calc = this.calculate();
        const { post, roof } = this.state;
        
        const material = MATERIALS.roofing[roof];
        const postMaterial = MATERIALS.posts[post];
        
        return [
            {
                num: '1',
                name: `Профильная труба для столбов ${postMaterial.name}`,
                qty: calc.posts,
                unit: 'шт.'
            },
            {
                num: '2',
                name: 'Фермы / несущие рамы',
                qty: calc.trusses,
                unit: 'шт.'
            },
            {
                num: '3',
                name: 'Обрешетка, расчетный ряд',
                qty: calc.lathingRows,
                unit: 'ряд.'
            },
            {
                num: '4',
                name: `Кровельный материал ${material.name}`,
                qty: calc.roofArea.toFixed(2),
                unit: 'м²'
            },
            {
                num: '5',
                name: 'Цвет',
                qty: MATERIALS.colors[this.state.color],
                unit: ''
            }
        ];
    }

    getFenceSpecification() {
        const calc = this.calculateFence();
        
        return [
            {
                num: '1',
                name: `Столбы ${MATERIALS.posts[this.state.fencePost].name}`,
                qty: calc.posts,
                unit: 'шт.'
            },
            {
                num: '2',
                name: 'Поперечины профильные',
                qty: calc.crossbars,
                unit: 'ряд.'
            },
            {
                num: '3',
                name: `Заполнение ${this.state.fenceMaterial}`,
                qty: calc.length.toFixed(2),
                unit: 'пог. м'
            }
        ];
    }
}

const calculator = new CanopyCalculator();
