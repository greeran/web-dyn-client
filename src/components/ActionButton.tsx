import React, { useState } from 'react';
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap';

interface ActionButtonProps {
  member: any;
}

// Optionally import mockFetch from App context or global if needed
// import { mockFetch, USE_MOCK } from '../App';

const ActionButton: React.FC<ActionButtonProps> = ({ member }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ack, setAck] = useState<string|null>(null);
  const [error, setError] = useState<string|null>(null);
  const handleClick = async () => {
    setLoading(true);
    setAck(null);
    setError(null);
    try {
      let res;
      const body: any = { action: member.button_name };
      if (member.text_input) body.value = input;
      if (typeof window !== 'undefined' && (window as any).mockFetch) {
        res = await (window as any).mockFetch('http://localhost:8000/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch('http://localhost:8000/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setError('Invalid response from server.');
        setLoading(false);
        return;
      }
      if (data.success) setAck('Action sent!');
      else setError(data.error || 'Action failed');
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="h-100 mb-3">
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>{member.button_name}</Form.Label>
          {member.text_input && (
            <Form.Control
              type="text"
              placeholder="Enter value..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="mb-2"
              disabled={loading}
            />
          )}
          <Button variant="primary" onClick={handleClick} disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
            {member.button_name}
          </Button>
        </Form.Group>
        {ack && <Alert variant="success" className="mt-2">{ack}</Alert>}
        {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
      </Card.Body>
    </Card>
  );
};

export default ActionButton; 