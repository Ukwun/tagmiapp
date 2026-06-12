"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
var common_1 = require("@nestjs/common");
var booking_message_entity_1 = require("../entities/booking-message.entity");
var BookingsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var BookingsService = _classThis = /** @class */ (function () {
        function BookingsService_1(bookingRepository, messageRepository, userRepository, talentProfileRepository) {
            this.bookingRepository = bookingRepository;
            this.messageRepository = messageRepository;
            this.userRepository = userRepository;
            this.talentProfileRepository = talentProfileRepository;
        }
        BookingsService_1.prototype.create = function (clientId, createBookingDto) {
            return __awaiter(this, void 0, void 0, function () {
                var client, talent, booking;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { id: clientId } })];
                        case 1:
                            client = _a.sent();
                            if (!client) {
                                throw new common_1.NotFoundException("User not found");
                            }
                            return [4 /*yield*/, this.userRepository.findOne({
                                    where: { id: createBookingDto.talentId },
                                })];
                        case 2:
                            talent = _a.sent();
                            if (!talent) {
                                throw new common_1.NotFoundException("User not found");
                            }
                            booking = this.bookingRepository.create({
                                clientId: clientId,
                                talentId: createBookingDto.talentId,
                                title: createBookingDto.title,
                                description: createBookingDto.description,
                                price: createBookingDto.budget,
                                startDate: createBookingDto.startDate,
                                endDate: createBookingDto.endDate,
                                status: "pending",
                            });
                            return [2 /*return*/, this.bookingRepository.save(booking)];
                    }
                });
            });
        };
        BookingsService_1.prototype.findAll = function (userId_1, role_1) {
            return __awaiter(this, arguments, void 0, function (userId, role, page, limit) {
                var queryBuilder, _a, bookings, total;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            queryBuilder = this.bookingRepository
                                .createQueryBuilder("booking")
                                .leftJoinAndSelect("booking.client", "client")
                                .leftJoinAndSelect("booking.talent", "talent");
                            // Show bookings where user is either client or talent
                            queryBuilder.where("booking.clientId = :userId OR booking.talentId = :userId", { userId: userId });
                            return [4 /*yield*/, queryBuilder
                                    .orderBy("booking.createdAt", "DESC")
                                    .skip((page - 1) * limit)
                                    .take(limit)
                                    .getManyAndCount()];
                        case 1:
                            _a = _b.sent(), bookings = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: bookings,
                                    total: total,
                                    page: page,
                                    limit: limit,
                                    hasNext: page * limit < total,
                                    hasPrev: page > 1,
                                }];
                    }
                });
            });
        };
        BookingsService_1.prototype.findOne = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var booking;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.bookingRepository.findOne({
                                where: { id: id },
                                relations: ["client", "talent"],
                            })];
                        case 1:
                            booking = _a.sent();
                            if (!booking) {
                                throw new common_1.NotFoundException("Booking not found");
                            }
                            if (booking.clientId !== userId && booking.talentId !== userId) {
                                throw new common_1.ForbiddenException("You can only view your own bookings");
                            }
                            return [2 /*return*/, booking];
                    }
                });
            });
        };
        BookingsService_1.prototype.update = function (id, userId, updateBookingDto) {
            return __awaiter(this, void 0, void 0, function () {
                var booking;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id, userId)
                            // Only allow certain updates based on role and status
                        ];
                        case 1:
                            booking = _a.sent();
                            // Only allow certain updates based on role and status
                            if (booking.clientId === userId) {
                                // Clients can update details if booking is pending
                                if (booking.status !== "pending") {
                                    throw new common_1.BadRequestException("Cannot update booking after it has been accepted/rejected");
                                }
                            }
                            else if (booking.talentId === userId) {
                                // Talents can only update status
                                if (updateBookingDto.status &&
                                    ["accepted", "rejected", "in_progress", "completed"].includes(updateBookingDto.status)) {
                                    booking.status = updateBookingDto.status;
                                }
                                else {
                                    throw new common_1.BadRequestException("Talents can only update booking status");
                                }
                            }
                            Object.assign(booking, updateBookingDto);
                            return [2 /*return*/, this.bookingRepository.save(booking)];
                    }
                });
            });
        };
        BookingsService_1.prototype.remove = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var booking;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id, userId)];
                        case 1:
                            booking = _a.sent();
                            if (booking.clientId !== userId) {
                                throw new common_1.ForbiddenException("Only the client can cancel a booking");
                            }
                            if (["completed", "cancelled"].includes(booking.status)) {
                                throw new common_1.BadRequestException("Cannot cancel a completed or already cancelled booking");
                            }
                            booking.status = "cancelled";
                            return [4 /*yield*/, this.bookingRepository.save(booking)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        BookingsService_1.prototype.getMessages = function (bookingId_1, userId_1) {
            return __awaiter(this, arguments, void 0, function (bookingId, userId, page, limit) {
                var booking, _a, messages, total;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 50; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.findOne(bookingId, userId)];
                        case 1:
                            booking = _b.sent();
                            return [4 /*yield*/, this.messageRepository.findAndCount({
                                    where: { bookingId: bookingId },
                                    relations: ["sender"],
                                    order: { createdAt: "ASC" },
                                    skip: (page - 1) * limit,
                                    take: limit,
                                })];
                        case 2:
                            _a = _b.sent(), messages = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: messages,
                                    total: total,
                                    page: page,
                                    limit: limit,
                                    hasNext: page * limit < total,
                                    hasPrev: page > 1,
                                }];
                    }
                });
            });
        };
        BookingsService_1.prototype.createMessage = function (bookingId, senderId, createMessageDto) {
            return __awaiter(this, void 0, void 0, function () {
                var booking, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(bookingId, senderId)];
                        case 1:
                            booking = _a.sent();
                            message = this.messageRepository.create({
                                bookingId: bookingId,
                                senderId: senderId,
                                content: createMessageDto.message,
                            });
                            return [2 /*return*/, this.messageRepository.save(message)];
                    }
                });
            });
        };
        BookingsService_1.prototype.markMessagesAsRead = function (bookingId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var booking;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(bookingId, userId)];
                        case 1:
                            booking = _a.sent();
                            return [4 /*yield*/, this.messageRepository
                                    .createQueryBuilder()
                                    .update(booking_message_entity_1.BookingMessage)
                                    .set({ isRead: true })
                                    .where("bookingId = :bookingId", { bookingId: bookingId })
                                    .andWhere("senderId != :userId", { userId: userId })
                                    .andWhere("isRead = :isRead", { isRead: false })
                                    .execute()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        BookingsService_1.prototype.getBookingStats = function (userId, role) {
            return __awaiter(this, void 0, void 0, function () {
                var queryBuilder, total, pending, active, completed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            queryBuilder = this.bookingRepository.createQueryBuilder("booking");
                            // Get stats for bookings where user is either client or talent
                            queryBuilder.where("booking.clientId = :userId OR booking.talentId = :userId", { userId: userId });
                            return [4 /*yield*/, queryBuilder.getCount()];
                        case 1:
                            total = _a.sent();
                            return [4 /*yield*/, queryBuilder.andWhere("booking.status = :status", { status: "pending" }).getCount()];
                        case 2:
                            pending = _a.sent();
                            return [4 /*yield*/, queryBuilder
                                    .andWhere("booking.status IN (:...statuses)", { statuses: ["accepted", "in_progress"] })
                                    .getCount()];
                        case 3:
                            active = _a.sent();
                            return [4 /*yield*/, queryBuilder.andWhere("booking.status = :status", { status: "completed" }).getCount()];
                        case 4:
                            completed = _a.sent();
                            return [2 /*return*/, {
                                    total: total,
                                    pending: pending,
                                    active: active,
                                    completed: completed,
                                }];
                    }
                });
            });
        };
        return BookingsService_1;
    }());
    __setFunctionName(_classThis, "BookingsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BookingsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BookingsService = _classThis;
}();
exports.BookingsService = BookingsService;
