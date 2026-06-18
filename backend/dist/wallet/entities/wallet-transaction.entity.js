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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletTransaction = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const wallet_entity_1 = require("./wallet.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["REFERRAL_PENDING"] = "referral_pending";
    TransactionType["REFERRAL_APPROVED"] = "referral_approved";
    TransactionType["REFERRAL_REJECTED"] = "referral_rejected";
    TransactionType["WITHDRAWAL_REQUEST"] = "withdrawal_request";
    TransactionType["WITHDRAWAL_COMPLETED"] = "withdrawal_completed";
    TransactionType["WITHDRAWAL_CANCELLED"] = "withdrawal_cancelled";
    TransactionType["FRAUD_FREEZE"] = "fraud_freeze";
    TransactionType["FRAUD_REVERSAL"] = "fraud_reversal";
    TransactionType["ADMIN_ADJUSTMENT"] = "admin_adjustment";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
let WalletTransaction = class WalletTransaction {
};
exports.WalletTransaction = WalletTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], WalletTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "simple-enum",
        enum: TransactionType,
    }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], WalletTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], WalletTransaction.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "referralId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Object)
], WalletTransaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WalletTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_entity_1.Wallet, (w) => w.transactions),
    (0, typeorm_1.JoinColumn)({ name: "walletId" }),
    __metadata("design:type", wallet_entity_1.Wallet)
], WalletTransaction.prototype, "wallet", void 0);
exports.WalletTransaction = WalletTransaction = __decorate([
    (0, typeorm_1.Entity)("wallet_transactions"),
    (0, typeorm_1.Index)(["walletId"]),
    (0, typeorm_1.Index)(["type"])
], WalletTransaction);
//# sourceMappingURL=wallet-transaction.entity.js.map