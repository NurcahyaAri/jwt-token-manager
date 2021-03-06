"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
class JwtRefreshManager {
    constructor(source, keyEncription = '2f3b9b0455a7000943t34', keyIv = '2353er23rfewr3fer3') {
        this.DIR_PATH = `${process.cwd()}/${source}`;
        this.dirPath = path.dirname(this.DIR_PATH);
        this.keyEncription = keyEncription.slice(0, 16);
        this.keyIv = keyIv.slice(0, 16);
    }
    saveToken(token) {
        try {
            const cipher = crypto.createCipheriv('aes-128-cbc', this.keyEncription, this.keyIv);
            token = cipher.update(token, 'utf8', 'hex');
            token += cipher.final('hex');
            if (fs.existsSync(this.DIR_PATH)) {
                const tokenFromSource = fs.readFileSync(this.DIR_PATH, { encoding: 'utf8' });
                const tokens = JSON.parse(tokenFromSource);
                tokens.push({
                    token,
                    used: 0,
                });
                fs.writeFileSync(this.DIR_PATH, JSON.stringify(tokens));
            }
            else {
                const tokens = [];
                tokens.push({
                    token,
                    used: 0,
                });
                fs.mkdirSync(this.dirPath, { recursive: true });
                fs.writeFileSync(this.DIR_PATH, JSON.stringify(tokens));
            }
            return true;
        }
        catch (err) {
            throw new Error(err);
        }
    }
    getTokens() {
        const tokenFromSource = fs.readFileSync(this.DIR_PATH, { encoding: 'utf8' });
        const tokens = JSON.parse(tokenFromSource);
        return tokens;
    }
    refreshToken(token, refreshToken) {
        const isTokenAvailable = this.checkToken(refreshToken);
        if (isTokenAvailable) {
            const tokenFromSource = fs.readFileSync(this.DIR_PATH, { encoding: 'utf8' });
            const tokens = JSON.parse(tokenFromSource);
            let dechiper;
            const newToken = tokens.filter((data) => {
                const createDeciper = crypto.createDecipheriv('aes-128-cbc', this.keyEncription, this.keyIv);
                dechiper = createDeciper.update(data.token, 'hex', 'utf8');
                dechiper += createDeciper.final('utf8');
                if (dechiper !== refreshToken) {
                    return data;
                }
            });
            fs.writeFileSync(this.DIR_PATH, JSON.stringify(newToken));
            return this.saveToken(token);
        }
        return false;
    }
    checkToken(refreshToken) {
        const tokenFromSource = fs.readFileSync(this.DIR_PATH, { encoding: 'utf8' });
        const tokens = JSON.parse(tokenFromSource);
        let dechiper;
        const savedRefreshToken = tokens.filter((data) => {
            const createDeciper = crypto.createDecipheriv('aes-128-cbc', this.keyEncription, this.keyIv);
            dechiper = createDeciper.update(data.token, 'hex', 'utf8');
            dechiper += createDeciper.final('utf8');
            if (dechiper === refreshToken && data.used === 0) {
                return data;
            }
        });
        if (savedRefreshToken.length > 0) {
            return true;
        }
        return false;
    }
}
exports.JwtRefreshManager = JwtRefreshManager;
