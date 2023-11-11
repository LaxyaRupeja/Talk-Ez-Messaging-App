import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react'
import React from 'react'
import { FiMoreHorizontal } from 'react-icons/fi'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
function GroupDropDown({ groupId, fetchGroup, currentGroup }) {

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const nav = useNavigate()
    const handleLeaveGroup = () => {
        const token = localStorage.getItem('token');
        const apiUrl = 'https://flawless-candy-turtle.glitch.me/chat/group/leave';
        axios.post(apiUrl, { groupId: groupId }, {
            headers: {
                'Authorization': `${token}` // Include the token in the request headers
            }
        })
            .then(response => {
                toast.success('Successfully left the group');
                fetchGroup();

            })
            .catch(error => {
                console.error('Error leaving group:', error);
                toast.error('Failed to leave the group');
            });
    };

    return (
        <>
            <Dropdown size='lg' className='font-semibold'>
                <DropdownTrigger>
                    <Button
                        variant="light"
                    >
                        <FiMoreHorizontal size={"40px"} />

                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="Action event example"
                    onAction={(key) => {
                        if (key == "leave") {
                            console.log("ASL:KDFJ")
                            onOpen()
                        }
                        else if (key == "view") {

                            nav(`/group/${groupId}`)
                        }
                    }}
                >
                    {currentGroup && currentGroup.isGroup && <DropdownItem key={`view`}>View Group</DropdownItem>}
                    <DropdownItem color='danger' key={`leave`}>Leave</DropdownItem>

                </DropdownMenu>
            </Dropdown >
            <Modal backdrop={"blur"} isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Confirm Leaving Group</ModalHeader>
                            <ModalBody>
                                <p>Leaving this group means you'll lose access to its content and activities, and you can't undo this action. Are you sure you want to leave?</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={() => {
                                    handleLeaveGroup();
                                    onClose();
                                }}>
                                    Leave Group
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

        </>
    )
}

export default GroupDropDown