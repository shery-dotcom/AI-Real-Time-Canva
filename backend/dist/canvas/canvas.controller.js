"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasController = void 0;
const common_1 = require("@nestjs/common");
const canvas_gateway_1 = require("./canvas.gateway");
const canvas_store_1 = require("./canvas.store");
let CanvasController = class CanvasController {
    canvasStore;
    canvasGateway;
    constructor(canvasStore, canvasGateway) {
        this.canvasStore = canvasStore;
        this.canvasGateway = canvasGateway;
    }
    async generate(body) {
        const state = await this.canvasStore.generateFromPrompt(body.prompt);
        this.canvasGateway.broadcastCanvasState(state);
        return state;
    }
    async getState() {
        return this.canvasStore.getState();
    }
    async replaceState(body) {
        const state = await this.canvasStore.replaceState(body);
        this.canvasGateway.broadcastCanvasState(state);
        return state;
    }
};
exports.CanvasController = CanvasController;
__decorate([
    (0, common_1.Post)("generate"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)("state"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "getState", null);
__decorate([
    (0, common_1.Put)("state"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CanvasController.prototype, "replaceState", null);
exports.CanvasController = CanvasController = __decorate([
    (0, common_1.Controller)("canvas"),
    __metadata("design:paramtypes", [canvas_store_1.CanvasStore,
        canvas_gateway_1.CanvasGateway])
], CanvasController);
