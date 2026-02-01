import {
    Button,
    Input,
    Stack,
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
import { postUser, useUserRole } from '@/api/Account';

import { AxiosError } from 'axios';
import { Checkbox } from '../../components/ui/checkbox'
import { Field } from '../../components/ui/field'
import { toaster } from '../../components/ui/toaster'

interface CreateUserProps {
    qq: string
    password: string
    clan: boolean
    disabled: boolean
    admin: boolean
}

const createUserModal = NiceModal.create(() => {
    const role = useUserRole();
    const modal = useModal();
    const {
        handleSubmit,
        register,
        formState: { isSubmitting, errors },
    } = useForm<CreateUserProps>()
    const handleCreateUser: SubmitHandler<CreateUserProps> = (values) => {
        postUser(values.qq, values).then(async (res) => {
            toaster.create({ type: 'success', title: '创建用户成功', description: res });
            modal.resolve();
            await modal.hide();
        }).catch((err: AxiosError) => {
            toaster.create({ type: 'error', title: '创建用户失败', description: err?.response?.data as string || '网络错误' });
        });
    }
    return (
        <Modal closeOnOverlayClick={false} isOpen={modal.visible} onClose={modal.hide}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>创建用户</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <form onSubmit={handleSubmit(handleCreateUser)}>
                        <Stack gap={4}>
                            <Field invalid={!!errors.qq} label="QQ" errorText={errors.qq?.message}>
                                <Input type='text'
                                    {...register("qq", {
                                        required: "QQ 不能为空",
                                        minLength: { value: 5, message: "QQ号长度至少 5 位" },
                                    })}
                                    placeholder='5位以上'
                                />
                            </Field>

                            <Field invalid={!!errors.password} label="密码" errorText={errors.password?.message}>
                                <Input type='password'
                                    {...register("password", {
                                        required: "请输入密码",
                                        minLength: { value: 5, message: "密码长度至少 5 位" },
                                    })}
                                    placeholder='请输入密码'
                                />
                            </Field>
                            <Field>
                                <Checkbox inputProps={register('clan')} >公会管理</Checkbox>
                            </Field>
                            <Field>
                                <Checkbox inputProps={register('disabled')} >禁用</Checkbox>
                            </Field>
                            {role?.super_user &&
                                <Field>
                                    <Checkbox inputProps={register('admin')} >管理员</Checkbox>
                                </Field>
                            }
                            <Button
                                colorPalette="brand"
                                loading={isSubmitting} type='submit'
                            >
                                创建
                            </Button>
                        </Stack>
                    </form>
                </ModalBody>

            </ModalContent>
        </Modal >
    )
})

export default createUserModal;
