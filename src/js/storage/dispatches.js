export const dispatchers = (dispatch) => {
    return {
        // Диспатчи к настройкм
        setDataBasePath: (path) => dispatch({ type: "SET_DATA_BASE_PATH", path }),
        setDocumentsBasePath: (path) => dispatch({ type: "SET_DOCUMENTS_BASE_PATH", path }),

        // Диспатчи к контрактам
        removeContract: (contractKey) => dispatch({ type: "REMOVE_CONTRACT", contractKey }),
        addContract: (organizationName, contractDate, contractNumber) =>
            dispatch({ type: "ADD_CONTRACT", organizationName, contractDate, contractNumber }),
        editContract: (contractKey, newContractData) => dispatch({ type: "EDIT_CONTRACT", contractKey, newContractData }),
        addRepairDevice: (contractKey, repairDeviceKey, serialNumber, repairNumber) =>
            dispatch({ type: "ADD_REPAIR_DEVICE", contractKey, repairDeviceKey, serialNumber, repairNumber }),
        setDivider: (contractKey, repairDeviceKey, divided) => dispatch({ type: "SET_DIVIDER", contractKey, repairDeviceKey, divided }),
        editRepairDevice: (contractKey, repairDeviceKey, newDeviceData) =>
            dispatch({ type: "EDIT_REPAIR_DEVICE", contractKey, repairDeviceKey, newDeviceData }),
        removeRepairDevice: (contractKey, repairDeviceKey) => dispatch({ type: "REMOVE_REPAIR_DEVICE", contractKey, repairDeviceKey }),
        addRepairNote: (contractKey, repairDeviceKey, text) => dispatch({ type: "ADD_REPAIR_NOTE", contractKey, repairDeviceKey, text }),
        editRepairNote: (contractKey, repairDeviceKey, noteKey, text) =>
            dispatch({ type: "EDIT_REPAIR_NOTE", contractKey, repairDeviceKey, noteKey, text }),
        removeRepairNote: (contractKey, repairDeviceKey, noteKey) => dispatch({ type: "REMOVE_REPAIR_NOTE", contractKey, repairDeviceKey, noteKey }),
        addRepairSubDevice: (contractKey, repairDeviceKey, repairSubDeviceKey, serialNumber, count) =>
            dispatch({ type: "ADD_REPAIR_SUBDEVICE", contractKey, repairDeviceKey, repairSubDeviceKey, serialNumber, count }),
        editRepairSubDevice: (contractKey, repairDeviceKey, repairSubDeviceKey, serialNumber, count) =>
            dispatch({ type: "EDIT_REPAIR_SUBDEVICE", contractKey, repairDeviceKey, repairSubDeviceKey, serialNumber, count }),
        removeRepairSubDevice: (contractKey, repairDeviceKey, repairSubDeviceKey) =>
            dispatch({ type: "REMOVE_REPAIR_SUBDEVICE", contractKey, repairDeviceKey, repairSubDeviceKey }),
        addRepairDefect: (contractKey, repairDeviceKey, repairSubDeviceKey, defectKey) =>
            dispatch({ type: "ADD_REPAIR_DEFECT", contractKey, repairDeviceKey, repairSubDeviceKey, defectKey }),
        removeRepairDefect: (contractKey, repairDeviceKey, repairSubDeviceKey, defectKey) =>
            dispatch({ type: "REMOVE_REPAIR_DEFECT", contractKey, repairDeviceKey, repairSubDeviceKey, defectKey }),

        // Диспатчи к БД устройств
        addDevice: (name, decimal) => dispatch({ type: "ADD_DEVICE", name, decimal }),
        removeDevice: (deviceKey) => dispatch({ type: "REMOVE_DEVICE", deviceKey }),
        editDevice: (deviceKey, newDeviceData) => dispatch({ type: "EDIT_DEVICE", deviceKey, newDeviceData }),
        addSubDevice: (deviceKey, name, decimal) => dispatch({ type: "ADD_SUBDEVICE", deviceKey, name, decimal }),
        removeSubDevice: (deviceKey, subDeviceKey) => dispatch({ type: "REMOVE_SUBDEVICE", deviceKey, subDeviceKey }),
        editSubDevice: (deviceKey, subDeviceKey, newSubDeviceData) => dispatch({ type: "EDIT_SUBDEVICE", deviceKey, subDeviceKey, newSubDeviceData }),

        // Диспачти к БД неисправностей
        addDefect: (deviceKey, solution, description, defect) => dispatch({ type: "ADD_DEFECT", deviceKey, solution, description, defect }),
        removeDefect: (defectKey) => dispatch({ type: "REMOVE_DEFECT", defectKey }),
        editDefect: (defectKey, newDefectData) => dispatch({ type: "EDIT_DEFECT", defectKey, newDefectData }),
        addDefectAction: (defectKey, index, action) => dispatch({ type: "ADD_DEFECT_ACTION", defectKey, index, action }),
        addExistDefectAction: (defectKey, actionLink) => dispatch({ type: "ADD_EXISTED_ACTION", defectKey, actionLink }),
        removeDefectAction: (defectKey, actionKey) => dispatch({ type: "REMOVE_DEFECT_ACTION", defectKey, actionKey }),
        editDefectAction: (defectKey, actionKey, newActionData) => dispatch({ type: "EDIT_DEFECT_ACTION", defectKey, actionKey, newActionData }),
        addDefectMaterial: (defectKey, actionKey, materialKey) => dispatch({ type: "ADD_DEFECT_MATERIAL", defectKey, actionKey, materialKey }),
        removeDefectMaterial: (defectKey, actionKey, materialKey) => dispatch({ type: "REMOVE_DEFECT_MATERIL", defectKey, actionKey, materialKey }),
        editDefectMaterial: (defectKey, actionKey, materialKey, count) =>
            dispatch({ type: "EDIT_DEFECT_MATERIAL", defectKey, actionKey, materialKey, count }),

        // Диспатчи к БД материалов
        addMaterial: (name, unit) => dispatch({ type: "ADD_MATERIAL", name, unit }),
        editMaterial: (matKey, name, unit) => dispatch({ type: "EDIT_MATERIAL", matKey, name, unit }),
        removeMaterial: (matKey) => dispatch({ type: "REMOVE_MATERIAL", matKey }),
    };
};
