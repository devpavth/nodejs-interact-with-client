require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const { connectToMongoDB } = require('./app'); 
const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static('uploads'));

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

app.post('/api/data', (req, res) =>{
    const receivedData = req.body;
    console.log('Data received:', receivedData);
    res.json({message: 'Data received successfully', receivedData});
})

app.get('/api/data', (req,res) =>{
    const data = [
        {id: 1, name: 'John Doe', age: 25},
        {id: 2, name: 'Jane Smith', age: 30},
        {id: 3, name: 'Alice Johnson', age: 22 },
        {id: 4, name: 'Pavithradevi', age: 77 },
        {id: 5, name: 'Pavithra', age: 66 },
    ];
    res.json(data);
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        console.log('Setting destination for file upload to:', uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        console.log('Generating unique filename:', uniqueName);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage,  limits: { fileSize: 100 * 1024 * 1024 },});

app.post('/api/upload', upload.single('image'), async(req, res) =>{
    try{
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const imagePath = req.file.path;
        console.log('Image uploaded locally to:', imagePath);

        const uploadResult = await cloudinary.uploader.upload(imagePath, {
            public_id: `my_uploaded_image_${Date.now()}`,
        });
        console.log('Cloudinary upload result:', uploadResult);

        // fs.unlinkSync(imagePath);
        console.log('Local file deleted after upload to Cloudinary.');

        res.json({ imageUrl: uploadResult.secure_url });
    }catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
    // if(!req.file){
    //     return res.status(400).json({ message: 'No file uploaded.' });
    // }
    // const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    // res.status(200).json({ message: 'File uploaded successfully.', fileUrl });
});

app.post('/api/upload-video', upload.single('video'), async (req,res) =>{
    try{
        if(!req.file){
            console.log('No video file uploaded');
            return res.status(400).json({ message: 'No video uploaded.'});
        }
        const videoPath = req.file.path;
        console.log('Video uploaded locally to:', videoPath);

        const uploadResult = await cloudinary.uploader.upload(videoPath, {
            resource_type: 'video',  
            chunk_size: 6000000,
            public_id: `my_uploaded_video_${Date.now()}`,
        });
        console.log('Cloudinary upload result:', uploadResult);

        res.json({ videoUrl: uploadResult.secure_url });
    }catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        res.status(500).json({ error: 'Failed to upload video', details: error.message });
    }
})

app.listen(PORT, ()=>{
    connectToMongoDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});




