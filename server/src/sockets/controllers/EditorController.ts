import { Socket } from "socket.io";
import { IEditorService } from "../services/interface/IEditorService";
import { JoinProjectData, leaveProjectData, updateCodeData, updateRoleData } from "../../types/socketType";
import { IUserRepository } from "../../repositories/interface/IUserRepository";


export class EditorController {
    constructor(
        private readonly editorService: IEditorService,
        private readonly userRepository: IUserRepository
    ) { }

    async handleJoinRoom(data: JoinProjectData, client: Socket) {
        const onlineUsers = await this.editorService.joinRoom(data.projectId, data.userId, client.id);

        client.join(data.projectId);
        client.emit('online-users', onlineUsers);

        client.to(data.projectId).emit('online-users', onlineUsers);
        const joinedUserName = (await this.userRepository.findById(data.userId)).name

        client.to(data.projectId).emit("user-joined", {
            message: `${joinedUserName} Joined`
        })
    }

    async handleLeaveRoom(data: leaveProjectData, client: Socket) {
        const onlineUsers = await this.editorService.leaveRoom(data.projectId, data.userId, client.id);

        client.leave(data.projectId);

        client.to(data.projectId).emit('online-users', onlineUsers);

        client.to(data.projectId).emit("user-left", {
            message: `${data.userName} left the editor.`
        });
    }

    async handleCodeUpdate(data: updateCodeData, client: Socket) {
        const { userId, projectId, code } = data
        const room = await this.editorService.getRoomByProjectId(projectId)
        if (!room) {
            client.emit('error', { message: 'Room not found' });
            return;
        }

        const isOwner = room.owner.toString() === userId
        const collaborator = room.collaborators.find(c => c.user._id.equals(userId));
        const role = isOwner ? "owner" : collaborator.role;

        if (role === "owner" || role === "editor") {
            client.to(projectId).emit("code-update", { code, userId })
            // await this.editorService.saveCode(projectId, code)
        }
    }

    async handleUpdateRole(data: updateRoleData, socket: Socket) {
        const { userId, role, projectId } = data

        const isUserOnline = await this.editorService.isUserOnline(projectId, userId)
        if (!isUserOnline) {
            socket.emit("error", { message: "user to update not in online" })
            return
        }
        const targetSocketId = await this.editorService.getSocketIdByUserId(userId, projectId)
        if (!targetSocketId) {
            socket.emit("error", { message: "targetted socket not found" })
        }
        socket.to(targetSocketId).emit("updated-role", { message: `You Permision changed to ${role}` })
        socket.to(targetSocketId).emit("refetch-permission")
    }

}