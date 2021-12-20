const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const stopwords = require('vietnamese-stopwords');

const {createWorker} = require('tesseract.js');
const worker = createWorker({
    logger: m => console.log(m)
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploadedImages');
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage}).single('avatar');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', {output: `Awaiting Input...`, keywords: `Keywords will appear here...`});
});

app.post('/', (req, res) => {
    console.log(req);

    upload(req, res, (err) => {
        fs.readFile(`./uploadedImages/${req.file.originalname}`, async (err, data) => {
            if(err) return console.log(`This is your error`, err);

            await worker.load();
            await worker.loadLanguage('vie');
            await worker.initialize('vie');
            const { data: { text } } = await worker.recognize(data);
            // await worker.terminate();
            
            let result = text;
            
            result = result.replace(/[^a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\d ]/g, ' ');
            result = result.replace(/\s\s+/g, ' ');

            result = result.split(' ');
            result = result.filter(word => stopwords.indexOf(word) === -1);
            result = result.filter(onlyUnique);
            result = result.join(' ');

            res.render('index', {output: text, keywords: result});
        });
    });
});

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`I'm running on port ${PORT}`));