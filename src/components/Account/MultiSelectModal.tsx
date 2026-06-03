import { Box, Button, Flex, Image, Input, Text } from '@chakra-ui/react';
import { Candidate, ConfigValue } from '@interfaces/Module';
import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from '../../components/ui/modal';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useRef, useState } from 'react';

import { IoClose } from 'react-icons/io5';

interface MultiSelectModalProps {
    candidates: Candidate[];
    value: ConfigValue[];
}

function normalizeSearchText(text: string) {
    return text.normalize('NFKC').toLowerCase().trim();
}

function candidateAliases(candidate: Candidate) {
    return [
        String(candidate.value),
        candidate.display,
        candidate.nickname,
        ...(candidate.tags ?? []),
    ]
        .filter((alias): alias is string => Boolean(alias))
        .map(normalizeSearchText)
        .filter(Boolean);
}

function parseCandidatesFromSearch(text: string, candidates: Candidate[]) {
    let input = normalizeSearchText(text);
    if (!input) return { values: [] as ConfigValue[], unknown: '' };

    const aliasMap = new Map<string, ConfigValue>();
    for (const candidate of candidates) {
        for (const alias of candidateAliases(candidate)) {
            if (!aliasMap.has(alias)) {
                aliasMap.set(alias, candidate.value);
            }
        }
    }

    const aliases = [...aliasMap.keys()].sort((a, b) => b.length - a.length);
    const values: ConfigValue[] = [];
    const unknown: string[] = [];

    while (input) {
        const alias = aliases.find((name) => input.startsWith(name));
        if (alias) {
            values.push(aliasMap.get(alias)!);
            input = input.slice(alias.length).trimStart();
        } else {
            unknown.push(input[0]);
            input = input.slice(1).trimStart();
        }
    }

    return { values: [...new Set(values)], unknown: unknown.join('') };
}

const multiSelectModal = NiceModal.create(({ candidates, value }: MultiSelectModalProps) => {
    const modal = useModal();

    const [selectedUnits, setSelectedUnits] = useState<ConfigValue[]>(value);
    const [availableUnits, setAvailableUnits] = useState<Candidate[]>(candidates.filter((u) => !value.includes(u.value)));
    const [searchAllText, setSearchAllText] = useState('');
    const [searchSelectedText, setSearchSelectedText] = useState('');
    const [draggedUnit, setDraggedUnit] = useState<ConfigValue | null>(null);

    const lastVisibleRef = useRef(false);

    if (modal.visible && !lastVisibleRef.current) {
        setSelectedUnits(value);
        setAvailableUnits(candidates.filter(u => !value.includes(u.value)));
        setSearchAllText('');
        setSearchSelectedText('');
    }

    lastVisibleRef.current = modal.visible;

    const handleAdd = (id: ConfigValue) => {
        if (!selectedUnits.includes(id)) {
            setSelectedUnits([...selectedUnits, id]);
            setAvailableUnits(availableUnits.filter((u) => u.value !== id));
        }
    };

    const handleAddMany = (ids: ConfigValue[]) => {
        const addIds = ids.filter((id) => !selectedUnits.includes(id));
        if (!addIds.length) return;

        setSelectedUnits([...selectedUnits, ...addIds]);
        setAvailableUnits(availableUnits.filter((u) => !addIds.includes(u.value)));
    };

    const handleRemove = (id: ConfigValue) => {
        setSelectedUnits(selectedUnits.filter(i => i !== id));
        const unit = candidates.find(u => u.value === id);
        if (unit) setAvailableUnits([...availableUnits, unit]);
    };

    const handleSave = () => {
        modal.resolve(selectedUnits);
        modal.hide();
    };

    const handleClose = () => {
        modal.resolve(undefined);
        modal.hide();
    };

    const moveUnit = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;

        const newSelectedUnits = [...selectedUnits];
        const [movedUnit] = newSelectedUnits.splice(fromIndex, 1);
        newSelectedUnits.splice(toIndex, 0, movedUnit);

        setSelectedUnits(newSelectedUnits);
    };

    const handleDragStart = (unitId: ConfigValue) => {
        setDraggedUnit(unitId);
    };

    const handleDragEnd = () => {
        setDraggedUnit(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedUnit === null) return;

        const sourceIndex = selectedUnits.indexOf(draggedUnit);
        if (sourceIndex !== -1) {
            moveUnit(sourceIndex, targetIndex);
        }
    };
    const handleClearAll = () => {
        setSelectedUnits([]);
        setAvailableUnits(candidates);
    };

    const parsedAvailableSearch = parseCandidatesFromSearch(searchAllText, candidates);
    const parsedSelectedSearch = parseCandidatesFromSearch(searchSelectedText, candidates);

    const isCandidateMatched = (u: Candidate, searchText: string, parsedValues: ConfigValue[]) => {
        if (!searchText) return true;
        if (parsedValues.includes(u.value)) return true;

        const normalizedSearchText = normalizeSearchText(searchText);
        return candidateAliases(u).some((alias) => alias.includes(normalizedSearchText));
    };

    const filteredAvailable = availableUnits.filter((u) => isCandidateMatched(u, searchAllText, parsedAvailableSearch.values));

    const selectedObjects = selectedUnits.map((id) => {
        const u = candidates.find((u) => u.value === id);
        return u ?? { value: id, display: String(id), tags: [] };
    });

    const filteredSelected = selectedObjects.filter((u) => isCandidateMatched(u, searchSelectedText, parsedSelectedSearch.values));

    const renderCandidateContent = (u: Candidate) => (
        <Flex alignItems="center" gap={2} minW={0}>
            {u.icon && (
                <Image
                    src={u.icon}
                    alt=""
                    boxSize="30px"
                    objectFit="contain"
                    flexShrink={0}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
            )}
            <Text as="span">{u.nickname ? u.nickname : u.display}</Text>
        </Flex>
    );

    return (
        <Modal isOpen={modal.visible} onClose={modal.hide} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>选择</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex gap={4}>
                        <Box flex={1}>
                            <Text mb={2}>未选择 ({availableUnits.length})</Text>
                            <Input placeholder="搜索" mb={2} value={searchAllText} onChange={(e) => setSearchAllText(e.target.value)} />
                            <Box maxH="55vh" overflowY="auto" p={2} borderRadius="md" borderWidth="1px" borderColor="border" bg="bg.panel">
                                <Flex mb={2} gap={2} wrap="wrap">
                                    <Button
                                        size="sm"
                                        colorPalette="green"
                                        onClick={() => {
                                            const allValues = filteredAvailable.map(u => u.value);
                                            setSelectedUnits([...new Set([...selectedUnits, ...allValues])]);
                                            setAvailableUnits(availableUnits.filter(u => !allValues.includes(u.value)));
                                        }}
                                    >
                                        全选
                                    </Button>
                                    {parsedAvailableSearch.values.length > 0 && (
                                        <Button
                                            size="sm"
                                            colorPalette="blue"
                                            onClick={() => handleAddMany(parsedAvailableSearch.values)}
                                        >
                                            添加识别 ({parsedAvailableSearch.values.length})
                                        </Button>
                                    )}
                                </Flex>
                                {filteredAvailable.map((u, id) => (
                                    <Box key={id} p={1} cursor="pointer" _hover={{ bg: "bg.subtle" }} onClick={() => handleAdd(u.value)}>
                                        {renderCandidateContent(u)}
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Box flex={1}>
                            <Text mb={2}>已选择 ({selectedUnits.length})</Text>
                            <Input placeholder="搜索" mb={2} value={searchSelectedText} onChange={(e) => setSearchSelectedText(e.target.value)} />
                            <Box maxH="55vh" overflowY="auto" p={2} borderRadius="md" borderWidth="1px" borderColor="border" bg="bg.panel">
                                <Flex mb={2} alignItems="center" justifyContent="space-between">
                                    <Text fontSize="xs" color="fg.muted">
                                        提示：拖拽可调整顺序
                                    </Text>
                                    <Button onClick={handleClearAll} size={'sm'} colorPalette="red">
                                        清空
                                    </Button>
                                </Flex>

                                {filteredSelected.map((u) => {
                                    const actualIndex = selectedUnits.indexOf(u.value);
                                    return (
                                        <Flex key={String(u.value)} alignItems="center" justifyContent="space-between" _hover={{ bg: "bg.subtle" }}>
                                            <Box
                                                p={1}
                                                cursor="grab"
                                                draggable
                                                onDragStart={() => handleDragStart(u.value)}
                                                onDragEnd={handleDragEnd}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, actualIndex)}
                                                flex={1}
                                                display="flex"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >
                                                {renderCandidateContent(u)}
                                                <Button variant="ghost" colorPalette="red" aria-label="移除" size="xs" onClick={() => handleRemove(u.value)} px={0}>
                                                    <IoClose />
                                                </Button>
                                            </Box>
                                        </Flex>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Flex>
                </ModalBody>

                <ModalFooter>
                    <Button onClick={handleSave} colorPalette="blue" mr={3}>
                        保存
                    </Button>
                    <Button variant="ghost" onClick={handleClose}>取消</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
});
NiceModal.register('multiSelectModal', multiSelectModal);
export default multiSelectModal;
