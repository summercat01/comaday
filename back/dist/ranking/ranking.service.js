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
exports.RankingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const ranking_entity_1 = require("./entities/ranking.entity");
let RankingService = class RankingService {
    constructor(userRepository, rankingRepository) {
        this.userRepository = userRepository;
        this.rankingRepository = rankingRepository;
    }
    async getRankings() {
        const users = await this.userRepository.find();
        const sortedUsers = users.sort((a, b) => b.coinCount - a.coinCount);
        const rankings = sortedUsers.map((user, index) => {
            return this.rankingRepository.create({
                userId: user.id,
                username: user.username,
                memberNumber: user.memberNumber,
                totalCoins: user.coinCount,
                rank: index + 1,
            });
        });
        return this.rankingRepository.save(rankings);
    }
    async getUserRanking(userId) {
        const rankings = await this.getRankings();
        return rankings.find(ranking => ranking.userId === userId);
    }
};
exports.RankingService = RankingService;
exports.RankingService = RankingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(ranking_entity_1.Ranking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RankingService);
//# sourceMappingURL=ranking.service.js.map