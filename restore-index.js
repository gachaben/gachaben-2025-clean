"use strict";
// ------------------------------------------------------
// functions/src/index.ts
// Cloud Functions エントリーポイント (v1.7b対応)
// ------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBattle = void 0;
const createBattle_1 = require("./createBattle"); // ← ./（ドット1つ）でOK
Object.defineProperty(exports, "createBattle", { enumerable: true, get: function () { return createBattle_1.createBattle; } });
