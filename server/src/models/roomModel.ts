import mongoose, { Schema } from "mongoose";

const roles = ["owner", "editor", "viewer"]

const roomSchema = new Schema({

    roomId: {
        type: String,
        required: true,
        unique: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    collaborators: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: roles, default: "Viewer" }
    }]

}, { timestamps: true })

const Room = mongoose.model("Room", roomSchema);

export default Room