import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Badge, Card, Row, Col, Button, Form, Alert, Table, Spinner, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import SensorComponent from './components/SensorComponent';
import ActionButton from './components/ActionButton';
import UploadComponent from './components/UploadComponent';
import DownloadComponent from './components/DownloadComponent';

const USE_MOCK = true; // Set to false to use real backend

// Remove the hardcoded MOCK_CONFIG

const MOCK_SENSOR_DATA = {
  temperature: { value: 42, unit: '°C', timestamp: new Date().toISOString() },
  compass: { value: 180, unit: 'degrees', timestamp: new Date().toISOString() }
};

const MOCK_FILES = [
  { filename: 'test.txt', size: 1234, modified: new Date().toISOString() },
  { filename: 'data.csv', size: 5678, modified: new Date().toISOString() }
];

function mockFetch(url: string, options?: any) {
  if (url.endsWith('/api/config')) {
    // Instead of MOCK_CONFIG, fetch config-exp.json from public
    return fetch('/config-exp.json');
  }
  if (url.endsWith('/api/files')) {
    return Promise.resolve({ json: () => Promise.resolve(MOCK_FILES) });
  }
  if (url.endsWith('/api/upload')) {
    return Promise.resolve({ json: () => Promise.resolve({ success: true, filename: 'mock.txt', full_path: '/mock/mock.txt' }) });
  }
  if (url.endsWith('/api/action')) {
    return Promise.resolve({ json: () => Promise.resolve({ success: true }) });
  }
  if (url.startsWith('ws://')) {
    // No-op for WebSocket in mock mode
    return null;
  }
  return Promise.resolve({ json: () => Promise.resolve({}) });
}

function App() {
  const [activeTab, setActiveTab] = useState<string>('');
  const [sensorData, setSensorData] = useState<{ [key: string]: any }>({});
  const [backendConnected, setBackendConnected] = useState(false);
  const [tabs, setTabs] = useState<any[]>([]);
  const [fileModal, setFileModal] = useState({ show: false, files: [], onDownload: (f: string) => {} });

  useEffect(() => {
    if (USE_MOCK) {
      fetch('/config-exp.json')
        .then(res => res.json())
        .then(config => {
          setTabs(config.tabs.filter((tab: any) => tab.enabled));
          setActiveTab(config.tabs.find((tab: any) => tab.enabled)?.id || '');
          setBackendConnected(true);
        });
      // Optionally set mock sensor data here
      setSensorData({
        temperature: { value: 42, unit: '°C', timestamp: new Date().toISOString() },
        compass: { value: 180, unit: 'degrees', timestamp: new Date().toISOString() }
      });
      return;
    }
    fetch('http://localhost:8000/api/config')
      .then(res => res.json())
      .then(config => {
        setTabs(config.tabs.filter((tab: any) => tab.enabled));
        setActiveTab(config.tabs.find((tab: any) => tab.enabled)?.id || '');
      });
  }, []);

  useEffect(() => {
    if (USE_MOCK) return;
    const ws = new WebSocket('ws://localhost:8000');
    ws.onopen = () => setBackendConnected(true);
    ws.onclose = () => setBackendConnected(false);
    ws.onerror = () => setBackendConnected(false);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'sensor_update') {
        setSensorData(prev => ({ ...prev, [msg.sensor]: msg.data }));
      }
      if (msg.type === 'init') {
        setSensorData(msg.sensors || {});
      }
    };
    return () => ws.close();
  }, []);

  // --- Dynamic Member Renderers ---
  // Remove inline renderers (renderSensor, renderButton, renderUpload, renderDownload)

  // --- Main Render ---
  return (
    <div className="App">
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-3">
        <Container fluid>
          <Navbar.Brand>
            <i className="fas fa-server me-2"></i>
            IMX8MP Web Server
          </Navbar.Brand>
          <Navbar.Text className="ms-auto">
            <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 12 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: backendConnected ? '#00ff00' : '#ff0000',
                  marginRight: 6,
                  border: '1px solid #222',
                }}
                title={backendConnected ? 'Connected to backend' : 'Not connected to backend'}
              ></span>
              <span style={{ color: backendConnected ? '#00ff00' : '#ff0000', fontWeight: 600 }}>
                {backendConnected ? 'Backend Connected' : 'Backend Disconnected'}
              </span>
            </span>
            <Badge bg="success">
              <i className="fas fa-cog"></i> System
            </Badge>
          </Navbar.Text>
        </Container>
      </Navbar>

      <Container fluid>
        <Nav variant="tabs" className="mb-3">
          {tabs.map(tab => (
            <Nav.Item key={tab.id}>
              <Nav.Link
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="d-flex align-items-center"
              >
                <i className={`fas fa-${
                  tab.id === 'sensors' ? 'thermometer-half' :
                  tab.id === 'files' ? 'folder' : 'info-circle'
                } me-2`}></i>
                {tab.title}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <div className="tab-content">
          {tabs.map(tab => (
            <div key={tab.id} style={{ display: activeTab === tab.id ? 'block' : 'none' }}>
              <Row>
                {tab.members && tab.members.map((member: any, idx: number) => {
                  switch (member.type) {
                    case 'sensor':
                      return <SensorComponent key={idx} member={member} sensorData={sensorData} />;
                    case 'button':
                      return <ActionButton key={idx} member={member} />;
                    case 'upload':
                      return <UploadComponent key={idx} member={member} />;
                    case 'download':
                      return <DownloadComponent key={idx} member={member} />;
                    default:
                      return null;
                  }
                })}
              </Row>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export default App; 