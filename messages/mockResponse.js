var MockResponse = (function () {
    function MockResponse(context) {
        this.context = context;
    }
    MockResponse.prototype.status = function (val) {
        if (val === undefined) {
            return this._status;
        }
        else {
            this._status = val;
        }
    };
    MockResponse.prototype.send = function (status, body) {
        if (body === undefined) {
            this._body = status;
            this.status(200);
        }
        else {
            this.status(status);
            this._body = body;
        }
    };
    MockResponse.prototype.end = function () {
        this.context.done();
    };
    return MockResponse;
}());
exports.MockResponse = MockResponse;