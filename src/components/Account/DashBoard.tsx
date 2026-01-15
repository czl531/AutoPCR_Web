import { AccountInfo as AccountInfoInterface, UserInfoResponse } from '@interfaces/UserInfo';
import {
    Box,
    Button,
    Card,
    Flex,
    HStack,
    Input,
    SimpleGrid,
    Spacer,
    Stack,
    Table,
    Tag,
    Text,
} from '@chakra-ui/react';
import { FiActivity, FiBook, FiCheck, FiCopy, FiGrid, FiKey, FiLayers, FiList, FiSettings, FiStar, FiTarget, FiUpload, FiUserMinus, FiUserPlus, FiUserX } from 'react-icons/fi';
import { Link, useNavigate } from '@tanstack/react-router';
import { Radio, RadioGroup } from '../../components/ui/radio';
import React, { ChangeEvent } from 'react';
import { Skeleton, SkeletonText } from '../../components/ui/skeleton';
import { clearAccounts, deleteAccount, getAccountDailyResultList, getUserInfo, putUserInfo } from '@api/Account';
import { delAccount, postAccount, postAccountAreaDaily, postAccountImport } from '@api/Account';
import { useEffect, useState } from 'react';

import Alert from '../alert';
import { AxiosError } from 'axios';
import { Checkbox } from '../../components/ui/checkbox';
import { CloseButton } from '../../components/ui/close-button';
import { Route as DashBoardRoute } from '@routes/daily/_sidebar/account/index';
import { IconButton } from '../../components/ui/icon-button';
import { Route as LoginRoute } from '@routes/daily/login';
import NiceModal from '@ebay/nice-modal-react';
import ReadmeModal from './ReadmeModal';
import ResultInfoModal from './ResultInfoModal';
import { Tooltip } from '../../components/ui/tooltip';
import resetPasswdModal from '../Users/ResetPasswdModal';
import { toaster } from '../../components/ui/toaster';
import { useCountHook } from '../count';
import { useDisclosure } from '@chakra-ui/react';
import ConfigSyncModal from './ConfigSyncModal';

const handle: Map<string, (arg0: boolean) => void> = new Map<string, (arg0: boolean) => void>();

export function DashBoard() {
    const [userInfo, setUserInfo] = useState<UserInfoResponse>();
    const freshAccountInfo = useDisclosure();
    const creatAccountSwitch = useDisclosure();
    const deleteQQConfirm = useDisclosure();
    const clearAccountConfirm = useDisclosure();
    const [alias, setAlias] = useState<string>('');
    const [count, increaseCount, decreaseCount] = useCountHook();
    const [isTableView, setIsTableView] = useState<boolean>(() => {
        const savedView = localStorage.getItem('accountViewMode');
        return savedView ? savedView === 'table' : false;
    });
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    
    // Status colors can remain as functional colors

    const showReadme = () => {
        NiceModal.show(ReadmeModal, {})
            .then(() => {
                localStorage.setItem('readme2', 'true');
            })
            .catch(() => {
                localStorage.setItem('readme2', 'true');
            });
    };

    useEffect(() => {
        const readme = localStorage.getItem('readme2');
        if (!readme) {
            showReadme();
        }
    }, []);

    useEffect(() => {
        handle.clear();
        getUserInfo()
            .then((res) => {
                setUserInfo(res);
            })
            .catch((err: AxiosError) => {
                toaster.create({ type: 'error', title: (err?.response?.data as string) || '网络错误' });
            });
    }, [freshAccountInfo.open]);

    const handleDefaultAccount = (value: string) => {
        putUserInfo({ default_account: value })
            .then((res) => {
                setUserInfo({ ...userInfo, default_account: value });
                toaster.create({ type: 'success', title: '设置默认账号成功', description: res });
            })
            .catch((err: AxiosError) => {
                toaster.create({ type: 'error', title: '设置默认账号失败', description: (err?.response?.data as string) || '网络错误' });
            });
    };

    const handleResetPassword = () => {
        NiceModal.show(resetPasswdModal, {})
            .then((value) => {
                putUserInfo({ password: value as string })
                    .then((res) => {
                        toaster.create({ type: 'success', title: '修改密码成功', description: res });
                        NiceModal.hide(resetPasswdModal)
                            .then(() => {
                                return;
                            })
                            .catch(() => {
                                return;
                            });
                    })
                    .catch((err: AxiosError) => {
                        toaster.create({ type: 'error', title: '修改密码失败', description: (err?.response?.data as string) || '网络错误' });
                    });
            })
            .catch(() => {
                return;
            });
    };

    const updateAccountInfo = (updatedAccount: AccountInfoInterface) => {
        setUserInfo((prevUserInfo) => {
            if (!prevUserInfo?.accounts) {
                return prevUserInfo;
            }

            const updatedAccounts = prevUserInfo.accounts.map((account) => (account.name === updatedAccount.name ? updatedAccount : account));

            return {
                ...prevUserInfo,
                accounts: updatedAccounts,
            };
        });
    };

    const handleCleanDailyAll = () => {
        if (isTableView && selectedAccounts.length > 0) {
            // 清理选中的账号
            for (const accountName of selectedAccounts) {
                const fn = handle.get(accountName);
                if (fn) fn(false);
            }
        } else {
            // 清理所有账号
            for (const fn of handle.values()) {
                fn(false);
            }
        }
    };

    const toggleSelectAccount = (accountName: string) => {
        setSelectedAccounts((prev) => {
            if (prev.includes(accountName)) {
                return prev.filter((name) => name !== accountName);
            } else {
                return [...prev, accountName];
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedAccounts.length === userInfo?.accounts?.length) {
            setSelectedAccounts([]);
        } else {
            setSelectedAccounts(userInfo?.accounts?.map((acc) => acc.name) ?? []);
        }
    };

    const handleCreateAccount = () => {
        if (creatAccountSwitch.open) {
            // 检查alias是否为空
            if (!alias || alias.trim() === '') {
                toaster.create({
                    type: 'error',
                    title: '创建账号失败',
                    description: '账号昵称不能为空',
                });
                return;
            }

            postAccount(alias)
                .then((res) => {
                    toaster.create({
                        type: 'success',
                        title: '创建账号成功',
                        description: res,
                    });
                    creatAccountSwitch.onToggle();
                    setAlias(''); // 重置输入框
                    freshAccountInfo.onToggle();
                })
                .catch((err: AxiosError) => {
                    toaster.create({
                        type: 'error',
                        title: '创建账号失败',
                        description: (err?.response?.data as string) || '网络错误',
                    });
                });
        } else {
            creatAccountSwitch.onToggle();
        }
    };

    const handleAccountImport = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            postAccountImport(file)
                .then((res) => {
                    toaster.create({ type: 'success', title: '导入账号成功', description: res });
                    freshAccountInfo.onToggle();
                })
                .catch((err: AxiosError) => {
                    toaster.create({ type: 'error', title: '导入账号失败', description: (err?.response?.data as string) || '网络错误' });
                });
        }
    };

    const cancelRef = React.useRef<HTMLButtonElement>(null);

    const navigate = useNavigate();

    const handleDeleteAccount = () => {
        deleteAccount()
            .then(async (res) => {
                toaster.create({ type: 'success', title: '删除QQ成功', description: res });
                deleteQQConfirm.onToggle();
                await navigate({ to: LoginRoute.to });
            })
            .catch((err: AxiosError) => {
                toaster.create({ type: 'error', title: '删除QQ失败', description: (err?.response?.data as string) || '网络错误' });
            });
    };

    const handleClearAccounts = () => {
        clearAccounts()
            .then((res) => {
                toaster.create({ type: 'success', title: '清除账号成功', description: res });
                clearAccountConfirm.onToggle();
                freshAccountInfo.onToggle();
            })
            .catch((err: AxiosError) => {
                toaster.create({ type: 'error', title: '清除账号失败', description: (err?.response?.data as string) || '网络错误' });
            });
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <Stack gap={4} h="full" w="full" p={4} position="relative" zIndex={1}>
            {/* Dashboard Header - Minimalist */}
            <Card.Root variant="elevated" bg="bg.glass" backdropFilter="blur(12px)" shadow="sm" borderRadius="2xl" borderWidth="1px" borderColor="border.subtle">
                <Card.Body py={2} px={4}>
                    <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                        <Box>
                            <Text fontSize="md" fontWeight="bold">
                                {!userInfo ? <Skeleton height="20px" width="100px" /> : `欢迎回来, ${userInfo.qq}`}
                            </Text>
                        </Box>

                        <HStack gap={2}>
                            <Button size="xs" variant="surface" colorPalette="teal" onClick={showReadme}>
                                <FiBook /> 使用须知
                            </Button>
                            <Button size="xs" variant="surface" colorPalette="blue" onClick={handleResetPassword}>
                                <FiKey /> 修改密码
                            </Button>
                            <Button size="xs" variant="surface" colorPalette="red" onClick={deleteQQConfirm.onOpen}>
                                <FiUserX /> 注销QQ
                            </Button>
                        </HStack>
                    </Flex>
                </Card.Body>
            </Card.Root>

            <Alert leastDestructiveRef={cancelRef} isOpen={deleteQQConfirm.open} onClose={deleteQQConfirm.onClose} title="删除QQ" body={`确定删除QQ${userInfo?.qq}吗？`} onConfirm={handleDeleteAccount}>
                {' '}
            </Alert>

            {/* Action Toolbar */}
            <Flex 
                bg="bg.panel" 
                p={2} 
                borderRadius="xl" 
                shadow="sm" 
                borderWidth="1px" 
                borderColor="border.subtle"
                align="center"
                wrap="wrap"
                gap={2}
            >
                {/* Left Actions: Batch Operations */}
                <HStack gap={2}>
                     <Button 
                        size="sm" 
                        colorPalette="orange" 
                        variant="ghost"
                        onClick={handleCleanDailyAll} 
                        loading={count != 0}
                    >
                        <FiTarget /> {isTableView && selectedAccounts.length > 0 ? `清选择(${selectedAccounts.length})` : '清理全部'}
                    </Button>
                    <Button
                        as={Link}
                        size="sm"
                        colorPalette="blue"
                        variant="ghost"
                        // @ts-ignore
                        to={`${DashBoardRoute.to || ''}BATCH_RUNNER`} 
                        loading={count != 0}
                    >
                        <FiLayers /> 批量运行
                    </Button>
                </HStack>

                <Spacer />

                {/* Right Actions: View Switch & Account Manage */}
                <HStack gap={2}>
                    {/* View Switcher */}
                    <Box bg="bg.subtle" p={1} borderRadius="md" display="flex">
                        <Tooltip content="表格视图">
                            <IconButton 
                                aria-label="List view"
                                size="xs" 
                                variant={isTableView ? "solid" : "ghost"} 
                                colorPalette={isTableView ? "blue" : "gray"}
                                onClick={() => {
                                    setIsTableView(true);
                                    localStorage.setItem('accountViewMode', 'table');
                                }}
                            >
                                <FiList />
                            </IconButton>
                        </Tooltip>
                        <Tooltip content="卡片视图">
                            <IconButton 
                                aria-label="Grid view"
                                size="xs" 
                                variant={!isTableView ? "solid" : "ghost"} 
                                colorPalette={!isTableView ? "blue" : "gray"}
                                onClick={() => {
                                    setIsTableView(false);
                                    localStorage.setItem('accountViewMode', 'card');
                                }}
                            >
                                <FiGrid />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Sync & Default (only for Table && Single Select) */}
                    {isTableView && selectedAccounts.length === 1 && (
                        <HStack gap={1} separator={<Box w="1px" h="15px" bg="border.subtle" />}>
                             <Tooltip content={`将其他账号配置同步为 ${selectedAccounts[0]} 的配置`}>
                                <IconButton
                                    aria-label="Sync configuration"
                                    size="sm"
                                    variant="ghost"
                                    colorPalette="teal"
                                    onClick={() => {
                                        NiceModal.show(ConfigSyncModal, { sourceAccount: selectedAccounts[0] });
                                    }}
                                > <FiCopy /> </IconButton>
                            </Tooltip>
                            <Tooltip content={`将 ${selectedAccounts[0]} 设为默认账号`}>
                                <IconButton
                                    aria-label="Set as default"
                                    size="sm"
                                    variant="ghost"
                                    colorPalette="purple"
                                    onClick={() => handleDefaultAccount(selectedAccounts[0])}
                                > <FiStar /> </IconButton>
                            </Tooltip>
                        </HStack>
                    )}
                    
                    {/* Add / Import / Delete Group */}
                     <HStack gap={1}>
                        {userInfo?.clan && (
                            <Tooltip content="导入账号 (TSV)">
                                <IconButton
                                    aria-label="Import accounts"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                > <FiUpload /> </IconButton>
                            </Tooltip>
                        )}
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".tsv"
                            onChange={handleAccountImport}
                            onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                            display="none"
                        />
                                

                         <Tooltip content={isTableView && selectedAccounts.length > 0 ? `删除选中(${selectedAccounts.length})` : '删除全部'}>
                            <IconButton
                                aria-label="Delete selected accounts"
                                size="sm"
                                variant="outline"
                                colorPalette="red"
                                onClick={() => {
                                    if (isTableView && selectedAccounts.length > 0) {
                                        if (window.confirm(`确定删除选中的 ${selectedAccounts.length} 个账号吗？`)) {
                                            Promise.all(selectedAccounts.map((name) => delAccount(name)))
                                                .then(() => {
                                                    toaster.create({ type: 'success', title: '删除成功' });
                                                    setSelectedAccounts([]);
                                                    freshAccountInfo.onToggle();
                                                })
                                                .catch((err) => toaster.create({ type: 'error', title: '删除失败', description: (err?.response?.data as string) || '网络错误' }));
                                        }
                                    } else {
                                        clearAccountConfirm.onOpen();
                                    }
                                }}
                            > <FiUserMinus /> </IconButton>
                        </Tooltip>
                        <Box position="relative">
                            <Tooltip content={creatAccountSwitch.open ? '取消创建' : '创建新账号'}>
                                <IconButton
                                    aria-label={creatAccountSwitch.open ? "Confirm creation" : "Create account"}
                                    size="sm"
                                    variant={creatAccountSwitch.open ? "solid" : "solid"}
                                    colorPalette={creatAccountSwitch.open ? "red" : "green"}
                                    onClick={() => {
                                        if(creatAccountSwitch.open && !alias) creatAccountSwitch.onToggle(); // Close if empty
                                        else if (creatAccountSwitch.open && alias) handleCreateAccount(); // Submit
                                        else creatAccountSwitch.onToggle(); // Open
                                    }}
                                > 
                                    {creatAccountSwitch.open ? <FiCheck /> : <FiUserPlus />} 
                                </IconButton>
                            </Tooltip>
                        </Box>
                     </HStack>
                </HStack>
            </Flex>

            {/* Inline Account Creation Input */}
            {creatAccountSwitch.open && (
                <Flex 
                    bg="bg.panel" 
                    p={4} 
                    borderRadius="xl" 
                    shadow="sm" 
                    borderWidth="1px" 
                    borderColor="green.subtle" 
                    align="center" 
                    gap={4}
                    animation="fade-in 0.2s"
                >
                    <Text fontWeight="bold" whiteSpace="nowrap">新账号名称:</Text>
                    <Input
                        autoFocus
                        placeholder="请输入游戏账号昵称..."
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter') handleCreateAccount() }}
                    />
                    <Button size="sm" colorPalette="green" onClick={handleCreateAccount}>创建</Button>
                </Flex>
            )}

            <Alert leastDestructiveRef={cancelRef} isOpen={clearAccountConfirm.open} onClose={clearAccountConfirm.onClose} title="删除所有账号" body={`确定删除所有账号吗？`} onConfirm={handleClearAccounts}>
                {' '}
            </Alert>
            
            {isTableView ? (
                <Box flex={1} overflow={'auto'} borderRadius="xl">
                    <Table.Root variant="outline" colorPalette="blue" size="sm" bg="bg.panel" borderRadius="xl" boxShadow="sm" ml="0" mr="auto">
                        <Table.Header position="sticky" top={0} bg="bg.subtle" zIndex={1} boxShadow="sm">
                            <Table.Row>
                                <Table.ColumnHeader px={3} fontSize="md" py={4} fontWeight="bold" width="5%">
                                    <Checkbox
                                        checked={
                                            (selectedAccounts.length > 0 && selectedAccounts.length < (userInfo?.accounts?.length ?? 0))
                                                ? "indeterminate"
                                                : (selectedAccounts.length > 0 && selectedAccounts.length === userInfo?.accounts?.length)
                                        }
                                        onCheckedChange={toggleSelectAll}
                                        colorPalette="blue"
                                    />
                                </Table.ColumnHeader>
                                <Table.ColumnHeader px={0} fontSize="md" py={4} fontWeight="bold" width="25%" minWidth="80px">
                                    账号
                                </Table.ColumnHeader>
                                <Table.ColumnHeader px={3} fontSize="md" py={4} fontWeight="bold" width="30%">
                                    最近记录
                                </Table.ColumnHeader>
                                <Table.ColumnHeader px={3} fontSize="md" py={4} fontWeight="bold" width="30%">
                                    操作
                                </Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {!userInfo ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <Table.Row key={i} bg="transparent">
                                        <Table.Cell px={3} py={2}><Skeleton height="20px" width="20px" /></Table.Cell>
                                        <Table.Cell px={0} py={2}><Skeleton height="20px" width="80%" /></Table.Cell>
                                        <Table.Cell px={3} py={2}><Skeleton height="20px" width="60%" /></Table.Cell>
                                        <Table.Cell px={3} py={2}><Skeleton height="32px" width="100%" /></Table.Cell>
                                    </Table.Row>
                                ))
                            ) : (
                                userInfo?.accounts?.map((account) => (
                                    <AccountInfo
                                        key={account.name}
                                        account={account}
                                        onToggle={freshAccountInfo.onToggle}
                                        increaseCount={increaseCount}
                                        decreaseCount={decreaseCount}
                                        updateAccountInfo={updateAccountInfo}
                                        isTableView={isTableView}
                                        isSelected={selectedAccounts.includes(account.name)}
                                        onToggleSelect={() => toggleSelectAccount(account.name)}
                                        defaultAccount={userInfo?.default_account}
                                        onOpenSyncConfig={(alias) => {
                                            NiceModal.show(ConfigSyncModal, { sourceAccount: alias });
                                        }}
                                    />
                                ))
                            )}
                        </Table.Body>
                    </Table.Root>
                </Box>
            ) : (
                <RadioGroup onValueChange={(e) => handleDefaultAccount(e.value || "")} value={userInfo?.default_account} flex={1} overflow={'auto'} p={1}>
                    <Stack>
                        <SimpleGrid gap={4} templateColumns="repeat(auto-fill, minmax(280px, 1fr))">
                            {!userInfo ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <Card.Root key={i} bg="bg.panel" borderRadius="2xl" shadow="sm">
                                        <Card.Header><Skeleton height="24px" width="50%" /></Card.Header>
                                        <Card.Body><SkeletonText noOfLines={3} gap={4} /></Card.Body>
                                        <Card.Footer><Skeleton height="32px" width="100%" /></Card.Footer>
                                    </Card.Root>
                                ))
                            ) : (
                                userInfo?.accounts?.map((account) => {
                                    return (
                                        <AccountInfo
                                            key={account.name}
                                            account={account}
                                            onToggle={freshAccountInfo.onToggle}
                                            increaseCount={increaseCount}
                                            decreaseCount={decreaseCount}
                                            updateAccountInfo={updateAccountInfo}
                                            isTableView={isTableView}
                                            isSelected={selectedAccounts.includes(account.name)}
                                            onToggleSelect={() => toggleSelectAccount(account.name)}
                                            onOpenSyncConfig={(alias) => {
                                                NiceModal.show(ConfigSyncModal, { sourceAccount: alias });
                                            }}
                                        />
                                    );
                                })
                            )}
                        </SimpleGrid>
                    </Stack>
                </RadioGroup>
            )}
        </Stack>
    );
}

interface AccountInfoProps {
    account: AccountInfoInterface;
    onToggle: () => void;
    increaseCount: () => void;
    decreaseCount: () => void;
    updateAccountInfo: (updatedAccount: AccountInfoInterface) => void;
    isTableView?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
    defaultAccount?: string;
    onOpenSyncConfig?: (alias: string) => void;
}

function AccountInfo({ account, onToggle, increaseCount, decreaseCount, updateAccountInfo, isTableView = false, isSelected = false, onToggleSelect, defaultAccount, onOpenSyncConfig }: AccountInfoProps) {
    const buttomLoading = useDisclosure();
    const alias = account.name;
    const deleteConfirm = useDisclosure();
    
    const handleCleanDaily = async () => {
        buttomLoading.onOpen();
        increaseCount();
        toaster.create({ type: 'info', title: `开始为${alias}清理日常...` });
        try {
            const res = await postAccountAreaDaily(alias);
            toaster.create({ type: 'success', title: `${alias}清日常成功` });
            updateAccountInfo(res);
        } catch(err: any) {
             toaster.create({ type: 'error', title: `${alias}清日常失败`, description: (err?.response?.data as string) || '网络错误' });
        } finally {
            buttomLoading.onClose();
            decreaseCount();
        }
    };

    handle.set(account.name, handleCleanDaily);

    const handleDeleteAccount = () => {
        delAccount(alias)
            .then((res) => {
                toaster.create({ type: 'success', title: '删除账号成功', description: res });
                onToggle();
            })
            .catch((err: AxiosError) => {
                toaster.create({ type: 'error', title: '删除账号失败', description: (err?.response?.data as string) || '网络错误' });
            });
    };

    const handleDailyResult = () => {
        toaster.create({ type: 'info', title: `正在获取${alias}的日常结果...` });
        getAccountDailyResultList(alias)
            .then(async (res) => {
                toaster.create({ type: 'success', title: '获取日常结果成功' });
                await NiceModal.show(ResultInfoModal, { alias: alias, title: '日常', resultInfo: res });
            })
            .catch(async (err: AxiosError) => {
                toaster.create({ type: 'error', title: '获取日常结果失败', description: (await (err?.response?.data as Blob).text()) || '网络错误' });
            });
    };

    const cancelRef = React.useRef<HTMLButtonElement>(null);

    // Status Badge Helper
    const StatusBadge = () => {
        let color = "red";
        let icon = <FiUserX />;
        let text = "未知";
        
        if (account.daily_clean_time.status === '成功') {
            color = "green";
            icon = <FiCheck />;
            text = "完成";
        } else if (account.daily_clean_time.status === '警告') {
            color = "orange";
            icon = <FiActivity />;
            text = "警告";
        }

        return (
             <Tag.Root colorPalette={color} variant="subtle">
                <Tag.StartElement>{icon}</Tag.StartElement>
                <Tag.Label>{text} {account.daily_clean_time.time}</Tag.Label>
            </Tag.Root>
        )
    }


    // 表格视图渲染
    if (isTableView) {
        return (
            <Table.Row
                key={alias}
                bg="bg.panel"
                _hover={{
                    bg: "bg.muted",
                    transition: 'background-color 0.2s',
                }}
            >
                <Table.Cell px={3} py={3} width="50px">
                    <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} colorPalette="blue" />
                </Table.Cell>
                <Table.Cell px={0} py={3}>
                     <HStack gap={2}>
                        <Box w="32px" h="32px" bg="blue.subtle" color="blue.fg" borderRadius="full" display="flex" alignItems="center" justifyContent="center" fontSize="sm">
                            {alias.charAt(0).toUpperCase()}
                        </Box>
                        <Stack gap={0}>
                            <Text fontWeight="bold" fontSize="sm">{alias}</Text>
                            <HStack gap={1}>
                                {defaultAccount === account.name && <Tag.Root size="sm" colorPalette="purple" variant="solid"><Tag.Label>默认</Tag.Label></Tag.Root>}
                                {account.clan_forbid && <Tag.Root size="sm" colorPalette="red" variant="solid"><Tag.Label>公会战禁用</Tag.Label></Tag.Root>}
                            </HStack>
                        </Stack>
                    </HStack>
                </Table.Cell>
                <Table.Cell px={3} py={3}>
                    <StatusBadge />
                </Table.Cell>
                <Table.Cell px={3} py={3}>
                    <HStack gap={1}>
                        <Tooltip content="配置">
                            <IconButton aria-label="Settings" as={Link} // @ts-ignore
                            to={`${DashBoardRoute.to || ''}${account.name}`} size="xs" variant="ghost" colorPalette="blue"> <FiSettings /> </IconButton>
                        </Tooltip>

                        <Tooltip content="清理日常">
                            <IconButton aria-label="Clean Daily" size="xs" variant="ghost" colorPalette="orange" onClick={handleCleanDaily} loading={buttomLoading.open}> <FiTarget /> </IconButton>
                        </Tooltip>

                        <Tooltip content="同步配置">
                             <IconButton aria-label="Sync Config" size="xs" variant="ghost" colorPalette="teal" onClick={() => onOpenSyncConfig && onOpenSyncConfig(alias)} loading={buttomLoading.open}> <FiCopy /> </IconButton>
                        </Tooltip>

                        <Tooltip content="结果">
                             <IconButton aria-label="View Results" size="xs" variant="ghost" colorPalette="green" onClick={handleDailyResult} loading={buttomLoading.open}> <FiActivity /> </IconButton>
                        </Tooltip>
                    </HStack>
                </Table.Cell>
            </Table.Row>
        );
    }

    // 卡片视图渲染
    return (
        <Card.Root 
            key={alias} 
            bg="bg.panel" 
            shadow="sm" 
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="border.subtle"
            transition="all 0.2s"
            _hover={{ shadow: 'lg', transform: 'translateY(-2px)', borderColor: "blue.focusRing" }}
        >
            <Card.Header pb={2}>
                <Flex justify="space-between" align="start">
                    <Stack gap={1}>
                        <HStack>
                             <Radio value={alias} colorPalette="purple" />
                             <Text fontWeight="bold" fontSize="lg" lineHeight="1.2">{alias}</Text>
                             {account.clan_forbid && <Tag.Root size="sm" colorPalette="red" variant="subtle"><Tag.Label>禁用</Tag.Label></Tag.Root>}
                        </HStack>
                    </Stack>
                    
                     <Alert leastDestructiveRef={cancelRef} isOpen={deleteConfirm.open} onClose={deleteConfirm.onClose} title="删除账号" body={`确定删除账号${alias}吗？`} onConfirm={handleDeleteAccount}>
                        {' '}
                    </Alert>

                     <IconButton 
                        size="xs" 
                        variant="ghost" 
                        colorPalette="gray" 
                        aria-label="Delete" 
                        onClick={deleteConfirm.onOpen}
                        _hover={{ bg: "red.subtle", color: "red.fg" }}
                    >
                        <CloseButton />
                    </IconButton>
                </Flex>
            </Card.Header>

            <Card.Body py={2}>
                <Stack gap={3} mt={2}>
                    <Box bg="bg.subtle" p={2} borderRadius="lg">
                         <Flex justify="space-between" align="center" mb={1}>
                            <Text fontSize="xs" color="fg.muted">上次运行</Text>
                            <Text fontSize="xs" fontWeight="bold">{account.daily_clean_time.time}</Text>
                        </Flex>
                        <Flex justify="space-between" align="center">
                            <Text fontSize="xs" color="fg.muted">状态</Text>
                             <Tag.Root 
                                size="sm" 
                                colorPalette={account.daily_clean_time.status === '成功' ? "green" : account.daily_clean_time.status === '警告' ? "orange" : "red"} 
                            >
                                <Tag.Label>{account.daily_clean_time.status}</Tag.Label>
                            </Tag.Root>
                        </Flex>
                    </Box>
                </Stack>
            </Card.Body>

            <Card.Footer pt={2}>
                 <HStack gap={0} w="full" justify="space-between">
                     <Tooltip content="详细配置">
                        <IconButton aria-label="Settings" flex="1" variant="ghost" colorPalette="blue" as={Link} // @ts-ignore
                            to={DashBoardRoute.to + alias}> <FiSettings /> </IconButton>
                    </Tooltip>
                    
                     <Tooltip content="立即清理">
                         <IconButton aria-label="Clean Daily" flex="1" variant="ghost" colorPalette="orange" onClick={handleCleanDaily} loading={buttomLoading.open}> <FiTarget /> </IconButton>
                    </Tooltip>

                    <Tooltip content="同步配置">
                         <IconButton aria-label="Sync Config" flex="1" variant="ghost" colorPalette="teal" onClick={() => onOpenSyncConfig && onOpenSyncConfig(alias)} loading={buttomLoading.open}> <FiCopy /> </IconButton>
                    </Tooltip>
                    
                    <Tooltip content="运行结果">
                         <IconButton aria-label="View Result" flex="1" variant="ghost" colorPalette="green" onClick={handleDailyResult} loading={buttomLoading.open}> <FiActivity /> </IconButton>
                    </Tooltip>
                </HStack>
            </Card.Footer>
        </Card.Root>
    );
}
