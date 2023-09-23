const fs = require('fs');
const path = require('path');
exports.moveFile = (file, dir2) => {
    console.log(file)
    if (!fs.existsSync(dir2)) {
        fs.mkdirSync(dir2, { recursive: true });
    }
    //include the fs, path modules



    //gets file name and adds it to dir2
    const f = path.basename(file);
    const dest = path.resolve(dir2, f);

    fs.rename(file, dest, (err) => {
        if (err) console.log(err)
        else console.log('Successfully moved');
    });

    return f
};