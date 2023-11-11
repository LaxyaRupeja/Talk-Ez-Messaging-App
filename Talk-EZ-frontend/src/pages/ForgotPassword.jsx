import React, { useState } from 'react';
import axios from 'axios';
import { Button, Divider, Input, Tooltip } from '@nextui-org/react';
import { BiArrowBack } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const nav = useNavigate();

    const handleSubmit = async () => {
        if (email == "") {
            toast.error('Email cannot be empty')
            return;
        }
        setIsLoading(true)
        try {
            const response = await axios.post('https://flawless-candy-turtle.glitch.me/user/forgot-password', { email });
            if (response.status === 200) {
                toast.success('Reset link has been sent. Check your email.');
                setIsLoading(false)
            }
            else {
                toast.error('Failed to send reset link')
                setIsLoading(false)
            }
        } catch (error) {
            toast.error('Failed to send reset link')
            setIsLoading(false)
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
                <h2 className="text-xl font-semibold text-center mb-6">Forgot Password</h2>
                <Divider className="my-4" />

                <div>
                    <div className="mb-4">
                        <Input
                            isClearable
                            type="email"
                            size="lg"
                            label="Email"
                            variant="bordered"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onClear={() => setEmail('')}
                            className="max-w-full"
                        />
                    </div>
                    <Button isLoading={isLoading} onClick={() => handleSubmit()} color="primary" className="w-full" size='lg'>
                        Submit
                    </Button>
                </div>
                {/* <Divider className="my-4" /> */}
            </div>
        </div>
    );
}

export default ForgotPassword;
