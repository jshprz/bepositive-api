"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var foo_1 = require("./foo");
test('basic', function () {
    expect(foo_1.sum()).toBe(0);
});
test('basic again', function () {
    expect(foo_1.sum(1, 2)).toBe(3);
});
//# sourceMappingURL=foo.test.js.map