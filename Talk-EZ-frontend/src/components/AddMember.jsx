/* eslint-disable react/prop-types */
import { Avatar, Button, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import { SearchIcon } from './SearchIcon';
import { toast } from 'sonner';

function AddMember({ alreadyAddedMembers, id, fetchGroup }) {
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [groupMembers, setGroupMembers] = useState([]);
    const [users, setUsers] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [inputValue, setInputValue] = useState("")

    const onInputChangeHandle = (e) => {
        const input = e.target.value;
        setInputValue(input);
        const regexPattern = new RegExp(input, 'i')
        if (input.length >= 3 && !/^\.*$/.test(input)) {
            const filtered = users.filter(user => regexPattern.test(user.name));
            setFilteredUsers(filtered);
        }
        else {
            setFilteredUsers([]);
        }

    }
    useEffect(() => {
        async function fetchUsers() {
            const response = await fetch("https://flawless-candy-turtle.glitch.me/user/users");
            const data = await response.json();
            console.log(data);
            setUsers(data.users);
        }
        fetchUsers();
    }, [])
    const clearInputValue = () => {
        setInputValue('');
        setFilteredUsers([]);
    }
    const handleClose = (memberToRemoveId) => {
        console.log(memberToRemoveId)
        // eslint-disable-next-line react/prop-types
        setGroupMembers(groupMembers.filter(member => member._id !== memberToRemoveId));

    };
    const addMember = (user) => {
        const isExistsUser = groupMembers.find(member => member._id === user._id);
        if (isExistsUser) {
            toast.error('User already added to group');
            return;
        }
        const selfCheck = JSON.parse(localStorage.getItem("user"))
        if (user._id == selfCheck._id) {
            toast.error(`You cannot add yourself to the group`);
            return;
        }
        const alreadyAdded = alreadyAddedMembers.find(member => member._id === user._id);
        if (alreadyAdded) {
            toast.error(`${user.name} is already added to the group`);
            return;
        }
        setGroupMembers([...groupMembers, user]);
    }

    //make a fuciton to add a members to the group that send a post request to http://locahost:8080/chat/group/addMembers/:id and pass members id's as an array
    const addMembersToGroup = async () => {
        if (groupMembers.length == 0) {
            toast.error('Please add some members to the group');
            return;
        }
        const memberIds = groupMembers.map(member => member._id);
        fetch(`https://flawless-candy-turtle.glitch.me/chat/group/addMembers/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ memberIds })
        }).then(res => res.json()).then(data => {
            if (data.group) {
                toast.success('Members added to the group');
                fetchGroup();
                onClose();
            }
            else {
                toast.error('Something went wrong');
            }

        })


    }

    return (
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-black">Members</h2>
            <Button onClick={() => onOpen()} color='primary' variant='solid' size='lg'>Add Member</Button>
            <Modal backdrop={"blur"} isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Add a Member</ModalHeader>
                            <ModalBody>
                                <Input
                                    isClearable
                                    label="Search by username"
                                    placeholder="Type to search... eg-: Laxya"
                                    size='lg'
                                    value={inputValue}
                                    onClear={clearInputValue}
                                    onChange={e => onInputChangeHandle(e)}
                                    startContent={
                                        <SearchIcon className="text-black/50 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                                    }
                                />
                                {filteredUsers.map((user) =>

                                (<div key={user._id} className='flex items-center border-2 p-4 rounded-xl justify-between'>
                                    <div className="flex items-center gap-3">
                                        <Avatar showFallback isBordered radius="lg" src={user.profileImage} size='lg' />
                                        <div className='flex flex-col font-semibold'>
                                            <p className='text-xl'>{user.name}</p>
                                            <p className='text-gray-500'>{user.email}</p>
                                        </div>
                                    </div>
                                    <Button className='font-semibold' variant='flat' color='primary' onClick={() => addMember(user)}>Add</Button>
                                </div>
                                )
                                )}
                                <div className='flex flex-col gap-2'>
                                    <Divider className='' />
                                    <p className='text-xl font-semibold'>{groupMembers.length > 0 && "Members"}</p>
                                    <div className=''>
                                        {
                                            // eslint-disable-next-line react/prop-types
                                            groupMembers.map((member) =>
                                                <Chip
                                                    key={member._id}
                                                    className='my-2'
                                                    variant='bordered'
                                                    size='lg'
                                                    onClose={() => { handleClose(member._id) }}
                                                >
                                                    {member.name}
                                                </Chip>
                                            )

                                        }</div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose} className='font-semibold'>
                                    Close
                                </Button>
                                <Button color="primary" onPress={addMembersToGroup} className='font-semibold'>
                                    Add
                                </Button>

                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}

export default AddMember