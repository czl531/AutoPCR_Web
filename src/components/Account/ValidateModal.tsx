import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
} from '../../components/ui/modal'
import NiceModal, { useModal } from "@ebay/nice-modal-react";

import Validate from './Validate';

export interface ValidateModalProps {
    alias: string;
    id: string;
    userid: string;
    gt: string;
    challenge: string;
}

const ValidateModal = NiceModal.create(({ alias, id, userid, gt, challenge }: ValidateModalProps) => {
    const modal = useModal();
    return (
        <Modal closeOnOverlayClick={false} isOpen={modal.visible} onClose={modal.hide}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{alias}验证码</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Validate id={id} userid={userid} gt={gt} challenge={challenge} onClose={modal.hide} />
                </ModalBody>

            </ModalContent>
        </Modal>
    )
})

export default ValidateModal;

