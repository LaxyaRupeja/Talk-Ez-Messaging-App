import React, { useState } from "react";
import { EyeFilledIcon } from "../components/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../components/EyeSlashFilledIcon";
import {
    Button,
    Checkbox,
    Divider,
    Input,
    Tab,
    Tabs,
} from "@nextui-org/react";
import { Card, CardBody } from "@nextui-org/react";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const nav = useNavigate();
    const [emailLogin, setEmailLogin] = useState("");
    const [passwordLogin, setPasswordLogin] = useState("");
    const [isLoading, setIsLoading] = useState(false)
    const [selected, setSelected] = React.useState("login");
    const [isVisible, setIsVisible] = React.useState(false);
    const validateEmail = (value) =>
        value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const isInvalid = React.useMemo(() => {
        if (email === "") return false;

        return validateEmail(email) ? false : true;
    }, [email]);
    const isInvalidLogin = React.useMemo(() => {
        if (emailLogin === "") return false;

        return validateEmail(emailLogin) ? false : true;
    }, [emailLogin]);


    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        console.log("signup");
        const data = {
            name,
            email,
            password,
        };
        console.log(data);
        try {
            const response = await fetch("https://flawless-candy-turtle.glitch.me/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();
            console.log(responseData);
            setEmail("");
            setName("");
            setPassword("");
            if (responseData.token) {
                toast.success("Signup Successful")
                localStorage.setItem("user", JSON.stringify(responseData.user))
                localStorage.setItem("token", responseData.token)
                setIsLoading(false)
                nav("/")
            }
            else {
                toast.error("Signup Failed")
                setIsLoading(false)
            }


        } catch (error) {
            console.error(error);
            setIsLoading(false)
            toast.error("Signup Failed")
        }
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        console.log("login");
        const data = {
            email: emailLogin,
            password: passwordLogin,
        };
        console.log(data);
        try {
            const response = await fetch("https://flawless-candy-turtle.glitch.me/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();
            console.log(responseData);
            setEmailLogin("");
            setPasswordLogin("");
            if (responseData.token) {
                toast.success("Login Successful")
                localStorage.setItem("user", JSON.stringify(responseData.user))
                localStorage.setItem("token", responseData.token)
                setIsLoading(false)
                nav("/")
            }
            else {
                setIsLoading(false)
                toast.error("Login Failed")
            }


        } catch (error) {
            setIsLoading(false)
            console.error(error);
            toast.error("Login Failed")
        }
    };

    return (

        <Card className="max-w-md mx-auto my-5 mt-9 bg-white rounded-xl shadow shadow-slate-300">
            <h1 className="text-4xl text-center font-bold text-slate-800 pt-3">Talk-EZ</h1>
            <CardBody>
                <Tabs
                    fullWidth
                    size="lg"
                    aria-label="Tabs form"
                    selectedKey={selected}
                    onSelectionChange={setSelected}
                    className="font-semibold"
                >
                    <Tab key="login" title="Login">
                        <div className="">
                            <Button onClick={() => {
                                window.open("https://flawless-candy-turtle.glitch.me/auth/google", "_self")
                            }} startContent={
                                <img
                                    src="https://www.svgrepo.com/show/355037/google.svg"
                                    className="w-6 h-6"
                                    alt=""
                                />
                            } variant="light" className="w-full text-center py-6 my-3  flex space-x-2 items-center justify-center border-slate-200 rounded-xl  font-semibold text-slate-700 border-2  text-md focus:ring-blue-600 ">
                                {" "}
                                <span>Login with Google</span>
                            </Button>
                        </div>
                        <Divider className="my-4" />

                        <form onSubmit={(e) => handleLogin(e)} className="">
                            <div className="flex flex-col space-y-5">
                                <Input
                                    isClearable
                                    type="email"
                                    label="Email"
                                    variant="bordered"
                                    placeholder="Enter your email"
                                    value={emailLogin}
                                    isInvalid={isInvalidLogin}
                                    onValueChange={setEmailLogin}
                                    color={isInvalidLogin ? "danger" : "success"}
                                    errorMessage={isInvalidLogin && "Please enter a valid email"}
                                    size="lg"
                                    onClear={() => console.log("input cleared")}
                                    className=""
                                />

                                <Input
                                    label="Password"
                                    variant="bordered"
                                    value={passwordLogin}
                                    onValueChange={setPasswordLogin}
                                    placeholder="Enter your password"
                                    endContent={
                                        <button
                                            className="focus:outline-none"
                                            type="button"
                                            onClick={toggleVisibility}
                                        >
                                            {isVisible ? (
                                                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                            ) : (
                                                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                            )}
                                        </button>
                                    }
                                    type={isVisible ? "text" : "password"}
                                    size="lg"
                                />

                                <div className="flex flex-row justify-between">
                                    <Checkbox defaultSelected size="md" className="font-semibold">
                                        Remeber me
                                    </Checkbox>
                                    <div onClick={() => nav("/forgot-password")}>
                                        <a href="#" className="font-medium text-blue-600">
                                            Forgot Password?
                                        </a>
                                    </div>
                                </div>
                                <Button isLoading={isLoading} type="submit" color="primary" size="lg" className="font-semibold">
                                    Login
                                </Button>
                                <p className="text-center">
                                    Not registered yet?{" "}
                                    <a
                                        onClick={() => setSelected("sign-up")}
                                        href="#"
                                        className="text-blue-600 font-medium inline-flex space-x-1 items-center"
                                    >
                                        <span>Register now </span>
                                        <span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                        </span>
                                    </a>
                                </p>
                            </div>
                        </form>
                    </Tab>
                    <Tab key="sign-up" title="Sign up">



                        <div className="">
                            <Button onClick={() => {
                                window.open("https://flawless-candy-turtle.glitch.me/auth/google", "_self")
                            }} startContent={
                                <img
                                    src="https://www.svgrepo.com/show/355037/google.svg"
                                    className="w-6 h-6"
                                    alt=""
                                />
                            } variant="light" className="w-full text-center py-6 my-3  flex space-x-2 items-center justify-center border-slate-200 rounded-xl  font-semibold text-slate-700 border-2  text-md focus:ring-blue-600 ">
                                {" "}
                                <span>Signup with Google</span>
                            </Button>
                        </div>
                        <Divider className="my-4" />

                        <form className="" onSubmit={(e) => handleSignup(e)}>
                            <div className="flex flex-col space-y-5">
                                <Input
                                    isClearable
                                    type="text"
                                    value={name}
                                    onValueChange={setName}
                                    label="Name"
                                    variant="bordered"
                                    placeholder="Enter your name"
                                    size="lg"
                                    onClear={() => console.log("input cleared")}
                                    className=""
                                />
                                <Input
                                    isClearable
                                    type="email"
                                    label="Email"
                                    variant="bordered"
                                    placeholder="Enter your email"
                                    value={email}

                                    isInvalid={isInvalid}
                                    onValueChange={setEmail}
                                    color={isInvalid ? "danger" : "success"}
                                    errorMessage={isInvalid && "Please enter a valid email"}
                                    size="lg"
                                    onClear={() => console.log("input cleared")}
                                    className=""
                                />

                                <Input
                                    label="Password"
                                    variant="bordered"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    endContent={
                                        <button
                                            className="focus:outline-none"
                                            type="button"
                                            onClick={toggleVisibility}
                                        >
                                            {isVisible ? (
                                                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                            ) : (
                                                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                            )}
                                        </button>
                                    }
                                    type={isVisible ? "text" : "password"}
                                    size="lg"
                                />
                                <Button isLoading={isLoading} type="submit" color="primary" size="lg" className="font-semibold">
                                    Signup
                                </Button>
                                <p className="text-center">
                                    Already have an account?{" "}
                                    <a
                                        onClick={() => setSelected("login")}
                                        href="#"
                                        className="text-blue-600 font-medium inline-flex space-x-1 items-center"
                                    >
                                        <span>Login now </span>
                                        <span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                        </span>
                                    </a>
                                </p>
                            </div>
                        </form>
                    </Tab>
                </Tabs>
            </CardBody>
        </Card >
    );

}