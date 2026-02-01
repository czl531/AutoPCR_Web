import {
    Button,
    Stack,
    Textarea,
} from '@chakra-ui/react'
import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
} from '../../components/ui/modal'
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { SubmitHandler, useForm } from 'react-hook-form';

import { AxiosError } from 'axios';
import { Field } from '../../components/ui/field'
import { putClanForbid } from '@/api/Account';
import { toaster } from '../../components/ui/toaster'

interface ClanForbid {
    accs: string;
}

const clanForbid = NiceModal.create(({ accs }: { accs: string }) => {
    const modal = useModal();
    const {
        handleSubmit,
        register,
        formState: { isSubmitting },
    } = useForm<ClanForbid>()
    const handleCreateUser: SubmitHandler<ClanForbid> = (values) => {
        putClanForbid(values.accs).then(async (res) => {
            toaster.create({ type: 'success', title: '创建会战禁用成功', description: res });
            modal.resolve();
            await modal.hide();
        }).catch((err: AxiosError) => {
            toaster.create({ type: 'error', title: '创建会战禁用失败', description: err?.response?.data as string || '网络错误' });
        });
    }
    return (
        <Modal closeOnOverlayClick={false} isOpen={modal.visible} onClose={modal.hide}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>设置会战禁用</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <form onSubmit={handleSubmit(handleCreateUser)}>
                        <Stack gap={4}>
                            <Field required>
                                <Textarea {...register('accs')}
                                    placeholder="禁用账号（是游戏账号噢）"
                                    h="50vh"
                                    defaultValue={accs}
                                    size="md"
                                />
                            </Field>
                            <Button
                                colorPalette="brand"
                                loading={isSubmitting} type='submit'
                            >
                                提交
                            </Button>
                        </Stack>
                    </form>
                </ModalBody>

            </ModalContent>
        </Modal >
    )
})

export default clanForbid;
