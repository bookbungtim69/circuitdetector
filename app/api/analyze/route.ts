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
      return NextResponse.json(
        {
          success: false,
          errorCode: 'GEMINI_API_KEY_REQUIRED',
          error: 'ยังไม่ได้ตั้งค่า Gemini API Key สำหรับการวิเคราะห์ภาพจริง',
          details: 'กรุณากดปุ่ม "ตั้งค่า API Key" ด้านบนเพื่อใส่คีย์ของคุณ หรือกำหนด GEMINI_API_KEY ใน Vercel',
        },
        { status: 400 }
      );
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
          details: 'กรุณาตรวจสอบว่า API Key ถูกต้อง หรือลองถ่ายรูปวงจรให้มีแสงสว่างและเห็นแถว Breadboard ชัดเจนยิ่งขึ้น',
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
