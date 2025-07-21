import React, { useState } from 'react';
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap';

interface UploadComponentProps {
  member: any;
}

const UploadComponent: React.FC<UploadComponentProps> = ({ member }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);
  const allowedExtensions = member.allowed_extensions || [];
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const ext = file.name.substring(file.name.lastIndexOf('.'));
      if (allowedExtensions.length && !allowedExtensions.includes(ext)) {
        setError(`File type not allowed. Allowed: ${allowedExtensions.join(', ')}`);
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const res = await response.json();
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };
  return (
    <Card className="h-100 mb-3">
      <Card.Body>
        <Form onSubmit={handleUpload}>
          <Form.Group className="mb-3">
            <Form.Label>{member.button_name}</Form.Label>
            <Form.Control
              type="file"
              accept={allowedExtensions.length > 0 ? allowedExtensions.join(',') : undefined}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={!selectedFile || uploading}>
            {uploading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
            Upload
          </Button>
        </Form>
        {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
        {result && (
          <Alert variant={result.success ? 'success' : 'danger'} className="mt-2">
            {result.success ? 'Upload successful!' : `Upload failed: ${result.error_message}`}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default UploadComponent; 