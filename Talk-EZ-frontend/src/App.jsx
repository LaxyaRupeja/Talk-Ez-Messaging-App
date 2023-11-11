import { Route, Routes } from "react-router-dom"
import CardComp from "./components/Card"
import Signup from "./pages/Signup"
import { Toaster } from "sonner"
import Messages from "./pages/Messages"
import Profile from "./pages/Profile"
import GroupPage from "./pages/GroupPage"
import Callback from "./pages/Callback"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Testing from "./pages/Testing"

function App() {


  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/card" element={<CardComp />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/group/:id" element={<GroupPage />} />
        <Route path="/user/:id" element={<Profile />} />
        <Route path="/" element={<Messages />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/testing" element={<Testing />} />
      </Routes>
    </>
  )
}

export default App
