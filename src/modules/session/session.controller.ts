import {SessionService} from "./session.service";
import {asyncHandler} from "../../middleware/asyncHandler";
import {Request, Response} from "express";
import {HTTP_STATUS} from "../../config/http.config";
import {NotFoundException} from "../../common/utils/catch-errors";
import { z } from "zod"

export class SessionController {
    private sessionService: SessionService;

    constructor(sessionService: SessionService) {
        this.sessionService = sessionService;
    }

    public getAllSession = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const userId = req.user?.id;
        const sessionId: string = req.sessionId!;

        const { sessions } = await this.sessionService.getAllSession(userId);

        const modifySession = sessions.map(session => ({
            ...session.toObject(),
            ...(session.id === sessionId && { isCurrent: true }),
        }));

        return res.status(HTTP_STATUS.OK).json({
            message: "Retrieved all session successfully",
            sessions: modifySession
        })
    })

    public getSession = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const sessionId: string = req?.sessionId!;

        if(!sessionId) throw new NotFoundException("Session ID not found. Please login");

        const session = await this.sessionService.getSessionById(sessionId)
        return res.status(HTTP_STATUS.OK).json({
            message: "Session retrieved successfully",
            session: session,
        })
    })

    public deleteSession = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const sessionId = z.string().parse(req.params.id);
        const userId: string = req.user?.id;

        await this.sessionService.deleteSession(sessionId, userId)

        return res.status(HTTP_STATUS.OK).json({
            message: "Session deleted successfully",
        })
    })
}