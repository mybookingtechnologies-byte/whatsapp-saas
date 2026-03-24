"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const roles_guard_1 = require("./common/guards/roles.guard");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const security_middleware_1 = require("./common/middleware/security.middleware");
const sanitize_middleware_1 = require("./common/middleware/sanitize.middleware");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalGuards(new roles_guard_1.RolesGuard(app.getReflector()));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.use(logger_middleware_1.LoggerMiddleware);
    app.use(security_middleware_1.SecurityMiddleware);
    app.use(sanitize_middleware_1.SanitizeMiddleware);
    app.enableCors();
    await app.listen(3001);
}
bootstrap();
