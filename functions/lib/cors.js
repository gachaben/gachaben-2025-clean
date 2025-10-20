"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowCORS = void 0;
// 開発/本番 両対応の CORS ラッパー
const allowCORS = (handler) => {
    return (req, res) => {
        const origin = req.headers.origin || "*";
        res.set("Access-Control-Allow-Origin", origin);
        res.set("Vary", "Origin");
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }
        return handler(req, res);
    };
};
exports.allowCORS = allowCORS;
