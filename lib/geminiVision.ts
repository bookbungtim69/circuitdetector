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

  // Model list in order of preference
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  const systemPrompt = `
You are an expert Electronic Circuit Vision Inspector and Electrical Engineer specializing in Arduino microcontroller circuits (specifically Arduino Nano, breadboards, LEDs, resistors, and jumper wires).

Your task is to analyze the provided image of a physical circuit and verify whether the Arduino Nano + LED circuit is correctly wired.

Rules for a CORRECT standard Arduino Nano + LED Circuit:
1. Microcontroller: Arduino Nano board must be present.
2. Signal Connection: A digital pin (typically D13 or D2-D12) connects to one side of a current-limiting resistor (220Ω - 1kΩ) OR directly to the Anode (+) of the LED if resistor is on cathode side.
3. LED Polarity:
   - Anode (+, longer lead / round side) must connect towards the positive digital pin (through the resistor).
   - Cathode (-, shorter lead / flat notch side) must connect towards the GND pin.
4. Resistor: A current-limiting resistor (usually 220Ω, 330Ω, 470Ω, 1kΩ) MUST be in series with the LED. If missing, it's a DANGEROUS WARNING (LED overcurrent risk).
5. Ground: The circuit must return to an Arduino GND pin to form a complete closed circuit loop.
6. Breadboard Connections: Components in the same terminal strip row (numbered 1 to 30, a-b-c-d-e or f-g-h-i-j) are electrically connected. Must not bridge or short across unconnected rows.

Analyze the image carefully:
- Locate Arduino Nano and detect which pin headers are plugged.
- Locate the LED and estimate polarity orientation.
- Locate the Resistor and its color bands / connection.
- Trace all jumper wires and breadboard row tie-points.
- Detect any faults: reversed LED polarity, missing resistor, wrong pin (e.g., plugged into RST or 5V instead of Digital pin, or loose wire), short circuit across power rail, or open circuit.
- Provide approximate bounding boxes for detected components in normalized integer coordinates [ymin, xmin, ymax, xmax] where 0 is top/left and 1000 is bottom/right.

You MUST reply ONLY with a valid JSON object matching this exact TypeScript structure (do not include markdown ticks, just JSON):
{
  "timestamp": ${Date.now()},
  "isCorrect": boolean,
  "status": "CORRECT" | "INCORRECT" | "WARNING",
  "score": number (0-100),
  "summary": "Thai language concise summary of circuit status",
  "detectedComponents": [
    {
      "id": "comp-1",
      "name": "Component Name (in Thai & Eng)",
      "type": "arduino_nano" | "led" | "resistor" | "jumper_wire_signal" | "jumper_wire_gnd" | "breadboard" | "other",
      "status": "ok" | "error" | "warning",
      "box": { "ymin": number, "xmin": number, "ymax": number, "xmax": number },
      "label": "Short label",
      "description": "Thai detailed description",
      "connectedFrom": "Source pin or row",
      "connectedTo": "Target pin or row",
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
      "title": "Checklist Item Title (Thai)",
      "status": "pass" | "fail" | "warning" | "info",
      "details": "Details in Thai",
      "recommendation": "Optional fix guidance in Thai"
    }
  ],
  "recommendations": [
    "Step-by-step Thai recommendation 1",
    "Step-by-step Thai recommendation 2"
  ],
  "schematicFeedback": {
    "signalPin": "Detected signal pin (e.g. D13, D2)",
    "gndPin": "Detected GND pin",
    "hasResistor": boolean,
    "resistorValueEstimate": "e.g. 220Ω or unknown",
    "ledPolarityCorrect": boolean,
    "wiringPathDescription": "Path summary in Thai e.g. Arduino Nano [D13] -> Wire -> Resistor -> LED Anode -> LED Cathode -> GND"
  },
  "wireTracking": {
    "signalPath": "Trace of signal wire in Thai",
    "gndPath": "Trace of GND wire in Thai",
    "isClosedLoop": boolean
  }
}
`;

  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
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
      
      // Clean possible markdown code fences
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
      console.warn(`Model ${modelName} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to analyze circuit with AI vision models.');
}
