import { Socket } from "socket.io";
import { IEditorService } from "../services/interface/IEditorService";
import { JoinProjectData } from "../../types/socketType";


export class EditorController {
    constructor(private readonly editorService: IEditorService) { }

    async handleJoinRoom(data: JoinProjectData, client: Socket) {
        const onlineUsers = await this.editorService.joinRoom(data.projectId, data.userId, client.id);
        console.log("saved user in redis , and return all users".bgYellow, onlineUsers)

        client.join(data.projectId);
        client.emit('online-users', onlineUsers);
        client.to(data.projectId).emit('online-users', onlineUsers);
    }

    async handleDisconnect(client: Socket) {
        const rooms = await this.editorService.leaveAllRooms(client.id);
        for (const room of rooms) {
            const users = await this.editorService.getOnlineUsers(room);
            console.log("user disconnected other users...".bgYellow, users)
            client.to(room).emit('online-users', users);
        }
    }
}