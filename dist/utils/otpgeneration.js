"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpGenerator = void 0;
const otpGenerator = (length) => {
    let otp = "";
    const arr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    for (let i = 0; i < length; i++) {
        otp += arr[Math.floor(Math.random() * 10)];
    }
    return otp;
};
exports.otpGenerator = otpGenerator;
