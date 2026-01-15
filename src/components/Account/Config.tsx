import { Box, Button, Checkbox as ChakraCheckbox, Input, NativeSelect, Stack, Text, Textarea } from '@chakra-ui/react'
import { ChangeEventHandler, FocusEventHandler, useState } from 'react';
import { ConfigInfo, ConfigValue } from '@/interfaces/Module';
import { NumberInput, NumberInputField } from '../../components/ui/number-input';

import { AxiosError } from 'axios';
import { Checkbox } from '../../components/ui/checkbox';
import { InputGroup } from '../../components/ui/input-group';
import NiceModal from '@ebay/nice-modal-react';
import { Switch } from '../../components/ui/switch';
import multiSelectModal from './MultiSelectModal';
import { putAccountConfig } from '@/api/Account';
import { toaster } from '../../components/ui/toaster';

interface ConfigProps {
    alias: string,
    value: ConfigValue,
    info: ConfigInfo
}

// 在现有的Config组件中添加表格类型的处理
export default function Config({ alias, value, info }: ConfigProps) {
    switch (info?.config_type) {
        case 'bool':
            return <ConfigBool alias={alias} value={value} info={info} />
        case 'int':
            return <ConfigInt alias={alias} value={value} info={info} />
        case 'single':
            return <ConfigSingle alias={alias} value={value} info={info} />
        case 'multi':
            return <ConfigMulti alias={alias} value={value} info={info} />
        case 'time':
            return <ConfigTime alias={alias} value={value} info={info} />
        case 'text':
            return <ConfigText alias={alias} value={value} info={info} />
        case 'multi_search':
            return <ConfigMultiSearch alias={alias} value={value} info={info} />
    }
}

function ConfigBool({ alias, value, info }: ConfigProps) {
    const onCheckedChange = (details: { checked: boolean }) => {
        putAccountConfig(alias, info.key, details.checked).then((res) => {
            toaster.create({ type: 'success', title: '保存成功', description: res });
        }).catch((err: AxiosError) => {
            toaster.create({ type: 'error', title: '保存失败', description: err.response?.data as string || "网络错误" });
        });
    }

    return (
        <InputGroup startElement={info.desc} endElement={
            <Switch id={info.key} defaultChecked={value as boolean} onCheckedChange={onCheckedChange} />
        }>
        </InputGroup>
    )
}

function ConfigInt({ alias, value, info }: ConfigProps) {
    const onChange = (_: string, valueAsNumber: number) => {
        putAccountConfig(alias, info.key, valueAsNumber).then((res) => {
            toaster.create({ type: 'success', title: '保存成功', description: res });
        }).catch((err: AxiosError) => {
            toaster.create({ type: 'error', title: '保存失败', description: err.response?.data as string || "网络错误" });
        });
    }

    // NumberInput deprecated onChange signature: (valueAsString, valueAsNumber).
    // V3 NumberInput snippet might not support onValueChange with number?
    // Chakra V3 NumberInput.Root has onValueChange: (details: { value: string; valueAsNumber: number }) => void.
    // My snippet uses ChakraNumberInput.Root.
    // So onValueChange={(e) => onChange(e.value, e.valueAsNumber)}
    
    return (
        <InputGroup startElement={info.desc}>
            <NumberInput onValueChange={(e) => onChange(e.value, e.valueAsNumber)} id={info.key} defaultValue={String(value)} min={Math.min(...info.candidates.map(c => c.value) as number[])} max={Math.max(...info.candidates.map(c => c.value) as number[])}>
                <NumberInputField />
            </NumberInput>
        </InputGroup>
    )
}

function ConfigSingle({ alias, value, info }: ConfigProps) {
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let value: ConfigValue = e.target.value;
        const intValue = Number(value);
        if (!isNaN(intValue))
            value = intValue;
        putAccountConfig(alias, info.key, value).then((res) => {
            toaster.create({ type: 'success', title: '保存成功', description: res });
        }).catch((err: AxiosError) => {
            toaster.create({ type: 'error', title: '保存失败', description: err.response?.data as string || "网络错误" });
        });
    }

    return (
        <InputGroup startElement={info.desc}>
            <NativeSelect.Root>
            <NativeSelect.Field onChange={onChange} id={info.key} defaultValue={value as string | number}>
                {
                    info.candidates.map((element) => {
                        return <option key={element.value as string | number} value={element.value as string | number} >{element.display}</option>
                    })
                }
            </NativeSelect.Field>
            </NativeSelect.Root>
        </InputGroup>
    )
}

function ConfigMulti({ alias, value, info }: ConfigProps) {
    const onChange = (value: (string | number)[]) => {
        let postValue = value;
        const intValue = postValue.map(option => Number(option))
        if (intValue.length != 0 && !isNaN(intValue[0]))
            postValue = intValue;

        putAccountConfig(alias, info.key, postValue as ConfigValue).then((res) => {
            toaster.create({ type: 'success', title: '保存成功', description: res });
        }).catch((err: AxiosError) => {
            toaster.create({ type: 'error', title: '保存失败', description: err.response?.data as string || "网络错误" });
        });
    }
    // CheckboxGroup onChange expects (value: string[]). My code expects (string | number)[]. 
    // V3 Checkbox.Group onValueChange: (details: { value: string[] }) => void.
    // So I need to adapt.
    
    return (
        <InputGroup startElement={info.desc}>
            <Box paddingLeft="16px" paddingRight="32px" overflowY="scroll" borderWidth="1px" borderColor="border.subtle" borderRadius="md" w="full">
                <ChakraCheckbox.Group onValueChange={(e) => onChange(e)} defaultValue={(value as (string | number)[]).map(option => String(option))} >
                    <Stack gap={[1, 5]} direction={['column', 'row']}>
                        {
                            info.candidates.map((element) => {
                                return <Checkbox key={element.value as string | number} value={String(element.value)} >{element.display}</Checkbox>
                            })
                        }
                    </Stack>
                </ChakraCheckbox.Group>
            </Box>
        </InputGroup >
    )
}

function ConfigTime({ alias, value, info }: ConfigProps) {
    const onBlur: ChangeEventHandler<HTMLInputElement> = (e: React.ChangeEvent<HTMLInputElement>) => {
        putAccountConfig(alias, info.key, e.target.value as ConfigValue).then((res) => {
            toaster.create({ type: 'success', title: '保存成功', description: res });
        }).catch((err: AxiosError) => {
            toaster.create({ type: 'error', title: '保存失败', description: err.response?.data as string || "网络错误" });
        });
    }

    return (
        <InputGroup startElement={info.desc}>
            <Input type='time' onBlur={onBlur} id={info.key} defaultValue={value as string} />
        </InputGroup>
    )
}

function ConfigText({ alias, value, info }: ConfigProps) {
    const onBlur: FocusEventHandler<HTMLTextAreaElement> = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        putAccountConfig(alias, info.key, e.target.value as ConfigValue).then((res) => {
            toaster.create({ type: 'success', title: '保存成功', description: res });
        }).catch((err: AxiosError) => {
            toaster.create({ type: 'error', title: '保存失败', description: err.response?.data as string || "网络错误" });
        });
    }
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto'; // 重置高度
        e.target.style.height = `${e.target.scrollHeight}px`; // 根据内容设置高度
    };    
    return (
        <>
            <Text>{info.desc}</Text>
            <Textarea onBlur={onBlur} id={info.key} defaultValue={value as string} onInput={handleInput} />
        </>
    );
}

function ConfigMultiSearch({ alias, value, info }: ConfigProps) {
    const [localValue, setLocalValue] = useState<ConfigValue>(value);

    const displayValue = ((localValue || []) as number[]).map((id) => {
        const unit = info.candidates.find((unit) => unit.value === id);
        return unit ? (unit.nickname ? unit.nickname : unit.display) : String(id);
    });

    const handleClick = async (e: React.MouseEvent): Promise<void> => {
        e.stopPropagation();
        
        try {
            const ret: ConfigValue = await NiceModal.show(multiSelectModal, {
                candidates: info.candidates,
                value: localValue as ConfigValue[],
            }) as ConfigValue;
            if (ret === undefined) return;
            
            const res: string = await putAccountConfig(alias, info.key, ret);
            setLocalValue(ret);
            toaster.create({ type: "success", title: "保存成功", description: res });
            await NiceModal.hide(multiSelectModal);
        } catch (err) {
            const axiosErr = err as AxiosError;
            toaster.create({ type: "error", title: "保存失败", description: axiosErr.response?.data as string || "网络错误" });
        }
    };

    return (
        <InputGroup startElement={info.desc} endElement={
            <Button size="sm" onClick={handleClick}>选择</Button>
        }>
            <Input value={displayValue.join(', ')} readOnly onClick={handleClick} cursor="pointer" />
        </InputGroup>
    );
}
