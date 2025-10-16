"use strict";
// ------------------------------------------------------
// functions/src/index.ts
// Cloud Functions エントリーポイント (v1.7b対応)
// ------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitRound = exports.createBattle = void 0;
const createBattle_1 = require("./createBattle");
Object.defineProperty(exports, "createBattle", { enumerable: true, get: function () { return createBattle_1.createBattle; } });
const commitRound_1 = require("./commitRound");
Object.defineProperty(exports, "commitRound", { enumerable: true, get: function () { return commitRound_1.commitRound; } });
