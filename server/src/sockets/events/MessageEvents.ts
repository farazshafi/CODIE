
import { Server, Socket } from 'socket.io';
import { IEventHandler } from './EventHandler';
import { IMessageService } from '../../services/interface/IMessageService';
import { ISentMessage, ISentVoiceMessage } from '../../types/socketType';
import cloudinary from '../../config/cloudinary';

export class MessageEvents implements IEventHandler {
    private io: Server;
    private messageService: IMessageService;

    constructor(io: Server, messageService: IMessageService) {
        this.io = io;
        this.messageService = messageService;
    }

    public register(socket: Socket): void {
        socket.on("send-message", (data: ISentMessage) => this.saveMessage(data));
        socket.on("send-voice-message", (data: ISentVoiceMessage) => this.saveVoiceMessage(data));
    }

    private async saveMessage(data: ISentMessage): Promise<void> {
        const savedMessages = await this.messageService.createMessage(data);
        this.io.to(data.projectId).emit("recived-message", { ...savedMessages.toObject() });
    }

    private async saveVoiceMessage(data: ISentVoiceMessage): Promise<void> {
        const { base64, ...msgData } = data

        const uploadResponse = await cloudinary.uploader.upload(base64, {
            folder: "voice-messages",
            resource_type: "video",
            format: "webm",
            public_id: `voice_${Date.now()}`
        })

        const voiceUrl = uploadResponse.secure_url

        const saveMessage = await this.messageService.createMessage({
            ...msgData,
            content: voiceUrl,
            contentType: "audio"
        })

        this.io.to(msgData.projectId).emit("recived-message", saveMessage)
    }
}
