
var kfWebRTC = {
    init : function(localVideo, remoteVideo, ws, sessionId) {
    	this.isStarted = false;
    	this.pc = null;
    	this.isInitiator = false;
    	this.initialized = true;
    	this.localStream = null;
    	this.remoteStream = null;
    	this.isChannelReady = true;
    	this.webrtcDetectedBrowser = 'chrome';
    	this.localVideo = localVideo,
    	this.remoteVideo = remoteVideo;
    	this.ws = ws;
    	this.sessionId = sessionId;

		console.log('this is .' + this);
		console.log('this.ws is .' + this.ws);

		var constraints = {video: true, audio: true};
		
		this.pc_config = this.webrtcDetectedBrowser === 'firefox' ?
							{'iceServers':[{'url':'stun:23.21.150.121'}]} : // number IP
							{'iceServers': [{'url':'turn:numb.viagenie.ca', 'username' : 'tarun@nublara.com', 'credential' : 'kingfisher'}]};

		this.pc_constraints = {
								'optional': [
								{'DtlsSrtpKeyAgreement': true},
								{'RtpDataChannels': true}
							]};

		// Set up audio and video regardless of what devices are present.
		this.sdpConstraints = {'mandatory': {
							'OfferToReceiveAudio':true,
							'OfferToReceiveVideo':true }};

		getUserMedia(constraints, 		
			function (stream) {
				console.log('handleUserMedia');
				this.localStream = stream;
				attachMediaStream(this.localVideo, stream);
				console.log('Adding local stream.');
				console.log('this is .' + this);
				console.log('this.ws is .' + this.ws);
				this.sendWebRTCMessage({'type' : 'got user media'});
				if (this.isInitiator) {
					this.maybeStart();
				}
			}.bind(this),
			function (error) {
				console.log('getUserMedia error: ', error);
			}.bind(this));
		console.log('Getting user media with constraints', constraints);
    },

    stopVideo : function () {
    	this.stop();
    	this.sendWebRTCMessage({'type' : 'bye'});
    },

    stopLocalVideo : function() {
    	if (this.localStream) {
	    	this.localStream.stop();
	    	this.localStream = null;
	    }
    },

	stop : function () {
		this.isStarted = false;
		// isAudioMuted = false;
		// isVideoMuted = false;
		if (this.pc) {
			this.pc.close();
			this.pc = null;
		} 
	},

    onMessage: function (message) {
		console.log("inside onMessage");
		console.log("message.type  is " + message.type );
		console.log("message  is " + message );

		if ((this.initialized == undefined) || (!this.initialized)) {
			console.log("Error - not initialized");
			return;
		}
		if (message.type === 'got user media') {
			this.maybeStart();
		} else if (message.type === 'offer') {
			this.handleOffer(message);
		} else if (message.type === 'answer' && this.isStarted) {
			this.handleAnswer(message);
		} else if (message.type === 'candidate' && this.isStarted) {
			this.handleCandidate(message);
		} else if (message.type === 'bye' && this.isStarted) {
			this.handleRemoteHangup();
		}
    },

	onError : function (error) {
	  console.log("recvd error");
	  console.log(error);
	},

	onclose : function (error) {
	  console.log("websocket closed");
	  console.log(event.data);
	},

	/***
	private functions 
	****/
	handleOffer : function (message) {
		console.log("inside handleOffer");
		if (!this.isInitiator && !this.isStarted) {
			console.log("maybe start");
			this.maybeStart();
		}
		this.pc.setRemoteDescription(new RTCSessionDescription(message));
		this.doAnswer();
		console.log("inside handleOffer done");
	},

	handleAnswer : function (message) {
		console.log("inside handleAnswer");
		this.pc.setRemoteDescription(new RTCSessionDescription(message));
		console.log("inside handleAnswer done");
	},

	handleCandidate : function (message) {
		console.log("inside handleCandidate");
		var candidate = new RTCIceCandidate( { sdpMLineIndex:message.label,
												candidate:message.candidate });
		console.log("adding ice candidate");
		this.pc.addIceCandidate(candidate);
	},

	maybeStart : function () {
		if (!this.isStarted && this.localStream && this.isChannelReady) {
			this.createPeerConnection();
			this.pc.addStream(this.localStream);
			this.isStarted = true;
			console.log("inside maybeStart - stream added");
			if (this.isInitiator) {
				console.log("inside maybeStart - doCall");
				this.doCall();
			}
		}
	},

	doCall : function () {
		console.log("inside doCall");
		var constraints = {'optional': [], 'mandatory': {'MozDontOfferDataChannel': true}};
		// temporary measure to remove Moz* constraints in Chrome
		if (this.webrtcDetectedBrowser === 'chrome') {
			for (var prop in constraints.mandatory) {
				if (prop.indexOf('Moz') !== -1) {
					delete constraints.mandatory[prop];
				}
			}
		}
		constraints = mergeConstraints(constraints, sdpConstraints);
		console.log('Sending offer to peer, with constraints: \n' +
			'  \'' + JSON.stringify(constraints) + '\'.');
		this.pc.createOffer(this.setLocalAndSendMessage.bind(this), null, constraints);
	},

	doAnswer : function () {
		console.log('doAnswer - Sending answer to peer.');
		this.pc.createAnswer(this.setLocalAndSendMessage.bind(this), null, this.sdpConstraints);
		console.log('doAnswer - done.');
	},

	createPeerConnection : function () {
		try {
			pc = new RTCPeerConnection(this.pc_config, this.pc_constraints);
			this.pc = pc;
			pc.onicecandidate = this.handleIceCandidate.bind(this);
			console.log('Created RTCPeerConnnection with:\n' +
						'  config: \'' + JSON.stringify(this.pc_config) + '\';\n' +
						'  constraints: \'' + JSON.stringify(this.pc_constraints) + '\'.');
		} catch (e) {
			console.log('Failed to create PeerConnection, exception: ' + e.message);
			alert('Cannot create RTCPeerConnection object.');
			return;
		}
		pc.onaddstream = this.handleRemoteStreamAdded.bind(this);
		pc.onremovestream = this.handleRemoteStreamRemoved.bind(this);

		if (this.isInitiator) {
			try {
				// Reliable Data Channels not yet supported in Chrome
				sendChannel = pc.createDataChannel("sendDataChannel",
								{reliable: false});
				sendChannel.onmessage = function (event) {
					console.log("recvd message " + event.data);
				}.bind(this);
				trace('Created send data channel');
			} catch (e) {
				alert('Failed to create data channel. ' +
				'You need Chrome M25 or later with RtpDataChannel enabled');
				trace('createDataChannel() failed with exception: ' + e.message);
			}

			sendChannel.onopen = function (event) {
				var readyState = sendChannel.readyState;
				trace('Send channel state is: ' + readyState);
			}.bind(this);

			sendChannel.onclose = function (event) {
				var readyState = sendChannel.readyState;
				trace('Send channel state is: ' + readyState);
			}.bind(this);
		} else {
			pc.ondatachannel = function(event) {
				this.gotReceiveChannel(event);
			}.bind(this);
		}
        console.log("createPeerConnection done");
	},

	handleRemoteHangup : function () {
		console.log('Session terminated.');
		this.stop();
		this.isInitiator = false;
	},

	handleIceCandidate : function (event) {
		console.log('handleIceCandidate event: ', event);
		if (event.candidate) {
			this.sendWebRTCMessage({
				type: 'candidate',
				label: event.candidate.sdpMLineIndex,
				id: event.candidate.sdpMid,
				candidate: event.candidate.candidate});
		} else {
			console.log('End of candidates.');
		}
	},

	handleRemoteStreamAdded : function (event) {
		console.log('Remote stream added.');
		console.log("remote video is " + this.remoteVideo);
		// reattachMediaStream(miniVideo, this.localVideo);
		attachMediaStream(this.remoteVideo, event.stream);
		this.remoteStream = event.stream;
		console.log("handleRemoteStreamAdded done ");
	//  waitForRemoteVideo();
	},

	handleRemoteStreamRemoved : function (event) {
	  console.log('Remote stream removed. Event: ', event);
	  this.remoteStream = null;
	},

	sendWebRTCMessage : function (message) {
		console.log('this is .' + this);
		console.log('this.ws is .' + this.ws);
		console.log('sendWebRTCMessage ' + message);
		message.sessionId = this.sessionId;
		this.ws.sendCommand('webrtc', message);
	},

	// TODO: check this later
	gotReceiveChannel : function (event) {
		trace('Receive Channel Callback');
		sendChannel = event.channel;
		sendChannel.onmessage = this.handleMessage;
		sendChannel.onopen = this.handleReceiveChannelStateChange;
		sendChannel.onclose = this.handleReceiveChannelStateChange;
	},

	handleMessage : function (event) {
	  trace('Received message: ' + event.data);
	  //receiveTextarea.value = event.data;
	},

	handleReceiveChannelStateChange : function () {
		var readyState = sendChannel.readyState;
		console.log('Receive channel state is: ' + readyState);
		//  enableMessageInterface(readyState == "open");
	},

	setLocalAndSendMessage : function (sessionDescription) {
		// Set Opus as the preferred codec in SDP if Opus is present.
		//sessionDescription.sdp = preferOpus(sessionDescription.sdp);
        console.log("inside setLocalAndSendMessage");
        this.pc.setLocalDescription(sessionDescription);
        var message = {};
        message.sdp = sessionDescription.sdp;
        message.type = sessionDescription.type;
		this.sendWebRTCMessage(message);
        console.log("inside setLocalAndSendMessage done");
	},

};

