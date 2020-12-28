var video = document.getElementById("videoElement");


function startvideo()
{
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (err0r) {
      console.log("Something went wrong!");
    });
  }
}
Promise.all(
    [
      faceapi.nets.tinyFaceDetector.loadFromUri('model_1'),
      faceapi.nets.faceLandmark68Net.loadFromUri('model_1'),
      // faceapi.nets.faceRecognitionNet.loadFromUri('models'),
      faceapi.nets.faceExpressionNet.loadFromUri('model_1')
    ]).then(startvideo())

    video.addEventListener('play',() =>{
      const canvas = faceapi.createCanvasFromMedia(video)
      document.body.append(canvas)
      const displaySize ={width: canvas.width, height: canvas.height} 
      faceapi.matchDimensions(canvas, displaySize)

      setInterval(async () => { 
        const detections = await faceapi.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        // console.log(detections)
        const resizedDetections = faceapi.resizeResults(detections, displaySize) 
        
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height) 

        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        
      },100)
    })



