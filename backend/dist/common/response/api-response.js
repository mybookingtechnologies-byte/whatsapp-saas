"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiSuccess = apiSuccess;
exports.apiError = apiError;
function apiSuccess(data, message) {
    return { success: true, data, message };
}
function apiError(message, errors) {
    return { success: false, message, errors };
}
