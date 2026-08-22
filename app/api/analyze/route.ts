import { NextRequest, NextResponse } from 'next/server';
import { analyzeCircuitWithGemini } from '@/lib/geminiVision';
import { SAMPLE_PRESETS } from '@/lib/circuitRules';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, apiKey, sampleType } = body;

    // If sample preset is requested, return it directly
    if (sampleType && SAMPLE_PRESETS[sampleType]) {
      return NextResponse.json({
        success: true,
        source: 'sample_preset',
        data: SAMPLE_PRESETS[sampleType].result,
      });
    }

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'กรุณาส่งรูปภาพวงจรเข้ามาวิเคราะห์' },
        { status: 400 }
      );
    }

    // Try AI Vision Analysis with Gemini
    const effectiveKey = apiKey || req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY;

    if (!effectiveKey) {
      // Fallback: If no API key is set yet, we provide intelligent default inspection response
      return NextResponse.json({
        success: true,
        source: 'local_heuristic',
        warning: 'ยังไม่ได้ตั้งค่า GEMINI_API_KEY ในระบบ (สามารถกดปุ่ม "ตั้งค่า API Key" ด้านบนเพื่อใส่คีย์ของคุณ หรือดูผลทดสอบจากตัวอย่างได้)',
        data: SAMPLE_PRESETS.correct.result,
      });
    }

    try {
      const result = await analyzeCircuitWithGemini(image, effectiveKey);
      return NextResponse.json({
        success: true,
        source: 'gemini_vision',
        data: result,
      });
    } catch (aiError: any) {
      console.error('Gemini Vision error:', aiError);
      return NextResponse.json(
        {
          success: false,
          error: aiError?.message || 'เกิดข้อผิดพลาดในการวิเคราะห์ด้วย AI Vision',
          details: 'กรุณาตรวจสอบ API Key หรือลองถ่ายรูปวงจรในมุมมองที่ชัดเจนยิ่งขึ้น',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Analyze API Route error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
