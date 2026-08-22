import { CircuitAnalysisResult } from '@/types/circuit';

export const SAMPLE_PRESETS: { [key: string]: { name: string; description: string; imageUrl: string; result: CircuitAnalysisResult } } = {
  correct: {
    name: 'วงจรต่อถูกต้อง (Pass - Standard D13 + 220Ω + LED)',
    description: 'สายสัญญาณต่อจาก D13 ผ่านตัวต้านทาน 220Ω เข้าขั้วบวก (Anode) ของ LED และขั้วลบ (Cathode) ต่อลง GND ครบวงจร',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    result: {
      timestamp: Date.now(),
      isCorrect: true,
      status: 'CORRECT',
      score: 100,
      summary: 'วงจรเชื่อมต่อถูกต้องสมบูรณ์! LED มีตัวต้านทานจำกัดกระแส ขั้วต่อถูกต้อง และเชื่อมโยงระหว่างพิน D13 กับ GND อย่างครบถ้วน',
      detectedComponents: [
        {
          id: 'comp-nano',
          name: 'Arduino Nano V3.0',
          type: 'arduino_nano',
          status: 'ok',
          box: { ymin: 150, xmin: 80, ymax: 550, xmax: 380 },
          label: 'Arduino Nano (D13 & GND in use)',
          description: 'ตรวจพบพิน D13 และ GND ใช้งานอยู่'
        },
        {
          id: 'comp-resistor',
          name: 'ตัวต้านทาน 220Ω (Resistor)',
          type: 'resistor',
          status: 'ok',
          box: { ymin: 320, xmin: 440, ymax: 420, xmax: 600 },
          label: 'Resistor 220Ω (Red-Red-Brown)',
          description: 'ต่ออนุกรมกับขา Anode เพื่อจำกัดกระแส ป้องกัน LED เสียหาย'
        },
        {
          id: 'comp-led',
          name: 'LED สีแดง (5mm Red LED)',
          type: 'led',
          status: 'ok',
          box: { ymin: 240, xmin: 620, ymax: 450, xmax: 780 },
          label: 'LED Red (Anode + / Cathode -)',
          description: 'ขั้ว Anode (ขายาว) รับไฟบวก, Cathode (ขาสั้น) ลงกราวด์',
          polarity: {
            anodeConnectedTo: 'Resistor -> Arduino Pin D13',
            cathodeConnectedTo: 'Arduino Pin GND',
            isReversed: false
          }
        },
        {
          id: 'comp-wire-sig',
          name: 'สายไฟสัญญาณ (Signal Jumper Wire)',
          type: 'jumper_wire_signal',
          status: 'ok',
          box: { ymin: 250, xmin: 280, ymax: 380, xmax: 480 },
          label: 'Signal Wire (D13 -> Breadboard Row 15)',
          description: 'เชื่อมจาก Pin D13 ไปยังขาตัวต้านทาน'
        },
        {
          id: 'comp-wire-gnd',
          name: 'สายดิน (GND Jumper Wire)',
          type: 'jumper_wire_gnd',
          status: 'ok',
          box: { ymin: 440, xmin: 280, ymax: 580, xmax: 720 },
          label: 'GND Wire (Breadboard Row 18 -> Arduino GND)',
          description: 'เชื่อมจากขา Cathode ของ LED ไปยัง Pin GND'
        }
      ],
      checklist: [
        {
          id: 'chk-board',
          title: 'การตรวจจับบอร์ด Arduino Nano',
          status: 'pass',
          details: 'ตรวจพบบอร์ด Arduino Nano อยู่ในตำแหน่งที่พร้อมทำงาน'
        },
        {
          id: 'chk-led-polarity',
          title: 'ขั้วของ LED (Polarity Check)',
          status: 'pass',
          details: 'ขั้วบวก (Anode) ต่อรับไฟจาก D13 และขั้วลบ (Cathode) ต่อลงกราวด์ GND ถูกต้อง'
        },
        {
          id: 'chk-resistor',
          title: 'ตัวต้านทานจำกัดกระแส (Current-Limiting Resistor)',
          status: 'pass',
          details: 'มีตัวต้านทาน 220Ω ต่ออนุกรมป้องกันกระแสเกินไหลผ่าน LED'
        },
        {
          id: 'chk-wiring',
          title: 'การเชื่อมต่อสายไฟบน Breadboard',
          status: 'pass',
          details: 'สายไฟเสียบแน่นและเชื่อมต่อครบวงจร (Closed Loop)'
        }
      ],
      recommendations: [
        'วงจรพร้อมสำหรับการอัปโหลดโค้ด Blink ผ่าน Arduino IDE ได้ทันที',
        'หากต้องการเปลี่ยนความสว่าง สามารถปรับค่าตัวต้านทานให้อยู่ระหว่าง 220Ω - 1kΩ'
      ],
      schematicFeedback: {
        signalPin: 'D13',
        gndPin: 'GND',
        hasResistor: true,
        resistorValueEstimate: '220 Ohm',
        ledPolarityCorrect: true,
        wiringPathDescription: 'Arduino Nano [D13] ➔ Wire ➔ Resistor 220Ω ➔ LED Anode (+) ➔ LED Cathode (-) ➔ Wire ➔ Arduino Nano [GND]'
      },
      wireTracking: {
        signalPath: 'Pin D13 ➔ Jumper ➔ Resistor (Tie point A15-E15) ➔ LED Anode (Row 15)',
        gndPath: 'LED Cathode (Row 18) ➔ Jumper ➔ Arduino Pin GND',
        isClosedLoop: true
      }
    }
  },
  reversed_polarity: {
    name: 'วงจรต่อ LED สลับขั้ว (Fail - Reversed Polarity)',
    description: 'ขา Cathode (ขั้วลบ) ถูกต่อเข้ากับไฟ D13 และ Anode ต่อลง GND ทำให้ LED ไม่ติด',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    result: {
      timestamp: Date.now(),
      isCorrect: false,
      status: 'INCORRECT',
      score: 45,
      summary: 'ตรวจพบข้อผิดพลาด: หลอด LED ถูกต่อสลับขั้ว (Reversed Polarity) ทำให้กระแสไฟฟ้าไม่สามารถไหลผ่านได้ หลอดจะไม่สว่าง',
      detectedComponents: [
        {
          id: 'comp-nano',
          name: 'Arduino Nano V3.0',
          type: 'arduino_nano',
          status: 'ok',
          box: { ymin: 150, xmin: 80, ymax: 550, xmax: 380 },
          label: 'Arduino Nano',
          description: 'พิน D13 และ GND ต่อสายแล้ว'
        },
        {
          id: 'comp-resistor',
          name: 'ตัวต้านทาน 330Ω',
          type: 'resistor',
          status: 'ok',
          box: { ymin: 320, xmin: 440, ymax: 420, xmax: 600 },
          label: 'Resistor 330Ω',
          description: 'มีตัวต้านทานอยู่ในวงจร'
        },
        {
          id: 'comp-led',
          name: 'LED (ต่อกลับด้าน / Reversed)',
          type: 'led',
          status: 'error',
          box: { ymin: 240, xmin: 620, ymax: 450, xmax: 780 },
          label: '⚠️ LED Polarity Reversed!',
          description: 'ขั้ว Cathode (ขาสั้น / รอยบากแบน) ต่อรับไฟบวก ซึ่งผิดหลักการทำงานของไดโอดเปล่งแสง',
          polarity: {
            anodeConnectedTo: 'GND',
            cathodeConnectedTo: 'D13 (ผ่าน R)',
            isReversed: true
          }
        }
      ],
      checklist: [
        {
          id: 'chk-board',
          title: 'การตรวจจับบอร์ด Arduino Nano',
          status: 'pass',
          details: 'ตรวจพบบอร์ด Arduino Nano ถูกต้อง'
        },
        {
          id: 'chk-led-polarity',
          title: 'ขั้วของ LED (Polarity Check)',
          status: 'fail',
          details: 'LED ต่อกลับด้าน! ขั้ว Anode (ขายาว) ต้องต่อฝั่งไฟบวก (D13) และขั้ว Cathode (ขาสั้น) ต้องต่อฝั่งกราวด์ (GND)',
          recommendation: 'ถอดหลอด LED แล้วหมุนสลับทิศทาง 180 องศา เสียบให้ขายาวต่อกับตัวต้านทาน/D13'
        },
        {
          id: 'chk-resistor',
          title: 'ตัวต้านทานจำกัดกระแส',
          status: 'pass',
          details: 'มีตัวต้านทาน 330Ω ป้องกันกระแสเกินแล้ว'
        },
        {
          id: 'chk-wiring',
          title: 'การเชื่อมต่อสายไฟ',
          status: 'pass',
          details: 'สายไฟเสียบครบวงจร แต่ทิศทางอุปกรณ์ต่อผิด'
        }
      ],
      recommendations: [
        '🔧 วิธีแก้ไข: ดึงหลอด LED ออกมา แล้วสลับขา ให้ขั้วบวก (ขายาว / Anode) รับไฟจากตัวต้านทาน และขั้วลบ (ขาสั้น / Cathode) ต่อลง GND'
      ],
      schematicFeedback: {
        signalPin: 'D13',
        gndPin: 'GND',
        hasResistor: true,
        ledPolarityCorrect: false,
        wiringPathDescription: '⚠️ ข้อผิดพลาด: ขั้ว LED กลับด้าน ทำให้เกิด Reverse Bias ไดโอดไม่ยอมให้กระแสไหลผ่าน'
      },
      wireTracking: {
        signalPath: 'Pin D13 ➔ Resistor ➔ ⚠️ LED Cathode (ต่อผิด)',
        gndPath: '⚠️ LED Anode (ต่อผิด) ➔ Pin GND',
        isClosedLoop: true
      }
    }
  },
  missing_resistor: {
    name: 'วงจรลืมต่อตัวต้านทาน (Warning - Missing Current-Limiting Resistor)',
    description: 'ต่อสายตรงจาก D13 เข้า Anode ของ LED โดยไม่มีตัวต้านทาน อาจทำให้ LED ขาดหรือบอร์ดพังได้',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    result: {
      timestamp: Date.now(),
      isCorrect: false,
      status: 'WARNING',
      score: 50,
      summary: 'คำเตือนอันตราย: ไม่พบตัวต้านทาน (Resistor) ในวงจร! การต่อ LED ตรงกับ Arduino จะทำให้กระแสไฟเกินและหลอด LED ไหม้หรือขาพิน Arduino เสียหายได้',
      detectedComponents: [
        {
          id: 'comp-nano',
          name: 'Arduino Nano V3.0',
          type: 'arduino_nano',
          status: 'ok',
          box: { ymin: 150, xmin: 80, ymax: 550, xmax: 380 },
          label: 'Arduino Nano',
          description: 'ตรวจพบบอร์ด Arduino'
        },
        {
          id: 'comp-resistor',
          name: 'ตัวต้านทาน (ไม่พบในวงจร)',
          type: 'resistor',
          status: 'error',
          label: '❌ Missing Resistor!',
          description: 'ไม่มีตัวต้านทานต่ออนุกรม'
        },
        {
          id: 'comp-led',
          name: 'LED สีแดง',
          type: 'led',
          status: 'warning',
          box: { ymin: 240, xmin: 620, ymax: 450, xmax: 780 },
          label: 'LED Red (Overcurrent Risk)',
          description: 'ต่อตรงกับพิน D13 โดยไม่มีความต้านทานจำกัดกระแส'
        }
      ],
      checklist: [
        {
          id: 'chk-board',
          title: 'การตรวจจับบอร์ด Arduino Nano',
          status: 'pass',
          details: 'ตรวจพบบอร์ด Arduino Nano พร้อมใช้งาน'
        },
        {
          id: 'chk-resistor',
          title: 'ตัวต้านทานจำกัดกระแส (Resistor Check)',
          status: 'fail',
          details: 'ไม่พบตัวต้านทานในวงจร! แรงดัน 5V จาก Arduino Nano จะจ่ายกระแสสูงเกินพิกัด LED',
          recommendation: 'นำตัวต้านทานค่า 220Ω ถึง 1kΩ มาต่อคั่นระหว่าง Pin D13 กับขา Anode ของ LED'
        },
        {
          id: 'chk-led-polarity',
          title: 'ขั้วของ LED',
          status: 'pass',
          details: 'ขั้วบวก/ลบ วางทิศทางถูก แต่มีความเสี่ยงหลอดขาด'
        },
        {
          id: 'chk-wiring',
          title: 'การเชื่อมต่อสายไฟ',
          status: 'warning',
          details: 'สายไฟต่อตรง ไม่ผ่านโหลดป้องกันกระแส'
        }
      ],
      recommendations: [
        '⚠️ สำคัญมาก: ห้ามจ่ายไฟก่อนแก้ไขเด็ดขาด เพราะอาจทำให้พิน D13 ของ Arduino Nano เสียถาวรได้',
        '🔧 วิธีแก้ไข: เสียบตัวต้านทาน 220Ω หรือ 330Ω ต่ออนุกรมคั่นระหว่างสายสีแดง (D13) และขาขายาว (Anode) ของ LED'
      ],
      schematicFeedback: {
        signalPin: 'D13',
        gndPin: 'GND',
        hasResistor: false,
        ledPolarityCorrect: true,
        wiringPathDescription: '⚠️ อันตราย: ขาดตัวต้านทานจำกัดกระแส (Current-limiting resistor missing)'
      },
      wireTracking: {
        signalPath: 'Pin D13 ➔ Direct Wire ➔ LED Anode (ขาดตัวต้านทาน)',
        gndPath: 'LED Cathode ➔ Wire ➔ Pin GND',
        isClosedLoop: true
      }
    }
  },
  wrong_pin: {
    name: 'วงจรเสียบพินผิด (Fail - Wrong Pin Connection)',
    description: 'สายไฟถูกเสียบที่พิน 5V หรือพิน Reset แทนที่จะเป็นพิน Digital I/O (D13 หรือ D2-D12)',
    imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
    result: {
      timestamp: Date.now(),
      isCorrect: false,
      status: 'INCORRECT',
      score: 35,
      summary: 'ตรวจพบข้อผิดพลาด: สายสัญญาณไม่ได้ต่อกับพิน Digital I/O (เช่น D13 หรือ D2-D12) แต่ไปเสียบที่พิน RESET/3V3 ทำให้โค้ดไม่สามารถสั่งเปิด-ปิด LED ได้',
      detectedComponents: [
        {
          id: 'comp-nano',
          name: 'Arduino Nano V3.0',
          type: 'arduino_nano',
          status: 'error',
          box: { ymin: 150, xmin: 80, ymax: 550, xmax: 380 },
          label: 'Arduino Nano (Wrong Pin: RST)',
          description: 'สายไฟเสียบอยู่ที่ขา Reset/3.3V แทนขา Digital Pin'
        },
        {
          id: 'comp-resistor',
          name: 'ตัวต้านทาน 220Ω',
          type: 'resistor',
          status: 'ok',
          box: { ymin: 320, xmin: 440, ymax: 420, xmax: 600 },
          label: 'Resistor 220Ω',
          description: 'มีตัวต้านทานถูกต้อง'
        },
        {
          id: 'comp-led',
          name: 'LED สีแดง',
          type: 'led',
          status: 'ok',
          box: { ymin: 240, xmin: 620, ymax: 450, xmax: 780 },
          label: 'LED Red',
          description: 'ขั้ว LED ถูกต้อง'
        }
      ],
      checklist: [
        {
          id: 'chk-board',
          title: 'การตรวจจับบอร์ด Arduino Nano',
          status: 'pass',
          details: 'ตรวจพบบอร์ด Arduino Nano'
        },
        {
          id: 'chk-pin-selection',
          title: 'การเลือกใช้งานขา Digital I/O Pin',
          status: 'fail',
          details: 'สายไฟไม่ได้ต่อเข้ากับพิน D13 (พินมาตรฐานสำหรับทดสอบ Blink) หรือ D2-D12',
          recommendation: 'ย้ายสายสัญญาณจากขาปัจจุบันไปยังขาพิน D13 หรือพิน Digital ที่ระบุในโค้ด'
        },
        {
          id: 'chk-resistor',
          title: 'ตัวต้านทานจำกัดกระแส',
          status: 'pass',
          details: 'มีตัวต้านทาน 220Ω ถูกต้อง'
        },
        {
          id: 'chk-led-polarity',
          title: 'ขั้วของ LED',
          status: 'pass',
          details: 'ขั้ว LED ถูกต้อง'
        }
      ],
      recommendations: [
        '🔧 วิธีแก้ไข: สังเกตตัวอักษรพิมพ์บนบอร์ด Arduino Nano แล้วย้ายสายไฟสัญญาณไปเสียบที่พิน "D13" (หรือ Digital Pin อื่นๆ ตามโค้ด)'
      ],
      schematicFeedback: {
        signalPin: 'RST / Invalid',
        gndPin: 'GND',
        hasResistor: true,
        ledPolarityCorrect: true,
        wiringPathDescription: 'สายสัญญาณต่อผิดพิน (ไม่ใช่พินควบคุม Digital)'
      },
      wireTracking: {
        signalPath: '⚠️ Invalid Pin (RST/3V3) ➔ Resistor ➔ LED Anode',
        gndPath: 'LED Cathode ➔ Pin GND',
        isClosedLoop: false
      }
    }
  }
};
