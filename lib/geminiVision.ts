import { GoogleGenerativeAI } from '@google/generative-ai';
import { CircuitAnalysisResult } from '@/types/circuit';

export async function analyzeCircuitWithGemini(
  base64Image: string,
  apiKey?: string
): Promise<CircuitAnalysisResult> {
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (!finalApiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const genAI = new GoogleGenerativeAI(finalApiKey);
  
  // Clean base64 string
  let mimeType = 'image/jpeg';
  let data = base64Image;
  if (base64Image.includes(';base64,')) {
    const parts = base64Image.split(';base64,');
    mimeType = parts[0].replace('data:', '');
    data = parts[1];
  }

  // Model list in order of preference (Flash models with vision capability)
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  const systemPrompt = `
You are a strict, expert Electronic Circuit Inspector and Electrical Engineer specializing in Arduino microcontroller circuits (specifically Arduino Nano, breadboards, LEDs, resistors, and jumper wires).

Your task is to critically analyze the provided image of a physical circuit and verify whether the Arduino Nano + LED circuit is electrically connected and correctly wired.

CRITICAL ELECTRICAL CONNECTIVITY RULES (Breadboard & Circuit Rules):
1. Breadboard Continuity:
   - A solderless breadboard consists of numbered rows (e.g. 1 to 60).
   - In each row, tie points on the SAME side of the central divider (e.g., columns a-b-c-d-e or columns f-g-h-i-j) are connected together.
   - THE CENTRAL DIVIDER / TROUGH IS AN ELECTRICAL ISOLATOR: Row 20 on the top half (f-j) is NOT connected to Row 20 on the bottom half (a-e) unless a component or jumper wire bridges across the divider!
   - If a wire or component lead is placed in Row 35 (top half), and nothing else is in Row 35 (top half), that wire is FLOATING / DISCONNECTED (OPEN CIRCUIT).

2. Standard Working Arduino Nano + LED Circuit Requirements:
   - Microcontroller: Arduino Nano board must be present and plugged into the breadboard or connected via jumpers.
   - Signal Supply: A Digital Output Pin (such as D13 or D2-D12) must connect to one end of a current-limiting resistor (220Ω - 1kΩ) OR to the Anode (+) of the LED.
   - Current-Limiting Resistor: A resistor (220Ω - 1kΩ) MUST be in series with the LED to prevent burning the LED or damaging the Arduino pin. If missing, mark as WARNING/FAIL (Overcurrent Risk).
   - LED Polarity:
     * Anode (+ lead, longer leg / round side) MUST connect towards the positive Digital Pin (through the resistor).
     * Cathode (- lead, shorter leg / flat notch side) MUST connect towards the GND pin.
     * If reversed (Cathode to +, Anode to GND), the LED will NOT light up (FAIL - Reversed Polarity).
   - Ground Return (GND): The other side of the LED/Resistor must return to an Arduino GND pin to form a complete CLOSED LOOP.
   - Closed Circuit Continuity: ALL nodes must be physically connected in the exact same breadboard rows. If any wire end is in an empty row, or rows don't match, the circuit is OPEN / DISCONNECTED (FAIL - Open Circuit).

Carefully inspect the image:
1. Locate the physical bounding box coordinates [ymin, xmin, ymax, xmax] (0 to 1000 scale) for EVERY detected component:
   - Arduino Nano
   - Red LED / LED
   - Resistor
   - Jumper Wires (each wire traced from start row to end row)
   - Other boards / sensors (if any)
2. Trace the breadboard row numbers and connections:
   - Where does each wire start? Where does each wire end?
   - Do the wires and component leads actually share the same row on the breadboard?
   - Is there a complete continuous current path from Arduino Nano Digital Pin -> Resistor -> LED -> Arduino GND?
3. Check for common faults:
   - Disconnected / Floating Wire (e.g. wire ends in row 35 but next component is in row 22 or 36) -> FAIL (Open Circuit)
   - LED Reversed Polarity -> FAIL
   - Missing Resistor -> WARNING / FAIL
   - Wrong Pin (e.g. connected to RST or 3.3V or floating) -> FAIL
   - Proper Closed Loop with correct polarity and resistor -> PASS (CORRECT)

You MUST reply ONLY with a valid JSON object matching this exact structure:
{
  "timestamp": ${Date.now()},
  "isCorrect": boolean,
  "status": "CORRECT" | "INCORRECT" | "WARNING",
  "score": number, // 100 if perfect, 0-40 if broken/disconnected/incorrect, 50 if warning
  "summary": "Thai language clear explanation of the circuit status and any faults detected",
  "detectedComponents": [
    {
      "id": "comp-1",
      "name": "Component Name in Thai and English",
      "type": "arduino_nano" | "led" | "resistor" | "jumper_wire_signal" | "jumper_wire_gnd" | "breadboard" | "other",
      "status": "ok" | "error" | "warning",
      "box": { "ymin": number, "xmin": number, "ymax": number, "xmax": number },
      "label": "Short label",
      "description": "Thai detailed explanation of this component and its connection status",
      "connectedFrom": "Source pin or breadboard row",
      "connectedTo": "Target pin or breadboard row",
      "polarity": {
        "anodeConnectedTo": "string",
        "cathodeConnectedTo": "string",
        "isReversed": boolean
      }
    }
  ],
  "checklist": [
    {
      "id": "chk-1",
      "title": "Title in Thai (e.g. การเชื่อมต่อสายไฟบน Breadboard)",
      "status": "pass" | "fail" | "warning" | "info",
      "details": "Details in Thai",
      "recommendation": "Step-by-step recommendation in Thai if failed"
    }
  ],
  "recommendations": [
    "Actionable Thai recommendation 1",
    "Actionable Thai recommendation 2"
  ],
  "schematicFeedback": {
    "signalPin": "Detected signal pin or 'Disconnected'",
    "gndPin": "Detected GND pin or 'Disconnected'",
    "hasResistor": boolean,
    "resistorValueEstimate": "e.g. 220Ω",
    "ledPolarityCorrect": boolean,
    "wiringPathDescription": "Path summary in Thai"
  },
  "wireTracking": {
    "signalPath": "Trace description in Thai",
    "gndPath": "Trace description in Thai",
    "isClosedLoop": boolean
  }
}
`;

  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent([
        {
          inlineData: {
            data,
            mimeType,
          },
        },
        { text: systemPrompt },
      ]);

      const response = await result.response;
      let text = response.text().trim();
      
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed: CircuitAnalysisResult = JSON.parse(text);
      if (parsed && typeof parsed.isCorrect === 'boolean') {
        parsed.timestamp = Date.now();
        return parsed;
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} error:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to analyze circuit with AI vision models.');
}
