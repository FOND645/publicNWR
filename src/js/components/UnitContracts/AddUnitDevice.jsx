import { AutoComplete, Button, Form, Input, Select, Space } from "antd";
import { isEqual } from "lodash";
import React from "react";
import { HORIZONTAL } from "../../constants";
import { useSelector } from "react-redux";
import { store } from "../../storage/reducer";
import { useState } from "react";
import { getRandomKey } from "../../classes";

function Component(props) {
    const { deviceKey } = props;

    const [addUnitDeviceForm] = Form.useForm();

    const devicesSelectItems = useSelector(
        (state) => {
            const { devicesBase } = state;
            const devicesSelectItems = devicesBase.map((device) => {
                return { label: device.name, value: device.key };
            });
            return devicesSelectItems;
        },
        (oldSelect, newSelect) => isEqual(oldSelect, newSelect)
    );

    const { unitContracts } = store.getState();
    const organizationNames = Array.from(new Set(unitContracts.map((device) => device.organizationName)));
    const organizationCities = Array.from(new Set(unitContracts.map((device) => device.organizationCity)));
    const orgNamesOptions = organizationNames.map((name) => {
        return { label: name, value: name, key: getRandomKey() };
    });
    const orgCitiesOptions = organizationCities.map((city) => {
        return { label: city, value: city, key: getRandomKey() };
    });

    const [searchedCities, setSearchedCities] = useState();
    const [searchedOrg, setSearchedOrg] = useState();

    function searchCity(text) {
        setSearchedCities(orgCitiesOptions.filter((city) => city.label.toLowerCase(text.toLowerCase())));
    }

    function searchOrg(text) {
        setSearchedOrg(orgNamesOptions.filter((organization) => organization.label.toLowerCase(text.toLowerCase())));
    }

    return (
        <Form form={addUnitDeviceForm} style={{ width: "100%" }}>
            <Space.Compact direction={HORIZONTAL} style={{ width: "100%", display: "flex" }}>
                <Form.Item name={"deviceKey"} style={{ flexGrow: 1 }}>
                    <Select options={devicesSelectItems} placeholder={"Укажите устройство"} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name={"serialNumber"} style={{ width: "8rem", flexGrow: 0 }}>
                    <Input placeholder={"Зав. №"} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name={"organizationName"} style={{ flexGrow: 1 }}>
                    <AutoComplete options={searchedOrg} onSearch={searchCity} placeholder={"Заказчик"} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name={"organizationCity"} style={{ width: "12rem", flexGrow: 0 }}>
                    <AutoComplete options={searchedCities} onSearch={searchOrg} placeholder={"гор."} style={{ width: "100%" }} />
                </Form.Item>
                <Button style={{ flexGrow: 0 }}>Добавить устройство</Button>
            </Space.Compact>
        </Form>
    );
}

export const AddUnitDevice = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps));
