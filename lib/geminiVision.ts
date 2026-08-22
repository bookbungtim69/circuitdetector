import { CircuitAnalysisResult } from '@/types/circuit';

export async function analyzeCircuitWithGemini(
  base64Image: string,
  apiKey?: string
): Promise<CircuitAnalysisResult> {
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (!finalApiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  // Clean base64 string
  let mimeType = 'image/jpeg';
  let data = base64Image;
  if (base64Image.includes(';base64,')) {
    const parts = base64Image.split(';base64,');
    mimeType = parts[0].replace('data:', '').split(';')[0] || 'image/jpeg';
    data = parts[1];
  }

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
     * Cathode (- lead, shorter lead / flat notch side) MUST connect towards the GND pin.
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

You MUST reply ONLY with a valid JSON object matching this exact structure (no markdown fences, just pure JSON):
{
  "timestamp": ${Date.now()},
  "isCorrect": boolean,
  "status": "CORRECT" | "INCORRECT" | "WARNING",
  "score": number,
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
      "title": "Title in Thai",
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

  // 1. Fetch available models from user's API key dynamically
  let candidateModels: string[] = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro-latest',
    'gemini-2.5-flash'
  ];

  try {
    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${finalApiKey}`);
    if (listResp.ok) {
      const listData = await listResp.json();
      if (listData.models && Array.isArray(listData.models)) {
        const available = listData.models
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace('models/', ''));
        
        if (available.length > 0) {
          // Sort to prioritize flash and newer models
          const preferred = available.filter((m: string) => 
            m.includes('flash') || m.includes('2.5') || m.includes('2.0') || m.includes('1.5')
          );
          if (preferred.length > 0) {
            candidateModels = [...preferred, ...available];
          }
        }
      }
    }
  } catch (e) {
    console.warn('Could not query model list, using fallback list:', e);
  }

  let lastError: Error | null = null;

  for (const modelName of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${finalApiKey}`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: data,
              },
            },
            {
              text: systemPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    };

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.warn(`Model ${modelName} returned HTTP ${resp.status}:`, errorText);
        lastError = new Error(`Model ${modelName} failed (${resp.status}): ${errorText}`);
        continue; // Try next candidate model
      }

      const json = await resp.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      let cleanText = rawText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed: CircuitAnalysisResult = JSON.parse(cleanText);
      if (parsed && typeof parsed.isCorrect === 'boolean') {
        parsed.timestamp = Date.now();
        return parsed;
      }
    } catch (err: any) {
      console.warn(`Error executing ${modelName}:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('ไม่สามารถวิเคราะห์วงจรด้วย AI ได้ กรุณาตรวจสอบ API Key หรือลองถ่ายภาพใหม่');
}
