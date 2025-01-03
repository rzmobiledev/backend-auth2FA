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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const session_model_1 = __importDefault(require("../../database/models/session.model"));
const catch_errors_1 = require("../../common/utils/catch-errors");
class SessionService {
    getAllSession(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessions = yield session_model_1.default.find({
                userId: userId,
                expiredAt: { $gt: Date.now() }
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
        });
    }
    getSessionById(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield session_model_1.default.findById(sessionId)
                .populate("userId")
                .select("-expiredAt");
            if (!session)
                throw new catch_errors_1.NotFoundException("Session not found");
            return session;
        });
    }
    deleteSession(sessionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedSession = yield session_model_1.default.findByIdAndDelete({
                _id: sessionId,
                userId: userId
            });
            if (!deletedSession)
                throw new catch_errors_1.NotFoundException("Session not found");
            return true;
        });
    }
}
exports.SessionService = SessionService;
