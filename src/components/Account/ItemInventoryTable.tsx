import { Box, Flex, Icon, Table } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { useColorModeValue } from '@/components/ui/color-mode';

interface ItemInventoryItem {
    item_id: number;
    item_name: string;
    count: number;
}

interface UserItemInventoryData {
    user_name: string;
    data_time?: string;
    labyrinth_point?: number;
    items: ItemInventoryItem[];
}

interface ItemInventoryTableProps {
    logContent: string | undefined;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
    itemId: number | null;
    direction: SortDirection;
}

const LABYRINTH_POINT_SORT_ID = -1;

export function ItemInventoryTable({ logContent }: ItemInventoryTableProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        itemId: null,
        direction: null,
    });

    const userData = useMemo(() => {
        if (!logContent) return [];

        const data: UserItemInventoryData[] = [];
        const matches = logContent.matchAll(/ITEM_INVENTORY_DATA_START\s*([\s\S]*?)\s*ITEM_INVENTORY_DATA_END/g);

        for (const match of matches) {
            try {
                const parsed = JSON.parse(match[1]) as Partial<UserItemInventoryData>;
                const normalized: UserItemInventoryData = {
                    user_name: parsed.user_name ?? '',
                    data_time: parsed.data_time,
                    labyrinth_point: parsed.labyrinth_point,
                    items: parsed.items ?? [],
                };
                if (normalized.items.length || normalized.labyrinth_point !== undefined) {
                    data.push(normalized);
                }
            } catch (error) {
                console.error('解析道具库存数据失败:', error);
            }
        }

        return data;
    }, [logContent]);

    const itemColumns = useMemo(() => {
        const itemMap = new Map<number, string>();
        userData.forEach((user) => {
            user.items.forEach((item) => {
                if (!itemMap.has(item.item_id)) {
                    itemMap.set(item.item_id, item.item_name);
                }
            });
        });
        return Array.from(itemMap, ([itemId, itemName]) => ({ itemId, itemName }));
    }, [userData]);

    const hasLabyrinthPoint = useMemo(() => userData.some((user) => user.labyrinth_point !== undefined), [userData]);

    const userItemMaps = useMemo(() => {
        const maps = userData.map((user) => ({
            user,
            itemMap: new Map(user.items.map((item) => [item.item_id, item.count])),
        }));

        if (!sortConfig.itemId || !sortConfig.direction) {
            return maps;
        }

        return [...maps].sort((a, b) => {
            const valueA = sortConfig.itemId === LABYRINTH_POINT_SORT_ID ? a.user.labyrinth_point ?? 0 : a.itemMap.get(sortConfig.itemId!) ?? 0;
            const valueB = sortConfig.itemId === LABYRINTH_POINT_SORT_ID ? b.user.labyrinth_point ?? 0 : b.itemMap.get(sortConfig.itemId!) ?? 0;
            if (valueA === valueB) return 0;
            const sortOrder = sortConfig.direction === 'asc' ? 1 : -1;
            return valueA < valueB ? -1 * sortOrder : sortOrder;
        });
    }, [userData, sortConfig]);

    const bgColor = useColorModeValue('white', 'gray.700');
    const headerBgColor = useColorModeValue('gray.100', 'gray.600');

    const handleSort = (itemId: number) => {
        setSortConfig((prevConfig) => {
            if (prevConfig.itemId === itemId) {
                const nextDirection: SortDirection = prevConfig.direction === 'asc' ? 'desc' : prevConfig.direction === 'desc' ? null : 'asc';
                return {
                    itemId: nextDirection ? itemId : null,
                    direction: nextDirection,
                };
            }

            return {
                itemId,
                direction: 'asc',
            };
        });
    };

    const getSortIcon = (itemId: number) => {
        if (sortConfig.itemId !== itemId || !sortConfig.direction) {
            return <Icon as={FaSort} fontSize="xs" ml={1} opacity={0.5} />;
        }

        return sortConfig.direction === 'asc' ? <Icon as={FaSortUp} fontSize="xs" ml={1} /> : <Icon as={FaSortDown} fontSize="xs" ml={1} />;
    };

    if (userData.length === 0) {
        return null;
    }

    return (
        <Box mt={4} rounded="lg" bg={bgColor} boxShadow="lg" overflow="auto" maxHeight="80vh" width="fit-content" maxWidth="100%">
            <Table.Root size="sm" width="auto" style={{ tableLayout: 'auto' }}>
                <Table.Header position="sticky" top={0} zIndex={1} bg={headerBgColor}>
                    <Table.Row>
                        <Table.ColumnHeader outline="1px solid gray" p={1} position="sticky" left={0} bg={headerBgColor} zIndex={2}>
                            用户名
                        </Table.ColumnHeader>
                        <Table.ColumnHeader textAlign="center" border="1px solid gray" p={1} whiteSpace="nowrap">
                            数据时间
                        </Table.ColumnHeader>
                        {itemColumns.map((item) => (
                            <Table.ColumnHeader
                                key={item.itemId}
                                textAlign="center"
                                border="1px solid gray"
                                p={1}
                                cursor="pointer"
                                onClick={() => handleSort(item.itemId)}
                            >
                                <Flex alignItems="center" justifyContent="center" overflow="hidden">
                                    {item.itemName}
                                    {getSortIcon(item.itemId)}
                                </Flex>
                            </Table.ColumnHeader>
                        ))}
                        {hasLabyrinthPoint && (
                            <Table.ColumnHeader
                                textAlign="center"
                                border="1px solid gray"
                                p={1}
                                whiteSpace="nowrap"
                                cursor="pointer"
                                onClick={() => handleSort(LABYRINTH_POINT_SORT_ID)}
                            >
                                <Flex alignItems="center" justifyContent="center" overflow="hidden">
                                    迷宫分数
                                    {getSortIcon(LABYRINTH_POINT_SORT_ID)}
                                </Flex>
                            </Table.ColumnHeader>
                        )}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {userItemMaps.map(({ user, itemMap }) => (
                        <Table.Row key={user.user_name}>
                            <Table.Cell outline="1px solid gray" p={1} position="sticky" left={0} bg={headerBgColor} zIndex={2}>
                                {user.user_name}
                            </Table.Cell>
                            <Table.Cell textAlign="center" border="1px solid gray" p={1} whiteSpace="nowrap">
                                {user.data_time ?? ''}
                            </Table.Cell>
                            {itemColumns.map((item) => (
                                <Table.Cell key={item.itemId} textAlign="center" border="1px solid gray" p={1}>
                                    {itemMap.get(item.itemId)?.toLocaleString() ?? '-'}
                                </Table.Cell>
                            ))}
                            {hasLabyrinthPoint && (
                                <Table.Cell textAlign="center" border="1px solid gray" p={1}>
                                    {user.labyrinth_point?.toLocaleString() ?? '-'}
                                </Table.Cell>
                            )}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );
}