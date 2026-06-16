"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.NODE_ENV === "development") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.warn("⚠️  TLS certificate verification disabled (development only)");
}
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const throttler_exception_filter_1 = require("./common/filters/throttler-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
        ];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                if (!origin)
                    console.log('📱 Request received from mobile/local device');
                callback(null, origin || true);
            }
            else {
                callback(null, false);
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new throttler_exception_filter_1.ThrottlerExceptionFilter());
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    const config = new swagger_1.DocumentBuilder()
        .setTitle("TalentHub API")
        .setDescription("Social talent discovery and booking platform API")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api/docs", app, document);
    const server = app.getHttpServer();
    server.setTimeout(600000);
    server.keepAliveTimeout = 620000;
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    const port = process.env.PORT || 6000;
    await app.listen(port, "0.0.0.0");
    console.log(`🚀 Tagmi API running on http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map