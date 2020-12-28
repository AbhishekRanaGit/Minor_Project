let imageUpload = document.getElementById('imageUpload')

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('model_2'),
    faceapi.nets.faceLandmark68Net.loadFromUri('model_2'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('model_2'),
    faceapi.nets.faceExpressionNet.loadFromUri('model_2')
]).then(start)

async function start() {
   
    const container = document.createElement('div')
    container.style.position = 'relative'
    document.body.append(container)

    
    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    
    
    let image
    let canvas
    // document.body.append('Loaded...')
    
    imageUpload.addEventListener('change', async () =>
    {

        if(image) image.remove()
        if(canvas) canvas.remove()
        
        image = await faceapi.bufferToImage(imageUpload.files[0])
        canvas = await faceapi.createCanvasFromMedia(image)
    
        image.width = 590;
        image.height = 400;
    
        container.append(image)
        container.append(canvas)
    
        const displaySize = {width: image.width, height: image.height}
    
        faceapi.matchDimensions(canvas,displaySize)

        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors().withFaceExpressions()
    
        // document.body.append(total.detections.length)
      
        const resizedDetections = faceapi.resizeResults(detections,displaySize)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))


        results.forEach((result,i) =>
        {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box,{label: result.toString() })
            drawBox.draw(canvas)
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
            
        })
    }) 
} 

function loadLabeledImages()
{
    const labels = ['Abhishek','Akshay Kumar','Amitabh bachchan','Amitshah','CM shivraj','CM Yogi','Irrfan Khan','nawazuddin siddiqui','pankaj tripathi','PM Modi','Rahul gandhi','Sushant Singh','Tapsee Pannu']

    return Promise.all
    (
        labels.map(async label =>
        {
            const descriptions=[]
            for(let i=1;i<=2;i++)
            {
                const img = await faceapi.fetchImage(`labeled_images/${label}/${i}.jpg`)
                
                const detections= await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()

                descriptions.push(detections.descriptor) 
            }
            return new faceapi.LabeledFaceDescriptors(label,descriptions)
        })
    )
}
