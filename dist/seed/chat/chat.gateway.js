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
exports.ChatGateway = void 0;
var websockets_1 = require("@nestjs/websockets");
var ChatGateway = function () {
    var _classDecorators = [(0, websockets_1.WebSocketGateway)({
            cors: {
                origin: "*",
            },
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _server_decorators;
    var _server_initializers = [];
    var _server_extraInitializers = [];
    var ChatGateway = _classThis = /** @class */ (function () {
        function ChatGateway_1(chatService) {
            this.chatService = chatService;
            this.server = __runInitializers(this, _server_initializers, void 0);
            this.userSockets = (__runInitializers(this, _server_extraInitializers), new Map()); // userId -> socketId
        }
        ChatGateway_1.prototype.handleConnection = function (client) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.validateConnection(client)];
                        case 1:
                            userId = _a.sent();
                            if (userId) {
                                this.userSockets.set(userId, client.id);
                                client.join("user:".concat(userId));
                                console.log("User ".concat(userId, " connected with socket ").concat(client.id));
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            console.error("Connection error:", error_1);
                            client.disconnect();
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        ChatGateway_1.prototype.handleDisconnect = function (client) {
            // Find and remove user from userSockets map
            for (var _i = 0, _a = this.userSockets.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], userId = _b[0], socketId = _b[1];
                if (socketId === client.id) {
                    this.userSockets.delete(userId);
                    console.log("User ".concat(userId, " disconnected"));
                    break;
                }
            }
        };
        ChatGateway_1.prototype.validateConnection = function (client) {
            return __awaiter(this, void 0, void 0, function () {
                var token, userId, error_2;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            token = client.handshake.auth.token || ((_a = client.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]);
                            if (!token) {
                                throw new Error("No token provided");
                            }
                            return [4 /*yield*/, this.extractUserIdFromToken(token)];
                        case 1:
                            userId = _b.sent();
                            return [2 /*return*/, userId];
                        case 2:
                            error_2 = _b.sent();
                            console.error("Token validation failed:", error_2);
                            return [2 /*return*/, null];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        ChatGateway_1.prototype.extractUserIdFromToken = function (token) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Implement JWT token validation and user ID extraction
                    // This is a placeholder - implement actual JWT validation
                    return [2 /*return*/, "user-id-from-token"];
                });
            });
        };
        ChatGateway_1.prototype.handleJoinRoom = function (roomId, client) {
            try {
                var userId = client.data.userId || "unknown";
                var room = this.chatService.joinRoom(roomId, userId);
                client.join("room:".concat(roomId));
                client.emit("joinedRoom", { roomId: roomId, room: room });
                // Notify other users in the room
                client.to("room:".concat(roomId)).emit("userJoined", { userId: userId, roomId: roomId });
            }
            catch (error) {
                client.emit("error", { message: error.message });
            }
        };
        ChatGateway_1.prototype.handleLeaveRoom = function (roomId, client) {
            try {
                var userId = client.data.userId || "unknown";
                client.leave("room:".concat(roomId));
                client.emit("leftRoom", { roomId: roomId });
                // Notify other users in the room
                client.to("room:".concat(roomId)).emit("userLeft", { userId: userId, roomId: roomId });
            }
            catch (error) {
                client.emit("error", { message: error.message });
            }
        };
        ChatGateway_1.prototype.handleMessage = function (data, client) {
            try {
                var userId = client.data.userId || "unknown";
                var message = this.chatService.createMessage(data.roomId, userId, {
                    content: data.content,
                    type: data.type,
                    attachments: data.attachments,
                });
                // Send message to all users in the room
                this.server.to("room:".concat(data.roomId)).emit("newMessage", message);
                // Send push notification to offline users
                this.notifyOfflineUsers(data.roomId, userId, message);
            }
            catch (error) {
                client.emit("error", { message: error.message });
            }
        };
        ChatGateway_1.prototype.handleMarkAsRead = function (data, client) {
            try {
                var userId = client.data.userId || "unknown";
                this.chatService.markMessageAsRead(data.messageId, userId);
                // Notify sender that message was read
                this.server.to("room:".concat(data.roomId)).emit("messageRead", {
                    messageId: data.messageId,
                    readBy: userId,
                });
            }
            catch (error) {
                client.emit("error", { message: error.message });
            }
        };
        ChatGateway_1.prototype.handleTyping = function (data, client) {
            try {
                var userId = client.data.userId || "unknown";
                // Broadcast typing status to other users in the room
                client.to("room:".concat(data.roomId)).emit("userTyping", {
                    userId: userId,
                    isTyping: data.isTyping,
                });
            }
            catch (error) {
                client.emit("error", { message: error.message });
            }
        };
        ChatGateway_1.prototype.notifyOfflineUsers = function (roomId, senderId, message) {
            return __awaiter(this, void 0, void 0, function () {
                var roomUsers, offlineUsers, error_3;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.chatService.getRoomUsers(roomId)];
                        case 1:
                            roomUsers = _a.sent();
                            offlineUsers = roomUsers.filter(function (userId) { return userId !== senderId && !_this.userSockets.has(userId); });
                            // Here you would implement push notifications for offline users
                            // For now, we'll just log it
                            if (offlineUsers.length > 0) {
                                console.log("Sending push notifications to offline users: ".concat(offlineUsers.join(", ")));
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            console.error("Failed to notify offline users:", error_3);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return ChatGateway_1;
    }());
    __setFunctionName(_classThis, "ChatGateway");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _server_decorators = [(0, websockets_1.WebSocketServer)()];
        __esDecorate(null, null, _server_decorators, { kind: "field", name: "server", static: false, private: false, access: { has: function (obj) { return "server" in obj; }, get: function (obj) { return obj.server; }, set: function (obj, value) { obj.server = value; } }, metadata: _metadata }, _server_initializers, _server_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ChatGateway = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ChatGateway = _classThis;
}();
exports.ChatGateway = ChatGateway;
