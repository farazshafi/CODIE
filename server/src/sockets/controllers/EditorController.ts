import { Socket } from "socket.io";
import { IEditorService } from "../services/interface/IEditorService";
import { JoinProjectData, leaveProjectData } from "../../types/socketType";
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

}