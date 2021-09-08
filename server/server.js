const express = require('express');
const upbit = require('./api/upbit');
const shrimpKeeperJob = require('../batch/shrimpKeeperJob');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/upbit', upbit);

app.get('/', (req, res) => {
    res.send('auto alert crypto asset');
});

app.get('/batch/:mode', (req, res) => {
    let mode = req.params.mode;
    shrimpKeeperJob(mode);
    console.info(`batch program: %s`, mode);
    res.status(200).end();
});

app.listen(port, () => {
    console.log(`app listening at http://141.164.46.105:${port}`);
})




module.exports = app;