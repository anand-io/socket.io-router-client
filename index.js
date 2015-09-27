function SocketIORouterClient(io) {
    if (!io || !io.Socket || !io.Manager) {
        throw new Error('socket io client is not found, Load socket.io-router-client after loading socket.io-client');
    }

    // {'requestId': [Promise.resolve, Promise.reject]}
    var requests = {};

    function addRequest(requestId, resolve, reject) {
        requests[requestId] = [resolve, reject];
    }

    function removeRequest(requestId){
        delete requests[requestId];
    }

    function getRequestData(requestId) {
        return requests[requestId];
    }

    function rejectAllRequest() {
        for(var key in requests) {
            requests[key][1]({message: 'socket disconnected'});
            delete requests[key];
        }
    }

    io.Manager.prototype.socketBackup = io.Manager.prototype.socket;
    io.Manager.prototype.socket = function() {
        var args = Array.prototype.slice.call(arguments);
        var socket = this.socketBackup.apply(this, args);
        socket.on('socket io route req res 3535', function(res) {
            var requestData = getRequestData(res.requestId);
            if (res.status === 200){
                requestData[0](res);
            } else {
                requestData[1](res);
            }
            removeRequest(res.requestId);
        });
        socket.on('disconnect', function() {
            rejectAllRequest();
        });
        return socket;
    };

    io.Socket.prototype.request = function(route, data) {
        var request = {};
        request.route = route;
        request.params = data;
        request.requestId = generateRequestId();
        request.requestId = request.requestId + this.id;
        var _socket = this;

        var promise = new Promise(function(resolve, reject){
            if(_socket.io.readyState != 'closed') {
                _socket.emit('socket io route req res 3535', request);
                addRequest(request.requestId, resolve, reject);
            } else {
                reject({message:'socket connection is closed'});
            }

        });
        return promise;
    };

    function generateRequestId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
module.exports = SocketIORouterClient;
