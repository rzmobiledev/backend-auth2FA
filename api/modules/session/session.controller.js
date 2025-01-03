"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const http_config_1 = require("../../config/http.config");
const catch_errors_1 = require("../../common/utils/catch-errors");
const zod_1 = require("zod");
class SessionController {
    constructor(sessionService) {
        this.getAllSession = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const sessionId = req.sessionId;
            const { sessions } = yield this.sessionService.getAllSession(userId);
            const modifySession = sessions.map(session => (Object.assign(Object.assign({}, session.toObject()), (session.id === sessionId && { isCurrent: true }))));
            return res.status(http_config_1.HTTP_STATUS.OK).json({
                message: "Retrieved all session successfully",
                sessions: modifySession
            });
        }));
        this.getSession = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const sessionId = req === null || req === void 0 ? void 0 : req.sessionId;
            if (!sessionId)
                throw new catch_errors_1.NotFoundException("Session ID not found. Please login");
            const session = yield this.sessionService.getSessionById(sessionId);
            return res.status(http_config_1.HTTP_STATUS.OK).json({
                message: "Session retrieved successfully",
                session: session,
            });
        }));
        this.deleteSession = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const sessionId = zod_1.z.string().parse(req.params.id);
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            yield this.sessionService.deleteSession(sessionId, userId);
            return res.status(http_config_1.HTTP_STATUS.OK).json({
                message: "Session deleted successfully",
            });
        }));
        this.sessionService = sessionService;
    }
}
exports.SessionController = SessionController;
