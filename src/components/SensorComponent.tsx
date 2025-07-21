import React from 'react';
import { Card } from 'react-bootstrap';

interface SensorComponentProps {
  member: any;
  sensorData: { [key: string]: any };
}

const SensorComponent: React.FC<SensorComponentProps> = ({ member, sensorData }) => {
  const key = member.topic.split('/')[1];
  const currentData = sensorData[key];
  return (
    <Card className="sensor-card p-3 border rounded mb-3">
      <h6 className="text-muted mb-2">{member.description || member.name}</h6>
      <div className="value h5 mb-2">
        {currentData ? `${currentData.value || currentData.raw || ''} ${currentData.unit || ''}` : `-- ${member.unit}`}
      </div>
      <div className="timestamp small text-muted">
        {currentData ? (currentData.timestamp ? new Date(currentData.timestamp).toLocaleString() : 'N/A') : 'Waiting for data...'}
      </div>
    </Card>
  );
};

export default SensorComponent; 