import React, { useEffect, useState } from 'react'
import { TbMessageDots } from "react-icons/tb";
import { MdExitToApp } from "react-icons/md";
import { Avatar, Button, Divider, Dropdown, DropdownItem, Input, DropdownMenu, DropdownTrigger, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs, useDisclosure, Chip, Tooltip } from '@nextui-org/react';
import { AiOutlineUserAdd } from "react-icons/ai";
import { SearchIcon } from './SearchIcon';
import { toast } from 'sonner';
import { MdOutlineInsertPhoto } from "react-icons/md";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive'

export default function Sidebar({ setGroupId, currentGroupId, showMessage, setMainSection, setMessage, isMediumOrLargeScreen, selected, setSelected, groups, setGroups, fetchGroup, noGroupAvailable }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupMembers, setGroupMembers] = useState([]);
    const [inputValue, setInputValue] = React.useState('');
    const [groupName, setGroupName] = React.useState('');
    const [users, setUsers] = React.useState([]);
    const nav = useNavigate()
    const [filteredUsers, setFilteredUsers] = useState([]);
    const loggedInUser = JSON.parse(localStorage.getItem("user")) || null;
    useEffect(() => {

        async function fetchUsers() {
            const response = await fetch("https://flawless-candy-turtle.glitch.me/user/users");
            const data = await response.json();
            console.log(data);
            setUsers(data.users);
        }
        fetchUsers();
        fetchGroup();

    }, [])


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
        setGroupMembers([...groupMembers, user]);
    }

    const clearInputValue = () => {
        setInputValue('');
        setFilteredUsers([]);
    }
    const handleClose = (memberToRemoveId) => {
        console.log(memberToRemoveId)
        setGroupMembers(groupMembers.filter(member => member._id !== memberToRemoveId));
    };
    const handleCreateGroup = () => {

        if (!groupName) {
            toast.error('Group name is required');
            return;
        }
        if (groupMembers.length === 0) {
            toast.error('Please add atleast one member to group');
            return;
        }
        const token = localStorage.getItem('token');
        const group = {
            name: groupName,
            members: groupMembers.map(member => member._id)
        }
        console.log(group);
        fetch("https://flawless-candy-turtle.glitch.me/chat/group", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify(group)
        }).then((res) => {
            return res.json()
        }).then((data) => {
            console.log(data)
            fetchGroup(data.group._id, data.group.isGroup)
            onClose();
            toast.success(`${data.group.name} has been Created!!!`)
        }).error((err) => {
            toast.error("Something went wrong while creating group")
            console.log(err)
        })
    }
    const handleIndividualChatCreate = (memberId) => {
        const selfCheck = JSON.parse(localStorage.getItem("user"))
        if (selfCheck._id == memberId) {
            toast.error(`You cannot chat with yourself`);
            return;
        }
        const token = localStorage.getItem('token');
        fetch(`https://flawless-candy-turtle.glitch.me/chat/individual/${memberId}`, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "Authorization": token
            }
        }).then((res) => {
            return res.json()
        }).then((data) => {
            console.log(data)
            fetchGroup(data.group._id, data.group.isGroup)
            onClose();
            if (data.message == "Group already exits") {
                toast.error(`Chat already exists!!!`)
            }
            else {
                toast.success(`Chat has been Created!!!`)
            }
        }).error((err) => {
            toast.error("Something went wrong while creating group")
            console.log(err)
        })

    }
    const getOppositePerson = (arr) => {
        const [userA, userB] = arr;
        return userA.name === loggedInUser.name ? userB : userA;
    };

    const handleLogout = () => {
        localStorage.clear();
        toast.success('Logged out successfully!');
        nav('/signup');
    }
    const handleShowMessage = () => {
        if (!isMediumOrLargeScreen) {
            setMessage((prev) => !prev)
        }
        else {
            if (showMessage) {
                return;
            }
            setMessage((prev) => !prev)
            setMainSection(false)
        }
    }


    return (
        <div className='flex h-screen'>
            <div className="left flex flex-col  justify-between py-4 px-3">
                <div id="top" className='flex flex-col gap-3'>
                    <Tooltip size='lg' showArrow={true} content={!showMessage ? "Open Sidebar" : "Close Sidebar"}>
                        <Button onClick={handleShowMessage} variant='light' isIconOnly>
                            <TbMessageDots size={"40px"} color='#45474B' />
                        </Button>
                    </Tooltip>
                    {/* <MdExitToApp size={"40px"} color='#45474B' /> */}
                </div>
                <div id="bottom">
                    <Dropdown placement="bottom-end" backdrop='blur' showArrow>
                        <DropdownTrigger>
                            <Avatar
                                isBordered
                                as="button"
                                className="transition-transform"
                                showFallback
                                size="md"
                                src={loggedInUser ? loggedInUser.profileImage : "https://avatars.dicebear.com/api/avataaars/1.svg"}
                            />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem key="profile" className="h-14 gap-2">
                                <p className="font-semibold">Signed in as</p>
                                <p className="font-semibold">{loggedInUser ? loggedInUser.email : "You're not Logged In"}</p>
                            </DropdownItem>
                            <DropdownItem key="configurations" onClick={() => nav(`/user/${loggedInUser._id}`)}>My Profile</DropdownItem>
                            <DropdownItem onClick={() => {
                                window.open("https://forms.gle/8Wnn4HmJAABeNtwu7", "_blank")
                            }} key="help_and_feedback">Help & Feedback</DropdownItem>
                            <DropdownItem onClick={handleLogout} key="logout" color="danger">
                                Log Out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
            <Divider orientation='vertical' className='' />
            {
                showMessage && (
                    <div className={`right py-4 px-3 ${isMediumOrLargeScreen ? 'min-w-[80vw]' : 'min-w-[25vw]'}`}>
                        <div className="flex items-center justify-between pb-1">
                            <h1 className="text-4xl font-bold">Messages</h1>
                            <Tooltip size='lg' showArrow content={selected == "chats" ? "Start a Chat" : "Create a Group"}>
                                <Button isIconOnly onClick={onOpen} variant='light'>
                                    <AiOutlineUserAdd size={"40px"} className='cursor-pointer bg-gray-200 p-1 rounded-full text-zinc-600' />
                                </Button>
                            </Tooltip>
                        </div>
                        <Divider className='my-4' />

                        <Tabs size='lg' variant={"solid"} aria-label="Tabs variants" className=' font-semibold' selectedKey={selected}
                            onSelectionChange={setSelected}>
                            <Tab key="chats" title="Chats" />
                            <Tab key="groups" title="Groups" />
                        </Tabs>
                        <Divider className='my-4' />
                        <div className='flex flex-col gap-4'>
                            {!currentGroupId && <p className='text-xl font-semibold'>No {selected} available</p>}
                            {selected === "chats"
                                ? groups.filter((group) => !group.isGroup) // Filter non-group chats
                                    .map((group) => (
                                        <div
                                            onClick={() => {
                                                if (isMediumOrLargeScreen) {
                                                    setMainSection(true)
                                                    setMessage(false)
                                                }
                                                setGroupId(group._id)
                                            }}
                                            className={`flex items-center gap-2 ${isMediumOrLargeScreen ? 'max-w-[78vw]' : 'max-w-[23vw]'} cursor-pointer p-2 border  rounded-xl hover:bg-gray-100 shadow transition-all ${currentGroupId === group._id && 'bg-gray-100 border-blue-600 border-2'}`}
                                            key={group._id}
                                        >
                                            <Avatar src={`${getOppositePerson(group.members) ? getOppositePerson(group.members).profileImage : ''}`} showFallback size="md" />
                                            <div className='flex flex-col gap-1 max-w-[80%]'>
                                                <p className='text-xl font-semibold'>{getOppositePerson(group.members) ? getOppositePerson(group.members).name : ""}</p>
                                                {
                                                    group.messages.length ?
                                                        (<p className="text-sm truncate" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{
                                                            // check if this content starts with https and if true then display photo else .content
                                                            group.messages[group.messages.length - 1].content.startsWith("https") ? <div className='flex gap-1 items-center'><MdOutlineInsertPhoto size={"20px"} />Photo</div> : group.messages[group.messages.length - 1].content}</p>)
                                                        :
                                                        (<p className="text-sm truncate" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Started on {group.createdAt.split("T")[0]}</p>)

                                                }
                                            </div>
                                        </div>
                                    ))
                                : groups
                                    .filter((group) => group.isGroup) // Filter group chats
                                    .map((group) => (
                                        <div
                                            onClick={() => {
                                                if (isMediumOrLargeScreen) {
                                                    setMainSection(true)
                                                    setMessage(false)
                                                }
                                                setGroupId(group._id)
                                            }}
                                            className={`flex items-center gap-2 ${isMediumOrLargeScreen ? 'max-w-[78vw]' : 'max-w-[23vw]'} cursor-pointer p-2 border  rounded-xl hover:bg-gray-100 shadow transition-all ${currentGroupId === group._id && 'bg-gray-100 border-blue-600 border-2'}`}
                                            key={group._id}
                                        >
                                            <Avatar name={group.name} src={group.avatar} showFallback size="md" />
                                            <div className='flex flex-col gap-1 max-w-[80%]'>
                                                <p className='text-xl font-semibold'>{group.name}</p>
                                                {
                                                    group.messages.length ?
                                                        (<p className="text-sm truncate" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.messages[group.messages.length - 1].sender.name.split(" ")[0]} : {group.messages[group.messages.length - 1].content}</p>)
                                                        :
                                                        (<p className="text-sm truncate" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Created on {group.createdAt.split("T")[0]}</p>)

                                                }
                                            </div>
                                        </div>
                                    ))}

                        </div>
                    </div>
                )
            }

            {
                selected === "chats" ? (
                    <Modal backdrop={"blur"} isOpen={isOpen} onClose={onClose}>
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">Start a Chat</ModalHeader>
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
                                            <div className="flex items-center gap-3 w-[70%]">
                                                <Avatar showFallback isBordered radius="lg" src={user.profileImage} size='lg' />
                                                <div className='flex flex-col font-semibold overflow-hidden max-w-[calc(100% - 4.5rem)]'>
                                                    <p className='text-xl truncate text-ellipsis' style={{ textOverflow: 'ellipsis' }}>{user.name}</p>
                                                    <p className='text-gray-500 truncate text-ellipsis' style={{ textOverflow: 'ellipsis' }}>{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 w-[30%]">
                                                <Button onClick={() => handleIndividualChatCreate(user._id)} className='font-semibold mr-2' variant='flat' color='primary'>Start a Chat</Button>
                                            </div>
                                        </div>)
                                        )}
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="danger" variant="light" onPress={onClose}>
                                            Close
                                        </Button>

                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                ) : (
                    <Modal backdrop={"blur"} isOpen={isOpen} onClose={onClose}>
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">Create a Group</ModalHeader>
                                    <ModalBody>
                                        <Input
                                            isClearable
                                            type=''
                                            label="Group Name"
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                            size="lg"
                                            placeholder='Enter group name...'
                                        />
                                        <Divider />
                                        <h1 className="text-xl font-semibold">Add Members</h1>
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
                                        <Button color="primary" onPress={handleCreateGroup} className='font-semibold'>
                                            Create
                                        </Button>

                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                )

            }

        </div>
    )
}
