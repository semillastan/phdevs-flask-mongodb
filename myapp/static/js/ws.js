/*
$.getScript("base64-binary.js", function(){
   console.log("base64-binary.js loaded ");
});
*/

var kfWebService = {
    connection: null,

    // host: 'jabber.iitsp.com',
    // commented below by tarun
//    host: '64.71.135.187',
    host: 'supportgenie.io',
    port: '9074',
    companyId : '1',
    status: 'disconnected',
    onConnected: null,
    onSessionStarted : null,
    onSessionEnded : null,
    onRequestService : null,
    onCancelRequestService : null,
    onLogin : null,
    onRecvdText : null,
    onRecvdVideo : null,
    onRecvdImage : null,
    onWebRTCMessage : null,
    onError : null,
    onClose: null,
    onReconnect: null,
    reconnectInterval:2,
    maxInterval:16,
    host:"supportgenie.io:9074",

    connect: function () {
        console.log("kfWebService - connect")
        //connection = new WebSocket("wss://104.236.158.168:9072/ws");
        connection = new WebSocket("wss://" + this.host + "/ws");
        this.connection = connection;
        console.log("initated a websocket connection");
        //console.log("this.onConnected is " + this.onConnected);

        //var ws = this;
        connection.onopen = function(event) {
            this.reconnectInterval = 2;
            console.log("inside websocket onopen");
            this.status = "connected";
            if (this.onConnected) {
                console.log("calling onConnected");
                this.onConnected();
            }
        //chatServerSocket.send("test chat message");
        }.bind(this);

        connection.onmessage = function (event) {
            console.log("recvd message");
            console.log(event.data);

            data = JSON.parse(event.data);
            console.log("data.command is " + data.command);

            if (data.command == 'requestAgentForSession') {
                console.log('recvd requestAgentForSession');
                if (this.onRequestService) {
                    this.onRequestService(data.sessionId, data.phone, data['name'], data.userid );
                }
            }

            if (data.command == 'cancelRequestAgentForSession') {
                console.log('recvd requestAgentForSession');
                if (this.onCancelRequestService) {
                    this.onCancelRequestService(data.sessionId, data.customerId);
                }
            }

            if (data.command == 'startSession') {
                console.log('recvd requestAgentForSession');
                if (this.onSessionStarted) {
                    this.onSessionStarted(data.sessionId);
                }
            }

            if (data.command == 'sendText') {
                console.log('recvd sendText');
                if (this.onRecvdText) {
                    this.onRecvdText(data.text);
                }
            }

            if (data.command == 'webrtc') {
                console.log('recvd sendText');
                if (this.onWebRTCMessage) {
                    this.onWebRTCMessage(data);
                }
            }

            if (data.command == 'endSession') {
                console.log('recvd endSession');
                if (this.onSessionEnded) {
                    this.onSessionEnded(data);
                }
            }

            if (data.command == 'sendMessage') {
                console.log('recvd sendMessage');
                switch (data.messageType) {
                    case 'text':
                        if (this.onRecvdText) {
                            this.onRecvdText(data.messageId, data.messageData);
                        }
                        break;
                    case 'image':
                        if (this.onRecvdImage) {
                            console.log("messageId is " + data.messageId);

                            messageDataObj = JSON.parse(data.messageData);

                            console.log("messageData fileName is " + messageDataObj.fileName);
                            base64Image = messageDataObj.thumbnail;
                            //var thumbnailImage = Base64Binary.decodeArrayBuffer(base64Image);  

                            var imageUrl = "https://" + this.host + "/uploads/" + messageDataObj.fileName;
                            console.log("recvd image url is " + imageUrl);
                            this.onRecvdImage(data.messageId, base64Image, imageUrl);
                        }
                        break;
                    case 'video':
                        if (this.onRecvdVideo) {
                            console.log("messageId is " + data.messageId);

                            messageDataObj = JSON.parse(data.messageData);

                            console.log("messageData fileName is " + messageDataObj.fileName);
                            base64Image = messageDataObj.thumbnail;
                            //var thumbnailImage = Base64Binary.decodeArrayBuffer(base64Image);  

                            var videoUrl = "https://" + this.host + "/uploads/" + messageDataObj.fileName;
                            console.log("recvd video url is " + videoUrl);
                            this.onRecvdVideo(data.messageId, videoUrl);

                            /*
                            var videoUrl = "https://" + this.host + "/uploads/" + data.videoName;
                            console.log("recvd video url is " + videoUrl);
                            this.onRecvdVideo(data.messageId, videoUrl);
                            */
                        }
                        break;
                    default:
                        break;
                } 
            }

            if (data.command == 'sendImage') {
                console.log('recvd sendImage');
                if (this.onRecvdImage) {
                    var imageUrl = "https://" + this.host + "/uploads/" + data.imageName;
                    console.log("recvd image url is " + imageUrl);
                    this.onRecvdImage(imageUrl);
                }
            }

            if (data.command == 'sendVideo') {
                console.log('recvd sendVideo');
                if (this.onRecvdVideo) {
                    var videoUrl = "https://" + this.host + "/uploads/" + data.videoName;
                    console.log("recvd video url is " + videoUrl);
                    this.onRecvdVideo(videoUrl);
                }
            }
        }.bind(this);

        connection.onerror = function (error) {
            console.log("recvd error");
            console.log(error);
            //this.reconnect();
        }.bind(this);

        connection.onclose = function (error) {
            console.log("websocket closed");
            console.log(error);
            if (this.onClose) {
                this.onClose();
            }
            this.reconnect();
        }.bind(this);
    },
    
    reconnect: function () {
        var refThis = this;
        console.log("inside reconnect");
        if (this.onReconnect) {
            this.onReconnect();
        }

        reconnectTime = this.reconnectInterval * 1000;
        if (this.reconnectInterval <= this.maxInterval) {
            this.reconnectInterval = 2 * this.reconnectInterval;
        }
        // try to reconnect
        setTimeout(function() {
            refThis.connect();
        }, reconnectTime);
    },
    
    reconnectToSession : function (sessionId, agentName) {
        console.log("inside reconnect to session");
        data = {sessionId: sessionId, agentName: agentName};
        this.sendCommand('reconnectAgentToSession', data);
    },
    
    sendCommand: function (command, data) {
        console.log("sendCommand for  " + command);
        console.log("sendCommand data is " + JSON.stringify(data));
        data.command = command;
        strData = JSON.stringify(data);
        console.log("strData is " + strData);
        this.connection.send(strData);
    },

    addAgent: function(agentUserId, agentEmail, agentName, companyId) {
        console.log("inside addAgent for " + agentUserId);
        
        this.agentUserId = agentUserId;
        this.agentEmail = agentEmail;
        this.agentName = agentName;
        this.companyId = companyId;

        data = {userid: agentUserId, companyId : this.companyId, agentName : agentName, name: this.agentName};
        this.sendCommand('addAgent', data);
    },

    /*
    login: function(agentName, password) {
        console.log("inside login for " + agentName);
        this.agentName = agentName;
        data = {email: agentName, companyId : this.companyId, password : password};
        this.sendCommand('agentLogin', data);
    },
    */

    endSession: function (sessionId) {
        data = {sessionId: sessionId};
        this.sendCommand('endSession', data);
    },

    acceptRequest: function (sessionId, customerId) {
        console.log('inside acceptRequest');
        data = {companyId : this.companyId, agentName : this.agentName, 'customerId' : customerId, 'sessionId' : sessionId};
        this.sendCommand('acceptRequestForAgent', data);
    },

    sendTextMessage : function (sessionId, messageId, txtMessage) {
        data = {sessionId: sessionId, messageId : messageId, messageType: 'text', messageData : txtMessage};
        this.sendCommand('sendMessage', data);
        /*
        data = {sessionId: sessionId, text : txtMessage};
        this.sendCommand('sendText', data);
        */
    },

    sendImage : function (sessionId, messageId, messageData) {
        console.log("sendMessage image for messageId " + messageId);

        data = {sessionId: sessionId, messageId : messageId, messageType: 'image', messageData : messageData};
        this.sendCommand('sendMessage', data);
        /*
        data = {sessionId: sessionId, imageName : imageName};
        this.sendCommand('sendImage', data);
        */
    },

    sendVideo : function (sessionId, messageId, messageData) {
        console.log("sendMessage video for messageId " + messageId);

        data = {sessionId: sessionId, messageId : messageId, messageType: 'video', messageData : messageData};
        this.sendCommand('sendMessage', data);
        /*
        data = {sessionId: sessionId, messageId: messageId, videoName : videoFile};
        this.sendCommand('sendVideo', data);
        */
    },

    sendWebRTCMessage : function () {

    },

};

