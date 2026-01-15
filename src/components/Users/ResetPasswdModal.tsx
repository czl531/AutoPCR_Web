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

import { Field } from '../../components/ui/field'

interface ResetPasswdModal {
    password: string
    passwordRepeat: string
}

const resetPasswdModal = NiceModal.create(() => {
    const modal = useModal();
    const {
        handleSubmit,
        register,
        watch,
        formState: { isSubmitting, errors },
    } = useForm<ResetPasswdModal>()
    const password = watch("password");
    const handleResetPassword: SubmitHandler<ResetPasswdModal> = (values) => {
        modal.resolve(values.password);
    };
    return (
        <Modal closeOnOverlayClick={false} isOpen={modal.visible} onClose={modal.hide}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>重置密码</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <form onSubmit={handleSubmit(handleResetPassword)}>
                        <Stack gap={4}>
                            <Field invalid={!!errors.password} label="输入新密码" errorText={errors.password?.message}>
                                <Input type='password'
                                    placeholder='5位以上'
                                    {...register("password", {
                                        required: "请输入密码",
                                        minLength: { value: 5, message: "密码长度至少 5 位" },
                                    })} />
                            </Field>
                            <Field invalid={!!errors.passwordRepeat} label="再次输入新密码" errorText={errors.passwordRepeat?.message}>
                                <Input
                                    type="password"
                                    placeholder='与上面一致'
                                    {...register("passwordRepeat", {
                                        required: "请确认密码",
                                        validate: (value) => value === password || "两次输入的密码不一致",
                                    })}
                                />
                            </Field>
                            <Button
                                bg={'blue.400'}
                                color={'white'}
                                _hover={{
                                    bg: 'blue.500',
                                }}
                                loading={isSubmitting} type='submit'
                            >
                                重置密码
                            </Button>
                        </Stack>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal >
    )
})

export default resetPasswdModal;
