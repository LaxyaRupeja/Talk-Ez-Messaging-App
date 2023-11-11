import React, { useEffect, useState } from 'react';
import { FaUser, FaEdit, FaCamera, FaSave, FaTimes, FaKey } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, Button, Divider, Image, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, useDisclosure } from '@nextui-org/react';
import axios from 'axios';
import { BiArrowBack } from "react-icons/bi";
function Profile() {
    const { id } = useParams();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isNameLoading, setIsNameLoading] = useState(false);
    const [uploadedImageURL, setUploadedImageURL] = useState("")
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const nav = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState({
        name: '',
        email: '',
        profilePicture: '',
        password: '',
    });
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isImageLoading, setIsImageLoading] = useState(false)
    const [isEditingName, setIsEditingName] = useState(false);

    function getUser() {
        fetch(`https://flawless-candy-turtle.glitch.me/user/user/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setUser(data.user);
                setName(data.user.name);
            });
    }

    useEffect(() => {
        getUser();
    }, []);

    const handleChangeName = () => {
        if (!name) {
            toast.error('Name cannot be empty');
            return;
        }
        setIsNameLoading(true);

        fetch(`https://flawless-candy-turtle.glitch.me/user/update/user/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                localStorage.setItem('user', JSON.stringify(data.user));
                getUser();
                toast.success('Name updated successfully');
                setIsNameLoading(false);
            })
            .catch((err) => {
                toast.error('Something went wrong');
                setIsNameLoading(false);
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
        } catch (error) {
            console.error('Error uploading file:', error);
            setIsLoading(false)
        }
    };
    const handleFileChange = (event) => {
        // console.log(event.target.files[0])
        setSelectedFile(event.target.files[0]);
    };
    const handleChangePassword = () => {
        if (!oldPassword || !newPassword) {
            toast.error('Please fill in both old and new passwords');
            return;
        }
        setIsPasswordLoading(true);

        fetch(`https://flawless-candy-turtle.glitch.me/user/update_password/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                oldPassword,
                newPassword,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                toast.success('Password updated successfully');
                setIsPasswordLoading(false);
                // Clear input fields
                setOldPassword('');
                setNewPassword('');
            })
            .catch((err) => {
                toast.error('Failed to update password');
                setIsPasswordLoading(false);
            });
    };
    const handleProfileChange = () => {
        if (!uploadedImageURL) {
            toast.error("Please upload an image")
            return
        }

        setIsImageLoading(true)

        fetch(`https://flawless-candy-turtle.glitch.me/user/update/user/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                profileImage: uploadedImageURL,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                localStorage.setItem('user', JSON.stringify(data.user));
                getUser();
                toast.success('Profile updated successfully');
                setIsImageLoading(false);
            })
            .catch((err) => {
                toast.error('Something went wrong');
                setIsImageLoading(false);
            });


    }

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100 flex-col gap-2">
            <div className="flex justify-center items-center bg-gray-100 flex-col">
            </div>
            {!isChangingPassword && <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4 bg-white shadow-lg rounded-lg p-6 text-center space-y-3">
                <div className="flex gap-12">
                    <Tooltip content="Go Back">
                        <Button onClick={() => nav("/")} isIconOnly color='primary' size='lg' variant='flat'>
                            <BiArrowBack />
                        </Button>
                    </Tooltip>
                    <h1 className="text-4xl font-semibold">Profile</h1>
                </div>
                <Divider className="my-4" />
                <div className="flex justify-center items-center flex-col gap-3">
                    <Avatar
                        src={user.profileImage}
                        className="w-40 h-40 text-large"
                        crossOrigin="anonymous"
                    />
                    <Button
                        variant="flat"
                        color="primary"
                        className="font-semibold"
                        startContent={<FaCamera />}
                        size="lg"
                        onClick={() => onOpen()}
                    >
                        Change Picture
                    </Button>
                </div>
                <h1 className="text-xl font-semibold">
                    {isEditingName ? (
                        <Input
                            type="text"
                            label="Name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            size="lg"
                        />
                    ) : (
                        `${user.name}`
                    )}
                </h1>
                <div className="flex justify-center gap-2">
                    {isEditingName ? (
                        <>
                            <Button
                                color="primary"
                                className="bg-green-500 hover:bg-green-600"
                                size="lg"
                                startContent={<FaSave />}
                                onClick={handleChangeName}
                                isLoading={isNameLoading}
                            >
                                Save
                            </Button>
                            <Button
                                variant="faded"
                                size="lg"
                                startContent={<FaTimes />}
                                onClick={() => setIsEditingName(false)}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            color="primary"
                            className="bg-blue-500 hover:bg-blue-600"
                            size="lg"
                            startContent={<FaEdit />}
                            onClick={() => setIsEditingName((prev) => !prev)}
                        >
                            Edit Name
                        </Button>
                    )}
                </div>
                {!isEditingName && (
                    <div className="flex justify-center gap-2">
                        <Button
                            color="danger"
                            size="lg"
                            startContent={<FaKey />}
                            onClick={() => setIsChangingPassword(true)}
                        >
                            Change Password
                        </Button>
                    </div>
                )}
            </div>}
            {isChangingPassword && (
                <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4 bg-white shadow-lg rounded-lg p-6 text-center space-y-3">
                    <h1 className="text-xl font-semibold">Change Password</h1>
                    <Input
                        type="password"
                        label="Old Password"
                        name="oldPassword"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        size="lg"
                    />
                    <Input
                        type="password"
                        label="New Password"
                        name="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        size="lg"
                    />
                    <div className="flex justify-center gap-2">
                        <Button
                            color="primary"
                            className="bg-green-500 hover:bg-green-600"
                            size="lg"
                            startContent={<FaSave />}
                            onClick={handleChangePassword}
                            isLoading={isPasswordLoading}
                        >
                            Save Password
                        </Button>
                        <Button
                            variant="faded"
                            size="lg"
                            startContent={<FaTimes />}
                            onClick={() => setIsChangingPassword(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

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
}

export default Profile;
