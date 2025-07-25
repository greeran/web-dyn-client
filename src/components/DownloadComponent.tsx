import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert, Spinner } from 'react-bootstrap';

interface DownloadComponentProps {
  member: any;
}

const DownloadComponent: React.FC<DownloadComponentProps> = ({ member }) => {
  const buttonName = member.button_name;
  const [currentPath, setCurrentPath] = useState(''); // Start at root
  const [dirs, setDirs] = useState<string[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDirectory = (path: string) => {
    setLoading(true);
    setError(null);
    fetch(`http://localhost:8000/api/browse?button_name=${encodeURIComponent(buttonName)}&path=${encodeURIComponent(path)}`)
      .then(res => res.json())
      .then(data => {
        setCurrentPath(data.path || '');
        setDirs(data.directories || []);
        setFiles(data.files || []);
      })
      .catch(() => {
        setError('Failed to load directory');
        setDirs([]);
        setFiles([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDirectory(''); // Always start at root
    // eslint-disable-next-line
  }, [buttonName]);

  const handleDirClick = (dir: string) => {
    const newPath = currentPath ? `${currentPath.replace(/\/$/, '')}/${dir}` : dir;
    loadDirectory(newPath);
  };

  const handleUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length === 0) return;
    parts.pop();
    const newPath = parts.join('/');
    loadDirectory(newPath);
  };

  const handleDownload = async (filename: string) => {
    // Compose the relative path for the backend
    const relPath = currentPath ? `${currentPath.replace(/\/$/, '')}/${filename}` : filename;
    try {
      const res = await fetch('http://localhost:8000/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ button_name: buttonName, filename: relPath })
      });
      if (!res.ok) throw new Error('Failed to download file');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setTimeout(() => alert('File downloaded! Check your browser\'s Downloads folder.'), 500);
    } catch (err: any) {
      setError(err.message || 'Download failed');
    }
  };

  return (
    <Card className="h-100 mb-3">
      <Card.Body>
        <h6>{member.button_name}</h6>
        <div className="mb-2">
          <strong>Current Path:</strong> {currentPath || '/'}
          {currentPath && (
            <Button variant="link" size="sm" onClick={handleUp} style={{ marginLeft: 10 }}>
              <i className="fas fa-level-up-alt"></i> Up
            </Button>
          )}
        </div>
        {loading ? <Spinner animation="border" /> : (
          <div style={{ display: 'flex', gap: 32 }}>
            <div style={{ minWidth: 200 }}>
              <strong>Folders</strong>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {dirs.map(dir => (
                  <li key={dir}>
                    <Button variant="link" onClick={() => handleDirClick(dir)}>
                      <i className="fas fa-folder me-1"></i>{dir}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ minWidth: 200 }}>
              <strong>Files</strong>
              <Table size="sm" bordered hover>
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(file => {
                    const fname = typeof file === 'string' ? file : file.filename;
                    return (
                      <tr key={fname}>
                        <td>{fname}</td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleDownload(fname)}
                          >
                            <i className="fas fa-download"></i> Download
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </div>
        )}
        {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
      </Card.Body>
    </Card>
  );
};

export default DownloadComponent; 