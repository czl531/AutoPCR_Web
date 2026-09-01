import { useEffect, useState } from 'react';

import { AxiosError } from 'axios';
import { Fetch } from '@api/APIUtils';
import { ModuleResult as ModuleResultInterface } from '@/interfaces/ModuleResult';
import { Table } from '@chakra-ui/react';
import { useColorModeValue } from "@/components/ui/color-mode"
import { TableResultWrapper } from './TableResultWrapper';
import { getModuleKeyFromResultUrl, getSingleResultRenderer } from './SingleResultRenderers';
import { toaster } from '../../components/ui/toaster';

interface SingleResultProps {
    resultData: ModuleResultInterface | null;
    moduleKey?: string;
}

export function SingleResult({ url }: { url: string }) {
    const [resultData, setResultData] = useState<ModuleResultInterface | null>(null);
    const moduleKey = getModuleKeyFromResultUrl(url);

    useEffect(() => {
        Fetch.get<ModuleResultInterface>(url)
            .then((response) => {
                setResultData(response.data);
            })
            .catch((error: AxiosError) => {
                toaster.create({ type: 'error', title: '获取日常结果失败', description: (error.response?.data as string) || '网络错误' });
            });
    }, [url]);
    return <SingleResultTable resultData={resultData} moduleKey={moduleKey} />;
}

function SingleResultTable({ resultData, moduleKey }: SingleResultProps) {
    const renderer = resultData ? getSingleResultRenderer(resultData, moduleKey) : undefined;
    const context = { moduleKey };
    const hasTable = (resultData?.table?.data?.length ?? 0) > 0;
    const shouldShowDefaultLog = Boolean(resultData) && !renderer?.hideDefaultLog;
    const logActions = resultData ? renderer?.renderLogActions?.(resultData, context) : null;
    const logContent = resultData ? renderer?.getLogContent?.(resultData, context) ?? resultData.log : undefined;
    const customResult = resultData ? renderer?.renderResult?.(resultData, context) : null;

    return (
        <>
            <Table.ScrollArea rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'lg'} mb={renderer?.summaryMarginBottom ? 4 : 0}>
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
                        {hasTable && resultData?.table && <Table.Row>
                            <Table.Cell>表格</Table.Cell>
                            <Table.Cell>
                                <TableResultWrapper {...resultData.table} />
                            </Table.Cell>
                        </Table.Row>}
                        {shouldShowDefaultLog && (
                            <Table.Row>
                                <Table.Cell>结果</Table.Cell>
                                <Table.Cell style={{ whiteSpace: 'pre-wrap' }}>
                                    {logActions}
                                    {logContent}
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>
            {customResult}
        </>
    )
}
