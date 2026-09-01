import type { ReactNode } from 'react';
import { HStack } from '@chakra-ui/react';

import type { ModuleResult as ModuleResultInterface } from '@/interfaces/ModuleResult';
import { BoxDataTable } from './BoxDataTable';
import { BoxExcelExport } from './BoxExcelExport';
import { ItemInventoryTable } from './ItemInventoryTable';
import { MemoryTable } from './MemoryTable';
import { parseMemoryTable } from './MemoryUtils';
import { RoleDataTable } from './RoleDataTable';
import { TalentDataTable } from './TalentDataTable';

interface SingleResultRendererContext {
    moduleKey?: string;
}

export interface SingleResultRenderer {
    keys?: string[];
    names?: string[];
    hideDefaultLog?: boolean;
    summaryMarginBottom?: boolean;
    renderLogActions?: (resultData: ModuleResultInterface, context: SingleResultRendererContext) => ReactNode;
    getLogContent?: (resultData: ModuleResultInterface, context: SingleResultRendererContext) => string | undefined;
    renderResult?: (resultData: ModuleResultInterface, context: SingleResultRendererContext) => ReactNode;
}

const renderers: SingleResultRenderer[] = [
    {
        keys: ['get_need_pure_memory', 'get_need_memory'],
        names: ['获取纯净碎片缺口', '获取记忆碎片缺口'],
        hideDefaultLog: true,
        summaryMarginBottom: true,
        renderResult: (resultData) => {
            const tableData = parseMemoryTable(resultData.log);
            return tableData.items.length > 0 ? <MemoryTable data={tableData} /> : null;
        },
    },
    {
        keys: ['get_box_table'],
        names: ['查box（多选）'],
        hideDefaultLog: true,
        summaryMarginBottom: true,
        renderResult: (resultData) => <BoxDataTable logContent={resultData.log} />,
    },
    {
        keys: ['get_talent_info'],
        names: ['查属性练度'],
        hideDefaultLog: true,
        summaryMarginBottom: true,
        renderResult: (resultData) => <TalentDataTable logContent={resultData.log} />,
    },
    {
        keys: ['get_role_info'],
        names: ['查职能练度'],
        hideDefaultLog: true,
        summaryMarginBottom: true,
        renderResult: (resultData) => <RoleDataTable logContent={resultData.log} />,
    },
    {
        keys: ['get_item_inventory'],
        names: ['查道具库存'],
        hideDefaultLog: true,
        summaryMarginBottom: true,
        renderResult: (resultData) => <ItemInventoryTable logContent={resultData.log} />,
    },
    {
        keys: ['get_box_excel'],
        names: ['导出box练度excel'],
        renderLogActions: (resultData) => (
            <HStack padding={4} mb={2}>
                <BoxExcelExport logContent={resultData.log} fileName="box_data" />
            </HStack>
        ),
        getLogContent: (resultData) => resultData.log?.replace(/BOX_EXCEL_DATA: {.*}/g, ''),
    },
];

export function getModuleKeyFromResultUrl(url: string) {
    const match = url.match(/\/single_result\/([^/?#]+)/);
    return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export function getSingleResultRenderer(resultData: ModuleResultInterface, moduleKey?: string) {
    const keys = [moduleKey, resultData.key, resultData.module, resultData.module_key]
        .filter((key): key is string => Boolean(key))
        .map((key) => key.toLowerCase());

    return renderers.find((renderer) => {
        const keyMatched = renderer.keys?.some((key) => keys.includes(key.toLowerCase())) ?? false;
        const nameMatched = renderer.names?.includes(resultData.name) ?? false;
        return keyMatched || nameMatched;
    });
}
