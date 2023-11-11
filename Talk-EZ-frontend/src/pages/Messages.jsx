import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, Tooltip, cn, useDisclosure } from '@nextui-org/react'
import { FiMoreHorizontal } from "react-icons/fi"
import { Input } from '@nextui-org/react'
import { IoSend } from "react-icons/io5";
import socketIO from 'socket.io-client';
const socket = socketIO.connect('https://flawless-candy-turtle.glitch.me', { transports: ["websocket"] });
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from "react-icons/bs";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { FaArrowDown } from "react-icons/fa";
import axios from 'axios'
import GroupDropDown from '../components/GroupDropDown'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CopyDocumentIcon } from '../components/CopyDocumentation'
import { EditDocumentIcon } from '../components/EditDocumentation'
import { DeleteDocumentIcon } from '../components/DeleteDocumentation'

const Messages = () => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const loggedInUser = JSON.parse(localStorage.getItem("user")) || null;
    const loggedInUserId = loggedInUser ? loggedInUser._id : null;
    const [isEmojiShow, setIsEmojiShow] = useState(false)
    const nav = useNavigate()
    const [noGroupAvailable, setNoGroupAvailable] = useState(false)
    // const loggedInUser = JSON.parse(localStorage.getItem("user"))
    const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";
    const [groupId, setGroupId] = useState("")
    const [content, setContent] = useState("")
    const [uploadedImageURL, setUploadedImageURL] = useState("")
    const [currentGroup, setCurrentGroup] = React.useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [groups, setGroups] = React.useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const scrollableDivRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showMainSection, setShowMainSection] = useState(true)
    const [showMessage, setShowMessage] = useState(true);
    const [isMessageEditing, setIsMessageEditing] = useState(false);
    const [isEditingMessageLoading, setIsEditingMessageLoading] = useState(false)
    const [editMessage, setEditMessage] = useState("");
    const [selected, setSelected] = React.useState("chats");
    const [updateMessageId, setUpdateMessageId] = useState("")
    const [isMediumOrLargeScreen, setIsMediumOrLargeScreen] = useState(
        window.innerWidth <= 768 // Adjust the breakpoint as needed
    );
    const scrollToBottom = () => {
        const scrollableDiv = scrollableDivRef.current;
        if (scrollableDiv) {
            scrollableDiv.scrollTop = scrollableDiv.scrollHeight - scrollableDiv.clientHeight;
        }
    };
    const handleFileChange = (event) => {
        // console.log(event.target.files[0])
        setSelectedFile(event.target.files[0]);
    };
    async function fetchGroup(defaultGroupId = null, defaultisGroup = null) {
        function checkToken() {
            const token = localStorage.getItem('token');
            if (!token) {
                nav('/signup')
            }
            fetch("https://flawless-candy-turtle.glitch.me/chat/checkToken", {
                headers: {
                    Authorization: `${token}`
                }
            }).then(res => res.json()).then(data => {
                if (!data.valid) {
                    nav('/signup')
                }
            })
        }
        checkToken();

        const token = localStorage.getItem('token');
        const response = await fetch("https://flawless-candy-turtle.glitch.me/chat/group", {
            headers: {
                Authorization: `${token}`
            }
        });
        const data = await response.json();
        console.log(data);
        setGroups(data.groups);
        if (defaultGroupId == null && defaultisGroup == null) {
            if (data.groups[0]) {
                setGroupId(data.groups[0]._id)
            }
            else {
                setGroupId("")
                setCurrentGroup(null)
            }
            if (data.groups.length == 0) {
                setNoGroupAvailable(true)
            }
            else {
                if (data.groups[0].isGroup) {
                    setSelected("groups")
                }
                else {
                    setSelected("chats")
                }
            }
        }
        else {
            setGroupId(defaultGroupId)
            if (defaultisGroup) {
                setSelected("groups")
            }
            else {
                setSelected("chats")
            }
        }
    }
    const handleFileUpload = async () => {
        setIsLoading(true)
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await axios.post('https://flawless-candy-turtle.glitch.me/user/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('File uploaded successfully. Image URL:', response.data.imageUrl);
            setUploadedImageURL(response.data.imageUrl)
            setIsLoading(false)
        } catch (error) {
            console.error('Error uploading file:', error);
            setIsLoading(false)
        }
    };
    useEffect(() => {
        // scrollToBottom();
        const user = localStorage.getItem("user")
        socket.off("chat message");
        // socket.off("typing");
        if (groupId) {
            socket.emit("join room", {
                groupId: groupId,
                userId: user._id
            })
        }

        socket.on("chat message", (data) => {
            console.log("sockets", data)
            setCurrentGroup(data.group)
            checkScrollPosition();
            scrollToBottom();

        })

        // scrollToBottom();
        const checkScrollPosition = () => {
            if (scrollableDivRef.current) {
                const div = scrollableDivRef.current;
                const isScrollable = div.scrollHeight > div.clientHeight;

                if (isScrollable) {
                    const isAtBottom = div.scrollTop + div.clientHeight === div.scrollHeight;
                    setIsAtBottom(isAtBottom);
                }
            }
        };
        checkScrollPosition();
        scrollToBottom();

    }, [groupId])


    const handleSendMessage = () => {
        if (!content) {
            toast.error("Please type something to send")
            return;
        }
        if (!groupId) {
            toast.error("Please select a group to send message")
            return;
        }
        socket.emit("chat message", {
            group: groupId,
            content,
            userId: loggedInUserId
        })
        setContent("");
    }
    const getOppositePerson = (arr) => {
        const [userA, userB] = arr;
        return userA._id === loggedInUserId ? userB : userA;
    }


    const handleEmojiClick = (emoji) => {
        // console.log(emoji)
        setContent((prev) => prev + emoji.emoji)
    };
    const sendTheUploadedFile = () => {
        if (!uploadedImageURL) return;
        if (!groupId) {
            toast.error("Please select a group to send message")
            return;
        };
        socket.emit("chat message", {
            group: groupId,
            content: uploadedImageURL,
            userId: loggedInUserId
        })
        // scrollToBottom();
        setUploadedImageURL("");

    }
    const handleMessageAction = (key, message) => {
        if (key === "copy") {
            navigator.clipboard.writeText(message.content)
            toast.success("Message copied")
        }
        else if (key === "edit") {
            setIsMessageEditing(true)
            setEditMessage(message.content)
            setUpdateMessageId(message._id)
        }
        else if (key === "delete") {
            // make a fetch request to delete to this route http://localhost:8080/chat/message/delete/<message._id>
            fetch(`https://flawless-candy-turtle.glitch.me/chat/message/delete/${message._id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => res.json()).then(data => {
                if (data.message == "Message deleted successfully") {
                    console.log(data)
                    toast.success("Message deleted successfully")
                    console.log(groupId, currentGroup.isGroup)
                    socket.emit("chat message", {
                        group: groupId,
                        content: "9$Kp3&Lw7*Qx1@Zv",
                        userId: loggedInUserId
                    })
                    fetchGroup(groupId, currentGroup.isGroup)
                }
                else {
                    toast.error("Message not deleted")
                }
            }).catch((error) => {
                toast.error("Message not deleted")
                console.log(error)
            })
        }
    }
    const handleUpdateChat = () => {
        if (!editMessage) {
            toast.error("Please type something to send")
            return;
        }
        if (!updateMessageId) {
            toast.error("Something went wrong")
            return;
        }
        if (!groupId) {
            toast.error("Please select a group to send message")
            return;
        }
        setIsEditingMessageLoading(true)
        fetch(`https://flawless-candy-turtle.glitch.me/chat/message/update/${updateMessageId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: editMessage
            })
        }).then(res => res.json()).then(data => {
            socket.emit("chat message", {
                group: groupId,
                content: "9$Kp3&Lw7*Qx1@Zv",
                userId: loggedInUserId
            })
            setIsMessageEditing(false)
            toast.success("Message updated successfully")
            fetchGroup(groupId, currentGroup.isGroup)
        }).catch((error) => {
            console.log(error)
            toast.error("Message not updated")
            setIsMessageEditing(false)
            setEditMessage("")
            setUpdateMessageId("")
            setIsEditingMessageLoading(false)
        })
    }

    return (
        <div className='flex'>
            <Sidebar setGroupId={setGroupId} currentGroupId={groupId} showMessage={showMessage} setMessage={setShowMessage} setMainSection={setShowMainSection} isMediumOrLargeScreen={isMediumOrLargeScreen} selected={selected} setSelected={setSelected} setGroups={setGroups} groups={groups} fetchGroup={fetchGroup} noGroupAvailable={noGroupAvailable} />
            {showMainSection && (
                <div className='w-full border-l h-screen overflow-hidden'>
                    <div className="top flex justify-between w-full py-3 px-4 border-b items-center min-h-[10vh]">
                        <div className='flex items-center gap-2'>
                            {currentGroup && getOppositePerson(currentGroup.members) ? (
                                <Avatar showFallback name={currentGroup.isGroup ? currentGroup.name : getOppositePerson(currentGroup.members).name} src={currentGroup.isGroup ? currentGroup.avatar : getOppositePerson(currentGroup.members).profileImage} size="md" />
                            ) : (
                                <Avatar showFallback name={"none"} src={""} size="md" />
                            )}

                            {currentGroup && getOppositePerson(currentGroup.members) ? (
                                <div className='flex flex-col'>
                                    <p className='text-xl font-semibold'>{currentGroup.isGroup ? currentGroup.name : getOppositePerson(currentGroup.members).name}</p>
                                    <p className='text-gray-600'>{currentGroup.isGroup ? `${currentGroup.members.length} Members` : ""}</p>
                                </div>
                            ) : (
                                <p className='text-gray-600'>Not Selected</p>
                            )}

                        </div>
                        <GroupDropDown groupId={groupId} fetchGroup={fetchGroup} currentGroup={currentGroup} />
                    </div>
                    <div className="bottom flex flex-col justify-between max-h-[88vh]">
                        <ScrollShadow ref={scrollableDivRef} className="chatsSection overflow-y-scroll flex flex-col p-3 min-h-[78vh] relative">

                            {currentGroup ?
                                currentGroup.messages.map((message) => (
                                    <div key={message._id} className={`chat ${loggedInUserId == (message.sender && message.sender._id) ? 'chat-end' : 'chat-start'}`}>
                                        <div className="chat-image avatar">
                                            <div className="w-10 rounded-full">
                                                <Avatar showFallback src={message.sender && message.sender.profileImage} />
                                            </div>
                                        </div>
                                        <Dropdown showArrow backdrop='blur' trigger='longPress'>
                                            <DropdownTrigger>
                                                <Button className='chat-bubble bg-blue-400 text-white flex flex-col h-auto items-start gap-0'>
                                                    <p className="text-sm font-semibold">{message.sender && message.sender.name}</p>
                                                    {message.content.startsWith("https://storage.googleapis.com/") ? <Image
                                                        isBlurred
                                                        width={240}
                                                        src={message.content}
                                                        alt="Error"
                                                        classNames="m-5"
                                                    /> : message.content}
                                                    <p className="text-xs">{new Date(message.timestamp).toLocaleTimeString()}</p>
                                                </Button>
                                            </DropdownTrigger>
                                            <DropdownMenu aria-label="Static Actions" variant="faded" onAction={(key) => {
                                                handleMessageAction(key, message)
                                            }}>
                                                <DropdownItem startContent={<CopyDocumentIcon className={iconClasses} />} description={`Copy this ${message.content.startsWith("https://storage.googleapis.com") ? "picture" : "message"}`} key="copy">Copy</DropdownItem>
                                                {loggedInUserId == (message.sender && message.sender._id) && !message.content.startsWith("https://storage.googleapis.com") && <DropdownItem startContent={<EditDocumentIcon className={iconClasses} />} description="Edit this message" key="edit">Edit</DropdownItem>}
                                                {loggedInUserId == (message.sender && message.sender._id) && <DropdownItem key="delete" className="text-danger" color="danger" description={`Delete this ${message.content.startsWith("https://storage.googleapis.com") ? "picture" : "message"}`} startContent={<DeleteDocumentIcon className={cn(iconClasses, "text-danger")} />}>
                                                    Delete
                                                </DropdownItem>}
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                ))
                                : (
                                    <div className="no-messages">No group selected</div>
                                )}
                        </ScrollShadow >
                        {!isAtBottom && <FaArrowDown onClick={scrollToBottom} className='absolute right-[37%] bottom-[60px] animate-bounce cursor-pointer text-blue-500 hover:text-blue-800 bg-zinc-300 hover:bg-zinc-500 p-2 rounded-full shadow border border-white' size={"42px"} />}


                        {!isMessageEditing ? < div className="sendMessage flex items-center gap-2 px-4">
                            <Tooltip size='lg' showArrow content="Upload a Image">
                                <Button onClick={() => onOpen()} variant='light' isIconOnly>
                                    <MdOutlineAddPhotoAlternate size={"35px"} className='text-gray-500' />
                                </Button>
                            </Tooltip>
                            {isEmojiShow && <div className="absolute top-[140px]">
                                <EmojiPicker width={"300px"} height={"400px"} emojiStyle={"native"} onEmojiClick={handleEmojiClick} />
                            </div>}
                            {
                                !isMediumOrLargeScreen && <BsEmojiSmile size={"30px"} className={`cursor-pointer hover:text-black ${isEmojiShow ? 'text-black' : 'text-zinc-500'}`} onClick={() => setIsEmojiShow((prev) => !prev)} />

                            }
                            <Input
                                isClearable
                                type="text"
                                size='lg'
                                variant="bordered"
                                placeholder="Type your message..."
                                color='primary'
                                value={content}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSendMessage()
                                    }
                                }}
                                defaultValue=""
                                onChange={(e) => setContent(e.target.value)}
                                onClear={() => setContent("")}
                            />
                            <IoSend onClick={handleSendMessage} size={"30px"} className='text-gray-500 hover:text-black' />
                        </div> : <div className="sendMessage flex items-center gap-2 px-4">

                            <Input
                                isClearable
                                type="text"
                                size='lg'
                                variant="bordered"
                                placeholder="Type your message..."
                                color='primary'
                                value={editMessage}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        console.log("enter")
                                        // handleSendMessage()
                                    }
                                }}
                                onChange={(e) => setEditMessage(e.target.value)}
                                onClear={() => setEditMessage("")}
                            />
                            <Button size='lg' isLoading={isEditingMessageLoading} onClick={handleUpdateChat} className='text-white font-semibold' color='success'>Save</Button>
                            <Button onClick={() => {
                                setIsMessageEditing(false)
                                setEditMessage("")
                                setUpdateMessageId("")
                            }} size='lg' variant='flat' color="danger">Cancel</Button>
                        </div>}

                    </div>
                </div>
            )
            }
            <Modal backdrop={"blur"} isOpen={isOpen} onClose={onClose} size='xl'>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Upload Image</ModalHeader>
                            <ModalBody>
                                <p className='text-zinc-700 font-semibold text-md'>Please upload the Image before clicking on send!</p>
                                <div className='flex gap-2'>
                                    <input onChange={handleFileChange} accept="image/*" type="file" className="file-input file-input-bordered file-input-primary w-full" />
                                    <Button color='primary' size='lg' variant='flat' isLoading={isLoading} onClick={handleFileUpload}>Upload</Button>
                                </div>
                                {uploadedImageURL && <Image
                                    isBlurred
                                    width={240}
                                    src={uploadedImageURL}
                                    alt="Error"
                                    classNames="m-5"
                                />}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button onClick={sendTheUploadedFile} color="primary" onPress={onClose}>
                                    Send
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

        </div >

    )
}

export default Messages