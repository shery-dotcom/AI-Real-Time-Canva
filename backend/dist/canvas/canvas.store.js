"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasStore = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_crypto_1 = require("node:crypto");
const STATE_FILE_PATH = (0, node_path_1.join)(process.cwd(), "data", "canvas-state.json");
let CanvasStore = class CanvasStore {
    state = { nodes: [] };
    async onModuleInit() {
        await this.load();
    }
    getState() {
        return {
            nodes: this.state.nodes.map((node) => ({ ...node })),
        };
    }
    async replaceState(state) {
        this.state = {
            nodes: state.nodes.map((node) => ({ ...node })),
        };
        await this.persist();
        return this.getState();
    }
    async generateFromPrompt(prompt) {
        const normalizedPrompt = prompt.trim() || "Untitled canvas node";
        const type = this.resolveNodeType(normalizedPrompt);
        const node = this.createNode(normalizedPrompt, type);
        this.state = {
            nodes: [...this.state.nodes, node],
        };
        await this.persist();
        return this.getState();
    }
    async load() {
        await (0, promises_1.mkdir)((0, node_path_1.dirname)(STATE_FILE_PATH), { recursive: true });
        try {
            const content = await (0, promises_1.readFile)(STATE_FILE_PATH, "utf8");
            const parsed = JSON.parse(content);
            this.state = {
                nodes: Array.isArray(parsed.nodes)
                    ? parsed.nodes.map((node) => ({ ...node }))
                    : [],
            };
        }
        catch {
            this.state = { nodes: [] };
            await this.persist();
        }
    }
    async persist() {
        await (0, promises_1.mkdir)((0, node_path_1.dirname)(STATE_FILE_PATH), { recursive: true });
        await (0, promises_1.writeFile)(STATE_FILE_PATH, `${JSON.stringify(this.state, null, 2)}\n`, "utf8");
    }
    resolveNodeType(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.includes("circle")) {
            return "circle";
        }
        if (lowerPrompt.includes("rectangle")) {
            return "rectangle";
        }
        return prompt.length % 2 === 0 ? "rectangle" : "circle";
    }
    createNode(prompt, type) {
        const hash = this.hashPrompt(prompt);
        const x = 48 + (hash % 720);
        const y = 48 + ((hash >> 3) % 420);
        const color = this.pickColor(hash);
        if (type === "circle") {
            return {
                id: (0, node_crypto_1.randomUUID)(),
                type,
                x,
                y,
                radius: 36 + (hash % 36),
                label: prompt,
                color,
            };
        }
        return {
            id: (0, node_crypto_1.randomUUID)(),
            type,
            x,
            y,
            width: 96 + (hash % 120),
            height: 64 + ((hash >> 5) % 96),
            label: prompt,
            color,
        };
    }
    hashPrompt(prompt) {
        let hash = 0;
        for (let index = 0; index < prompt.length; index += 1) {
            hash = (hash * 31 + prompt.charCodeAt(index)) | 0;
        }
        return Math.abs(hash);
    }
    pickColor(hash) {
        const palette = [
            "#ef4444",
            "#f97316",
            "#eab308",
            "#22c55e",
            "#06b6d4",
            "#3b82f6",
            "#8b5cf6",
        ];
        return palette[hash % palette.length];
    }
};
exports.CanvasStore = CanvasStore;
exports.CanvasStore = CanvasStore = __decorate([
    (0, common_1.Injectable)()
], CanvasStore);
