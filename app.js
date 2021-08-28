
//Account ID From Website
var accountID  = ''

// Access Token to be generated
var accessToken=''

// Subscription Key
var subscriptionKey = ''


// Start the Video Upload to Azure Video Analyzer
async function uploadVideo() {
    var files = document.getElementById("videoupload").files;
    if (!files.length) {
        return alert("Please choose a file to upload first.");
    }
    var file = files[0];
    var videoKey = file.name;

    await axios({
        method: 'get',
        url: 'https://api.videoindexer.ai/Auth/trial/Accounts/'+accountID+'/AccessToken?allowEdit=true',
        headers: {'Ocp-Apim-Subscription-Key': subscriptionKey},
      }).then(function (response) {
        accessToken = response.data
    });

    console.log( accessToken)

    let req = new XMLHttpRequest();
    let formData = new FormData();

    
    formData.append("file", file);                                
    req.open("POST", 'https://api.videoindexer.ai/trial/Accounts/'+accountID+'/Videos?name='+videoKey+'&privacy=Public&accessToken='+accessToken);
    req.send(formData);
    
    req.addEventListener("load", transferComplete);
    
}

//Make the File Upload to Azure Video Analyzer
function transferComplete(event) {
    var results = JSON.parse(event.currentTarget.responseText)
    //console.log(results.id)
    console.log(results)
    alert("Successfully uploaded video.");
    viewVideo(results.id)
    var html = `<h3>Video ID:${results.id}</h3>
    <h3>Status: IN_PROGRESS</h3>
    <button id="checkresults" onclick="getVideoIndex('${results.id}')">Check Results</button><br><hr>`
    document.getElementById("jobid").insertAdjacentHTML('afterend', html);
}


// Show Video in Web page
function viewVideo(videoKey) {
    document.getElementById("video-status").insertAdjacentHTML('afterbegin', "<h3>Loading...</h3>");

    axios({
        method: 'get',
        url: 'https://api.videoindexer.ai/trial/Accounts/'+accountID+'/Videos/'+videoKey+'/SourceFile/DownloadUrl?accessToken='+accessToken,
      }).then(function (response) {
        var html = `<video width="320" height="240" controls>
                    <source src="${response.data}" type="video/mp4">
                  </video>`
      document.getElementById("video-status").remove();
      document.getElementById("video").insertAdjacentHTML('afterbegin', html);

    });
}

// Check Video Indexing Results
async function getVideoIndex(videoId) {

  var html = '';
  await axios({
    method: 'get',
    url: 'https://api.videoindexer.ai/trial/Accounts/'+accountID+'/Videos/'+videoId+'/Index?language=en-US&accessToken='+accessToken,
  }).then(function (response) {
    console.log(response.data.state)
    if (response.data.state == 'Processing') {
      html = `<h3>Status: Processing </h3><hr>`
    } else {
      console.log(response.data.summarizedInsights)

      //html = processResults(response.data.summarizedInsights)
      html = "Processed"
        
      
    }
    document.getElementById("status").insertAdjacentHTML('beforeend', html);
  });
}


// Process Video Indexing results for a user friendly format
function processResults(jsonObject){

  var html = ""

  /*
  // Format Labels
  if (jsonObject.labels.length > 0){
    html += "<table border=1>"
    html += "<tr><td> ** LABELS ** </td></tr>"
    jsonObject.labels.forEach(label => {
      label.appearances.forEach(item => {
         html += "<tr>><td><b> Name: "+label.name+"</b></td><td>-Confidence:"+Math.round(item.confidence*100)+"% startTime:"+item.startTime+" endTime:"+item.endTime+"</td></tr>"
      })
     });
    html += "</table>"
  }
  */

  /*
  //Format Faces
  if (jsonObject.faces.length > 0){
    html += "<table border=1>"
    html += "<tr><td> ** FACES ** </td></tr>"
    jsonObject.faces.forEach(face => {
      face.appearances.forEach(item => {
         html += "<tr>><td><b> Title: "+face.title+"</b></td><td><b> Description: "+face.description+"</b></td><td>-Confidence:"+Math.round(face.confidence*100)+"% startTime:"+item.startTime+" endTime:"+item.endTime+"</td></tr>"
      })
     });
    html += "</table>"
  }
  */

  return html
}
