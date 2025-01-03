"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const jwt_strategy_1 = require("../common/strategies/jwt.strategy");
const initializePassport = () => {
    (0, jwt_strategy_1.setupJwtStrategy)(passport_1.default);
};
exports.initializePassport = initializePassport;
(0, exports.initializePassport)();
exports.default = passport_1.default;
