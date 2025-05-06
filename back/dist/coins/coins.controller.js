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
exports.CoinsController = void 0;
const common_1 = require("@nestjs/common");
const coins_service_1 = require("./coins.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let CoinsController = class CoinsController {
    constructor(coinsService) {
        this.coinsService = coinsService;
    }
    async transfer(senderId, receiverId, amount) {
        return this.coinsService.transfer(senderId, receiverId, amount);
    }
    async getTransactions(userId) {
        return this.coinsService.getTransactions(+userId);
    }
    async getAllTransactions() {
        return this.coinsService.getAllTransactions();
    }
    async earnCoins(req, amount, description) {
        return this.coinsService.earnCoins(req.user.id, amount, description);
    }
};
exports.CoinsController = CoinsController;
__decorate([
    (0, common_1.Post)('transfer'),
    __param(0, (0, common_1.Body)('senderId')),
    __param(1, (0, common_1.Body)('receiverId')),
    __param(2, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], CoinsController.prototype, "transfer", null);
__decorate([
    (0, common_1.Get)('history/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoinsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('transactions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CoinsController.prototype, "getAllTransactions", null);
__decorate([
    (0, common_1.Post)('earn'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, common_1.Body)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], CoinsController.prototype, "earnCoins", null);
exports.CoinsController = CoinsController = __decorate([
    (0, common_1.Controller)('coins'),
    __metadata("design:paramtypes", [coins_service_1.CoinsService])
], CoinsController);
//# sourceMappingURL=coins.controller.js.map