import React, { useEffect, useState } from 'react';
import {invoke} from "@tauri-apps/api/core";
import {open} from "@tauri-apps/plugin-dialog";

function CameraFilesWindow() {
    const [camera, setCamera] = useState({ port: '', name: '' });
    const [files, setFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const port = searchParams.get('port');
        const name = searchParams.get('name');
        setCamera({ port, name });

        if (port) {
            invoke('list_camera_files', { port })
                .then(setFiles)
                .catch(err => {
                    console.error("Failed to list camera files:", err);
                    setError(err.toString());
                });
        }
    }, []);

    const handleFileSelection = (filePath) => {
        setSelectedFiles(prev => 
            prev.includes(filePath) 
                ? prev.filter(p => p !== filePath) 
                : [...prev, filePath]
        );
    };

    const handleImport = async () => {
        if (selectedFiles.length === 0) {
            return;
        }

        const destination = await open({ directory: true });
        if (!destination) {
            return;
        }

        setImporting(true);
        setError(null);

        try {
            await invoke('import_camera_files', { 
                port: camera.port, 
                files: selectedFiles, 
                destination 
            });
            setSelectedFiles([]);
        } catch (err) {
            console.error("Failed to import files:", err);
            setError(err.toString());
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Files in {camera.name}</h1>
                    <p className="text-sm text-gray-500">Port: {camera.port}</p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={handleImport}
                    disabled={selectedFiles.length === 0 || importing}
                >
                    {importing ? 'Importing...' : `Import (${selectedFiles.length})`}
                </button>
            </div>
            {error && <div className="text-red-500 my-2">Error: {error}</div>}
            <ul className="mt-4">
                {files.map(file => (
                    <li key={file.path} className="flex items-center justify-between p-2 my-1 rounded-md bg-base-200">
                        <label className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                className="checkbox"
                                checked={selectedFiles.includes(file.path)}
                                onChange={() => handleFileSelection(file.path)}
                            />
                            <span>{file.name}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CameraFilesWindow;
