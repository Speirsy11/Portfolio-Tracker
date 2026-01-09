"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultModel = exports.openai = void 0;
var openai_1 = require("@ai-sdk/openai");
exports.openai = (0, openai_1.createOpenAI)({
    apiKey: process.env.OPENAI_API_KEY,
});
exports.defaultModel = (0, exports.openai)("gpt-4o");
