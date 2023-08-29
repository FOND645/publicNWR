import path from "path";

// Класс экземпляров изделий в ремонте
export class repairDevice {
    constructor(deviceKey, serialNumber, repairNumber) {
        this.getRandomKey = getRandomKey;
        this.key = this.getRandomKey(); //Ключ для индексации
        this.createTime = Date.now(); //Дата/время создания экзепляра ремонта
        this.changeTime = this.createTime; //Дата/время последнего изменения
        this.deviceKey = deviceKey; //Индекс изделия
        this.repairNumber = repairNumber; // Номер дела ремонта
        this.serialNumber = serialNumber; //Серийный номер изделия
        this.subDevices = []; // Изделия в составе экземляра ремонта с неисправностями
        this.notes = [];
    }
}

// Класс экземпляров изделий по единичным договорам
export class unitReapirDevice extends repairDevice {
    constructor(deviceKey, serialNumber, repairNumber, organizationName, organizationCity) {
        super(deviceKey, serialNumber, repairNumber);
        this.progress = [
            new progressEvent("Поступило письмо", false),
            new progressEvent("Изделие поступило", false),
            new progressEvent("Проведена комиссия (станция в ремонте)", false),
            new progressEvent("Передано на упаковку", false),
            new progressEvent("Передано на сбыт", false),
            new progressEvent("Отгружено", false),
        ];
        this.organizationName = organizationName;
        this.organizationCity = organizationCity;
    }
}

// Класс событий в прогрессе ремонта
export class progressEvent {
    constructor(event, date) {
        this.event = event;
        this.date = date;
        this.key = getRandomKey();
    }
}

// Класс заметок к ремонту
export class repairNote {
    constructor(text, parent) {
        this.getRandomKey = getRandomKey;
        this.parent = parent;
        this.text = text;
        this.date = Date.now();
        this.key = this.getRandomKey();
    }
}

// Класс блоков изделий в ремонте
export class repairSubDevice {
    constructor(subDeviceKey, serialNumber, parent, count) {
        this.getRandomKey = getRandomKey;
        this.key = this.getRandomKey(); // Ключ для индексации
        this.subDeviceKey = subDeviceKey;
        this.serialNumber = serialNumber;
        this.parent = parent;
        this.count = count;
        this.defects = [];
    }
}

// Класс дефектов
export class defectItem {
    constructor(deviceKey, solution, description, defect) {
        this.getRandomKey = getRandomKey;
        this.key = this.getRandomKey();
        this.deviceKey = deviceKey;
        this.solution = solution;
        this.description = description;
        this.defect = defect;
        this.actions = [];
    }
}

// Класс действий для ПВР
export class defectAction {
    constructor(index, action) {
        this.key = getRandomKey();
        this.index = index;
        this.action = action;
        this.materials = [];
    }
}

// Класс патериалов (ПКИ) в неисправностях
export class defectMaterial {
    constructor(materialKey, count) {
        this.materialKey = materialKey;
        this.count = count;
        this.key = getRandomKey();
    }
}

// Класс материалов (ПКИ) в БД
export class material {
    constructor(name, unit) {
        this.name = name;
        this.unit = unit;
        this.key = getRandomKey();
    }
}

// Класс изделий
export class device {
    constructor(name, decimal) {
        this.getRandomKey = getRandomKey;
        this.key = this.getRandomKey(); // Ключ для индексации
        this.name = name;
        this.decimal = decimal;
        this.includes = [{ name: this.name, decimal: this.decimal, key: this.key }];
    }
}

// Класс устройств (блоков) в составе изделий
export class subDevice {
    constructor(name, decimal, parent) {
        this.getRandomKey = getRandomKey;
        this.key = this.getRandomKey(); // Ключ для индексации
        this.name = name;
        this.decimal = decimal;
        this.parent = parent;
    }
}

//Класс контрактов
export class Contract {
    constructor(organizationName, contractDate, contractNumber) {
        this.organizationName = organizationName;
        this.contractDate = contractDate;
        this.contractNumber = contractNumber;
        this.key = getRandomKey();
        this.repairBase = [];
    }
}

// Функция для генерации рандомного ключа
export function getRandomKey() {
    let alphabet = "0123456789abcdef";
    let hex = "#";
    [0, 0, 0, 0, 0, 0, 0, 0].forEach(() => {
        hex = hex + alphabet[Math.trunc(Math.random() * 16)];
    });
    return hex;
}
