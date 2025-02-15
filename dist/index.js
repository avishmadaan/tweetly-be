"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const config_2 = require("../src/config");
const passportConfig_1 = __importDefault(require("../src/configuration/passportConfig"));
const twitter_1 = __importDefault(require("./routes/twitter"));
const content_1 = __importDefault(require("./routes/content"));
const posts_1 = __importDefault(require("./routes/posts"));
const media_1 = __importDefault(require("./routes/media"));
const ai_1 = __importDefault(require("./routes/ai"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:4000"],
    credentials: true,
}));
app.use((0, express_session_1.default)({
    secret: config_2.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(passportConfig_1.default.initialize());
app.use(passportConfig_1.default.session());
app.use("/api/v1/user", auth_1.default);
app.use("/api/v1/user/path", twitter_1.default);
app.use("/api/v1/user/content", content_1.default);
app.use("/api/v1/user/posts", posts_1.default);
app.use("/api/v1/user/media", media_1.default);
app.use("/api/v1/user/ai", ai_1.default);
app.listen(config_1.PORT, () => {
    console.log(`Server is running on port ${config_1.PORT}`);
});
