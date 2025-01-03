"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mfaController = exports.mfaService = void 0;
const mfa_service_1 = require("./mfa.service");
const mfa_controller_1 = require("./mfa.controller");
const mfaService = new mfa_service_1.MfaService();
exports.mfaService = mfaService;
const mfaController = new mfa_controller_1.MfaController(mfaService);
exports.mfaController = mfaController;
