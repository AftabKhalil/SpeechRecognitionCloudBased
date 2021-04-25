//Disclaimer : The code is copied from an online source

//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;
var gumStream;
//stream from getUserMedia() 
var rec;
//Recorder.js object 
var input;
//MediaStreamAudioSourceNode we'll be recording 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext;
//new audio context to help us record 
var recordButton = document.getElementById("recordButton");
//add events to startRecording button
recordButton.addEventListener("click", startRecording);

function startRecording() {
    console.log("recordButton clicked");

    /* Simple constraints object, for more advanced audio features see
    https://addpipe.com/blog/audio-constraints-getusermedia/ */
    var constraints = {
        audio: true,
        video: false
    }

    /* Disable the record button until we get a success or fail from getUserMedia() */
    recordButton.disabled = true;

    /* We're using the standard promise based getUserMedia()
    https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia */

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
        /* assign to gumStream for later use */
        gumStream = stream;
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);
        /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
        rec = new Recorder(input, {
            numChannels: 1
        })
        //start the recording process 
        console.log("Recording started");
        rec.record()
        ShowProgress();
    }).catch(function (err) {
        //enable the record button if getUserMedia() fails 
        recordButton.disabled = false;
    });
}

function stopRecording() {
    //disable the stop button, enable the record too allow for new recordings 
    recordButton.disabled = false;
    //tell the recorder to stop the recording 
    rec.stop(); //stop microphone access 
    gumStream.getAudioTracks()[0].stop();
    //create the wav blob and pass it on to createDownloadLink 
    rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {

    var name = new Date().toISOString();
    var id = uuidv4();

    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');
    //add controls to the <audio> element 
    au.controls = true;
    au.src = url;
    au.style.paddingRight = "5px";
    au.style.marginBottom = "-3px";
    //link the a element to the blob 
    link.href = url;
    link.download = name + '.wav';
    link.innerHTML = link.download;
    //add the new audio and a elements to the li element 
    li.appendChild(au);
    li.appendChild(link);

    //upload link 
    var upload = document.createElement('a');
    upload.innerHTML = "Predict";
    upload.className = "btn btn-primary btn-custom2";
    upload.addEventListener("click", function (event) {

        var fd = new FormData();
        fd.append('audio', blob, name);

        $.ajax({
            url: base_url + "upload_file/",
            type: "POST",
            processData: false,

            data: fd,
            contentType: false,
            processData: false,
            success: function (r) {
                console.log(r);
                if (r.message === name) {
                    $('#' + id).text("file uploaded now predicting");
                    $('#' + id).addClass("text-success");
                    $.ajax({
                        url: base_url + "predict/",
                        method: "GET",
                        success: function (r) {
                            console.log(r);
                            $('#' + id).text("Predicted label is : '" + r.message + "'");
                        },
                        error: function (r) {
                            console.log(r);
                            $('#' + id).text(JSON.stringify(r));
                        }
                    });
                }
                else {
                    console.log(r);
                    $('#' + id).text(JSON.stringify(r));
                }
            },
            error: function (r) {
                console.log(r);
                $('#' + id).text(JSON.stringify(r));
            }
        });

    })
    li.appendChild(document.createTextNode(" ")) //add a space in between 
    li.appendChild(upload) //add the upload link to li
    li.appendChild(document.createTextNode(" ")) //add a space in between 

    var res = document.createElement('span');
    res.id = id;
    li.appendChild(res)

    //add the li element to the ordered list 
    recordingsList.appendChild(li);
}

//https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid/2117523#2117523
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


var interval, width = 0, elem = document.getElementById("progressbar");
async function ShowProgress() {
    if (width >= 199) {
        stopRecording();
        width = 0;
        elem.style.width = width;
    }
    else {
        await new Promise(r => setTimeout(r, 5));
        width += 1;
        elem.style.width = width;
        ShowProgress();
    }
}