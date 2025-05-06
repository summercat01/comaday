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
exports.CoinsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coin_transaction_entity_1 = require("./entities/coin-transaction.entity");
const user_entity_1 = require("../users/entities/user.entity");
let CoinsService = class CoinsService {
    constructor(coinTransactionRepository, userRepository) {
        this.coinTransactionRepository = coinTransactionRepository;
        this.userRepository = userRepository;
    }
    async transfer(senderId, receiverId, amount) {
        const sender = await this.userRepository.findOne({ where: { id: senderId } });
        const receiver = await this.userRepository.findOne({ where: { id: receiverId } });
        if (!sender || !receiver) {
            throw new common_1.BadRequestException('사용자를 찾을 수 없습니다.');
        }
        if (sender.coinCount < amount) {
            throw new common_1.BadRequestException('코인이 부족합니다.');
        }
        sender.coinCount -= amount;
        receiver.coinCount += amount;
        await this.userRepository.save([sender, receiver]);
        const transaction = this.coinTransactionRepository.create({
            userId: senderId,
            amount: -amount,
            type: 'SPEND',
            description: `${receiver.username}님에게 코인 전송`,
        });
        return this.coinTransactionRepository.save(transaction);
    }
    async getTransactions(userId) {
        return this.coinTransactionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async getAllTransactions() {
        return this.coinTransactionRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async earnCoins(userId, amount, description) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('사용자를 찾을 수 없습니다.');
        }
        user.coinCount += amount;
        await this.userRepository.save(user);
        const transaction = this.coinTransactionRepository.create({
            userId,
            amount,
            type: 'EARN',
            description,
        });
        return this.coinTransactionRepository.save(transaction);
    }
};
exports.CoinsService = CoinsService;
exports.CoinsService = CoinsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coin_transaction_entity_1.CoinTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CoinsService);
//# sourceMappingURL=coins.service.js.map