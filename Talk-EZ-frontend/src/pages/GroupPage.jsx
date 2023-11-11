import { Avatar, Button, Divider, Image, User, Input, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { FaUser, FaUserPlus, FaUserMinus, FaArrowUp, FaArrowLeft, FaEdit } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import AddMember from '../components/AddMember';
import axios from 'axios';
import { toast } from 'sonner';


const GroupPage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [group, setGroup] = useState(null)
    const { id } = useParams();
    const nav = useNavigate();
    const [uploadedImageURL, setUploadedImageURL] = useState("")
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false)
    const [isNameLoading, setIsNameLoading] = useState(false)
    const [groupName, setGroupName] = useState("");
    const [isImageLoading, setIsImageLoading] = useState(false)


    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(true);

    const handleAddMember = () => {
        // Implement your logic to add a new member to the group
    };

    const handlePromoteToAdmin = (memberId) => {
        // Implement your logic to promote a member to admin
    };

    const handleChangeName = () => {
        if (!groupName) {
            toast.error("Please enter a name")
            return
        }
        if (groupName === group.name) {
            toast.error("Please enter a different name")
            return
        }
        setIsNameLoading(true)
        fetch(`https://flawless-candy-turtle.glitch.me/chat/group/update/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                name: groupName,
            }),
        }).then((res) => res.json()).then((data) => {
            toast.success('Group Name updated successfully');
            fetchGroup();
            setIsNameLoading(false)
        }).catch((err) => {
            toast.error('Something went wrong');
            setIsNameLoading(false)
        })
    }
    const handleLeaveGroup = () => {
        const token = localStorage.getItem('token');
        const apiUrl = 'https://flawless-candy-turtle.glitch.me/chat/group/leave';
        axios.post(apiUrl, { groupId: id }, {
            headers: {
                'Authorization': `${token}` // Include the token in the request headers
            }
        })
            .then(response => {
                toast.success('Successfully left the group');
                nav("/")
            })
            .catch(error => {
                toast.error('Failed to leave the group');
                console.error('Error leaving group:', error);
                // alert('Failed to leave the group');
            });
    };
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
            setIsEditing(false)
        } catch (error) {
            console.error('Error uploading file:', error);
            setIsLoading(false)
        }
    };
    const handleFileChange = (event) => {
        // console.log(event.target.files[0])
        setSelectedFile(event.target.files[0]);
    };
    const handleProfileChange = () => {
        if (!uploadedImageURL) {
            toast.error("Please upload an image")
            return
        }

        setIsImageLoading(true)

        fetch(`https://flawless-candy-turtle.glitch.me/chat/group/update/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                avatar: uploadedImageURL,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                toast.success('Group Profile updated successfully');
                fetchGroup();
                setIsImageLoading(false);

            })
            .catch((err) => {
                toast.error('Something went wrong');
                setIsImageLoading(false);
            });


    }
    function fetchGroup() {
        fetch(`https://flawless-candy-turtle.glitch.me/chat/group/${id}`, {
            headers: {
                Authorization: `${localStorage.getItem("token")}`
            }
        }).then(res => res.json()).then(data => {
            console.log(data.group)
            setGroup(data.group)
            setGroupName(data.group.name)
        }).catch(err => console.log(err))
    }

    useEffect(() => {

        fetchGroup();

    }, [id])


    return (
        <div className="bg-gray-100 min-h-screen">
            {group && <div className="bg-white rounded-lg p-4 px-8 shadow-md flex flex-col">
                <div className="flex items-center justify-between">
                    <Button onClick={() => nav("/")} startContent={
                        <FaArrowLeft />
                    }
                        color='primary'>
                        Go Back
                    </Button>
                    <Button onClick={handleLeaveGroup} color='danger' variant='flat'>
                        Leave Group
                    </Button>
                </div>
                <Divider className='my-4' />

                <div className="flex items-center justify-center flex-col gap-2">
                    <Avatar src={group.avatar} alt="Group Image" showFallback size='lg' className='w-48 h-48' />
                    <Button variant='flat' size='lg' onClick={() => onOpen()} color='primary'>Change Picture</Button>
                    {isEditing ?
                        <div className="flex items-center justify-center gap-2 flex-col">
                            <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} className='text-3xl font-semibold' size='lg' />
                            <div className="flex items-center gap-2">
                                <Button className='text-white font-semibold' color='success' isLoading={isNameLoading} onClick={handleChangeName}>Save</Button>
                                <Button className='font-semibold' variant='flat' onClick={() => setIsEditing(false)}>Cancel</Button>
                            </div>
                        </div>
                        : <div className="flex items-center gap-1 mt-4"><h1 className="text-3xl font-bold text-black">{group.name}</h1><Tooltip content="Edit Name"><Button onClick={() => setIsEditing(true)} variant='light' isIconOnly><FaEdit className='font-normal text-blue-600' size={"24px"} /></Button></Tooltip></div>}
                </div>
                <Divider className='my-4' />
                <AddMember id={id} alreadyAddedMembers={group.members} fetchGroup={fetchGroup} />

                <Divider className='my-4' />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {group.members.map((member) => (
                        <div key={member._id} className="bg-white rounded-lg p-4 shadow-md border border-blue-600">
                            <User
                                className='font-semibold'
                                name={(
                                    <p className='text-lg'>{member.name}</p>
                                )}
                                description={(
                                    <p className='text-base'>{member.email}</p>
                                )}
                                avatarProps={{
                                    src: "https://i.pravatar.cc/150?u=a04258114e29026702d"
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>}
            <Modal backdrop={"blur"} isOpen={isOpen} onClose={onClose} size='xl'>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Upload Image</ModalHeader>
                            <ModalBody>
                                <p className='text-zinc-700 font-semibold text-md'>Please upload the Image before clicking on Change!</p>
                                <div className='flex gap-2'>
                                    <input onChange={handleFileChange} accept="image/*" type="file" className="file-input file-input-bordered file-input-primary w-full" />
                                    <Button color='primary' size='lg' variant='flat' isLoading={isLoading} onClick={handleFileUpload}>Upload</Button>
                                </div>
                                {uploadedImageURL && <Image
                                    isBlurred
                                    width={240}
                                    src={uploadedImageURL}
                                    alt="Error"
                                    className="m-5"
                                />}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button onClick={handleProfileChange} color="primary" onPress={onClose}>
                                    Change
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default GroupPage;
