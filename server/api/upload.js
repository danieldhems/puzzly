var router = require('express').Router();
var fileUpload = require('express-fileupload');

const uploadDir = './uploads/';

router.use(fileUpload({
	createParentPath: true,
	debug: true
}));

async function upload(req, res){
    if(!req.files) {
        res.send({
            status: false,
            message: 'No file uploaded'
        });
    } else {
        //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
        let image = req.files['files[]'];
        
        //Use the mv() method to place the file in upload directory (i.e. "uploads")
        const savePath = uploadDir + image.name;
        image.mv(savePath);

        res.status(200).send({
            status: true,
            message: 'File is uploaded',
            data: {
                path: savePath,
                mimetype: image.mimetype,
            }
        });
    }
}

router.post('/', upload);

module.exports = router;
