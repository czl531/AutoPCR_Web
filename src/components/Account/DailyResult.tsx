import { ModuleResult as ModuleResultInterface, ModuleResultResponse } from '@/interfaces/ModuleResult'
import {
    Table,
    TableRowProps,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import { AxiosError } from 'axios'
import { Fetch } from '@api/APIUtils'
import { toaster } from '../../components/ui/toaster'

interface DailyResultProps {
    resultData: ModuleResultResponse | null
}
interface ModuleResultProps extends TableRowProps {
    resultData: ModuleResultInterface
    index: number
}

export function DailyResult({ url }: { url: string }) {
    const [resultData, setResultData] = useState<ModuleResultResponse | null>(null)
    useEffect(() => {
        Fetch.get<ModuleResultResponse>(url).then((response) => {
            setResultData(response.data)
        }).catch((error: AxiosError) => {
            toaster.create({ type: 'error', title: '获取日常结果失败', description: error.response?.data as string || "网络错误" });
        });
    }, [url]);
    return (
        <DailyResultTable resultData={resultData} />
    )
}

function DailyResultTable({ resultData }: DailyResultProps) {
    return (
        <Table.ScrollArea rounded={'lg'} bg="bg.panel" boxShadow={'lg'}>
            <Table.Root size='sm' striped colorPalette='teal'>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>序号</Table.ColumnHeader>
                        <Table.ColumnHeader>名字</Table.ColumnHeader>
                        <Table.ColumnHeader>配置</Table.ColumnHeader>
                        <Table.ColumnHeader>状态</Table.ColumnHeader>
                        <Table.ColumnHeader>结果</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        resultData?.order?.map((module, index) => {
                            return <ModuleResult key={module} index={index} resultData={resultData.result[module]} />
                        })
                    }
                </Table.Body>
            </Table.Root>
        </Table.ScrollArea >

    )
}

function ModuleResult({ resultData, index, ...rest }: ModuleResultProps) {

    return (
        <Table.Row {...rest}>
            <Table.Cell> {index} </Table.Cell>
            <Table.Cell> {resultData.name} </Table.Cell>
            <Table.Cell style={{ whiteSpace: 'pre-wrap' }}>{resultData.config}</Table.Cell>
            <Table.Cell> {resultData.status} </Table.Cell>
            <Table.Cell style={{ whiteSpace: 'pre-wrap' }}>{resultData.log}</Table.Cell>
        </Table.Row>
    )
}
