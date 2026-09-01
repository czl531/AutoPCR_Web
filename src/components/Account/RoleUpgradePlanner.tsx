import { Box, Flex, Heading, Stack, Table, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';

export interface RoleMaterial {
    mastery_id: number;
    slot_level: number;
    item_id: number;
    item_name: string;
    count: number;
    universal: boolean;
}

export interface RoleCost {
    mastery_id: number;
    slot_level: number;
    enhance_level: number;
    num: number;
}

export interface RoleSlot {
    role_id: number;
    role_name: string;
    slot_id: number;
    mastery_id: number;
    slot_name?: string;
    slot_level: number;
    enhance_level: number;
}

export interface PlannerUser {
    user_name: string;
    role_data: {
        role_slots?: RoleSlot[];
        role_materials?: RoleMaterial[];
        role_costs?: RoleCost[];
    };
}

type MaterialPool = Record<number, number>;

interface PlanEntry {
    id: number;
    masteryId: number;
    targetKey: string;
}

interface PlanLine {
    slotLevel: number;
    required: number;
    dedicated: number;
    universal: number;
    shortfall: number;
}

interface MasteryOption {
    masteryId: number;
    label: string;
    targets: RoleCost[];
}

function stateOrder(slotLevel: number, enhanceLevel: number) {
    return slotLevel * 100 + enhanceLevel;
}

function clonePool(pool: MaterialPool): MaterialPool {
    return { ...pool };
}

function normalizePool(pool: MaterialPool, slotLevel: number): void {
    for (let level = 1; level < slotLevel; level += 1) {
        const count = pool[level] ?? 0;
        const promoted = Math.floor(count / 3);
        pool[level] = count % 3;
        pool[level + 1] = (pool[level + 1] ?? 0) + promoted;
    }
}

function allocationOptions(min: number, max: number, modulus: number): number[] {
    const options = new Set<number>();
    for (let offset = 0; offset < modulus && min + offset <= max; offset += 1) {
        const first = min + offset;
        options.add(first + Math.floor((max - first) / modulus) * modulus);
    }
    return [...options];
}

function initialDedicatedPools(materials: RoleMaterial[]) {
    const pools: Record<number, MaterialPool> = {};
    materials.filter((item) => !item.universal).forEach((item) => {
        const pool = pools[item.mastery_id] ?? {};
        pool[item.slot_level] = (pool[item.slot_level] ?? 0) + item.count;
        pools[item.mastery_id] = pool;
    });
    return pools;
}

function initialUniversalPool(materials: RoleMaterial[]) {
    return materials.filter((item) => item.universal).reduce<MaterialPool>((pool, item) => {
        pool[item.slot_level] = (pool[item.slot_level] ?? 0) + item.count;
        return pool;
    }, {});
}

function requirementsForTarget(costs: RoleCost[], masteryId: number, start: RoleCost, target: RoleCost) {
    const requiredByLevel = new Map<number, number>();
    costs
        .filter((cost) => cost.mastery_id === masteryId)
        .filter((cost) => stateOrder(cost.slot_level, cost.enhance_level) > stateOrder(start.slot_level, start.enhance_level))
        .filter((cost) => stateOrder(cost.slot_level, cost.enhance_level) <= stateOrder(target.slot_level, target.enhance_level))
        .sort((a, b) => stateOrder(a.slot_level, a.enhance_level) - stateOrder(b.slot_level, b.enhance_level))
        .forEach((cost) => requiredByLevel.set(cost.slot_level, (requiredByLevel.get(cost.slot_level) ?? 0) + cost.num));
    return [...requiredByLevel.entries()].sort(([a], [b]) => a - b).map(([slotLevel, required]) => ({ slotLevel, required }));
}

function consumeRequirements(dedicatedPool: MaterialPool, universalPool: MaterialPool, requirements: { slotLevel: number; required: number }[]) {
    if (requirements.length === 0) return { dedicatedPool, universalPool, lines: [] as PlanLine[] };
    const maxLevel = requirements[requirements.length - 1].slotLevel;
    const candidates: { dedicatedPool: MaterialPool; universalPool: MaterialPool; lines: PlanLine[] }[] = [];

    const search = (index: number, dedicated: MaterialPool, universal: MaterialPool, lines: PlanLine[]) => {
        if (index === requirements.length) {
            candidates.push({ dedicatedPool: dedicated, universalPool: universal, lines });
            return;
        }
        const { slotLevel, required } = requirements[index];
        const normalizedDedicated = clonePool(dedicated);
        const normalizedUniversal = clonePool(universal);
        normalizePool(normalizedDedicated, slotLevel);
        normalizePool(normalizedUniversal, slotLevel);
        const availableDedicated = normalizedDedicated[slotLevel] ?? 0;
        const availableUniversal = normalizedUniversal[slotLevel] ?? 0;
        const served = Math.min(required, availableDedicated + availableUniversal);
        const minimumDedicated = Math.max(0, served - availableUniversal);
        const maximumDedicated = Math.min(served, availableDedicated);
        const modulus = 3 ** (maxLevel - slotLevel);

        allocationOptions(minimumDedicated, maximumDedicated, modulus).forEach((dedicatedUsed) => {
            const nextDedicated = clonePool(normalizedDedicated);
            const nextUniversal = clonePool(normalizedUniversal);
            nextDedicated[slotLevel] = (nextDedicated[slotLevel] ?? 0) - dedicatedUsed;
            nextUniversal[slotLevel] = (nextUniversal[slotLevel] ?? 0) - (served - dedicatedUsed);
            search(index + 1, nextDedicated, nextUniversal, [...lines, {
                slotLevel,
                required,
                dedicated: dedicatedUsed,
                universal: served - dedicatedUsed,
                shortfall: required - served,
            }]);
        });
    };

    search(0, clonePool(dedicatedPool), clonePool(universalPool), []);
    candidates.sort((a, b) => {
        const shortfallA = a.lines.reduce((sum, line) => sum + line.shortfall, 0);
        const shortfallB = b.lines.reduce((sum, line) => sum + line.shortfall, 0);
        if (shortfallA !== shortfallB) return shortfallA - shortfallB;
        return b.lines.reduce((sum, line) => sum + line.dedicated, 0) - a.lines.reduce((sum, line) => sum + line.dedicated, 0);
    });
    return candidates[0] ?? { dedicatedPool, universalPool, lines: [] as PlanLine[] };
}

export function RoleUpgradePlanner({ users }: { users: PlannerUser[] }) {
    const masteryOptions = useMemo(() => {
        const options = new Map<number, MasteryOption>();
        users.forEach((user) => {
            const costs = user.role_data.role_costs ?? [];
            (user.role_data.role_slots ?? []).filter((slot) => slot.enhance_level >= 0).forEach((slot) => {
                if (options.has(slot.mastery_id)) return;
                const targets = costs
                    .filter((cost) => cost.mastery_id === slot.mastery_id)
                    .sort((a, b) => stateOrder(a.slot_level, a.enhance_level) - stateOrder(b.slot_level, b.enhance_level));
                if (targets.length) {
                    options.set(slot.mastery_id, {
                        masteryId: slot.mastery_id,
                        label: slot.slot_name || slot.role_name,
                        targets,
                    });
                }
            });
        });
        return [...options.values()];
    }, [users]);
    const [entries, setEntries] = useState<PlanEntry[]>([]);
    const [nextId, setNextId] = useState(1);

    const addEntry = () => {
        const option = masteryOptions[0];
        const target = option?.targets[0];
        if (!option || !target) return;
        setEntries((current) => [...current, { id: nextId, masteryId: option.masteryId, targetKey: `${target.slot_level}-${target.enhance_level}` }]);
        setNextId((id) => id + 1);
    };

    const results = useMemo(() => users.map((user) => {
        const slots = user.role_data.role_slots ?? [];
        const costs = user.role_data.role_costs ?? [];
        const dedicatedPools = initialDedicatedPools(user.role_data.role_materials ?? []);
        let universalPool = initialUniversalPool(user.role_data.role_materials ?? []);
        const virtualStates = new Map<number, RoleCost>();

        return entries.map((entry) => {
            const slot = slots.find((item) => item.mastery_id === entry.masteryId && item.enhance_level >= 0);
            const target = costs.find((item) => item.mastery_id === entry.masteryId && `${item.slot_level}-${item.enhance_level}` === entry.targetKey);
            if (!slot || !target) return { error: '该账号缺少此 mastery 数据', lines: [] as PlanLine[] };

            const start = virtualStates.get(entry.masteryId) ?? {
                mastery_id: entry.masteryId,
                slot_level: slot.slot_level,
                enhance_level: slot.enhance_level,
                num: 0,
            };
            const levelText = `${start.slot_level}-${start.enhance_level} → ${target.slot_level}-${target.enhance_level}`;
            if (stateOrder(target.slot_level, target.enhance_level) <= stateOrder(start.slot_level, start.enhance_level)) {
                return { alreadyReached: true, levelText, lines: [] as PlanLine[] };
            }

            const consumed = consumeRequirements(
                dedicatedPools[entry.masteryId] ?? {},
                universalPool,
                requirementsForTarget(costs, entry.masteryId, start, target),
            );
            const enough = consumed.lines.every((line) => line.shortfall === 0);
            if (!enough) {
                return { enough: false, levelText, lines: consumed.lines };
            }
            dedicatedPools[entry.masteryId] = consumed.dedicatedPool;
            universalPool = consumed.universalPool;
            virtualStates.set(entry.masteryId, target);
            return { enough: true, levelText, lines: consumed.lines };
        });
    }), [entries, users]);

    const updateEntry = (id: number, changes: Partial<PlanEntry>) => setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, ...changes } : entry));
    const moveEntry = (id: number, direction: -1 | 1) => setEntries((current) => {
        const index = current.findIndex((entry) => entry.id === id);
        const nextIndex = index + direction;
        if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
        const next = [...current];
        [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
        return next;
    });

    if (!masteryOptions.length) {
        return (
            <Box mt={4} p={4} rounded="lg" borderWidth="1px">
                <Heading size="sm" mb={2}>职能升级规划</Heading>
                <Text color="fg.muted">本次结果缺少升级规划数据。请重启更新后的 AutoPCR 服务端，再重新执行一次“查职能练度”。</Text>
            </Box>
        );
    }

    return (
        <Box mt={4} p={4} rounded="lg" borderWidth="1px">
            <Flex align="center" justify="space-between" gap={3} mb={3} wrap="wrap">
                <Box>
                    <Heading size="sm">职能升级规划</Heading>
                    <Text fontSize="sm" color="fg.muted">以下目标统一应用到所有账号；素材按各账号库存独立、按顺序结算。</Text>
                </Box>
                <button type="button" onClick={addEntry}>添加规划</button>
            </Flex>

            {!entries.length ? <Text color="fg.muted">点击“添加规划”后设置 mastery 与目标练度。</Text> : null}
            <Stack gap={3}>
                {entries.map((entry, index) => {
                    const option = masteryOptions.find((item) => item.masteryId === entry.masteryId) ?? masteryOptions[0];
                    return (
                        <Box key={entry.id} p={3} rounded="md" bg="bg.subtle">
                            <Flex gap={2} wrap="wrap" align="end">
                                <Text fontWeight="bold">#{index + 1}</Text>
                                <label>
                                    <Text fontSize="xs" mb={1}>职能槽位 / mastery</Text>
                                    <select value={entry.masteryId} onChange={(event) => {
                                        const nextOption = masteryOptions.find((item) => item.masteryId === Number(event.target.value));
                                        const nextTarget = nextOption?.targets[0];
                                        updateEntry(entry.id, { masteryId: Number(event.target.value), targetKey: nextTarget ? `${nextTarget.slot_level}-${nextTarget.enhance_level}` : '' });
                                    }}>
                                        {masteryOptions.map((item) => <option key={item.masteryId} value={item.masteryId}>{item.label}</option>)}
                                    </select>
                                </label>
                                <label>
                                    <Text fontSize="xs" mb={1}>目标练度</Text>
                                    <select value={entry.targetKey} onChange={(event) => updateEntry(entry.id, { targetKey: event.target.value })}>
                                        {option.targets.map((target) => <option key={`${target.slot_level}-${target.enhance_level}`} value={`${target.slot_level}-${target.enhance_level}`}>{target.slot_level}-{target.enhance_level}</option>)}
                                    </select>
                                </label>
                                <button type="button" onClick={() => moveEntry(entry.id, -1)} disabled={index === 0}>上移</button>
                                <button type="button" onClick={() => moveEntry(entry.id, 1)} disabled={index === entries.length - 1}>下移</button>
                                <button type="button" onClick={() => setEntries((current) => current.filter((item) => item.id !== entry.id))}>删除</button>
                            </Flex>
                        </Box>
                    );
                })}
            </Stack>

            {entries.length ? <Box mt={5}>
                <Heading size="sm" mb={3}>各账号规划结果</Heading>
                <Table.ScrollArea borderWidth="1px" rounded="md">
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader position="sticky" left={0} zIndex={1} bg="bg.subtle">账号</Table.ColumnHeader>
                                {entries.map((entry, index) => {
                                    const option = masteryOptions.find((item) => item.masteryId === entry.masteryId);
                                    return <Table.ColumnHeader key={entry.id} minW="190px">#{index + 1}<br />{option?.label} → {entry.targetKey}</Table.ColumnHeader>;
                                })}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {users.map((user, userIndex) => <Table.Row key={`${user.user_name}-${userIndex}`}>
                                <Table.Cell position="sticky" left={0} zIndex={1} bg="bg.subtle" fontWeight="bold">{user.user_name}</Table.Cell>
                                {(results[userIndex] ?? []).map((result, index) => {
                                    const shortfall = result.lines.reduce((sum, line) => sum + line.shortfall, 0);
                                    const universalUsed = result.lines.reduce((sum, line) => sum + line.universal, 0);
                                    return <Table.Cell key={entries[index].id} verticalAlign="top">
                                        {result.error ? <Text color="red.500" fontWeight="bold">{result.error}</Text> : null}
                                        {result.alreadyReached ? <Text color="green.500" fontWeight="bold">{result.levelText}（已达到目标）</Text> : null}
                                        {result.enough ? <Text color="green.500" fontWeight="bold">{result.levelText}（素材充足，使用全能素材 {universalUsed}）</Text> : null}
                                        {!result.error && !result.alreadyReached && !result.enough ? <Text color="red.500" fontWeight="bold">{result.levelText}（素材不足，缺少全能素材 {shortfall}）</Text> : null}
                                    </Table.Cell>;
                                })}
                            </Table.Row>)}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>
            </Box> : null}

            {false && entries.length ? <Stack mt={5} gap={3}>
                <Heading size="sm">各账号规划结果</Heading>
                {users.map((user, userIndex) => <Box key={`${user.user_name}-${userIndex}`} p={3} rounded="md" borderWidth="1px">
                    <Text fontWeight="bold" mb={2}>{user.user_name}</Text>
                    {(results[userIndex] ?? []).map((result, index) => (
                        <Box key={entries[index].id} mt={index ? 2 : 0}>
                            <Text fontWeight="bold">#{index + 1} · {result.error ? result.error : result.alreadyReached ? '已达到目标。' : result.enough ? '素材充足。' : '素材不足。'}</Text>
                            {result.lines.map((line) => <Text key={line.slotLevel} fontSize="sm" mt={1}>{line.slotLevel}级素材：需 {line.required}（普通素材使用 {line.dedicated}，全能素材使用 {line.universal}）{line.shortfall ? `，缺少 ${line.shortfall}` : ''}</Text>)}
                        </Box>
                    ))}
                </Box>)}
            </Stack> : null}
        </Box>
    );
}
