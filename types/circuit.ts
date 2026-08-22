export interface BoundingBox {
  ymin: number; // 0 - 1000
  xmin: number; // 0 - 1000
  ymax: number; // 0 - 1000
  xmax: number; // 0 - 1000
}

export type ComponentType = 
  | 'arduino_nano'
  | 'led'
  | 'resistor'
  | 'jumper_wire_signal'
  | 'jumper_wire_gnd'
  | 'jumper_wire_vcc'
  | 'breadboard'
  | 'connection_point'
  | 'other';

export interface DetectedComponent {
  id: string;
  name: string;
  type: ComponentType;
  status: 'ok' | 'error' | 'warning';
  box?: BoundingBox;
  label: string;
  description: string;
  connectedFrom?: string;
  connectedTo?: string;
  polarity?: {
    anodeConnectedTo?: string;
    cathodeConnectedTo?: string;
    isReversed?: boolean;
  };
}

export interface CircuitChecklistItem {
  id: string;
  title: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  details: string;
  recommendation?: string;
}

export interface CircuitAnalysisResult {
  timestamp: number;
  isCorrect: boolean;
  status: 'CORRECT' | 'INCORRECT' | 'WARNING';
  score: number; // 0 - 100
  summary: string;
  detectedComponents: DetectedComponent[];
  checklist: CircuitChecklistItem[];
  recommendations: string[];
  schematicFeedback: {
    signalPin: string;
    gndPin: string;
    hasResistor: boolean;
    resistorValueEstimate?: string;
    ledPolarityCorrect: boolean;
    wiringPathDescription: string;
  };
  wireTracking: {
    signalPath: string;
    gndPath: string;
    isClosedLoop: boolean;
  };
}
