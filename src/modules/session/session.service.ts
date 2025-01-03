import SessionModel from "../../database/models/session.model";
import {NotFoundException} from "../../common/utils/catch-errors";

export class SessionService {

    public async getAllSession(userId: string) {
        const sessions = await SessionModel.find({
            userId: userId,
            expiredAt: {$gt: Date.now()}
        }, {
            _id: 1,
            userId: 1,
            userAgent: 1,
            createdAt: 1,
            expiredAt: 1
        }, {
            sort: { createdAt: -1 },
        });

        return { sessions };
    }

    public async getSessionById(sessionId: string) {
        const session = await SessionModel.findById(sessionId)
            .populate("userId")
            .select("-expiredAt")

        if(!session) throw new NotFoundException("Session not found");
        return session
    }

    public async deleteSession(sessionId: string, userId: string): Promise<boolean> {
        const deletedSession = await SessionModel.findByIdAndDelete({
            _id: sessionId,
            userId: userId
        })
        if(!deletedSession) throw new NotFoundException("Session not found");
        return true
    }
}