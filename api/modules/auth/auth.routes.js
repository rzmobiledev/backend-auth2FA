"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_module_1 = require("./auth.module");
const jwt_strategy_1 = require("../../common/strategies/jwt.strategy");
const authRoutes = (0, express_1.Router)();
authRoutes.post("/register", auth_module_1.authController.register);
authRoutes.post("/login", auth_module_1.authController.login);
authRoutes.post("/verify/email", auth_module_1.authController.verifyEmail);
authRoutes.post("/password/forgot", auth_module_1.authController.forgotPassword);
authRoutes.post("/password/reset", auth_module_1.authController.resetPassword);
authRoutes.post("/logout", jwt_strategy_1.authenticateJWT, auth_module_1.authController.logout);
authRoutes.get("/refresh", auth_module_1.authController.refreshToken);
exports.default = authRoutes;
