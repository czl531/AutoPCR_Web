import { useEffect, useState } from 'react';

import { AxiosError } from 'axios';
import { Fetch } from '@api/APIUtils';
import { ModuleResult as ModuleResultInterface } from '@/interfaces/ModuleResult';
import { Table } from '@chakra-ui/react';
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const haveTable = resultData?.table?.data?.length ?? 0 > 0 ? true : false;
    return (
        <>
            <Table.ScrollArea rounded={'lg'} bg="bg.panel" boxShadow={'lg'} mb={haveTable ? 4 : 0}>
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
                        <Table.Row>
                            <Table.Cell>结果</Table.Cell>
                            <Table.Cell style={{ whiteSpace: 'pre-wrap' }}>
                                {resultData?.log}
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>
        </>
    );
}
