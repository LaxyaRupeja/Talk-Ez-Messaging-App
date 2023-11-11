import React, { useState } from 'react';
import axios from 'axios';
import { Button, Divider, Input, Tooltip } from '@nextui-org/react';
import { BiArrowBack } from 'react-icons/bi';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { EyeSlashFilledIcon } from '../components/EyeSlashFilledIcon';
import { EyeFilledIcon } from '../components/EyeFilledIcon';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [isVisible, setIsVisible] = React.useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const [isVisible2, setIsVisible2] = React.useState(false);
    const toggleVisibility2 = () => setIsVisible2(!isVisible2);
    const nav = useNavigate();
    const location = useLocation();
    const resetToken = new URLSearchParams(location.search).get('token');

    const handleSubmit = async () => {
        if (newPassword !== confirmPassword) {
            setPasswordsMatch(false);
            toast.error('Passwords do not match')
            return;
        }
        if (newPassword == "" || confirmPassword == "") {
            toast.error('Password cannot be empty')
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('https://flawless-candy-turtle.glitch.me/user/reset-password', {
                resetToken,
                newPassword,
            });
            if (response.status === 200) {
                toast.success('Password reset successful. You can now log in with your new password.');
                setIsLoading(false);
                // Redirect to the login page or any other appropriate page
                nav('/signup');
            } else {
                toast.error('Failed to reset password');
                setIsLoading(false);
            }
        } catch (error) {
            toast.error('Failed to reset password');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white rounded-xl shadow-md p-8 w-full sm:w-96">
                <div className="flex items-center gap-14">
                    <Tooltip size='lg' showArrow content="Go Back">
                        <Button onClick={() => nav("/signup")} isIconOnly color='primary' size='lg' variant='flat'>
                            <BiArrowBack />
                        </Button>
                    </Tooltip>
                    <h1 className="text-3xl font-bold text-center">Chatify</h1>
                </div>
                <Divider className="my-4" />
                <h2 className="text-xl font-semibold text-center mb-6">Reset Password</h2>
                <Divider className="my-4" />

                <div>
                    <div className="mb-4">
                        <Input
                            size="lg"
                            label="New Password"
                            variant="bordered"
                            placeholder="Enter your new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="max-w-full"
                            endContent={
                                <button className="focus:outline-none" type="button" onClick={toggleVisibility2}>
                                    {isVisible2 ? (
                                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                    ) : (
                                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                    )}
                                </button>
                            }
                            type={isVisible2 ? "text" : "password"}
                        />
                    </div>
                    <div className="mb-4">
                        <Input
                            size="lg"
                            label="Confirm Password"
                            variant="bordered"
                            placeholder="Re-enter your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="max-w-full"
                            endContent={
                                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                                    {isVisible ? (
                                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                    ) : (
                                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                    )}
                                </button>
                            }
                            type={isVisible ? "text" : "password"}
                        />
                        {!passwordsMatch && (
                            <p className="text-red-500">Passwords do not match.</p>
                        )}
                    </div>
                    <Button isLoading={isLoading} onClick={() => handleSubmit()} color="primary" className="w-full" size='lg'>
                        Reset Password
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
