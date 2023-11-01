import { compareText, folderExists } from '@src/globalFunctions';
import { settings } from './settings';
import path from 'path';
import XlsxPopulate from 'xlsx-populate';
import { mkdirSync, writeFileSync } from 'fs-extra';
import { DB } from './classes';

interface repairDevice {
    organizationName: string;
    organizationCity: string;
    contractNumber: string;
    contractsDate: string;
    contractID: number;
    deviceID: number;
    divided: 1 | null;
    repairNumber: number;
    serialNumber: string;
    deviceName: string;
    deviceDecimal: string;
}

export interface createDocStatus {
    isSuccess: boolean;
    error?: unknown;
    message?: string;
}

interface replacer {
    placeholder: string;
    string: string;
}

const getDeviceSQL = `SELECT organiztions.name AS "organizationName",
organiztions.city AS "organizationCity",
contracts.number AS "contractNumber",
contracts."date" AS "contractsDate",
contracts.id AS "contractID",
repair_devices.divided,
devices.id AS "deviceID",
repair_devices.repair_number AS "repairNumber",
repair_devices.serial_number AS "serialNumber",
devices.name AS "deviceName",
devices.decimal AS "deviceDecimal"	
FROM repair_devices
JOIN devices ON repair_devices.device_id = devices.id
JOIN contracts on contracts.id = repair_devices.contract_id
JOIN organiztions ON organiztions.id = contracts.organiztion_id
WHERE repair_devices.id = ?`;

export async function createDefectList(repairDeviceID: number, resDB: DB) {
    interface repairBlock {
        repairBlockID: number;
        serialNumber: string;
        count: number;
        decimal: string;
        defects?: defect[];
    }

    interface IduplicatedBlocks {
        [K: string]: repairBlock[];
    }

    interface defect {
        defect: string;
        solution: string;
    }

    const dbAll = resDB.getDBAll();

    const [device] = await dbAll<[repairDevice]>(getDeviceSQL, [
        repairDeviceID,
    ]);

    const getBlocksSQL = `SELECT repair_blocks.id AS "repairBlockID",
	blocks.decimal AS "decimal",
	repair_blocks.serial_number AS "serialNumber",
	repair_blocks."count"	
	FROM repair_blocks
	JOIN blocks ON blocks.id = repair_blocks.block_id
	WHERE repair_blocks.repair_device_id = ?`;

    const getDefectsSQL = `SELECT defects.defect,
	defects.solution
    FROM defects_in_repair
    JOIN defects ON defects_in_repair.defect_id = defects.id
    WHERE defects_in_repair.repair_blocks_id = ?`;

    const blocks = await dbAll<repairBlock[]>(getBlocksSQL, [repairDeviceID]);
    for (let I in blocks) {
        const defects = await dbAll<defect[]>(getDefectsSQL, [
            blocks[I].repairBlockID,
        ]);
        blocks[I].defects = defects;
    }

    let uniqueBlocks: repairBlock[] = [];
    let dublicatedBlocks: IduplicatedBlocks = {};
    blocks.forEach((Block) => {
        // Считаем количество таких же блоков
        const blocksCount = blocks.reduce(
            (count: number, block: repairBlock) => {
                if (Block.decimal === block.decimal) count++;
                return count;
            },
            0
        );
        if (blocksCount === 1) {
            uniqueBlocks.push(Block);
        } else {
            if (!dublicatedBlocks.hasOwnProperty(Block.decimal)) {
                dublicatedBlocks[Block.decimal] = [];
            }
            dublicatedBlocks[Block.decimal].push(Block);
        }
    });

    let replacers: replacer[] = [];

    replacers.push(
        {
            placeholder: `{deviceName}`,
            string: device.deviceName,
        },
        {
            placeholder: `{deviceDecimal}`,
            string: device.deviceDecimal,
        },
        {
            placeholder: `{SN}`,
            string: device.serialNumber,
        },
        {
            placeholder: `{repairNumber}`,
            string: device.repairNumber.toString(),
        },
        {
            placeholder: `{organizationName}`,
            string: device.organizationName,
        },
        {
            placeholder: `{organizationCity}`,
            string: device.organizationCity,
        },
        {
            placeholder: `{contractNumber}`,
            string: device.contractNumber,
        },
        {
            placeholder: `{contractDate}`,
            string: device.contractsDate,
        }
    );

    uniqueBlocks.forEach((Block) => {
        const { decimal, count, serialNumber, defects } = Block;
        let Defects: string[] = [];
        let Solutions: string[] = [];
        defects?.forEach((Defect) => {
            if (Defect.defect) Defects.push(Defect.defect);
            if (Defect.solution) Solutions.push(Defect.solution);
        });
        replacers.push(
            {
                placeholder: `{${decimal}_SN}`,
                string: serialNumber,
            },
            {
                placeholder: `{${decimal}_cnt}`,
                string: count.toString(),
            },
            {
                placeholder: `{${decimal}_defects}`,
                string: Defects.join(`\n`),
            },
            {
                placeholder: `{${decimal}_solutions}`,
                string: Solutions.join(`\n`),
            }
        );
    });

    for (let doubleDecimal in dublicatedBlocks) {
        const blocksArray = dublicatedBlocks[doubleDecimal];
        blocksArray.forEach((Block, index) => {
            const { decimal, count, serialNumber, defects } = Block;
            let Defects: string[] = [];
            let Solutions: string[] = [];
            defects?.forEach((Defect) => {
                if (Defect.defect) Defects.push(Defect.defect);
                if (Defect.solution) Solutions.push(Defect.solution);
            });
            replacers.push(
                {
                    placeholder: `{${decimal}#${index + 1}_SN}`,
                    string: serialNumber,
                },
                {
                    placeholder: `{${decimal}#${index + 1}_cnt}`,
                    string: count.toString(),
                },
                {
                    placeholder: `{${decimal}#${index + 1}_defects}`,
                    string: Defects.join(`\n`),
                },
                {
                    placeholder: `{${decimal}#${index + 1}_solutions}`,
                    string: Solutions.join(`\n`),
                }
            );
        });
    }

    const { blanksFolerPath, documentsFolderPath } = settings;
    const blankPath = path.join(
        blanksFolerPath,
        device.contractID.toString(),
        `${device.deviceID}_defectBlank.xlsx`
    );

    const contractsDocsPath = path.join(
        documentsFolderPath,
        device.contractID.toString()
    );

    const contractDefectListsFoler = path.join(
        contractsDocsPath,
        'Карты дефектации'
    );
    const outPath = path.join(
        contractDefectListsFoler,
        `${device.deviceName} - №${device.repairNumber} ${device.serialNumber}.xlsx`
    );

    let result: createDocStatus = {
        isSuccess: false,
    };

    await new Promise((resolve, reject) => {
        XlsxPopulate.fromFileAsync(blankPath).then((doc) => {
            const sheet = doc.sheet(0);
            replacers.forEach((Replacer) => {
                const { placeholder, string } = Replacer;
                sheet.find(placeholder, () => string);
            });

            try {
                if (!folderExists(documentsFolderPath))
                    mkdirSync(documentsFolderPath);
                if (!folderExists(contractsDocsPath))
                    mkdirSync(contractsDocsPath);
                if (!folderExists(contractDefectListsFoler))
                    mkdirSync(contractDefectListsFoler);
            } catch (error) {
                result = {
                    isSuccess: false,
                    error: error,
                    message: 'Ошибка при обработке пути к документу',
                };
                resolve(true);
            }

            doc.toFileAsync(outPath)
                .then(() => {
                    result = {
                        isSuccess: true,
                    };
                    resolve(true);
                })
                .catch((error) => {
                    result = {
                        isSuccess: false,
                        error: error,
                        message: 'Произошла ошибка при создании документа',
                    };
                    resolve(true);
                });
        });
    });
    return result;
}

export async function createActionList(repairDeviceID: number, resDB: DB) {
    interface action {
        id: number;
        action: string;
        index: string;
        materials?: material[];
    }

    interface material {
        materialID: number;
        name: string;
        count: number;
        unit: string;
    }

    const dbAll = resDB.getDBAll();

    const [device] = await dbAll<[repairDevice]>(getDeviceSQL, [
        repairDeviceID,
    ]);

    let replacers: replacer[] = [];
    let serialNumbersReplacers: replacer[] = [];
    replacers.push(
        {
            placeholder: `{deviceName}`,
            string: device.deviceName,
        },
        {
            placeholder: `{deviceDecimal}`,
            string: device.deviceDecimal,
        },
        {
            placeholder: `{SN}`,
            string: device.serialNumber,
        },
        {
            placeholder: `{repairNumber}`,
            string: device.repairNumber.toString(),
        },
        {
            placeholder: `{organizationName}`,
            string: device.organizationName,
        },
        {
            placeholder: `{organizationCity}`,
            string: device.organizationCity,
        },
        {
            placeholder: `{contractNumber}`,
            string: device.contractNumber,
        },
        {
            placeholder: `{contractDate}`,
            string: device.contractsDate,
        }
    );

    const getRepairBlocksIDsSQL = `SELECT 
	repair_blocks.id AS "repairBlockID",
	repair_blocks.serial_number AS "serialNumber",
	blocks.decimal
    FROM repair_blocks
	JOIN blocks ON blocks.id = repair_blocks.block_id
    WHERE repair_blocks.repair_device_id = ?`;

    interface repairBlock {
        repairBlockID: number;
        serialNumber: string;
        decimal: string;
        defects?: defect[];
    }

    interface defect {
        defectID: number;
        actions?: action[];
    }

    const getDefectsIDsSQL = `SELECT defects_in_repair.defect_id AS "defectID"
    FROM defects_in_repair
    WHERE defects_in_repair.repair_blocks_id = ?`;

    const getActionsSQL = `SELECT id, "action", "index"
	FROM actions
	WHERE actions.defect_id = ?`;

    const getMaterialsSQL = `SELECT materials_in_actions.material_id AS "materialID",
        materials.name,
        materials_in_actions."count",
        materials.unit
        FROM materials_in_actions
        JOIN materials ON materials.id = materials_in_actions.material_id
        WHERE materials_in_actions.action_id = ?`;

    const rawRepairBlocks = await dbAll<repairBlock[]>(getRepairBlocksIDsSQL, [
        repairDeviceID,
    ]);

    for (let Block of rawRepairBlocks) {
        Block.defects = await dbAll<{ defectID: number }[]>(getDefectsIDsSQL, [
            Block.repairBlockID,
        ]);
        for (let Defect of Block.defects) {
            Defect.actions = await dbAll<action[]>(getActionsSQL, [
                Defect.defectID,
            ]);
            for (let Action of Defect.actions) {
                Action.materials = await dbAll<material[]>(getMaterialsSQL, [
                    Action.id,
                ]);
            }
        }
    }

    interface IduplicatedBlocks {
        [K: string]: repairBlock[];
    }

    let uniqueBlocks: repairBlock[] = [];
    let dublicatedBlocks: IduplicatedBlocks = {};
    rawRepairBlocks.forEach((Block) => {
        // Считаем количество таких же блоков
        const blocksCount = rawRepairBlocks.reduce(
            (count: number, block: repairBlock) => {
                if (Block.decimal === block.decimal) count++;
                return count;
            },
            0
        );
        if (blocksCount === 1) {
            uniqueBlocks.push(Block);
        } else {
            if (!dublicatedBlocks.hasOwnProperty(Block.decimal))
                dublicatedBlocks[Block.decimal] = [];
            dublicatedBlocks[Block.decimal].push(Block);
        }
    });

    // Поправляем индексы дублированых блоков И выводи серийные номера для подстановки
    for (let doubleDecimal in dublicatedBlocks) {
        const blocksArray = dublicatedBlocks[doubleDecimal];
        let basicIndex: string | undefined = undefined;
        blocksArray.forEach((Block, blockNum) => {
            serialNumbersReplacers.push({
                placeholder: `{${Block.decimal}#${blockNum + 1}}`,
                string: Block.serialNumber,
            });
            Block.defects?.forEach((Defect) => {
                Defect.actions?.forEach((Action) => {
                    if (!basicIndex) {
                        basicIndex = Action.index.replace('-', '').slice(0, 2);
                    } else {
                        const isMinus = Action.index.includes('-');
                        if (isMinus)
                            Action.index = Action.index.replace('-', '');
                        const newIndex = (blockNum + +basicIndex)
                            .toString()
                            .padStart(2, '0');
                        Action.index = `${
                            isMinus ? '-' : ''
                        }${newIndex}${Action.index.slice(2)}`;
                    }
                });
            });
        });
    }

    // Выводим серийные номера недублированых блоков
    for (let Block of uniqueBlocks) {
        serialNumbersReplacers.push({
            placeholder: `{${Block.decimal}}`,
            string: Block.serialNumber,
        });
    }

    let repairBlocks: repairBlock[] = [];
    for (let doubleDecimal in dublicatedBlocks) {
        const blocksArray = dublicatedBlocks[doubleDecimal];
        repairBlocks.push(...blocksArray);
    }
    repairBlocks.push(...uniqueBlocks);

    let actions: action[] = [];
    for (let Block of repairBlocks) {
        if (!Block.defects || Block.defects.length === 0) continue;
        for (let Defect of Block.defects) {
            if (!Defect.actions || Defect.actions.length === 0) continue;
            actions.push(...Defect.actions);
        }
    }

    // Ищем "минуса" в индексе и удаляем все которые начинаются с такого же индекса
    const indexesToDelete = new Set(
        actions
            .filter((Action) => Action.index.startsWith('-'))
            .map((Action) => Action.index.slice(1))
    );
    actions = actions
        .filter((Action) => {
            const { index } = Action;
            for (let ind of indexesToDelete) {
                if (index.startsWith(ind)) return false;
            }
            return true;
        })
        .map((Action) => {
            Action.index = Action.index.replace('-', '');
            return Action;
        })
        .sort((a, b) => compareText(a.index, b.index));

    let dublicatedIndexes: number[] = [];
    actions.forEach((Action, index) => {
        if (index === 0) return;
        if (
            Action.index === actions[index - 1].index &&
            Action.action === actions[index - 1].action
        ) {
            dublicatedIndexes.push(index);
        }
    });

    actions = actions.filter((_, index) => !dublicatedIndexes.includes(index));
    writeFileSync(
        path.resolve(__dirname, 'tt.txt'),
        JSON.stringify(actions, null, 2)
    );

    if (device.divided) {
        actions.forEach((Action, index) => {
            const actNum = Action.index.slice(0, 2);
            replacers.push(
                {
                    placeholder: `{actNums}${(index + 1)
                        .toString()
                        .padStart(2, '0')}`,
                    string: `{toMerge${actNum}}`,
                },
                {
                    placeholder: `{actions}${(index + 1)
                        .toString()
                        .padStart(2, '0')}`,
                    string: Action.action,
                }
            );
        });
    } else {
        let arrTextActions: string[][] = [];
        actions.forEach((Action) => {
            const actNum = +Action.index.slice(0, 2) - 1;
            if (!arrTextActions[actNum]) arrTextActions[actNum] = [];
            arrTextActions[actNum].push(Action.action);
        });
        let textActions: string[] = arrTextActions.map((Arr) => Arr.join(' '));
        textActions.forEach((Action, index) => {
            replacers.push(
                {
                    placeholder: `{actions}${(index + 1)
                        .toString()
                        .padStart(2, '0')}`,
                    string: Action,
                },
                {
                    placeholder: `{actNums}${(index + 1)
                        .toString()
                        .padStart(2, '0')}`,
                    string: (index + 1).toString(),
                }
            );
        });
    }

    let materialsRaw: material[] = [];
    actions.forEach((Action) => {
        if (!Action.materials || Action.materials.length === 0) return;
        materialsRaw.push(...Action.materials);
    });
    let materials: material[] = [];
    materialsRaw.forEach((Material) => {
        const findedIndex = materials.findIndex(
            (Mat) => Mat.name === Material.name
        );
        if (findedIndex === -1) {
            materials.push(Material);
        } else {
            materials[findedIndex].count += Material.count;
        }
    });

    materials.forEach((Material, index) => {
        replacers.push(
            {
                placeholder: `{PKI_name}${index.toString().padStart(2, '0')}`,
                string: Material.name,
            },
            {
                placeholder: `{PKI_unit}${index.toString().padStart(2, '0')}`,
                string: Material.unit,
            },
            {
                placeholder: `{PKI_count}${index.toString().padStart(2, '0')}`,
                string: Material.count.toString(),
            }
        );
    });

    const { blanksFolerPath, documentsFolderPath } = settings;
    const blankPath = path.join(
        blanksFolerPath,
        device.contractID.toString(),
        `${device.deviceID}_actionBlank.xlsx`
    );

    const contarctDocsPath = path.resolve(
        documentsFolderPath,
        device.contractID.toString()
    );

    const actionListsPath = path.resolve(
        contarctDocsPath,
        'Перечни выполненых работ'
    );

    const outPath = path.join(
        actionListsPath,
        `${device.deviceName} - №${device.repairNumber} ${device.serialNumber}.xlsx`
    );
    if (!folderExists(documentsFolderPath)) mkdirSync(documentsFolderPath);
    if (!folderExists(contarctDocsPath)) mkdirSync(contarctDocsPath);
    if (!folderExists(actionListsPath)) mkdirSync(actionListsPath);

    let result: createDocStatus = {
        isSuccess: false,
    };

    await new Promise((resolve, reject) => {
        XlsxPopulate.fromFileAsync(blankPath).then((doc) => {
            const sheet = doc.sheet(0);
            replacers.forEach((Replacer) => {
                const { placeholder, string } = Replacer;
                sheet.find(placeholder, () => string);
            });

            if (device.divided) {
                for (let i = 1; i <= 99; i++) {
                    const placeholder = `{toMerge${i
                        .toString()
                        .padStart(2, '0')}}`;
                    const cellsToMerge = sheet.find(placeholder);
                    if (cellsToMerge.length === 0) continue;
                    if (cellsToMerge.length === 1) {
                        sheet.find(placeholder, () => i.toString());
                    }
                    const column = cellsToMerge[0].columnNumber();
                    const upperBorder = Math.max(
                        ...cellsToMerge.map((cell) => cell.rowNumber())
                    );
                    const downerBorder = Math.min(
                        ...cellsToMerge.map((cell) => cell.rowNumber())
                    );
                    const rangeToMerge = sheet.range(
                        downerBorder,
                        column,
                        upperBorder,
                        column
                    );
                    rangeToMerge.merged(true);
                    sheet.find(placeholder, () => i.toString());
                }
            }

            sheet.find('{actions}').forEach((cell) => {
                cell.row().hidden(true);
            });
            sheet.find('{PKI_name}').forEach((cell) => {
                cell.row().hidden(true);
            });

            serialNumbersReplacers.forEach((Replacer) => {
                const { placeholder, string } = Replacer;
                sheet.find(placeholder, () => string);
            });

            try {
                if (!folderExists(documentsFolderPath))
                    mkdirSync(documentsFolderPath);
                if (!folderExists(contarctDocsPath))
                    mkdirSync(contarctDocsPath);
                if (!folderExists(actionListsPath)) mkdirSync(actionListsPath);
            } catch (error) {
                result = {
                    isSuccess: false,
                    error: error,
                    message: 'Ошибка при обработке пути к документу',
                };
                resolve(true);
            }

            doc.toFileAsync(outPath)
                .then(() => {
                    result = {
                        isSuccess: true,
                    };
                    resolve(true);
                })
                .catch((error) => {
                    result = {
                        isSuccess: false,
                        error: error,
                        message: 'Произошла ошибка при создании документа',
                    };
                    resolve(true);
                });
        });
    });

    return result;
}
