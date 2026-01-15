import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
} from '../../components/ui/modal'
import NiceModal, { useModal } from "@ebay/nice-modal-react";

import {
    Image,
} from '@chakra-ui/react'
import announcement from "@/assets/announcement.png"

const ReadmeModal = NiceModal.create(() => {
    const modal = useModal();
    return (
        <Modal blockScrollOnMount={false} size='lg' placement="center" closeOnOverlayClick={false} isOpen={modal.visible} onClose={async () => { modal.resolve(); await modal.hide(); }}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>使用须知</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Image src={announcement} alt="announcement" w="full" h="auto" maxH="60vh" objectFit="contain" />
                </ModalBody>
            </ModalContent>
        </Modal>
    )
})

export default ReadmeModal;
