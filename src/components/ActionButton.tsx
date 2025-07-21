import React, { useState } from 'react';
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap';

interface ActionButtonProps {
  member: any;
}

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
      const res = await fetch('http://localhost:8000/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: member.publish_topic, payload: member.text_input ? input : undefined })
      });
      const data = await res.json();
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