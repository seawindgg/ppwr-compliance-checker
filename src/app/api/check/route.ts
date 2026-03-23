import { NextRequest, NextResponse } from 'next/server';
import { runComplianceCheck, ProductData } from '@/lib/compliance-calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    const requiredFields = ['productName', 'packagingType', 'material'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段：${field}` },
          { status: 400 }
        );
      }
    }
    
    // 运行合规检查
    const report = runComplianceCheck(body as ProductData);
    
    return NextResponse.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { error: '检查失败，请稍后重试' },
      { status: 500 }
    );
  }
}
