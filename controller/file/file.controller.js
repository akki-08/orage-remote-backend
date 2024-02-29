// import JSZip from "jszip";
import JSZip from 'jszip';
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import requestIp from 'request-ip';
import express from 'express';
import os from 'os';
import { promisify } from 'util';
import { Console } from 'console';

const app = express();
app.use(requestIp.mw());

const router = express.Router();
const writeFileAsync = promisify(fs.writeFile);

export const downloadHostConfig = async (req, res) => {
    
    const { random_Code, filename } = req.body;

    if (!filename || !random_Code) {
        return res.status(400).json({
            success: false,
            msg: 'Filename or random code not found'
        });
    }

    const randomCode = req.body.random_Code; // Assuming you're sending some data with the request
  const fileName = 'Program.exe'; // Provide the filename for the executable file
  const filePath = 'C:/Users/admin/Desktop'; // Provide the path to your executable file
    Console.log("I am working");
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

    // Your logic to generate the .exe content based on random_Code and other data
    // const exeContent = `
    //     Random Code: ${random_Code}
    //     // Other necessary details...
    // `;

    // // Path to where the generated .exe file will be saved
    // const outputExeFilePath = join(__dirname, `${filename}_${random_Code}.exe`);

    // // Write the generated content to the .exe file
    // try {
    //     await writeFileAsync(outputExeFilePath, exeContent);
    // } catch (error) {
    //     console.error('Error writing to the .exe file:', error);
    //     return res.status(500).json({
    //         success: false,
    //         msg: 'Error writing to the .exe file'
    //     });
    // }

    // // Set headers for the response
    // res.setHeader('Content-Type', 'application/octet-stream');
    // res.setHeader('Content-Disposition', `attachment; filename=${filename}_${random_Code}.exe`);

    // // Send the response with the .exe file
    // res.sendFile(outputExeFilePath, (err) => {
    //     if (err) {
    //         console.error('Error sending .exe file:', err);
    //         res.status(500).json({
    //             success: false,
    //             msg: 'Error sending .exe file'
    //         });
    //     } else {
    //         // Delete the .exe file after sending
    //         fs.unlinkSync(outputExeFilePath);
    //     }
    // });
};


// export const downloadHostConfig = async (req, res) => {
// 	const { filename } = req.body;

// 	if(filename == null || filename == '') {
// 		return res.status(400).json({
// 			success: false,
// 			msg: 'filename not found'
// 		})
// 	}

// 	const zip = new JSZip(); // uncomment this

// 	try {
// 		const image = zip.folder("image");
// 		const control = zip.folder("control");
// 		const command = zip.folder("command");
// 		const exes = zip.folder("exes");

// 		image.file(`${filename}.txt`, fs.readFileSync(`/root/sessions/image/${filename}.txt`), { base64: true });
// 		// control.file(`${filename}.txt`, fs.readFileSync(`/root/sessions/control/${filename}.txt`), { base64: true });
// 		// command.file(`${filename}.txt`, fs.readFileSync(`/root/sessions/command/${filename}.txt`), { base64: true });
// 		exes.file("Server.Win.exe", fs.readFileSync("/root/prod30nov/exe_v1.2/Server.Win.exe"), { base64: true });

// 		await zip.generateAsync({ type: "nodebuffer" }).then((zipData) => {
// 			res.setHeader("Content-Type", "application/zip");
// 			res.setHeader("Content-Disposition", `attachment; filename=${filename}.zip`);
// 			res.send(zipData);
// 		});
// 	} catch (err) {
// 		res.send(err);
// 		console.log(err);
// 	}
// };
// Generate the ZIP file as a buffer
	//    zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
	//        res.setHeader('Content-Type', 'application/zip');
	//        res.setHeader('Content-Disposition', 'attachment; filename=Host.zip');
	//        res.send(content);
	//    });

	// fs.promises.readFile(filePath)
	//  .then(fileData => {
	//    // Add the file to the JSZip instance
	//    zip.file('Server.Win.exe', fileData, { compression: 'DEFLATE', compressionOptions: { level: 9 } });
	
	//    // Generate the ZIP file
	//    return zip.generateAsync({ type: 'nodebuffer' });
	//  })
	//  .then(zipData => {
	//    // Save the ZIP file
	//    // fs.promises.writeFile('output.zip', zipData);
	//        res.setHeader('Content-Type', 'application/zip');
	//        res.setHeader('Content-Disposition', 'attachment; filename=Host.zip');
	//        res.send(zipData);
	//  })
	//  .catch(error => {
	//    console.error('Error:', error);
	//  });
	

    export const downloadClientConfig = async (req, res) => {
        const { filename } = req.body;
    
        if (!filename) {
            return res.status(400).json({
                success: false,
                msg: 'Filename not found'
            });
        }
    
        const zip = new JSZip();
    
        try {
            const image = zip.folder("image");
            const exes = zip.folder("exes");
    
            // Assuming the text file exists
            image.file(`${filename}.txt`, fs.readFileSync(`/root/sessions/image/${filename}.txt`), { base64: true });
    
            // Adding executable files to the zip
            exes.file("Client.Win.exe", fs.readFileSync("/root/prod30nov/exe_v1.2/client/Client.Win.exe"), { base64: true });
            exes.file("Client.Win.pdb", fs.readFileSync("/root/prod30nov/exe_v1.2/client/Client.Win.pdb"), { base64: true });
            exes.file("NAudio.Asio.dll", fs.readFileSync("/root/prod30nov/exe_v1.2/client/NAudio.Asio.dll"), { base64: true });
    
            const zipData = await zip.generateAsync({ type: "nodebuffer" });
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", `attachment; filename=${filename}.zip`);
            res.send(zipData);
        } catch (err) {
            res.status(500).send(err);
            console.error(err);
        }
    };

export const downloadHost = async (req, res) => {
    // // const exeFilePath = '/root/prod30nov/exes/Server.Win.exe';  // Replace with the actual path to your .exe file
	const exeFilePath = 'C:/Users/admin/Desktop/csharp/GenerateExeFile/Program.exe';
    // // Set appropriate headers for the response
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=Program.exe');

    // // Send the file
    res.status(200).sendFile(exeFilePath);
}

export const downloadClient = async (req, res) => {
    // const exeFilePath = '/root/prod30nov/exes/Client.Win.exe';  // Replace with the actual path to your .exe file
	const exeFilePath = 'C:/Users/admin/Desktop/Server.Win.exe';
    // Set appropriate headers for the response
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=Client.Win.exe');

    // Send the file
    res.status(200).sendFile(exeFilePath);
}

export const downloadHostExe = async (req, res) => {
    const systemConfig = JSON.stringify({
        // Generate system configuration data here
        os: process.platform,
        cpu: require('os').cpus()[0].model,
        memory: require('os').totalmem(),
        // Add more system information as needed
    });
    Console.log("Hello");
    // Set the filename and path for the executable file
    const exeFilePath = path.join(__dirname, 'system-config.exe');
    
    // Write the system configuration data to the executable file
    fs.writeFile(exeFilePath, systemConfig, (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Set appropriate headers for the response
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename=system-config.exe');

        // Send the file as a response
        res.sendFile(exeFilePath);
    });
};
export const downloadSystemConfig = async (req, res) => {
    const systemConfig = {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        userInfo: os.userInfo(),
    };
    Console.log("Hello Working");
    // Create a batch script to output system configuration
    const script = `@echo off
    echo ${JSON.stringify(systemConfig)} > system-config.txt`;

    // Name and path for the batch script
    const batchFilePath = path.join(__dirname, 'generate-system-config.bat');

    // Write the batch script to the file
    fs.writeFileSync(batchFilePath, script);

    // Execute the batch script
    exec(batchFilePath, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing batch script: ${error.message}`);
            return res.status(500).send('Internal Server Error');
        }

        // Set appropriate headers for the response
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename=system-config.exe');

        // Send the batch script file as response
        res.sendFile(batchFilePath);

        // Cleanup
        fs.unlinkSync(batchFilePath);
    });
};
