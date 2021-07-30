"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var app = express_1.default();
var PORT = process.env.PORT || 3000;
app.get('/posts', function (req, res) {
    var posts = [
        {
            caption: 'Golden Gate Bridge',
            location: 'San Francisco',
        },
        {
            caption: 'London Eye',
            location: 'London',
        },
    ];
    res.send(posts);
});
app.listen(PORT, function () { return console.log('Express server running'); });
