"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const bots = [
    {
        name: "Harkirt Singh",
        tag: "WebDev Pro",
        imageURL: "https://cytd5kmgz6.ufs.sh/f/aIroXtB9CoHUqHfP7Rnl9wnFcHKMDCJeG8YL1PBAZdusXNkb",
        twitterLink: "https://x.com/kirat_tw",
        profile: "will set it up"
    },
    {
        name: "Striver Aka Raj",
        tag: "DSA Pro",
        imageURL: "https://cytd5kmgz6.ufs.sh/f/aIroXtB9CoHU8uO1uol54znUSPNkOp63h9avt01mJibEA2qM",
        twitterLink: "https://x.com/striver_79",
        profile: "This bot has been trained on Striver's Twitter Profile"
    },
    {
        name: "Code With Harry",
        tag: "Best Teacher",
        imageURL: "https://cytd5kmgz6.ufs.sh/f/aIroXtB9CoHUNOl0tGZbjrC4A30iB7c9Kt6Ul5wp8meLvh1D",
        twitterLink: "https://x.com/codewithharry",
        profile: "This bot has been trained on Harry's Twitter Profile"
    },
    {
        name: "EzSnippet",
        tag: "Build In Public Pro",
        imageURL: "https://cytd5kmgz6.ufs.sh/f/aIroXtB9CoHUVxAvwBQ6eiS7bTFZPBLxaO1rj0QWlwup2YG3",
        twitterLink: "https://x.com/ezSnippet",
        profile: "This bot has been trained on EzSnippets's Twitter Profile"
    }
];
const setBots = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const bo of bots) {
        const result = yield config_1.prisma.bot.create({
            data: {
                name: bo.name,
                tag: bo.tag,
                imageURL: bo.imageURL,
                twitterLink: bo.twitterLink,
                profile: bo.profile
            }
        });
        console.log(result);
    }
});
setBots();
