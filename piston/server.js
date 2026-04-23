const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

/**
 * Piston-Lite: A mock Piston API for environments that don't support privileged Docker (like Render).
 * Mimics the /api/v2/execute endpoint.
 */
app.post('/api/v2/execute', (req, res) => {
    const { language, files } = req.body;
    console.log(`[Piston-Lite] Received execution request for: ${language}`);
    
    if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files provided" });
    }

    const code = files[0].content;
    const fileName = `temp_${Date.now()}`;
    let command = '';
    let filePath = '';

    // Map language to command
    if (language === 'python' || language === 'py') {
        filePath = path.join('/tmp', `${fileName}.py`);
        command = `python3 ${filePath}`;
    } else if (language === 'javascript' || language === 'js') {
        filePath = path.join('/tmp', `${fileName}.js`);
        command = `node ${filePath}`;
    } else if (language === 'typescript' || language === 'ts') {
        filePath = path.join('/tmp', `${fileName}.ts`);
        // Simple TS execution via ts-node if installed, or just node for JS-compatible TS
        command = `node ${filePath}`; 
    } else {
        return res.status(400).json({ 
            message: `Language '${language}' not supported in Lite mode on Render.` 
        });
    }

    try {
        fs.writeFileSync(filePath, code);

        // Execute with a 5-second timeout to prevent infinite loops
        exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
            // Cleanup temp file
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) {}
            }

            res.json({
                language: language,
                version: "latest",
                run: {
                    stdout: stdout,
                    stderr: stderr || (error && error.signal === 'SIGTERM' ? "Execution timed out (5s limit)" : (error ? error.message : "")),
                    code: error ? (error.code || 1) : 0,
                    signal: error ? error.signal : null,
                    output: stdout + (stderr || (error ? error.message : ""))
                }
            });
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to execute code", error: err.message });
    }
});

// Health check and package list
app.get('/api/v2/packages', (req, res) => {
    res.json([
        { language: 'python', version: '3.10.x' },
        { language: 'javascript', version: '18.x' }
    ]);
});

app.get('/', (req, res) => res.send('Piston-Lite API is active.'));

const PORT = 2000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Piston-Lite running on port ${PORT}`);
});
