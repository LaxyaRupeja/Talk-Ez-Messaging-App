const socketIO = require('socket.io');
const Group = require('../Models/Group.model');
const Chat = require('../Models/Chat.model');
const socketGroupMap = {};
const typingUser = {};
function initSocket(server) {
    const io = socketIO(server);

    io.on('connection', (socket) => {
        console.log('A user connected');


        socket.on("join room", async (data) => {
            console.log("these are the typing user", typingUser)
            const { groupId } = data;
            const userId = socket.id;
            if (!groupId) return;
            if (socketGroupMap[userId]) {
                // Automatically leave the current group
                const currentGroup = socketGroupMap[userId];
                socket.leave(currentGroup);
                delete socketGroupMap[userId];
                if (typingUser[currentGroup]) {
                    console.log("it's working")
                    typingUser[currentGroup] = typingUser[currentGroup].filter(user => user.userId !== userId);
                    console.log(typingUser, "this is the typing user-2")
                }
            }
            socketGroupMap[userId] = groupId;
            // socket.join(groupId);
            socket.join(groupId);
            try {
                const group = await Group.findById(groupId).populate("messages").populate("members").populate("admin").populate({
                    path: 'messages',
                    populate: {
                        path: 'sender',
                        model: 'User' // Replace 'User' with the actual model name of your user
                    }
                });
                io.to(groupId).emit("chat message", { group: group })
                io.to(groupId).emit("typing", typingUser[groupId]);
            }
            catch (err) {
                io.to(groupId).emit("chat message", { group: {} })

            }

        })


        socket.on("chat message", async (data) => {
            const { content, group, userId } = data;
            const newMessage = new Chat({
                content,
                group,
                sender: userId
            })
            await newMessage.save();

            // Save Message Here
            const groupObj = await Group.findById(group)
            groupObj.messages.push(newMessage._id);
            await groupObj.save();
            const updatedGroup = await Group.findById(group).populate("messages").populate("members").populate("admin").populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                    model: 'User' // Replace 'User' with the actual model name of your user
                }
            });;
            // console.log(groupObj.messages)
            io.to(group).emit("chat message", { group: updatedGroup })
        })


        socket.on("typing", (data) => {
            console.log("typing even", typingUser)
            const { groupId, username } = data;
            if (typingUser[groupId]) {
                // Check if the user is not already in the array before pushing
                if (!typingUser[groupId].some(user => user.username === username)) {
                    typingUser[groupId].push({ username, userId: socket.id });
                }
            } else {
                typingUser[groupId] = [{ username, userId: socket.id }];
            }
            io.to(groupId).emit("typing", typingUser[groupId]);

        })

        socket.on("stop typing", (data) => {
            const { groupId, username } = data;
            if (typingUser[groupId]) {
                typingUser[groupId] = typingUser[groupId].filter(user => user.username !== username);
            }
            io.to(groupId).emit("typing", typingUser[groupId]);
        })

        socket.on('disconnect', () => {
            console.log('A user disconnected');
            for (let key in typingUser) {
                typingUser[key] = typingUser[key].filter(user => user.userId !== socket.id);
            }
        });

    });

    return io;
}

module.exports = initSocket;
