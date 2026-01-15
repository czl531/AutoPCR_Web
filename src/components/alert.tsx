import * as React from 'react'

import {
    Dialog as AlertDialog,
    Button,
    Portal,
} from '@chakra-ui/react'

interface AlertProps {
    title: string
    body: string
    onConfirm: () => void
    isOpen: boolean
    onClose: () => void
    leastDestructiveRef?: React.RefObject<any>
    children?: React.ReactNode
}

export default function Alert({ title, body, onConfirm, onClose, isOpen, leastDestructiveRef, children, ...rest }: AlertProps) {
    return (
        <AlertDialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} {...rest}>
            <Portal>
                <AlertDialog.Backdrop />
                <AlertDialog.Positioner>
                    <AlertDialog.Content>
                        <AlertDialog.Header fontSize='lg' fontWeight='bold'>
                            {title}
                        </AlertDialog.Header>

                        <AlertDialog.Body>
                            {body}
                            {children}
                        </AlertDialog.Body>

                        <AlertDialog.Footer>
                            <Button onClick={onClose}>
                                取消
                            </Button>
                            <Button colorPalette='red' onClick={onConfirm} ml={3}>
                                确认
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Content>
                </AlertDialog.Positioner>
            </Portal>
        </AlertDialog.Root>
    )
}
