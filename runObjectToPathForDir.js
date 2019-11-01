const { spawn } = require('child_process');
const fs = require('fs');
const rimraf = require('rimraf');

const PROCESSED_DXF_FILES_DIR_NAME_PREFIX = 'processedDXF';
const DEFAULT_GENERATED_DXF_DIR = '../generatedDXF/';
const RUN_OBJECT_TO_PATH_FOR_FILE_LOCATION = 'runObjectToPathForFile.bat';

let generatedDXFDirectory;
const args = process.argv.slice(2);
if (!args[0]) {
    console.log(`no path provided for the directory containing the generated DXF files, defaulting to ${ DEFAULT_GENERATED_DXF_DIR }`);
    generatedDXFDirectory = DEFAULT_GENERATED_DXF_DIR;
} else {
    generatedDXFDirectory = args[0];
}

function getDateTime() {
    const date = new Date();
    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    let min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    let sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    let day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + "-" + hour + "-" + min + "-" + sec;
}
const processedDXFFilesDirName = `${ PROCESSED_DXF_FILES_DIR_NAME_PREFIX }_${ getDateTime() }/`;

const spawnProcessAndAwaitCompletion = async (processToBeSpawned, processArguments) =>
    new Promise((resolve, reject) => {
        const ls = spawn(processToBeSpawned, processArguments);

        ls.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });

        ls.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
            throw data;
        });

        ls.on('exit', function (code) {
            console.log('child process exited with code ' + code);
            resolve();
        });
    });

async function stepThroughFiles(files) {
    const fileName = files.shift();
    const fullFilePath = DEFAULT_GENERATED_DXF_DIR + fileName;
    await spawnProcessAndAwaitCompletion(RUN_OBJECT_TO_PATH_FOR_FILE_LOCATION, [fullFilePath]);
    fs.renameSync(fullFilePath, processedDXFFilesDirName + fileName);
    
    if (files.length) {
        stepThroughFiles(files);
    } else {
        console.log('processing complete');
        console.log(`you can view the processed files by opening the folder located at ${ __dirname }\\${ processedDXFFilesDirName }`);
    }
}

fs.readdir(generatedDXFDirectory, async (err, files) => {
    if (files.length === 0) {
        console.error(`ERROR: no files found in directory: ${ generatedDXFDirectory }`);
        process.exit(1);
    }

    fs.mkdirSync(processedDXFFilesDirName);
    try {
        await stepThroughFiles(files);
    } catch (err) {
        // Delete processed directory since an error occurred and results are likely corrupted
        rimraf.sync(processedDXFFilesDirName);
        process.exit(1);
    }
});