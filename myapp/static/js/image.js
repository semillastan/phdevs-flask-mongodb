/**
 * functions to manipulate images
 */
$(document).ready(function() {
  console.log("image.js loaded");
});

function getFileExt(filename) {
    var a = filename.split(".");
    if( a.length === 1 || ( a[0] === "" && a.length === 2 ) ) {
        return "";
    }
    return a.pop();
}

function getUniqueFileName(filename, messageId) {
    var fileext = getFileExt(filename);
    if (fileext.length > 0) {
        uniquefilename = messageId + "." + fileext;
    }
    return uniquefilename;
}


function sendFile(sessionId, file) {
    console.log("file changed - sendFile");
    if( ( /image/i ).test( file.type ) ) {
      processImage(sessionId, file);
    } else if ( ( /video/i ).test( file.type ) ) {
      console.log("file.type video is " + file.type);
      processVideo(sessionId, file);
    }

    /*
    if (file) {
        var name = file.name;
        var size = file.size;
        var type = file.type;

        console.log("name is " + name);
        console.log("type is " + type);
        console.log("size is " + size);

        /*
        var formData = new FormData($('form')[0]);
        $.ajax({
            url: 'uploadImage',  //Server script to process data
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
        */
        /*
        var fr = new FileReader();
        if (type.startsWith("image")) {
//            fr.onload = imageHandler;  
            fr.onload = function(e) {
                    console.log("inside imageHandler");
                    kfChatUI.sendImage(fr.result);

            }
        } else if (type.startsWith("video")) {
            fr.onload = videoHandler;  
        }
        fr.readAsDataURL(file); 
        */
        /*
        var fd = new FormData();    
        fd.append( 'uploadedfile', file );
        fd.append('uniquefilename', uniquefilename);

        $.ajax({
          url: 'https://104.236.158.168:9074/uploadImage',
          data: fd,
          processData: false,
          contentType: false,
          type: 'POST',
          success: function(data) {
                console.log("file upload finished");
                if (type.startsWith("image")) {
                   kfWebService.sendImage(sessionId, uniquefilename);
                } else if (type.startsWith("video")) {
                   kfWebService.sendVideo(sessionId, uniquefilename);
                }
            }
        });
        */
        /*
    }
    */
}

/*
function uploadFile(sessionId, file, uniquefilename, thumbnailData) {
    var name = file.name;
    var size = file.size;
    var type = file.type;

    console.log("inside uploadFile uniquefilename " + uniquefilename);

    var fd = new FormData();    
    fd.append( 'uploadedfile', file );
    fd.append('uniquefilename', uniquefilename);

    $.ajax({
      url: 'https://104.236.158.168:9074/uploadImage',
      data: fd,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(data) {
            console.log("file upload finished");
            if (type.startsWith("image")) {
               kfWebService.sendImage(sessionId, uniquefilename, thumbnailData);
            } else if (type.startsWith("video")) {
               kfWebService.sendVideo(sessionId, uniquefilename, thumbnailData);
            }
        }
    });

}

*/

/*
var fileinput = document.getElementById('fileinput');

var max_width = fileinput.getAttribute('data-maxwidth');
var max_height = fileinput.getAttribute('data-maxheight');

var preview = document.getElementById('preview');

var form = document.getElementById('form');
*/

function processImage(sessionId, file) {
    if( !( /image/i ).test( file.type ) ) {
      alert( "File " + file.name + " is not an image." );
      return false;
    }

    // read the files
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = function (event) {
      // this is used for display
      var imageBase64Data = _arrayBufferToBase64(event.target.result);  
      var messageId = kfChatUI.sendImage(imageBase64Data);
      console.log("processImage messageId is " + messageId);

      // now we need to create thumbnail with smaller size to send over the network
      // blob stuff
      var blob = new Blob([event.target.result]); // create blob...
      window.URL = window.URL || window.webkitURL;
      var blobURL = window.URL.createObjectURL(blob); // and get it's URL
      
      // helper Image object
      var image = new Image();
      image.src = blobURL;
      //preview.appendChild(image); // preview commented out, I am using the canvas instead
      image.onload = function() {
        var max_width = 90;
        var max_height = 90;
        // have to wait till it's loaded
        var resized = resizeMe(image, max_width, max_height); // send it to canvas
        console.log("resized image length is " + resized.length);

        var name = file.name;
        var size = file.size;
        var type = file.type;


        var uniquefilename = getUniqueFileName(name, messageId);
        console.log("inside uploadFile uniquefilename " + uniquefilename);

        var fd = new FormData();    
        fd.append( 'uploadedfile', file );
        fd.append('uniquefilename', uniquefilename);

        $.ajax({
          url: 'https://supportgenie.io:9074/uploadImage',
          data: fd,
          processData: false,
          contentType: false,
          type: 'POST',
          success: function(data) {
                console.log("file upload finished");
                if (type.startsWith("image")) {
                  messageData = {};
                  messageData.thumbnail = resized;
                  messageData.fileName = uniquefilename;
                  messageData.localFileName = name;
                  messageData.extension = getFileExt(name);
                  messageData.mimeType = "image/jpeg";
                  if (resized.substring(0, 23) == "data:image/jpeg;base64,") {
                    messageData.thumbnail = resized.substring(23);
                  } else {
                    messageData.thumbnail = resized;
                  }

                  kfWebService.sendImage(sessionId, messageId, messageData);
                } else if (type.startsWith("video")) {
                  messageData = {};

                  if (resized.substring(0, 23) == "data:image/jpeg;base64,") {
                    messageData.thumbnail = resized.substring(23);
                  } else {
                    messageData.thumbnail = resized;
                  }
                  messageData.fileName = uniquefilename;
                  kfWebService.sendVideo(sessionId, messageId, messageData);
                }
            }
        });

        /*
        var newinput = document.createElement("input");
        newinput.type = 'hidden';
        newinput.name = 'images[]';
        newinput.value = resized; // put result from canvas into new hidden input
        form.appendChild(newinput);
        */
      }
    };
}


function processVideo(sessionId, file) {
    if( !( /video/i ).test( file.type ) ) {
      alert( "File " + file.name + " is not a video." );
      return false;
    }

    // read the files
    var reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = function (event) {
      var messageId = kfChatUI.sendVideo(event.target.result);

      console.log("messageId is " + messageId);

      var name = file.name;
      var size = file.size;
      var type = file.type;

      var uniquefilename = getUniqueFileName(name, messageId);
      console.log("inside uploadFile uniquefilename " + uniquefilename);

      var fd = new FormData();    
      fd.append( 'uploadedfile', file );
      fd.append('uniquefilename', uniquefilename);

      $.ajax({
        url: 'https://supportgenie.io:9074/uploadImage',
        data: fd,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data) {
              console.log("file upload finished");
              if (type.startsWith("video")) {
                messageData = {};
                messageData.fileName = uniquefilename;
                messageData.localFileName = name;
                messageData.extension = getFileExt(name);
                messageData.mimeType = "video/" + messageData.extension;

                kfWebService.sendVideo(sessionId, messageId, messageData);
              }
          }
      });

    };


    /*
    // read the files
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = function (event) {
      // this is used for display
      var imageBase64Data = _arrayBufferToBase64(event.target.result);  
      var messageId = kfChatUI.sendImage(imageBase64Data);
      console.log("processImage messageId is " + messageId);

      // now we need to create thumbnail with smaller size to send over the network
      // blob stuff
      var blob = new Blob([event.target.result]); // create blob...
      window.URL = window.URL || window.webkitURL;
      var blobURL = window.URL.createObjectURL(blob); // and get it's URL
      
      // helper Image object
      var image = new Image();
      image.src = blobURL;
      //preview.appendChild(image); // preview commented out, I am using the canvas instead
      image.onload = function() {
        var max_width = 90;
        var max_height = 90;
        // have to wait till it's loaded
        var resized = resizeMe(image, max_width, max_height); // send it to canvas
        console.log("resized image length is " + resized.length);

        var name = file.name;
        var size = file.size;
        var type = file.type;


        var uniquefilename = getUniqueFileName(name, messageId);
        console.log("inside uploadFile uniquefilename " + uniquefilename);

        var fd = new FormData();    
        fd.append( 'uploadedfile', file );
        fd.append('uniquefilename', uniquefilename);

        $.ajax({
          url: 'https://supportgenie.io:9074/uploadImage',
          data: fd,
          processData: false,
          contentType: false,
          type: 'POST',
          success: function(data) {
                console.log("file upload finished");
                if (type.startsWith("image")) {
                  messageData = {};
                  messageData.thumbnail = resized;
                  messageData.fileName = uniquefilename;
                  messageData.localFileName = name;
                  messageData.extension = getFileExt(name);
                  messageData.mimeType = "image/jpeg";
                  if (resized.substring(0, 23) == "data:image/jpeg;base64,") {
                    messageData.thumbnail = resized.substring(23);
                  } else {
                    messageData.thumbnail = resized;
                  }

                  kfWebService.sendImage(sessionId, messageId, messageData);
                } else if (type.startsWith("video")) {
                  messageData = {};

                  if (resized.substring(0, 23) == "data:image/jpeg;base64,") {
                    messageData.thumbnail = resized.substring(23);
                  } else {
                    messageData.thumbnail = resized;
                  }
                  messageData.fileName = uniquefilename;
                  kfWebService.sendVideo(sessionId, messageId, messageData);
                }
            }
        });

*/

        /*
        var newinput = document.createElement("input");
        newinput.type = 'hidden';
        newinput.name = 'images[]';
        newinput.value = resized; // put result from canvas into new hidden input
        form.appendChild(newinput);
        */
        /*
      }
    };
    */
}


function readfiles(files) {
  
    // remove the existing canvases and hidden inputs if user re-selects new pics
    var existinginputs = document.getElementsByName('images[]');
    var existingcanvases = document.getElementsByTagName('canvas');
    while (existinginputs.length > 0) { // it's a live list so removing the first element each time
      // DOMNode.prototype.remove = function() {this.parentNode.removeChild(this);}
      form.removeChild(existinginputs[0]);
      preview.removeChild(existingcanvases[0]);
    } 
  
    for (var i = 0; i < files.length; i++) {
      processfile(files[i]); // process each file at once
    }
    fileinput.value = ""; //remove the original files from fileinput
    // TODO remove the previous hidden inputs if user selects other files
}
/*
// this is where it starts. event triggered when user selects files
fileinput.onchange = function(){
  if ( !( window.File && window.FileReader && window.FileList && window.Blob ) ) {
    alert('The File APIs are not fully supported in this browser.');
    return false;
    }
  readfiles(fileinput.files);
}
*/

// === RESIZE ====

function resizeMe(img, max_width, max_height) {
  var canvas = document.createElement('canvas');

  var width = img.width;
  var height = img.height;

  // calculate the width and height, constraining the proportions
  if (width > height) {
    if (width > max_width) {
      //height *= max_width / width;
      height = Math.round(height *= max_width / width);
      width = max_width;
    }
  } else {
    if (height > max_height) {
      //width *= max_height / height;
      width = Math.round(width *= max_height / height);
      height = max_height;
    }
  }
  
  // resize the canvas and draw the image data into it
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  
  //preview.appendChild(canvas); // do the actual resized preview
  
  return canvas.toDataURL("image/jpeg",0.6); // get the data from canvas as 70% JPG (can be also PNG, etc.)

}

function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

