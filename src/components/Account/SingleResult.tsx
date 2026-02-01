import { useEffect, useState } from 'react';

import { AxiosError } from 'axios';
import { Fetch } from '@api/APIUtils';
import { ModuleResult as ModuleResultInterface } from '@/interfaces/ModuleResult';
import { Table, HStack } from '@chakra-ui/react';
import { useColorModeValue } from "@/components/ui/color-mode"
import { MemoryTable } from './MemoryTable';
import { parseMemoryTable } from './MemoryUtils';
import { BoxDataTable } from './BoxDataTable';
import { BoxExcelExport } from './BoxExcelExport';
import { TalentDataTable } from './TalentDataTable';
import { TableResultWrapper } from './TableResultWrapper';
import { toaster } from '../../components/ui/toaster';

interface SingleResultProps {
    resultData: ModuleResultInterface | null;
}

export function SingleResult({ url }: { url: string }) {
    const [resultData, setResultData] = useState<ModuleResultInterface | null>(null);
    useEffect(() => {
        Fetch.get<ModuleResultInterface>(url)
            .then((response) => {
                setResultData(response.data);
            })
            .catch((error: AxiosError) => {
                toaster.create({ type: 'error', title: '获取日常结果失败', description: (error.response?.data as string) || '网络错误' });
            });
    }, [url]);
    return <SingleResultTable resultData={resultData} />;
}

function SingleResultTable({ resultData }: SingleResultProps) {
    // 检查是否为需要表格显示的模块
    const tableModules = ['获取纯净碎片缺口', '获取记忆碎片缺口'];
    // 检查是否为需要显示Excel导出按钮的模块
    const excelModules = ['导出box练度excel'];
    // 检查是否为需要显示角色练度表格的模块
    const boxDataModules = ['查box（多选）'];
    const talentDataModules = ['查属性练度'];

    const isTableModule = resultData?.name ? tableModules.includes(resultData.name) : false;
    const isExcelModule = resultData?.name ? excelModules.includes(resultData.name) : false;
    const isBoxDataModule = resultData?.name ? boxDataModules.includes(resultData.name) : false;
    const isTalentDataModules = resultData?.name ? talentDataModules.includes(resultData.name) : false;

    const tableData = isTableModule && resultData?.log ? parseMemoryTable(resultData.log) : { items: [], accountNames: [] };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const haveTable = resultData?.table?.data?.length ?? 0 > 0 ? true : false;
    return (
        <>
            <Table.ScrollArea rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'lg'} mb={isTableModule || isBoxDataModule ? 4 : 0}>
                <Table.Root size="sm" striped colorPalette="teal" width="100%">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>名字</Table.ColumnHeader>
                            <Table.ColumnHeader>{resultData?.name}</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>配置</Table.Cell>
                            <Table.Cell style={{ whiteSpace: 'pre-wrap' }}>{resultData?.config}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>状态</Table.Cell>
                            <Table.Cell>{resultData?.status}</Table.Cell>
                        </Table.Row>
                        {haveTable && resultData?.table && <Table.Row>
                            <Table.Cell>表格</Table.Cell>
                            <Table.Cell>
                                <TableResultWrapper {...resultData.table} />
                            </Table.Cell>
                            </Table.Row>}
                        {!isTableModule && !isBoxDataModule && !isTalentDataModules && (
                        <Table.Row>
                            <Table.Cell>结果</Table.Cell>
                            <Table.Cell style={{ whiteSpace: 'pre-wrap' }}>
                                    {isExcelModule && (
                                        <HStack padding={4} mb={2}>
                                            <BoxExcelExport logContent={resultData?.log} fileName="box_data" />
                                        </HStack>
                                    )}
                                    {resultData?.log?.replace(/BOX_EXCEL_DATA: {.*}/g, '')}
                            </Table.Cell>
                        </Table.Row>
                        )}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>
            {isTableModule && tableData.items.length > 0 && <MemoryTable data={tableData} />}
            {isBoxDataModule && <BoxDataTable logContent={resultData?.log} />}
            {isTalentDataModules && <TalentDataTable logContent={resultData?.log} />}
        </>
    )
}
