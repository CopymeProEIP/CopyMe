/** @format */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB'
import Form from '@/Model/Form';

export async function POST(req: NextRequest) {
	const { name, email, work, otherWork } = await req.json();

	// Basic validation
	if (!name || !email || !work) {
		return NextResponse.json({ error: 'All required fields must be filled out' }, { status: 400 });
	}

	try {
		await connectDB();

		const form = new Form({
			name: name,
      email: email,
      work: work,
      otherWork: otherWork,
		});
		await form.save();
		console.log('Form Data:', { name, email, work, otherWork });

		// Respond with success
		return NextResponse.json({ message: 'Form submitted successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error processing form:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
