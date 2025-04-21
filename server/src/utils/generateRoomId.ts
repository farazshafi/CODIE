import crypto from "crypto"

export const generateRoomId = () => {
    return crypto.randomBytes(4).toString('hex');
};
