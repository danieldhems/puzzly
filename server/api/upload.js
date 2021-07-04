var path = require('path');
var router = require('express').Router();

async function upload(req, res){
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let image = req.files['files[]'];
            
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            image.mv('./uploads/' + image.name);
    
            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    path: image.name,
                    mimetype: image.mimetype,
                    size: image.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
}

router.post('/', upload);

module.exports = router;
