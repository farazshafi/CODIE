const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = express();

app.use(express.json());

/**
 * Piston-Lite: A lightweight Piston API for environments like Render.
 * Supports Python, JavaScript, TypeScript, Java, C++, Go, Rust, C#, and Ruby.
 */
app.post('/api/v2/execute', (req, res) => {
    const { language, files } = req.body;
    const normalizedLang = (language || '').toLowerCase().trim();
    console.log(`[Piston-Lite] Received execution request for: ${normalizedLang}`);

    if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files provided" });
    }

    const code = files[0].content;
    const reqId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tempBaseDir = path.join(os.tmpdir(), 'piston-lite');
    const requestDir = path.join(tempBaseDir, reqId);

    if (!fs.existsSync(requestDir)) {
        fs.mkdirSync(requestDir, { recursive: true });
    }

    let command = '';
    let filePath = '';

    const isWin = process.platform === 'win32';
    const EXEC_TIMEOUT = parseInt(process.env.EXEC_TIMEOUT || '15000', 10);

    // Map language to execution command
    if (normalizedLang === 'python' || normalizedLang === 'py') {
        filePath = path.join(requestDir, 'script.py');
        const pyCmd = isWin ? 'python' : 'python3';
        command = `${pyCmd} "${filePath}"`;

    } else if (normalizedLang === 'javascript' || normalizedLang === 'js') {
        filePath = path.join(requestDir, 'script.js');
        command = `node "${filePath}"`;

    } else if (normalizedLang === 'typescript' || normalizedLang === 'ts') {
        filePath = path.join(requestDir, 'script.ts');
        command = `npx tsx "${filePath}"`;

    } else if (normalizedLang === 'java') {
        let javaClassName = 'Main';
        const publicClassMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
        const classMatch = code.match(/class\s+([A-Za-z0-9_]+)/);
        if (publicClassMatch) {
            javaClassName = publicClassMatch[1];
        } else if (classMatch) {
            javaClassName = classMatch[1];
        }
        filePath = path.join(requestDir, `${javaClassName}.java`);
        command = `javac "${filePath}" && java -cp "${requestDir}" ${javaClassName}`;

    } else if (normalizedLang === 'cpp' || normalizedLang === 'c++') {
        filePath = path.join(requestDir, 'main.cpp');
        const exePath = path.join(requestDir, isWin ? 'main.exe' : 'main.out');
        command = `g++ -O0 "${filePath}" -o "${exePath}" && "${exePath}"`;

    } else if (normalizedLang === 'go') {
        filePath = path.join(requestDir, 'main.go');
        command = `go run "${filePath}"`;

    } else if (normalizedLang === 'rust') {
        filePath = path.join(requestDir, 'main.rs');
        const exePath = path.join(requestDir, isWin ? 'main.exe' : 'main.out');
        command = `rustc -C opt-level=0 "${filePath}" -o "${exePath}" && "${exePath}"`;

    } else if (normalizedLang === 'csharp' || normalizedLang === 'cs') {
        filePath = path.join(requestDir, 'Program.cs');
        const exePath = path.join(requestDir, 'Program.exe');
        command = isWin
            ? `csc "${filePath}" /out:"${exePath}" && "${exePath}"`
            : `mcs "${filePath}" -out:"${exePath}" && mono "${exePath}"`;

    } else if (normalizedLang === 'ruby' || normalizedLang === 'rb') {
        filePath = path.join(requestDir, 'script.rb');
        command = `ruby "${filePath}"`;

    } else {
        // Clean up immediately if language is not supported
        try { fs.rmSync(requestDir, { recursive: true, force: true }); } catch (e) { }
        return res.status(400).json({
            message: `Language '${normalizedLang}' is not supported in Lite mode.`
        });
    }

    try {
        fs.writeFileSync(filePath, code);

        // Execute with timeout to prevent infinite loops (default 15 seconds)
        exec(command, { timeout: EXEC_TIMEOUT }, (error, stdout, stderr) => {
            // Clean up temporary request directory
            try {
                fs.rmSync(requestDir, { recursive: true, force: true });
            } catch (e) { }

            const outputText = stdout + (stderr || (error && error.message ? error.message : ""));

            res.json({
                language: normalizedLang,
                version: "latest",
                run: {
                    stdout: stdout,
                    stderr: stderr || (error && error.signal === 'SIGTERM' ? `Execution timed out (${EXEC_TIMEOUT / 1000}s limit)` : (error ? error.message : "")),
                    code: error ? (error.code || 1) : 0,
                    signal: error ? error.signal : null,
                    output: outputText
                }
            });
        });
    } catch (err) {
        try { fs.rmSync(requestDir, { recursive: true, force: true }); } catch (e) { }
        res.status(500).json({ message: "Failed to execute code", error: err.message });
    }
});

// Health check and package list
app.get('/api/v2/packages', (req, res) => {
    res.json([
        { language: 'python', version: '3.x' },
        { language: 'javascript', version: '18.x' },
        { language: 'typescript', version: '5.x' },
        { language: 'java', version: '17.x' },
        { language: 'cpp', version: '10.x' },
        { language: 'go', version: '1.x' },
        { language: 'rust', version: '1.x' },
        { language: 'csharp', version: '6.x' },
        { language: 'ruby', version: '3.x' }
    ]);
});

app.get('/', (req, res) => res.send('Piston-Lite API is active with multi-language support.'));

const PORT = process.env.PORT || 2000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Piston-Lite running on port ${PORT}`);
});

