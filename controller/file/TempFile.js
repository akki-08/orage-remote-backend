// import JSZip from "jszip";
import JSZip from 'jszip';
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import requestIp from 'request-ip';
import express from 'express';

const app = express();
app.use(requestIp.mw());


// 

export const downloadHostConfig = async (req, res) => {
    const { filename, random_Code } = req.body;

    if (!filename) {
        return res.status(400).json({
            success: false,
            msg: 'Filename not found'
        });
    }
	const clientIp = req.clientIp; // Get client's IP address
    
    // Generate the .exe file with necessary details including IP address
    const exeContent = `
      IP Address: ${clientIp}
      // Other necessary details...
    `;

    // const exeFilePath = '/path/to/generate/exe'; // Replace with the actual command to generate the .exe file
    // const outputExeFilePath = `/path/to/output/exes/${filename}_${random_Code}.exe`;
    const exeFilePath = 'C:/Users/admin/Desktop/exeFile'; // Replace with the actual command to generate the .exe file
    const outputExeFilePath = `C:/Users/admin/Desktop/${filename}_${random_Code}.exe`;
    const child = spawn(exeFilePath, [], { shell: true });

    child.on('error', (err) => {
        console.error('Error occurred while generating the exe file:', err);
        res.status(500).json({
            success: false,
            msg: 'Error occurred while generating the exe file'
        });
    });

    child.on('exit', async (code) => {
        if (code === 0) {
            // File generation successful
            // Read the generated executable file
            const exeFileData = fs.readFileSync(outputExeFilePath);
            // res.setHeader('Content-Type', 'application/octet-stream');
            // res.setHeader('Content-Disposition', `attachment; filename=${filename}_${random_Code}.exe`);
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader('Content-Disposition', 'attachment; filename=config.exe');
            res.send(exeContent,exeFileData);
        } else {
            console.error('Failed to generate the exe file');
            res.status(500).json({
                success: false,
                msg: 'Failed to generate the exe file'
            });
        }
    });
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


	if(filename == null || filename == '') {
		return res.status(400).json({
			success: false,
			msg: 'filename not found'
		})
	}

	const zip = new JSZip();
	// const filePath = '/root/exes/20octHostBuilds/Server.Win.exe';

	// zip.file("connectionInfo.txt", ~/exes/20octHostBuilds/connectionInfo.txt);
	// zip.file("Server.Win.exe", "~/exes/20octHostBuilds/Server.Win.exe", { base64: true });

	// Add the text file to the ZIP archive
	try {
		const image = zip.folder("image");
		const control = zip.folder("control");
		const command = zip.folder("command");
		const exes = zip.folder("exes");
		console.log("Code of the session is:")
		image.file(`${filename}.txt`, fs.readFileSync(`/root/sessions/image/${filename}.txt`), { base64: true });
		// control.file(`${filename}.txt`, fs.readFileSync(`/root/sessions/control/${filename}.txt`), { base64: true });
		// command.file(`${filename}.txt`, fs.readFileSync(`/root/sessions/command/${filename}.txt`), { base64: true });
		exes.file("Client.Win.exe", fs.readFileSync("/root/prod30nov/exe_v1.2/client/Client.Win.exe"), { base64: true });
		exes.file("Client.Win.pdb", fs.readFileSync("/root/prod30nov/exe_v1.2/client/Client.Win.pdb"), { base64: true });
		exes.file("NAudio.Asio.dll", fs.readFileSync("/root/prod30nov/exe_v1.2/client/NAudio.Asio.dll"), { base64: true });

		await zip.generateAsync({ type: "nodebuffer" }).then((zipData) => {
			res.setHeader("Content-Type", "application/zip");
			res.setHeader("Content-Disposition", `attachment; filename=${filename}.zip`);
			res.send(zipData);
		});
	} catch (err) {
		res.send(err);
		console.log(err);
	}
}

export const downloadHost = async (req, res) => {
    // const exeFilePath = '/root/prod30nov/exes/Server.Win.exe';  // Replace with the actual path to your .exe file
	const exeFilePath = 'C:/Users/admin/Desktop/Java file/Server.Win.exe';
    // Set appropriate headers for the response
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=Server.Win.exe');

    // Send the file
    res.status(200).sendFile(exeFilePath);
}

export const downloadClient = async (req, res) => {
    // const exeFilePath = '/root/prod30nov/exes/Client.Win.exe';  // Replace with the actual path to your .exe file
	const exeFilePath = 'C:/Users/admin/Desktop/Java file/Server.Win.exe';
    // Set appropriate headers for the response
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=Client.Win.exe');

    // Send the file
    res.status(200).sendFile(exeFilePath);
}
