import { NextResponse } from 'next/server';

import { campApplicationSchema } from '@lib/summer-camp/schema';
import { insertCampApplication } from '@lib/summer-camp/mutations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = campApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 });
    }

    await insertCampApplication(result.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[summer-camp/apply] Error:', error);
    return NextResponse.json(
      { errors: [{ message: 'Something went wrong. Please try again.' }] },
      { status: 500 }
    );
  }
}
