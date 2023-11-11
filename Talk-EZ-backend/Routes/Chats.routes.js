const express = require('express');
const authenticate = require('../Middleware/authMiddlware');
const Group = require('../Models/Group.model');
const Chat = require('../Models/Chat.model');
const ChatRouter = express.Router();


// Routes Start Here

ChatRouter.get("/", (req, res) => {
    res.send("Chat Router is working")
})

ChatRouter.get("/prot", authenticate, async (req, res) => {
    res.json({ data: "Very Protected Data" })
})



ChatRouter.get("/group", authenticate, async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user.userId }).populate('members').populate('admin').populate('messages').populate({
            path: 'messages',
            populate: {
                path: 'sender',
                model: 'User' // Replace 'User' with the actual model name of your user
            }
        });
        ;
        res.status(200).json({ groups });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while fetching the groups.", error });
    }
})


ChatRouter.post("/create", authenticate, async (req, res) => {
    try {
        const { content, group } = req.body;
        const newMessage = new Chat({
            sender: req.user.userId,
            content,
            group
        });
        await newMessage.save();
        await Group.findByIdAndUpdate(group, { $push: { messages: newMessage._id } });
        res.status(201).json({ message: "Message sent successfully", message: newMessage });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while sending the message.", error });
    }
})

ChatRouter.post("/individual/:member", authenticate, async (req, res) => {
    try {
        const { member } = req.params;
        const checkIfExitsAlready = await Group.findOne({ members: [req.user.userId, member] });
        if (checkIfExitsAlready) {
            return res.status(200).json({ message: "Group already exits", group: checkIfExitsAlready });
        }
        const newGroup = new Group({
            name: `Chat`,
            members: [req.user.userId, member],
            admin: req.user.userId,
            isGroup: false
        });
        await newGroup.save();
        res.status(201).json({ message: "Group created successfully", group: newGroup });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while creating the group.", error });
    }
})
ChatRouter.post("/group", authenticate, async (req, res) => {
    try {
        const { name, members } = req.body;
        const newGroup = new Group({
            name,
            members: [req.user.userId, ...members],
            admin: req.user.userId
        });
        await newGroup.save();
        res.status(201).json({ message: "Group created successfully", group: newGroup });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while creating the group.", error });
    }
})

ChatRouter.post("/group/leave", authenticate, async (req, res) => {
    try {
        const groupId = req.body.groupId; // Assuming you pass the group ID in the request body

        // Check if the user is a member of the group
        const group = await Group.findOne({ _id: groupId, members: req.user.userId });
        if (!group) {
            return res.status(404).json({ message: "Group not found or you are not a member of this group." });
        }
        if (group.admin.equals(req.user.userId)) {
            // The user leaving is the admin
            if (group.members.length === 1) {
                // If the admin is the only member, delete the group
                await Group.findByIdAndDelete(groupId);
                return res.status(200).json({ message: "You were the only member. Group deleted." });
            } else {
                // Assign the admin role to another member
                let newAdmin = group.members[0];
                if (newAdmin == req.user.userId) {
                    newAdmin = group.members[1];
                }
                await Group.findByIdAndUpdate(groupId, { admin: newAdmin });
            }
        }

        // Remove the user from the group's members array
        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { $pull: { members: req.user.userId } },
            { new: true }
        );

        res.status(200).json({ message: "You have left the group.", group: updatedGroup });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while leaving the group.", error });
    }
});
ChatRouter.get("/checkToken", authenticate, async (req, res) => {
    res.status(200).json({ message: "Token is valid", valid: true });
});

// make a get route that return a populated individual group by id
ChatRouter.get("/group/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        const group = await Group.findById(id).populate('members').populate('admin').populate('messages').populate({
            path: 'messages',
            populate: {
                path: 'sender',
                model: 'User' // Replace 'User' with the actual model name of your user
            }
        });
        res.status(200).json({ group });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while fetching the group.", error });
    }
})
// make a route to add the member to the group 
ChatRouter.post("/group/add/:groupId", authenticate, async (req, res) => {
    const { groupId, memberId } = req.params;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        if (group.members.includes(memberId)) {
            return res.status(400).json({ message: "Member already in group" });
        }
        group.members.push(memberId);
        await group.save();
        res.status(200).json({ message: "Member added to group successfully", group });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occurred while adding the member.", error });
    }
})
ChatRouter.post("/group/addMembers/:groupId", authenticate, async (req, res) => {
    const groupId = req.params.groupId;
    const { memberIds } = req.body; // Assuming you send an array of memberIds in the request body.
    // console.log(memberIds)

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Iterate through the array of memberIds and add them to the group.
        for (const memberId of memberIds) {
            if (group.members.includes(memberId)) {
                return res.status(400).json({ message: `Member ${memberId} is already in the group` });
            }
            group.members.push(memberId);
        }

        await group.save();
        res.status(200).json({ message: "Members added to group successfully", group });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occurred while adding the members.", error: err });
    }
});


// make a route to remove the member from the group
ChatRouter.post("/group/remove/:groupId/:memberId", authenticate, async (req, res) => {
    const { groupId, memberId } = req.params;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        if (!group.members.includes(memberId)) {
            return res.status(400).json({ message: "Member not found in group" });
        }
        group.members = group.members.filter(member => member.toString() !== memberId);
        await group.save();
        res.status(200).json({ message: "Member removed from group successfully", group });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while removing the member.", error });
    }
})


// make a route to update the avatar and name of the group

ChatRouter.patch("/group/update/:groupId", authenticate, async (req, res) => {
    const { groupId } = req.params;
    const { name, avatar } = req.body;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        if (name) {
            group.name = name;
        }
        if (avatar) {
            group.avatar = avatar;
        }
        await group.save();
        res.status(200).json({ message: "Group updated successfully", group });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while updating the group.", error });
    }
})




module.exports = ChatRouter;