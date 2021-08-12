var path = require('path');
var router = require('express').Router();
var Calipers = require('calipers')('png', 'jpeg');

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
            const savePath = './uploads/' + image.name;
            image.mv(savePath);

            Calipers.measure(savePath)
            .then(function (result) {
                res.send({
                    status: true,
                    message: 'File is uploaded',
                    data: {
                        path: image.name,
                        mimetype: image.mimetype,
                        dimensions: result.pages[0]
                    }
                });
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
}

router.post('/', upload);

module.exports = router;
