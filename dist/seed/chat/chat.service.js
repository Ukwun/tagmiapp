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
exports.ChatService = void 0;
var common_1 = require("@nestjs/common");
var ChatService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ChatService = _classThis = /** @class */ (function () {
        function ChatService_1(roomRepository, messageRepository, userRepository, bookingRepository) {
            this.roomRepository = roomRepository;
            this.messageRepository = messageRepository;
            this.userRepository = userRepository;
            this.bookingRepository = bookingRepository;
        }
        ChatService_1.prototype.createRoom = function (userId, createRoomDto) {
            return __awaiter(this, void 0, void 0, function () {
                var user, booking, participantIds, participants, room;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { id: userId } })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.NotFoundException("User not found");
                            }
                            if (!createRoomDto.bookingId) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.bookingRepository.findOne({
                                    where: { id: createRoomDto.bookingId },
                                })];
                        case 2:
                            booking = _a.sent();
                            if (!booking) {
                                throw new common_1.NotFoundException("Booking not found");
                            }
                            if (booking.clientId !== userId && booking.talentId !== userId) {
                                throw new common_1.ForbiddenException("You are not involved in this booking");
                            }
                            _a.label = 3;
                        case 3:
                            participantIds = createRoomDto.participants || [userId];
                            return [4 /*yield*/, this.userRepository.findByIds(participantIds)];
                        case 4:
                            participants = _a.sent();
                            room = this.roomRepository.create({
                                name: createRoomDto.name,
                                type: createRoomDto.type || "direct",
                                bookingId: createRoomDto.bookingId,
                                participants: participants,
                            });
                            return [2 /*return*/, this.roomRepository.save(room)];
                    }
                });
            });
        };
        ChatService_1.prototype.getUserRooms = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.roomRepository
                            .createQueryBuilder("room")
                            .where(":userId = ANY(room.participants)", { userId: userId })
                            .leftJoinAndSelect("room.lastMessage", "lastMessage")
                            .leftJoinAndSelect("lastMessage.sender", "sender")
                            .orderBy("room.updatedAt", "DESC")
                            .getMany()];
                });
            });
        };
        ChatService_1.prototype.joinRoom = function (roomId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var room, isParticipant, booking, user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.roomRepository.findOne({
                                where: { id: roomId },
                                relations: ["participants"],
                            })];
                        case 1:
                            room = _a.sent();
                            if (!room) {
                                throw new common_1.NotFoundException("Room not found");
                            }
                            isParticipant = room.participants.some(function (p) { return p.id === userId; });
                            if (!!isParticipant) return [3 /*break*/, 6];
                            if (!room.bookingId) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.bookingRepository.findOne({
                                    where: { id: room.bookingId },
                                })];
                        case 2:
                            booking = _a.sent();
                            if (!booking || (booking.clientId !== userId && booking.talentId !== userId)) {
                                throw new common_1.ForbiddenException("You cannot join this room");
                            }
                            _a.label = 3;
                        case 3: return [4 /*yield*/, this.userRepository.findOne({ where: { id: userId } })];
                        case 4:
                            user = _a.sent();
                            if (!user) return [3 /*break*/, 6];
                            room.participants.push(user);
                            return [4 /*yield*/, this.roomRepository.save(room)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [2 /*return*/, room];
                    }
                });
            });
        };
        ChatService_1.prototype.getRoomMessages = function (roomId_1, userId_1) {
            return __awaiter(this, arguments, void 0, function (roomId, userId, page, limit) {
                var room, roomWithParticipants, hasAccess, _a, messages, total;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 50; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.roomRepository.findOne({
                                where: { id: roomId },
                            })];
                        case 1:
                            room = _b.sent();
                            if (!room) {
                                throw new common_1.NotFoundException("Room not found");
                            }
                            return [4 /*yield*/, this.roomRepository.findOne({
                                    where: { id: roomId },
                                    relations: ["participants"],
                                })];
                        case 2:
                            roomWithParticipants = _b.sent();
                            hasAccess = roomWithParticipants === null || roomWithParticipants === void 0 ? void 0 : roomWithParticipants.participants.some(function (p) { return p.id === userId; });
                            if (!hasAccess) {
                                throw new common_1.ForbiddenException("You don't have access to this room");
                            }
                            return [4 /*yield*/, this.messageRepository.findAndCount({
                                    where: { roomId: roomId },
                                    relations: ["sender"],
                                    order: { createdAt: "DESC" },
                                    skip: (page - 1) * limit,
                                    take: limit,
                                })];
                        case 3:
                            _a = _b.sent(), messages = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: messages.reverse(), // Reverse to show oldest first
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
        ChatService_1.prototype.createMessage = function (roomId, senderId, createMessageDto) {
            return __awaiter(this, void 0, void 0, function () {
                var room, hasAccess, message, savedMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.roomRepository.findOne({
                                where: { id: roomId },
                                relations: ["participants"],
                            })];
                        case 1:
                            room = _a.sent();
                            if (!room) {
                                throw new common_1.NotFoundException("Room not found");
                            }
                            hasAccess = room.participants.some(function (p) { return p.id === senderId; });
                            if (!hasAccess) {
                                throw new common_1.ForbiddenException("You don't have access to this room");
                            }
                            message = this.messageRepository.create({
                                roomId: roomId,
                                senderId: senderId,
                                content: createMessageDto.content,
                            });
                            return [4 /*yield*/, this.messageRepository.save(message)
                                // Update room's updatedAt
                            ];
                        case 2:
                            savedMessage = _a.sent();
                            // Update room's updatedAt
                            room.updatedAt = new Date();
                            return [4 /*yield*/, this.roomRepository.save(room)
                                // Return message with sender info
                            ];
                        case 3:
                            _a.sent();
                            // Return message with sender info
                            return [2 /*return*/, this.messageRepository.findOne({
                                    where: { id: savedMessage.id },
                                    relations: ["sender"],
                                })];
                    }
                });
            });
        };
        ChatService_1.prototype.markMessageAsRead = function (messageId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var message, room, hasAccess;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.messageRepository.findOne({
                                where: { id: messageId },
                            })];
                        case 1:
                            message = _a.sent();
                            if (!message) {
                                throw new common_1.NotFoundException("Message not found");
                            }
                            return [4 /*yield*/, this.roomRepository.findOne({
                                    where: { id: message.roomId },
                                    relations: ["participants"],
                                })];
                        case 2:
                            room = _a.sent();
                            if (!room) {
                                throw new common_1.NotFoundException("Room not found");
                            }
                            hasAccess = room.participants.some(function (p) { return p.id === userId; });
                            if (!hasAccess) {
                                throw new common_1.ForbiddenException("You don't have access to this message");
                            }
                            if (!!message.isRead) return [3 /*break*/, 4];
                            message.isRead = true;
                            return [4 /*yield*/, this.messageRepository.save(message)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        ChatService_1.prototype.getRoomUsers = function (roomId) {
            return __awaiter(this, void 0, void 0, function () {
                var room;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.roomRepository.findOne({
                                where: { id: roomId },
                                relations: ["participants"],
                            })];
                        case 1:
                            room = _a.sent();
                            return [2 /*return*/, (room === null || room === void 0 ? void 0 : room.participants.map(function (p) { return p.id; })) || []];
                    }
                });
            });
        };
        ChatService_1.prototype.getOrCreateBookingRoom = function (bookingId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var room, booking;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.roomRepository.findOne({
                                where: { bookingId: bookingId },
                            })];
                        case 1:
                            room = _a.sent();
                            if (room) {
                                return [2 /*return*/, room];
                            }
                            return [4 /*yield*/, this.bookingRepository.findOne({
                                    where: { id: bookingId },
                                    relations: ["client", "talent"],
                                })];
                        case 2:
                            booking = _a.sent();
                            if (!booking) {
                                throw new common_1.NotFoundException("Booking not found");
                            }
                            if (booking.clientId !== userId && booking.talentId !== userId) {
                                throw new common_1.ForbiddenException("You are not involved in this booking");
                            }
                            room = this.roomRepository.create({
                                name: "Booking: ".concat(booking.title),
                                type: "booking",
                                bookingId: bookingId,
                                participants: [booking.client, booking.talent],
                            });
                            return [2 /*return*/, this.roomRepository.save(room)];
                    }
                });
            });
        };
        return ChatService_1;
    }());
    __setFunctionName(_classThis, "ChatService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ChatService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ChatService = _classThis;
}();
exports.ChatService = ChatService;
