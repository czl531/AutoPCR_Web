import {
    Table,
} from '@chakra-ui/react';
import { MemoryItem } from './MemoryUtils';

interface MemoryTableProps {
    data: { 
        items: MemoryItem[]; 
        accountNames: string[] 
    };
}

export function MemoryTable({ data }: MemoryTableProps) {
    return (
        <Table.ScrollArea rounded={'lg'} boxShadow={'lg'}>
            <Table.Root size="sm" width="100%">
                <Table.Header>
                    <Table.Row>
                        <Table.Cell width="10%">角色名</Table.Cell>
                        {data.accountNames.map((accountName, index) => (
                            <Table.Cell key={index} width={`${80 / data.accountNames.length}%`}>
                                {accountName || ''}
                            </Table.Cell>
                        ))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.items.map((item, index) => (
                        <Table.Row key={index}>
                            <Table.Cell width="10%">{item.characterName}</Table.Cell>
                            {item.accounts.map((account, accIndex) => (
                                <Table.Cell 
                                    key={accIndex} 
                                    color={account.isDeficit ? 'red.500' : 'green.500'} 
                                    width={`${80 / data.accountNames.length}%`}
                                >
                                    {account.status}
                                </Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Table.ScrollArea>
    );
}