/** @format */


import { NextRequest,NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  const { name, email, work, otherWork } = await req.json();

  // Basic validation
  if (!name || !email || !work) {
    return NextResponse.json({ error: 'All required fields must be filled out' }, { status: 400 });
  }

  try {
    // Process the data
    // For example, save the data to a database or send an email notification
    // This is a placeholder for database interaction (e.g., MongoDB, Prisma, etc.)

    console.log('Form Data:', { name, email, work, otherWork });

    // Respond with success
    return NextResponse.json({ message: 'Form submitted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing form:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
