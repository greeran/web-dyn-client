import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert, Spinner } from 'react-bootstrap';

interface DownloadComponentProps {
  member: any;
}

const DownloadComponent: React.FC<DownloadComponentProps> = ({ member }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/files')
      .then(res => res.json())
      .then(setFiles)
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, []);
  const handleDownload = (filename: string) => {
    window.open(`http://localhost:8000/api/download/${encodeURIComponent(filename)}`);
    setTimeout(() => alert('File downloaded! Check your browser\'s Downloads folder.'), 500);
  };
  return (
    <Card className="h-100 mb-3">
      <Card.Body>
        <h6>{member.button_name}</h6>
        {loading ? <Spinner animation="border" /> : (
          <Table size="sm" bordered hover>
            <thead>
              <tr>
                <th>Filename</th>
                <th>Size</th>
                <th>Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file.filename}>
                  <td>{file.filename}</td>
                  <td>{file.size} bytes</td>
                  <td>{new Date(file.modified).toLocaleString()}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleDownload(file.filename)}
                    >
                      <i className="fas fa-download"></i> Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
      </Card.Body>
    </Card>
  );
};

export default DownloadComponent; 