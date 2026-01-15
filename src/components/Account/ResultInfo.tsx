import { Accordion, Box, Image, Tabs } from '@chakra-ui/react'
import { FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi'

import { ResultInfo as ResultInfoInterface } from '@interfaces/UserInfo'
import { ResultTable } from './ResultTable'

export interface ResultInfoProps {
    resultInfo: ResultInfoInterface[]
}

function ResultDetail({ url }: { url: string }) {
    return (
        <Tabs.Root lazyMount variant='subtle' defaultValue="text">
            <Tabs.List>
                <Tabs.Trigger value="text">文本</Tabs.Trigger>
                <Tabs.Trigger value="image">图片</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="text">
                <ResultTable url={url + "?text=true"} />
            </Tabs.Content>
            <Tabs.Content value="image">
                <Image
                    src={url}
                    width="100%"
                    height="100%"
                />
            </Tabs.Content>
        </Tabs.Root>
    )
}

export function ResultInfo({ resultInfo }: ResultInfoProps) {
    return (
        <Accordion.Root collapsible lazyMount>
            {
                resultInfo.map((info, index) => (
                    <Accordion.Item key={index} value={String(index)}>
                        <Accordion.ItemTrigger>
                            {info.status == "成功" || info.status == '跳过' ? <FiCheckCircle /> : info.status == "警告" || info.status == '中止' ? <FiAlertCircle /> : <FiXCircle />}
                            <Box as='span' flex='1' textAlign='left'>
                                {info.time} {info.alias}
                            </Box>
                            <Accordion.ItemIndicator />
                        </Accordion.ItemTrigger>
                        <Accordion.ItemContent pb={4}>
                            <ResultDetail url={info.url} />
                        </Accordion.ItemContent>
                    </Accordion.Item>
                ))
            }
        </Accordion.Root>
    )
}
