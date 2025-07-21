import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert, Spinner, Modal, Form } from 'react-bootstrap';

interface DownloadComponentProps {
  member: any;
}

const DownloadComponent: React.FC<DownloadComponentProps> = ({ member }) => {
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserPath, setBrowserPath] = useState(member.root_directory || '/');
  const [browserDirs, setBrowserDirs] = useState<string[]>([]);
  const [browserFiles, setBrowserFiles] = useState<string[]>([]);
  const [browserSelected, setBrowserSelected] = useState<File | null>(null);
  const [browserLoading, setBrowserLoading] = useState(false);
  const [browserError, setBrowserError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulate browsing the client file system (in real app, use input type="file" with webkitdirectory or a custom Electron/desktop solution)
  // For web, we can only use the file picker, but we can simulate a root directory restriction by filtering after selection

  // Open file picker
  const handleOpenBrowser = () => {
    setShowBrowser(true);
  };
  const handleCloseBrowser = () => {
    setShowBrowser(false);
    setBrowserPath(member.root_directory || '/');
    setBrowserDirs([]);
    setBrowserFiles([]);
    setBrowserSelected(null);
    setBrowserError(null);
    setUploadResult(null);
    setError(null);
  };

  // Handle file selection (simulate root restriction by checking path)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Optionally, check if file path starts with root_directory (not possible in browser, but can check extension)
      const ext = file.name.substring(file.name.lastIndexOf('.'));
      if (member.allowed_extensions && !member.allowed_extensions.includes(ext)) {
        setError(`File type not allowed. Allowed: ${member.allowed_extensions.join(', ')}`);
        setBrowserSelected(null);
        return;
      }
      setError(null);
      setBrowserSelected(file);
    }
  };

  // Upload selected file to backend
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!browserSelected) {
      setError('Please select a file to upload.');
      return;
    }
    setUploading(true);
    setError(null);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append('file', browserSelected as any);
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const res = await response.json();
      setUploadResult(res);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setShowBrowser(false);
    }
  };

  return (
    <Card className="h-100 mb-3">
      <Card.Body>
        <h6>{member.button_name}</h6>
        <Button variant="info" className="mb-3" onClick={handleOpenBrowser}>
          <i className="fas fa-folder-open me-2"></i>Browse Local Files
        </Button>
        <Modal show={showBrowser} onHide={handleCloseBrowser} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Browse Local Files</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpload}>
              <Form.Group className="mb-3">
                <Form.Label>Select file to upload to backend</Form.Label>
                <Form.Control
                  type="file"
                  accept={member.allowed_extensions && member.allowed_extensions.length > 0 ? member.allowed_extensions.join(',') : undefined}
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </Form.Group>
              <Button type="submit" variant="primary" disabled={!browserSelected || uploading}>
                {uploading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                Upload
              </Button>
              {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
              {uploadResult && (
                <Alert variant={uploadResult.success ? 'success' : 'danger'} className="mt-2">
                  {uploadResult.success ? 'Upload successful!' : `Upload failed: ${uploadResult.error_message}`}
                </Alert>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseBrowser}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default DownloadComponent; 