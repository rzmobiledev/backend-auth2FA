"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueCode = generateUniqueCode;
const uuid_1 = require("uuid");
function generateUniqueCode() {
    return (0, uuid_1.v4)().replace(/-/g, "").substring(0, 25);
}
