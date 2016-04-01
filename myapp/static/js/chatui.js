/**
 * Return a timestamp with the format "m/d/yy h:MM:ss TT"
 * Commenting out date since only interested showing time.
 *
 * @type {Date}
 */

/**
 * Invoked when a keyup is detected from send chat message inputfield.
 * If the textfield has any chacters the send button is enabled.
 */

// from https://github.com/brunobar79/J-I-C
// javascript library for compressing images
// we need to compress images before we send them as part of a message


$(document).ready(function() {
    $('.image-link').magnificPopup({type:'image'});
});

function setImageSize(imgElement) {
    var width = $(imgElement).width();
    var height = $(imgElement).height();
    var newwidth = 96;
    var newheight = 96;
    var clipBottom = 0;
    var clipRight = 0;
    if (width > height) {
        newwidth = Math.round((width/height) * 96);
        clipRight = newwidth - 96;
    } else if (height > width) {
        newheight = Math.round((height/width) * 96);
        clipBottom = newheight - 96;
    } 
    console.log("width is " + width);
    console.log("height is " + height);
    console.log("newwidth is " + newwidth);
    console.log("newheight is " + newheight);
    console.log("element is " + $(imgElement).attr('src'));
    $(imgElement).attr('width', newwidth + 'px');
    $(imgElement).attr('height', newheight + 'px');
    $(imgElement).css("clip-path", "inset(0px " + clipRight + "px " + clipBottom + "px 0px round 5% 5% 5% 5%)");
    $(imgElement).css("-webkit-clip-path", "inset(0px " + clipRight + "px " + clipBottom + "px 0px round 5% 5% 5% 5%)");
    $(imgElement).css("display", "block");

}

// from http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
//      answer from Briguy37
function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function uploadFile() {
/*    
    $(':button').click(function(){
    var formData = new FormData($('form')[0]);
    $.ajax({
        url: 'uploadImage/upload.php',  //Server script to process data
        type: 'POST',
        xhr: function() {  // Custom XMLHttpRequest
            var myXhr = $.ajaxSettings.xhr();
            if(myXhr.upload){ // Check if upload property exists
                myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // For handling the progress of the upload
            }
            return myXhr;
        },
        //Ajax events
        beforeSend: beforeSendHandler,
        success: completeHandler,
        error: errorHandler,
        // Form data
        data: formData,
        //Options to tell jQuery not to process data or worry about content-type.
        cache: false,
        contentType: false,
        processData: false
    });
    });
}
*/
}

function scrollToBottom() {
    var recvdMsgs = $("#received-messages");
    if (recvdMsgs) {
        console.log("scroll to bottom for recvdMsgs");
        var curPos = recvdMsgs.scrollTop();
        console.log("curPos is " + curPos);
        console.log("chatWindow scrolltop is " + $(".chat-window").scrollTop());
        var scrollHeight = $(".chat-window")[0].scrollHeight;
        console.log("scrollHeight is " + scrollHeight);
        $(".chat-window").animate({scrollTop:scrollHeight}, '500');
    }
}

function chngSendButtonStatus() {
  if($('#chatinput').val().length > 0) {
      // $('#send-chatmsg').prop("disabled", false);
      $('#send-chatmsg').button({ disabled: false });
  } else {
      // $('#send-chatmsg').prop("disabled", true);
      $('#send-chatmsg').button({ disabled: true });
  }
}

function timeStamp() {
    // Create a date object with the current time
    var now = new Date();

    // Create an array with the current month, day and time
    // var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

    // Create an array with the current hour, minute and second
    var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

    // Determine AM or PM suffix based on the hour
    var suffix = ( time[0] < 12 ) ? "AM" : "PM";

    // Convert hour from military time
    time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

    // If hour is 0, set it to 12
    time[0] = time[0] || 12;

    // If seconds and minutes are less than 10, add a zero
    for ( var i = 1; i < 3; i++ ) {
        if ( time[i] < 10 ) {
            time[i] = "0" + time[i];
        }
    }

    // Return the formatted string. The commmented out version is for full datetime
    // only interested in time.
    // return date.join("/") + " " + time.join(":") + " " + suffix;
    return time.join(":") + " " + suffix;
}


var kfChatUI = {
    ws: null,
    agentData: {},
    customerName: "",

    /*
     * adds message text to chat area.
     *
     *      Params:
     *          msg: msg text.
     *          type: 'INBOUND' or 'OUTBOUND'. Represents if this is a
     *              received or sent message. sent messages are right
     *              oriented.
     *          class: 'img' or 'txt'. each type of message is handled differently by application.
     */
    addMsg: function (messageId, msg, type, msg_class) {
        console.log("inside addMsg ");
        if(msg_class === 'txt') {
            if(type === 'OUTBOUND') {
                //testing code for message txt alignment
                /*
                $('#received-messages').append(
                    "<div class=\"bubbledRight\">" +
                        msg +
                        "<div id=\"msg_tmstmp\">" +
                        timeStamp() +
                        "</div>" +
                    "</div>"
                );
*/
                var outbound_html =
                    "<div class='direct-chat-msg right' id='" + messageId + "'>" + 
                      "<div class='direct-chat-info clearfix'>" +
                        "<span class='direct-chat-name pull-right'>" + this.agentData.name + "</span>" +
                        "<span class='direct-chat-timestamp pull-left'>" + moment().format("DD/MM/YYYY h:mm:ss a ZZ") + "</span>" +
                      "</div>" +
                      "<img class='direct-chat-img' src='/static/images/logo.png' alt='SupportGenie Agent'>" +
                      "<div class='direct-chat-text'>" + msg + "</div>" +
                    "</div>";
                $('#received-messages').append(outbound_html);
            } else if(type === 'INBOUND') {
                /*
                $('#received-messages').append(
                    "<div class=\"bubbledLeft\">" +
                        msg +
                        "<div id=\"msg_tmstmp\">" +
                        timeStamp() +
                        "</div>" +
                    "</div>"
                );
*/
                var inbound_html =
                    "<div class='direct-chat-msg' id='" + messageId + "'>" +
                      "<div class='direct-chat-info clearfix'>" +
                        "<span class='direct-chat-name pull-left'>" + customerName + "</span>" +
                        "<span class='direct-chat-timestamp pull-right'>" + moment().format("DD/MM/YYYY h:mm:ss a ZZ") + "</span>" +
                      "</div>" +
                      "<img class='direct-chat-img' src='/static/images/logo.png' alt='SupportGenie'>" +
                      "<div class='direct-chat-text'>" + msg + "</div>" +
                    "</div>";
                $('#received-messages').append(inbound_html);
            } else {
                console.log("ERROR - Problem with chat message style type functionality.");
            }
        }else if(msg_class === 'img') {
            //console.log("Image recevied. msg size " + msg.length);
            // p_contents = msg.text();

            if(type === 'OUTBOUND') {
                /*
                $('#received-messages').append(
                    "<div class=\"bubbledRight\"><input type='button' class='button' value='Image'  onclick='btnShowImgInDiv(msg)'/></div>");
*/
/*
                $('#received-messages').append(
                    "<div class=\"img-right\">" +
                    "<img src=\"" + msg + "\" alt=\"\" />" +
                    "</div>");
*/
/*
                $('#received-messages').append(
                    "<div class=\"img-right\" id='" + messageId + "'>" +
                    "<a href=\"" + msg.imageUrl + "\" class=\"image-link\">" +
                    "<img src=\"data:image/jpeg;base64," + msg.thumbnailImageBase64 + "\" alt=\"\" />" +
                    "</a>" +
                    "</div>");
                $(".img-right img").load(function() {
                    console.log("img-right img load");
                    setImageSize(this);
                });
*/

                $('#received-messages').append(
                    "<div class=\"img-right\" id='" + messageId + "'>" +
                    "<img src=\"data:image/jpeg;base64," + msg + "\" alt=\"\" />" +
                    "</div>");
                    $(".img-right img").load(function() {
                    console.log("img-right img load");
                    setImageSize(this);
                });

                // from http://stackoverflow.com/questions/22954433/magnific-popup-how-to-get-image-url-from-img-src
                $('.img-right').magnificPopup(
                    {
                        delegate: 'img' ,
                        type: 'image',
                        gallery: { enabled:false },

                        callbacks: {
                            elementParse: function(item) { item.src = item.el.attr('src'); }
                        }
                    });

            } else if(type === 'INBOUND') {
                /*
                $('#received-messages').append(
                    "<div class=\"bubbledLeft\"><input type='button' class='button' value='Image'" +
                        "onclick='showImage(\"" +
                            msg +
                             "\")' />" +
                        "<div id=\"msg_tmstmp\">" +
                            timeStamp() +
                        "</div>" +
                    "</div>"
                );
*/
                $('#received-messages').append(
                    "<div class=\"img-left\" id='" + messageId + "'>" +
                    "<a href=\"" + msg.imageUrl + "\" class=\"image-link\">" +
                    "<img src=\"data:image/jpeg;base64," + msg.thumbnailImageBase64 + "\" alt=\"\" />" +
                    "</a>" +
                    "</div>");
                $(".img-left img").load(function() {
                    setImageSize(this);
                });

            }else
                console.log("ERROR - Problem with chat message style type functionality.");
         } else if(msg_class === 'vid') {
            console.log("Video recevied. msg contents: " + msg);
            // p_contents = msg.text();

            if(type === 'OUTBOUND') {
                /*
                $('#received-messages').append(
                    "<div class=\"bubbledRight\"><input type='button' class='button' value='Video'  onclick='btnShowVidInDiv(msg)'/></div>");
                */
                $('#received-messages').append(
                    "<div class=\"video-right\" id='" + messageId + "'>" +
                        "<video class=\"video-js vjs-default-skin vjs-big-play-centered\" height=\"180\" controls>" +
                            "<source src=\"" + msg + "\" />" +
                        "</video>" + 
                    "</div>");
            } else if(type === 'INBOUND') {
/*
                $('#received-messages').append(
                    "<div class=\"bubbledLeft\"><input type='button' class='button' value='Video'" +
                        "onclick='showImage(\"" +
                             msg +
                             "\")' />" +
                        "<div id=\"msg_tmstmp\">" +
                            timeStamp() +
                        "</div>" +
                    "</div>"
                );
*/
                $('#received-messages').append(
                    "<div class=\"video-left\" id='" + messageId + "'>" +
                        "<video class=\"video-js vjs-default-skin vjs-big-play-centered\" height=\"180\" controls>" +
                            "<source src=\"" + msg + "\" />" +
                        "</video>" + 
                    "</div>");

            }else
                console.log("ERROR - Problem with chat message style type functionality.");
        } else
            console.log("ERROR - Problem with chat message style class functionality.");

        // scroll to last message received/sent.
        //$('#received-messages').scrollTop($('#received-messages')[0].scrollHeight);
        scrollToBottom();
    },

    onRecvdTxt: function(messageId, message) {
        console.log(message);
        this.addMsg(messageId, message, 'INBOUND','txt');
    },

    onRecvdImage: function(messageId, thumbnailImgBase64, imageUrl) {
        console.log("onRecvdImage for image " + imageUrl);
        var message = {'thumbnailImageBase64' : thumbnailImgBase64, 'imageUrl' : imageUrl};
        this.addMsg(messageId, message, 'INBOUND','img');
    },

    onRecvdVideo: function(messageId, message) {
        console.log("onRecvdVideo for video " + message);
        this.addMsg(messageId, message, 'INBOUND','vid');
    },
    /**
     * params:
     * s - string to send. (this means file is being sent)
     * if not passed (undefined) then send text from input textarea.
     */
    sendText: function(sessionId, msgtxt) {
        console.log("inside snd_msg");
        //var msgtxt = $('#chatinput').val();
        console.log("inside snd_msg : msg_txt is " + msgtxt);
        $('#chatinput').val('');

        //chngSendButtonStatus();
        var messageId = generateUUID();
        console.log("inside snd_msg : messageId is " + messageId);

        this.ws.sendTextMessage(sessionId, messageId, msgtxt);
        this.addMsg(messageId, msgtxt, 'OUTBOUND','txt');
    },

    sendImage: function(filedata) {
        console.log("inside sendImage");
        var messageId = generateUUID();
        console.log("inside snd_msg : messageId is " + messageId);
        this.addMsg(messageId, filedata, 'OUTBOUND','img');

        return messageId;
    },

    sendVideo: function(filedata) {
        console.log("inside sendVideo");
        var messageId = generateUUID();
        console.log("inside snd_msg : messageId is " + messageId);
        this.addMsg(messageId, filedata, 'OUTBOUND','vid');

        return messageId;
    },
};

function showImage(imageName) {
    console.log("showImage for " + imageName);

    $('#panel-images').find('img').remove();
    $('#panel-images').find('video').remove();

    var img = $("<img src='http://localhost:9072/uploads/" + imageName + "' class='img_content'/>");

    $('#panel-images').prepend(img);
}

function onShowImage(imageName) {
    console.log("inside onShowImage " + imageName);

    return false;
}


