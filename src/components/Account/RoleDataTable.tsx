import { Table, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useColorModeValue } from "@/components/ui/color-mode"

interface RoleData {
    role_gacha?: string;
    role_levels: Record<string, string>;
}

interface UserRoleData {
    user_name: string;
    data_time?: string;
    user_info?: string[];
    role_data: RoleData;
}

interface RoleDataTableProps {
    logContent: string | undefined;
}

export function RoleDataTable({ logContent }: RoleDataTableProps) {
    // 解析日志内容，提取用户职能数据
    const userRoleData = useMemo(() => {
        if (!logContent) return [];

        const userDataArray: UserRoleData[] = [];
        
        // 检查是否是新格式（以 ===用户名=== 开头）
        if (logContent.startsWith('===')) {
            const userSections = logContent.split('===');
            
            // 两两一组处理（用户名 + 数据）
            for (let i = 1; i < userSections.length; i += 2) {
                const userName = userSections[i].trim();
                const section = userSections[i + 1];
                
                if (!userName || !section) continue;

                const roleDataMatch = section.match(/{.*}/s);
                if (roleDataMatch) {
                    try {
                        const roleData = JSON.parse(roleDataMatch[0]) as RoleData;
                        
                        // 提取时间信息
                        const dateTimeMatch = section.match(/\[(.*?)\]/);
                        
                        const userRole: UserRoleData = {
                            user_name: userName,
                            data_time: dateTimeMatch?.[1],
                            user_info: dateTimeMatch ? ['数据时间'] : [],
                            role_data: roleData
                        };

                        userDataArray.push(userRole);
                    } catch (e) {
                        console.error('解析职能数据失败:', e);
                    }
                }
            }
        } else {
            // 处理旧格式日志
            try {
                // 提取日志中的 JSON 部分
                const logMatch = logContent.match(/{.*}/s);
                if (logMatch) {
                    const logData = JSON.parse(logMatch[0]) as Partial<{
                        role_gacha: string;
                        role_levels: Record<string, string>;
                    }>;
                    
                    // 从日志内容中提取用户名（在第一个 === 之前）
                    const userNameMatch = logContent.match(/===(.*?)===/);
                    
                    const userRole: UserRoleData = {
                        user_name: userNameMatch?.[1] ?? '我我', // 默认用户名
                        user_info: [], // 新格式不包含额外信息
                        role_data: {
                            role_gacha: logData.role_gacha,
                            role_levels: logData.role_levels ?? {}
                        }
                    };
                    
                    userDataArray.push(userRole);
                }
            } catch (e) {
                console.error('解析旧格式日志失败:', e);
            }
        }

        return userDataArray;
    }, [logContent]);

    const bgColor = useColorModeValue('white', 'gray.700');
    const headerBgColor = useColorModeValue('gray.100', 'gray.600');

    if (userRoleData.length === 0) {
        return null;
    }

    // 职能类型映射
    const roleMap = [
        { key: '攻击', name: '攻击' },
        { key: '破防', name: '破防' },
        { key: '增益', name: '增益' },
        { key: '减益', name: '减益' },
        { key: '强化', name: '强化' },
        { key: '治疗', name: '治疗' },
        { key: '坦克', name: '坦克' },
        { key: '干扰', name: '干扰' }
    ];
    
    // 获取第一个用户的信息列配置
    const infoColumns = userRoleData[0]?.user_info?.length ? userRoleData[0].user_info : [];

    return (
        <Box mt={4} rounded="lg" bg={bgColor} boxShadow="lg">
            <Table.ScrollArea>
                <Table.Root size="sm">
                    <Table.Header position="sticky" top={0} zIndex={1} bg={headerBgColor}>
                        <Table.Row>
                            <Table.ColumnHeader 
                                outline="1px solid gray" 
                                p={1} 
                                position="sticky" 
                                left={0} 
                                bg={headerBgColor} 
                                zIndex={2}
                            >
                                用户名
                            </Table.ColumnHeader>
                            {infoColumns.includes('数据时间') && (
                                <Table.ColumnHeader border="1px solid gray" p={1}>
                                    数据时间
                                </Table.ColumnHeader>
                            )}
                            <Table.ColumnHeader
                                textAlign="center"
                                fontSize="xs"
                                border="1px solid gray"
                                p={1}
                            >
                                精通等级
                            </Table.ColumnHeader>
                            {roleMap.map(role => (
                                <Table.ColumnHeader 
                                    key={role.key} 
                                    textAlign="center" 
                                    fontSize="xs" 
                                    border="1px solid gray" 
                                    p={1}
                                >
                                    {role.name}
                                </Table.ColumnHeader>
                            ))}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {userRoleData.map((user) => (
                            <Table.Row key={user.user_name}>
                                <Table.Cell 
                                    outline="1px solid gray" 
                                    p={1} 
                                    position="sticky" 
                                    left={0} 
                                    bg={headerBgColor} 
                                    zIndex={2}
                                >
                                    {user.user_name}
                                </Table.Cell>
                                {infoColumns.includes('数据时间') && (
                                    <Table.Cell border="1px solid gray" p={1}>
                                        {user.data_time}
                                    </Table.Cell>
                                )}
                                <Table.Cell
                                    textAlign="left"
                                    border="1px solid gray"
                                    p={1}
                                >
                                    {user.role_data.role_gacha ?? '-'}
                                </Table.Cell>
                                {roleMap.map(role => (
                                    <Table.Cell 
                                        key={role.key} 
                                        textAlign="center" 
                                        border="1px solid gray" 
                                        p={1}
                                    >
                                        {user.role_data.role_levels[role.key] || '-'}
                                    </Table.Cell>
                                ))}
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>
        </Box>
    );
}
