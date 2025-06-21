/** @format */

import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
	/**
	 * Extension de l'interface Session
	 */
	interface Session {
		user: {
			id: string;
			accessToken: string;
		} & DefaultSession['user'];
		accessToken?: string;
	}

	/**
	 * Extension de l'interface User
	 */
	interface User extends DefaultUser {
		id: string;
		token: string;
	}
}

declare module 'next-auth/jwt' {
	/**
	 * Extension de l'interface JWT
	 */
	interface JWT {
		id: string;
		accessToken: string;
	}
}
